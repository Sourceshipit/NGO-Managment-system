<div align="center">

# 🏛️ CLARION

### NGO Transparency & Management Platform

**Cryptographically auditable infrastructure for Indian non-profits**

[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React_18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Razorpay](https://img.shields.io/badge/Razorpay-0C2451?style=for-the-badge&logo=razorpay&logoColor=white)](https://razorpay.com/)
[![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

</div>

---

## 📋 Overview

**Clarion** is a full-stack, role-based web application designed as a **transparency and management platform for Indian NGOs**. Built for **CareConnect Foundation**, it addresses the core operational needs of a non-profit: managing volunteers, tracking beneficiary welfare, handling donor contributions with fiscal compliance (80G tax certificates), monitoring government regulatory compliance (FCRA, NITI Aayog, MCA21), managing employees, and maintaining an **immutable blockchain-style audit trail** for critical actions.

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
- 🎨 **Brutalist Design System** — "Industrial Institutional" aesthetic with monospace typography, black borders, offset shadows

---

## 🛠 Tech Stack

### Backend
| Component | Technology |
|-----------|-----------|
| Framework | **Python 3.11+** with **FastAPI** |
| ORM | SQLAlchemy (declarative models) |
| Database | SQLite (file-based, zero-config) |
| Auth | JWT (`python-jose`) + bcrypt password hashing |
| Payments | **Razorpay SDK** with HMAC-SHA256 verification |
| PDF Generation | xhtml2pdf |
| API Docs | Auto-generated Swagger UI at `/docs` |

### Frontend
| Component | Technology |
|-----------|-----------|
| Framework | **React 18** with **TypeScript** |
| Build Tool | Vite 5 |
| Styling | Tailwind CSS 3.4 (brutalist design system) |
| Routing | React Router DOM v6 |
| Charts | Recharts |
| Animations | Framer Motion + GSAP |
| 3D Graphics | Raw WebGL2 + `gl-matrix` |

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.11+** — [Download](https://python.org/downloads/)
- **Node.js 18+** — [Download](https://nodejs.org/)
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
# - SECRET_KEY: Any random string for JWT signing
# - RAZORPAY_KEY_ID: From Razorpay Dashboard → Settings → API Keys
# - RAZORPAY_KEY_SECRET: From Razorpay Dashboard → Settings → API Keys
```

### 3. Install Dependencies

```bash
npm run install:all
```

This installs:
- Root npm packages (`concurrently`)
- Frontend npm packages (React, Vite, Tailwind, etc.)
- Backend Python packages (FastAPI, SQLAlchemy, Razorpay, etc.)

### 4. Start Development Servers

```bash
npm start
```

This simultaneously launches:
- **Backend** → `http://localhost:8000` (API + Swagger at `/docs`)
- **Frontend** → `http://localhost:5173` (React app)

The database auto-seeds with demo data on first startup.

### 5. Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@clarion.org` | `Admin@123` |
| NGO Staff | `staff1@clarion.org` | `Staff@123` |
| Volunteer | `volunteer1@clarion.org` | `Vol@123` |
| Donor | `donor1@clarion.org` | `Donor@123` |

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

## 📁 Project Structure

```
clarion/
├── package.json                # Root orchestrator (concurrently)
├── README.md
│
├── backend/
│   ├── main.py                 # FastAPI app entry point
│   ├── models.py               # 15 SQLAlchemy models
│   ├── schemas.py              # 30+ Pydantic schemas
│   ├── database.py             # SQLite engine + session
│   ├── auth.py                 # JWT + bcrypt + RBAC
│   ├── blockchain_utils.py     # SHA-256 chain logic
│   ├── config.py               # Centralized configuration
│   ├── seed.py                 # Demo data seeder
│   ├── requirements.txt        # Python dependencies
│   ├── .env.example            # Environment variable template
│   └── routers/                # 14 API modules
│       ├── auth.py             # Login, JWT, password change
│       ├── payments.py         # Razorpay create-order + verify
│       ├── donors.py           # Donors, donations, 80G certs
│       ├── volunteers.py       # Volunteer + slot management
│       ├── dashboard.py        # Aggregated KPI stats
│       └── ...                 # + 9 more routers
│
├── frontend/
│   ├── index.html              # SPA entry + Razorpay SDK
│   ├── vite.config.ts          # Vite + API proxy
│   ├── tailwind.config.ts      # Brutalist design tokens
│   └── src/
│       ├── App.tsx             # Route tree with RBAC guards
│       ├── api/client.ts       # Axios API client (11 modules)
│       ├── types/index.ts      # 30+ TypeScript interfaces
│       ├── components/
│       │   ├── InfiniteMenu.tsx     # WebGL 3D login sphere
│       │   ├── UI/DonateNowModal.tsx # Razorpay checkout modal
│       │   └── ...
│       └── pages/
│           ├── Landing.tsx     # Public landing with donate CTA
│           ├── donor/          # 6 donor portal pages
│           ├── volunteer/      # 8 volunteer portal pages
│           ├── staff/          # 9 staff portal pages
│           └── shared/         # 3 cross-role pages
│
└── .github/
    └── workflows/
        └── ci.yml              # Lint + test CI pipeline
```

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
| Total pages | **36** (10 admin + 8 volunteer + 9 staff + 6 donor + 3 shared) |
| Backend routers | **14** |
| Database models | **15** |
| API endpoints | **42+** |
| TypeScript interfaces | **30+** |
| Frontend components | **20+** reusable |

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
