import { useState, useEffect } from 'react';
import { announcementsAPI } from '../../api/client';
import type { Announcement } from '../../types';
import { Bell, Loader2, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const priorityColors: Record<string, string> = {
  HIGH: 'bg-red-500 text-white border-black',
  MEDIUM: 'bg-amber-400 text-black border-black',
  LOW: 'bg-green-400 text-black border-black',
};

export default function VolunteerAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);
  const load = async () => {
    try { const a = await announcementsAPI.getAll(); setAnnouncements(a); }
    catch { toast.error('Failed to load'); }
    setLoading(false);
  };

  const markRead = async (id: number) => {
    try { await announcementsAPI.markRead(id); setAnnouncements(prev => prev.map(a => a.id === id ? {...a, is_read: true} : a)); }
    catch { toast.error('Failed to mark as read'); }
  };

  if (loading) return <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-brand-primary" /></div>;

  const unread = announcements.filter(a => !a.is_read).length;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-brand-border pb-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-widest text-black">Announcements</h1>
          <p className="font-mono text-sm text-slate-600 mt-1">{unread > 0 ? `${unread} UNREAD` : 'ALL CAUGHT UP!'}</p>
        </div>
        <div className="w-12 h-12 bg-blue-100 border border-brand-border flex items-center justify-center">
          <Bell className="w-6 h-6 text-blue-600" />
        </div>
      </div>

      {announcements.length === 0 ? (
        <div className="card p-12 text-center text-slate-500 font-mono">No announcements</div>
      ) : (
        <div className="space-y-4">
          {announcements.map(a => (
            <div key={a.id} className={`card p-5 transition-all ${a.is_read ? 'opacity-60 grayscale bg-slate-50 border-black' : 'bg-white hover:-translate-y-1 hover:shadow-md'}`}>
              <div className="flex items-start justify-between mb-3 border-b-2 border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <h3 className={`text-lg font-bold uppercase tracking-wide ${a.is_read ? 'text-slate-500' : 'text-black'}`}>{a.title}</h3>
                  <span className={`text-[10px] px-2 py-0.5 font-bold font-mono border-2 ${priorityColors[a.priority] || priorityColors.LOW}`}>{a.priority}</span>
                </div>
                {!a.is_read && (
                  <button onClick={() => markRead(a.id)} className="flex items-center gap-1.5 font-mono text-xs font-bold text-blue-600 hover:text-white hover:bg-blue-600 border-2 border-transparent hover:border-black px-2 py-1 transition-colors">
                    <CheckCircle className="w-4 h-4" /> MARK READ
                  </button>
                )}
              </div>
              <p className="text-base text-slate-700 font-medium mb-4 leading-relaxed">{a.content}</p>
              <div className="flex items-center gap-6 font-mono text-xs text-slate-500 border-t border-brand-border pt-3">
                <span>AUTHOR: {a.creator_name?.toUpperCase() || 'STAFF'}</span>
                <span>DATE: {new Date(a.created_at).toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'numeric'}).toUpperCase()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
