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

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="w-8 h-8 animate-spin text-brand-primary" /></div>;

  const projects = [...new Set(donations.map(d => d.project))];
  const filtered = projectFilter ? donations.filter(d => d.project === projectFilter) : donations;
  const total = filtered.reduce((s,d) => s+d.amount, 0);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div className="border-b border-brand-border/50 pb-6 flex items-center justify-between">
        <div>
          <h1 className="page-title text-brand-dark">My Donations</h1>
          <p className="text-sm text-brand-dark/60 mt-1 font-semibold">{filtered.length} DONATIONS TOTALING ₹{total.toLocaleString()}</p>
        </div>
        <button onClick={() => setShowDonate(true)} className="btn-primary shadow-md flex items-center gap-2">
          <Plus size={18} /> DONATE NOW
        </button>
      </div>

      <div className="flex items-center gap-4">
        <select value={projectFilter} onChange={e => setProjectFilter(e.target.value)} className="input-field max-w-xs font-semibold text-sm cursor-pointer">
          <option value="">All Projects</option>{projects.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        {projectFilter && <button onClick={() => setProjectFilter('')} className="text-sm font-semibold text-brand-primary hover:text-blue-700 transition px-2">Clear Filter</button>}
      </div>

      <div className="space-y-4">
        {filtered.map(d => (
          <div key={d.id} className="card p-6 flex flex-col md:flex-row md:items-center gap-6 hover:-translate-y-1 hover:shadow-md transition-all duration-300 border-transparent hover:border-brand-primary/20">
            <div className="w-14 h-14 bg-brand-primary/10 rounded-xl flex items-center justify-center shrink-0 border border-brand-border/50"><Heart className="w-6 h-6 text-brand-primary" /></div>
            <div className="flex-1">
              <div className="flex items-center gap-4 border-b border-brand-border/50 pb-3 mb-3">
                <h3 className="text-2xl font-bold text-brand-dark leading-none">₹{d.amount.toLocaleString()}</h3>
                <span className="text-xs font-bold px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full">{d.project}</span>
              </div>
              <div className="flex items-center gap-6 text-sm text-brand-dark/60 font-semibold">
                <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{new Date(d.donated_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</span>
                <span className="flex items-center gap-1.5"><CreditCard className="w-4 h-4" />{d.payment_mode}</span>
              </div>
            </div>
            <button onClick={() => openCert(d.id)} className="shrink-0 px-4 py-2 text-xs font-bold text-brand-primary bg-brand-primary/5 hover:bg-brand-primary hover:text-white border border-brand-primary transition-all rounded-lg flex items-center gap-2">
              <Download className="w-4 h-4" /> 80G Certificate
            </button>
          </div>
        ))}
        {filtered.length === 0 && (
           <div className="text-center py-10 card border-dashed">
              <p className="text-brand-dark/50 font-semibold">No donations found.</p>
           </div>
        )}
      </div>

      <DonateNowModal
        isOpen={showDonate}
        onClose={() => setShowDonate(false)}
        onSuccess={loadDonations}
      />
    </div>
  );
}
