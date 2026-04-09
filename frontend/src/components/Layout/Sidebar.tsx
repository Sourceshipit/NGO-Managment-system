import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut, Terminal, Key } from 'lucide-react';
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
  const accentShadow = config.accentShadow;

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="fixed w-64 h-screen bg-[#FAFAFA] border-r-2 border-black flex flex-col font-mono z-30 shadow-[4px_0_0_rgba(0,0,0,1)]">
      {/* HEADER LOGO */}
      <div className={`p-4 border-b-2 border-black ${accentBg}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 border-2 border-black bg-white flex items-center justify-center shrink-0">
            <Terminal size={20} className="text-black" />
          </div>
          <div>
            <h1 className="font-bold text-sm text-black tracking-widest uppercase leading-tight whitespace-pre-line">
              {portalName}
            </h1>
          </div>
        </div>
      </div>

      {/* NAV GROUPS — driven by ROLE_CONFIG */}
      <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
        {navGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="mb-6">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-2 flex items-center gap-2">
               <span className="w-1.5 h-1.5 bg-slate-300 inline-block"></span>
               {group.section}
            </h3>
            <div className="flex flex-col gap-1">
              {group.items.map((item, itemIdx) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={itemIdx}
                    to={item.path}
                    className={({ isActive }) => 
                      `flex items-center gap-3 px-3 py-2.5 text-xs font-bold tracking-widest uppercase transition-all duration-150 border-2 ${
                        isActive 
                          ? `bg-black text-brand-primary border-black relative ml-2 ${accentShadow}` 
                          : 'text-slate-600 border-transparent hover:text-black hover:border-black/20 hover:bg-slate-100'
                      }`
                    }
                  >
                    <Icon size={16} className="shrink-0" />
                    <span className="truncate">{item.label}</span>
                    {item.restricted && <Key size={12} className="ml-auto text-brand-primary shrink-0" />}
                    {item.badge === 'unread' && (
                      <span className="ml-auto w-2 h-2 bg-red-500 rounded-full shrink-0 animate-pulse-dot" />
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* USER FOOTER */}
      <div className="border-t-2 border-black bg-white">
        <div className="p-4 flex flex-col gap-3">
          <div className="flex items-center gap-3 border-2 border-black p-2 bg-slate-50">
            <div className={`w-8 h-8 ${accentBg} border-2 border-black flex items-center justify-center text-black font-bold text-xs shrink-0`}>
              {getInitials(user?.full_name)}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-black truncate uppercase tracking-widest leading-none mb-1">{user?.full_name}</p>
              <span className="text-[9px] font-bold text-brand-primary uppercase tracking-widest bg-black px-1 leading-none py-0.5">
                [{user?.role?.replace('_', ' ')}]
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
    </div>
  );
};

export default Sidebar;
