from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import models, schemas, auth
from database import get_db
from blockchain_utils import create_blockchain_entry

router = APIRouter(prefix="/children", tags=["children"])

@router.get("/", response_model=List[schemas.ChildResponse])
def get_children(current_user: models.User = Depends(auth.require_roles("ADMIN", "NGO_STAFF")), db: Session = Depends(get_db)):
    children = db.query(models.Child).filter(models.Child.is_active == True).all()
    for c in children:
        creator = db.query(models.User).filter(models.User.id == c.created_by).first()
        c.created_by_name = creator.full_name if creator else "System"
    return children

@router.post("/", response_model=schemas.ChildResponse)
def create_child(child: schemas.ChildCreate, current_user: models.User = Depends(auth.require_roles("ADMIN", "NGO_STAFF")), db: Session = Depends(get_db)):
    db_child = models.Child(**child.model_dump(), created_by=current_user.id)
    db.add(db_child)
    db.commit()
    db.refresh(db_child)
    create_blockchain_entry(db, "CHILD_ENROLLED", f"Child {db_child.name} enrolled by {current_user.full_name}")
    db.commit()
    db_child.created_by_name = current_user.full_name
    return db_child

@router.put("/{id}", response_model=schemas.ChildResponse)
def update_child(id: int, child: schemas.ChildCreate, current_user: models.User = Depends(auth.require_roles("ADMIN", "NGO_STAFF")), db: Session = Depends(get_db)):
    db_child = db.query(models.Child).filter(models.Child.id == id).first()
    if not db_child:
        raise HTTPException(status_code=404, detail="Child not found")
    
    for key, value in child.model_dump().items():
        setattr(db_child, key, value)
        
    db.commit()
    db.refresh(db_child)
    creator = db.query(models.User).filter(models.User.id == db_child.created_by).first()
    db_child.created_by_name = creator.full_name if creator else "System"
    return db_child

@router.delete("/{id}")
def delete_child(id: int, current_user: models.User = Depends(auth.require_roles("ADMIN", "NGO_STAFF")), db: Session = Depends(get_db)):
    db_child = db.query(models.Child).filter(models.Child.id == id).first()
    if not db_child:
        raise HTTPException(status_code=404, detail="Child not found")
    
    db_child.is_active = False
    create_blockchain_entry(db, "CHILD_REMOVED", f"Child record #{id} soft-deleted by {current_user.full_name}")
    db.commit()
    return {"message": "Child record deleted successfully"}
