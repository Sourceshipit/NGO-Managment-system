from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import RoleAllowlist, User
from schemas import RoleAllowlistCreate, RoleAllowlistUpdate, RoleAllowlistResponse
from auth import get_current_user, require_roles
from typing import List

router = APIRouter(tags=["allowlist"])

@router.get("/allowlist", response_model=List[RoleAllowlistResponse])
def list_allowlist(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("ADMIN"))
):
    return db.query(RoleAllowlist).order_by(RoleAllowlist.created_at.desc()).all()

@router.post("/allowlist", response_model=RoleAllowlistResponse)
def create_allowlist_entry(
    data: RoleAllowlistCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("ADMIN"))
):
    existing = db.query(RoleAllowlist).filter(RoleAllowlist.email == data.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="Email already in allowlist")

    entry = RoleAllowlist(
        email=data.email,
        assigned_role=data.assigned_role,
        notes=data.notes,
        created_by_id=current_user.id
    )
    db.add(entry)

    # If this user already exists, update their role immediately
    live_user = db.query(User).filter(User.email == data.email).first()
    if live_user:
        live_user.role = data.assigned_role

    db.commit()
    db.refresh(entry)
    return entry

@router.put("/allowlist/{entry_id}", response_model=RoleAllowlistResponse)
def update_allowlist_entry(
    entry_id: int,
    data: RoleAllowlistUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("ADMIN"))
):
    entry = db.query(RoleAllowlist).filter(RoleAllowlist.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")

    if data.assigned_role:
        entry.assigned_role = data.assigned_role
        live_user = db.query(User).filter(User.email == entry.email).first()
        if live_user:
            live_user.role = data.assigned_role
    if data.notes is not None:
        entry.notes = data.notes

    db.commit()
    db.refresh(entry)
    return entry

@router.delete("/allowlist/{entry_id}")
def delete_allowlist_entry(
    entry_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("ADMIN"))
):
    entry = db.query(RoleAllowlist).filter(RoleAllowlist.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    db.delete(entry)
    db.commit()
    return {"message": "Deleted"}
