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
  const [error, setError] = useState<string | null>(null);
  const [bookingLoading, setBookingLoading] = useState<number | null>(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setError(null);
      const [s, b, sl] = await Promise.all([
        volunteersAPI.getMyStats(),
        volunteersAPI.getMyBookings('CONFIRMED'),
        volunteersAPI.getSlots()
      ]);
      setStats(s);
      setBookings(b.filter(bk => bk.slot_date && new Date(bk.slot_date) >= new Date()).slice(0, 3));
      setSlots(sl.filter(s => s.is_active).slice(0, 3));
    } catch (e: any) { 
      const errMessage = e.response?.data?.detail || e.message || 'Failed to load dashboard data. Please try again or check your account setup.';
      setError(errMessage);
      toast.error('Failed to load dashboard'); 
    }
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

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="w-8 h-8 animate-spin text-brand-primary" /></div>;
  if (error) return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 flex flex-col items-center justify-center min-h-[40vh]">
      <div className="card shadow-sm border-red-200 bg-red-50/50 p-8 max-w-lg text-center backdrop-blur-sm rounded-2xl">
        <X className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-red-800 mb-2">Dashboard Unavailable</h2>
        <p className="text-red-600/80 mb-6">{error}</p>
        <button onClick={load} className="btn-primary">Try Again</button>
      </div>
    </div>
  );
  if (!stats) return null;

  const progress = Math.min(100, (stats.total_hours / stats.next_milestone) * 100);
  const remaining = Math.max(0, stats.next_milestone - stats.total_hours);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Greeting Banner */}
      <div className="card bg-gradient-to-br from-brand-primary/10 via-white to-blue-50/20 border-brand-primary/20 p-8 relative overflow-hidden group">
        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none mix-blend-overlay"></div>
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-brand-primary/5 rounded-full blur-3xl group-hover:bg-brand-primary/10 transition-colors duration-1000"></div>
        
        <h1 className="page-title relative">Welcome back, {user?.full_name}! 👋</h1>
        <p className="text-brand-dark/70 font-medium mt-2 relative">You've contributed <span className="text-brand-primary font-bold">{stats.total_hours}h</span> to CareConnect</p>
        
        <div className="mt-8 relative max-w-xl">
          <div className="flex justify-between text-sm font-medium text-brand-dark/70 mb-2">
             <span>Next milestone: {stats.next_milestone}h</span>
             <span className="text-brand-primary">{remaining.toFixed(0)} more to go!</span>
          </div>
          <div className="w-full h-3 bg-brand-border/30 rounded-full overflow-hidden backdrop-blur-sm">
             <div className="h-full bg-gradient-to-r from-brand-primary to-blue-400 rounded-full transition-all duration-1000 ease-out" style={{width: `${progress}%`}}></div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'My Total Hours', value: `${stats.total_hours}h`, icon: Clock, bg: 'bg-white/80' },
          { label: 'Slots Booked', value: stats.total_bookings, icon: Calendar, bg: 'bg-white/80' },
          { label: 'Upcoming Slots', value: stats.upcoming_slots, icon: CheckSquare, bg: 'bg-brand-primary/5' },
          { label: 'Impact Score', value: stats.impact_score, icon: Star, bg: 'bg-gradient-to-br from-brand-primary/10 to-transparent border-brand-primary/20', iconColor: 'text-brand-primary' },
        ].map((c, i) => (
          <div key={i} className={`card p-5 hover:-translate-y-1 transition-all duration-300 ${c.bg}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${c.iconColor ? 'bg-white/50 backdrop-blur-md shadow-sm' : 'bg-brand-light'}`}>
              <c.icon className={`w-5 h-5 ${c.iconColor || 'text-brand-dark/70'}`} />
            </div>
            <p className="text-3xl font-bold text-brand-dark leading-none">{c.value}</p>
            <p className="text-sm font-medium text-brand-dark/60 mt-2">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Upcoming + Available */}
      <div className="grid grid-cols-2 gap-6">
        <div className="card p-6 bg-white/80 backdrop-blur-md">
          <div className="flex items-center justify-between mb-5 border-b border-brand-border/50 pb-3">
             <h3 className="font-bold text-brand-dark text-lg flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-brand-primary/70"/> My Upcoming Slots
             </h3>
             <Link to="/volunteer/bookings" className="text-sm font-semibold text-brand-primary hover:text-blue-700 flex items-center gap-1 transition-colors">View All <ArrowRight className="w-4 h-4" /></Link>
          </div>
          {bookings.length === 0 ? <p className="text-brand-dark/40 text-center py-6">No upcoming slots booked</p> : (
            <div className="space-y-3">
              {bookings.map(b => (
                <div key={b.id} className="flex items-start justify-between p-4 rounded-xl border border-brand-border hover:border-brand-primary/30 bg-white shadow-sm hover:shadow-md transition-all group">
                  <div className="flex items-start gap-4">
                     <div className="bg-brand-primary/5 text-brand-primary rounded-lg px-3 py-2 text-center min-w-[55px] border border-brand-primary/10">
                        <p className="text-xl font-bold leading-tight">{b.slot_date ? new Date(b.slot_date).getDate() : '--'}</p>
                        <p className="text-[10px] font-semibold uppercase">{b.slot_date ? new Date(b.slot_date).toLocaleDateString('en', {month:'short'}) : ''}</p>
                     </div>
                     <div>
                        <p className="font-semibold text-brand-dark group-hover:text-brand-primary transition-colors">{b.slot_task_name}</p>
                        <p className="text-sm text-brand-dark/60 flex items-center gap-1.5 mt-1"><MapPin className="w-3.5 h-3.5 opacity-70" />{b.slot_location}</p>
                        <p className="text-sm text-brand-dark/60 mt-0.5 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 opacity-70" />{b.slot_time}</p>
                     </div>
                  </div>
                  <button onClick={() => cancelBooking(b)} className="text-xs font-medium text-red-500 hover:text-white px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-500 hover:border-red-500 transition-all flex items-center gap-1">
                     <X className="w-3.5 h-3.5" /> Cancel
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-6 bg-white/80 backdrop-blur-md">
          <div className="flex items-center justify-between mb-5 border-b border-brand-border/50 pb-3">
             <h3 className="font-bold text-brand-dark text-lg flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400"/> New Opportunities
             </h3>
             <Link to="/volunteer/slots" className="text-sm font-semibold text-brand-primary hover:text-blue-700 flex items-center gap-1 transition-colors">Browse All <ArrowRight className="w-4 h-4" /></Link>
          </div>
          {slots.length === 0 ? <p className="text-brand-dark/40 text-center py-6">No slots available right now</p> : (
            <div className="space-y-3">
              {slots.map(s => (
                <div key={s.id} className="flex items-center justify-between p-4 rounded-xl border border-brand-border bg-white hover:border-brand-primary/30 hover:shadow-md transition-all group">
                  <div>
                    <p className="font-semibold text-brand-dark group-hover:text-brand-primary transition-colors">{s.task_name}</p>
                    <p className="text-sm text-brand-dark/60 mt-1 flex items-center gap-2">
                       <Calendar className="w-3.5 h-3.5 opacity-70"/> {new Date(s.date).toLocaleDateString('en-GB')} 
                       <span className="text-brand-border">•</span> 
                       {(() => { try { const p = JSON.parse(s.required_skills); return Array.isArray(p) ? p.join(', ') : String(p); } catch { return typeof s.required_skills === 'string' ? s.required_skills : ''; }})()}
                    </p>
                  </div>
                  <button onClick={() => quickBook(s.id)} disabled={bookingLoading === s.id}
                     className="btn-primary py-2 px-5 text-sm w-auto whitespace-nowrap min-w-[80px]">
                     {bookingLoading === s.id ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Book'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Achievements */}
      <div className="card p-6 bg-white/80 backdrop-blur-md">
         <h3 className="font-bold text-brand-dark text-lg mb-6 border-b border-brand-border/50 pb-3">My Achievements</h3>
         <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {achievements.map(a => {
            const unlocked = a.check(stats);
            return (
              <div key={a.id} className={`flex flex-col items-center p-4 rounded-xl border transition-all duration-500 ${unlocked ? 'border-brand-primary/20 bg-gradient-to-b from-white to-brand-primary/5 shadow-sm hover:shadow-md hover:-translate-y-1' : 'border-brand-border/50 bg-slate-50/50 opacity-60 grayscale'}`}>
                 <div className={`text-4xl mb-3 ${unlocked ? 'drop-shadow-sm scale-110 transition-transform' : ''}`}>{a.icon}</div>
                 <p className="text-sm font-semibold text-brand-dark text-center">{a.name}</p>
                 <p className="text-xs text-brand-dark/60 mt-1 text-center font-medium leading-tight">{a.desc}</p>
                 {unlocked && <span className="text-[10px] bg-brand-primary text-white mt-3 font-semibold px-2 py-0.5 rounded-full shadow-sm">Earned!</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
