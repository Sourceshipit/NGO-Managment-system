import json
from datetime import datetime, timedelta, date, timezone
from sqlalchemy.orm import Session
from models import User, Volunteer, VolunteerSlot, Child, Donor, Donation, Employee, Attendance, LeaveRequest, ComplianceRecord, BlockchainLog, SlotBooking, HourLog, Announcement, AnnouncementRead, Notification, NgoRequirement
from auth import get_password_hash
from blockchain_utils import create_blockchain_entry
import random

def seed_database(db: Session):
    if db.query(User).count() > 0:
        return
    
    users = [
        {"email":"admin@clarion.org", "p":"Admin@123", "r":"ADMIN", "n":"Arjun Mehta"},
        {"email":"staff1@clarion.org", "p":"Staff@123", "r":"NGO_STAFF", "n":"Priya Sharma"},
        {"email":"staff2@clarion.org", "p":"Staff@123", "r":"NGO_STAFF", "n":"Ravi Kulkarni"},
        {"email":"volunteer1@clarion.org", "p":"Vol@123", "r":"VOLUNTEER", "n":"Sneha Patil"},
        {"email":"volunteer2@clarion.org", "p":"Vol@123", "r":"VOLUNTEER", "n":"Amit Desai"},
        {"email":"volunteer3@clarion.org", "p":"Vol@123", "r":"VOLUNTEER", "n":"Kavya Nair"},
        {"email":"volunteer4@clarion.org", "p":"Vol@123", "r":"VOLUNTEER", "n":"Rohit Joshi"},
        {"email":"volunteer5@clarion.org", "p":"Vol@123", "r":"VOLUNTEER", "n":"Anjali Singh"},
        {"email":"donor1@clarion.org", "p":"Donor@123", "r":"DONOR", "n":"Vikram Malhotra"},
        {"email":"donor2@clarion.org", "p":"Donor@123", "r":"DONOR", "n":"Sunita Rao"},
        {"email":"donor3@clarion.org", "p":"Donor@123", "r":"DONOR", "n":"Deepak Agarwal"}
    ]
    db_users = []
    for u in users:
        user = User(email=u["email"], hashed_password=get_password_hash(u["p"]), role=u["r"], full_name=u["n"])
        db.add(user)
        db_users.append(user)
    db.commit()

    # Volunteers
    v_skills = [
        ["Teaching", "Counselling"], ["Medical Aid", "First Aid"], 
        ["IT Support", "Data Entry"], ["Legal Aid", "Documentation"],
        ["Fundraising", "Photography"]
    ]
    v_hours = [142.0, 98.0, 76.0, 115.0, 54.0]
    
    v_users = db.query(User).filter(User.role == "VOLUNTEER").all()
    db_volunteers = []
    for idx, u in enumerate(v_users):
        v = Volunteer(user_id=u.id, skills=json.dumps(v_skills[idx]), total_hours=v_hours[idx])
        db.add(v)
        db_volunteers.append(v)
    db.commit()

    # Slots
    today = date.today()
    slots = [
        {"n":"Shiksha Weekend Camp", "s":'["Teaching"]', "d":5, "m":10, "b":7, "desc":"Weekend teaching camp for underprivileged children in Dharavi"},
        {"n":"Health Checkup Drive", "s":'["Medical Aid"]', "d":8, "m":8, "b":5, "desc":"Free health checkups and vaccinations at community center"},
        {"n":"Digital Literacy Workshop", "s":'["IT Support"]', "d":12, "m":6, "b":4, "desc":"Teaching basic computer skills to senior citizens"},
        {"n":"Legal Awareness Camp", "s":'["Legal Aid"]', "d":15, "m":4, "b":3, "desc":"Legal rights awareness for women in Andheri West"},
        {"n":"Fundraising Marathon", "s":'["Fundraising"]', "d":20, "m":20, "b":8, "desc":"Annual fundraising marathon event across Mumbai"},
        {"n":"Community Photography", "s":'["Photography"]', "d":25, "m":5, "b":5, "desc":"Document community stories through photography workshop"}
    ]
    db_slots = []
    for s in slots:
        slot = VolunteerSlot(
            task_name=s["n"], description=s["desc"],
            date=today + timedelta(days=s["d"]), time="10:00 AM", location="CareConnect Center, Mumbai",
            required_skills=s["s"], max_volunteers=s["m"], booked_count=s["b"],
            posted_by=db_users[0].id
        )
        db.add(slot)
        db_slots.append(slot)
    # Past slots
    past_slots_data = [
        {"n":"Tree Planting Drive", "d":-10, "m":8, "b":8},
        {"n":"Eye Camp", "d":-20, "m":6, "b":6},
    ]
    for s in past_slots_data:
        slot = VolunteerSlot(
            task_name=s["n"], description="Past completed event",
            date=today + timedelta(days=s["d"]), time="9:00 AM", location="Field Office, Pune",
            required_skills='["Medical Aid"]', max_volunteers=s["m"], booked_count=s["b"],
            posted_by=db_users[1].id, is_active=False
        )
        db.add(slot)
        db_slots.append(slot)
    db.commit()

    # Bookings for volunteers
    for v in db_volunteers[:3]:
        for s in db_slots[:3]:
            booking = SlotBooking(slot_id=s.id, volunteer_id=v.id, status="CONFIRMED")
            db.add(booking)
    # Past bookings
    for v in db_volunteers[:2]:
        for s in db_slots[-2:]:
            booking = SlotBooking(slot_id=s.id, volunteer_id=v.id, status="CONFIRMED")
            db.add(booking)
    db.commit()

    # Children
    c_names = ["Rahul Sharma", "Priti Kamble", "Suresh Nale", "Anita Jadhav", "Mohammed Shaikh", "Savita Pawar", "Vikas Gupta", "Rekha Yadav", "Sanjay More", "Pooja Salvi", "Arun Bhosale", "Meena Shinde"]
    c_progs = ["SHIKSHA", "SWASTHYA", "AAJEEVIKA", "UNNATI"]
    c_branches = ["Mumbai Central", "Pune West", "Nashik North"]
    for i, n in enumerate(c_names):
        c = Child(name=n, dob=today - timedelta(days=3650+i*10), gender="Male" if i%2==0 else "Female", address="Sample Address", program=c_progs[i%4], branch=c_branches[i%3], guardian_name="Guardian Name", guardian_contact="9876543210", created_by=db_users[0].id)
        db.add(c)
    db.commit()

    # Donors
    donors = [
        {"user":db_users[8], "pan":"ABCDE1234F"},
        {"user":db_users[9], "pan":"FGHIJ5678K"},
        {"user":db_users[10], "pan":"KLMNO9012L"},
        {"user":None, "n":"Infosys Foundation", "pan":"PQRST3456M"},
        {"user":None, "n":"Tata Trusts", "pan":"UVWXY7890N"}
    ]
    db_donors = []
    for d in donors:
        donor = Donor(user_id=d.get("user").id if d.get("user") else None, full_name=d.get("user").full_name if d.get("user") else d.get("n"), pan_number=d.get("pan"), is_verified=True)
        db.add(donor)
        db_donors.append(donor)
    db.commit()

    # Donations
    amounts = [50000, 45000, 30000, 25000, 20000, 15000, 12000, 10000, 9000, 8500, 7500, 6000, 5000, 4500, 3000]
    projects = ["Education", "Healthcare", "Livelihood", "Environment"]
    for i, a in enumerate(amounts):
        donor = db_donors[i % len(db_donors)]
        donation = Donation(donor_id=donor.id, amount=a, project=projects[i % 4], payment_mode="UPI", certificate_issued=True, donated_at=datetime.now() - timedelta(days=i))
        db.add(donation)
        donor.total_donated += a
        create_blockchain_entry(db, "DONATION", f"Donation {a} to {projects[i%4]} by {donor.pan_number}")
    db.commit()

    # Employees
    emps = [
        ("Neha Kulkarni", "Program Manager", "Programs", date(2020,3,1), 65000.0),
        ("Saurabh Pawar", "Finance Officer", "Finance", date(2019,8,15), 55000.0),
        ("Rutuja Deshmukh", "Field Coord", "Operations", date(2021,1,10), 42000.0),
        ("Akash Jagtap", "IT Manager", "IT", date(2020,11,20), 58000.0),
        ("Madhuri Shinde", "HR Executive", "Admin", date(2022,4,5), 38000.0),
        ("Prasad Kadam", "Accounts Asst", "Finance", date(2021,7,12), 32000.0),
        ("Tejal Patil", "Program Coord", "Programs", date(2022,2,28), 40000.0),
        ("Nikhil Bhagat", "IT Support", "IT", date(2023,1,15), 30000.0)
    ]
    db_emps = []
    for e in emps:
        emp = Employee(full_name=e[0], role=e[1], department=e[2], joining_date=e[3], salary=e[4], documents_uploaded='["Aadhar","PAN"]')
        db.add(emp)
        db_emps.append(emp)
    db.commit()
    for emp in db_emps:
        create_blockchain_entry(db, "EMPLOYEE", f"Employee joined: {emp.full_name}, {emp.role}")
        
    for emp in db_emps:
        for i in range(30):
            d = today - timedelta(days=i)
            if d.weekday() < 5:
                rand = random.random()
                st = "PRESENT"
                if rand > 0.85: st = "LEAVE"
                elif rand > 0.70: st = "ABSENT"
                db.add(Attendance(employee_id=emp.id, date=d, status=st))
    
    db.add(LeaveRequest(employee_id=db_emps[0].id, leave_type="MEDICAL", from_date=today-timedelta(10), to_date=today-timedelta(8), status="APPROVED"))
    db.add(LeaveRequest(employee_id=db_emps[2].id, leave_type="CASUAL", from_date=today+timedelta(3), to_date=today+timedelta(4), status="PENDING"))
    db.add(LeaveRequest(employee_id=db_emps[4].id, leave_type="EARNED", from_date=today-timedelta(20), to_date=today-timedelta(18), status="REJECTED"))
    db.commit()

    comp = [
        ("FCRA", "FCRA/2018/0123456", "ACTIVE", today-timedelta(180), today+timedelta(185)),
        ("NITI Aayog Darpan", "GJ/2019/0098765", "ACTIVE", today-timedelta(90), today+timedelta(275)),
        ("MCA21", "U85300MH2018NPL308456", "DUE_SOON", today-timedelta(365), today+timedelta(20)),
        ("80G / 12A", "CIT(E)/80G/2020/001234", "ACTIVE", today-timedelta(30), today+timedelta(700))
    ]
    for c in comp:
        cr = ComplianceRecord(policy_name=c[0], registration_id=c[1], status=c[2], last_filed=c[3], next_deadline=c[4])
        db.add(cr)
        create_blockchain_entry(db, "COMPLIANCE", f"Compliance {c[0]} status {c[2]}")
    db.commit()

    # Hour Logs for volunteers
    for v in db_volunteers[:3]:
        for i in range(7):
            log = HourLog(
                volunteer_id=v.id,
                date=today - timedelta(days=i*3+1),
                hours=round(random.uniform(1.0, 6.0), 1),
                description=random.choice([
                    "Teaching math and science to children",
                    "Conducted health awareness session",
                    "Helped with data entry and records",
                    "Organized fundraising materials",
                    "Assisted with community event setup"
                ])
            )
            db.add(log)
    db.commit()

    # Announcements
    announcements_data = [
        ("MCA21 Filing Deadline Approaching", "Please submit all required documents before the MCA21 deadline. Contact the compliance team for any queries.", "HIGH"),
        ("New Shiksha Weekend Camp Posted", "A new weekend camp has been posted for the Shiksha program. Book your slot now to participate!", "MEDIUM"),
        ("500 Collective Volunteer Hours!", "Thank you to all our Amazing volunteers! Together we've crossed 500 hours of community service this month.", "LOW"),
        ("Health Checkup Drive Next Week", "We're organizing a free health checkup drive at the community center. Medical volunteers needed!", "HIGH"),
        ("Monthly Team Meeting", "Monthly team sync scheduled for Friday at 3 PM. All volunteers are welcome to join virtually.", "MEDIUM"),
        ("New Training Resources Available", "We've uploaded new training materials for all programs. Check the resources section.", "LOW"),
        ("Volunteer Appreciation Day", "Join us for Volunteer Appreciation Day next Saturday! Food, games, and certificates.", "MEDIUM"),
        ("Updated Safety Guidelines", "Please review the updated safety and conduct guidelines before your next slot.", "HIGH"),
        ("Photography Contest Winners", "Congratulations to all participants! Winners will be announced at the next meetup.", "LOW"),
        ("Year-End Impact Report", "Our annual impact report is now available. See how your contributions made a difference!", "MEDIUM"),
    ]
    for i, (title, content, priority) in enumerate(announcements_data):
        ann = Announcement(
            title=title, content=content, priority=priority,
            created_by=db_users[1].id,
            created_at=datetime.now() - timedelta(days=i*2)
        )
        db.add(ann)
    db.commit()

    # Notifications
    notif_data = [
        (db_users[0].id, "NEW_BOOKING", "Sneha Patil booked Health Checkup Drive", "/volunteers"),
        (db_users[0].id, "DONATION", "New donation INR 50,000 from Vikram Malhotra", "/donors"),
        (db_users[0].id, "COMPLIANCE", "MCA21 deadline in 20 days", "/policies"),
        (db_users[0].id, "LEAVE", "Rutuja Deshmukh requested casual leave", "/employees"),
        (db_users[0].id, "LOW_SLOT", "Legal Awareness Camp is 75% full", "/volunteers"),
        (db_users[1].id, "NEW_BOOKING", "Amit Desai booked Digital Literacy Workshop", "/staff/volunteers"),
        (db_users[1].id, "COMPLIANCE", "FCRA annual return due next quarter", "/staff/compliance"),
        (db_users[1].id, "DONATION", "New donation INR 15,000 from Sunita Rao", "/staff/donors"),
        (db_users[3].id, "SYSTEM", "Welcome to Clarion! Start by browsing available slots.", "/volunteer/slots"),
        (db_users[3].id, "SYSTEM", "Your profile is 80% complete. Add your skills!", "/volunteer/profile"),
        (db_users[4].id, "SYSTEM", "New slot available: Health Checkup Drive", "/volunteer/slots"),
        (db_users[8].id, "SYSTEM", "Thank you for your donation! Your 80G certificate is ready.", "/donor/certificates"),
        (db_users[8].id, "DONATION", "Your donation of INR 50,000 has been recorded", "/donor/donations"),
        (db_users[9].id, "SYSTEM", "Welcome to Clarion donor portal!", "/donor/dashboard"),
    ]
    for uid, ntype, msg, link in notif_data:
        n = Notification(user_id=uid, type=ntype, message=msg, link=link)
        db.add(n)
    db.commit()

    # Ngo Requirements
    reqs = [
        ("School Supplies for Summer Camp", "SUPPLIES", "HIGH", "We need 50 sets of notebooks, pens, and drawing materials for the upcoming summer camp.", 50, 12),
        ("Medical Kits for Eye Camp", "SUPPLIES", "HIGH", "Basic first aid and eye-care kits for the upcoming rural eye camp.", 20, 5),
        ("Monthly Ration Funds", "FUNDS", "MEDIUM", "Funds required to supply monthly rations to 100 families.", 100000, 45000),
        ("Digital Literacy Laptops", "SUPPLIES", "LOW", "Looking for used laptops in working condition to teach basic computer skills.", 10, 3)
    ]
    for r in reqs:
        req = NgoRequirement(title=r[0], category=r[1], urgency=r[2], description=r[3], quantity_needed=r[4], quantity_fulfilled=r[5], created_by=db_users[1].id)
        db.add(req)
    db.commit()

    print("[OK] Clarion seeded (extended).")
