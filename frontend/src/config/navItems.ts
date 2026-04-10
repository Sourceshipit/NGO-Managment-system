import {
  LayoutDashboard, Users, Baby, Heart, FileText, Briefcase, Link,
  User, Calendar, CheckSquare, Clock, TrendingUp, Bell, BarChart2, Megaphone, Award, Shield, ShieldCheck
} from 'lucide-react';

export interface NavItem {
  label: string;
  path: string;
  icon: any;
  restricted?: boolean;
  badge?: 'unread';
}

export interface NavGroup {
  section: string;
  items: NavItem[];
}

// ── Admin ────────────────────────────────────────────────────────────
export const ADMIN_NAV: NavGroup[] = [
  {
    section: 'Overview',
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard }
    ]
  },
  {
    section: 'Operations',
    items: [
      { label: 'Volunteers', path: '/volunteers', icon: Users },
      { label: 'Children', path: '/children', icon: Baby, restricted: true },
      { label: 'Donors', path: '/donors', icon: Heart }
    ]
  },
  {
    section: 'Compliance',
    items: [
      { label: 'Policies', path: '/policies', icon: FileText },
      { label: 'Staff', path: '/employees', icon: Briefcase, restricted: true },
      { label: 'Audit Trail', path: '/blockchain', icon: Link },
      { label: 'Access Control', path: '/access-control', icon: ShieldCheck, restricted: true }
    ]
  }
];

// ── Volunteer ────────────────────────────────────────────────────────
export const VOLUNTEER_NAV: NavGroup[] = [
  {
    section: 'My Space',
    items: [
      { label: 'Dashboard', path: '/volunteer/dashboard', icon: LayoutDashboard },
      { label: 'My Profile', path: '/volunteer/profile', icon: User },
    ]
  },
  {
    section: 'Opportunities',
    items: [
      { label: 'Browse Slots', path: '/volunteer/slots', icon: Calendar },
      { label: 'My Bookings', path: '/volunteer/bookings', icon: CheckSquare },
      { label: 'Log Hours', path: '/volunteer/hours', icon: Clock },
    ]
  },
  {
    section: 'Community',
    items: [
      { label: 'Impact Board', path: '/volunteer/impact', icon: TrendingUp },
      { label: 'Announcements', path: '/volunteer/announcements', icon: Bell, badge: 'unread' },
    ]
  }
];

// ── Staff ────────────────────────────────────────────────────────────
export const STAFF_NAV: NavGroup[] = [
  { section: 'Overview', items: [{ label: 'Dashboard', path: '/staff/dashboard', icon: LayoutDashboard }] },
  {
    section: 'Operations',
    items: [
      { label: 'Volunteers', path: '/staff/volunteers', icon: Users },
      { label: 'Children', path: '/staff/children', icon: Baby },
      { label: 'Donors', path: '/staff/donors', icon: Heart },
    ]
  },
  {
    section: 'Reporting',
    items: [
      { label: 'Compliance', path: '/staff/compliance', icon: FileText },
      { label: 'Reports', path: '/staff/reports', icon: BarChart2 },
      { label: 'Announcements', path: '/staff/announcements', icon: Megaphone },
    ]
  },
  { section: 'Account', items: [{ label: 'My Profile', path: '/staff/profile', icon: User }] },
];

// ── Donor ────────────────────────────────────────────────────────────
export const DONOR_NAV: NavGroup[] = [
  {
    section: 'My Portal',
    items: [
      { label: 'Dashboard', path: '/donor/dashboard', icon: LayoutDashboard },
      { label: 'My Donations', path: '/donor/donations', icon: Heart },
      { label: 'Certificates', path: '/donor/certificates', icon: Award },
      { label: 'Impact View', path: '/donor/impact', icon: TrendingUp },
      { label: 'My Profile', path: '/donor/profile', icon: User },
    ]
  }
];

// ── Role → Config Map ────────────────────────────────────────────────
export const ROLE_CONFIG = {
  ADMIN: {
    nav: ADMIN_NAV,
    accent: 'brand-primary',
    accentBg: 'bg-brand-primary',
    accentText: 'text-brand-primary',
    accentLight: 'bg-brand-primary-light',
    portalName: 'BeneTrack Admin',
    profilePath: '/settings',
    portalIcon: Shield,
  },
  VOLUNTEER: {
    nav: VOLUNTEER_NAV,
    accent: 'blue-600',
    accentBg: 'bg-blue-600',
    accentText: 'text-blue-600',
    accentLight: 'bg-blue-50',
    portalName: 'BeneTrack Volunteer',
    profilePath: '/volunteer/profile',
    portalIcon: Shield,
  },
  NGO_STAFF: {
    nav: STAFF_NAV,
    accent: 'emerald-600',
    accentBg: 'bg-emerald-600',
    accentText: 'text-emerald-600',
    accentLight: 'bg-emerald-50',
    portalName: 'BeneTrack Staff',
    profilePath: '/staff/profile',
    portalIcon: Shield,
  },
  DONOR: {
    nav: DONOR_NAV,
    accent: 'rose-600',
    accentBg: 'bg-rose-600',
    accentText: 'text-rose-600',
    accentLight: 'bg-rose-50',
    portalName: 'BeneTrack Donor',
    profilePath: '/donor/profile',
    portalIcon: Shield,
  }
} as const;
