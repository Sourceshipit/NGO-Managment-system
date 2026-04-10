<div align="center">

# 🌿 BeneTrack

### NGO Transparency & Management Platform

**Cryptographically auditable infrastructure for Indian non-profits**

[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React_18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Razorpay](https://img.shields.io/badge/Razorpay-0C2451?style=for-the-badge&logo=razorpay&logoColor=white)](https://razorpay.com/)
[![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

</div>

---

## 📋 Overview

**BeneTrack** is a full-stack, role-based web application designed as a **transparency and management platform for Indian NGOs**. Built for **CareConnect Foundation**, it addresses the core operational needs of a non-profit: managing volunteers, tracking beneficiary welfare, handling donor contributions with fiscal compliance (80G tax certificates), monitoring government regulatory compliance (FCRA, NITI Aayog, MCA21), managing employees, and maintaining an **immutable blockchain-style audit trail** for critical actions.

The platform integrates **Razorpay** for real payment processing, enabling donors to contribute via UPI, Cards, Net Banking, and Wallets — with every transaction cryptographically recorded on an immutable audit ledger.

### 🎯 Four Role-Based Portals

| Role | Portal | Purpose |
|------|--------|---------|
| **Admin** | `/dashboard` | Full platform oversight — all data, all controls |
| **NGO Staff** | `/staff/dashboard` | Day-to-day operations — volunteers, children, donors, compliance |
| **Volunteer** | `/volunteer/dashboard` | Self-service — browse slots, log hours, track impact |
| **Donor** | `/donor/dashboard` | Contribution tracking — donations, 80G certificates, Razorpay payments |

---

## ✨ Key Features

- 🔗 **Blockchain Audit Trail** — SHA-256 chained, tamper-evident logging for every critical action
- 💳 **Razorpay Payment Gateway** — Real online donations via UPI, Cards, Net Banking, Wallets with HMAC-SHA256 signature verification
- 📜 **80G Tax Certificates** — Auto-generated PDF certificates for Indian tax exemption (Section 80G)
- 🌐 **3D WebGL Login** — Immersive 3D sphere login experience with raw WebGL2 shaders
- 👥 **Volunteer Management** — Slot-based scheduling, hour logging, leaderboard, and impact scoring
- 🧒 **Beneficiary Tracking** — Child welfare records with data masking for non-admin roles
- 📊 **Real-time Dashboards** — Role-specific KPI dashboards with Recharts visualizations
- 🔐 **JWT + RBAC** — Secure authentication with role-based access control
- 🏛️ **Government Compliance** — FCRA, NITI Aayog, MCA21, 80G/12A tracking
- 🎨 **Modern Design System** — Clean, polished UI with micro-animations, glassmorphism accents, and dark/light theme support
- 🔍 **Global Search & Command Palette** — Keyboard-driven navigation across the entire platform
- 🗄️ **MySQL Database** — Production-grade relational storage with migration tooling

---

## 🛠 Tech Stack

### Backend
| Component | Technology |
|-----------|-----------|
| Framework | **Python 3.11+** with **FastAPI** |
| ORM | SQLAlchemy (declarative models) |
| Database | **MySQL 8+** (production) / SQLite (quick local dev) |
| Auth | JWT (`python-jose`) + bcrypt password hashing |
| Payments | **Razorpay SDK** with HMAC-SHA256 verification |
| PDF Generation | xhtml2pdf |
| Data Seeding | Faker + custom seed scripts |
| API Docs | Auto-generated Swagger UI at `/docs` |

### Frontend
| Component | Technology |
|-----------|-----------|
| Framework | **React 18** with **TypeScript** |
| Build Tool | Vite 5 |
| Styling | Tailwind CSS 3.4 + custom design tokens |
| Routing | React Router DOM v6 |
| Charts | Recharts |
| Animations | Framer Motion + GSAP |
| 3D Graphics | Raw WebGL2 + `gl-matrix` |
| Testing | Vitest + React Testing Library |

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.11+** — [Download](https://python.org/downloads/)
- **Node.js 18+** — [Download](https://nodejs.org/)
- **MySQL 8+** — [Download](https://dev.mysql.com/downloads/) (or use SQLite for quick local dev)
- **Razorpay Account** (optional, for payments) — [Sign up](https://dashboard.razorpay.com)

### 1. Clone the Repository

```bash
git clone https://github.com/Sourceshipit/NGO-Managment-system.git
cd NGO-Managment-system
```

### 2. Configure Environment Variables

```bash
# Copy the example env file
cp backend/.env.example backend/.env

# Edit backend/.env and fill in your values:
```

| Variable | Description | Required |
|----------|-------------|----------|
| `SECRET_KEY` | Random string for JWT signing | ✅ |
| `DATABASE_URL` | MySQL connection string (see below) | ✅ |
| `RAZORPAY_KEY_ID` | From Razorpay Dashboard → API Keys | Optional |
| `RAZORPAY_KEY_SECRET` | From Razorpay Dashboard → API Keys | Optional |
| `GOOGLE_CLIENT_ID` | From Google Cloud Console (OAuth) | Optional |

#### Database Configuration

**MySQL (recommended):**
```env
DATABASE_URL=mysql+pymysql://root:<password>@localhost/benetrack
```

Create the database first:
```sql
CREATE DATABASE benetrack CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

**SQLite (quick local dev — no server needed):**
```env
DATABASE_URL=sqlite:///./benetrack.db
```

### 3. Install Dependencies

```bash
npm run install:all
```

This installs:
- Root npm packages (`concurrently`)
- Frontend npm packages (React, Vite, Tailwind, etc.)
- Backend Python packages (FastAPI, SQLAlchemy, Razorpay, PyMySQL, etc.)

### 4. Start Development Servers

```bash
npm start
```

This simultaneously launches:
- **Backend** → `http://localhost:8000` (API + Swagger at `/docs`)
- **Frontend** → `http://localhost:5173` (React app)

The database auto-seeds with demo data on first startup.

### 5. (Optional) Seed Additional Data

To populate 10–20 records per table for development/testing:

```bash
cd backend
python seed_data.py
```

### 6. Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@benetrack.org` | `Admin@123` |
| NGO Staff | `staff1@benetrack.org` | `Staff@123` |
| Volunteer | `volunteer1@benetrack.org` | `Vol@123` |
| Donor | `donor1@benetrack.org` | `Donor@123` |

---

## 💳 Razorpay Payment Integration

### How It Works

```
Donor fills form → Backend creates Razorpay order → Razorpay Checkout popup opens
→ Donor pays (UPI/Card/etc.) → Backend HMAC-SHA256 signature verification
→ Donation recorded + Blockchain audit entry → Success with 80G certificate
```

### Testing Payments

1. Get **Test Mode** API keys from [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Add keys to `backend/.env`:
   ```env
   RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXXX
   RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXXXXXXXXXX
   ```
3. Use test card: `4111 1111 1111 1111` (any future expiry, any CVV)
4. UPI test ID: `success@razorpay`

### Security

- ✅ **HMAC-SHA256** signature verification for every payment
- ✅ **Idempotent** verify endpoint — duplicate payments safely handled
- ✅ **No raw card data** — PCI-DSS compliant via Razorpay's hosted checkout
- ✅ **Server-side validation** — amount and order verified on backend

---

## 🗄️ Database Migration (SQLite → MySQL)

If migrating from a previous SQLite setup:

```bash
cd backend
python migrate_sqlite_to_mysql.py
```

This script:
- Reads all records from the existing SQLite database
- Preserves blockchain chain integrity (hashes, previous links)
- Inserts all data into the configured MySQL database
- Handles foreign key ordering automatically

---

## 📁 Project Structure

```
benetrack/
├── package.json                # Root orchestrator (concurrently)
├── README.md
│
├── backend/
│   ├── main.py                 # FastAPI app entry point
│   ├── models.py               # 15 SQLAlchemy models (MySQL-compatible)
│   ├── schemas.py              # 30+ Pydantic schemas
│   ├── database.py             # MySQL/SQLite engine + session
│   ├── config.py               # Centralized configuration
│   ├── auth.py                 # JWT + bcrypt + RBAC
│   ├── blockchain_utils.py     # SHA-256 chain logic
│   ├── seed.py                 # Auto-seed on first startup
│   ├── seed_data.py            # Extended data seeder (Faker)
│   ├── migrate_sqlite_to_mysql.py  # Migration tool
│   ├── requirements.txt        # Python dependencies
│   ├── .env.example            # Environment variable template
│   └── routers/                # 16 API modules
│       ├── auth.py             # Login, JWT, password change
│       ├── google_auth.py      # Google OAuth2 flow
│       ├── payments.py         # Razorpay create-order + verify
│       ├── donors.py           # Donors, donations, 80G certs
│       ├── volunteers.py       # Volunteer + slot management
│       ├── hours.py            # Hour logging + approval
│       ├── dashboard.py        # Aggregated KPI stats
│       ├── children.py         # Beneficiary records
│       ├── employees.py        # Staff management
│       ├── compliance.py       # FCRA, NITI Aayog, MCA21
│       ├── announcements.py    # Org-wide announcements
│       ├── blockchain.py       # Audit trail viewer
│       ├── notifications.py    # In-app notifications
│       ├── search.py           # Global search
│       ├── users.py            # User management
│       └── allowlist.py        # Email allowlist control
│
├── frontend/
│   ├── index.html              # SPA entry + Razorpay SDK
│   ├── vite.config.ts          # Vite + API proxy
│   ├── tailwind.config.ts      # Design tokens + theme
│   └── src/
│       ├── App.tsx             # Route tree with RBAC guards
│       ├── index.css           # Global styles + animations
│       ├── api/client.ts       # Axios API client (11 modules)
│       ├── types/index.ts      # 30+ TypeScript interfaces
│       ├── context/            # Auth + theme context
│       ├── hooks/              # Custom React hooks
│       ├── config/             # Navigation config
│       ├── components/
│       │   ├── InfiniteMenu.tsx     # WebGL 3D login sphere
│       │   ├── CommandPalette.tsx   # Keyboard command palette
│       │   ├── ProtectedRoute.tsx   # RBAC route guard
│       │   ├── ErrorBoundary.tsx    # Error boundary
│       │   ├── Layout/             # Navbar, Sidebar, Layout
│       │   └── UI/                 # 22 reusable UI components
│       │       ├── DonateNowModal.tsx   # Razorpay checkout
│       │       ├── DataTable.tsx       # Sortable data tables
│       │       ├── StatCard.tsx        # KPI stat cards
│       │       ├── ImpactDashboard.tsx # Impact visualizations
│       │       └── ...
│       ├── pages/
│       │   ├── Landing.tsx     # Public landing with donate CTA
│       │   ├── Login.tsx       # 3D WebGL login
│       │   ├── Dashboard.tsx   # Admin dashboard
│       │   ├── donor/          # 6 donor portal pages
│       │   ├── volunteer/      # 8 volunteer portal pages
│       │   ├── staff/          # 9 staff portal pages
│       │   └── shared/         # 3 cross-role pages
│       ├── test/               # Test setup + utilities
│       └── styles/             # Print stylesheet
│
└── .github/
    └── workflows/
        └── ci.yml              # Lint + test CI pipeline
```

---

## 🧪 Testing

### Frontend Component Tests

```bash
cd frontend
npx vitest run
```

Tests cover:
- Layout components (Navbar, Sidebar)
- UI components (Modal, ConfirmModal, ThemeToggle, DonateNowModal)
- Pages (Login, Settings)
- Custom hooks (useTabRestore)

### Backend API Docs

Interactive API testing via Swagger UI at `http://localhost:8000/docs` when the backend is running.

---

## 🔒 Security Considerations

| Area | Implementation |
|------|---------------|
| **Authentication** | JWT with bcrypt hashing, HTTP-only refresh tokens |
| **Authorization** | Role-based access control (RBAC) on every endpoint |
| **Payments** | Razorpay HMAC-SHA256 signature verification |
| **Data Privacy** | Child records masked for non-admin roles |
| **Audit Trail** | Immutable SHA-256 blockchain logging |
| **Secrets** | All keys in `.env` (never committed) |
| **CORS** | Configurable allowed origins |
| **Rate Limiting** | SlowAPI rate limiter on sensitive endpoints |

---

## 📊 Statistics

| Metric | Count |
|--------|-------|
| Total pages | **37** (11 admin + 8 volunteer + 9 staff + 6 donor + 3 shared) |
| Backend routers | **16** |
| Database models | **15** |
| API endpoints | **45+** |
| TypeScript interfaces | **30+** |
| Frontend components | **28+** reusable |
| Component tests | **8** test suites |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ for CareConnect Foundation by Team Sourceshipit**

</div>
