from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import models, schemas, auth
from database import get_db
from config import IMPACT_SCORE_WEIGHTS
from blockchain_utils import create_blockchain_entry

router = APIRouter(tags=["volunteers"])

@router.get("/volunteers", response_model=List[schemas.VolunteerResponse])
def get_volunteers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Volunteer).offset(skip).limit(limit).all()

@router.get("/volunteers/leaderboard")
def get_leaderboard(db: Session = Depends(get_db)):
    vols = db.query(models.Volunteer).filter(models.Volunteer.status == "ACTIVE").order_by(models.Volunteer.total_hours.desc()).limit(10).all()
    result = []
    for i, v in enumerate(vols):
        bookings_count = db.query(models.SlotBooking).filter(models.SlotBooking.volunteer_id == v.id).count()
        result.append({
            "rank": i + 1, "name": v.user.full_name if v.user else "Unknown",
            "hours": v.total_hours, "slots": bookings_count,
            "impact_score": int(v.total_hours * IMPACT_SCORE_WEIGHTS["hours"] + bookings_count * IMPACT_SCORE_WEIGHTS["bookings"])
        })
    return result

@router.get("/volunteers/{vol_id}", response_model=schemas.VolunteerResponse)
def get_volunteer(vol_id: int, db: Session = Depends(get_db)):
    v = db.query(models.Volunteer).filter(models.Volunteer.id == vol_id).first()
    if not v:
        raise HTTPException(status_code=404, detail="Volunteer not found")
    return v

@router.post("/volunteers", response_model=schemas.VolunteerResponse)
def create_volunteer(volunteer: schemas.VolunteerCreate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    db_vol = models.Volunteer(**volunteer.model_dump())
    db.add(db_vol)
    db.commit()
    db.refresh(db_vol)
    return db_vol

@router.put("/volunteers/{vol_id}", response_model=schemas.VolunteerResponse)
def update_volunteer(vol_id: int, data: schemas.VolunteerUpdate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    vol = db.query(models.Volunteer).filter(models.Volunteer.id == vol_id).first()
    if not vol:
        raise HTTPException(status_code=404, detail="Volunteer not found")
    if data.skills is not None:
        vol.skills = data.skills
    if data.bio is not None:
        vol.bio = data.bio
    db.commit()
    db.refresh(vol)
    return vol

@router.get("/slots", response_model=List[schemas.VolunteerSlotResponse])
def get_slots(all: bool = False, db: Session = Depends(get_db)):
    query = db.query(models.VolunteerSlot)
    if not all:
        query = query.filter(models.VolunteerSlot.is_active == True)
    slots = query.order_by(models.VolunteerSlot.date.asc()).all()
    result = []
    for s in slots:
        d = {
            "id": s.id, "task_name": s.task_name, "description": s.description,
            "date": s.date, "time": s.time, "location": s.location,
            "required_skills": s.required_skills, "max_volunteers": s.max_volunteers,
            "booked_count": s.booked_count, "posted_by": s.posted_by,
            "is_active": s.is_active, "created_at": s.created_at,
            "poster_name": s.poster.full_name if s.poster else None
        }
        result.append(d)
    return result

@router.post("/slots", response_model=schemas.VolunteerSlotResponse)
def create_slot(slot: schemas.VolunteerSlotCreate, current_user: models.User = Depends(auth.require_roles("ADMIN", "NGO_STAFF")), db: Session = Depends(get_db)):
    db_slot = models.VolunteerSlot(**slot.model_dump(), posted_by=current_user.id)
    db.add(db_slot)
    db.commit()
    db.refresh(db_slot)
    create_blockchain_entry(db, "SLOT_CREATED", f"Volunteer slot '{db_slot.task_name}' on {db_slot.date} created by {current_user.full_name}")
    db.commit()
    return {
        "id": db_slot.id, "task_name": db_slot.task_name, "description": db_slot.description,
        "date": db_slot.date, "time": db_slot.time, "location": db_slot.location,
        "required_skills": db_slot.required_skills, "max_volunteers": db_slot.max_volunteers,
        "booked_count": db_slot.booked_count, "posted_by": db_slot.posted_by,
        "is_active": db_slot.is_active, "created_at": db_slot.created_at,
        "poster_name": current_user.full_name
    }

@router.put("/slots/{slot_id}", response_model=schemas.VolunteerSlotResponse)
def update_slot(slot_id: int, data: schemas.VolunteerSlotUpdate, current_user: models.User = Depends(auth.require_roles("ADMIN", "NGO_STAFF")), db: Session = Depends(get_db)):
    slot = db.query(models.VolunteerSlot).filter(models.VolunteerSlot.id == slot_id).first()
    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(slot, key, value)
    db.commit()
    db.refresh(slot)
    return {
        "id": slot.id, "task_name": slot.task_name, "description": slot.description,
        "date": slot.date, "time": slot.time, "location": slot.location,
        "required_skills": slot.required_skills, "max_volunteers": slot.max_volunteers,
        "booked_count": slot.booked_count, "posted_by": slot.posted_by,
        "is_active": slot.is_active, "created_at": slot.created_at,
        "poster_name": slot.poster.full_name if slot.poster else None
    }

@router.delete("/slots/{slot_id}")
def delete_slot(slot_id: int, current_user: models.User = Depends(auth.require_roles("ADMIN", "NGO_STAFF")), db: Session = Depends(get_db)):
    slot = db.query(models.VolunteerSlot).filter(models.VolunteerSlot.id == slot_id).first()
    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found")
    bookings = db.query(models.SlotBooking).filter(models.SlotBooking.slot_id == slot_id).count()
    if bookings > 0:
        raise HTTPException(status_code=400, detail="Cannot delete — has bookings. Close it instead.")
    db.delete(slot)
    db.commit()
    return {"message": "Slot deleted"}

@router.post("/slots/{slot_id}/book", response_model=schemas.SlotBookingResponse)
def book_slot(slot_id: int, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    slot = db.query(models.VolunteerSlot).filter(models.VolunteerSlot.id == slot_id).first()
    if not slot or not slot.is_active:
        raise HTTPException(status_code=400, detail="Slot not available")
    if slot.booked_count >= slot.max_volunteers:
        raise HTTPException(status_code=400, detail="Slot is full")
    volunteer = db.query(models.Volunteer).filter(models.Volunteer.user_id == current_user.id).first()
    if not volunteer:
        if current_user.role != "VOLUNTEER":
            raise HTTPException(status_code=400, detail="User is not a volunteer")
        volunteer = models.Volunteer(user_id=current_user.id, skills="[]", total_hours=0.0, status="ACTIVE")
        db.add(volunteer)
        db.commit()
        db.refresh(volunteer)
    existing = db.query(models.SlotBooking).filter(
        models.SlotBooking.slot_id == slot_id,
        models.SlotBooking.volunteer_id == volunteer.id,
        models.SlotBooking.status == "CONFIRMED"
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="You've already booked this slot")
    booking = models.SlotBooking(slot_id=slot.id, volunteer_id=volunteer.id)
    db.add(booking)
    slot.booked_count += 1
    if slot.booked_count >= slot.max_volunteers:
        slot.is_active = False
    db.commit()
    db.refresh(booking)
    return {
        "id": booking.id, "slot_id": booking.slot_id, "volunteer_id": booking.volunteer_id,
        "booked_at": booking.booked_at, "status": booking.status,
        "slot_task_name": slot.task_name, "slot_date": slot.date,
        "slot_time": slot.time, "slot_location": slot.location,
        "volunteer_name": volunteer.user.full_name
    }

@router.get("/slots/{slot_id}/bookings", response_model=List[schemas.SlotBookingResponse])
def get_slot_bookings(slot_id: int, current_user: models.User = Depends(auth.require_roles("ADMIN", "NGO_STAFF")), db: Session = Depends(get_db)):
    bookings = db.query(models.SlotBooking).filter(models.SlotBooking.slot_id == slot_id).all()
    result = []
    for b in bookings:
        result.append({
            "id": b.id, "slot_id": b.slot_id, "volunteer_id": b.volunteer_id,
            "booked_at": b.booked_at, "status": b.status,
            "slot_task_name": b.slot.task_name if b.slot else None,
            "slot_date": b.slot.date if b.slot else None,
            "slot_time": b.slot.time if b.slot else None,
            "slot_location": b.slot.location if b.slot else None,
            "volunteer_name": b.volunteer.user.full_name if b.volunteer and b.volunteer.user else None
        })
    return result

@router.delete("/slots/{slot_id}/bookings/{booking_id}")
def cancel_booking(slot_id: int, booking_id: int, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    booking = db.query(models.SlotBooking).filter(
        models.SlotBooking.id == booking_id,
        models.SlotBooking.slot_id == slot_id
    ).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    volunteer = db.query(models.Volunteer).filter(models.Volunteer.user_id == current_user.id).first()
    if current_user.role not in ["ADMIN", "NGO_STAFF"] and (not volunteer or booking.volunteer_id != volunteer.id):
        raise HTTPException(status_code=403, detail="Not authorized to cancel this booking")
    booking.status = "CANCELLED"
    slot = db.query(models.VolunteerSlot).filter(models.VolunteerSlot.id == slot_id).first()
    if slot:
        slot.booked_count = max(0, slot.booked_count - 1)
        if not slot.is_active and slot.booked_count < slot.max_volunteers:
            slot.is_active = True
    db.commit()
    return {"message": "Booking cancelled"}



