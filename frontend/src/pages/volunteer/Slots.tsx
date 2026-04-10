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

  if (loading) return <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-black text-black uppercase tracking-widest mb-1">Browse Volunteer Slots</h1>
      <p className="text-sm font-mono text-slate-500 mb-6 uppercase">Find opportunities to make a difference</p>

      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-white border border-brand-border text-sm uppercase font-mono focus:outline-none focus:ring-0"
            placeholder="Search by task, location, skill..." />
        </div>
        <div className="flex border border-brand-border bg-white">
          {(['week', 'month', 'all'] as const).map(f => (
            <button key={f} onClick={() => setDateFilter(f)}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-widest transition border-r-2 last:border-r-0 border-black ${dateFilter === f ? 'bg-black text-white' : 'text-slate-600 hover:bg-slate-200'}`}>
              {f === 'week' ? 'This Week' : f === 'month' ? 'This Month' : 'All'}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 border border-brand-border bg-white">
          <Calendar className="w-16 h-16 text-black mx-auto mb-4" />
          <h3 className="text-lg font-bold text-black uppercase tracking-widest">No slots match your filters</h3>
          <button onClick={() => { setSearch(''); setDateFilter('all'); }} className="mt-3 text-xs font-bold uppercase tracking-widest text-blue-600 hover:underline">Clear Filters</button>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {filtered.map(s => {
            const isBooked = bookedIds.has(s.id);
            const isFull = s.booked_count >= s.max_volunteers;
            const skills = (() => { try { const p = JSON.parse(s.required_skills); return Array.isArray(p) ? p : [String(p)]; } catch { return typeof s.required_skills === 'string' ? s.required_skills.split(',').map(x=>x.trim()) : []; }})();
            return (
              <div key={s.id} className="card bg-white border border-brand-border flex flex-col hover:-translate-y-1 hover:shadow-[4px_4px_0_#000] transition-all">
                <div className="p-5 flex-1">
                  <div className="flex justify-between items-start mb-3 border-b border-brand-border pb-2">
                    <h3 className="font-bold text-black uppercase tracking-widest leading-tight">{s.task_name}</h3>
                    <span className={`text-[10px] px-2 py-0.5 font-bold uppercase tracking-widest border border-brand-border ml-2 ${isFull ? 'bg-red-500 text-white' : 'bg-black text-white'}`}>
                      {isFull ? 'Full' : 'Open'}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-slate-600 line-clamp-2 mb-3 uppercase">{s.description}</p>
                  <div className="space-y-2 text-xs font-mono text-slate-500">
                    <p className="flex items-center gap-2"><Calendar className="w-4 h-4 text-black" />{new Date(s.date).toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'numeric'})}</p>
                    <p className="flex items-center gap-2"><Clock className="w-4 h-4 text-black" />{s.time}</p>
                    <p className="flex items-center gap-2 text-black font-bold truncate"><MapPin className="w-4 h-4" />{s.location}</p>
                    <p className="flex items-center gap-2"><Users className="w-4 h-4 text-black" />{s.booked_count} / {s.max_volunteers} booked</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {skills.map((sk: string) => <span key={sk} className="text-[10px] px-2 py-0.5 border border-brand-border font-bold uppercase">{sk}</span>)}
                  </div>
                  <div className="w-full border border-brand-border bg-white h-3 mt-4 overflow-hidden">
                    <div className="bg-blue-500 h-full border-r border-brand-border transition-all" style={{width: `${(s.booked_count / s.max_volunteers) * 100}%`}}></div>
                  </div>
                </div>
                <div className="border-t border-brand-border p-3 flex gap-2 bg-slate-50">
                  <button onClick={() => setDetail(s)} className="flex-1 text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:text-black transition flex items-center justify-center gap-1 border-2 border-transparent hover:border-black">
                    View Details <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => bookSlot(s.id)} disabled={isBooked || isFull || bookingSlot === s.id}
                    className={`flex-1 py-2 border border-brand-border text-xs font-bold uppercase tracking-widest transition ${
                      isBooked ? 'bg-black text-white' : isFull ? 'bg-slate-200 text-slate-400' : 'bg-blue-500 text-black hover:bg-black hover:text-white'
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
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/60" onClick={() => setDetail(null)}></div>
          <div className="w-[420px] bg-white border-l-4 border-black overflow-y-auto animate-slide-in">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4 border-b border-brand-border pb-4">
                <h2 className="text-xl font-black text-black uppercase tracking-widest">{detail.task_name}</h2>
                <button onClick={() => setDetail(null)} className="text-black hover:bg-black hover:text-white border-2 border-transparent hover:border-black transition p-1"><X className="w-6 h-6" /></button>
              </div>
              <p className="text-sm font-mono text-slate-600 mb-6 uppercase leading-relaxed">{detail.description}</p>
              
              <div className="border border-brand-border p-4 bg-slate-50 mb-6">
                <h4 className="text-[10px] font-bold text-black uppercase tracking-widest mb-3 border-b border-brand-border pb-1">Slot Information</h4>
                <div className="space-y-3 text-sm font-mono text-black uppercase">
                  <p className="flex items-center gap-3"><Calendar className="w-4 h-4" /> <strong>Date:</strong> {new Date(detail.date).toLocaleDateString('en-IN', {weekday:'long',day:'numeric',month:'short',year:'numeric'})}</p>
                  <p className="flex items-center gap-3"><Clock className="w-4 h-4" /> <strong>Time:</strong> {detail.time}</p>
                  <p className="flex items-center gap-3"><MapPin className="w-4 h-4" /> <strong>Location:</strong> {detail.location}</p>
                  <p className="flex items-center gap-3"><Users className="w-4 h-4" /> <strong>Capacity:</strong> {detail.booked_count} / {detail.max_volunteers}</p>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-[10px] font-bold text-black uppercase tracking-widest mb-3 border-b border-brand-border pb-1">Required Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {(() => { try { return JSON.parse(detail.required_skills); } catch { return [detail.required_skills]; }})().map((sk: string) => (
                    <span key={sk} className="px-2 py-1 border border-brand-border font-bold uppercase text-[10px] bg-blue-100">{sk}</span>
                  ))}
                </div>
              </div>
              {detail.poster_name && <p className="text-xs font-mono text-slate-500 mb-6 uppercase border-t border-brand-border pt-4">Posted by <strong className="text-black">{detail.poster_name}</strong></p>}
              
              <button onClick={() => { bookSlot(detail.id); setDetail(null); }}
                disabled={bookedIds.has(detail.id) || detail.booked_count >= detail.max_volunteers}
                className={`w-full py-3 border border-brand-border text-sm font-bold uppercase tracking-widest transition ${
                  bookedIds.has(detail.id) ? 'bg-black text-white' : detail.booked_count >= detail.max_volunteers ? 'bg-slate-200 text-slate-400' : 'bg-blue-500 text-black hover:bg-black hover:text-white'
                }`}>
                {bookedIds.has(detail.id) ? 'Already Booked' : detail.booked_count >= detail.max_volunteers ? 'Slot Full' : 'Book This Slot'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
