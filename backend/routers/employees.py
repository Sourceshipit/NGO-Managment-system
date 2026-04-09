from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import date
import models, schemas, auth
from database import get_db
from blockchain_utils import create_blockchain_entry

router = APIRouter(tags=["employees"])

@router.get("/employees", response_model=List[schemas.EmployeeResponse])
def get_employees(db: Session = Depends(get_db)):
    return db.query(models.Employee).all()

@router.post("/employees", response_model=schemas.EmployeeResponse)
def create_employee(employee: schemas.EmployeeCreate, current_user: models.User = Depends(auth.require_roles("ADMIN")), db: Session = Depends(get_db)):
    db_employee = models.Employee(**employee.model_dump())
    db.add(db_employee)
    
    # Blockchain Entry
    summary = f"Employee joined: {employee.full_name}, {employee.role} in {employee.department}"
    create_blockchain_entry(db, "EMPLOYEE", summary)
    
    db.commit()
    db.refresh(db_employee)
    return db_employee

@router.put("/employees/{id}", response_model=schemas.EmployeeResponse)
def update_employee(id: int, employee: schemas.EmployeeCreate, current_user: models.User = Depends(auth.require_roles("ADMIN")), db: Session = Depends(get_db)):
    db_emp = db.query(models.Employee).filter(models.Employee.id == id).first()
    if not db_emp:
        raise HTTPException(status_code=404, detail="Employee not found")
        
    for key, value in employee.model_dump().items():
        setattr(db_emp, key, value)
        
    db.commit()
    db.refresh(db_emp)
    return db_emp

@router.get("/attendance/{emp_id}", response_model=List[schemas.AttendanceResponse])
def get_attendance(emp_id: int, month: int, year: int, db: Session = Depends(get_db)):
    # Filter by month and year in sqlite
    # Not trivial in raw query for all DBs, but since it's SQLite, we can just fetch and filter:
    attendances = db.query(models.Attendance).filter(models.Attendance.employee_id == emp_id).all()
    filtered = [a for a in attendances if a.date.month == month and a.date.year == year]
    return filtered

@router.post("/attendance", response_model=schemas.AttendanceResponse)
def mark_attendance(attendance: schemas.AttendanceCreate, current_user: models.User = Depends(auth.require_roles("ADMIN", "NGO_STAFF")), db: Session = Depends(get_db)):
    # check if exist
    existing = db.query(models.Attendance).filter(
        models.Attendance.employee_id == attendance.employee_id,
        models.Attendance.date == attendance.date
    ).first()
    
    if existing:
        existing.status = attendance.status
        db.commit()
        db.refresh(existing)
        return existing
        
    db_att = models.Attendance(**attendance.model_dump())
    db.add(db_att)
    db.commit()
    db.refresh(db_att)
    return db_att

@router.get("/leaves", response_model=List[schemas.LeaveRequestResponse])
def get_leaves(db: Session = Depends(get_db)):
    leaves = db.query(models.LeaveRequest).order_by(models.LeaveRequest.applied_at.desc()).all()
    for l in leaves:
        l.employee_name = l.employee.full_name if l.employee else "Unknown"
    return leaves

@router.post("/leaves", response_model=schemas.LeaveRequestResponse)
def submit_leave(leave: schemas.LeaveRequestCreate, db: Session = Depends(get_db)):
    db_leave = models.LeaveRequest(**leave.model_dump())
    db.add(db_leave)
    db.commit()
    db.refresh(db_leave)
    db_leave.employee_name = db_leave.employee.full_name
    return db_leave

@router.put("/leaves/{id}", response_model=schemas.LeaveRequestResponse)
def update_leave(id: int, status: str = Query(...), current_user: models.User = Depends(auth.require_roles("ADMIN")), db: Session = Depends(get_db)):
    db_leave = db.query(models.LeaveRequest).filter(models.LeaveRequest.id == id).first()
    if not db_leave:
        raise HTTPException(status_code=404, detail="Leave request not found")
        
    db_leave.status = status
    create_blockchain_entry(db, "LEAVE_DECISION", f"Leave #{id} for {db_leave.employee.full_name} {status} by {current_user.full_name}")
    db.commit()
    db.refresh(db_leave)
    db_leave.employee_name = db_leave.employee.full_name
    return db_leave

@router.get("/employees/payroll")
def get_payroll(db: Session = Depends(get_db)):
    total = db.query(func.sum(models.Employee.salary)).filter(models.Employee.status == "ACTIVE").scalar() or 0.0
    
    dept_breakdown = db.query(
        models.Employee.department, 
        func.count(models.Employee.id).label("count"),
        func.sum(models.Employee.salary).label("total")
    ).filter(models.Employee.status == "ACTIVE").group_by(models.Employee.department).all()
    
    breakdown = [{"department": d[0], "count": d[1], "total": d[2]} for d in dept_breakdown]
    
    return {"total_payroll": total, "breakdown": breakdown}
