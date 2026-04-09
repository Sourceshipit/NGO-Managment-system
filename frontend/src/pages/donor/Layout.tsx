import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LayoutDashboard, Heart, Award, TrendingUp, User, LogOut, Shield } from 'lucide-react';

const nav = [
  { to: '/donor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/donor/donations', label: 'My Donations', icon: Heart },
  { to: '/donor/certificates', label: 'Certificates', icon: Award },
  { to: '/donor/impact', label: 'Impact View', icon: TrendingUp },
  { to: '/donor/profile', label: 'My Profile', icon: User },
];

export default function DonorLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="flex h-screen bg-[#FAFAFA] font-mono">
      <aside className="w-64 flex flex-col bg-[#FAFAFA] border-r-2 border-black z-30 shadow-[4px_0_0_rgba(0,0,0,1)]">
        <div className="p-4 border-b-2 border-black bg-pink-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border-2 border-black bg-white flex items-center justify-center shrink-0">
              <Shield size={20} className="text-black" />
            </div>
            <div>
              <h1 className="font-bold text-sm text-black tracking-widest uppercase leading-tight">CLARION_<br/>DONOR</h1>
            </div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-2 no-scrollbar space-y-2">
          {nav.map(item => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 text-xs font-bold tracking-widest uppercase transition-all duration-150 border-2 ${
                isActive 
                  ? 'bg-black text-pink-400 border-black relative ml-2 shadow-[4px_4px_0_rgba(236,72,153,0.3)]' 
                  : 'text-slate-600 border-transparent hover:text-black hover:border-black/20 hover:bg-slate-100'
              }`
            }>
              <item.icon size={16} className="shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="border-t-2 border-black bg-white">
          <div className="p-4 flex flex-col gap-3">
            <div className="flex items-center gap-3 border-2 border-black p-2 bg-slate-50 cursor-pointer" onClick={() => navigate('/donor/profile')}>
              <div className="w-8 h-8 bg-pink-500 border-2 border-black flex items-center justify-center text-black font-bold text-xs shrink-0">
                {user?.full_name?.charAt(0) || 'D'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-black truncate uppercase tracking-widest leading-none mb-1">{user?.full_name}</p>
                <span className="text-[9px] font-bold text-pink-500 uppercase tracking-widest bg-black px-1 leading-none py-0.5">
                  [DONOR]
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
