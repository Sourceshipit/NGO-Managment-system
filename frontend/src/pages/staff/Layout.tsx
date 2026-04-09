import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LayoutDashboard, Users, Baby, Heart, FileText, BarChart2, Megaphone, User, LogOut, Shield } from 'lucide-react';

const nav = [
  { section: 'OVERVIEW', items: [{ to: '/staff/dashboard', label: 'Staff Dashboard', icon: LayoutDashboard }] },
  { section: 'OPERATIONS', items: [
    { to: '/staff/volunteers', label: 'Volunteer Mgmt', icon: Users },
    { to: '/staff/children', label: 'Children Records', icon: Baby },
    { to: '/staff/donors', label: 'Donor Records', icon: Heart },
  ]},
  { section: 'REPORTING', items: [
    { to: '/staff/compliance', label: 'Compliance', icon: FileText },
    { to: '/staff/reports', label: 'Reports', icon: BarChart2 },
    { to: '/staff/announcements', label: 'Announcements', icon: Megaphone },
  ]},
  { section: 'MY ACCOUNT', items: [{ to: '/staff/profile', label: 'My Profile', icon: User }] },
];

export default function StaffLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="flex h-screen bg-[#FAFAFA] font-mono">
      <aside className="w-64 flex flex-col bg-[#FAFAFA] border-r-2 border-black z-30 shadow-[4px_0_0_rgba(0,0,0,1)]">
        <div className="p-4 border-b-2 border-black bg-emerald-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border-2 border-black bg-white flex items-center justify-center shrink-0">
              <Shield size={20} className="text-black" />
            </div>
            <div>
              <h1 className="font-bold text-sm text-black tracking-widest uppercase leading-tight">CLARION_<br/>STAFF</h1>
            </div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-2 no-scrollbar space-y-6">
          {nav.map(s => (
            <div key={s.section}>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-slate-300 inline-block"></span>
                {s.section}
              </p>
              <div className="flex flex-col gap-1">
                {s.items.map(item => (
                  <NavLink key={item.to} to={item.to} className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 text-xs font-bold tracking-widest uppercase transition-all duration-150 border-2 ${
                      isActive 
                        ? 'bg-black text-emerald-400 border-black relative ml-2 shadow-[4px_4px_0_rgba(16,185,129,0.3)]' 
                        : 'text-slate-600 border-transparent hover:text-black hover:border-black/20 hover:bg-slate-100'
                    }`
                  }>
                    <item.icon size={16} className="shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
        <div className="border-t-2 border-black bg-white">
          <div className="p-4 flex flex-col gap-3">
            <div className="flex items-center gap-3 border-2 border-black p-2 bg-slate-50 cursor-pointer" onClick={() => navigate('/staff/profile')}>
              <div className="w-8 h-8 bg-emerald-500 border-2 border-black flex items-center justify-center text-black font-bold text-xs shrink-0">
                {user?.full_name?.charAt(0) || 'S'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-black truncate uppercase tracking-widest leading-none mb-1">{user?.full_name}</p>
                <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest bg-black px-1 leading-none py-0.5">
                  [NGO STAFF]
                </span>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 text-xs font-bold border-2 border-black text-black hover:bg-black hover:text-white py-2.5 transition-colors uppercase tracking-widest"
            >
              <LogOut size={14} />
              TERM_SESSION
            </button>
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto page-enter"><Outlet /></main>
    </div>
  );
}
