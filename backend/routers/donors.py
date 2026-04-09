from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import models, schemas, auth
from pydantic import BaseModel
from database import get_db
from blockchain_utils import create_blockchain_entry
from fastapi.responses import HTMLResponse, StreamingResponse
from datetime import datetime
from io import BytesIO

router = APIRouter(tags=["donors"])

@router.get("/donors", response_model=List[schemas.DonorResponse])
def get_donors(db: Session = Depends(get_db)):
    return db.query(models.Donor).all()

@router.post("/donors", response_model=schemas.DonorResponse)
def create_donor(donor: schemas.DonorCreate, db: Session = Depends(get_db)):
    db_donor = models.Donor(**donor.model_dump())
    db.add(db_donor)
    db.commit()
    db.refresh(db_donor)
    return db_donor

@router.put("/donors/{id}", response_model=schemas.DonorResponse)
def update_donor(id: int, donor: schemas.DonorCreate, db: Session = Depends(get_db)):
    db_donor = db.query(models.Donor).filter(models.Donor.id == id).first()
    if not db_donor:
        raise HTTPException(status_code=404, detail="Donor not found")
    for key, value in donor.model_dump().items():
        setattr(db_donor, key, value)
    db.commit()
    db.refresh(db_donor)
    return db_donor

@router.get("/donations", response_model=List[schemas.DonationResponse])
def get_donations(db: Session = Depends(get_db)):
    donations = db.query(models.Donation).order_by(models.Donation.donated_at.desc()).all()
    for d in donations:
        d.donor_name = d.donor.full_name if d.donor else "Unknown"
    return donations

@router.post("/donations", response_model=schemas.DonationResponse)
def create_donation(donation: schemas.DonationCreate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    donor = db.query(models.Donor).filter(models.Donor.id == donation.donor_id).first()
    if not donor:
        raise HTTPException(status_code=404, detail="Donor not found")
        
    db_donation = models.Donation(
        **donation.model_dump(),
        certificate_issued=True,
        donated_at=datetime.utcnow()
    )
    db.add(db_donation)
    
    donor.total_donated += donation.amount
    
    # Blockchain Entry
    summary = f"Donation of INR {donation.amount} to {donation.project} by {donor.full_name}"
    if donor.pan_number:
        summary += f" (PAN: {donor.pan_number})"
    create_blockchain_entry(db, "DONATION", summary)
    
    db.commit()
    db.refresh(db_donation)
    db_donation.donor_name = donor.full_name
    return db_donation

@router.get("/donations/{id}/certificate")
def get_certificate(id: int, format: str = "pdf", db: Session = Depends(get_db)):
    """Generate 80G certificate as PDF (default) or HTML."""
    donation = db.query(models.Donation).filter(models.Donation.id == id).first()
    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found")
        
    donor = donation.donor
    date_str = donation.donated_at.strftime("%d %B %Y")
    year = donation.donated_at.year

    html = f"""
    <html>
    <head>
        <style>
            body {{ font-family: 'Helvetica', Arial, sans-serif; margin: 0; padding: 40px; color: #1e293b; }}
            .header {{ text-align: center; margin-bottom: 40px; border-bottom: 3px solid #f97316; padding-bottom: 20px; }}
            .logo-text {{ font-size: 28px; font-weight: bold; color: #f97316; letter-spacing: 4px; margin: 0; }}
            .sub-logo {{ font-size: 12px; color: #64748B; letter-spacing: 2px; margin-top: 4px; }}
            .title {{ text-align: center; font-size: 20px; font-weight: bold; letter-spacing: 2px; color: #0f172a; margin: 40px 0 20px 0; }}
            .receipt-info {{ display: flex; justify-content: space-between; background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 12px 20px; margin-bottom: 30px; font-size: 13px; }}
            .content {{ line-height: 1.8; font-size: 14px; }}
            .amount {{ font-weight: bold; font-size: 18px; }}
            .footer {{ margin-top: 60px; display: flex; justify-content: space-between; }}
            .signature {{ text-align: center; padding-top: 40px; border-top: 1px solid #cbd5e1; width: 200px; }}
            .ngo-details {{ font-size: 12px; color: #64748B; text-align: center; margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 20px; }}
            .badge {{ display: inline-block; background-color: #ecfdf5; color: #059669; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; border: 1px solid #10b981; }}
        </style>
    </head>
    <body>
        <div class="header">
            <h1 class="logo-text">Clarion</h1>
            <p class="sub-logo">Operated by CareConnect Foundation</p>
        </div>
        
        <div class="title">Certificate of Donation under Section 80G</div>
        
        <div class="receipt-info">
            <div>Receipt No: BTRC-{year}-{donation.id:06d}</div>
            <div>Date: {date_str}</div>
        </div>
        
        <div class="content">
            <p>This is to certify that we have received a donation of <span class="amount">₹{donation.amount:,.2f}</span> from:</p>
            <p><strong>Name:</strong> {donor.full_name}<br>
               <strong>PAN Number:</strong> {donor.pan_number or 'Not Provided'}</p>
            
            <p>The donation is allocated towards our <strong>{donation.project}</strong> project. The payment was received via {donation.payment_mode}.</p>
            
            <p style="text-align: center; margin: 40px 0;">
                <span class="badge">Valid for Income Tax exemption purposes</span>
            </p>
            
            <p>We gratefully acknowledge this contribution. Your support enables CareConnect Foundation to continue identifying and serving vulnerable communities across India.</p>
        </div>
        
        <div class="footer">
            <div></div>
            <div class="signature">
                <strong>Authorized Signatory</strong><br>
                CareConnect Foundation
            </div>
        </div>
        
        <div class="ngo-details">
            CareConnect Foundation is registered as a Section 8 Company under the Companies Act 2013.<br>
            Donations are exempt under Section 80G(5)(vi) of the Income Tax Act 1961 vide Order No. CIT(E)/80G/2020/001234.<br>
            Registered Address: 124, Social Sector Block, Mumbai Central, MH 400008
        </div>
    </body>
    </html>
    """

    # Return HTML if explicitly requested
    if format == "html":
        return HTMLResponse(content=html)

    # Default: generate PDF
    try:
        from xhtml2pdf import pisa
        pdf_buffer = BytesIO()
        pisa_status = pisa.CreatePDF(html, dest=pdf_buffer)
        
        if pisa_status.err:
            raise HTTPException(status_code=500, detail="PDF generation failed")
        
        pdf_buffer.seek(0)
        filename = f"Clarion_80G_BTRC-{year}-{donation.id:06d}.pdf"
        
        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'}
        )
    except ImportError:
        # Fallback to HTML if xhtml2pdf not installed
        return HTMLResponse(content=html)


# ── Self-service donation for authenticated donors ────────────────────
from pydantic import field_validator

class SelfDonationCreate(BaseModel):
    amount: float
    project: str
    payment_mode: str

    @field_validator('amount')
    @classmethod
    def validate_amount(cls, v):
        if v <= 0:
            raise ValueError("Amount must be greater than 0")
        if v > 10_000_000:
            raise ValueError("Amount cannot exceed ₹1,00,00,000 per transaction")
        return v

@router.post("/donor/donate")
def self_donate(
    data: SelfDonationCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_roles("DONOR"))
):
    donor = db.query(models.Donor).filter(models.Donor.user_id == current_user.id).first()
    if not donor:
        raise HTTPException(status_code=404, detail="Donor profile not found")

    donation = models.Donation(
        donor_id=donor.id,
        amount=data.amount,
        project=data.project,
        payment_mode=data.payment_mode,
        certificate_issued=False,
    )
    db.add(donation)
    donor.total_donated += data.amount
    db.flush()

    create_blockchain_entry(
        db,
        record_type="DONATION",
        data_summary=f"Donor {donor.full_name} donated ₹{data.amount} to {data.project}"
    )

    db.commit()
    db.refresh(donation)
    return {
        "donation_id": donation.id,
        "amount": data.amount,
        "project": data.project,
        "message": "Donation recorded successfully"
    }
