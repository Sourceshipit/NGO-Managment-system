import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Bell, ChevronDown, User, Settings, LogOut, X, Activity } from 'lucide-react';
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
    if (pathname.startsWith('/dashboard')) return 'SYS_DASHBOARD';
    if (pathname.startsWith('/volunteers')) return 'VOLUNTEER_MGMT';
    if (pathname.startsWith('/children')) return 'CHILD_RECORDS';
    if (pathname.startsWith('/donors')) return 'DONOR_PORTAL';
    if (pathname.startsWith('/policies')) return 'GOVT_POLICIES';
    if (pathname.startsWith('/employees')) return 'EMP_TRACKING';
    if (pathname.startsWith('/blockchain')) return 'AUDIT_LOG';
    if (pathname.startsWith('/search')) return 'SEARCH_ENGINE';
    if (pathname.startsWith('/notifications')) return 'NOTIFICATIONS';
    if (pathname.startsWith('/settings')) return 'SYS_SETTINGS';
    return 'SYS_DASHBOARD';
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
    <div className="fixed top-0 left-64 right-0 h-16 bg-[#FAFAFA] border-b-2 border-black z-20 flex items-center justify-between font-mono">
      {/* Decorative architectural grid on header */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(to right, rgba(0,0,0,1) 1px, transparent 1px)', backgroundSize: '1rem 1rem' }}></div>

      <div className="pl-6 relative z-10 flex flex-col justify-center border-r-2 border-black h-full pr-6 min-w-[200px]">
        <h2 className="text-xs font-bold text-black uppercase tracking-widest">
           {'>'} {getPageTitle(location.pathname)}
        </h2>
      </div>

      <div className="pr-6 flex items-center h-full relative z-10">
        {/* Search */}
        <div className="relative border-l-2 border-black h-full flex items-center px-4 bg-white">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-black" size={14} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
            placeholder="QUERY_DB..."
            className="w-48 focus:w-64 transition-all duration-300 bg-white border-2 border-black py-1.5 pl-8 pr-3 text-[10px] uppercase font-bold tracking-widest text-black focus:outline-none focus:bg-brand-primary/10 h-8"
          />
          <kbd className="hidden lg:flex items-center gap-0.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 border border-slate-300 px-1.5 py-0.5 ml-2 shrink-0 cursor-pointer hover:bg-slate-200 transition-colors"
            onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
          >
            ⌘K
          </kbd>
        </div>

        {/* Bell */}
        <div className="relative border-l-2 border-black h-full flex items-center px-4 pr-1 bg-[#FAFAFA]" ref={notifRef}>
          <button onClick={openNotifs} className="relative w-8 h-8 flex items-center justify-center text-black hover:bg-brand-primary border-2 border-transparent hover:border-black transition-colors rounded-none">
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-brand-primary border-2 border-black text-black text-[9px] font-bold flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute top-[100%] right-0 mt-0 w-80 bg-white border-2 border-black border-t-0 shadow-[8px_8px_0_rgba(0,0,0,0.1)] overflow-hidden z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b-2 border-black bg-brand-primary">
                <h3 className="text-[10px] font-bold text-black uppercase tracking-widest flex items-center gap-1"><Activity size={12}/> SYSTEM_ALERTS</h3>
                <button onClick={markAllRead} className="text-[9px] font-bold text-black hover:text-white bg-white hover:bg-black border-2 border-black px-1 py-0.5 uppercase tracking-widest">PURGE</button>
              </div>
              <div className="max-h-80 overflow-y-auto no-scrollbar">
                {notifications.length === 0 ? (
                  <p className="text-center py-8 text-[10px] font-bold tracking-widest uppercase text-slate-400">[ NO_ALERTS ]</p>
                ) : notifications.map(n => (
                  <div
                    key={n.id}
                    onClick={() => { if (n.link) { setShowNotifs(false); navigate(n.link); } }}
                    className={`px-4 py-3 border-b border-black/10 flex items-start gap-3 hover:bg-slate-50 cursor-pointer ${!n.is_read ? 'bg-brand-primary/10' : ''}`}
                  >
                    <span className="text-lg mt-0.5">{typeIcons[n.type] || '🔔'}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs truncate uppercase tracking-widest ${!n.is_read ? 'font-bold text-black' : 'text-slate-500'}`}>{n.message}</p>
                      <p className="text-[9px] font-bold tracking-widest text-slate-400 mt-1 uppercase">{new Date(n.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                    </div>
                    {!n.is_read && <div className="w-2 h-2 bg-brand-primary border border-black rounded-none mt-1.5 shrink-0"></div>}
                  </div>
                ))}
              </div>
              <button
                onClick={() => { setShowNotifs(false); navigate('/notifications'); }}
                className="w-full px-4 py-3 text-[10px] text-black font-bold uppercase tracking-widest hover:bg-black hover:text-white border-t-2 border-black text-center transition-colors"
              >
                VIEW_ALL_LOGS →
              </button>
            </div>
          )}
        </div>

        <div className="relative border-l-2 border-black h-full flex items-center px-4 bg-[#FAFAFA]" ref={dropRef}>
          <button
            className="flex items-center gap-2 hover:bg-brand-primary p-1 border-2 border-transparent hover:border-black transition-colors"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div className="w-6 h-6 bg-black flex items-center justify-center text-brand-primary font-bold text-[10px] shrink-0 border border-black">
              {getInitials(user?.full_name)}
            </div>
            <ChevronDown size={14} className="text-black" />
          </button>

          {showDropdown && (
            <div className="absolute top-[100%] right-0 mt-0 w-48 bg-white border-2 border-black border-t-0 shadow-[8px_8px_0_rgba(0,0,0,0.1)] py-0 overflow-hidden z-50">
              <div className="px-4 py-3 border-b-2 border-black bg-brand-primary">
                <p className="text-xs font-bold text-black truncate uppercase tracking-widest">{user?.full_name}</p>
                <p className="text-[9px] font-bold text-black uppercase tracking-widest">[{user?.role?.replace('_', ' ')}]</p>
              </div>
              <button onClick={() => { setShowDropdown(false); navigate('/settings'); }} className="w-full px-4 py-3 text-[10px] font-bold uppercase tracking-widest border-b border-black/10 text-black hover:bg-slate-50 flex items-center gap-2 text-left">
                <User size={14} className="text-black" /> PROFILE
              </button>
              <button onClick={() => { setShowDropdown(false); navigate('/settings'); }} className="w-full px-4 py-3 text-[10px] font-bold uppercase tracking-widest border-b-2 border-black text-black hover:bg-slate-50 flex items-center gap-2 text-left">
                <Settings size={14} className="text-black" /> CFG_SETTINGS
              </button>
              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-black hover:bg-black hover:text-white flex items-center gap-2 text-left transition-colors"
              >
                <LogOut size={14} className="text-current" /> TERM_SESSION
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
