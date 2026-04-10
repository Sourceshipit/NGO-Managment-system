"""
seed_data.py
────────────
Ensure every table in the Clarion database has 10-20 records.
Checks existing counts and only adds what's missing.

Usage:
    cd backend
    python seed_data.py
"""

import json
import random
from datetime import datetime, timedelta, date, timezone
from faker import Faker
from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
import models
from auth import get_password_hash
from blockchain_utils import create_blockchain_entry

fake = Faker("en_IN")  # Indian locale for realistic names/addresses

TARGET_MIN = 10  # minimum records per table


def ensure_users(db: Session) -> list:
    """Ensure ≥10 users exist."""
    existing = db.query(models.User).count()
    users = db.query(models.User).all()
    if existing >= TARGET_MIN:
        print(f"  ✓ users: {existing} rows (already ≥ {TARGET_MIN})")
        return users

    need = TARGET_MIN - existing
    new_roles = ["VOLUNTEER", "VOLUNTEER", "VOLUNTEER", "DONOR", "NGO_STAFF"]
    for i in range(need):
        role = new_roles[i % len(new_roles)]
        name = fake.name()
        email = f"seed.{fake.user_name()}.{random.randint(100,999)}@clarion.org"
        u = models.User(
            email=email,
            hashed_password=get_password_hash("Seed@123"),
            full_name=name,
            role=role,
            phone=fake.phone_number()[:20],
            department=fake.random_element(["Programs", "Finance", "IT", "Admin", "Operations"]),
        )
        db.add(u)
    db.commit()
    users = db.query(models.User).all()
    print(f"  ✓ users: {db.query(models.User).count()} rows (+{need})")
    return users


def ensure_volunteers(db: Session, users: list) -> list:
    """Ensure ≥10 volunteers exist."""
    existing = db.query(models.Volunteer).count()
    if existing >= TARGET_MIN:
        print(f"  ✓ volunteers: {existing} rows (already ≥ {TARGET_MIN})")
        return db.query(models.Volunteer).all()

    need = TARGET_MIN - existing
    # Find users not yet linked to a volunteer
    vol_user_ids = {v.user_id for v in db.query(models.Volunteer).all()}
    available = [u for u in users if u.id not in vol_user_ids and u.role == "VOLUNTEER"]

    # If not enough VOLUNTEER users, create more
    while len(available) < need:
        name = fake.name()
        email = f"vol.{fake.user_name()}.{random.randint(100,999)}@clarion.org"
        u = models.User(
            email=email,
            hashed_password=get_password_hash("Seed@123"),
            full_name=name,
            role="VOLUNTEER",
        )
        db.add(u)
        db.flush()
        available.append(u)

    skill_pool = [
        "Teaching", "Counselling", "Medical Aid", "First Aid",
        "IT Support", "Data Entry", "Legal Aid", "Documentation",
        "Fundraising", "Photography", "Event Management", "Cooking",
    ]
    for i in range(need):
        skills = random.sample(skill_pool, k=random.randint(2, 4))
        v = models.Volunteer(
            user_id=available[i].id,
            skills=json.dumps(skills),
            total_hours=round(random.uniform(10.0, 200.0), 1),
            status="ACTIVE",
        )
        db.add(v)
    db.commit()
    vols = db.query(models.Volunteer).all()
    print(f"  ✓ volunteers: {len(vols)} rows (+{need})")
    return vols


def ensure_volunteer_slots(db: Session, users: list) -> list:
    """Ensure ≥10 volunteer slots exist."""
    existing = db.query(models.VolunteerSlot).count()
    if existing >= TARGET_MIN:
        print(f"  ✓ volunteer_slots: {existing} rows (already ≥ {TARGET_MIN})")
        return db.query(models.VolunteerSlot).all()

    need = TARGET_MIN - existing
    admin_ids = [u.id for u in users if u.role in ("ADMIN", "NGO_STAFF")]
    poster_id = admin_ids[0] if admin_ids else users[0].id
    today = date.today()
    task_templates = [
        "Nutrition Awareness Drive", "Yoga & Wellness Camp", "Career Guidance Workshop",
        "Blood Donation Camp", "Street Play for Education", "River Cleanup Campaign",
        "Women Empowerment Seminar", "Senior Citizen Outreach", "Art Therapy Session",
        "Disaster Relief Training",
    ]
    for i in range(need):
        s = models.VolunteerSlot(
            task_name=task_templates[i % len(task_templates)],
            description=fake.paragraph(nb_sentences=2),
            date=today + timedelta(days=random.randint(3, 45)),
            time=fake.random_element(["9:00 AM", "10:00 AM", "2:00 PM", "4:00 PM"]),
            location=f"{fake.city()}, {fake.state()}",
            required_skills=json.dumps(random.sample(["Teaching", "Medical Aid", "IT Support", "Fundraising"], k=1)),
            max_volunteers=random.randint(5, 15),
            booked_count=0,
            posted_by=poster_id,
        )
        db.add(s)
    db.commit()
    slots = db.query(models.VolunteerSlot).all()
    print(f"  ✓ volunteer_slots: {len(slots)} rows (+{need})")
    return slots


def ensure_slot_bookings(db: Session, volunteers: list, slots: list) -> list:
    """Ensure ≥10 slot bookings exist."""
    existing = db.query(models.SlotBooking).count()
    if existing >= TARGET_MIN:
        print(f"  ✓ slot_bookings: {existing} rows (already ≥ {TARGET_MIN})")
        return db.query(models.SlotBooking).all()

    need = TARGET_MIN - existing
    for _ in range(need):
        v = random.choice(volunteers)
        s = random.choice(slots)
        b = models.SlotBooking(slot_id=s.id, volunteer_id=v.id, status="CONFIRMED")
        db.add(b)
    db.commit()
    bookings = db.query(models.SlotBooking).all()
    print(f"  ✓ slot_bookings: {len(bookings)} rows (+{need})")
    return bookings


def ensure_hour_logs(db: Session, volunteers: list):
    """Ensure ≥10 hour logs exist."""
    existing = db.query(models.HourLog).count()
    if existing >= TARGET_MIN:
        print(f"  ✓ hour_logs: {existing} rows (already ≥ {TARGET_MIN})")
        return

    need = TARGET_MIN - existing
    today = date.today()
    descs = [
        "Teaching math and science to children",
        "Conducted health awareness session",
        "Helped with data entry and records",
        "Organized fundraising materials",
        "Assisted with community event setup",
        "Distributed food packets in slum area",
        "Led yoga and meditation session",
    ]
    for _ in range(need):
        v = random.choice(volunteers)
        h = models.HourLog(
            volunteer_id=v.id,
            date=today - timedelta(days=random.randint(1, 60)),
            hours=round(random.uniform(1.0, 6.0), 1),
            description=random.choice(descs),
        )
        db.add(h)
    db.commit()
    print(f"  ✓ hour_logs: {db.query(models.HourLog).count()} rows (+{need})")


def ensure_children(db: Session, users: list):
    """Ensure ≥10 children records exist."""
    existing = db.query(models.Child).count()
    if existing >= TARGET_MIN:
        print(f"  ✓ children: {existing} rows (already ≥ {TARGET_MIN})")
        return

    need = TARGET_MIN - existing
    programs = ["SHIKSHA", "SWASTHYA", "AAJEEVIKA", "UNNATI"]
    branches = ["Mumbai Central", "Pune West", "Nashik North", "Delhi South"]
    admin_ids = [u.id for u in users if u.role in ("ADMIN", "NGO_STAFF")]
    creator = admin_ids[0] if admin_ids else users[0].id
    today = date.today()
    for _ in range(need):
        c = models.Child(
            name=fake.name(),
            dob=today - timedelta(days=random.randint(2555, 5475)),  # 7-15 years old
            gender=random.choice(["Male", "Female"]),
            address=fake.address()[:200],
            program=random.choice(programs),
            branch=random.choice(branches),
            guardian_name=fake.name(),
            guardian_contact=fake.phone_number()[:20],
            medical_notes=fake.sentence() if random.random() > 0.5 else None,
            created_by=creator,
        )
        db.add(c)
    db.commit()
    print(f"  ✓ children: {db.query(models.Child).count()} rows (+{need})")


def ensure_donors(db: Session, users: list) -> list:
    """Ensure ≥10 donors exist."""
    existing = db.query(models.Donor).count()
    if existing >= TARGET_MIN:
        print(f"  ✓ donors: {existing} rows (already ≥ {TARGET_MIN})")
        return db.query(models.Donor).all()

    need = TARGET_MIN - existing
    for _ in range(need):
        d = models.Donor(
            full_name=fake.name(),
            pan_number=fake.bothify("?????####?").upper(),
            email=fake.email(),
            phone=fake.phone_number()[:20],
            total_donated=0.0,
            is_verified=random.choice([True, False]),
        )
        db.add(d)
    db.commit()
    donors = db.query(models.Donor).all()
    print(f"  ✓ donors: {len(donors)} rows (+{need})")
    return donors


def ensure_donations(db: Session, donors: list):
    """Ensure ≥10 donations exist."""
    existing = db.query(models.Donation).count()
    if existing >= TARGET_MIN:
        print(f"  ✓ donations: {existing} rows (already ≥ {TARGET_MIN})")
        return

    need = TARGET_MIN - existing
    projects = ["Education", "Healthcare", "Livelihood", "Environment"]
    modes = ["UPI", "Bank Transfer", "Cash", "Cheque"]
    for _ in range(need):
        donor = random.choice(donors)
        amt = random.choice([1000, 2500, 5000, 10000, 15000, 25000])
        don = models.Donation(
            donor_id=donor.id,
            amount=amt,
            project=random.choice(projects),
            payment_mode=random.choice(modes),
            certificate_issued=random.choice([True, False]),
            donated_at=datetime.now() - timedelta(days=random.randint(1, 90)),
        )
        db.add(don)
        donor.total_donated += amt
        create_blockchain_entry(db, "DONATION", f"Donation {amt} to {don.project} by {donor.full_name}")
    db.commit()
    print(f"  ✓ donations: {db.query(models.Donation).count()} rows (+{need})")


def ensure_employees(db: Session) -> list:
    """Ensure ≥10 employees exist."""
    existing = db.query(models.Employee).count()
    if existing >= TARGET_MIN:
        print(f"  ✓ employees: {existing} rows (already ≥ {TARGET_MIN})")
        return db.query(models.Employee).all()

    need = TARGET_MIN - existing
    depts = ["Programs", "Finance", "IT", "Admin", "Operations", "HR"]
    roles = ["Program Officer", "Accountant", "IT Support", "Admin Asst", "Field Worker", "HR Exec"]
    for i in range(need):
        e = models.Employee(
            full_name=fake.name(),
            role=roles[i % len(roles)],
            department=depts[i % len(depts)],
            joining_date=date.today() - timedelta(days=random.randint(90, 1500)),
            salary=round(random.uniform(25000, 65000), 0),
            contact=fake.phone_number()[:20],
            documents_uploaded='["Aadhar","PAN"]',
        )
        db.add(e)
        db.flush()
        create_blockchain_entry(db, "EMPLOYEE", f"Employee joined: {e.full_name}, {e.role}")
    db.commit()
    emps = db.query(models.Employee).all()
    print(f"  ✓ employees: {len(emps)} rows (+{need})")
    return emps


def ensure_attendance(db: Session, employees: list):
    """Ensure ≥10 attendance records exist."""
    existing = db.query(models.Attendance).count()
    if existing >= TARGET_MIN:
        print(f"  ✓ attendance: {existing} rows (already ≥ {TARGET_MIN})")
        return

    need = TARGET_MIN - existing
    today = date.today()
    for _ in range(need):
        emp = random.choice(employees)
        d = today - timedelta(days=random.randint(1, 30))
        st = random.choices(["PRESENT", "ABSENT", "LEAVE"], weights=[70, 15, 15])[0]
        db.add(models.Attendance(employee_id=emp.id, date=d, status=st))
    db.commit()
    print(f"  ✓ attendance: {db.query(models.Attendance).count()} rows (+{need})")


def ensure_leave_requests(db: Session, employees: list):
    """Ensure ≥10 leave requests exist."""
    existing = db.query(models.LeaveRequest).count()
    if existing >= TARGET_MIN:
        print(f"  ✓ leave_requests: {existing} rows (already ≥ {TARGET_MIN})")
        return

    need = TARGET_MIN - existing
    today = date.today()
    types = ["MEDICAL", "CASUAL", "EARNED", "MATERNITY", "COMPENSATORY"]
    statuses = ["PENDING", "APPROVED", "REJECTED"]
    for _ in range(need):
        emp = random.choice(employees)
        start = today - timedelta(days=random.randint(-15, 30))
        dur = random.randint(1, 5)
        lr = models.LeaveRequest(
            employee_id=emp.id,
            leave_type=random.choice(types),
            from_date=start,
            to_date=start + timedelta(days=dur),
            status=random.choice(statuses),
            reason=fake.sentence(),
        )
        db.add(lr)
    db.commit()
    print(f"  ✓ leave_requests: {db.query(models.LeaveRequest).count()} rows (+{need})")


def ensure_compliance(db: Session):
    """Ensure ≥10 compliance records exist."""
    existing = db.query(models.ComplianceRecord).count()
    if existing >= TARGET_MIN:
        print(f"  ✓ compliance_records: {existing} rows (already ≥ {TARGET_MIN})")
        return

    need = TARGET_MIN - existing
    today = date.today()
    policies = [
        "GST Filing", "PF Compliance", "ESI Act", "Shops & Establishment Act",
        "IT Returns", "TDS Filing", "Annual Audit", "NGO Darpan Renewal",
        "Trust Registration", "Charity Commissioner Report",
    ]
    statuses = ["ACTIVE", "DUE_SOON", "OVERDUE", "FILED"]
    for i in range(need):
        cr = models.ComplianceRecord(
            policy_name=policies[i % len(policies)],
            registration_id=fake.bothify("???/####/######").upper(),
            status=random.choice(statuses),
            last_filed=today - timedelta(days=random.randint(30, 365)),
            next_deadline=today + timedelta(days=random.randint(10, 300)),
            notes=fake.sentence() if random.random() > 0.5 else None,
        )
        db.add(cr)
        db.flush()
        create_blockchain_entry(db, "COMPLIANCE", f"Compliance {cr.policy_name} status {cr.status}")
    db.commit()
    print(f"  ✓ compliance_records: {db.query(models.ComplianceRecord).count()} rows (+{need})")


def ensure_announcements(db: Session, users: list) -> list:
    """Ensure ≥10 announcements exist."""
    existing = db.query(models.Announcement).count()
    if existing >= TARGET_MIN:
        print(f"  ✓ announcements: {existing} rows (already ≥ {TARGET_MIN})")
        return db.query(models.Announcement).all()

    need = TARGET_MIN - existing
    admin_ids = [u.id for u in users if u.role in ("ADMIN", "NGO_STAFF")]
    creator = admin_ids[0] if admin_ids else users[0].id
    for _ in range(need):
        a = models.Announcement(
            title=fake.sentence(nb_words=6),
            content=fake.paragraph(nb_sentences=3),
            priority=random.choice(["HIGH", "MEDIUM", "LOW"]),
            created_by=creator,
            created_at=datetime.now() - timedelta(days=random.randint(1, 30)),
        )
        db.add(a)
    db.commit()
    anns = db.query(models.Announcement).all()
    print(f"  ✓ announcements: {len(anns)} rows (+{need})")
    return anns


def ensure_announcement_reads(db: Session, announcements: list, volunteers: list):
    """Ensure ≥10 announcement reads exist."""
    existing = db.query(models.AnnouncementRead).count()
    if existing >= TARGET_MIN:
        print(f"  ✓ announcement_reads: {existing} rows (already ≥ {TARGET_MIN})")
        return

    need = TARGET_MIN - existing
    for _ in range(need):
        a = random.choice(announcements)
        v = random.choice(volunteers)
        ar = models.AnnouncementRead(
            announcement_id=a.id,
            volunteer_id=v.id,
        )
        db.add(ar)
    db.commit()
    print(f"  ✓ announcement_reads: {db.query(models.AnnouncementRead).count()} rows (+{need})")


def ensure_notifications(db: Session, users: list):
    """Ensure ≥10 notifications exist."""
    existing = db.query(models.Notification).count()
    if existing >= TARGET_MIN:
        print(f"  ✓ notifications: {existing} rows (already ≥ {TARGET_MIN})")
        return

    need = TARGET_MIN - existing
    types = ["SYSTEM", "DONATION", "NEW_BOOKING", "COMPLIANCE", "LEAVE", "LOW_SLOT"]
    for _ in range(need):
        u = random.choice(users)
        n = models.Notification(
            user_id=u.id,
            type=random.choice(types),
            message=fake.sentence(),
            link=f"/{random.choice(['donors','volunteers','employees','policies'])}",
        )
        db.add(n)
    db.commit()
    print(f"  ✓ notifications: {db.query(models.Notification).count()} rows (+{need})")


def ensure_role_allowlist(db: Session):
    """Ensure ≥10 role allowlist entries exist."""
    existing = db.query(models.RoleAllowlist).count()
    if existing >= TARGET_MIN:
        print(f"  ✓ role_allowlist: {existing} rows (already ≥ {TARGET_MIN})")
        return

    need = TARGET_MIN - existing
    roles = ["ADMIN", "NGO_STAFF", "VOLUNTEER"]
    for _ in range(need):
        email = f"allow.{fake.user_name()}.{random.randint(100,999)}@clarion.org"
        ra = models.RoleAllowlist(
            email=email,
            assigned_role=random.choice(roles),
            notes=fake.sentence() if random.random() > 0.5 else None,
        )
        db.add(ra)
    db.commit()
    print(f"  ✓ role_allowlist: {db.query(models.RoleAllowlist).count()} rows (+{need})")


def run():
    print("═" * 60)
    print("  Clarion: Seed Data (ensure ≥10 per table)")
    print("═" * 60)

    db = SessionLocal()
    try:
        users = ensure_users(db)
        volunteers = ensure_volunteers(db, users)
        slots = ensure_volunteer_slots(db, users)
        ensure_slot_bookings(db, volunteers, slots)
        ensure_hour_logs(db, volunteers)
        ensure_children(db, users)
        donors = ensure_donors(db, users)
        ensure_donations(db, donors)
        employees = ensure_employees(db)
        ensure_attendance(db, employees)
        ensure_leave_requests(db, employees)
        ensure_compliance(db)
        announcements = ensure_announcements(db, users)
        ensure_announcement_reads(db, announcements, volunteers)
        ensure_notifications(db, users)
        ensure_role_allowlist(db)

        # Final blockchain verification
        from blockchain_utils import verify_chain
        result = verify_chain(db)
        status = "✓ VALID" if result["valid"] else "✗ BROKEN"
        print(f"\n  Blockchain chain: {status} ({result['total']} blocks)")
        print("\n[OK] Seeding complete.")
    except Exception as e:
        print(f"\n[ERROR] Seeding failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    run()
