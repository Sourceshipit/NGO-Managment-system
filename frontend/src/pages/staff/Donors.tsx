import { useState, useEffect } from 'react';
import { donorsAPI } from '../../api/client';
import type { Donor, Donation } from '../../types';
import { Heart, Search, Plus, Eye, Edit, X, Download, Loader2, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

export default function StaffDonors() {
  const [tab, setTab] = useState<'list'|'record'|'reports'>('list');
  const [donors, setDonors] = useState<Donor[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewDonor, setViewDonor] = useState<Donor | null>(null);
  const [editDonor, setEditDonor] = useState<Donor | null>(null);
  const [donorDonations, setDonorDonations] = useState<Donation[]>([]);
  const [form, setForm] = useState({donor_id:0,amount:'',project:'Education',payment_mode:'UPI',notes:''});
  const [donorSearch, setDonorSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { load(); }, []);
  const load = async () => {
    try {
      const [d, dn] = await Promise.all([donorsAPI.getAll(), donorsAPI.getDonations()]);
      setDonors(d); setDonations(dn);
    } catch { toast.error('Failed to load'); }
    setLoading(false);
  };

  const viewDonorDonations = (d: Donor) => {
    setViewDonor(d);
    setDonorDonations(donations.filter(dn => dn.donor_id === d.id));
  };

  const recordDonation = async () => {
    if (!form.donor_id || !form.amount || parseFloat(form.amount) <= 0) { toast.error('Fill all required fields'); return; }
    setSubmitting(true);
    try {
      await donorsAPI.createDonation({donor_id: form.donor_id, amount: parseFloat(form.amount), project: form.project, payment_mode: form.payment_mode, notes: form.notes});
      toast.success('Donation recorded! Blockchain entry created. 80G certificate ready.');
      setForm({donor_id:0,amount:'',project:'Education',payment_mode:'UPI',notes:''});
      load();
    } catch { toast.error('Failed to record'); }
    setSubmitting(false);
  };

  const openCertificate = async (donationId: number) => {
    try {
      const html = await donorsAPI.getCertificate(donationId);
      const w = window.open('', '_blank');
      if (w) { w.document.write(html as string); w.document.close(); }
    } catch { toast.error('Failed to open certificate'); }
  };

  const mask = (s: string | null) => s ? s.slice(0,3) + '****' + s.slice(-2) : '—';

  if (loading) return <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>;

  const totalDonated = donors.reduce((s,d) => s+d.total_donated, 0);
  const filteredDonors = donors.filter(d => !search || d.full_name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <h1 className="page-title text-brand-dark mb-6">Donor Records</h1>
      <div className="flex gap-3 mb-6 bg-white/50 p-1.5 rounded-xl border border-brand-border/40 backdrop-blur-sm w-fit">
        {(['list','record','reports'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${
             tab===t ? 'bg-white shadow-sm text-brand-primary' : 'text-brand-dark/60 hover:text-brand-dark hover:bg-white/50'
          }`}>
            {t === 'list' ? 'Donor List' : t === 'record' ? 'Record Donation' : 'Reports'}
          </button>
        ))}
      </div>

      {tab === 'list' && (
        <div className="space-y-6">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-3.5 w-5 h-5 text-brand-dark/40" />
            <input value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-10" placeholder="Search donors by name..." />
          </div>
          <div className="card bg-white overflow-hidden border-transparent">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-sm">
                <thead><tr className="bg-slate-50 border-b border-brand-border/50 text-brand-dark/60"><th className="text-left px-5 py-3.5 font-semibold text-xs uppercase tracking-wider">Name</th><th className="text-left px-5 py-3.5 font-semibold text-xs uppercase tracking-wider">PAN</th><th className="text-left px-5 py-3.5 font-semibold text-xs uppercase tracking-wider">Total (₹)</th><th className="text-left px-5 py-3.5 font-semibold text-xs uppercase tracking-wider">Verified</th><th className="text-left px-5 py-3.5 font-semibold text-xs uppercase tracking-wider">Actions</th></tr></thead>
                <tbody>
                  {filteredDonors.map(d => (
                    <tr key={d.id} className="border-b border-brand-border/30 last:border-b-0 hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-4 font-bold text-brand-dark">{d.full_name}</td>
                      <td className="px-5 py-4 text-brand-dark/70 font-medium font-mono text-xs">{mask(d.pan_number)}</td>
                      <td className="px-5 py-4 font-bold text-emerald-600 bg-emerald-50/50">₹{d.total_donated.toLocaleString()}</td>
                      <td className="px-5 py-4"><span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${d.is_verified?'bg-emerald-100 text-emerald-700':'bg-amber-100 text-amber-700'}`}>{d.is_verified?'Verified':'Pending'}</span></td>
                      <td className="px-5 py-4 flex gap-2">
                        <button onClick={() => viewDonorDonations(d)} className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors" title="View Donations"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => setEditDonor(d)} className="p-2 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white transition-colors" title="Edit Donor"><Edit className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                  {filteredDonors.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-brand-dark/40 font-medium">No donors found</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'record' && (
        <div className="card bg-white p-8 max-w-lg mb-6 border-transparent">
          <h3 className="text-xl font-bold text-brand-dark mb-6 border-b border-brand-border/50 pb-4">Record New Donation</h3>
          <div className="space-y-5">
            <div>
              <label className="text-xs font-bold text-brand-dark/60 uppercase mb-1 block">Donor</label>
              <select value={form.donor_id} onChange={e => setForm({...form, donor_id: parseInt(e.target.value)})} className="input-field appearance-none bg-white">
                <option value={0}>Select Donor...</option>
                {donors.map(d => <option key={d.id} value={d.id}>{d.full_name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-xs font-bold text-brand-dark/60 uppercase mb-1 block">Amount (₹)</label><input type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} className="input-field" placeholder="1000" /></div>
              <div><label className="text-xs font-bold text-brand-dark/60 uppercase mb-1 block">Project</label><select value={form.project} onChange={e => setForm({...form, project: e.target.value})} className="input-field appearance-none bg-white"><option>Education</option><option>Healthcare</option><option>Livelihood</option><option>Environment</option></select></div>
            </div>
            <div>
              <label className="text-xs font-bold text-brand-dark/60 uppercase mb-1 block">Payment Mode</label>
              <div className="flex gap-2">
                {['UPI','Bank','Cash','Cheque'].map(m => (
                  <button key={m} onClick={() => setForm({...form, payment_mode: m})} className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all border ${form.payment_mode===m?'bg-brand-primary text-white border-brand-primary shadow-sm':'bg-white text-brand-dark/70 border-brand-border hover:bg-slate-50 hover:text-brand-dark'}`}>{m}</button>
                ))}
              </div>
            </div>
            <div><label className="text-xs font-bold text-brand-dark/60 uppercase mb-1 block">Notes / Reference</label><textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={3} className="input-field py-3 resize-none" placeholder="Transaction ID or notes..." /></div>
            <button onClick={recordDonation} disabled={submitting} className="btn-primary w-full mt-6 flex items-center justify-center gap-2 shadow-sm disabled:opacity-50">
              {submitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Recording...</> : 'Record Donation'}
            </button>
          </div>
        </div>
      )}

      {tab === 'reports' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-6 border-transparent bg-white/80 backdrop-blur-sm text-center flex flex-col justify-center border-t-4 border-t-emerald-500 hover:shadow-md transition-shadow">
            <p className="text-4xl font-extrabold text-emerald-600">₹{totalDonated.toLocaleString()}</p><p className="text-xs mt-3 font-semibold text-brand-dark/60 uppercase tracking-widest">Total Donated</p>
          </div>
          <div className="card p-6 border-transparent bg-white/80 backdrop-blur-sm text-center flex flex-col justify-center border-t-4 border-t-brand-primary hover:shadow-md transition-shadow">
            <p className="text-4xl font-extrabold text-brand-dark">{donations.length}</p><p className="text-xs mt-3 font-semibold text-brand-dark/60 uppercase tracking-widest">Total Donations</p>
          </div>
          <div className="card p-6 border-transparent bg-white/80 backdrop-blur-sm text-center flex flex-col justify-center border-t-4 border-t-amber-500 hover:shadow-md transition-shadow">
            <p className="text-4xl font-extrabold text-amber-600">₹{donations.length > 0 ? (totalDonated/donations.length).toFixed(0) : 0}</p><p className="text-xs mt-3 font-semibold text-brand-dark/60 uppercase tracking-widest">Avg Donation</p>
          </div>
        </div>
      )}

      {/* View Donations Modal */}
      {viewDonor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setViewDonor(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 border-b border-brand-border/50 pb-4">
              <h3 className="text-lg font-bold text-brand-dark truncate">{viewDonor.full_name} <span className="text-sm font-medium text-brand-dark/50 ml-2">Donations</span></h3>
              <button onClick={() => setViewDonor(null)} className="p-1.5 rounded-full hover:bg-slate-100 transition-colors"><X className="w-5 h-5 text-brand-dark/50" /></button>
            </div>
            {donorDonations.length === 0 ? <p className="text-brand-dark/50 font-medium text-sm text-center py-6 border border-dashed border-brand-border/50 rounded-xl bg-slate-50">No donations found for this donor.</p> : (
              <div className="rounded-xl border border-brand-border/50 overflow-hidden">
                <table className="w-full text-sm">
                  <thead><tr className="bg-slate-50 border-b border-brand-border/50"><th className="text-left px-4 py-3 font-semibold text-xs text-brand-dark/60 uppercase tracking-wider">Date</th><th className="text-left px-4 py-3 font-semibold text-xs text-brand-dark/60 uppercase tracking-wider">Amount</th><th className="text-left px-4 py-3 font-semibold text-xs text-brand-dark/60 uppercase tracking-wider">Project</th><th className="text-left px-4 py-3 font-semibold text-xs text-brand-dark/60 uppercase tracking-wider">80G Form</th></tr></thead>
                  <tbody>{donorDonations.map(d => (
                    <tr key={d.id} className="border-b border-brand-border/30 last:border-b-0 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-brand-dark/70 font-medium">{new Date(d.donated_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3 font-bold text-emerald-600 bg-emerald-50/50">₹{d.amount.toLocaleString()}</td>
                      <td className="px-4 py-3 font-medium text-brand-dark">{d.project}</td>
                      <td className="px-4 py-3"><button onClick={() => openCertificate(d.id)} className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-colors" title="Download 80G"><Download className="w-4 h-4" /></button></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Donor Modal */}
      {editDonor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setEditDonor(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 border-b border-brand-border/50 pb-4">
              <h3 className="text-xl font-bold text-brand-dark">Edit Donor Info</h3>
              <button onClick={() => setEditDonor(null)} className="p-1.5 rounded-full hover:bg-slate-100 transition-colors"><X className="w-5 h-5 text-brand-dark/50" /></button>
            </div>
            <div className="space-y-4">
              <div><label className="text-xs font-bold text-brand-dark/60 uppercase mb-1 block">Full Name</label><input defaultValue={editDonor.full_name} id="edit-name" className="input-field" placeholder="Full Name" /></div>
              <div><label className="text-xs font-bold text-brand-dark/60 uppercase mb-1 block">PAN Number (for 80G)</label><input defaultValue={editDonor.pan_number || ''} id="edit-pan" className="input-field uppercase" placeholder="ABCDE1234F" /></div>
              <button onClick={async () => {
                const name = (document.getElementById('edit-name') as HTMLInputElement)?.value;
                const pan = (document.getElementById('edit-pan') as HTMLInputElement)?.value;
                try { await donorsAPI.update(editDonor.id, {full_name: name, pan_number: pan}); toast.success('Donor updated'); setEditDonor(null); load(); } catch { toast.error('Failed to update'); }
              }} className="btn-primary w-full mt-6 shadow-sm">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
