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

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="w-8 h-8 animate-spin text-brand-primary" /></div>;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="page-title text-3xl mb-2">Log Your Hours</h1>
        <p className="text-brand-dark/60 font-medium">Track your volunteer time to build your impact record.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {[
          { label: 'Total Hours', value: `${total.toFixed(1)}h`, color: 'bg-white/80' },
          { label: 'This Month', value: `${thisMonth.toFixed(1)}h`, color: 'bg-white/80' },
          { label: 'This Week', value: `${thisWeek.toFixed(1)}h`, color: 'bg-white/80' },
        ].map((c, i) => (
          <div key={i} className={`card p-6 hover:-translate-y-1 transition-all duration-300 ${c.color} backdrop-blur-md`}>
            <div className={`w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center mb-4`}>
                <Clock className="w-6 h-6 text-brand-primary" />
            </div>
            <p className="text-4xl font-bold text-brand-dark leading-none">{c.value}</p>
            <p className="text-sm font-semibold text-brand-dark/60 mt-2">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card bg-white/80 p-8 backdrop-blur-md">
          <h3 className="font-bold text-brand-dark text-lg mb-6 border-b border-brand-border/50 pb-3">Log New Hours</h3>
          <div className="space-y-5">
            <div>
              <label className="text-sm font-semibold text-brand-dark block mb-1.5">Select Booking (optional)</label>
              <select value={bookingId} onChange={e => setBookingId(e.target.value)} className="input-field w-full">
                <option value="">— No booking linked —</option>
                {pastBookings.map(b => <option key={b.id} value={b.id}>{b.slot_task_name} — {b.slot_date ? new Date(b.slot_date).toLocaleDateString() : ''}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-brand-dark block mb-1.5">Date</label>
              <input type="date" value={logDate} onChange={e => setLogDate(e.target.value)} className="input-field w-full" />
            </div>
            <div>
              <label className="text-sm font-semibold text-brand-dark block mb-1.5">Hours Worked</label>
              <div className="flex items-center gap-4 bg-brand-light/50 p-2 rounded-xl border border-brand-border/50">
                <button onClick={() => setLogHours(Math.max(0.5, logHours - 0.5))} className="w-10 h-10 rounded-lg bg-white border border-brand-border/50 text-brand-dark flex items-center justify-center hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-colors shadow-sm">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-2xl font-bold text-brand-dark min-w-[70px] text-center">{logHours}h</span>
                <button onClick={() => setLogHours(Math.min(12, logHours + 0.5))} className="w-10 h-10 rounded-lg bg-white border border-brand-border/50 text-brand-dark flex items-center justify-center hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-colors shadow-sm">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-brand-dark block mb-1.5">Description</label>
              <textarea value={logDesc} onChange={e => setLogDesc(e.target.value)} rows={3}
                className="input-field w-full py-3 resize-none"
                placeholder="Briefly describe your impactful work..."></textarea>
            </div>
            <button onClick={submit} disabled={submitting}
              className="btn-primary w-full py-3.5 mt-2 flex items-center justify-center gap-2">
              {submitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Logging...</> : 'Confirm & Log Hours'}
            </button>
          </div>
        </div>

        <div className="card bg-white/80 p-8 backdrop-blur-md flex flex-col">
          <h3 className="font-bold text-brand-dark text-lg mb-6 border-b border-brand-border/50 pb-3">Hours History</h3>
          {hours.length === 0 ? <p className="text-sm font-medium text-brand-dark/40 py-12 text-center">No hours logged yet</p> : (
            <div className="space-y-3 max-h-[440px] overflow-y-auto pr-2 custom-scrollbar flex-1">
              {hours.map(h => (
                <div key={h.id} className="flex items-center justify-between p-4 rounded-xl border border-brand-border/50 bg-white shadow-sm hover:shadow-md transition-shadow group">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded-md">{h.hours}h</span>
                      {h.slot_task_name && <span className="text-xs font-semibold text-brand-dark/70 rounded-md truncate max-w-[200px]">{h.slot_task_name}</span>}
                    </div>
                    <p className="text-xs font-medium text-brand-dark/50 mt-1.5 flex items-center gap-1.5">
                       <Clock className="w-3.5 h-3.5" />
                       {new Date(h.date).toLocaleDateString()} {h.description && <span className="truncate max-w-[220px]"> • {h.description}</span>}
                    </p>
                  </div>
                  <button onClick={() => deleteLog(h.id)} className="text-brand-dark/30 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <div className="flex justify-between px-5 py-4 rounded-xl bg-gradient-to-r from-brand-primary/10 to-transparent border border-brand-primary/20 font-bold text-brand-dark mt-4">
                <span>Total Accumulated</span>
                <span className="text-brand-primary">{total.toFixed(1)}h</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
