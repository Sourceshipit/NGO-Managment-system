from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models, schemas
from auth import get_current_user

router = APIRouter(
    prefix="/api/requirements",
    tags=["Requirements"]
)

@router.get("/", response_model=List[schemas.NgoRequirementResponse])
def get_requirements(db: Session = Depends(get_db)):
    requirements = db.query(models.NgoRequirement).filter(models.NgoRequirement.is_active == True).all()
    return requirements

@router.post("/", response_model=schemas.NgoRequirementResponse, status_code=status.HTTP_201_CREATED)
def create_requirement(
    req: schemas.NgoRequirementCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role not in ["ADMIN", "NGO_STAFF"]:
        raise HTTPException(status_code=403, detail="Not authorized to post requirements")
    
    new_req = models.NgoRequirement(
        **req.model_dump(),
        created_by=current_user.id
    )
    db.add(new_req)
    db.commit()
    db.refresh(new_req)
    return new_req

@router.put("/{req_id}", response_model=schemas.NgoRequirementResponse)
def update_requirement(
    req_id: int,
    req_update: schemas.NgoRequirementUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role not in ["ADMIN", "NGO_STAFF"]:
        raise HTTPException(status_code=403, detail="Not authorized to update requirements")
    
    db_req = db.query(models.NgoRequirement).filter(models.NgoRequirement.id == req_id).first()
    if not db_req:
        raise HTTPException(status_code=404, detail="Requirement not found")
        
    update_data = req_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_req, key, value)
        
    db.commit()
    db.refresh(db_req)
    return db_req

@router.delete("/{req_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_requirement(
    req_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role not in ["ADMIN", "NGO_STAFF"]:
        raise HTTPException(status_code=403, detail="Not authorized to delete requirements")
        
    db_req = db.query(models.NgoRequirement).filter(models.NgoRequirement.id == req_id).first()
    if not db_req:
        raise HTTPException(status_code=404, detail="Requirement not found")
        
    db.delete(db_req)
    db.commit()

@router.post("/{req_id}/pledge", response_model=schemas.NgoRequirementResponse)
def pledge_requirement(
    req_id: int,
    pledge: schemas.PledgeRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "DONOR":
        raise HTTPException(status_code=403, detail="Only donors can pledge support")
        
    db_req = db.query(models.NgoRequirement).filter(models.NgoRequirement.id == req_id).first()
    if not db_req:
        raise HTTPException(status_code=404, detail="Requirement not found")
        
    remaining = db_req.quantity_needed - db_req.quantity_fulfilled
    if pledge.quantity > remaining:
        raise HTTPException(status_code=400, detail=f"Cannot pledge more than the required amount ({remaining}).")
        
    db_req.quantity_fulfilled += pledge.quantity
    
    db.commit()
    db.refresh(db_req)
    return db_req
