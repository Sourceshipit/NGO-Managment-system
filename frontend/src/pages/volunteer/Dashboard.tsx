import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { volunteersAPI } from '../../api/client';
import type { VolunteerStats, SlotBooking, VolunteerSlot } from '../../types';
import { Clock, Calendar, CheckSquare, Star, ArrowRight, MapPin, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const achievements = [
  { id: 'first', icon: '🌱', name: 'First Step', desc: 'Complete first booking', check: (s: VolunteerStats) => s.total_bookings > 0 },
  { id: 'time10', icon: '⏰', name: 'Time Giver', desc: 'Log 10+ hours', check: (s: VolunteerStats) => s.total_hours >= 10 },
  { id: 'star50', icon: '🌟', name: 'Star Volunteer', desc: 'Log 50+ hours', check: (s: VolunteerStats) => s.total_hours >= 50 },
  { id: 'century', icon: '💯', name: 'Century Club', desc: 'Log 100+ hours', check: (s: VolunteerStats) => s.total_hours >= 100 },
  { id: 'ded5', icon: '🔥', name: 'Dedicated', desc: '5+ completed slots', check: (s: VolunteerStats) => s.confirmed_bookings >= 5 },
  { id: 'champ', icon: '🏆', name: 'Champion', desc: '200+ hours', check: (s: VolunteerStats) => s.total_hours >= 200 },
];

export default function VolunteerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<VolunteerStats | null>(null);
  const [bookings, setBookings] = useState<SlotBooking[]>([]);
  const [slots, setSlots] = useState<VolunteerSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState<number | null>(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const [s, b, sl] = await Promise.all([
        volunteersAPI.getMyStats(),
        volunteersAPI.getMyBookings('CONFIRMED'),
        volunteersAPI.getSlots()
      ]);
      setStats(s);
      setBookings(b.filter(bk => bk.slot_date && new Date(bk.slot_date) >= new Date()).slice(0, 3));
      setSlots(sl.filter(s => s.is_active).slice(0, 3));
    } catch { toast.error('Failed to load dashboard'); }
    setLoading(false);
  };

  const cancelBooking = async (b: SlotBooking) => {
    try {
      await volunteersAPI.cancelBooking(b.slot_id, b.id);
      toast.success('Booking cancelled');
      load();
    } catch { toast.error('Failed to cancel'); }
  };

  const quickBook = async (slotId: number) => {
    setBookingLoading(slotId);
    try {
      await volunteersAPI.bookSlot(slotId);
      toast.success('Slot booked! Check My Bookings.');
      load();
    } catch (e: any) {
      toast.error(e.response?.data?.detail || 'Booking failed');
    }
    setBookingLoading(null);
  };

  if (loading) return <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>;
  if (!stats) return null;

  const progress = Math.min(100, (stats.total_hours / stats.next_milestone) * 100);
  const remaining = Math.max(0, stats.next_milestone - stats.total_hours);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Greeting Banner */}
      <div className="card bg-blue-500 p-6 relative overflow-hidden">
        <h1 className="text-2xl font-black text-black uppercase tracking-widest relative">Welcome back, {user?.full_name}! 🌟</h1>
        <p className="text-black font-bold uppercase tracking-wider mt-1 relative">You've contributed <span className="text-white bg-black px-1.5 py-0.5">{stats.total_hours}h</span> to CareConnect</p>
        <div className="mt-6 relative">
          <div className="flex justify-between text-xs font-bold text-black uppercase tracking-widest mb-1">
            <span>Next milestone: {stats.next_milestone}h</span>
            <span>{remaining.toFixed(0)} more to go!</span>
          </div>
          <div className="w-full h-4 border-2 border-black bg-white overflow-hidden">
            <div className="h-full bg-black transition-all duration-500" style={{width: `${progress}%`}}></div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'My Total Hours', value: `${stats.total_hours}h`, icon: Clock, bg: 'bg-white', sub: 'Keep going!' },
          { label: 'Slots Booked', value: stats.total_bookings, icon: Calendar, bg: 'bg-white' },
          { label: 'Upcoming Slots', value: stats.upcoming_slots, icon: CheckSquare, bg: 'bg-white' },
          { label: 'Impact Score', value: stats.impact_score, icon: Star, bg: 'bg-blue-300', sub: 'Personal metric' },
        ].map((c, i) => (
          <div key={i} className={`card p-5 ${c.bg}`}>
            <div className={`w-10 h-10 border-2 border-black bg-black flex items-center justify-center mb-3`}>
              <c.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-3xl font-black text-black leading-none">{c.value}</p>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">{c.label}</p>
            {c.sub && <p className="text-[10px] text-slate-400 font-mono uppercase mt-1">{c.sub}</p>}
          </div>
        ))}
      </div>

      {/* Upcoming + Available */}
      <div className="grid grid-cols-2 gap-6">
        <div className="card p-5 bg-white">
          <div className="flex items-center justify-between mb-4 border-b-2 border-black pb-2">
            <h3 className="font-bold text-black uppercase tracking-widest">My Upcoming Slots</h3>
            <Link to="/volunteer/bookings" className="text-xs font-bold text-blue-600 uppercase hover:underline flex items-center gap-1">View All <ArrowRight className="w-3.5 h-3.5" /></Link>
          </div>
          {bookings.length === 0 ? <p className="text-slate-400 font-mono text-sm py-4 text-center">No upcoming slots booked</p> : (
            <div className="space-y-3">
              {bookings.map(b => (
                <div key={b.id} className="flex items-start justify-between p-3 border-2 border-black bg-slate-50">
                  <div className="flex items-start gap-3">
                    <div className="bg-white border-2 border-black text-black px-2.5 py-1 text-center min-w-[50px]">
                      <p className="text-lg font-black leading-tight">{b.slot_date ? new Date(b.slot_date).getDate() : '--'}</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest">{b.slot_date ? new Date(b.slot_date).toLocaleDateString('en', {month:'short'}) : ''}</p>
                    </div>
                    <div>
                      <p className="font-bold text-sm text-black uppercase tracking-widest">{b.slot_task_name}</p>
                      <p className="text-xs font-mono text-slate-500 flex items-center gap-1 mt-1"><MapPin className="w-3 h-3" />{b.slot_location}</p>
                      <p className="text-xs font-mono text-slate-500 mt-0.5"><Clock className="w-3 h-3 inline mr-1" />{b.slot_time}</p>
                    </div>
                  </div>
                  <button onClick={() => cancelBooking(b)} className="text-[10px] font-bold tracking-widest uppercase border-2 border-black bg-white text-black px-2 py-1 hover:bg-black hover:text-white transition flex items-center gap-1">
                    <X className="w-3 h-3" /> Cancel
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5 bg-white">
          <div className="flex items-center justify-between mb-4 border-b-2 border-black pb-2">
            <h3 className="font-bold text-black uppercase tracking-widest">New Opportunities</h3>
            <Link to="/volunteer/slots" className="text-xs font-bold text-blue-600 uppercase hover:underline flex items-center gap-1">Browse All <ArrowRight className="w-3.5 h-3.5" /></Link>
          </div>
          {slots.length === 0 ? <p className="text-slate-400 font-mono text-sm py-4 text-center">No slots available</p> : (
            <div className="space-y-3">
              {slots.map(s => (
                <div key={s.id} className="flex items-center justify-between p-3 border-2 border-black bg-slate-50 hover:bg-blue-50 transition-colors">
                  <div>
                    <p className="font-bold text-sm text-black uppercase tracking-widest">{s.task_name}</p>
                    <p className="text-xs font-mono text-slate-500 mt-1">{new Date(s.date).toLocaleDateString('en-GB')} • {(() => { try { const p = JSON.parse(s.required_skills); return Array.isArray(p) ? p.join(', ') : String(p); } catch { return typeof s.required_skills === 'string' ? s.required_skills : ''; }})()}</p>
                  </div>
                  <button onClick={() => quickBook(s.id)} disabled={bookingLoading === s.id}
                    className="px-3 py-1.5 border-2 border-black bg-blue-500 text-black text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white transition disabled:opacity-60 disabled:hover:bg-blue-500 disabled:hover:text-black">
                    {bookingLoading === s.id ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : 'Book'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Achievements */}
      <div className="card p-5 bg-white">
        <h3 className="font-bold text-black uppercase tracking-widest mb-4 border-b-2 border-black pb-2">My Achievements</h3>
        <div className="grid grid-cols-6 gap-4">
          {achievements.map(a => {
            const unlocked = a.check(stats);
            return (
              <div key={a.id} className={`text-center p-3 border-2 border-black transition ${unlocked ? 'bg-blue-100 shadow-[2px_2px_0_#000]' : 'opacity-40 grayscale bg-slate-50'}`}>
                <div className={`text-3xl mb-2 ${unlocked ? '' : 'filter grayscale'}`}>{a.icon}</div>
                <p className="text-xs font-bold font-mono text-black uppercase">{a.name}</p>
                <p className="text-[9px] text-slate-500 mt-1 uppercase leading-tight font-bold">{a.desc}</p>
                {unlocked && <p className="text-[10px] bg-black text-blue-400 mt-2 font-bold uppercase tracking-widest px-1 py-0.5">Earned!</p>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
