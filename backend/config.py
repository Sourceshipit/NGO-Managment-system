"""
Clarion Configuration
Centralized config values to eliminate magic numbers across the codebase.
"""
import os
from dotenv import load_dotenv

load_dotenv()

# ── Auth ──────────────────────────────────────────────────────────────
SECRET_KEY = os.getenv("SECRET_KEY", "clarion-local-dev-secret-2025")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "15"))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))

# ── Database ──────────────────────────────────────────────────────────
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./clarion.db")

# ── CORS ──────────────────────────────────────────────────────────────
ALLOWED_ORIGINS_RAW = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173,http://127.0.0.1:5174"
)
ALLOWED_ORIGINS = [o.strip() for o in ALLOWED_ORIGINS_RAW.split(",") if o.strip()]

# ── Impact Score ──────────────────────────────────────────────────────
IMPACT_SCORE_WEIGHTS = {
    "hours": 10,
    "bookings": 5,
}

# ── Search ────────────────────────────────────────────────────────────
SEARCH_MIN_LENGTH = 2
SEARCH_MAX_LENGTH = 100
SEARCH_BLOCKED_PATTERNS = ["--", "/*", "*/"]

# ── Google OAuth ──────────────────────────────────────────────────────
# SETUP: https://console.cloud.google.com → APIs & Services → Credentials
# Create OAuth 2.0 Client ID (Web), add http://localhost:5173 to origins
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")

# ── Razorpay ──────────────────────────────────────────────────────────
# SETUP: https://dashboard.razorpay.com → Settings → API Keys → Generate
# Use Test keys for development (rzp_test_...), Live keys for production
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "")
