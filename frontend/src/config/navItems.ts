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
    section: 'SYS_OVERVIEW',
    items: [
      { label: 'DASHBOARD', path: '/dashboard', icon: LayoutDashboard }
    ]
  },
  {
    section: 'OPERATIONS',
    items: [
      { label: 'VOLUNTEERS', path: '/volunteers', icon: Users },
      { label: 'CHILD_RECORDS', path: '/children', icon: Baby, restricted: true },
      { label: 'DONOR_LEDGER', path: '/donors', icon: Heart }
    ]
  },
  {
    section: 'COMPLIANCE',
    items: [
      { label: 'GOVT_POLICIES', path: '/policies', icon: FileText },
      { label: 'STAFF_NODES', path: '/employees', icon: Briefcase, restricted: true },
      { label: 'BLOCKCHAIN', path: '/blockchain', icon: Link },
      { label: 'ACCESS CONTROL', path: '/access-control', icon: ShieldCheck, restricted: true }
    ]
  }
];

// ── Volunteer ────────────────────────────────────────────────────────
export const VOLUNTEER_NAV: NavGroup[] = [
  {
    section: 'MY SPACE',
    items: [
      { label: 'My Dashboard', path: '/volunteer/dashboard', icon: LayoutDashboard },
      { label: 'My Profile', path: '/volunteer/profile', icon: User },
    ]
  },
  {
    section: 'OPPORTUNITIES',
    items: [
      { label: 'Browse Slots', path: '/volunteer/slots', icon: Calendar },
      { label: 'My Bookings', path: '/volunteer/bookings', icon: CheckSquare },
      { label: 'Log Hours', path: '/volunteer/hours', icon: Clock },
    ]
  },
  {
    section: 'COMMUNITY',
    items: [
      { label: 'Impact Board', path: '/volunteer/impact', icon: TrendingUp },
      { label: 'Announcements', path: '/volunteer/announcements', icon: Bell, badge: 'unread' },
    ]
  }
];

// ── Staff ────────────────────────────────────────────────────────────
export const STAFF_NAV: NavGroup[] = [
  { section: 'OVERVIEW', items: [{ label: 'Staff Dashboard', path: '/staff/dashboard', icon: LayoutDashboard }] },
  {
    section: 'OPERATIONS',
    items: [
      { label: 'Volunteer Mgmt', path: '/staff/volunteers', icon: Users },
      { label: 'Children Records', path: '/staff/children', icon: Baby },
      { label: 'Donor Records', path: '/staff/donors', icon: Heart },
    ]
  },
  {
    section: 'REPORTING',
    items: [
      { label: 'Compliance', path: '/staff/compliance', icon: FileText },
      { label: 'Reports', path: '/staff/reports', icon: BarChart2 },
      { label: 'Announcements', path: '/staff/announcements', icon: Megaphone },
    ]
  },
  { section: 'MY ACCOUNT', items: [{ label: 'My Profile', path: '/staff/profile', icon: User }] },
];

// ── Donor ────────────────────────────────────────────────────────────
export const DONOR_NAV: NavGroup[] = [
  {
    section: 'MY PORTAL',
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
    accent: 'brand-primary',      // #F97316
    accentBg: 'bg-brand-primary',
    accentText: 'text-brand-primary',
    accentShadow: 'shadow-[4px_4px_0_rgba(249,115,22,0.3)]',
    portalName: 'CLARION_\nSYS',
    profilePath: '/settings',
    portalIcon: Shield,
  },
  VOLUNTEER: {
    nav: VOLUNTEER_NAV,
    accent: 'blue-500',
    accentBg: 'bg-blue-500',
    accentText: 'text-blue-400',
    accentShadow: 'shadow-[4px_4px_0_rgba(59,130,246,0.3)]',
    portalName: 'CLARION_\nVOLUNTEER',
    profilePath: '/volunteer/profile',
    portalIcon: Shield,
  },
  NGO_STAFF: {
    nav: STAFF_NAV,
    accent: 'emerald-500',
    accentBg: 'bg-emerald-500',
    accentText: 'text-emerald-400',
    accentShadow: 'shadow-[4px_4px_0_rgba(16,185,129,0.3)]',
    portalName: 'CLARION_\nSTAFF',
    profilePath: '/staff/profile',
    portalIcon: Shield,
  },
  DONOR: {
    nav: DONOR_NAV,
    accent: 'pink-500',
    accentBg: 'bg-pink-500',
    accentText: 'text-pink-400',
    accentShadow: 'shadow-[4px_4px_0_rgba(236,72,153,0.3)]',
    portalName: 'CLARION_\nDONOR',
    profilePath: '/donor/profile',
    portalIcon: Shield,
  }
} as const;
