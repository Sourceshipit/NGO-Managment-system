from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import models, schemas, auth
from database import get_db
from blockchain_utils import create_blockchain_entry

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/", response_model=List[schemas.UserResponse])
def get_users(current_user: models.User = Depends(auth.require_roles("ADMIN")), db: Session = Depends(get_db)):
    return db.query(models.User).all()

@router.put("/{user_id}", response_model=schemas.UserResponse)
def update_user(user_id: int, data: schemas.UserUpdate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "ADMIN" and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if data.full_name is not None:
        user.full_name = data.full_name
    if data.phone is not None:
        user.phone = data.phone
    if data.department is not None:
        user.department = data.department
    if data.bio is not None:
        user.bio = data.bio
    db.commit()
    db.refresh(user)
    return user

@router.put("/{user_id}/toggle")
def toggle_user(user_id: int, current_user: models.User = Depends(auth.require_roles("ADMIN")), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = not user.is_active
    action = "activated" if user.is_active else "deactivated"
    create_blockchain_entry(db, "USER_TOGGLE", f"User {user.full_name} ({user.email}) {action} by {current_user.full_name}")
    db.commit()
    return {"message": f"User {action}", "is_active": user.is_active}
