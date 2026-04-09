from pydantic import BaseModel, ConfigDict, EmailStr, field_validator
from datetime import date, datetime
from typing import Optional, List

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None
    id: Optional[int] = None

class UserBase(BaseModel):
    email: str
    full_name: str
    role: str = "VOLUNTEER"
    is_active: bool = True

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    department: Optional[str] = None
    bio: Optional[str] = None

class UserResponse(UserBase):
    id: int
    phone: Optional[str] = None
    department: Optional[str] = None
    bio: Optional[str] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

class VolunteerBase(BaseModel):
    skills: str
    bio: Optional[str] = None
    status: str = "ACTIVE"

class VolunteerCreate(VolunteerBase):
    user_id: int

class VolunteerUpdate(BaseModel):
    skills: Optional[str] = None
    bio: Optional[str] = None

class VolunteerResponse(VolunteerBase):
    id: int
    user_id: int
    total_hours: float
    joined_at: datetime
    user: UserResponse
    model_config = ConfigDict(from_attributes=True)

class VolunteerSlotBase(BaseModel):
    task_name: str
    description: str
    date: date
    time: str
    location: str
    required_skills: str
    max_volunteers: int = 5

class VolunteerSlotCreate(VolunteerSlotBase):
    pass

class VolunteerSlotUpdate(BaseModel):
    task_name: Optional[str] = None
    description: Optional[str] = None
    date: Optional[date] = None
    time: Optional[str] = None
    location: Optional[str] = None
    required_skills: Optional[str] = None
    max_volunteers: Optional[int] = None
    is_active: Optional[bool] = None

class VolunteerSlotResponse(VolunteerSlotBase):
    id: int
    booked_count: int
    posted_by: int
    is_active: bool
    created_at: datetime
    poster_name: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class SlotBookingBase(BaseModel):
    slot_id: int
    volunteer_id: int

class SlotBookingResponse(SlotBookingBase):
    id: int
    booked_at: datetime
    status: str
    slot_task_name: Optional[str] = None
    slot_date: Optional[date] = None
    slot_time: Optional[str] = None
    slot_location: Optional[str] = None
    volunteer_name: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class HourLogBase(BaseModel):
    date: date
    hours: float
    description: Optional[str] = None
    booking_id: Optional[int] = None

class HourLogCreate(HourLogBase):
    pass

class HourLogResponse(HourLogBase):
    id: int
    volunteer_id: int
    created_at: datetime
    slot_task_name: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class ChildBase(BaseModel):
    name: str
    dob: date
    gender: str
    address: str
    program: str
    branch: str
    guardian_name: str
    guardian_contact: str
    medical_notes: Optional[str] = None
    is_active: bool = True

class ChildCreate(ChildBase):
    pass

class ChildResponse(ChildBase):
    id: int
    enrolled_at: datetime
    created_by: int
    created_by_name: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class DonorBase(BaseModel):
    full_name: str
    pan_number: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    is_verified: bool = False

class DonorCreate(DonorBase):
    pass

class DonorUpdate(BaseModel):
    full_name: Optional[str] = None
    pan_number: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    is_verified: Optional[bool] = None

class DonorResponse(DonorBase):
    id: int
    user_id: Optional[int] = None
    total_donated: float
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class DonationBase(BaseModel):
    amount: float
    project: str
    payment_mode: str
    notes: Optional[str] = None

class DonationCreate(DonationBase):
    donor_id: int

class DonationResponse(DonationBase):
    id: int
    donor_id: int
    certificate_issued: bool
    donated_at: datetime
    donor_name: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class EmployeeBase(BaseModel):
    full_name: str
    role: str
    department: str
    joining_date: date
    salary: float
    contact: Optional[str] = None
    status: str = "ACTIVE"
    documents_uploaded: str

class EmployeeCreate(EmployeeBase):
    pass

class EmployeeResponse(EmployeeBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class AttendanceBase(BaseModel):
    date: date
    status: str

class AttendanceCreate(AttendanceBase):
    employee_id: int

class AttendanceResponse(AttendanceBase):
    id: int
    employee_id: int
    model_config = ConfigDict(from_attributes=True)

class LeaveRequestBase(BaseModel):
    leave_type: str
    from_date: date
    to_date: date
    reason: Optional[str] = None

class LeaveRequestCreate(LeaveRequestBase):
    employee_id: int

class LeaveRequestResponse(LeaveRequestBase):
    id: int
    employee_id: int
    status: str
    applied_at: datetime
    employee_name: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class ComplianceRecordBase(BaseModel):
    policy_name: str
    registration_id: Optional[str] = None
    status: str
    last_filed: Optional[date] = None
    next_deadline: Optional[date] = None
    notes: Optional[str] = None

class ComplianceRecordCreate(ComplianceRecordBase):
    pass

class ComplianceRecordResponse(ComplianceRecordBase):
    id: int
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

class BlockchainLogResponse(BaseModel):
    id: int
    tx_hash: str
    record_type: str
    data_summary: str
    previous_hash: str
    timestamp: datetime
    is_verified: bool
    model_config = ConfigDict(from_attributes=True)

class BlockchainPaginated(BaseModel):
    items: List[BlockchainLogResponse]
    total: int

class AnnouncementBase(BaseModel):
    title: str
    content: str
    priority: str = "MEDIUM"
    target_skills: Optional[str] = None
    expiry_date: Optional[date] = None

class AnnouncementCreate(AnnouncementBase):
    pass

class AnnouncementResponse(AnnouncementBase):
    id: int
    created_by: int
    created_at: datetime
    creator_name: Optional[str] = None
    read_count: int = 0
    is_read: bool = False
    model_config = ConfigDict(from_attributes=True)

class NotificationBase(BaseModel):
    type: str
    message: str
    link: Optional[str] = None

class NotificationCreate(NotificationBase):
    user_id: int

class NotificationResponse(NotificationBase):
    id: int
    user_id: int
    is_read: bool
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class MonthlyDonation(BaseModel):
    month: str
    amount: float

class FundBreakdown(BaseModel):
    name: str
    value: float

class ActivityItem(BaseModel):
    text: str
    time: str
    type: str

class DashboardStats(BaseModel):
    total_donations_amount: float
    total_donations_count: int
    active_volunteers: int
    children_enrolled: int
    compliance_score: int
    monthly_donations: List[MonthlyDonation]
    fund_breakdown: List[FundBreakdown]
    recent_donations: List[DonationResponse]
    recent_activity: List[ActivityItem]

class ChainVerifyResponse(BaseModel):
    valid: bool
    total: int
    broken_at: Optional[int] = None

class SearchResults(BaseModel):
    volunteers: List[dict] = []
    children: List[dict] = []
    donors: List[dict] = []
    employees: List[dict] = []

class RoleAllowlistCreate(BaseModel):
    email: EmailStr
    assigned_role: str
    notes: Optional[str] = None

    @field_validator('assigned_role')
    @classmethod
    def validate_role(cls, v):
        allowed = {"ADMIN", "NGO_STAFF", "VOLUNTEER"}
        if v not in allowed:
            raise ValueError(f"assigned_role must be one of {allowed}")
        return v

class RoleAllowlistUpdate(BaseModel):
    assigned_role: Optional[str] = None
    notes: Optional[str] = None

    @field_validator('assigned_role')
    @classmethod
    def validate_role(cls, v):
        if v is not None:
            allowed = {"ADMIN", "NGO_STAFF", "VOLUNTEER"}
            if v not in allowed:
                raise ValueError(f"assigned_role must be one of {allowed}")
        return v

class RoleAllowlistResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    email: str
    assigned_role: str
    notes: Optional[str]
    created_at: datetime
