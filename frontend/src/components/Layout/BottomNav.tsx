import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import type { NavGroup } from '../../config/navItems';
import { ROLE_CONFIG } from '../../config/navItems';
import {
  LayoutDashboard, Users, Heart, Calendar, User, TrendingUp
} from 'lucide-react';

/**
 * Compact mobile bottom navigation bar — visible only on screens < 768px.
 * Shows 5 most important items from the role's nav config.
 */
const BottomNav: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user?.role) return null;

  const config = ROLE_CONFIG[user.role as keyof typeof ROLE_CONFIG];
  if (!config) return null;

  // Pick 5 items maximum from the first groups
  const allItems = config.nav.flatMap(g => g.items).slice(0, 5);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#FAFAFA] border-t-2 border-black font-mono">
      <div className="flex items-center justify-around h-14">
        {allItems.map(item => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive
                  ? `bg-black ${config.accentText}`
                  : 'text-slate-500 hover:text-black'
              }`}
            >
              <Icon size={18} />
              <span className="text-[8px] font-bold uppercase tracking-widest mt-0.5 truncate max-w-[4rem]">
                {item.label.split(' ').pop()}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
