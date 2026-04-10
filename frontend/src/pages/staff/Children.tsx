import { useState, useEffect } from 'react';
import { childrenAPI } from '../../api/client';
import type { Child } from '../../types';
import { Plus, Edit, Search, X, Loader2, Baby } from 'lucide-react';
import toast from 'react-hot-toast';

const mask = (s: string) => s.length > 2 ? s[0] + '***' + s[s.length-1] : '***';

export default function StaffChildren() {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [programFilter, setProgramFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editChild, setEditChild] = useState<Child | null>(null);
  const [form, setForm] = useState({name:'',dob:'',gender:'Male',address:'',program:'SHIKSHA',branch:'Mumbai Central',guardian_name:'',guardian_contact:'',medical_notes:''});

  useEffect(() => { load(); }, []);
  const load = async () => {
    try { setChildren(await childrenAPI.getAll()); } catch { toast.error('Failed to load'); }
    setLoading(false);
  };

  const submit = async () => {
    if (!form.name || !form.dob || !form.program || !form.branch) { toast.error('Fill all required fields'); return; }
    try {
      if (editChild) { await childrenAPI.update(editChild.id, form); toast.success('Record updated'); }
      else { await childrenAPI.create(form); toast.success('Child added'); }
      setShowModal(false); setEditChild(null);
      setForm({name:'',dob:'',gender:'Male',address:'',program:'SHIKSHA',branch:'Mumbai Central',guardian_name:'',guardian_contact:'',medical_notes:''});
      load();
    } catch { toast.error('Failed'); }
  };

  const filtered = children.filter(c => {
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (programFilter && c.program !== programFilter) return false;
    if (branchFilter && c.branch !== branchFilter) return false;
    return true;
  });

  if (loading) return <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>;

  const programs = [...new Set(children.map(c => c.program))];
  const branches = [...new Set(children.map(c => c.branch))];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="page-title text-brand-dark">Children Records</h1>
          <p className="text-sm font-medium text-brand-dark/60 mt-1">{children.length} children enrolled (data masked for staff)</p>
        </div>
        <button onClick={() => { setShowModal(true); setEditChild(null); setForm({name:'',dob:'',gender:'Male',address:'',program:'SHIKSHA',branch:'Mumbai Central',guardian_name:'',guardian_contact:'',medical_notes:''}); }}
          className="btn-primary shadow-sm flex items-center gap-2"><Plus className="w-5 h-5" /> Add Child</button>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-3.5 w-5 h-5 text-brand-dark/40" />
          <input value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-10" placeholder="Search by name..." />
        </div>
        <select value={programFilter} onChange={e => setProgramFilter(e.target.value)} className="input-field md:w-48 appearance-none bg-white">
          <option value="">All Programs</option>{programs.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={branchFilter} onChange={e => setBranchFilter(e.target.value)} className="input-field md:w-48 appearance-none bg-white">
          <option value="">All Branches</option>{branches.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
        {(search || programFilter || branchFilter) && (
          <button onClick={() => { setSearch(''); setProgramFilter(''); setBranchFilter(''); }} className="text-sm text-brand-dark hover:text-brand-primary font-semibold underline whitespace-nowrap">Clear Filters</button>
        )}
      </div>

      <div className="card bg-white overflow-hidden border-transparent">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 border-b border-brand-border/50 text-brand-dark/60"><th className="text-left px-5 py-3.5 font-semibold text-xs uppercase tracking-wider">Name</th><th className="text-left px-5 py-3.5 font-semibold text-xs uppercase tracking-wider">Gender</th><th className="text-left px-5 py-3.5 font-semibold text-xs uppercase tracking-wider">Program</th><th className="text-left px-5 py-3.5 font-semibold text-xs uppercase tracking-wider">Branch</th><th className="text-left px-5 py-3.5 font-semibold text-xs uppercase tracking-wider">Guardian</th><th className="text-left px-5 py-3.5 font-semibold text-xs uppercase tracking-wider">Actions</th></tr></thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} className="border-b border-brand-border/30 last:border-b-0 hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4 font-bold text-brand-dark">{mask(c.name)}</td>
                  <td className="px-5 py-4 font-medium text-brand-dark/80">{c.gender}</td>
                  <td className="px-5 py-4"><span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${c.program==='SHIKSHA'?'bg-blue-100 text-blue-700':c.program==='SWASTHYA'?'bg-emerald-100 text-emerald-700':c.program==='AAJEEVIKA'?'bg-purple-100 text-purple-700':'bg-amber-100 text-amber-700'}`}>{c.program}</span></td>
                  <td className="px-5 py-4 font-medium text-brand-dark/80">{c.branch}</td>
                  <td className="px-5 py-4 font-medium text-brand-dark/80">{mask(c.guardian_name)}</td>
                  <td className="px-5 py-4">
                    <button onClick={() => { setEditChild(c); setForm({name:c.name,dob:c.dob,gender:c.gender,address:c.address,program:c.program,branch:c.branch,guardian_name:c.guardian_name,guardian_contact:c.guardian_contact,medical_notes:c.medical_notes||''}); setShowModal(true); }}
                      className="p-2 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white transition-colors" title="Edit"><Edit className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-brand-dark/40 font-medium">No children records match.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl border border-transparent max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 border-b border-brand-border/50 pb-4">
              <h3 className="text-xl font-bold text-brand-dark">{editChild ? 'Edit Child Info' : 'Enroll child'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-full hover:bg-slate-100 transition-colors"><X className="w-5 h-5 text-brand-dark/50" /></button>
            </div>
            <div className="space-y-4">
              <div><label className="text-xs font-bold text-brand-dark/60 uppercase mb-1 block">Full Name</label><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Child's Full Name" className="input-field" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-bold text-brand-dark/60 uppercase mb-1 block">Date of Birth</label><input type="date" value={form.dob} onChange={e => setForm({...form, dob: e.target.value})} className="input-field uppercase" /></div>
                <div><label className="text-xs font-bold text-brand-dark/60 uppercase mb-1 block">Gender</label><select value={form.gender} onChange={e => setForm({...form, gender: e.target.value})} className="input-field appearance-none">
                  <option>Male</option><option>Female</option><option>Other</option>
                </select></div>
              </div>
              <div><label className="text-xs font-bold text-brand-dark/60 uppercase mb-1 block">Address</label><textarea value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Residential Address" rows={2} className="input-field py-3 resize-none" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-bold text-brand-dark/60 uppercase mb-1 block">Program</label><select value={form.program} onChange={e => setForm({...form, program: e.target.value})} className="input-field appearance-none">
                  <option value="SHIKSHA">SHIKSHA</option><option value="SWASTHYA">SWASTHYA</option><option value="AAJEEVIKA">AAJEEVIKA</option><option value="UNNATI">UNNATI</option>
                </select></div>
                <div><label className="text-xs font-bold text-brand-dark/60 uppercase mb-1 block">Branch</label><select value={form.branch} onChange={e => setForm({...form, branch: e.target.value})} className="input-field appearance-none">
                  <option>Mumbai Central</option><option>Pune West</option><option>Nashik North</option>
                </select></div>
              </div>
              <div><label className="text-xs font-bold text-brand-dark/60 uppercase mb-1 block">Guardian Name</label><input value={form.guardian_name} onChange={e => setForm({...form, guardian_name: e.target.value})} placeholder="Primary Guardian Name" className="input-field" /></div>
              <div><label className="text-xs font-bold text-brand-dark/60 uppercase mb-1 block">Guardian Contact</label><input value={form.guardian_contact} onChange={e => setForm({...form, guardian_contact: e.target.value})} placeholder="+91 9999999999" className="input-field" /></div>
              <div><label className="text-xs font-bold text-brand-dark/60 uppercase mb-1 block">Medical Notes</label><textarea value={form.medical_notes} onChange={e => setForm({...form, medical_notes: e.target.value})} placeholder="Any allergies or medical conditions" rows={2} className="input-field py-3 resize-none" /></div>
              
              <button onClick={submit} className="btn-primary w-full mt-6 shadow-sm">{editChild ? 'Save Changes' : 'Setup Profile'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
