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
  const [error, setError] = useState<string | null>(null);
  const [showDonate, setShowDonate] = useState(false);

  useEffect(() => { load(); }, []);

  const load = () => {
    setLoading(true);
    setError(null);
    Promise.all([donorsAPI.getDonations(), dashboardAPI.getStats()])
      .then(([d, ds]) => { setDonations(d); setDash(ds); })
      .catch((e: any) => {
        const errMessage = e.response?.data?.detail || e.message || 'Failed to load dashboard data. Please try again.';
        setError(errMessage);
        toast.error('Failed to load dashboard');
      })
      .finally(() => setLoading(false));
  };

  const reloadDonations = () => {
    donorsAPI.getDonations().then(setDonations).catch(() => {});
  };

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="w-8 h-8 animate-spin text-brand-primary" /></div>;
  if (error) return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 flex flex-col items-center justify-center min-h-[40vh]">
      <div className="card shadow-sm border-red-200 bg-red-50/50 p-8 max-w-lg text-center backdrop-blur-sm rounded-2xl">
        <h2 className="text-xl font-semibold text-red-800 mb-2">Dashboard Unavailable</h2>
        <p className="text-red-600/80 mb-6">{error}</p>
        <button onClick={load} className="btn-primary">Try Again</button>
      </div>
    </div>
  );

  const total = donations.reduce((s,d) => s+d.amount, 0);
  const recent = donations.slice(0, 5);
  const byProject = donations.reduce((acc, d) => ({...acc, [d.project]: (acc[d.project]||0)+d.amount}), {} as Record<string,number>);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Greeting Banner */}
      <div className="card bg-gradient-to-br from-brand-primary via-blue-600 to-indigo-700 p-8 text-white relative overflow-hidden shadow-lg border-0">
        <div className="absolute right-0 top-0 w-80 h-80 bg-white/10 rounded-full blur-3xl translate-x-1/4 -translate-y-1/4 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-primary-light/20 rounded-full blur-2xl translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>
        
        <h1 className="page-title text-white relative z-10">Welcome, {user?.full_name}</h1>
        <p className="font-medium text-blue-100 mt-2 relative z-10">Thank you for supporting the CareConnect Foundation.</p>
        
        <button onClick={() => setShowDonate(true)} className="btn-primary bg-white text-brand-primary hover:bg-slate-50 mt-6 relative z-10 font-bold px-8 shadow-md">
          <Heart size={18} className="fill-brand-primary" /> DONATE NOW
        </button>
        
        <div className="mt-8 relative z-10 border-t border-white/20 pt-6">
           <p className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200">₹{total.toLocaleString()}</p>
           <p className="text-sm font-semibold text-blue-100/80 uppercase tracking-widest mt-2">Your lifetime contributions</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {l:'Total Given',v:`₹${total.toLocaleString()}`,icon:Heart,color:'text-brand-primary',bg:'bg-brand-primary/10'},
          {l:'Donations',v:donations.length,icon:Calendar,color:'text-blue-500',bg:'bg-blue-500/10'},
          {l:'Certificates',v:donations.filter(d=>d.certificate_issued).length,icon:Award,color:'text-amber-500',bg:'bg-amber-500/10'},
          {l:'Impact Score',v:Math.round(total/1000),icon:TrendingUp,color:'text-emerald-500',bg:'bg-emerald-500/10'},
        ].map((c, i) => (
          <div key={i} className="card p-6 bg-white/80 backdrop-blur-md hover:-translate-y-1 hover:shadow-md transition-all duration-300 border-transparent hover:border-brand-primary/20">
            <div className={`w-12 h-12 rounded-xl border border-brand-border/50 ${c.bg} flex items-center justify-center mb-4`}><c.icon className={`w-6 h-6 ${c.color}`} /></div>
            <p className="text-3xl font-bold text-brand-dark leading-none">{c.v}</p>
            <p className="text-xs font-semibold text-brand-dark/50 uppercase tracking-widest mt-2">{c.l}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6 bg-white/80 backdrop-blur-md border-transparent">
          <h3 className="text-lg font-bold text-brand-dark mb-6 border-b border-brand-border/50 pb-3">Where Your Money Goes</h3>
          <div className="space-y-5">
            {Object.entries(byProject).map(([p,a]) => (
              <div key={p}>
                <div className="flex justify-between font-semibold text-sm mb-2 text-brand-dark">
                   <span>{p}</span>
                   <span className="text-brand-primary font-bold">₹{(a as number).toLocaleString()}</span>
                </div>
                <div className="w-full bg-brand-border/30 rounded-full h-2.5 overflow-hidden">
                   <div className="bg-gradient-to-r from-brand-primary to-blue-400 h-full rounded-full transition-all duration-700" style={{width:`${((a as number)/total)*100}%`}}></div>
                </div>
              </div>
            ))}
            {Object.keys(byProject).length === 0 && <p className="text-brand-dark/40 py-8 text-center text-sm font-medium">No projects supported yet</p>}
          </div>
        </div>

        <div className="card p-6 bg-white/80 backdrop-blur-md border-transparent flex flex-col">
          <div className="flex items-center justify-between border-b border-brand-border/50 pb-3 mb-5">
            <h3 className="text-lg font-bold text-brand-dark">Recent Donations</h3>
            <Link to="/donor/donations" className="text-xs font-semibold text-brand-primary hover:text-blue-700 transition flex items-center gap-1">VIEW ALL &rarr;</Link>
          </div>
          {recent.length === 0 ? <p className="text-brand-dark/40 text-center py-8 text-sm font-medium">No donations yet</p> : (
            <div className="space-y-3 flex-1">
              {recent.map(d => (
                <div key={d.id} className="flex items-center justify-between p-4 rounded-xl bg-white border border-brand-border/50 hover:shadow-md hover:border-brand-primary/30 transition-all duration-300">
                  <div>
                    <p className="text-base font-bold text-brand-dark">₹{d.amount.toLocaleString()}</p>
                    <p className="text-xs font-medium text-brand-dark/60 mt-1">{d.project} • {new Date(d.donated_at).toLocaleDateString()}</p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md uppercase tracking-wider">{d.payment_mode}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card bg-brand-dark p-10 text-white relative overflow-hidden rounded-2xl border-0 shadow-xl mt-4">
        <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-brand-primary/20 rounded-full blur-2xl pointer-events-none"></div>
        <h3 className="text-2xl font-bold border-b border-white/10 pb-4 mb-8 relative z-10 flex items-center gap-2">Your Extended Impact</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          <div><p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-brand-primary">₹{total.toLocaleString()}</p><p className="text-white/60 font-medium text-sm mt-2">Total Donated</p></div>
          <div><p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-emerald-500">{Math.round(total / 5000)}</p><p className="text-white/60 font-medium text-sm mt-2">Children Supported</p></div>
          <div><p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-400">{donations.length}</p><p className="text-white/60 font-medium text-sm mt-2">Total Contributions</p></div>
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
