import React from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { LogOut, LayoutDashboard, Home } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { ROLE_CONFIG } from '../../config/navItems';
import type { NavGroup } from '../../config/navItems';

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // ── Derive config from role ───────────────────────────────────────
  const role = (user?.role || 'ADMIN') as keyof typeof ROLE_CONFIG;
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.ADMIN;
  const navGroups: NavGroup[] = config.nav;
  const portalName = config.portalName;
  const accentBg = config.accentBg;
  const accentLight = config.accentLight;

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="fixed w-[260px] h-screen bg-white border-r border-brand-border flex flex-col z-30">
      {/* HEADER LOGO — clickable back to landing */}
      <div className="p-5 border-b border-brand-border">
        <Link to="/" className="flex items-center gap-3 group">
          <div className={`w-9 h-9 rounded-lg ${accentBg} flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110`}>
            <LayoutDashboard size={18} className="text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-sm text-brand-text leading-tight group-hover:text-brand-primary transition-colors duration-200">
              {portalName}
            </h1>
            <p className="text-[11px] text-brand-muted mt-0.5">Management Platform</p>
          </div>
        </Link>
      </div>

      {/* HOME LINK — always visible at top */}
      <div className="px-3 pt-3 pb-1">
        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2 text-[13px] font-medium rounded-lg transition-all duration-200 text-brand-muted hover:text-brand-primary hover:bg-brand-primary-light group"
        >
          <Home size={18} className="shrink-0 transition-transform duration-200 group-hover:scale-110" />
          <span className="truncate">Back to Home</span>
        </Link>
      </div>

      {/* NAV GROUPS — driven by ROLE_CONFIG */}
      <div className="flex-1 overflow-y-auto px-3 py-2 no-scrollbar">
        {navGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="mb-5">
            <h3 className="text-[11px] font-medium text-brand-muted uppercase tracking-wider mb-2 px-3">
               {group.section}
            </h3>
            <div className="flex flex-col gap-0.5">
              {group.items.map((item, itemIdx) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={itemIdx}
                    to={item.path}
                    className={({ isActive }) => 
                      `flex items-center gap-3 px-3 py-2 text-[13px] font-medium rounded-lg transition-all duration-200 group ${
                        isActive 
                          ? `${accentLight} ${config.accentText} font-semibold nav-link-active` 
                          : 'text-brand-muted hover:text-brand-text hover:bg-slate-50'
                      }`
                    }
                  >
                    <Icon size={18} className="shrink-0 transition-transform duration-200 group-hover:scale-110" />
                    <span className="truncate">{item.label}</span>
                    {item.restricted && (
                      <span className="ml-auto text-[9px] font-semibold text-brand-muted bg-slate-100 rounded px-1.5 py-0.5">Admin</span>
                    )}
                    {item.badge === 'unread' && (
                      <span className="ml-auto w-2 h-2 bg-brand-danger rounded-full shrink-0 animate-pulse-dot" />
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* USER FOOTER */}
      <div className="border-t border-brand-border bg-slate-50/50">
        <div className="p-4 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 ${accentBg} rounded-lg flex items-center justify-center text-white font-semibold text-xs shrink-0`}>
              {getInitials(user?.full_name)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-brand-text truncate leading-none mb-1">{user?.full_name}</p>
              <span className="text-[11px] text-brand-muted">
                {user?.role?.replace('_', ' ')}
              </span>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 text-sm font-medium text-brand-muted hover:text-brand-danger hover:bg-red-50 rounded-lg py-2 transition-all duration-200 active:scale-[0.97]"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
