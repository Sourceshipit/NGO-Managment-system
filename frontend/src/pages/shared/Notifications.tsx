import { useState, useEffect } from 'react';
import { notificationsAPI } from '../../api/client';
import type { AppNotification } from '../../types';
import { Bell, Trash2, CheckCircle, Check, Loader2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const typeIcons: Record<string,string> = {
  DONATION:'💰', NEW_BOOKING:'📅', COMPLIANCE:'⚠️',
  LEAVE:'🏖️', LOW_SLOT:'📉', SYSTEM:'🔔', ACHIEVEMENT:'🏆'
};

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { load(); }, []);
  const load = async () => {
    try { setNotifs(await notificationsAPI.getAll()); } catch { toast.error('Failed'); }
    setLoading(false);
  };

  const markRead = async (id: number) => {
    try { await notificationsAPI.markRead(id); setNotifs(prev => prev.map(n => n.id===id?{...n,is_read:true}:n)); }
    catch { toast.error('Failed'); }
  };

  const markAllRead = async () => {
    try { await notificationsAPI.markAllRead(); setNotifs(prev => prev.map(n => ({...n,is_read:true}))); toast.success('All marked as read'); }
    catch { toast.error('Failed'); }
  };

  const remove = async (id: number) => {
    try { await notificationsAPI.remove(id); setNotifs(prev => prev.filter(n => n.id!==id)); toast.success('Deleted'); }
    catch { toast.error('Failed'); }
  };

  if (loading) return <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>;

  const unread = notifs.filter(n => !n.is_read).length;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-slate-800">Notifications</h1><p className="text-sm text-slate-500">{unread > 0 ? `${unread} unread` : 'All caught up!'}</p></div>
        {unread > 0 && <button onClick={markAllRead} className="px-4 py-2 text-sm border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 flex items-center gap-2"><Check className="w-4 h-4" /> Mark All Read</button>}
      </div>

      {notifs.length === 0 ? (
        <div className="text-center py-16"><Bell className="w-16 h-16 text-slate-300 mx-auto mb-4" /><p className="text-slate-500">No notifications</p></div>
      ) : (
        <div className="space-y-2">
          {notifs.map(n => (
            <div key={n.id} className={`bg-white rounded-xl border p-4 shadow-sm flex items-start gap-3 transition ${n.is_read ? 'opacity-60 border-slate-100' : 'border-slate-200'}`}>
              <span className="text-xl mt-0.5">{typeIcons[n.type] || '🔔'}</span>
              <div className="flex-1" onClick={() => { if (n.link) { markRead(n.id); navigate(n.link); } }} style={{cursor: n.link ? 'pointer' : 'default' }}>
                <p className={`text-sm ${n.is_read ? 'text-slate-500' : 'text-slate-800 font-medium'}`}>{n.message}</p>
                <p className="text-xs text-slate-400 mt-1">{new Date(n.created_at).toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'numeric'})} • {new Date(n.created_at).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}</p>
              </div>
              <div className="flex gap-1">
                {!n.is_read && <button onClick={() => markRead(n.id)} className="p-1.5 hover:bg-green-50 rounded-lg text-green-500" title="Mark read"><CheckCircle className="w-4 h-4" /></button>}
                <button onClick={() => remove(n.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-400" title="Delete"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
