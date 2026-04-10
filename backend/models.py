from sqlalchemy import Boolean, Column, Integer, Float, String, Date, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="VOLUNTEER")
    is_active = Column(Boolean, default=True)
    phone = Column(String(20), nullable=True)
    department = Column(String(100), nullable=True)
    bio = Column(Text, nullable=True)
    created_at = Column(DateTime, default=func.now())

class Volunteer(Base):
    __tablename__ = "volunteers"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    skills = Column(Text)
    bio = Column(Text, nullable=True)
    total_hours = Column(Float, default=0.0)
    status = Column(String(50), default="ACTIVE")
    joined_at = Column(DateTime, default=func.now())
    user = relationship("User")
    bookings = relationship("SlotBooking", back_populates="volunteer")
    hour_logs = relationship("HourLog", back_populates="volunteer")

class VolunteerSlot(Base):
    __tablename__ = "volunteer_slots"
    id = Column(Integer, primary_key=True, index=True)
    task_name = Column(String(255), nullable=False)
    description = Column(Text)
    date = Column(Date)
    time = Column(String(20))
    location = Column(String(255))
    required_skills = Column(Text)
    max_volunteers = Column(Integer, default=5)
    booked_count = Column(Integer, default=0)
    posted_by = Column(Integer, ForeignKey("users.id"))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    bookings = relationship("SlotBooking", back_populates="slot")
    poster = relationship("User")

class SlotBooking(Base):
    __tablename__ = "slot_bookings"
    id = Column(Integer, primary_key=True, index=True)
    slot_id = Column(Integer, ForeignKey("volunteer_slots.id"))
    volunteer_id = Column(Integer, ForeignKey("volunteers.id"))
    booked_at = Column(DateTime, default=func.now())
    status = Column(String(50), default="CONFIRMED")
    slot = relationship("VolunteerSlot", back_populates="bookings")
    volunteer = relationship("Volunteer", back_populates="bookings")

class HourLog(Base):
    __tablename__ = "hour_logs"
    id = Column(Integer, primary_key=True, index=True)
    volunteer_id = Column(Integer, ForeignKey("volunteers.id"))
    booking_id = Column(Integer, ForeignKey("slot_bookings.id"), nullable=True)
    date = Column(Date)
    hours = Column(Float)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=func.now())
    volunteer = relationship("Volunteer", back_populates="hour_logs")
    booking = relationship("SlotBooking")

class Child(Base):
    __tablename__ = "children"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    dob = Column(Date)
    gender = Column(String(20))
    address = Column(Text)
    program = Column(String(100))
    branch = Column(String(100))
    guardian_name = Column(String(255))
    guardian_contact = Column(String(20))
    medical_notes = Column(Text, nullable=True)
    enrolled_at = Column(DateTime, default=func.now())
    is_active = Column(Boolean, default=True)
    created_by = Column(Integer, ForeignKey("users.id"))

class Donor(Base):
    __tablename__ = "donors"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    full_name = Column(String(255), nullable=False)
    pan_number = Column(String(20), nullable=True)
    email = Column(String(255), nullable=True)
    phone = Column(String(20), nullable=True)
    total_donated = Column(Float, default=0.0)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())
    donations = relationship("Donation", back_populates="donor")
    user = relationship("User")

class Donation(Base):
    __tablename__ = "donations"
    id = Column(Integer, primary_key=True, index=True)
    donor_id = Column(Integer, ForeignKey("donors.id"))
    amount = Column(Float, nullable=False)
    project = Column(String(255))
    payment_mode = Column(String(50))
    certificate_issued = Column(Boolean, default=False)
    donated_at = Column(DateTime, default=func.now())
    notes = Column(Text, nullable=True)
    razorpay_order_id = Column(String(255), nullable=True, index=True)
    razorpay_payment_id = Column(String(255), nullable=True, unique=True, index=True)
    donor = relationship("Donor", back_populates="donations")

class Employee(Base):
    __tablename__ = "employees"
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(255), nullable=False)
    role = Column(String(100))
    department = Column(String(100))
    joining_date = Column(Date)
    salary = Column(Float)
    contact = Column(String(20), nullable=True)
    status = Column(String(50), default="ACTIVE")
    documents_uploaded = Column(Text)
    created_at = Column(DateTime, default=func.now())
    attendances = relationship("Attendance", back_populates="employee")
    leaves = relationship("LeaveRequest", back_populates="employee")

class Attendance(Base):
    __tablename__ = "attendance"
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"))
    date = Column(Date)
    status = Column(String(50))
    employee = relationship("Employee", back_populates="attendances")

class LeaveRequest(Base):
    __tablename__ = "leave_requests"
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"))
    leave_type = Column(String(50))
    from_date = Column(Date)
    to_date = Column(Date)
    status = Column(String(50), default="PENDING")
    reason = Column(Text, nullable=True)
    applied_at = Column(DateTime, default=func.now())
    employee = relationship("Employee", back_populates="leaves")

class ComplianceRecord(Base):
    __tablename__ = "compliance_records"
    id = Column(Integer, primary_key=True, index=True)
    policy_name = Column(String(255), nullable=False)
    registration_id = Column(String(100), nullable=True)
    status = Column(String(50))
    last_filed = Column(Date, nullable=True)
    next_deadline = Column(Date, nullable=True)
    notes = Column(Text, nullable=True)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

class BlockchainLog(Base):
    __tablename__ = "blockchain_logs"
    id = Column(Integer, primary_key=True, index=True)
    tx_hash = Column(String(64), unique=True, index=True)
    record_type = Column(String(50))
    data_summary = Column(Text)
    previous_hash = Column(String(64))
    timestamp = Column(DateTime, default=func.now())
    is_verified = Column(Boolean, default=True)

class Announcement(Base):
    __tablename__ = "announcements"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    priority = Column(String(50), default="MEDIUM")
    target_skills = Column(Text, nullable=True)
    expiry_date = Column(Date, nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=func.now())
    creator = relationship("User")
    reads = relationship("AnnouncementRead", back_populates="announcement")

class AnnouncementRead(Base):
    __tablename__ = "announcement_reads"
    id = Column(Integer, primary_key=True, index=True)
    announcement_id = Column(Integer, ForeignKey("announcements.id"))
    volunteer_id = Column(Integer, ForeignKey("volunteers.id"))
    read_at = Column(DateTime, default=func.now())
    announcement = relationship("Announcement", back_populates="reads")
    volunteer = relationship("Volunteer")

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    type = Column(String(50))
    message = Column(Text)
    link = Column(String(500), nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())
    user = relationship("User")

class RoleAllowlist(Base):
    __tablename__ = "role_allowlist"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    assigned_role = Column(String(50), nullable=False)  # ADMIN, NGO_STAFF, VOLUNTEER
    notes = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
