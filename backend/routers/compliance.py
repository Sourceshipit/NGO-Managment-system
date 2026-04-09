from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import models, schemas, auth
from database import get_db
from blockchain_utils import create_blockchain_entry
from fastapi.responses import HTMLResponse
from datetime import datetime

router = APIRouter(prefix="/compliance", tags=["compliance"])

@router.get("/", response_model=List[schemas.ComplianceRecordResponse])
def get_compliance(db: Session = Depends(get_db)):
    # Sorting in python to easily handle nulls if needed, though order_by is fine
    records = db.query(models.ComplianceRecord).order_by(models.ComplianceRecord.next_deadline.asc()).all()
    return records

@router.put("/{id}", response_model=schemas.ComplianceRecordResponse)
def update_compliance(id: int, record: schemas.ComplianceRecordCreate, current_user: models.User = Depends(auth.require_roles("ADMIN")), db: Session = Depends(get_db)):
    db_rec = db.query(models.ComplianceRecord).filter(models.ComplianceRecord.id == id).first()
    if not db_rec:
        raise HTTPException(status_code=404, detail="Record not found")
        
    for key, value in record.model_dump().items():
        setattr(db_rec, key, value)
        
    create_blockchain_entry(db, "COMPLIANCE", f"Compliance {record.policy_name} updated to {record.status}")
        
    db.commit()
    db.refresh(db_rec)
    return db_rec

@router.post("/report", response_class=HTMLResponse)
def get_report(db: Session = Depends(get_db)):
    records = db.query(models.ComplianceRecord).all()
    date_str = datetime.now().strftime("%d %b %Y, %H:%M %p")
    
    rows = ""
    for r in records:
        status_color = "#10b981" if r.status == "ACTIVE" else ("#f59e0b" if r.status in ["PENDING", "DUE_SOON"] else "#ef4444")
        lf = r.last_filed.strftime("%d %b %Y") if r.last_filed else "N/A"
        nd = r.next_deadline.strftime("%d %b %Y") if r.next_deadline else "N/A"
        
        rows += f"""
        <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">{r.policy_name}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">{r.registration_id or "N/A"}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">
                <span style="background-color: {status_color}20; color: {status_color}; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">{r.status}</span>
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">{lf}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">{nd}</td>
        </tr>
        """
        
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>Compliance Report</title>
        <style>
            body {{ font-family: 'Arial', sans-serif; padding: 40px; color: #1e293b; max-width: 900px; margin: 0 auto; }}
            .header {{ text-align: center; margin-bottom: 40px; }}
            h1 {{ color: #F97316; margin-bottom: 5px; }}
            h2 {{ color: #0F172A; margin-top: 0; }}
            .meta {{ color: #64748B; font-size: 14px; margin-bottom: 30px; text-align: right; }}
            table {{ border-collapse: collapse; width: 100%; text-align: left; margin-bottom: 40px; }}
            th {{ background-color: #f8fafc; padding: 12px; border-bottom: 2px solid #cbd5e1; color: #475569; font-size: 14px; text-transform: uppercase; }}
            .footer {{ border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 12px; color: #64748B; text-align: center; }}
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Clarion</h1>
            <h2>Regulatory Compliance Report — CareConnect Foundation</h2>
        </div>
        
        <div class="meta">
            Generated on: {date_str}
        </div>
        
        <table>
            <thead>
                <tr>
                    <th>Policy / Registration</th>
                    <th>Reg. ID</th>
                    <th>Status</th>
                    <th>Last Filed</th>
                    <th>Next Deadline</th>
                </tr>
            </thead>
            <tbody>
                {rows}
            </tbody>
        </table>
        
        <div class="footer">
            CareConnect Foundation | Registration Number: 124-MHA-2018<br>
            This is an electronically generated report from the Clarion system.
        </div>
    </body>
    </html>
    """
    return html
