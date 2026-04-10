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
      <h1 className="page-title text-brand-dark mb-6">Volunteer Management</h1>

      <div className="flex gap-3 mb-6 bg-white/50 p-1.5 rounded-xl border border-brand-border/40 backdrop-blur-sm w-fit">
        {(['slots','directory','analytics'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${
             tab===t ? 'bg-white shadow-sm text-brand-primary' : 'text-brand-dark/60 hover:text-brand-dark hover:bg-white/50'
          }`}>
            {t === 'slots' ? 'Manage Slots' : t === 'directory' ? 'Volunteer Directory' : 'Analytics'}
          </button>
        ))}
      </div>

      {tab === 'slots' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-xl border border-brand-border/50 shadow-sm gap-4">
            <div className="relative flex-1 w-full max-w-md">
              <Search className="absolute left-3 top-3 w-5 h-5 text-brand-dark/40" />
              <input value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-10" placeholder="Search slots by task name..." />
            </div>
            <button onClick={() => { setShowCreate(true); setEditSlot(null); setForm({task_name:'',description:'',date:'',time:'10:00 AM',location:'',required_skills:'',max_volunteers:5}); }}
              className="btn-primary w-full md:w-auto shadow-sm flex items-center gap-2"><Plus className="w-5 h-5" /> Post New Slot</button>
          </div>
          <div className="card bg-white overflow-hidden border-transparent">
            <div className="overflow-x-auto custom-scrollbar">
               <table className="w-full text-sm">
                 <thead><tr className="bg-slate-50 border-b border-brand-border/50 text-brand-dark/60"><th className="text-left px-5 py-3.5 font-semibold text-xs uppercase tracking-wider">Task</th><th className="text-left px-5 py-3.5 font-semibold text-xs uppercase tracking-wider">Date</th><th className="text-left px-5 py-3.5 font-semibold text-xs uppercase tracking-wider">Location</th><th className="text-left px-5 py-3.5 font-semibold text-xs uppercase tracking-wider">Booked</th><th className="text-left px-5 py-3.5 font-semibold text-xs uppercase tracking-wider">Status</th><th className="text-left px-5 py-3.5 font-semibold text-xs uppercase tracking-wider">Actions</th></tr></thead>
                 <tbody>
                   {slots.filter(s => !search || s.task_name.toLowerCase().includes(search.toLowerCase())).map(s => (
                     <tr key={s.id} className="border-b border-brand-border/30 last:border-b-0 hover:bg-slate-50/50 transition-colors">
                       <td className="px-5 py-4 font-bold text-brand-dark">{s.task_name}</td>
                       <td className="px-5 py-4 text-brand-dark/80 font-medium">{new Date(s.date).toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'numeric'})}</td>
                       <td className="px-5 py-4 text-brand-dark/80 font-medium">{s.location}</td>
                       <td className="px-5 py-4"><span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">{s.booked_count} / {s.max_volunteers}</span></td>
                       <td className="px-5 py-4"><span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${s.is_active?'bg-emerald-100 text-emerald-700':'bg-slate-100 text-slate-600'}`}>{s.is_active?'Active':'Closed'}</span></td>
                       <td className="px-5 py-4 flex gap-2">
                         <button onClick={() => loadBookings(s)} className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors" title="View Bookings"><Eye className="w-4 h-4" /></button>
                         <button onClick={() => { setEditSlot(s); setForm({task_name:s.task_name,description:s.description,date:s.date,time:s.time,location:s.location,required_skills:s.required_skills,max_volunteers:s.max_volunteers}); setShowCreate(true); }}
                           className="p-2 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white transition-colors" title="Edit"><Edit className="w-4 h-4" /></button>
                         {s.is_active && <button onClick={() => closeSlot(s)} className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-600 hover:text-white transition-colors" title="Close Slot"><X className="w-4 h-4" /></button>}
                         <button onClick={() => deleteSlot(s)} className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                       </td>
                     </tr>
                   ))}
                   {slots.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-brand-dark/40 font-medium">No slots found</td></tr>}
                 </tbody>
               </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'directory' && (
        <div className="card bg-white overflow-hidden border-transparent">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-sm">
              <thead><tr className="bg-slate-50 border-b border-brand-border/50 text-brand-dark/60"><th className="text-left px-5 py-3.5 font-semibold text-xs uppercase tracking-wider">Name</th><th className="text-left px-5 py-3.5 font-semibold text-xs uppercase tracking-wider">Email</th><th className="text-left px-5 py-3.5 font-semibold text-xs uppercase tracking-wider">Skills</th><th className="text-left px-5 py-3.5 font-semibold text-xs uppercase tracking-wider">Hours</th><th className="text-left px-5 py-3.5 font-semibold text-xs uppercase tracking-wider">Status</th></tr></thead>
              <tbody>
                {volunteers.map(v => (
                  <tr key={v.id} className="border-b border-brand-border/30 last:border-b-0 hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4 font-bold text-brand-dark">{v.user?.full_name}</td>
                    <td className="px-5 py-4 text-brand-dark/70 font-medium">{v.user?.email}</td>
                    <td className="px-5 py-4"><div className="flex flex-wrap gap-1.5">{(() => { try { const parsed = JSON.parse(v.skills); return Array.isArray(parsed) ? parsed : [String(parsed)]; } catch { return typeof v.skills === 'string' ? v.skills.split(',').map(s=>s.trim()) : []; }})().map((s: string) => <span key={s} className="text-[10px] px-2 py-1 bg-brand-primary/10 text-brand-primary rounded-md font-bold uppercase tracking-wider">{s}</span>)}</div></td>
                    <td className="px-5 py-4 font-bold text-emerald-600 bg-emerald-50/50">{v.total_hours}h</td>
                    <td className="px-5 py-4"><span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${v.status==='ACTIVE'?'bg-emerald-100 text-emerald-700':'bg-red-100 text-red-700'}`}>{v.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'analytics' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: 'AVG Bookings/Slot', value: slots.length > 0 ? (slots.reduce((s,sl) => s+sl.booked_count, 0) / slots.length).toFixed(1) : '0' },
            { label: 'Total Volunteers', value: volunteers.length },
            { label: 'Total Hours Donated', value: `${volunteers.reduce((s,v)=>s+v.total_hours,0).toFixed(0)}h` },
            { label: 'Slots Fully Booked', value: slots.filter(s => s.booked_count >= s.max_volunteers).length },
          ].map(s => (
            <div key={s.label} className="card p-6 border-transparent bg-white/80 backdrop-blur-sm text-center flex flex-col justify-center border-t-4 border-t-brand-primary hover:shadow-md transition-shadow">
              <p className="text-4xl font-extrabold text-brand-dark">{s.value}</p>
              <p className="text-xs mt-3 font-semibold text-brand-dark/60 uppercase tracking-widest">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowCreate(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 border-b border-brand-border/50 pb-4">
              <h3 className="text-xl font-bold text-brand-dark">{editSlot ? 'Edit Slot' : 'Post New Slot'}</h3>
              <button onClick={() => setShowCreate(false)} className="p-1.5 rounded-full hover:bg-slate-100 transition-colors"><X className="w-5 h-5 text-brand-dark/50" /></button>
            </div>
            <div className="space-y-4">
              <div><label className="text-xs font-bold text-brand-dark/60 uppercase mb-1 block">Task Name</label>
              <input value={form.task_name} onChange={e => setForm({...form, task_name: e.target.value})} placeholder="e.g. Community Cleanup" className="input-field" /></div>
              
              <div><label className="text-xs font-bold text-brand-dark/60 uppercase mb-1 block">Description</label>
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Description of responsibilities..." rows={3} className="input-field py-3 resize-none" /></div>
              
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-bold text-brand-dark/60 uppercase mb-1 block">Date</label><input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="input-field uppercase" /></div>
                <div><label className="text-xs font-bold text-brand-dark/60 uppercase mb-1 block">Time</label><input value={form.time} onChange={e => setForm({...form, time: e.target.value})} placeholder="10:00 AM" className="input-field" /></div>
              </div>
              
              <div><label className="text-xs font-bold text-brand-dark/60 uppercase mb-1 block">Location</label><input value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder="Location" className="input-field" /></div>
              
              <div><label className="text-xs font-bold text-brand-dark/60 uppercase mb-1 block">Required Skills (Optional)</label><input value={form.required_skills} onChange={e => setForm({...form, required_skills: e.target.value})} placeholder='"Teaching", "First Aid"' className="input-field" /></div>
              
              <div><label className="text-xs font-bold text-brand-dark/60 uppercase mb-1 block">Max Volunteers</label><input type="number" value={form.max_volunteers} onChange={e => setForm({...form, max_volunteers: parseInt(e.target.value)})} className="input-field" /></div>
              
              <button onClick={submitSlot} className="btn-primary w-full mt-6 shadow-md">{editSlot ? 'Save Changes' : 'Post Slot'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Bookings Modal */}
      {viewBookings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setViewBookings(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 border-b border-brand-border/50 pb-4">
              <h3 className="text-lg font-bold text-brand-dark truncate">{viewBookings.slot.task_name} <span className="text-sm font-medium text-brand-dark/50 ml-2">Bookings</span></h3>
              <button onClick={() => setViewBookings(null)} className="p-1.5 rounded-full hover:bg-slate-100 transition-colors"><X className="w-5 h-5 text-brand-dark/50" /></button>
            </div>
            {viewBookings.bookings.length === 0 ? <p className="text-brand-dark/50 font-medium text-sm text-center py-6 border border-dashed border-brand-border/50 rounded-xl bg-slate-50">No volunteers have booked this slot yet.</p> : (
              <div className="max-h-[300px] overflow-y-auto custom-scrollbar border border-brand-border/50 rounded-xl">
                 <table className="w-full text-sm">
                   <thead><tr className="bg-slate-50 border-b border-brand-border/50"><th className="text-left px-4 py-3 font-semibold text-xs text-brand-dark/60 uppercase tracking-wider">Name</th><th className="text-left px-4 py-3 font-semibold text-xs text-brand-dark/60 uppercase tracking-wider">Booked Date</th><th className="text-left px-4 py-3 font-semibold text-xs text-brand-dark/60 uppercase tracking-wider">Status</th></tr></thead>
                   <tbody>{viewBookings.bookings.map(b => (
                     <tr key={b.id} className="border-b border-brand-border/30 last:border-b-0 hover:bg-slate-50"><td className="px-4 py-3 font-bold text-brand-dark">{b.volunteer_name}</td><td className="px-4 py-3 text-brand-dark/70 font-medium">{new Date(b.booked_at).toLocaleDateString()}</td><td className="px-4 py-3"><span className={`text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-wider ${b.status==='CONFIRMED'?'bg-emerald-100 text-emerald-700':'bg-amber-100 text-amber-700'}`}>{b.status}</span></td></tr>
                   ))}</tbody>
                 </table>
              </div>
            )}
            <button onClick={() => exportCSV(viewBookings.bookings)} className="btn-primary w-full mt-6 shadow-sm">Export to CSV</button>
          </div>
        </div>
      )}
    </div>
  );
}
