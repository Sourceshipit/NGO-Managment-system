export interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  phone?: string;
  department?: string;
  bio?: string;
  created_at: string;
}

export interface Volunteer {
  id: number;
  user_id: number;
  skills: string;
  bio: string | null;
  total_hours: number;
  status: string;
  joined_at: string;
  user: User;
}

export interface VolunteerSlot {
  id: number;
  task_name: string;
  description: string;
  date: string;
  time: string;
  location: string;
  required_skills: string;
  max_volunteers: number;
  booked_count: number;
  posted_by: number;
  is_active: boolean;
  created_at: string;
  poster_name?: string;
}

export interface SlotBooking {
  id: number;
  slot_id: number;
  volunteer_id: number;
  booked_at: string;
  status: string;
  slot_task_name?: string;
  slot_date?: string;
  slot_time?: string;
  slot_location?: string;
  volunteer_name?: string;
}

export interface HourLog {
  id: number;
  volunteer_id: number;
  booking_id: number | null;
  date: string;
  hours: number;
  description: string | null;
  created_at: string;
  slot_task_name?: string;
}

export interface Child {
  id: number;
  name: string;
  dob: string;
  gender: string;
  address: string;
  program: string;
  branch: string;
  guardian_name: string;
  guardian_contact: string;
  medical_notes: string | null;
  enrolled_at: string;
  is_active: boolean;
  created_by: number;
  created_by_name?: string;
}

export interface Donor {
  id: number;
  user_id: number | null;
  full_name: string;
  pan_number: string | null;
  email: string | null;
  phone: string | null;
  total_donated: number;
  is_verified: boolean;
  created_at: string;
}

export interface Donation {
  id: number;
  donor_id: number;
  amount: number;
  project: string;
  payment_mode: string;
  certificate_issued: boolean;
  donated_at: string;
  notes: string | null;
  donor_name?: string;
}

export interface Employee {
  id: number;
  full_name: string;
  role: string;
  department: string;
  joining_date: string;
  salary: number;
  contact: string | null;
  status: string;
  documents_uploaded: string;
  created_at: string;
}

export interface Attendance {
  id: number;
  employee_id: number;
  date: string;
  status: string;
}

export interface LeaveRequest {
  id: number;
  employee_id: number;
  leave_type: string;
  from_date: string;
  to_date: string;
  status: string;
  reason: string | null;
  applied_at: string;
  employee_name?: string;
}

export interface ComplianceRecord {
  id: number;
  policy_name: string;
  registration_id: string | null;
  status: string;
  last_filed: string | null;
  next_deadline: string | null;
  notes: string | null;
  updated_at: string;
}

export interface BlockchainLog {
  id: number;
  tx_hash: string;
  record_type: string;
  data_summary: string;
  previous_hash: string;
  timestamp: string;
  is_verified: boolean;
}

export interface Announcement {
  id: number;
  title: string;
  content: string;
  priority: string;
  target_skills: string | null;
  expiry_date: string | null;
  created_by: number;
  created_at: string;
  creator_name?: string;
  read_count: number;
  is_read: boolean;
}

export interface AppNotification {
  id: number;
  user_id: number;
  type: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export interface VolunteerStats {
  total_hours: number;
  total_bookings: number;
  confirmed_bookings: number;
  upcoming_slots: number;
  impact_score: number;
  next_milestone: number;
  volunteer_id: number;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  hours: number;
  slots: number;
  impact_score: number;
}

export interface MonthlyDonation {
  month: string;
  amount: number;
}

export interface FundBreakdown {
  name: string;
  value: number;
}

export interface ActivityItem {
  text: string;
  time: string;
  type: string;
}

export interface DashboardStats {
  total_donations_amount: number;
  total_donations_count: number;
  active_volunteers: number;
  children_enrolled: number;
  compliance_score: number;
  monthly_donations: MonthlyDonation[];
  fund_breakdown: FundBreakdown[];
  recent_donations: Donation[];
  recent_activity: ActivityItem[];
}

export interface ChainVerifyResponse {
  valid: boolean;
  total: number;
  broken_at: number | null;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface SearchResults {
  volunteers: Array<{id:number; name:string; skills:string; total_hours:number}>;
  children: Array<{id:number; masked_name:string; program:string; branch:string}>;
  donors: Array<{id:number; name:string; total_donated:number}>;
  employees: Array<{id:number; name:string; role:string; department:string}>;
}

export interface RoleAllowlistEntry {
  id: number;
  email: string;
  assigned_role: 'ADMIN' | 'NGO_STAFF' | 'VOLUNTEER';
  notes?: string;
  created_at: string;
}

export interface DonationResult {
  donation_id: number;
  amount: number;
  project: string;
  message: string;
}

// ── Razorpay Payment Types ───────────────────────────────────────────

export interface RazorpayOrder {
  order_id: string;
  amount: number;      // in paise
  currency: string;
  key_id: string;
  donor_name: string;
  donor_email: string;
  donor_phone: string;
}

export interface RazorpayPaymentSuccess {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayVerifyResult {
  status: string;
  donation_id: number;
  amount: number;
  project: string;
  razorpay_payment_id?: string;
  message: string;
}

// Global Razorpay Checkout constructor (loaded via <script> tag)
declare global {
  interface Window {
    Razorpay: new (options: RazorpayCheckoutOptions) => RazorpayCheckoutInstance;
  }
}

export interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  handler: (response: RazorpayPaymentSuccess) => void;
  modal?: {
    ondismiss?: () => void;
  };
}

export interface RazorpayCheckoutInstance {
  open: () => void;
  close: () => void;
}
