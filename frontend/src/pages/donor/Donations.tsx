import { useState, useEffect } from 'react';
import { donorsAPI } from '../../api/client';
import type { Donation } from '../../types';
import { Heart, Calendar, CreditCard, Filter, Loader2, Download, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import DonateNowModal from '../../components/UI/DonateNowModal';

export default function DonorDonations() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectFilter, setProjectFilter] = useState('');
  const [showDonate, setShowDonate] = useState(false);

  useEffect(() => {
    loadDonations();
  }, []);

  const loadDonations = () => {
    donorsAPI.getDonations().then(setDonations).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  };

  const openCert = async (id: number) => {
    try { const html = await donorsAPI.getCertificate(id); const w = window.open('','_blank'); if(w){w.document.write(html as string);w.document.close();} }
    catch { toast.error('Failed to open certificate'); }
  };

  if (loading) return <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-pink-500" /></div>;

  const projects = [...new Set(donations.map(d => d.project))];
  const filtered = projectFilter ? donations.filter(d => d.project === projectFilter) : donations;
  const total = filtered.reduce((s,d) => s+d.amount, 0);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="border-b-2 border-black pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-widest text-black">My Donations</h1>
          <p className="font-mono text-sm text-slate-600 mt-1 uppercase font-bold">{filtered.length} DONATIONS TOTALING ₹{total.toLocaleString()}</p>
        </div>
        <button onClick={() => setShowDonate(true)} className="flex items-center gap-2 px-5 py-2.5 bg-pink-500 text-white border-2 border-black font-mono text-xs font-black uppercase tracking-widest hover:bg-black transition-all shadow-[4px_4px_0_#000] hover:shadow-[2px_2px_0_#000] hover:translate-x-[2px] hover:translate-y-[2px]">
          <Plus size={16} /> DONATE NOW
        </button>
      </div>

      <div className="flex items-center gap-3">
        <select value={projectFilter} onChange={e => setProjectFilter(e.target.value)} className="h-10 px-3 bg-white border-2 border-black font-mono text-sm font-bold uppercase focus:outline-none focus:ring-0 focus:border-pink-500 cursor-pointer">
          <option value="">ALL PROJECTS</option>{projects.map(p => <option key={p} value={p}>{p.toUpperCase()}</option>)}
        </select>
        {projectFilter && <button onClick={() => setProjectFilter('')} className="font-mono text-sm font-bold text-pink-600 hover:text-white hover:bg-pink-600 border-2 border-transparent hover:border-black px-2 py-1 h-10 transition-colors uppercase">CLEAR</button>}
      </div>

      <div className="space-y-4">
        {filtered.map(d => (
          <div key={d.id} className="card p-5 flex items-center gap-5 hover:-translate-y-1 hover:shadow-[4px_4px_0px_#000] transition-all cursor-default">
            <div className="w-14 h-14 bg-pink-100 border-2 border-black flex items-center justify-center shrink-0"><Heart className="w-6 h-6 text-pink-600" /></div>
            <div className="flex-1">
              <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-2 mb-2">
                <h3 className="text-xl font-black font-mono text-black">₹{d.amount.toLocaleString()}</h3>
                <span className="text-[10px] font-black font-mono px-2 py-0.5 bg-blue-100 border-2 border-black text-black uppercase">{d.project}</span>
              </div>
              <div className="flex items-center gap-6 font-mono text-xs text-slate-500 font-bold uppercase">
                <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-black" />{new Date(d.donated_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</span>
                <span className="flex items-center gap-2"><CreditCard className="w-4 h-4 text-black" />{d.payment_mode}</span>
              </div>
            </div>
            <button onClick={() => openCert(d.id)} className="shrink-0 px-4 py-2 font-mono text-xs font-black uppercase text-pink-600 border-2 border-pink-600 hover:bg-pink-600 hover:text-white hover:border-black transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" /> 80G CERT
            </button>
          </div>
        ))}
      </div>

      <DonateNowModal
        isOpen={showDonate}
        onClose={() => setShowDonate(false)}
        onSuccess={loadDonations}
      />
    </div>
  );
}
