from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
import models, schemas, auth
from database import get_db
from config import SEARCH_MIN_LENGTH, SEARCH_MAX_LENGTH, SEARCH_BLOCKED_PATTERNS

router = APIRouter(tags=["search"])

@router.get("/search")
def search(q: str = Query(""), current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    cleaned = q.strip()

    if not cleaned or len(cleaned) < SEARCH_MIN_LENGTH:
        return {"volunteers": [], "children": [], "donors": [], "employees": []}

    if len(cleaned) > SEARCH_MAX_LENGTH:
        raise HTTPException(status_code=400, detail=f"Search query must be {SEARCH_MAX_LENGTH} characters or fewer")

    # Reject queries containing SQL comment sequences
    for pattern in SEARCH_BLOCKED_PATTERNS:
        if pattern in cleaned:
            raise HTTPException(status_code=400, detail="Search query contains invalid characters")

    term = f"%{cleaned}%"
    result = {"volunteers": [], "children": [], "donors": [], "employees": []}

    # Volunteers — visible to all roles
    vols = db.query(models.Volunteer).all()
    for v in vols:
        if v.user and (cleaned.lower() in v.user.full_name.lower() or cleaned.lower() in (v.skills or "").lower() or cleaned.lower() in (v.bio or "").lower()):
            result["volunteers"].append({
                "id": v.id, "name": v.user.full_name,
                "skills": v.skills, "total_hours": v.total_hours
            })

    # Children — staff/admin only
    if current_user.role in ["ADMIN", "NGO_STAFF"]:
        children = db.query(models.Child).filter(models.Child.is_active == True).all()
        for c in children:
            if cleaned.lower() in c.name.lower() or cleaned.lower() in (c.program or "").lower() or cleaned.lower() in (c.branch or "").lower():
                masked = c.name[0] + "***" + c.name[-1] if len(c.name) > 2 else "***"
                result["children"].append({"id": c.id, "masked_name": masked, "program": c.program, "branch": c.branch})

    # Donors — visible to staff/admin
    if current_user.role in ["ADMIN", "NGO_STAFF"]:
        donors = db.query(models.Donor).all()
        for d in donors:
            if cleaned.lower() in d.full_name.lower() or cleaned.lower() in (d.pan_number or "").lower():
                result["donors"].append({"id": d.id, "name": d.full_name, "total_donated": d.total_donated})

    # Employees — admin/staff only
    if current_user.role in ["ADMIN", "NGO_STAFF"]:
        emps = db.query(models.Employee).all()
        for e in emps:
            if cleaned.lower() in e.full_name.lower() or cleaned.lower() in (e.role or "").lower() or cleaned.lower() in (e.department or "").lower():
                result["employees"].append({"id": e.id, "name": e.full_name, "role": e.role, "department": e.department})

    return result
