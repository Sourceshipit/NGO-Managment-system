from sqlalchemy import Boolean, Column, Integer, Float, String, Date, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(String, default="VOLUNTEER")
    is_active = Column(Boolean, default=True)
    phone = Column(String, nullable=True)
    department = Column(String, nullable=True)
    bio = Column(Text, nullable=True)
    created_at = Column(DateTime, default=func.now())

class Volunteer(Base):
    __tablename__ = "volunteers"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    skills = Column(Text)
    bio = Column(Text, nullable=True)
    total_hours = Column(Float, default=0.0)
    status = Column(String, default="ACTIVE")
    joined_at = Column(DateTime, default=func.now())
    user = relationship("User")
    bookings = relationship("SlotBooking", back_populates="volunteer")
    hour_logs = relationship("HourLog", back_populates="volunteer")

class VolunteerSlot(Base):
    __tablename__ = "volunteer_slots"
    id = Column(Integer, primary_key=True, index=True)
    task_name = Column(String, nullable=False)
    description = Column(Text)
    date = Column(Date)
    time = Column(String)
    location = Column(String)
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
    status = Column(String, default="CONFIRMED")
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
    name = Column(String, nullable=False)
    dob = Column(Date)
    gender = Column(String)
    address = Column(Text)
    program = Column(String)
    branch = Column(String)
    guardian_name = Column(String)
    guardian_contact = Column(String)
    medical_notes = Column(Text, nullable=True)
    enrolled_at = Column(DateTime, default=func.now())
    is_active = Column(Boolean, default=True)
    created_by = Column(Integer, ForeignKey("users.id"))

class Donor(Base):
    __tablename__ = "donors"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    full_name = Column(String, nullable=False)
    pan_number = Column(String, nullable=True)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
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
    project = Column(String)
    payment_mode = Column(String)
    certificate_issued = Column(Boolean, default=False)
    donated_at = Column(DateTime, default=func.now())
    notes = Column(Text, nullable=True)
    razorpay_order_id = Column(String, nullable=True, index=True)
    razorpay_payment_id = Column(String, nullable=True, unique=True, index=True)
    donor = relationship("Donor", back_populates="donations")

class Employee(Base):
    __tablename__ = "employees"
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    role = Column(String)
    department = Column(String)
    joining_date = Column(Date)
    salary = Column(Float)
    contact = Column(String, nullable=True)
    status = Column(String, default="ACTIVE")
    documents_uploaded = Column(Text)
    created_at = Column(DateTime, default=func.now())
    attendances = relationship("Attendance", back_populates="employee")
    leaves = relationship("LeaveRequest", back_populates="employee")

class Attendance(Base):
    __tablename__ = "attendance"
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"))
    date = Column(Date)
    status = Column(String)
    employee = relationship("Employee", back_populates="attendances")

class LeaveRequest(Base):
    __tablename__ = "leave_requests"
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"))
    leave_type = Column(String)
    from_date = Column(Date)
    to_date = Column(Date)
    status = Column(String, default="PENDING")
    reason = Column(Text, nullable=True)
    applied_at = Column(DateTime, default=func.now())
    employee = relationship("Employee", back_populates="leaves")

class ComplianceRecord(Base):
    __tablename__ = "compliance_records"
    id = Column(Integer, primary_key=True, index=True)
    policy_name = Column(String, nullable=False)
    registration_id = Column(String, nullable=True)
    status = Column(String)
    last_filed = Column(Date, nullable=True)
    next_deadline = Column(Date, nullable=True)
    notes = Column(Text, nullable=True)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

class BlockchainLog(Base):
    __tablename__ = "blockchain_logs"
    id = Column(Integer, primary_key=True, index=True)
    tx_hash = Column(String, unique=True, index=True)
    record_type = Column(String)
    data_summary = Column(Text)
    previous_hash = Column(String)
    timestamp = Column(DateTime, default=func.now())
    is_verified = Column(Boolean, default=True)

class Announcement(Base):
    __tablename__ = "announcements"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    priority = Column(String, default="MEDIUM")
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
    type = Column(String)
    message = Column(Text)
    link = Column(String, nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())
    user = relationship("User")

class RoleAllowlist(Base):
    __tablename__ = "role_allowlist"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    assigned_role = Column(String, nullable=False)  # ADMIN, NGO_STAFF, VOLUNTEER
    notes = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
