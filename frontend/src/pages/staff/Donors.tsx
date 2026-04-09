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
      <h1 className="text-3xl font-black text-black uppercase tracking-tight mb-6">Donor Records</h1>
      <div className="flex gap-4 mb-6 flex-wrap">
        {(['list','record','reports'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`font-mono px-4 py-2 text-sm font-bold uppercase transition-all border-2 border-black ${tab===t?'bg-emerald-400 shadow-[4px_4px_0_0_rgba(0,0,0,1)] text-black translate-y-[-2px]':'bg-white shadow-[2px_2px_0_0_rgba(0,0,0,1)] text-black hover:bg-emerald-50 hover:translate-y-[-2px] hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)]'}`}>
            {t === 'list' ? 'Donor List' : t === 'record' ? 'Record Donation' : 'Reports'}
          </button>
        ))}
      </div>

      {tab === 'list' && (
        <div className="space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-black" />
            <input value={search} onChange={e => setSearch(e.target.value)} className="w-full max-w-sm h-12 pl-10 pr-4 bg-white border-2 border-black font-mono text-sm shadow-[4px_4px_0_0_rgba(0,0,0,1)] focus:outline-none focus:bg-emerald-50" placeholder="SEARCH DONORS..." />
          </div>
          <div className="bg-white border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] overflow-hidden">
            <table className="w-full text-sm font-mono">
              <thead><tr className="bg-emerald-400 border-b-2 border-black text-black"><th className="text-left px-4 py-3 font-bold uppercase">Name</th><th className="text-left px-4 py-3 font-bold uppercase">PAN</th><th className="text-left px-4 py-3 font-bold uppercase">Total (₹)</th><th className="text-left px-4 py-3 font-bold uppercase">Verified</th><th className="text-left px-4 py-3 font-bold uppercase">Actions</th></tr></thead>
              <tbody>
                {filteredDonors.map(d => (
                  <tr key={d.id} className="border-b-2 border-black last:border-b-0 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-bold uppercase">{d.full_name}</td>
                    <td className="px-4 py-3 text-slate-500 font-bold text-xs">{mask(d.pan_number)}</td>
                    <td className="px-4 py-3 font-black text-emerald-600">₹{d.total_donated.toLocaleString()}</td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] font-bold uppercase ${d.is_verified?'bg-green-400 text-black':'bg-amber-400 text-black'}`}>{d.is_verified?'Verified':'Pending'}</span></td>
                    <td className="px-4 py-3 flex gap-2">
                      <button onClick={() => viewDonorDonations(d)} className="p-2 bg-blue-300 border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:translate-y-[2px] transition-all text-black"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => setEditDonor(d)} className="p-2 bg-amber-300 border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:translate-y-[2px] transition-all text-black"><Edit className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'record' && (
        <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0_0_rgba(0,0,0,1)] max-w-lg mb-6">
          <h3 className="text-2xl font-black uppercase tracking-tight text-black mb-6 border-b-2 border-black pb-4">Record New Donation</h3>
          <div className="space-y-6 font-mono">
            <div>
              <label className="text-sm font-bold uppercase text-black mb-2 block">Donor</label>
              <select value={form.donor_id} onChange={e => setForm({...form, donor_id: parseInt(e.target.value)})} className="w-full h-12 px-4 border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] text-sm focus:outline-none focus:bg-emerald-50">
                <option value={0}>SELECT DONOR...</option>
                {donors.map(d => <option key={d.id} value={d.id}>{d.full_name.toUpperCase()}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-bold uppercase text-black mb-2 block">Amount (₹)</label><input type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} className="w-full h-12 px-4 border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] text-sm focus:outline-none focus:bg-emerald-50" placeholder="50000" /></div>
              <div><label className="text-sm font-bold uppercase text-black mb-2 block">Project</label><select value={form.project} onChange={e => setForm({...form, project: e.target.value})} className="w-full h-12 px-4 border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] text-sm focus:outline-none focus:bg-emerald-50"><option>Education</option><option>Healthcare</option><option>Livelihood</option><option>Environment</option></select></div>
            </div>
            <div>
              <label className="text-sm font-bold uppercase text-black mb-2 block">Payment Mode</label>
              <div className="flex gap-2">
                {['UPI','Bank','Cash','Cheque'].map(m => (
                  <button key={m} onClick={() => setForm({...form, payment_mode: m})} className={`flex-1 py-3 border-2 border-black text-sm font-bold uppercase transition-all ${form.payment_mode===m?'bg-emerald-400 shadow-[2px_2px_0_0_rgba(0,0,0,1)] text-black translate-y-[-2px]':'bg-white text-black hover:bg-emerald-50 shadow-[4px_4px_0_0_rgba(0,0,0,1)]'}`}>{m}</button>
                ))}
              </div>
            </div>
            <div><label className="text-sm font-bold uppercase text-black mb-2 block">Notes</label><textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={3} className="w-full px-4 py-3 border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] text-sm focus:outline-none focus:bg-emerald-50 resize-none" /></div>
            <button onClick={recordDonation} disabled={submitting} className="w-full py-4 mt-6 bg-emerald-400 text-black border-2 border-black font-black uppercase text-sm shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-all disabled:opacity-50 disabled:translate-y-[2px] disabled:shadow-[2px_2px_0_0_rgba(0,0,0,1)] flex items-center justify-center gap-2">
              {submitting ? <><Loader2 className="w-5 h-5 animate-spin" /> RECORDING...</> : 'RECORD DONATION'}
            </button>
          </div>
        </div>
      )}

      {tab === 'reports' && (
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white border-2 border-black p-5 shadow-[4px_4px_0_0_rgba(0,0,0,1)] text-center">
            <p className="text-4xl font-black text-emerald-600 font-mono">₹{totalDonated.toLocaleString()}</p><p className="text-xs mt-2 font-bold uppercase text-slate-500 tracking-wider">Total Donated</p>
          </div>
          <div className="bg-white border-2 border-black p-5 shadow-[4px_4px_0_0_rgba(0,0,0,1)] text-center">
            <p className="text-4xl font-black text-black font-mono">{donations.length}</p><p className="text-xs mt-2 font-bold uppercase text-slate-500 tracking-wider">Total Donations</p>
          </div>
          <div className="bg-white border-2 border-black p-5 shadow-[4px_4px_0_0_rgba(0,0,0,1)] text-center">
            <p className="text-4xl font-black text-amber-600 font-mono">₹{donations.length > 0 ? (totalDonated/donations.length).toFixed(0) : 0}</p><p className="text-xs mt-2 font-bold uppercase text-slate-500 tracking-wider">Avg Donation</p>
          </div>
        </div>
      )}

      {/* View Donations Modal */}
      {viewDonor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setViewDonor(null)}>
          <div className="bg-white border-4 border-black p-6 w-full max-w-lg shadow-[8px_8px_0_0_rgba(0,0,0,1)] rounded-none max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 border-b-2 border-black pb-4">
              <h3 className="text-2xl font-black uppercase tracking-tight text-black">{viewDonor.full_name} — DONATIONS</h3>
              <button onClick={() => setViewDonor(null)} className="p-2 border-2 border-black hover:bg-emerald-400 shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-colors"><X className="w-5 h-5 text-black" /></button>
            </div>
            {donorDonations.length === 0 ? <p className="font-mono text-slate-500 font-bold uppercase text-center py-6 border-2 border-dashed border-slate-300">NO DONATIONS FOUND</p> : (
              <table className="w-full text-sm font-mono border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                <thead><tr className="bg-emerald-400 border-b-2 border-black"><th className="text-left px-4 py-3 font-bold uppercase text-black">Date</th><th className="text-left px-4 py-3 font-bold uppercase text-black">Amount</th><th className="text-left px-4 py-3 font-bold uppercase text-black">Project</th><th className="text-left px-4 py-3 font-bold uppercase text-black">80G</th></tr></thead>
                <tbody>{donorDonations.map(d => (
                  <tr key={d.id} className="border-b-2 border-black last:border-b-0 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-slate-600 font-bold">{new Date(d.donated_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 font-black text-emerald-600">₹{d.amount.toLocaleString()}</td>
                    <td className="px-4 py-3 font-bold">{d.project}</td>
                    <td className="px-4 py-3"><button onClick={() => openCertificate(d.id)} className="p-2 bg-blue-300 border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:translate-y-[2px] transition-all text-black"><Download className="w-4 h-4" /></button></td>
                  </tr>
                ))}</tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Edit Donor Modal */}
      {editDonor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setEditDonor(null)}>
          <div className="bg-white border-4 border-black p-6 w-full max-w-sm shadow-[8px_8px_0_0_rgba(0,0,0,1)] rounded-none" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 border-b-2 border-black pb-4">
              <h3 className="text-2xl font-black uppercase tracking-tight text-black">EDIT DONOR</h3>
              <button onClick={() => setEditDonor(null)} className="p-2 border-2 border-black hover:bg-emerald-400 shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-colors"><X className="w-5 h-5 text-black" /></button>
            </div>
            <div className="space-y-4 font-mono">
              <input defaultValue={editDonor.full_name} id="edit-name" className="w-full h-12 px-4 border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] text-sm focus:outline-none focus:bg-emerald-50" placeholder="NAME *" />
              <input defaultValue={editDonor.pan_number || ''} id="edit-pan" className="w-full h-12 px-4 border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] text-sm focus:outline-none focus:bg-emerald-50 uppercase" placeholder="PAN" />
              <button onClick={async () => {
                const name = (document.getElementById('edit-name') as HTMLInputElement)?.value;
                const pan = (document.getElementById('edit-pan') as HTMLInputElement)?.value;
                try { await donorsAPI.update(editDonor.id, {full_name: name, pan_number: pan}); toast.success('Donor updated'); setEditDonor(null); load(); } catch { toast.error('Failed'); }
              }} className="w-full mt-6 py-4 bg-emerald-400 text-black border-2 border-black font-black uppercase text-sm shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-all">SAVE CHANGES</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
