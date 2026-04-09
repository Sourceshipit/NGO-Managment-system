"""
Razorpay Payment Gateway Integration
Handles order creation and payment verification with HMAC-SHA256 signature validation.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, field_validator
from typing import Optional
import hmac
import hashlib
from datetime import datetime

import models, auth
from database import get_db
from blockchain_utils import create_blockchain_entry
from config import RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET

router = APIRouter(tags=["payments"])

# ── Lazy Razorpay client (avoids import crash if keys missing) ────────
_razorpay_client = None

def get_razorpay_client():
    global _razorpay_client
    if _razorpay_client is None:
        if not RAZORPAY_KEY_ID or not RAZORPAY_KEY_SECRET:
            raise HTTPException(
                status_code=503,
                detail="Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env"
            )
        import razorpay
        _razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
    return _razorpay_client


# ── Schemas ───────────────────────────────────────────────────────────

class CreateOrderRequest(BaseModel):
    amount: float  # in INR (rupees), e.g. 500.00
    project: str
    notes: Optional[str] = None

    @field_validator('amount')
    @classmethod
    def validate_amount(cls, v):
        if v <= 0:
            raise ValueError("Amount must be greater than 0")
        if v > 10_000_000:
            raise ValueError("Amount cannot exceed ₹1,00,00,000 per transaction")
        return v


class CreateOrderResponse(BaseModel):
    order_id: str
    amount: int       # in paise
    currency: str
    key_id: str        # frontend needs this to open checkout
    donor_name: str
    donor_email: str
    donor_phone: str


class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    project: str
    amount: float
    notes: Optional[str] = None


# ── Endpoints ─────────────────────────────────────────────────────────

@router.post("/payments/create-order", response_model=CreateOrderResponse)
def create_order(
    data: CreateOrderRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_roles("DONOR"))
):
    """Create a Razorpay order for the authenticated donor."""
    client = get_razorpay_client()

    donor = db.query(models.Donor).filter(models.Donor.user_id == current_user.id).first()
    if not donor:
        raise HTTPException(status_code=404, detail="Donor profile not found")

    # Razorpay expects amount in paise (1 INR = 100 paise)
    amount_paise = int(round(data.amount * 100))

    order_data = {
        "amount": amount_paise,
        "currency": "INR",
        "receipt": f"clarion_{current_user.id}_{int(datetime.utcnow().timestamp())}",
        "notes": {
            "project": data.project,
            "donor_id": str(donor.id),
            "user_id": str(current_user.id),
            "donor_name": donor.full_name,
        }
    }

    try:
        order = client.order.create(data=order_data)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Razorpay order creation failed: {str(e)}")

    return CreateOrderResponse(
        order_id=order["id"],
        amount=order["amount"],
        currency=order["currency"],
        key_id=RAZORPAY_KEY_ID,
        donor_name=donor.full_name,
        donor_email=current_user.email,
        donor_phone=current_user.phone or "",
    )


@router.post("/payments/verify")
def verify_payment(
    data: VerifyPaymentRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_roles("DONOR"))
):
    """
    Verify Razorpay payment signature (HMAC-SHA256) and record the donation.
    Idempotent: if payment_id already exists, returns the existing donation.
    """
    # ── Idempotency check ─────────────────────────────────────────────
    existing = db.query(models.Donation).filter(
        models.Donation.razorpay_payment_id == data.razorpay_payment_id
    ).first()
    if existing:
        return {
            "status": "already_recorded",
            "donation_id": existing.id,
            "amount": existing.amount,
            "project": existing.project,
            "message": "This payment was already recorded."
        }

    # ── Signature verification ────────────────────────────────────────
    # Razorpay signature = HMAC-SHA256(order_id + "|" + payment_id, secret)
    message = f"{data.razorpay_order_id}|{data.razorpay_payment_id}"
    expected_signature = hmac.new(
        RAZORPAY_KEY_SECRET.encode('utf-8'),
        message.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(expected_signature, data.razorpay_signature):
        raise HTTPException(status_code=400, detail="Payment verification failed: invalid signature")

    # ── Record donation ───────────────────────────────────────────────
    donor = db.query(models.Donor).filter(models.Donor.user_id == current_user.id).first()
    if not donor:
        raise HTTPException(status_code=404, detail="Donor profile not found")

    donation = models.Donation(
        donor_id=donor.id,
        amount=data.amount,
        project=data.project,
        payment_mode="Razorpay",
        certificate_issued=False,
        donated_at=datetime.utcnow(),
        notes=data.notes,
        razorpay_order_id=data.razorpay_order_id,
        razorpay_payment_id=data.razorpay_payment_id,
    )
    db.add(donation)

    # Update donor total
    donor.total_donated += data.amount
    db.flush()

    # Blockchain audit entry
    create_blockchain_entry(
        db,
        record_type="DONATION",
        data_summary=(
            f"Razorpay payment {data.razorpay_payment_id}: "
            f"Donor {donor.full_name} donated ₹{data.amount} to {data.project}"
        )
    )

    db.commit()
    db.refresh(donation)

    return {
        "status": "success",
        "donation_id": donation.id,
        "amount": donation.amount,
        "project": donation.project,
        "razorpay_payment_id": data.razorpay_payment_id,
        "message": "Payment verified and donation recorded successfully"
    }
