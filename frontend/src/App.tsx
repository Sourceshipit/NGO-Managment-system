import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import { RequireAuth, RequireRole, RedirectIfAuth } from './components/ProtectedRoute';
import LoadingSpinner from './components/UI/LoadingSpinner';
import CommandPalette from './components/CommandPalette';
import ErrorBoundary from './components/ErrorBoundary';

// ── Layouts (kept eager — they are thin wrappers) ────────────────────
import AdminLayout from './components/Layout/Layout';
import VolunteerLayout from './pages/volunteer/Layout';
import StaffLayout from './pages/staff/Layout';
import DonorLayout from './pages/donor/Layout';

// ── Auth / Public (eager — first paint) ──────────────────────────────
const Login = lazy(() => import('./pages/Login'));
const Landing = lazy(() => import('./pages/Landing'));
const NotFound = lazy(() => import('./pages/NotFound'));

// ── Admin Pages ──────────────────────────────────────────────────────
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Volunteers = lazy(() => import('./pages/Volunteers'));
const Children = lazy(() => import('./pages/Children'));
const Donors = lazy(() => import('./pages/Donors'));
const Policies = lazy(() => import('./pages/Policies'));
const Employees = lazy(() => import('./pages/Employees'));
const Blockchain = lazy(() => import('./pages/Blockchain'));
const AccessControl = lazy(() => import('./pages/AccessControl'));

// ── Volunteer Pages ──────────────────────────────────────────────────
const VolunteerDashboard = lazy(() => import('./pages/volunteer/Dashboard'));
const VolunteerSlots = lazy(() => import('./pages/volunteer/Slots'));
const VolunteerBookings = lazy(() => import('./pages/volunteer/Bookings'));
const VolunteerHours = lazy(() => import('./pages/volunteer/Hours'));
const VolunteerProfile = lazy(() => import('./pages/volunteer/Profile'));
const VolunteerImpact = lazy(() => import('./pages/volunteer/Impact'));
const VolunteerAnnouncements = lazy(() => import('./pages/volunteer/Announcements'));

// ── Staff Pages ──────────────────────────────────────────────────────
const StaffDashboard = lazy(() => import('./pages/staff/Dashboard'));
const StaffVolunteers = lazy(() => import('./pages/staff/Volunteers'));
const StaffChildren = lazy(() => import('./pages/staff/Children'));
const StaffDonors = lazy(() => import('./pages/staff/Donors'));
const StaffCompliance = lazy(() => import('./pages/staff/Compliance'));
const StaffReports = lazy(() => import('./pages/staff/Reports'));
const StaffAnnouncements = lazy(() => import('./pages/staff/Announcements'));
const StaffProfile = lazy(() => import('./pages/staff/Profile'));
const StaffRequirements = lazy(() => import('./pages/staff/Requirements'));

// ── Donor Pages ──────────────────────────────────────────────────────
const DonorDashboard = lazy(() => import('./pages/donor/Dashboard'));
const DonorDonations = lazy(() => import('./pages/donor/Donations'));
const DonorCertificates = lazy(() => import('./pages/donor/Certificates'));
const DonorImpact = lazy(() => import('./pages/donor/Impact'));
const DonorProfile = lazy(() => import('./pages/donor/Profile'));
const DonorRequirements = lazy(() => import('./pages/donor/Requirements'));

// ── Shared Pages ─────────────────────────────────────────────────────
const SearchPage = lazy(() => import('./pages/shared/Search'));
const NotificationsPage = lazy(() => import('./pages/shared/Notifications'));
const SettingsPage = lazy(() => import('./pages/shared/Settings'));

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{
          duration: 3000,
          style: {
            background: '#FFFFFF',
            color: '#1E293B',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            padding: '12px 16px',
            fontSize: '14px',
            fontFamily: 'DM Sans, sans-serif',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          },
          success: {
            iconTheme: { primary: '#16A34A', secondary: '#FFFFFF' },
          },
          error: {
            iconTheme: { primary: '#DC2626', secondary: '#FFFFFF' },
          },
        }} />

        <CommandPalette />
        <ErrorBoundary fallbackTitle="Something went wrong">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<RedirectIfAuth><Login /></RedirectIfAuth>} />

            {/* Admin Routes */}
            <Route element={<RequireAuth><RequireRole roles={['ADMIN']}><AdminLayout /></RequireRole></RequireAuth>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/volunteers" element={<Volunteers />} />
              <Route path="/children" element={<Children />} />
              <Route path="/donors" element={<Donors />} />
              <Route path="/policies" element={<Policies />} />
              <Route path="/employees" element={<Employees />} />
              <Route path="/blockchain" element={<Blockchain />} />
              <Route path="/access-control" element={<AccessControl />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            {/* Volunteer Routes */}
            <Route path="/volunteer" element={<RequireAuth><RequireRole roles={['VOLUNTEER']}><VolunteerLayout /></RequireRole></RequireAuth>}>
              <Route path="dashboard" element={<VolunteerDashboard />} />
              <Route path="slots" element={<VolunteerSlots />} />
              <Route path="bookings" element={<VolunteerBookings />} />
              <Route path="hours" element={<VolunteerHours />} />
              <Route path="profile" element={<VolunteerProfile />} />
              <Route path="impact" element={<VolunteerImpact />} />
              <Route path="announcements" element={<VolunteerAnnouncements />} />
              <Route path="search" element={<SearchPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Staff Routes */}
            <Route path="/staff" element={<RequireAuth><RequireRole roles={['NGO_STAFF']}><StaffLayout /></RequireRole></RequireAuth>}>
              <Route path="dashboard" element={<StaffDashboard />} />
              <Route path="volunteers" element={<StaffVolunteers />} />
              <Route path="children" element={<StaffChildren />} />
              <Route path="donors" element={<StaffDonors />} />
              <Route path="compliance" element={<StaffCompliance />} />
              <Route path="reports" element={<StaffReports />} />
              <Route path="announcements" element={<StaffAnnouncements />} />
              <Route path="requirements" element={<StaffRequirements />} />
              <Route path="profile" element={<StaffProfile />} />
              <Route path="search" element={<SearchPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Donor Routes */}
            <Route path="/donor" element={<RequireAuth><RequireRole roles={['DONOR']}><DonorLayout /></RequireRole></RequireAuth>}>
              <Route path="dashboard" element={<DonorDashboard />} />
              <Route path="donations" element={<DonorDonations />} />
              <Route path="certificates" element={<DonorCertificates />} />
              <Route path="impact" element={<DonorImpact />} />
              <Route path="profile" element={<DonorProfile />} />
              <Route path="requirements" element={<DonorRequirements />} />
              <Route path="search" element={<SearchPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Landing Page */}
            <Route path="/" element={<Landing />} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
