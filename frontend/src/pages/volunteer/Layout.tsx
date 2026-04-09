import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LayoutDashboard, User, Calendar, CheckSquare, Clock, TrendingUp, Bell, LogOut, Shield } from 'lucide-react';
import { useState, useEffect } from 'react';
import { notificationsAPI } from '../../api/client';

const nav = [
  { section: 'MY SPACE', items: [
    { to: '/volunteer/dashboard', label: 'My Dashboard', icon: LayoutDashboard },
    { to: '/volunteer/profile', label: 'My Profile', icon: User },
  ]},
  { section: 'OPPORTUNITIES', items: [
    { to: '/volunteer/slots', label: 'Browse Slots', icon: Calendar },
    { to: '/volunteer/bookings', label: 'My Bookings', icon: CheckSquare },
    { to: '/volunteer/hours', label: 'Log Hours', icon: Clock },
  ]},
  { section: 'COMMUNITY', items: [
    { to: '/volunteer/impact', label: 'Impact Board', icon: TrendingUp },
    { to: '/volunteer/announcements', label: 'Announcements', icon: Bell },
  ]}
];

export default function VolunteerLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    notificationsAPI.getUnreadCount().then(r => setUnread(r.count)).catch(() => {});
    const interval = setInterval(() => {
      notificationsAPI.getUnreadCount().then(r => setUnread(r.count)).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="flex h-screen bg-[#FAFAFA] font-mono">
      <aside className="w-64 flex flex-col bg-[#FAFAFA] border-r-2 border-black z-30 shadow-[4px_0_0_rgba(0,0,0,1)]">
        <div className="p-4 border-b-2 border-black bg-blue-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border-2 border-black bg-white flex items-center justify-center shrink-0">
              <Shield size={20} className="text-black" />
            </div>
            <div>
              <h1 className="font-bold text-sm text-black tracking-widest uppercase leading-tight">CLARION_<br/>VOLUNTEER</h1>
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
                        ? 'bg-black text-blue-400 border-black relative ml-2 shadow-[4px_4px_0_rgba(59,130,246,0.3)]' 
                        : 'text-slate-600 border-transparent hover:text-black hover:border-black/20 hover:bg-slate-100'
                    }`
                  }>
                    <item.icon size={16} className="shrink-0" />
                    <span className="truncate">{item.label}</span>
                    {item.label === 'Announcements' && unread > 0 && (
                      <span className="ml-auto bg-blue-500 text-black border-2 border-black tracking-widest px-1.5 py-0.5 text-[10px] leading-none">{unread}</span>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
        <div className="border-t-2 border-black bg-white">
          <div className="p-4 flex flex-col gap-3">
            <div className="flex items-center gap-3 border-2 border-black p-2 bg-slate-50 cursor-pointer" onClick={() => navigate('/volunteer/profile')}>
              <div className="w-8 h-8 bg-blue-500 border-2 border-black flex items-center justify-center text-black font-bold text-xs shrink-0">
                {user?.full_name?.charAt(0) || 'V'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-black truncate uppercase tracking-widest leading-none mb-1">{user?.full_name}</p>
                <span className="text-[9px] font-bold text-blue-500 uppercase tracking-widest bg-black px-1 leading-none py-0.5">
                  [VOLUNTEER]
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
