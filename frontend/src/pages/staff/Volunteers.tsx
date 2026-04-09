import { useState, useEffect } from 'react';
import { volunteersAPI } from '../../api/client';
import type { VolunteerSlot, Volunteer, SlotBooking } from '../../types';
import { Plus, Edit, Eye, Trash2, X, Users, Loader2, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function StaffVolunteers() {
  const [tab, setTab] = useState<'slots'|'directory'|'analytics'>('slots');
  const [slots, setSlots] = useState<VolunteerSlot[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editSlot, setEditSlot] = useState<VolunteerSlot | null>(null);
  const [viewBookings, setViewBookings] = useState<{slot: VolunteerSlot; bookings: SlotBooking[]} | null>(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({task_name:'',description:'',date:'',time:'10:00 AM',location:'',required_skills:'',max_volunteers:5});

  useEffect(() => { load(); }, []);
  const load = async () => {
    try {
      const [sl, vl] = await Promise.all([volunteersAPI.getSlots(true), volunteersAPI.getAll()]);
      setSlots(sl); setVolunteers(vl);
    } catch { toast.error('Failed to load'); }
    setLoading(false);
  };

  const submitSlot = async () => {
    if (!form.task_name || !form.date || !form.location) { toast.error('Fill required fields'); return; }
    try {
      if (editSlot) {
        await volunteersAPI.updateSlot(editSlot.id, form);
        toast.success('Slot updated');
      } else {
        await volunteersAPI.createSlot(form);
        toast.success('Slot created');
      }
      setShowCreate(false); setEditSlot(null);
      setForm({task_name:'',description:'',date:'',time:'10:00 AM',location:'',required_skills:'',max_volunteers:5});
      load();
    } catch (e: any) { toast.error(e.response?.data?.detail || 'Failed'); }
  };

  const closeSlot = async (s: VolunteerSlot) => {
    try { await volunteersAPI.updateSlot(s.id, {is_active: false}); toast.success('Slot closed'); load(); }
    catch { toast.error('Failed'); }
  };

  const deleteSlot = async (s: VolunteerSlot) => {
    try { await volunteersAPI.deleteSlot(s.id); toast.success('Slot deleted'); load(); }
    catch (e: any) { toast.error(e.response?.data?.detail || 'Cannot delete'); }
  };

  const loadBookings = async (s: VolunteerSlot) => {
    try { const b = await volunteersAPI.getSlotBookings(s.id); setViewBookings({slot: s, bookings: b}); }
    catch { toast.error('Failed to load bookings'); }
  };

  const exportCSV = (bookings: SlotBooking[]) => {
    const csv = 'Name,Booked At,Status\n' + bookings.map(b => `${b.volunteer_name},${new Date(b.booked_at).toLocaleDateString()},${b.status}`).join('\n');
    const blob = new Blob([csv], {type:'text/csv'});
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'bookings.csv'; a.click();
  };

  if (loading) return <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <h1 className="text-3xl font-black text-black uppercase tracking-tight mb-6">Volunteer Management</h1>

      <div className="flex gap-4 mb-6 flex-wrap">
        {(['slots','directory','analytics'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`font-mono px-4 py-2 text-sm font-bold uppercase transition-all border-2 border-black ${tab===t?'bg-emerald-400 shadow-[4px_4px_0_0_rgba(0,0,0,1)] text-black translate-y-[-2px]':'bg-white shadow-[2px_2px_0_0_rgba(0,0,0,1)] text-black hover:bg-emerald-50 hover:translate-y-[-2px] hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)]'}`}>
            {t === 'slots' ? 'Manage Slots' : t === 'directory' ? 'Volunteer Directory' : 'Analytics'}
          </button>
        ))}
      </div>

      {tab === 'slots' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white p-4 border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-3 w-5 h-5 text-black" />
              <input value={search} onChange={e => setSearch(e.target.value)} className="w-full h-12 pl-10 pr-4 bg-white border-2 border-black font-mono text-sm shadow-[2px_2px_0_0_rgba(0,0,0,1)] focus:outline-none" placeholder="SEARCH SLOTS..." />
            </div>
            <button onClick={() => { setShowCreate(true); setEditSlot(null); setForm({task_name:'',description:'',date:'',time:'10:00 AM',location:'',required_skills:'',max_volunteers:5}); }}
              className="px-6 py-3 bg-emerald-400 text-black border-2 border-black font-black uppercase text-sm shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-all flex items-center gap-2"><Plus className="w-5 h-5" /> Post New Slot</button>
          </div>
          <div className="bg-white border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] overflow-hidden">
            <table className="w-full text-sm font-mono">
              <thead><tr className="bg-emerald-400 border-b-2 border-black text-black"><th className="text-left px-4 py-3 font-bold uppercase">Task</th><th className="text-left px-4 py-3 font-bold uppercase">Date</th><th className="text-left px-4 py-3 font-bold uppercase">Location</th><th className="text-left px-4 py-3 font-bold uppercase">Booked</th><th className="text-left px-4 py-3 font-bold uppercase">Status</th><th className="text-left px-4 py-3 font-bold uppercase">Actions</th></tr></thead>
              <tbody>
                {slots.filter(s => !search || s.task_name.toLowerCase().includes(search.toLowerCase())).map(s => (
                  <tr key={s.id} className="border-b-2 border-black last:border-b-0 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-bold uppercase">{s.task_name}</td>
                    <td className="px-4 py-3 text-slate-600 font-bold">{new Date(s.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3 font-bold">{s.location}</td>
                    <td className="px-4 py-3 text-emerald-600 font-black">{s.booked_count}/{s.max_volunteers}</td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] font-bold uppercase ${s.is_active?'bg-green-400 text-black':'bg-slate-300 text-black'}`}>{s.is_active?'Active':'Closed'}</span></td>
                    <td className="px-4 py-3 flex gap-2">
                      <button onClick={() => loadBookings(s)} className="p-2 bg-blue-300 border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:translate-y-[2px] transition-all text-black" title="View Bookings"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => { setEditSlot(s); setForm({task_name:s.task_name,description:s.description,date:s.date,time:s.time,location:s.location,required_skills:s.required_skills,max_volunteers:s.max_volunteers}); setShowCreate(true); }}
                        className="p-2 bg-amber-300 border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:translate-y-[2px] transition-all text-black" title="Edit"><Edit className="w-4 h-4" /></button>
                      {s.is_active && <button onClick={() => closeSlot(s)} className="p-2 bg-slate-300 border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:translate-y-[2px] transition-all text-black" title="Close"><X className="w-4 h-4" /></button>}
                      <button onClick={() => deleteSlot(s)} className="p-2 bg-red-400 border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:translate-y-[2px] transition-all text-black" title="Delete"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'directory' && (
        <div className="bg-white border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] overflow-hidden">
          <table className="w-full text-sm font-mono">
            <thead><tr className="bg-emerald-400 border-b-2 border-black text-black"><th className="text-left px-4 py-3 font-bold uppercase">Name</th><th className="text-left px-4 py-3 font-bold uppercase">Email</th><th className="text-left px-4 py-3 font-bold uppercase">Skills</th><th className="text-left px-4 py-3 font-bold uppercase">Hours</th><th className="text-left px-4 py-3 font-bold uppercase">Status</th></tr></thead>
            <tbody>
              {volunteers.map(v => (
                <tr key={v.id} className="border-b-2 border-black last:border-b-0 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-bold uppercase">{v.user?.full_name}</td>
                  <td className="px-4 py-3 text-slate-600 font-bold">{v.user?.email}</td>
                  <td className="px-4 py-3"><div className="flex flex-wrap gap-2">{(() => { try { const parsed = JSON.parse(v.skills); return Array.isArray(parsed) ? parsed : [String(parsed)]; } catch { return typeof v.skills === 'string' ? v.skills.split(',').map(s=>s.trim()) : []; }})().map((s: string) => <span key={s} className="text-[10px] px-2 py-0.5 bg-blue-300 border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] text-black font-bold uppercase">{s}</span>)}</div></td>
                  <td className="px-4 py-3 font-black text-emerald-600">{v.total_hours}h</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] font-bold uppercase ${v.status==='ACTIVE'?'bg-green-400 text-black':'bg-red-400 text-black'}`}>{v.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'analytics' && (
        <div className="grid grid-cols-4 gap-6">
          {[
            { label: 'AVG BOOKINGS/SLOT', value: slots.length > 0 ? (slots.reduce((s,sl) => s+sl.booked_count, 0) / slots.length).toFixed(1) : '0' },
            { label: 'TOTAL VOLUNTEERS', value: volunteers.length },
            { label: 'TOTAL HOURS', value: `${volunteers.reduce((s,v)=>s+v.total_hours,0).toFixed(0)}h` },
            { label: 'SLOTS 100% FULL', value: slots.filter(s => s.booked_count >= s.max_volunteers).length },
          ].map(s => (
            <div key={s.label} className="bg-white border-2 border-black p-5 shadow-[4px_4px_0_0_rgba(0,0,0,1)] text-center">
              <p className="text-4xl font-black text-black font-mono">{s.value}</p>
              <p className="text-xs mt-2 font-bold uppercase text-slate-500 tracking-wider font-mono">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowCreate(false)}>
          <div className="bg-white border-4 border-black p-6 w-full max-w-lg shadow-[8px_8px_0_0_rgba(0,0,0,1)] rounded-none max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 border-b-2 border-black pb-4">
              <h3 className="text-2xl font-black uppercase tracking-tight text-black">{editSlot ? 'Edit Slot' : 'Post New Slot'}</h3>
              <button onClick={() => setShowCreate(false)} className="p-2 border-2 border-black hover:bg-emerald-400 shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-colors"><X className="w-5 h-5 text-black" /></button>
            </div>
            <div className="space-y-4 font-mono">
              <input value={form.task_name} onChange={e => setForm({...form, task_name: e.target.value})} placeholder="TASK NAME *" className="w-full h-12 px-4 border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] text-sm focus:outline-none focus:bg-emerald-50" />
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="DESCRIPTION" rows={3} className="w-full px-4 py-3 border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] text-sm resize-none focus:outline-none focus:bg-emerald-50" />
              <div className="grid grid-cols-2 gap-4">
                <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="h-12 px-4 border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] text-sm focus:outline-none focus:bg-emerald-50 uppercase" />
                <input value={form.time} onChange={e => setForm({...form, time: e.target.value})} placeholder="TIME" className="h-12 px-4 border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] text-sm focus:outline-none focus:bg-emerald-50" />
              </div>
              <input value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder="LOCATION *" className="w-full h-12 px-4 border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] text-sm focus:outline-none focus:bg-emerald-50" />
              <input value={form.required_skills} onChange={e => setForm({...form, required_skills: e.target.value})} placeholder='SKILLS (JSON: ["Teaching","IT Support"])' className="w-full h-12 px-4 border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] text-sm focus:outline-none focus:bg-emerald-50" />
              <input type="number" value={form.max_volunteers} onChange={e => setForm({...form, max_volunteers: parseInt(e.target.value)})} placeholder="MAX VOLUNTEERS" className="w-full h-12 px-4 border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] text-sm focus:outline-none focus:bg-emerald-50" />
              <button onClick={submitSlot} className="w-full mt-6 py-4 bg-emerald-400 text-black border-2 border-black font-black uppercase text-sm shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-all flex items-center justify-center">{editSlot ? 'SAVE CHANGES' : 'POST SLOT'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Bookings Modal */}
      {viewBookings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setViewBookings(null)}>
          <div className="bg-white border-4 border-black p-6 w-full max-w-lg shadow-[8px_8px_0_0_rgba(0,0,0,1)] rounded-none" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 border-b-2 border-black pb-4">
              <h3 className="text-2xl font-black uppercase tracking-tight text-black">BOOKINGS — {viewBookings.slot.task_name}</h3>
              <button onClick={() => setViewBookings(null)} className="p-2 border-2 border-black hover:bg-emerald-400 shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-colors"><X className="w-5 h-5 text-black" /></button>
            </div>
            {viewBookings.bookings.length === 0 ? <p className="font-mono text-slate-500 font-bold uppercase text-center py-6 border-2 border-dashed border-slate-300">NO BOOKINGS FOUND</p> : (
              <table className="w-full text-sm font-mono border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                <thead><tr className="bg-emerald-400 border-b-2 border-black"><th className="text-left px-4 py-3 font-bold uppercase text-black">Name</th><th className="text-left px-4 py-3 font-bold uppercase text-black">Booked</th><th className="text-left px-4 py-3 font-bold uppercase text-black">Status</th></tr></thead>
                <tbody>{viewBookings.bookings.map(b => (
                  <tr key={b.id} className="border-b-2 border-black last:border-b-0"><td className="px-4 py-3 font-bold uppercase">{b.volunteer_name}</td><td className="px-4 py-3 text-slate-600 font-bold">{new Date(b.booked_at).toLocaleDateString()}</td><td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] font-bold uppercase ${b.status==='CONFIRMED'?'bg-green-400 text-black':'bg-red-400 text-black'}`}>{b.status}</span></td></tr>
                ))}</tbody>
              </table>
            )}
            <button onClick={() => exportCSV(viewBookings.bookings)} className="w-full mt-6 py-4 bg-emerald-400 text-black border-2 border-black font-black uppercase text-sm shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-all flex items-center justify-center">EXPORT CSV</button>
          </div>
        </div>
      )}
    </div>
  );
}
