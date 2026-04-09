import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { donorsAPI, dashboardAPI } from '../../api/client';
import type { Donation, DashboardStats } from '../../types';
import { Heart, TrendingUp, Award, Calendar, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import DonateNowModal from '../../components/UI/DonateNowModal';

export default function DonorDashboard() {
  const { user } = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [dash, setDash] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDonate, setShowDonate] = useState(false);

  useEffect(() => {
    Promise.all([donorsAPI.getDonations(), dashboardAPI.getStats()])
      .then(([d, ds]) => { setDonations(d); setDash(ds); })
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  const reloadDonations = () => {
    donorsAPI.getDonations().then(setDonations).catch(() => {});
  };

  if (loading) return <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-pink-500" /></div>;

  const total = donations.reduce((s,d) => s+d.amount, 0);
  const recent = donations.slice(0, 5);
  const byProject = donations.reduce((acc, d) => ({...acc, [d.project]: (acc[d.project]||0)+d.amount}), {} as Record<string,number>);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="card bg-pink-600 p-8 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 border-4 border-black border-r-0 border-t-0 rounded-bl-full translate-x-1/4 -translate-y-1/4"></div>
        <h1 className="text-3xl font-black uppercase tracking-widest relative">Welcome, {user?.full_name}</h1>
        <p className="font-mono text-pink-200 mt-2 uppercase text-sm relative">Thank you for supporting CareConnect Foundation</p>
        <button onClick={() => setShowDonate(true)} className="mt-4 px-6 py-3 bg-white text-pink-600 border-2 border-black font-mono text-sm font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-[4px_4px_0_#000] hover:shadow-[2px_2px_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] relative flex items-center gap-2">
          <Heart size={16} /> DONATE NOW
        </button>
        <div className="mt-8 relative border-t-2 border-black pt-6"><p className="text-5xl font-black font-mono">₹{total.toLocaleString()}</p><p className="font-mono text-black font-bold uppercase mt-2">Your lifetime contributions</p></div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          {l:'Total Given',v:`₹${total.toLocaleString()}`,icon:Heart,color:'bg-pink-400'},
          {l:'Donations',v:donations.length,icon:Calendar,color:'bg-blue-400'},
          {l:'Certificates',v:donations.filter(d=>d.certificate_issued).length,icon:Award,color:'bg-amber-400'},
          {l:'Impact Score',v:Math.round(total/1000),icon:TrendingUp,color:'bg-emerald-400'},
        ].map(c => (
          <div key={c.l} className="card p-5">
            <div className={`w-12 h-12 border-2 border-black ${c.color} flex items-center justify-center mb-4`}><c.icon className="w-6 h-6 text-black" /></div>
            <p className="text-2xl font-black font-mono text-black">{c.v}</p><p className="text-xs font-bold uppercase tracking-wide text-slate-600 mt-1">{c.l}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-xl font-black uppercase tracking-widest text-black mb-6 border-b-2 border-black pb-4">Where Money Goes</h3>
          <div className="space-y-4">
            {Object.entries(byProject).map(([p,a]) => (
              <div key={p}>
                <div className="flex justify-between font-mono text-sm font-bold uppercase mb-2"><span className="text-black">{p}</span><span className="text-pink-600">₹{(a as number).toLocaleString()}</span></div>
                <div className="w-full h-4 bg-slate-100 border-2 border-black overflow-hidden relative">
                  <div className="absolute top-0 left-0 h-full bg-pink-600 border-r-2 border-black" style={{width:`${((a as number)/total)*100}%`}}></div>
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNCIgaGVpZ2h0PSI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9Im5vbmUiLz48cGF0aCBkPSJNMCAwTDQgNE00IDBMMCA0IiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4yKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9zdmc+')]"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between border-b-2 border-black pb-4 mb-6">
            <h3 className="text-xl font-black uppercase tracking-widest text-black">Recent Donations</h3>
            <Link to="/donor/donations" className="font-mono text-sm font-bold text-pink-600 hover:text-white hover:bg-pink-600 border-2 border-transparent hover:border-black px-2 py-1 transition-colors">VIEW ALL →</Link>
          </div>
          {recent.length === 0 ? <p className="text-slate-500 font-mono text-center py-8">No donations yet</p> : (
            <div className="space-y-3">
              {recent.map(d => (
                <div key={d.id} className="flex items-center justify-between p-3 bg-white border-2 border-black hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_#000] transition-all">
                  <div>
                    <p className="font-mono text-base font-black text-black">₹{d.amount.toLocaleString()}</p>
                    <p className="font-mono text-xs font-bold text-slate-500 uppercase mt-1">{d.project} • {new Date(d.donated_at).toLocaleDateString()}</p>
                  </div>
                  <span className="text-[10px] font-black font-mono px-2 py-1 bg-green-100 border-2 border-black text-black uppercase">{d.payment_mode}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card bg-black p-8 text-white relative">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdHRoIGQ9Ik0wIDBoMjB2MjBIMHoiIGZpbGw9Im5vbmUiLz48cGF0aCBkPSJNMCAwdjIwTDIwIDB6IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMikiLz48L3N2Zz4=')] opacity-10"></div>
        <h3 className="text-xl font-black uppercase tracking-widest border-b-2 border-white/20 pb-4 mb-6 relative">Your Impact</h3>
        <div className="flex gap-12 relative">
          <div><p className="text-4xl font-black font-mono text-pink-400">₹{total.toLocaleString()}</p><p className="font-mono text-slate-400 text-sm mt-1 uppercase">Donated</p></div>
          <div><p className="text-4xl font-black font-mono text-pink-400">{Math.round(total / 5000)}</p><p className="font-mono text-slate-400 text-sm mt-1 uppercase">Children Supported</p></div>
          <div><p className="text-4xl font-black font-mono text-pink-400">{donations.length}</p><p className="font-mono text-slate-400 text-sm mt-1 uppercase">Contributions</p></div>
        </div>
      </div>

      <DonateNowModal
        isOpen={showDonate}
        onClose={() => setShowDonate(false)}
        onSuccess={reloadDonations}
      />
    </div>
  );
}
