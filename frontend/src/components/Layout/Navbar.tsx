import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Search, Bell, ChevronDown, User, Settings, LogOut, X, Activity, Home } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { notificationsAPI } from '../../api/client';

const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const dropRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const getPageTitle = (pathname: string) => {
    if (pathname.startsWith('/dashboard')) return 'Dashboard';
    if (pathname.startsWith('/volunteers')) return 'Volunteers';
    if (pathname.startsWith('/children')) return 'Children';
    if (pathname.startsWith('/donors')) return 'Donors';
    if (pathname.startsWith('/policies')) return 'Policies';
    if (pathname.startsWith('/employees')) return 'Staff';
    if (pathname.startsWith('/blockchain')) return 'Audit Trail';
    if (pathname.startsWith('/search')) return 'Search';
    if (pathname.startsWith('/notifications')) return 'Notifications';
    if (pathname.startsWith('/settings')) return 'Settings';
    if (pathname.startsWith('/access-control')) return 'Access Control';
    return 'Dashboard';
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  // Fetch unread count
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const data = await notificationsAPI.getUnreadCount();
        setUnreadCount(data.count || 0);
      } catch {}
    };
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setShowDropdown(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifs(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const openNotifs = async () => {
    setShowNotifs(!showNotifs);
    if (!showNotifs) {
      try {
        const data = await notificationsAPI.getAll();
        setNotifications(data.slice(0, 8));
      } catch {}
    }
  };

  const markAllRead = async () => {
    try {
      await notificationsAPI.markAllRead();
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch {}
  };

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const typeIcons: Record<string, string> = {
    DONATION: '💰', NEW_BOOKING: '📅', COMPLIANCE: '⚠️',
    LEAVE: '🏖️', LOW_SLOT: '📉', SYSTEM: '🔔', ACHIEVEMENT: '🏆'
  };

  return (
    <div className="fixed top-0 left-[260px] right-0 h-16 bg-white border-b border-brand-border z-20 flex items-center justify-between">
      {/* Page Title + Home */}
      <div className="pl-6 flex items-center gap-3 h-full">
        <Link
          to="/"
          className="w-8 h-8 flex items-center justify-center text-brand-muted hover:text-brand-primary hover:bg-brand-primary-light rounded-lg transition-all duration-200 icon-pop"
          title="Back to Home"
        >
          <Home size={17} />
        </Link>
        <div className="w-px h-5 bg-brand-border" />
        <h2 className="text-lg font-semibold text-brand-text">
          {getPageTitle(location.pathname)}
        </h2>
      </div>

      <div className="pr-6 flex items-center gap-2 h-full">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
            placeholder="Search..."
            className="w-48 focus:w-64 transition-all duration-300 bg-slate-50 border border-brand-border rounded-lg py-2 pl-9 pr-3 text-sm text-brand-text placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary focus:bg-white"
          />
        </div>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={openNotifs} 
            className="relative w-9 h-9 flex items-center justify-center text-slate-500 hover:text-brand-text hover:bg-slate-100 rounded-lg transition-all duration-200 active:scale-90"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-brand-danger text-white text-[10px] font-semibold flex items-center justify-center rounded-full animate-pulse-dot">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-brand-border rounded-xl shadow-lg overflow-hidden z-50 tooltip-enter">
              <div className="flex items-center justify-between px-4 py-3 border-b border-brand-border">
                <h3 className="text-sm font-semibold text-brand-text flex items-center gap-2">
                  <Activity size={14} className="text-brand-primary" /> Notifications
                </h3>
                <button onClick={markAllRead} className="text-xs font-medium text-brand-primary hover:text-brand-primary-hover transition-colors active:scale-95">
                  Mark all read
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto no-scrollbar">
                {notifications.length === 0 ? (
                  <p className="text-center py-8 text-sm text-brand-muted">No notifications</p>
                ) : notifications.map(n => (
                  <div
                    key={n.id}
                    onClick={() => { if (n.link) { setShowNotifs(false); navigate(n.link); } }}
                    className={`px-4 py-3 border-b border-brand-border/50 flex items-start gap-3 hover:bg-slate-50 cursor-pointer transition-all duration-200 ${!n.is_read ? 'bg-brand-primary-light/30' : ''}`}
                  >
                    <span className="text-base mt-0.5">{typeIcons[n.type] || '🔔'}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!n.is_read ? 'font-semibold text-brand-text' : 'text-brand-muted'}`}>{n.message}</p>
                      <p className="text-xs text-brand-muted mt-1">{new Date(n.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                    </div>
                    {!n.is_read && <div className="w-2 h-2 bg-brand-primary rounded-full mt-1.5 shrink-0" />}
                  </div>
                ))}
              </div>
              <button
                onClick={() => { setShowNotifs(false); navigate('/notifications'); }}
                className="w-full px-4 py-3 text-sm text-brand-primary font-medium hover:bg-slate-50 border-t border-brand-border text-center transition-all duration-200 active:scale-[0.98]"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>

        {/* User Dropdown */}
        <div className="relative" ref={dropRef}>
          <button
            className="flex items-center gap-2 hover:bg-slate-100 rounded-lg p-1.5 transition-all duration-200 active:scale-95"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center text-white font-semibold text-xs shrink-0">
              {getInitials(user?.full_name)}
            </div>
            <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showDropdown && (
            <div className="absolute top-full right-0 mt-2 w-52 bg-white border border-brand-border rounded-xl shadow-lg overflow-hidden z-50 tooltip-enter">
              <div className="px-4 py-3 border-b border-brand-border bg-slate-50">
                <p className="text-sm font-semibold text-brand-text truncate">{user?.full_name}</p>
                <p className="text-xs text-brand-muted">{user?.role?.replace('_', ' ')}</p>
              </div>
              <button onClick={() => { setShowDropdown(false); navigate('/settings'); }} className="w-full px-4 py-2.5 text-sm text-brand-text hover:bg-slate-50 flex items-center gap-3 text-left transition-all duration-200 active:scale-[0.98]">
                <User size={16} className="text-brand-muted" /> Profile
              </button>
              <button onClick={() => { setShowDropdown(false); navigate('/settings'); }} className="w-full px-4 py-2.5 text-sm text-brand-text hover:bg-slate-50 flex items-center gap-3 text-left border-b border-brand-border transition-all duration-200 active:scale-[0.98]">
                <Settings size={16} className="text-brand-muted" /> Settings
              </button>
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2.5 text-sm text-brand-danger hover:bg-red-50 flex items-center gap-3 text-left transition-all duration-200 active:scale-[0.98]"
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
