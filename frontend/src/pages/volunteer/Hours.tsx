import { useState, useEffect } from 'react';
import { volunteersAPI } from '../../api/client';
import type { HourLog, SlotBooking, VolunteerStats } from '../../types';
import { Clock, Trash2, Loader2, Plus, Minus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function VolunteerHours() {
  const [hours, setHours] = useState<HourLog[]>([]);
  const [pastBookings, setPastBookings] = useState<SlotBooking[]>([]);
  const [stats, setStats] = useState<VolunteerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingId, setBookingId] = useState<string>('');
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [logHours, setLogHours] = useState(4);
  const [logDesc, setLogDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { load(); }, []);
  const load = async () => {
    try {
      const [h, b, s] = await Promise.all([
        volunteersAPI.getMyHours(),
        volunteersAPI.getMyBookings('CONFIRMED'),
        volunteersAPI.getMyStats()
      ]);
      setHours(h);
      setPastBookings(b.filter(bk => bk.slot_date && new Date(bk.slot_date) < new Date()));
      setStats(s);
    } catch { toast.error('Failed to load'); }
    setLoading(false);
  };

  const submit = async () => {
    if (logHours < 0.5 || logHours > 12) { toast.error('Hours must be between 0.5 and 12'); return; }
    setSubmitting(true);
    try {
      const data: any = { date: logDate, hours: logHours, description: logDesc };
      if (bookingId) data.booking_id = parseInt(bookingId);
      await volunteersAPI.logHours(data);
      const newTotal = (stats?.total_hours || 0) + logHours;
      const milestones = [10, 50, 100, 200, 500];
      for (const m of milestones) {
        if ((stats?.total_hours || 0) < m && newTotal >= m) {
          toast.success(`🏆 Achievement unlocked! You've reached ${m} hours!`, { duration: 5000, style: { background: '#f97316', color: 'white', fontSize: '16px' } });
          break;
        }
      }
      toast.success(`Hours logged! Your total is now ${newTotal.toFixed(1)}h`);
      setLogDesc(''); setLogHours(4); setBookingId('');
      load();
    } catch (e: any) { toast.error(e.response?.data?.detail || 'Failed to log hours'); }
    setSubmitting(false);
  };

  const deleteLog = async (id: number) => {
    try { await volunteersAPI.deleteHourLog(id); toast.success('Log deleted'); load(); }
    catch { toast.error('Failed to delete'); }
  };

  const total = hours.reduce((s, h) => s + h.hours, 0);
  const thisMonth = hours.filter(h => { const d = new Date(h.date); const now = new Date(); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); }).reduce((s, h) => s + h.hours, 0);
  const thisWeek = hours.filter(h => { const d = new Date(h.date); const now = new Date(); const w = new Date(now); w.setDate(w.getDate() - 7); return d >= w; }).reduce((s, h) => s + h.hours, 0);

  if (loading) return <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-black text-black uppercase tracking-widest mb-1">Log Your Hours</h1>
      <p className="text-sm font-mono text-slate-500 uppercase mb-6">Track your volunteer time to build your impact record</p>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Hours', value: `${total.toFixed(1)}h`, color: 'bg-white' },
          { label: 'This Month', value: `${thisMonth.toFixed(1)}h`, color: 'bg-white' },
          { label: 'This Week', value: `${thisWeek.toFixed(1)}h`, color: 'bg-white' },
        ].map((c, i) => (
          <div key={i} className={`card p-5 ${c.color}`}>
            <div className={`w-10 h-10 border border-brand-border bg-black flex items-center justify-center mb-3`}><Clock className="w-5 h-5 text-white" /></div>
            <p className="text-3xl font-black text-black leading-none">{c.value}</p>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="card bg-white p-6">
          <h3 className="font-bold text-black uppercase tracking-widest mb-4 border-b border-brand-border pb-2">Log New Hours</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-black uppercase tracking-widest block mb-1">Select Booking (optional)</label>
              <select value={bookingId} onChange={e => setBookingId(e.target.value)} className="w-full h-10 px-3 bg-slate-50 border border-brand-border text-sm uppercase font-mono focus:outline-none focus:ring-0">
                <option value="">— No booking linked —</option>
                {pastBookings.map(b => <option key={b.id} value={b.id}>{b.slot_task_name} — {b.slot_date ? new Date(b.slot_date).toLocaleDateString() : ''}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-black uppercase tracking-widest block mb-1">Date</label>
              <input type="date" value={logDate} onChange={e => setLogDate(e.target.value)} className="w-full h-10 px-3 bg-slate-50 border border-brand-border text-sm uppercase font-mono focus:outline-none focus:ring-0" />
            </div>
            <div>
              <label className="text-xs font-bold text-black uppercase tracking-widest block mb-1">Hours Worked</label>
              <div className="flex items-center gap-3">
                <button onClick={() => setLogHours(Math.max(0.5, logHours - 0.5))} className="w-9 h-9 border border-brand-border bg-white flex items-center justify-center hover:bg-black hover:text-white transition">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-xl font-black text-black min-w-[60px] text-center">{logHours}h</span>
                <button onClick={() => setLogHours(Math.min(12, logHours + 0.5))} className="w-9 h-9 border border-brand-border bg-white flex items-center justify-center hover:bg-black hover:text-white transition">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-black uppercase tracking-widest block mb-1">Description</label>
              <textarea value={logDesc} onChange={e => setLogDesc(e.target.value)} rows={3}
                className="w-full px-3 py-2 bg-slate-50 border border-brand-border text-sm font-mono uppercase resize-none focus:outline-none focus:ring-0"
                placeholder="Describe what you did..."></textarea>
            </div>
            <button onClick={submit} disabled={submitting}
              className="w-full py-3 border border-brand-border bg-blue-500 text-black text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white transition disabled:opacity-50 flex items-center justify-center gap-2">
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Logging...</> : 'Log Hours'}
            </button>
          </div>
        </div>

        <div className="card bg-white p-6">
          <h3 className="font-bold text-black uppercase tracking-widest mb-4 border-b border-brand-border pb-2">Hours History</h3>
          {hours.length === 0 ? <p className="text-sm font-mono text-slate-400 py-8 text-center uppercase">No hours logged yet</p> : (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {hours.map(h => (
                <div key={h.id} className="flex items-center justify-between p-3 border border-brand-border bg-slate-50">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-black uppercase tracking-widest">{h.hours}h</span>
                      {h.slot_task_name && <span className="text-[10px] font-bold text-white bg-black px-2 py-0.5 uppercase tracking-widest">{h.slot_task_name}</span>}
                    </div>
                    <p className="text-xs font-mono text-slate-500 mt-1 uppercase">{new Date(h.date).toLocaleDateString()} {h.description && `• ${h.description.slice(0, 50)}`}</p>
                  </div>
                  <button onClick={() => deleteLog(h.id)} className="text-black hover:text-red-500 hover:bg-red-100 p-1 rounded transition"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
              <div className="flex justify-between px-3 py-2 border border-brand-border bg-blue-100 font-bold uppercase tracking-widest text-xs mt-4">
                <span className="text-black">Total</span>
                <span className="text-black">{total.toFixed(1)}h</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
