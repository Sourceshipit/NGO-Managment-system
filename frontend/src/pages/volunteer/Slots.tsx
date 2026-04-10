import { useState, useEffect } from 'react';
import { volunteersAPI } from '../../api/client';
import type { VolunteerSlot } from '../../types';
import { Search, Calendar, MapPin, Clock, Users, Filter, Loader2, ChevronRight, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function VolunteerSlots() {
  const [slots, setSlots] = useState<VolunteerSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState<'week'|'month'|'all'>('all');
  const [bookingSlot, setBookingSlot] = useState<number | null>(null);
  const [bookedIds, setBookedIds] = useState<Set<number>>(new Set());
  const [detail, setDetail] = useState<VolunteerSlot | null>(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const [sl, bk] = await Promise.all([
        volunteersAPI.getSlots(),
        volunteersAPI.getMyBookings('CONFIRMED')
      ]);
      setSlots(sl);
      setBookedIds(new Set(bk.map(b => b.slot_id)));
    } catch { toast.error('Failed to load slots'); }
    setLoading(false);
  };

  const bookSlot = async (id: number) => {
    setBookingSlot(id);
    try {
      await volunteersAPI.bookSlot(id);
      toast.success('Slot booked successfully! Check My Bookings.');
      setBookedIds(prev => new Set(prev).add(id));
      setSlots(prev => prev.map(s => s.id === id ? {...s, booked_count: s.booked_count + 1, is_active: s.booked_count + 1 >= s.max_volunteers ? false : s.is_active} : s));
    } catch (e: any) {
      toast.error(e.response?.data?.detail || 'Booking failed');
    }
    setBookingSlot(null);
  };

  const today = new Date();
  const filtered = slots.filter(s => {
    const d = new Date(s.date);
    if (search && !s.task_name.toLowerCase().includes(search.toLowerCase()) && !s.location.toLowerCase().includes(search.toLowerCase())) return false;
    if (dateFilter === 'week') { const w = new Date(); w.setDate(w.getDate() + 7); return d >= today && d <= w; }
    if (dateFilter === 'month') { const m = new Date(); m.setMonth(m.getMonth() + 1); return d >= today && d <= m; }
    return d >= today;
  });

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="w-8 h-8 animate-spin text-brand-primary" /></div>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="page-title text-3xl mb-2">Browse Volunteer Slots</h1>
        <p className="text-brand-dark/60 font-medium">Find opportunities to make a difference in your community.</p>
      </div>

      <div className="flex items-center gap-4 bg-white/50 p-2 rounded-2xl border border-brand-border/50 backdrop-blur-sm shadow-sm mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-dark/40" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="w-full h-11 pl-11 pr-4 bg-transparent text-brand-dark placeholder-brand-dark/40 text-sm font-medium focus:outline-none focus:ring-0"
            placeholder="Search by task, location, skill..." />
        </div>
        <div className="flex bg-brand-primary/5 p-1 rounded-xl">
          {(['week', 'month', 'all'] as const).map(f => (
            <button key={f} onClick={() => setDateFilter(f)}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${dateFilter === f ? 'bg-white text-brand-primary shadow-sm' : 'text-brand-dark/60 hover:text-brand-dark hover:bg-white/50'}`}>
              {f === 'week' ? 'This Week' : f === 'month' ? 'This Month' : 'All Slots'}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 card bg-white/80 backdrop-blur-md">
          <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
             <Calendar className="w-8 h-8 text-brand-primary" />
          </div>
          <h3 className="text-lg font-bold text-brand-dark">No slots match your filters</h3>
          <button onClick={() => { setSearch(''); setDateFilter('all'); }} className="mt-4 text-sm font-semibold text-brand-primary hover:text-blue-700 transition">Clear Filters</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(s => {
            const isBooked = bookedIds.has(s.id);
            const isFull = s.booked_count >= s.max_volunteers;
            const skills = (() => { try { const p = JSON.parse(s.required_skills); return Array.isArray(p) ? p : [String(p)]; } catch { return typeof s.required_skills === 'string' ? s.required_skills.split(',').map(x=>x.trim()) : []; }})();
            return (
              <div key={s.id} className="card bg-white/80 backdrop-blur-md flex flex-col hover:-translate-y-1 hover:shadow-md hover:border-brand-primary/30 transition-all duration-300 group">
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-4 border-b border-brand-border/50 pb-3">
                    <h3 className="font-bold text-brand-dark text-lg leading-tight group-hover:text-brand-primary transition-colors">{s.task_name}</h3>
                    <span className={`text-[10px] px-2.5 py-1 font-bold uppercase tracking-wider rounded-md ml-2 flex-shrink-0 ${isFull ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'}`}>
                      {isFull ? 'Full' : 'Open'}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-brand-dark/60 line-clamp-2 mb-4 leading-relaxed">{s.description}</p>
                  <div className="space-y-2.5 text-sm font-medium text-brand-dark/70">
                    <p className="flex items-center gap-2.5"><Calendar className="w-4 h-4 text-brand-primary/70" />{new Date(s.date).toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'numeric'})}</p>
                    <p className="flex items-center gap-2.5"><Clock className="w-4 h-4 text-brand-primary/70" />{s.time}</p>
                    <p className="flex items-center gap-2.5 text-brand-dark font-semibold truncate"><MapPin className="w-4 h-4 text-brand-primary/70" />{s.location}</p>
                    <p className="flex items-center gap-2.5"><Users className="w-4 h-4 text-brand-primary/70" />{s.booked_count} / {s.max_volunteers} booked</p>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-5">
                    {skills.map((sk: string) => <span key={sk} className="text-[10px] px-2.5 py-1 rounded-full border border-brand-border/50 bg-brand-light font-semibold text-brand-dark/70 capitalize">{sk}</span>)}
                  </div>
                  <div className="w-full bg-brand-border/30 rounded-full h-2 mt-5 overflow-hidden">
                    <div className="bg-brand-primary h-full rounded-full transition-all duration-500" style={{width: `${(s.booked_count / s.max_volunteers) * 100}%`}}></div>
                  </div>
                </div>
                <div className="border-t border-brand-border/50 p-4 flex gap-3 bg-gradient-to-b from-transparent to-brand-primary/5 rounded-b-xl">
                  <button onClick={() => setDetail(s)} className="flex-1 text-xs font-semibold text-brand-primary hover:text-blue-700 transition flex items-center justify-center gap-1 bg-white hover:bg-brand-primary/10 rounded-lg py-2 border border-brand-primary/20">
                    Details <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => bookSlot(s.id)} disabled={isBooked || isFull || bookingSlot === s.id}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                      isBooked ? 'bg-brand-dark/10 text-brand-dark/50' : isFull ? 'bg-red-50 text-red-400' : 'btn-primary'
                    } disabled:cursor-not-allowed`}>
                    {bookingSlot === s.id ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : isBooked ? 'Booked' : isFull ? 'Full' : 'Book'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Drawer */}
      {detail && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-brand-dark/20 backdrop-blur-sm transition-opacity" onClick={() => setDetail(null)}></div>
          <div className="w-[420px] bg-white border-l border-brand-border/50 shadow-2xl relative h-full flex flex-col animate-slide-in">
            <div className="p-8 flex-1 overflow-y-auto">
              <div className="flex justify-between items-start mb-6 border-b border-brand-border/50 pb-5">
                <h2 className="text-2xl font-bold text-brand-dark leading-tight">{detail.task_name}</h2>
                <button onClick={() => setDetail(null)} className="text-brand-dark/50 hover:bg-brand-primary/10 hover:text-brand-primary rounded-xl transition-colors p-2"><X className="w-6 h-6" /></button>
              </div>
              <p className="text-base font-medium text-brand-dark/70 mb-8 leading-relaxed">{detail.description}</p>
              
              <div className="rounded-2xl border border-brand-border/50 p-5 bg-brand-light mb-8">
                <h4 className="text-xs font-bold text-brand-dark/60 uppercase tracking-wider mb-4 border-b border-brand-border/50 pb-2">Slot Information</h4>
                <div className="space-y-4 text-sm font-medium text-brand-dark">
                  <p className="flex items-center gap-3"><Calendar className="w-5 h-5 text-brand-primary/70" /> <strong>Date:</strong> {new Date(detail.date).toLocaleDateString('en-IN', {weekday:'long',day:'numeric',month:'short',year:'numeric'})}</p>
                  <p className="flex items-center gap-3"><Clock className="w-5 h-5 text-brand-primary/70" /> <strong>Time:</strong> {detail.time}</p>
                  <p className="flex items-center gap-3"><MapPin className="w-5 h-5 text-brand-primary/70" /> <strong>Location:</strong> {detail.location}</p>
                  <p className="flex items-center gap-3"><Users className="w-5 h-5 text-brand-primary/70" /> <strong>Capacity:</strong> <span className="px-2 py-0.5 flex items-center bg-white border border-brand-border/50 rounded-md shadow-sm ml-1">{detail.booked_count} of {detail.max_volunteers} booked</span></p>
                </div>
              </div>

              <div className="mb-8">
                <h4 className="text-xs font-bold text-brand-dark/60 uppercase tracking-wider mb-4 border-b border-brand-border/50 pb-2">Required Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {(() => { try { return JSON.parse(detail.required_skills); } catch { return [detail.required_skills]; }})().map((sk: string) => (
                    <span key={sk} className="px-3 py-1.5 rounded-full border border-brand-primary/20 font-semibold text-xs bg-brand-primary/10 text-brand-primary">{sk}</span>
                  ))}
                </div>
              </div>
              {detail.poster_name && <p className="text-sm font-medium text-brand-dark/50 mt-4 border-t border-brand-border/50 pt-5">Coordinator: <strong className="text-brand-dark font-semibold">{detail.poster_name}</strong></p>}
            </div>
            
            <div className="p-6 border-t border-brand-border/50 bg-slate-50/80 backdrop-blur-sm">
                <button onClick={() => { bookSlot(detail.id); setDetail(null); }}
                  disabled={bookedIds.has(detail.id) || detail.booked_count >= detail.max_volunteers}
                  className={`w-full py-4 rounded-xl text-base font-semibold shadow-sm transition-all ${
                    bookedIds.has(detail.id) ? 'bg-brand-dark/10 text-brand-dark/50 cursor-not-allowed' : detail.booked_count >= detail.max_volunteers ? 'bg-red-50 text-red-500 border border-red-200 cursor-not-allowed' : 'btn-primary'
                  }`}>
                  {bookedIds.has(detail.id) ? 'Already Booked' : detail.booked_count >= detail.max_volunteers ? 'Slot Full' : 'Book This Opportunity'}
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
