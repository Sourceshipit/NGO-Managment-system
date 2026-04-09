from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import date
import models, schemas, auth
from database import get_db

router = APIRouter(prefix="/volunteer", tags=["hours"])

@router.get("/hours", response_model=List[schemas.HourLogResponse])
def get_my_hours(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    volunteer = db.query(models.Volunteer).filter(models.Volunteer.user_id == current_user.id).first()
    if not volunteer:
        raise HTTPException(status_code=404, detail="Volunteer profile not found")
    logs = db.query(models.HourLog).filter(models.HourLog.volunteer_id == volunteer.id).order_by(models.HourLog.date.desc()).all()
    result = []
    for log in logs:
        d = {
            "id": log.id, "volunteer_id": log.volunteer_id, "booking_id": log.booking_id,
            "date": log.date, "hours": log.hours, "description": log.description,
            "created_at": log.created_at, "slot_task_name": None
        }
        if log.booking and log.booking.slot:
            d["slot_task_name"] = log.booking.slot.task_name
        result.append(d)
    return result

@router.post("/hours", response_model=schemas.HourLogResponse)
def log_hours(data: schemas.HourLogCreate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    volunteer = db.query(models.Volunteer).filter(models.Volunteer.user_id == current_user.id).first()
    if not volunteer:
        raise HTTPException(status_code=404, detail="Volunteer profile not found")
    if data.hours < 0.5 or data.hours > 12:
        raise HTTPException(status_code=400, detail="Hours must be between 0.5 and 12")
    log = models.HourLog(
        volunteer_id=volunteer.id, booking_id=data.booking_id,
        date=data.date, hours=data.hours, description=data.description
    )
    db.add(log)
    volunteer.total_hours += data.hours
    db.commit()
    db.refresh(log)
    d = {
        "id": log.id, "volunteer_id": log.volunteer_id, "booking_id": log.booking_id,
        "date": log.date, "hours": log.hours, "description": log.description,
        "created_at": log.created_at, "slot_task_name": None
    }
    if log.booking and log.booking.slot:
        d["slot_task_name"] = log.booking.slot.task_name
    return d

@router.delete("/hours/{log_id}")
def delete_hour_log(log_id: int, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    volunteer = db.query(models.Volunteer).filter(models.Volunteer.user_id == current_user.id).first()
    if not volunteer:
        raise HTTPException(status_code=404, detail="Volunteer profile not found")
    log = db.query(models.HourLog).filter(models.HourLog.id == log_id, models.HourLog.volunteer_id == volunteer.id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Hour log not found")
    volunteer.total_hours = max(0, volunteer.total_hours - log.hours)
    db.delete(log)
    db.commit()
    return {"message": "Hour log deleted", "new_total": volunteer.total_hours}

@router.get("/bookings", response_model=List[schemas.SlotBookingResponse])
def get_my_bookings(status: str = None, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    volunteer = db.query(models.Volunteer).filter(models.Volunteer.user_id == current_user.id).first()
    if not volunteer:
        raise HTTPException(status_code=404, detail="Volunteer profile not found")
    query = db.query(models.SlotBooking).filter(models.SlotBooking.volunteer_id == volunteer.id)
    if status:
        query = query.filter(models.SlotBooking.status == status)
    bookings = query.order_by(models.SlotBooking.booked_at.desc()).all()
    result = []
    for b in bookings:
        d = {
            "id": b.id, "slot_id": b.slot_id, "volunteer_id": b.volunteer_id,
            "booked_at": b.booked_at, "status": b.status,
            "slot_task_name": b.slot.task_name if b.slot else None,
            "slot_date": b.slot.date if b.slot else None,
            "slot_time": b.slot.time if b.slot else None,
            "slot_location": b.slot.location if b.slot else None,
            "volunteer_name": volunteer.user.full_name
        }
        result.append(d)
    return result

@router.get("/stats")
def get_volunteer_stats(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    volunteer = db.query(models.Volunteer).filter(models.Volunteer.user_id == current_user.id).first()
    if not volunteer:
        raise HTTPException(status_code=404, detail="Volunteer profile not found")
    total_bookings = db.query(models.SlotBooking).filter(models.SlotBooking.volunteer_id == volunteer.id).count()
    confirmed = db.query(models.SlotBooking).filter(models.SlotBooking.volunteer_id == volunteer.id, models.SlotBooking.status == "CONFIRMED").count()
    today = date.today()
    upcoming = 0
    for b in db.query(models.SlotBooking).filter(models.SlotBooking.volunteer_id == volunteer.id, models.SlotBooking.status == "CONFIRMED").all():
        if b.slot and b.slot.date and b.slot.date >= today:
            upcoming += 1
    impact = int(volunteer.total_hours * 10 + total_bookings * 5)
    milestones = [50, 100, 200, 500, 1000]
    next_milestone = 50
    for m in milestones:
        if volunteer.total_hours < m:
            next_milestone = m
            break
    else:
        next_milestone = 1000
    return {
        "total_hours": volunteer.total_hours,
        "total_bookings": total_bookings,
        "confirmed_bookings": confirmed,
        "upcoming_slots": upcoming,
        "impact_score": impact,
        "next_milestone": next_milestone,
        "volunteer_id": volunteer.id
    }

@router.put("/profile")
def update_volunteer_profile(data: schemas.VolunteerUpdate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    volunteer = db.query(models.Volunteer).filter(models.Volunteer.user_id == current_user.id).first()
    if not volunteer:
        raise HTTPException(status_code=404, detail="Volunteer profile not found")
    if data.skills is not None:
        volunteer.skills = data.skills
    if data.bio is not None:
        volunteer.bio = data.bio
    db.commit()
    db.refresh(volunteer)
    return {"message": "Profile updated", "volunteer_id": volunteer.id}
