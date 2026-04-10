import { useState, useEffect } from 'react';
import { donorsAPI, dashboardAPI } from '../../api/client';
import type { Donation, DashboardStats } from '../../types';
import { TrendingUp, Heart, Users, BookOpen, Loader2, Baby } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DonorImpact() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [dash, setDash] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([donorsAPI.getDonations(), dashboardAPI.getStats()])
      .then(([d,ds]) => { setDonations(d); setDash(ds); })
      .catch(() => toast.error('Failed'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-pink-500" /></div>;

  const total = donations.reduce((s,d)=>s+d.amount,0);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="card bg-pink-500 text-white p-8 relative overflow-hidden">
        <h1 className="text-3xl font-black uppercase tracking-tight relative border-b border-brand-border pb-4 mb-4">Your Impact Story</h1>
        <p className="font-mono text-white/90 relative">EVERY RUPEE YOU DONATE CREATES LASTING CHANGE</p>
        <div className="grid grid-cols-3 gap-8 mt-6 relative">
          <div><p className="text-5xl font-black">₹{total.toLocaleString()}</p><p className="font-mono mt-1 text-white/80 uppercase text-sm">TOTAL DONATED</p></div>
          <div><p className="text-5xl font-black">{Math.round(total/5000)}</p><p className="font-mono mt-1 text-white/80 uppercase text-sm">CHILDREN SUPPORTED</p></div>
          <div><p className="text-5xl font-black">{donations.length}</p><p className="font-mono mt-1 text-white/80 uppercase text-sm">CONTRIBUTIONS</p></div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { name: 'Education', icon: BookOpen, stat: `₹${donations.filter(d=>d.project==='Education').reduce((s,d)=>s+d.amount,0).toLocaleString()}`, sub: `${Math.round(donations.filter(d=>d.project==='Education').reduce((s,d)=>s+d.amount,0)/5000)} children helped`, color: 'bg-pink-100 text-pink-600' },
          { name: 'Healthcare', icon: Heart, stat: `₹${donations.filter(d=>d.project==='Healthcare').reduce((s,d)=>s+d.amount,0).toLocaleString()}`, sub: `${Math.round(donations.filter(d=>d.project==='Healthcare').reduce((s,d)=>s+d.amount,0)/2000)} checkups`, color: 'bg-pink-100 text-pink-600' },
          { name: 'Livelihood', icon: Users, stat: `₹${donations.filter(d=>d.project==='Livelihood').reduce((s,d)=>s+d.amount,0).toLocaleString()}`, sub: `${Math.round(donations.filter(d=>d.project==='Livelihood').reduce((s,d)=>s+d.amount,0)/10000)} families`, color: 'bg-pink-100 text-pink-600' },
          { name: 'Environment', icon: TrendingUp, stat: `₹${donations.filter(d=>d.project==='Environment').reduce((s,d)=>s+d.amount,0).toLocaleString()}`, sub: `${Math.round(donations.filter(d=>d.project==='Environment').reduce((s,d)=>s+d.amount,0)/500)} trees planted`, color: 'bg-pink-100 text-pink-600' },
        ].map(p => (
          <div key={p.name} className="card p-5 bg-white">
            <div className={`w-12 h-12 border border-brand-border flex items-center justify-center mb-4 ${p.color}`}><p.icon className="w-6 h-6" /></div>
            <h3 className="font-black uppercase tracking-tight text-slate-900 mb-1">{p.name}</h3>
            <p className="text-xl font-black text-slate-800">{p.stat}</p>
            <p className="font-mono text-xs mt-2 font-bold text-slate-600 uppercase">{p.sub}</p>
          </div>
        ))}
      </div>

      <div className="card p-6 bg-white">
        <h3 className="font-black uppercase tracking-tight text-slate-900 mb-6 border-b border-brand-border pb-4">CareConnect Foundation Overview</h3>
        <div className="grid grid-cols-4 gap-4">
          <div className="border border-brand-border p-4 bg-slate-50 text-center shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-sm transition-all">
            <p className="text-3xl font-black text-slate-900 mb-1">{dash?.children_enrolled || 0}</p>
            <p className="font-mono text-xs font-bold text-slate-600 uppercase">CHILDREN ENROLLED</p>
          </div>
          <div className="border border-brand-border p-4 bg-slate-50 text-center shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-sm transition-all">
            <p className="text-3xl font-black text-slate-900 mb-1">{dash?.active_volunteers || 0}</p>
            <p className="font-mono text-xs font-bold text-slate-600 uppercase">ACTIVE VOLUNTEERS</p>
          </div>
          <div className="border border-brand-border p-4 bg-slate-50 text-center shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-sm transition-all">
            <p className="text-3xl font-black text-slate-900 mb-1">₹{(dash?.total_donations_amount || 0).toLocaleString()}</p>
            <p className="font-mono text-xs font-bold text-slate-600 uppercase">TOTAL RAISED</p>
          </div>
          <div className="border border-brand-border p-4 bg-slate-50 text-center shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-sm transition-all">
            <p className="text-3xl font-black text-slate-900 mb-1">{dash?.compliance_score || 0}%</p>
            <p className="font-mono text-xs font-bold text-slate-600 uppercase">COMPLIANCE</p>
          </div>
        </div>
      </div>

      <div className="card p-6 bg-pink-50 border-pink-500">
        <h3 className="font-black uppercase tracking-tight text-pink-900 mb-2 flex items-center gap-2">
          <Heart className="w-5 h-5" fill="currentColor" /> THANK YOU
        </h3>
        <p className="font-mono text-sm font-bold text-pink-800 leading-relaxed uppercase">
          YOUR CONTRIBUTIONS TO CARECONNECT FOUNDATION DIRECTLY SUPPORT CHILDREN'S EDUCATION, HEALTHCARE, AND LIVELIHOOD PROGRAMS ACROSS MAHARASHTRA. EVERY DONATION IS RECORDED ON OUR BLOCKCHAIN-SECURED AUDIT TRAIL FOR FULL TRANSPARENCY.
        </p>
      </div>
    </div>
  );
}
