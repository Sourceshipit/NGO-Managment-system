"""
migrate_sqlite_to_mysql.py
──────────────────────────
One-shot script to copy all data from SQLite (clarion.db) into MySQL.

Usage:
    cd backend
    python migrate_sqlite_to_mysql.py

Prerequisites:
    1. MySQL server running on localhost with database 'clarion' created:
       mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS clarion CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    2. DATABASE_URL in .env pointing to MySQL.
    3. pip install pymysql cryptography sqlalchemy python-dotenv
"""

import os
import sys
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# ── Load env ─────────────────────────────────────────────────────────
load_dotenv()

MYSQL_URL = os.getenv("DATABASE_URL")
SQLITE_URL = "sqlite:///./clarion.db"

if not MYSQL_URL or not MYSQL_URL.startswith("mysql"):
    print("[ERROR] DATABASE_URL in .env must be a mysql+pymysql:// URL.")
    sys.exit(1)

# ── Import models (registers metadata) ──────────────────────────────
from database import Base
import models  # noqa: F401  — registers all tables on Base.metadata

# ── Engines ──────────────────────────────────────────────────────────
sqlite_engine = create_engine(SQLITE_URL, connect_args={"check_same_thread": False})
mysql_engine  = create_engine(MYSQL_URL, pool_pre_ping=True)

SqliteSession = sessionmaker(bind=sqlite_engine)
MysqlSession  = sessionmaker(bind=mysql_engine)

# ── Table migration order (parents before children) ─────────────────
TABLE_ORDER = [
    models.User,
    models.Volunteer,
    models.VolunteerSlot,
    models.SlotBooking,
    models.HourLog,
    models.Child,
    models.Donor,
    models.Donation,
    models.Employee,
    models.Attendance,
    models.LeaveRequest,
    models.ComplianceRecord,
    models.BlockchainLog,
    models.Announcement,
    models.AnnouncementRead,
    models.Notification,
    models.RoleAllowlist,
]


def create_tables():
    """Create all tables in MySQL (idempotent)."""
    print("[1/3] Creating tables in MySQL …")
    Base.metadata.create_all(bind=mysql_engine)
    print("      ✓ Tables created.")


def migrate_data():
    """Read every row from SQLite and insert into MySQL, preserving PKs."""
    print("[2/3] Migrating data …")
    src = SqliteSession()
    dst = MysqlSession()

    try:
        for model in TABLE_ORDER:
            table_name = model.__tablename__
            rows = src.query(model).all()

            if not rows:
                print(f"      · {table_name:25s}  0 rows (empty)")
                continue

            # Detach rows from SQLite session → build plain dicts
            row_dicts = []
            mapper = model.__table__
            for row in rows:
                d = {col.name: getattr(row, col.name) for col in mapper.columns}
                row_dicts.append(d)

            # Bulk insert via Core (fastest, preserves PKs)
            dst.execute(mapper.insert(), row_dicts)
            dst.commit()
            print(f"      ✓ {table_name:25s}  {len(row_dicts)} rows")

    except Exception as e:
        dst.rollback()
        print(f"\n[ERROR] Migration failed: {e}")
        raise
    finally:
        src.close()
        dst.close()


def verify():
    """Quick sanity check: compare row counts between SQLite and MySQL."""
    print("[3/3] Verifying row counts …")
    src = SqliteSession()
    dst = MysqlSession()
    all_ok = True

    for model in TABLE_ORDER:
        name = model.__tablename__
        src_count = src.query(model).count()
        dst_count = dst.query(model).count()
        status = "✓" if src_count == dst_count else "✗"
        if src_count != dst_count:
            all_ok = False
        print(f"      {status} {name:25s}  SQLite={src_count}  MySQL={dst_count}")

    src.close()
    dst.close()

    if all_ok:
        print("\n[OK] Migration complete — all row counts match.")
    else:
        print("\n[WARN] Row count mismatch detected. Investigate above.")
    return all_ok


if __name__ == "__main__":
    print("═" * 60)
    print("  Clarion: SQLite → MySQL Migration")
    print("═" * 60)
    create_tables()
    migrate_data()
    verify()
