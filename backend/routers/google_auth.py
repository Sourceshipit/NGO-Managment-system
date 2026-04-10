from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
import uuid

from database import get_db
from models import User, Volunteer, Donor, RoleAllowlist
from auth import create_access_token, get_password_hash, create_refresh_token
from config import GOOGLE_CLIENT_ID
from pydantic import BaseModel

router = APIRouter(tags=["google-auth"])

class GoogleTokenRequest(BaseModel):
    credential: str  # The raw ID token string from Google

@router.post("/google")
def google_login(payload: GoogleTokenRequest, response: Response, db: Session = Depends(get_db)):
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=500, detail="Google OAuth not configured")

    try:
        id_info = id_token.verify_oauth2_token(
            payload.credential,
            google_requests.Request(),
            GOOGLE_CLIENT_ID,
            clock_skew_in_seconds=10  # Mitigation for local dev clock drift
        )
    except ValueError as e:
        raise HTTPException(status_code=401, detail=f"Invalid Google token: {str(e)}")

    email = id_info.get("email")
    full_name = id_info.get("name", "")

    if not email:
        raise HTTPException(status_code=400, detail="Google account has no email")

    # Check if user already exists
    user = db.query(User).filter(User.email == email).first()

    if user:
        # Update name if it was blank
        if not user.full_name and full_name:
            user.full_name = full_name
            db.commit()
    else:
        # Determine role: check allowlist, default to DONOR
        allowlist_entry = db.query(RoleAllowlist).filter(
            RoleAllowlist.email == email
        ).first()
        assigned_role = allowlist_entry.assigned_role if allowlist_entry else "DONOR"

        user = User(
            email=email,
            full_name=full_name,
            hashed_password=get_password_hash(str(uuid.uuid4())),
            role=assigned_role,
            is_active=True,
        )
        db.add(user)
        db.flush()  # get user.id before creating profile

        if assigned_role == "VOLUNTEER":
            db.add(Volunteer(user_id=user.id, skills="[]", total_hours=0.0, status="ACTIVE"))
        elif assigned_role == "DONOR":
            db.add(Donor(user_id=user.id, full_name=full_name, total_donated=0.0, is_verified=False))

        db.commit()
        db.refresh(user)

    token = create_access_token({"sub": user.email, "role": user.role, "user_id": user.id})
    refresh_token = create_refresh_token({"sub": user.email, "role": user.role, "user_id": user.id})

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=7 * 24 * 60 * 60,
        path="/api/auth"
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "is_active": user.is_active,
        }
    }
