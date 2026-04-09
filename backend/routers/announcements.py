from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, datetime
import models, schemas, auth
from database import get_db

router = APIRouter(prefix="/announcements", tags=["announcements"])

@router.get("/", response_model=List[schemas.AnnouncementResponse])
def get_announcements(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    query = db.query(models.Announcement)
    today = date.today()
    if current_user.role == "VOLUNTEER":
        query = query.filter(
            (models.Announcement.expiry_date == None) | (models.Announcement.expiry_date >= today)
        )
    announcements = query.order_by(models.Announcement.created_at.desc()).all()
    result = []
    volunteer = None
    if current_user.role == "VOLUNTEER":
        volunteer = db.query(models.Volunteer).filter(models.Volunteer.user_id == current_user.id).first()
    for a in announcements:
        read_count = db.query(models.AnnouncementRead).filter(models.AnnouncementRead.announcement_id == a.id).count()
        is_read = False
        if volunteer:
            is_read = db.query(models.AnnouncementRead).filter(
                models.AnnouncementRead.announcement_id == a.id,
                models.AnnouncementRead.volunteer_id == volunteer.id
            ).first() is not None
        result.append({
            "id": a.id, "title": a.title, "content": a.content,
            "priority": a.priority, "target_skills": a.target_skills,
            "expiry_date": a.expiry_date, "created_by": a.created_by,
            "created_at": a.created_at,
            "creator_name": a.creator.full_name if a.creator else "System",
            "read_count": read_count, "is_read": is_read
        })
    return result

@router.post("/", response_model=schemas.AnnouncementResponse)
def create_announcement(data: schemas.AnnouncementCreate, current_user: models.User = Depends(auth.require_roles("ADMIN", "NGO_STAFF")), db: Session = Depends(get_db)):
    ann = models.Announcement(
        title=data.title, content=data.content, priority=data.priority,
        target_skills=data.target_skills, expiry_date=data.expiry_date,
        created_by=current_user.id
    )
    db.add(ann)
    db.commit()
    db.refresh(ann)
    return {
        "id": ann.id, "title": ann.title, "content": ann.content,
        "priority": ann.priority, "target_skills": ann.target_skills,
        "expiry_date": ann.expiry_date, "created_by": ann.created_by,
        "created_at": ann.created_at, "creator_name": current_user.full_name,
        "read_count": 0, "is_read": False
    }

@router.put("/{ann_id}", response_model=schemas.AnnouncementResponse)
def update_announcement(ann_id: int, data: schemas.AnnouncementCreate, current_user: models.User = Depends(auth.require_roles("ADMIN", "NGO_STAFF")), db: Session = Depends(get_db)):
    ann = db.query(models.Announcement).filter(models.Announcement.id == ann_id).first()
    if not ann:
        raise HTTPException(status_code=404, detail="Announcement not found")
    ann.title = data.title
    ann.content = data.content
    ann.priority = data.priority
    ann.target_skills = data.target_skills
    ann.expiry_date = data.expiry_date
    db.commit()
    db.refresh(ann)
    read_count = db.query(models.AnnouncementRead).filter(models.AnnouncementRead.announcement_id == ann.id).count()
    return {
        "id": ann.id, "title": ann.title, "content": ann.content,
        "priority": ann.priority, "target_skills": ann.target_skills,
        "expiry_date": ann.expiry_date, "created_by": ann.created_by,
        "created_at": ann.created_at, "creator_name": ann.creator.full_name if ann.creator else "System",
        "read_count": read_count, "is_read": False
    }

@router.delete("/{ann_id}")
def delete_announcement(ann_id: int, current_user: models.User = Depends(auth.require_roles("ADMIN", "NGO_STAFF")), db: Session = Depends(get_db)):
    ann = db.query(models.Announcement).filter(models.Announcement.id == ann_id).first()
    if not ann:
        raise HTTPException(status_code=404, detail="Announcement not found")
    ann.expiry_date = date.today()
    db.commit()
    return {"message": "Announcement archived"}

@router.post("/{ann_id}/read")
def mark_read(ann_id: int, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    volunteer = db.query(models.Volunteer).filter(models.Volunteer.user_id == current_user.id).first()
    if not volunteer:
        raise HTTPException(status_code=400, detail="Not a volunteer")
    existing = db.query(models.AnnouncementRead).filter(
        models.AnnouncementRead.announcement_id == ann_id,
        models.AnnouncementRead.volunteer_id == volunteer.id
    ).first()
    if existing:
        return {"message": "Already marked as read"}
    read = models.AnnouncementRead(announcement_id=ann_id, volunteer_id=volunteer.id)
    db.add(read)
    db.commit()
    return {"message": "Marked as read"}

@router.get("/{ann_id}/readers")
def get_readers(ann_id: int, current_user: models.User = Depends(auth.require_roles("ADMIN", "NGO_STAFF")), db: Session = Depends(get_db)):
    reads = db.query(models.AnnouncementRead).filter(models.AnnouncementRead.announcement_id == ann_id).all()
    return [{"volunteer_name": r.volunteer.user.full_name if r.volunteer and r.volunteer.user else "Unknown", "read_at": r.read_at.isoformat()} for r in reads]
