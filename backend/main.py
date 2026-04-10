import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import models
from database import engine, SessionLocal
from seed import seed_database
from config import ALLOWED_ORIGINS
import uvicorn

import routers.auth, routers.dashboard, routers.volunteers, routers.children
import routers.donors, routers.employees, routers.compliance, routers.blockchain
import routers.hours, routers.announcements, routers.search, routers.notifications, routers.users
from routers.google_auth import router as google_auth_router
from routers.allowlist import router as allowlist_router
from routers.payments import router as payments_router

# ── Rate Limiter ──────────────────────────────────────────────────────
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="Clarion API",
    description="NGO Transparency and Management Platform",
    version="2.0.0"
)

app.state.limiter = limiter

# Custom 429 handler — returns JSON instead of HTML
@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={
            "detail": "Too many requests. Please slow down.",
            "retry_after": str(exc.detail)
        }
    )

# ── CORS ──────────────────────────────────────────────────────────────
# Validate CORS origins in production
env = os.getenv("ENV", "development")
if env == "production" and not ALLOWED_ORIGINS:
    raise RuntimeError("ALLOWED_ORIGINS must be set in production environment")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    models.Base.metadata.create_all(bind=engine)

    # ── Lightweight migration: add Razorpay columns if missing ────────
    from sqlalchemy import inspect, text
    insp = inspect(engine)
    if insp.has_table("donations"):
        existing_cols = {col["name"] for col in insp.get_columns("donations")}
        with engine.connect() as conn:
            if "razorpay_order_id" not in existing_cols:
                conn.execute(text("ALTER TABLE donations ADD COLUMN razorpay_order_id VARCHAR(255)"))
                conn.commit()
            if "razorpay_payment_id" not in existing_cols:
                conn.execute(text("ALTER TABLE donations ADD COLUMN razorpay_payment_id VARCHAR(255)"))
                conn.commit()

    db = SessionLocal()
    seed_database(db)
    db.close()

app.include_router(routers.auth.router, prefix="/api/auth")
app.include_router(routers.dashboard.router, prefix="/api")
app.include_router(routers.volunteers.router, prefix="/api")
app.include_router(routers.children.router, prefix="/api")
app.include_router(routers.donors.router, prefix="/api")
app.include_router(routers.employees.router, prefix="/api")
app.include_router(routers.compliance.router, prefix="/api")
app.include_router(routers.blockchain.router, prefix="/api")
app.include_router(routers.hours.router, prefix="/api")
app.include_router(routers.announcements.router, prefix="/api")
app.include_router(routers.search.router, prefix="/api")
app.include_router(routers.notifications.router, prefix="/api")
app.include_router(routers.users.router, prefix="/api")
app.include_router(google_auth_router, prefix="/api/auth")
app.include_router(allowlist_router, prefix="/api")
app.include_router(payments_router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Clarion API running", "docs": "/docs", "version": "2.0.0"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
