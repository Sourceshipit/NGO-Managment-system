from fastapi import APIRouter, Depends, HTTPException, Request, Response, Cookie
from sqlalchemy.orm import Session
from typing import Optional
import models, schemas, auth
from database import get_db
from slowapi import Limiter
from slowapi.util import get_remote_address

router = APIRouter(tags=["authentication"])

# We get the limiter instance from app.state inside route handlers


@router.post("/login", response_model=schemas.LoginResponse)
def login(request: Request, response: Response, login_req: schemas.LoginRequest, db: Session = Depends(get_db)):
    # Rate limiting: applied via app-level limiter
    limiter: Limiter = request.app.state.limiter
    limiter._check_request_limit(request, lambda: "5/minute", request.app.state.limiter._key_func)

    user = db.query(models.User).filter(models.User.email == login_req.email).first()
    if not user or not auth.verify_password(login_req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Short-lived access token (returned in body)
    access_token = auth.create_access_token(
        data={"sub": user.email, "role": user.role, "user_id": user.id}
    )

    # Long-lived refresh token (set as httpOnly cookie)
    refresh_token = auth.create_refresh_token(
        data={"sub": user.email, "role": user.role, "user_id": user.id}
    )

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False,       # Set to True in production with HTTPS
        samesite="lax",
        max_age=7 * 24 * 60 * 60,  # 7 days
        path="/api/auth"
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }


@router.post("/refresh")
def refresh_token(request: Request, response: Response, refresh_token: Optional[str] = Cookie(None), db: Session = Depends(get_db)):
    """Issue a new access token using the httpOnly refresh cookie."""
    if not refresh_token:
        raise HTTPException(status_code=401, detail="No refresh token provided")

    payload = auth.verify_refresh_token(refresh_token)

    # Verify user still exists and is active
    user = db.query(models.User).filter(models.User.email == payload.get("sub")).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found or deactivated")

    new_access = auth.create_access_token(
        data={"sub": user.email, "role": user.role, "user_id": user.id}
    )

    return {"access_token": new_access, "token_type": "bearer", "user": {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role,
        "is_active": user.is_active,
        "phone": user.phone,
        "department": user.department,
        "bio": user.bio,
        "created_at": user.created_at.isoformat() if user.created_at else None
    }}


@router.post("/logout")
def logout(response: Response):
    """Clear the refresh token cookie."""
    response.delete_cookie(key="refresh_token", path="/api/auth")
    return {"message": "Logged out successfully"}


@router.post("/change-password")
def change_password(request: Request, req: schemas.ChangePasswordRequest, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    # Rate limiting
    limiter: Limiter = request.app.state.limiter
    limiter._check_request_limit(request, lambda: "3/minute", request.app.state.limiter._key_func)

    if not auth.verify_password(req.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    current_user.hashed_password = auth.get_password_hash(req.new_password)
    db.commit()
    return {"message": "Password updated successfully"}
