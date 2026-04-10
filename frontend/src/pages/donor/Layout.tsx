import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LayoutDashboard, Heart, Award, TrendingUp, User, LogOut, Shield, Home, Target } from 'lucide-react';

const nav = [
  { to: '/donor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/donor/donations', label: 'My Donations', icon: Heart },
  { to: '/donor/certificates', label: 'Certificates', icon: Award },
  { to: '/donor/impact', label: 'Impact View', icon: TrendingUp },
  { to: '/donor/requirements', label: 'What NGOs Need', icon: Target },
  { to: '/donor/profile', label: 'My Profile', icon: User },
];

export default function DonorLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="flex h-screen bg-brand-surface">
      <aside className="w-[260px] flex flex-col bg-white border-r border-brand-border z-30">
        <div className="p-5 border-b border-brand-border">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg bg-rose-100 flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110">
              <Shield size={18} className="text-rose-600" />
            </div>
            <div>
              <h1 className="font-semibold text-sm text-brand-text leading-tight group-hover:text-rose-600 transition-colors duration-200">BeneTrack</h1>
              <span className="text-xs text-rose-600 font-medium">Donor Portal</span>
            </div>
          </Link>
        </div>

        {/* Home link */}
        <div className="px-3 pt-3 pb-1">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 text-brand-muted hover:text-rose-600 hover:bg-rose-50 group"
          >
            <Home size={18} className="shrink-0 transition-transform duration-200 group-hover:scale-110" />
            <span className="truncate">Back to Home</span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto py-2 px-3 no-scrollbar space-y-1">
          {nav.map(item => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 group ${
                isActive 
                  ? 'bg-rose-50 text-rose-700 nav-link-active' 
                  : 'text-brand-muted hover:text-brand-text hover:bg-slate-50'
              }`
            }>
              <item.icon size={18} className="shrink-0 transition-transform duration-200 group-hover:scale-110" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-brand-border">
          <div className="p-4 flex flex-col gap-3">
            <div className="flex items-center gap-3 rounded-lg p-2 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => navigate('/donor/profile')}>
              <div className="w-8 h-8 bg-rose-600 rounded-lg flex items-center justify-center text-white font-semibold text-xs shrink-0">
                {user?.full_name?.charAt(0) || 'D'}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-brand-text truncate leading-none mb-1">{user?.full_name}</p>
                <span className="text-[11px] text-rose-600 font-medium">Donor</span>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 text-sm font-medium rounded-lg border border-brand-border text-brand-muted hover:bg-red-50 hover:text-red-600 hover:border-red-200 py-2 transition-all duration-200 active:scale-[0.97]"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-8 page-enter"><Outlet /></main>
    </div>
  );
}
