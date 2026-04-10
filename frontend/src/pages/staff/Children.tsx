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
      <div className="flex justify-between items-center mb-6">
        <div><h1 className="text-3xl font-black text-black uppercase tracking-tight">Children Records</h1><p className="text-sm font-mono text-slate-500 font-bold uppercase">{children.length} children enrolled (data masked for staff)</p></div>
        <button onClick={() => { setShowModal(true); setEditChild(null); setForm({name:'',dob:'',gender:'Male',address:'',program:'SHIKSHA',branch:'Mumbai Central',guardian_name:'',guardian_contact:'',medical_notes:''}); }}
          className="px-4 py-2 bg-emerald-400 text-black border border-brand-border shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-all font-semibold text-sm flex items-center gap-2"><Plus className="w-4 h-4" /> Add Child</button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-black" />
          <input value={search} onChange={e => setSearch(e.target.value)} className="w-full h-10 pl-10 pr-4 bg-white border border-brand-border shadow-[4px_4px_0_0_rgba(0,0,0,1)] text-sm font-mono uppercase font-bold focus:outline-none" placeholder="SEARCH..." />
        </div>
        <select value={programFilter} onChange={e => setProgramFilter(e.target.value)} className="h-10 px-3 bg-white border border-brand-border shadow-[4px_4px_0_0_rgba(0,0,0,1)] text-sm font-mono uppercase font-bold focus:outline-none">
          <option value="">ALL PROGRAMS</option>{programs.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={branchFilter} onChange={e => setBranchFilter(e.target.value)} className="h-10 px-3 bg-white border border-brand-border shadow-[4px_4px_0_0_rgba(0,0,0,1)] text-sm font-mono uppercase font-bold focus:outline-none">
          <option value="">ALL BRANCHES</option>{branches.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
        {(search || programFilter || branchFilter) && (
          <button onClick={() => { setSearch(''); setProgramFilter(''); setBranchFilter(''); }} className="text-sm text-black hover:text-emerald-600 font-semibold underline">Clear</button>
        )}
      </div>

      <div className="bg-white border border-brand-border shadow-[4px_4px_0_0_rgba(0,0,0,1)] overflow-hidden">
        <table className="w-full text-sm font-mono">
          <thead><tr className="bg-emerald-400 border-b border-brand-border text-black"><th className="text-left px-4 py-3 font-bold uppercase">Name</th><th className="text-left px-4 py-3 font-bold uppercase">Gender</th><th className="text-left px-4 py-3 font-bold uppercase">Program</th><th className="text-left px-4 py-3 font-bold uppercase">Branch</th><th className="text-left px-4 py-3 font-bold uppercase">Guardian</th><th className="text-left px-4 py-3 font-bold uppercase">Actions</th></tr></thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} className="border-b border-brand-border last:border-b-0 hover:bg-emerald-50 transition-colors">
                <td className="px-4 py-3 font-bold uppercase">{mask(c.name)}</td>
                <td className="px-4 py-3 uppercase font-bold">{c.gender}</td>
                <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 border border-brand-border font-bold uppercase shadow-[2px_2px_0_0_rgba(0,0,0,1)] ${c.program==='SHIKSHA'?'bg-blue-400 text-black':c.program==='SWASTHYA'?'bg-green-400 text-black':c.program==='AAJEEVIKA'?'bg-purple-400 text-black':'bg-orange-400 text-black'}`}>{c.program}</span></td>
                <td className="px-4 py-3 uppercase font-bold black text-slate-800">{c.branch}</td>
                <td className="px-4 py-3 uppercase font-bold text-slate-800">{mask(c.guardian_name)}</td>
                <td className="px-4 py-3">
                  <button onClick={() => { setEditChild(c); setForm({name:c.name,dob:c.dob,gender:c.gender,address:c.address,program:c.program,branch:c.branch,guardian_name:c.guardian_name,guardian_contact:c.guardian_contact,medical_notes:c.medical_notes||''}); setShowModal(true); }}
                    className="p-1.5 hover:bg-emerald-300 bg-emerald-100 border border-brand-border text-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:translate-y-[1px] hover:shadow-[1px_1px_0_0_rgba(0,0,0,1)] transition-all"><Edit className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="bg-white border border-brand-border rounded-xl p-6 w-full max-w-lg shadow-[8px_8px_0_0_rgba(0,0,0,1)] max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between mb-4"><h3 className="text-xl font-black uppercase text-black">{editChild ? 'Edit Child' : 'Add Child'}</h3><button onClick={() => setShowModal(false)} className="hover:bg-red-500 hover:text-white p-1 border-2 border-transparent hover:border-black transition-colors"><X className="w-5 h-5 text-black" /></button></div>
            <div className="space-y-4 font-mono">
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="FULL NAME *" className="w-full h-10 px-3 bg-white border border-brand-border shadow-[2px_2px_0_0_rgba(0,0,0,1)] text-sm font-bold uppercase focus:outline-none" />
              <div className="grid grid-cols-2 gap-4">
                <input type="date" value={form.dob} onChange={e => setForm({...form, dob: e.target.value})} className="h-10 px-3 border border-brand-border shadow-[2px_2px_0_0_rgba(0,0,0,1)] text-sm font-bold uppercase focus:outline-none" />
                <select value={form.gender} onChange={e => setForm({...form, gender: e.target.value})} className="h-10 px-3 border border-brand-border shadow-[2px_2px_0_0_rgba(0,0,0,1)] text-sm font-bold uppercase focus:outline-none">
                  <option>MALE</option><option>FEMALE</option><option>OTHER</option>
                </select>
              </div>
              <textarea value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="ADDRESS" rows={2} className="w-full px-3 py-2 border border-brand-border shadow-[2px_2px_0_0_rgba(0,0,0,1)] text-sm font-bold uppercase resize-none focus:outline-none" />
              <div className="grid grid-cols-2 gap-4">
                <select value={form.program} onChange={e => setForm({...form, program: e.target.value})} className="h-10 px-3 border border-brand-border shadow-[2px_2px_0_0_rgba(0,0,0,1)] text-sm font-bold uppercase focus:outline-none">
                  <option value="SHIKSHA">SHIKSHA</option><option value="SWASTHYA">SWASTHYA</option><option value="AAJEEVIKA">AAJEEVIKA</option><option value="UNNATI">UNNATI</option>
                </select>
                <select value={form.branch} onChange={e => setForm({...form, branch: e.target.value})} className="h-10 px-3 border border-brand-border shadow-[2px_2px_0_0_rgba(0,0,0,1)] text-sm font-bold uppercase focus:outline-none">
                  <option>MUMBAI CENTRAL</option><option>PUNE WEST</option><option>NASHIK NORTH</option>
                </select>
              </div>
              <input value={form.guardian_name} onChange={e => setForm({...form, guardian_name: e.target.value})} placeholder="GUARDIAN NAME" className="w-full h-10 px-3 border border-brand-border shadow-[2px_2px_0_0_rgba(0,0,0,1)] text-sm font-bold uppercase focus:outline-none" />
              <input value={form.guardian_contact} onChange={e => setForm({...form, guardian_contact: e.target.value})} placeholder="GUARDIAN CONTACT" className="w-full h-10 px-3 border border-brand-border shadow-[2px_2px_0_0_rgba(0,0,0,1)] text-sm font-bold uppercase focus:outline-none" />
              <textarea value={form.medical_notes} onChange={e => setForm({...form, medical_notes: e.target.value})} placeholder="MEDICAL NOTES" rows={2} className="w-full px-3 py-2 border border-brand-border shadow-[2px_2px_0_0_rgba(0,0,0,1)] text-sm font-bold uppercase resize-none focus:outline-none" />
              <button onClick={submit} className="w-full py-3 bg-emerald-400 text-black border border-brand-border font-black uppercase text-lg shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-all mt-4">{editChild ? 'SAVE CHANGES' : 'ADD CHILD'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
