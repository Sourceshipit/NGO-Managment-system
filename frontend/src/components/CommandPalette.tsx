import React, { useState, useEffect, useCallback } from 'react';
import { Command } from 'cmdk';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  LayoutDashboard, Users, Baby, Heart, FileText, Briefcase, Link as LinkIcon,
  Calendar, Clock, TrendingUp, Bell, User, Settings, Search, Award, BarChart2
} from 'lucide-react';

interface CommandItem {
  id: string;
  label: string;
  path: string;
  icon: any;
  group: string;
  keywords?: string;
}

const ALL_COMMANDS: CommandItem[] = [
  // Admin
  { id: 'dash', label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, group: 'Admin', keywords: 'home overview stats' },
  { id: 'vols', label: 'Volunteers', path: '/volunteers', icon: Users, group: 'Admin', keywords: 'manage people' },
  { id: 'child', label: 'Children', path: '/children', icon: Baby, group: 'Admin', keywords: 'kids records' },
  { id: 'donor', label: 'Donors', path: '/donors', icon: Heart, group: 'Admin', keywords: 'donations funding' },
  { id: 'pols', label: 'Policies', path: '/policies', icon: FileText, group: 'Admin', keywords: 'compliance govt' },
  { id: 'emps', label: 'Employees', path: '/employees', icon: Briefcase, group: 'Admin', keywords: 'staff hr' },
  { id: 'chain', label: 'Blockchain', path: '/blockchain', icon: LinkIcon, group: 'Admin', keywords: 'audit log verify' },
  // Volunteer
  { id: 'vdash', label: 'My Dashboard', path: '/volunteer/dashboard', icon: LayoutDashboard, group: 'Volunteer' },
  { id: 'slots', label: 'Browse Slots', path: '/volunteer/slots', icon: Calendar, group: 'Volunteer', keywords: 'opportunities tasks' },
  { id: 'book', label: 'My Bookings', path: '/volunteer/bookings', icon: Calendar, group: 'Volunteer' },
  { id: 'hrs', label: 'Log Hours', path: '/volunteer/hours', icon: Clock, group: 'Volunteer', keywords: 'time track' },
  { id: 'impact', label: 'Impact Board', path: '/volunteer/impact', icon: TrendingUp, group: 'Volunteer', keywords: 'leaderboard score' },
  { id: 'vanno', label: 'Announcements', path: '/volunteer/announcements', icon: Bell, group: 'Volunteer' },
  // Staff
  { id: 'sdash', label: 'Staff Dashboard', path: '/staff/dashboard', icon: LayoutDashboard, group: 'Staff' },
  { id: 'scomp', label: 'Compliance', path: '/staff/compliance', icon: FileText, group: 'Staff' },
  { id: 'srep', label: 'Reports', path: '/staff/reports', icon: BarChart2, group: 'Staff' },
  // Donor
  { id: 'ddash', label: 'Donor Dashboard', path: '/donor/dashboard', icon: LayoutDashboard, group: 'Donor' },
  { id: 'ddon', label: 'My Donations', path: '/donor/donations', icon: Heart, group: 'Donor' },
  { id: 'dcert', label: 'Certificates', path: '/donor/certificates', icon: Award, group: 'Donor' },
  // Shared
  { id: 'search', label: 'Search', path: '/search', icon: Search, group: 'Quick Actions', keywords: 'find query' },
  { id: 'notifs', label: 'Notifications', path: '/notifications', icon: Bell, group: 'Quick Actions' },
  { id: 'settings', label: 'Settings', path: '/settings', icon: Settings, group: 'Quick Actions', keywords: 'preferences profile' },
  { id: 'profile', label: 'My Profile', path: '/settings', icon: User, group: 'Quick Actions' },
];

const ROLE_FILTER: Record<string, string[]> = {
  ADMIN: ['Admin', 'Quick Actions'],
  VOLUNTEER: ['Volunteer', 'Quick Actions'],
  NGO_STAFF: ['Staff', 'Quick Actions'],
  DONOR: ['Donor', 'Quick Actions'],
};

const CommandPalette: React.FC = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const commands = ALL_COMMANDS.filter(c =>
    ROLE_FILTER[user?.role || 'ADMIN']?.includes(c.group)
  );

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setOpen(prev => !prev);
    }
    if (e.key === 'Escape') setOpen(false);
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const onSelect = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  if (!open) return null;

  const groups = [...new Set(commands.map(c => c.group))];

  return (
    <div className="fixed inset-0 z-[999]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />

      {/* Palette */}
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-full max-w-xl">
        <Command className="bg-white border-2 border-black shadow-[8px_8px_0_rgba(0,0,0,1)] font-mono overflow-hidden">
          {/* Input */}
          <div className="flex items-center border-b-2 border-black px-4">
            <Search size={16} className="text-slate-400 mr-3 shrink-0" />
            <Command.Input
              placeholder="TYPE_COMMAND..."
              className="w-full py-4 bg-transparent text-xs font-bold uppercase tracking-widest text-black placeholder:text-slate-400 focus:outline-none"
              autoFocus
            />
            <kbd className="hidden sm:flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 border border-slate-300 px-1.5 py-0.5 shrink-0">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <Command.List className="max-h-80 overflow-y-auto p-2">
            <Command.Empty className="py-8 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              [ NO_RESULTS ]
            </Command.Empty>

            {groups.map(group => (
              <Command.Group key={group} heading={group} className="[&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:text-slate-400 [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-widest [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-2">
                {commands
                  .filter(c => c.group === group)
                  .map(cmd => {
                    const Icon = cmd.icon;
                    return (
                      <Command.Item
                        key={cmd.id}
                        value={`${cmd.label} ${cmd.keywords || ''}`}
                        onSelect={() => onSelect(cmd.path)}
                        className="flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-black uppercase tracking-widest cursor-pointer border-2 border-transparent hover:border-black hover:bg-brand-primary/10 data-[selected=true]:border-black data-[selected=true]:bg-brand-primary/10 transition-colors mb-1"
                      >
                        <Icon size={16} className="text-black shrink-0" />
                        <span>{cmd.label}</span>
                      </Command.Item>
                    );
                  })}
              </Command.Group>
            ))}
          </Command.List>
        </Command>
      </div>
    </div>
  );
};

export default CommandPalette;
