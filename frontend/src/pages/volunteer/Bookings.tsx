import { useState, useEffect } from 'react';
import { volunteersAPI } from '../../api/client';
import type { SlotBooking } from '../../types';
import { Calendar, MapPin, Clock, Download, Loader2, RotateCcw, X, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

function generateICS(b: SlotBooking) {
  const d = b.slot_date?.replace(/-/g, '') || '20260101';
  const ics = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//BeneTrack//NGO Platform//EN\nBEGIN:VEVENT\nDTSTART:${d}T100000\nDTEND:${d}T120000\nSUMMARY:${b.slot_task_name || 'Volunteer Slot'}\nLOCATION:${b.slot_location || ''}\nDESCRIPTION:BeneTrack Volunteer Slot\nEND:VEVENT\nEND:VCALENDAR`;
  const blob = new Blob([ics], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = `${(b.slot_task_name||'slot').replace(/\s+/g,'_')}.ics`; a.click();
  URL.revokeObjectURL(url);
}

export default function VolunteerBookings() {
  const [bookings, setBookings] = useState<SlotBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'upcoming'|'past'|'cancelled'>('upcoming');
  const [confirm, setConfirm] = useState<SlotBooking | null>(null);
  const navigate = useNavigate();

  useEffect(() => { load(); }, []);
  const load = async () => {
    try { const b = await volunteersAPI.getMyBookings(); setBookings(b); }
    catch { toast.error('Failed to load bookings'); }
    setLoading(false);
  };

  const cancelBooking = async (b: SlotBooking) => {
    try { await volunteersAPI.cancelBooking(b.slot_id, b.id); toast.success('Booking cancelled'); load(); }
    catch { toast.error('Failed to cancel'); }
    setConfirm(null);
  };

  const rebook = async (b: SlotBooking) => {
    try { await volunteersAPI.bookSlot(b.slot_id); toast.success('Slot rebooked!'); load(); }
    catch (e: any) { toast.error(e.response?.data?.detail || 'Rebook failed'); }
  };

  const today = new Date();
  const upcoming = bookings.filter(b => b.status === 'CONFIRMED' && b.slot_date && new Date(b.slot_date) >= today);
  const past = bookings.filter(b => b.status === 'CONFIRMED' && (!b.slot_date || new Date(b.slot_date) < today));
  const cancelled = bookings.filter(b => b.status === 'CANCELLED');
  const list = tab === 'upcoming' ? upcoming : tab === 'past' ? past : cancelled;

  if (loading) return <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-black text-black uppercase tracking-widest mb-1">My Bookings</h1>
      <p className="text-sm font-mono text-slate-500 mb-6 uppercase">Track your volunteer slot bookings</p>

      <div className="flex gap-1 border border-brand-border bg-slate-100 p-1 mb-6 w-fit">
        {(['upcoming','past','cancelled'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-widest transition border-2 ${tab === t ? 'bg-black text-white border-black' : 'border-transparent text-slate-600 hover:bg-slate-200'}`}>
            {t.charAt(0).toUpperCase() + t.slice(1)} ({t === 'upcoming' ? upcoming.length : t === 'past' ? past.length : cancelled.length})
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="text-center py-16 border border-brand-border bg-white"><Calendar className="w-16 h-16 text-black mx-auto mb-4" /><p className="font-mono text-slate-500 uppercase">No {tab} bookings</p></div>
      ) : (
        <div className="space-y-4">
          {list.map(b => (
            <div key={b.id} className="card bg-white p-4 flex items-start gap-4">
              <div className={`border border-brand-border px-3 py-2 text-center min-w-[60px] bg-white`}>
                <p className={`text-xl font-black tracking-tighter ${tab === 'cancelled' ? 'text-red-600' : tab === 'past' ? 'text-black' : 'text-blue-600'}`}>
                  {b.slot_date ? new Date(b.slot_date).getDate() : '--'}
                </p>
                <p className={`text-[10px] uppercase font-bold tracking-widest ${tab === 'cancelled' ? 'text-red-400' : tab === 'past' ? 'text-slate-500' : 'text-blue-400'}`}>
                  {b.slot_date ? new Date(b.slot_date).toLocaleDateString('en', {month:'short'}) : ''}
                </p>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-black uppercase tracking-widest">{b.slot_task_name}</h3>
                  <span className={`text-[10px] px-2 py-0.5 font-bold uppercase tracking-widest border border-brand-border ${
                    b.status === 'CONFIRMED' ? 'bg-black text-white' : 'bg-red-500 text-white'
                  }`}>{b.status === 'CONFIRMED' ? (tab === 'past' ? 'Completed' : 'Confirmed') : 'Cancelled'}</span>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono text-slate-500 mt-2">
                  {b.slot_location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{b.slot_location}</span>}
                  {b.slot_time && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{b.slot_time}</span>}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {tab === 'upcoming' && (
                  <>
                    <button onClick={() => generateICS(b)} className="px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase border border-brand-border bg-white text-black hover:bg-black hover:text-white transition flex items-center justify-center gap-1">
                      <Download className="w-3 h-3" /> Calendar
                    </button>
                    <button onClick={() => setConfirm(b)} className="px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase border border-brand-border bg-white text-red-500 hover:bg-red-500 hover:text-white transition flex items-center justify-center gap-1">
                      <X className="w-3 h-3" /> Cancel
                    </button>
                  </>
                )}
                {tab === 'past' && (
                  <button onClick={() => navigate('/volunteer/hours')} className="px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase border border-brand-border bg-blue-500 text-black hover:bg-black hover:text-white transition">Log Hours</button>
                )}
                {tab === 'cancelled' && (
                  <button onClick={() => rebook(b)} className="px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase border border-brand-border bg-white text-blue-600 hover:bg-blue-600 hover:text-white transition flex items-center justify-center gap-1">
                    <RotateCcw className="w-3 h-3" /> Rebook
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cancel Confirm */}
      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setConfirm(null)}>
          <div className="card bg-white p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-black text-black uppercase tracking-widest mb-2 border-b border-brand-border pb-2">Cancel Booking?</h3>
            <p className="text-sm font-mono text-slate-600 mb-6">Are you sure you want to cancel your booking for <strong className="text-black bg-blue-100 px-1">{confirm.slot_task_name}</strong>?</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirm(null)} className="flex-1 py-2 border border-brand-border bg-white text-xs font-bold uppercase tracking-widest hover:bg-slate-100">Keep It</button>
              <button onClick={() => cancelBooking(confirm)} className="flex-1 py-2 border border-brand-border bg-red-500 text-white text-xs font-bold uppercase tracking-widest hover:bg-red-600 disabled:opacity-50">Yes, Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
