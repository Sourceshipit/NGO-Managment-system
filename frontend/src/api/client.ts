import axios from 'axios';
import type { 
  User, Volunteer, VolunteerSlot, SlotBooking, Child, 
  Donor, Donation, Employee, Attendance, LeaveRequest, 
  ComplianceRecord, BlockchainLog, DashboardStats, 
  ChainVerifyResponse, LoginResponse, HourLog, Announcement,
  AppNotification, VolunteerStats, LeaderboardEntry, SearchResults,
  RoleAllowlistEntry, DonationResult, RazorpayOrder, RazorpayVerifyResult
} from '../types';

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true  // Always send cookies for refresh token
});

// ── In-Memory Token Management ───────────────────────────────────────
let _accessToken = '';

/** Called by AuthContext to set the current access token */
export function setAccessToken(token: string) {
  _accessToken = token;
}

api.interceptors.request.use((config) => {
  if (_accessToken) {
    config.headers.Authorization = `Bearer ${_accessToken}`;
  }
  return config;
});

// ── 401 Interceptor: Silent Refresh Retry ────────────────────────────
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (token) prom.resolve(token);
    else prom.reject(error);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Don't retry the refresh endpoint itself, or the login endpoints
    if (
      error.response?.status === 401 && 
      !originalRequest._retry && 
      !originalRequest.url?.includes('/auth/refresh') &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/google')
    ) {
      if (isRefreshing) {
        // Queue this request until the refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            },
            reject: (err: any) => reject(err)
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post('/api/auth/refresh', {}, { withCredentials: true });
        const newToken = res.data.access_token;
        _accessToken = newToken;
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        _accessToken = '';
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const res = await api.post<LoginResponse>('/auth/login', { email, password });
    return res.data;
  },
  googleLogin: async (credential: string): Promise<LoginResponse> => {
    const res = await api.post<LoginResponse>('/auth/google', { credential });
    return res.data;
  },
  me: async (): Promise<User> => {
    const res = await api.get<User>('/auth/me');
    return res.data;
  },
  changePassword: async (current_password: string, new_password: string) => {
    const res = await api.post('/auth/change-password', { current_password, new_password });
    return res.data;
  }
};

export const dashboardAPI = {
  getStats: async (): Promise<DashboardStats> => {
    const res = await api.get<DashboardStats>('/dashboard/stats');
    return res.data;
  }
};

export const volunteersAPI = {
  getAll: async (): Promise<Volunteer[]> => {
    const res = await api.get<Volunteer[]>('/volunteers');
    return res.data;
  },
  get: async (id: number): Promise<Volunteer> => {
    const res = await api.get<Volunteer>(`/volunteers/${id}`);
    return res.data;
  },
  update: async (id: number, data: any): Promise<Volunteer> => {
    const res = await api.put<Volunteer>(`/volunteers/${id}`, data);
    return res.data;
  },
  getSlots: async (all: boolean = false): Promise<VolunteerSlot[]> => {
    const res = await api.get<VolunteerSlot[]>(`/slots?all=${all}`);
    return res.data;
  },
  createSlot: async (data: any): Promise<VolunteerSlot> => {
    const res = await api.post<VolunteerSlot>('/slots', data);
    return res.data;
  },
  updateSlot: async (id: number, data: any): Promise<VolunteerSlot> => {
    const res = await api.put<VolunteerSlot>(`/slots/${id}`, data);
    return res.data;
  },
  deleteSlot: async (id: number) => {
    const res = await api.delete(`/slots/${id}`);
    return res.data;
  },
  bookSlot: async (id: number): Promise<SlotBooking> => {
    const res = await api.post<SlotBooking>(`/slots/${id}/book`);
    return res.data;
  },
  getSlotBookings: async (id: number): Promise<SlotBooking[]> => {
    const res = await api.get<SlotBooking[]>(`/slots/${id}/bookings`);
    return res.data;
  },
  cancelBooking: async (slotId: number, bookingId: number) => {
    const res = await api.delete(`/slots/${slotId}/bookings/${bookingId}`);
    return res.data;
  },
  getLeaderboard: async (): Promise<LeaderboardEntry[]> => {
    const res = await api.get<LeaderboardEntry[]>('/volunteers/leaderboard');
    return res.data;
  },
  getMyBookings: async (status?: string): Promise<SlotBooking[]> => {
    const url = status ? `/volunteer/bookings?status=${status}` : '/volunteer/bookings';
    const res = await api.get<SlotBooking[]>(url);
    return res.data;
  },
  getMyStats: async (): Promise<VolunteerStats> => {
    const res = await api.get<VolunteerStats>('/volunteer/stats');
    return res.data;
  },
  getMyHours: async (): Promise<HourLog[]> => {
    const res = await api.get<HourLog[]>('/volunteer/hours');
    return res.data;
  },
  logHours: async (data: any): Promise<HourLog> => {
    const res = await api.post<HourLog>('/volunteer/hours', data);
    return res.data;
  },
  deleteHourLog: async (id: number) => {
    const res = await api.delete(`/volunteer/hours/${id}`);
    return res.data;
  },
  updateMyProfile: async (data: any) => {
    const res = await api.put('/volunteer/profile', data);
    return res.data;
  }
};

export const childrenAPI = {
  getAll: async (): Promise<Child[]> => {
    const res = await api.get<Child[]>('/children/');
    return res.data;
  },
  create: async (data: any): Promise<Child> => {
    const res = await api.post<Child>('/children/', data);
    return res.data;
  },
  update: async (id: number, data: any): Promise<Child> => {
    const res = await api.put<Child>(`/children/${id}`, data);
    return res.data;
  },
  remove: async (id: number): Promise<void> => {
    await api.delete(`/children/${id}`);
  }
};

export const donorsAPI = {
  getAll: async (): Promise<Donor[]> => {
    const res = await api.get<Donor[]>('/donors');
    return res.data;
  },
  create: async (data: any): Promise<Donor> => {
    const res = await api.post<Donor>('/donors', data);
    return res.data;
  },
  update: async (id: number, data: any): Promise<Donor> => {
    const res = await api.put<Donor>(`/donors/${id}`, data);
    return res.data;
  },
  getDonations: async (): Promise<Donation[]> => {
    const res = await api.get<Donation[]>('/donations');
    return res.data;
  },
  createDonation: async (data: any): Promise<Donation> => {
    const res = await api.post<Donation>('/donations', data);
    return res.data;
  },
  getCertificate: async (id: number): Promise<string> => {
    const res = await api.get<string>(`/donations/${id}/certificate`);
    return res.data;
  },
  selfDonate: (data: { amount: number; project: string; payment_mode: string }): Promise<DonationResult> =>
    api.post('/donor/donate', data).then(r => r.data),
};

export const employeesAPI = {
  getAll: async (): Promise<Employee[]> => {
    const res = await api.get<Employee[]>('/employees');
    return res.data;
  },
  create: async (data: any): Promise<Employee> => {
    const res = await api.post<Employee>('/employees', data);
    return res.data;
  },
  update: async (id: number, data: any): Promise<Employee> => {
    const res = await api.put<Employee>(`/employees/${id}`, data);
    return res.data;
  },
  getAttendance: async (id: number, month: number, year: number): Promise<Attendance[]> => {
    const res = await api.get<Attendance[]>(`/attendance/${id}?month=${month}&year=${year}`);
    return res.data;
  },
  markAttendance: async (data: any): Promise<Attendance> => {
    const res = await api.post<Attendance>('/attendance', data);
    return res.data;
  },
  getLeaves: async (): Promise<LeaveRequest[]> => {
    const res = await api.get<LeaveRequest[]>('/leaves');
    return res.data;
  },
  submitLeave: async (data: any): Promise<LeaveRequest> => {
    const res = await api.post<LeaveRequest>('/leaves', data);
    return res.data;
  },
  updateLeave: async (id: number, status: string): Promise<LeaveRequest> => {
    const res = await api.put<LeaveRequest>(`/leaves/${id}?status=${status}`);
    return res.data;
  },
  getPayroll: async (): Promise<any> => {
    const res = await api.get<any>('/employees/payroll');
    return res.data;
  }
};

export const complianceAPI = {
  getAll: async (): Promise<ComplianceRecord[]> => {
    const res = await api.get<ComplianceRecord[]>('/compliance/');
    return res.data;
  },
  update: async (id: number, data: any): Promise<ComplianceRecord> => {
    const res = await api.put<ComplianceRecord>(`/compliance/${id}`, data);
    return res.data;
  },
  getReport: async (): Promise<string> => {
    const res = await api.post<string>('/compliance/report');
    return res.data;
  }
};

export const blockchainAPI = {
  getAll: async (page: number = 1, type?: string): Promise<{items: BlockchainLog[], total: number}> => {
    const url = type ? `/blockchain/?page=${page}&record_type=${type}` : `/blockchain/?page=${page}`;
    const res = await api.get<{items: BlockchainLog[], total: number}>(url);
    return res.data;
  },
  verify: async (): Promise<ChainVerifyResponse> => {
    const res = await api.get<ChainVerifyResponse>('/blockchain/verify');
    return res.data;
  }
};

export const announcementsAPI = {
  getAll: async (): Promise<Announcement[]> => {
    const res = await api.get<Announcement[]>('/announcements/');
    return res.data;
  },
  create: async (data: any): Promise<Announcement> => {
    const res = await api.post<Announcement>('/announcements/', data);
    return res.data;
  },
  update: async (id: number, data: any): Promise<Announcement> => {
    const res = await api.put<Announcement>(`/announcements/${id}`, data);
    return res.data;
  },
  remove: async (id: number) => {
    const res = await api.delete(`/announcements/${id}`);
    return res.data;
  },
  markRead: async (id: number) => {
    const res = await api.post(`/announcements/${id}/read`);
    return res.data;
  },
  getReaders: async (id: number) => {
    const res = await api.get(`/announcements/${id}/readers`);
    return res.data;
  }
};

export const notificationsAPI = {
  getAll: async (): Promise<AppNotification[]> => {
    const res = await api.get<AppNotification[]>('/notifications/');
    return res.data;
  },
  getUnreadCount: async (): Promise<{count: number}> => {
    const res = await api.get<{count: number}>('/notifications/unread-count');
    return res.data;
  },
  markAllRead: async () => {
    const res = await api.put('/notifications/read-all');
    return res.data;
  },
  markRead: async (id: number) => {
    const res = await api.put(`/notifications/${id}/read`);
    return res.data;
  },
  remove: async (id: number) => {
    const res = await api.delete(`/notifications/${id}`);
    return res.data;
  }
};

export const usersAPI = {
  getAll: async (): Promise<User[]> => {
    const res = await api.get<User[]>('/users/');
    return res.data;
  },
  update: async (id: number, data: any): Promise<User> => {
    const res = await api.put<User>(`/users/${id}`, data);
    return res.data;
  },
  toggle: async (id: number) => {
    const res = await api.put(`/users/${id}/toggle`);
    return res.data;
  }
};

export const searchAPI = {
  search: async (q: string): Promise<SearchResults> => {
    const res = await api.get<SearchResults>(`/search?q=${encodeURIComponent(q)}`);
    return res.data;
  }
};

export const allowlistAPI = {
  getAll: (): Promise<RoleAllowlistEntry[]> =>
    api.get('/allowlist').then(r => r.data),
  create: (data: { email: string; assigned_role: string; notes?: string }): Promise<RoleAllowlistEntry> =>
    api.post('/allowlist', data).then(r => r.data),
  update: (id: number, data: { assigned_role?: string; notes?: string }): Promise<RoleAllowlistEntry> =>
    api.put(`/allowlist/${id}`, data).then(r => r.data),
  remove: (id: number): Promise<void> =>
    api.delete(`/allowlist/${id}`).then(r => r.data),
};

export const paymentsAPI = {
  createOrder: (data: { amount: number; project: string; notes?: string }): Promise<RazorpayOrder> =>
    api.post('/payments/create-order', data).then(r => r.data),
  verifyPayment: (data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    project: string;
    amount: number;
    notes?: string;
  }): Promise<RazorpayVerifyResult> =>
    api.post('/payments/verify', data).then(r => r.data),
};
