import { useState, useEffect } from 'react';
import { volunteersAPI, childrenAPI, donorsAPI, complianceAPI } from '../../api/client';
import { Loader2, BarChart2, Users, Baby, Heart, Shield, Download } from 'lucide-react';
import toast from 'react-hot-toast';

export default function StaffReports() {
  const [tab, setTab] = useState<'volunteer'|'children'|'donation'|'compliance'>('volunteer');
  const [loading, setLoading] = useState(true);
  const [vols, setVols] = useState<any[]>([]);
  const [children, setChildren] = useState<any[]>([]);
  const [donors, setDonors] = useState<any[]>([]);
  const [donations, setDonations] = useState<any[]>([]);
  const [compliance, setCompliance] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      volunteersAPI.getAll(), childrenAPI.getAll(),
      donorsAPI.getAll(), donorsAPI.getDonations(),
      complianceAPI.getAll()
    ]).then(([v,c,d,dn,co]) => { setVols(v); setChildren(c); setDonors(d); setDonations(dn); setCompliance(co); })
    .catch(() => toast.error('Failed to load'))
    .finally(() => setLoading(false));
  }, []);

  const exportPDF = (title: string, content: string) => {
    const w = window.open('', '_blank');
    if (w) {
      w.document.write(`<html><head><title>${title}</title><style>body{font-family:sans-serif;max-width:800px;margin:0 auto;padding:40px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}h1{color:#333}h2{color:#666;margin-top:24px}.stat{display:inline-block;padding:20px;margin:8px;background:#f8f9fa;border-radius:8px;text-align:center}.stat h3{font-size:32px;margin:0;color:#333}.stat p{margin:4px 0 0;color:#888}</style></head><body>${content}</body></html>`);
      w.document.close();
    }
  };

  if (loading) return <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-3xl font-black text-black uppercase tracking-tight mb-6">Reports</h1>
      <div className="flex gap-4 mb-6 flex-wrap">
        {([['volunteer','Volunteer',Users],['children','Children',Baby],['donation','Donations',Heart],['compliance','Compliance',Shield]] as const).map(([key, label, Icon]) => (
          <button key={key} onClick={() => setTab(key as any)} className={`font-mono px-4 py-2 text-sm font-bold uppercase transition-all flex items-center gap-2 border border-brand-border ${tab===key?'bg-emerald-400 shadow-[4px_4px_0_0_rgba(0,0,0,1)] text-black translate-y-[-2px]':'bg-white shadow-[2px_2px_0_0_rgba(0,0,0,1)] text-black hover:bg-emerald-50 hover:translate-y-[-2px] hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)]'}`}>
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {tab === 'volunteer' && (
        <div className="space-y-6">
          <div className="grid grid-cols-4 gap-6">
            {[
              {l:'TOTAL VOLUNTEERS',v:vols.length},{l:'TOTAL HOURS',v:`${vols.reduce((s:number,v:any)=>s+v.total_hours,0).toFixed(0)}h`},
              {l:'AVG HOURS/VOL',v:`${vols.length>0?(vols.reduce((s:number,v:any)=>s+v.total_hours,0)/vols.length).toFixed(1):0}h`},{l:'ACTIVE',v:vols.filter((v:any)=>v.status==='ACTIVE').length}
            ].map(s => <div key={s.l} className="bg-white border border-brand-border p-5 shadow-[4px_4px_0_0_rgba(0,0,0,1)] text-center"><p className="text-4xl font-black text-black font-mono">{s.v}</p><p className="text-xs mt-2 font-bold uppercase text-slate-500 tracking-wider">{s.l}</p></div>)}
          </div>
          <div className="bg-white border border-brand-border p-5 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
            <h3 className="font-black text-xl uppercase mb-4 text-black">Top 5 Most Active</h3>
            <table className="w-full text-sm font-mono"><thead><tr className="border-b border-brand-border text-slate-500 uppercase"><th className="text-left py-2 font-bold">Name</th><th className="text-left py-2 font-bold">Hours</th><th className="text-left py-2 font-bold">Skills</th></tr></thead>
            <tbody>{vols.sort((a:any,b:any)=>b.total_hours-a.total_hours).slice(0,5).map((v:any) => <tr key={v.id} className="border-b last:border-0 hover:bg-slate-50"><td className="py-3 font-bold uppercase">{v.user?.full_name}</td><td className="py-3 font-black text-emerald-600">{v.total_hours}h</td><td className="py-3 text-slate-500 uppercase">{v.skills}</td></tr>)}</tbody></table>
          </div>
          <button onClick={() => exportPDF('Volunteer Report', `<h1>Volunteer Report</h1><div class="stat"><h3>${vols.length}</h3><p>Total Volunteers</p></div><div class="stat"><h3>${vols.reduce((s:number,v:any)=>s+v.total_hours,0).toFixed(0)}h</h3><p>Total Hours</p></div>`)}
            className="px-6 py-3 bg-emerald-400 text-black border border-brand-border font-black uppercase text-sm shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-all flex items-center justify-center gap-2"><Download className="w-5 h-5" /> EXPORT REPORT</button>
        </div>
      )}

      {tab === 'children' && (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-6">
            {[{l:'TOTAL ENROLLED',v:children.length},{l:'ACTIVE',v:children.filter((c:any)=>c.is_active).length},{l:'PROGRAMS',v:new Set(children.map((c:any)=>c.program)).size}].map(s => <div key={s.l} className="bg-white border border-brand-border p-5 shadow-[4px_4px_0_0_rgba(0,0,0,1)] text-center"><p className="text-4xl font-black text-black font-mono">{s.v}</p><p className="text-xs mt-2 font-bold uppercase text-slate-500 tracking-wider">{s.l}</p></div>)}
          </div>
          <div className="bg-white border border-brand-border p-5 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
            <h3 className="font-black text-xl uppercase mb-4 text-black">By Program</h3>
            <div className="space-y-4 font-mono">
              {Object.entries(children.reduce((acc:any,c:any) => ({...acc,[c.program]:(acc[c.program]||0)+1}),{})).map(([p,c]) => (
                <div key={p} className="flex items-center gap-4"><span className="w-40 text-sm font-bold uppercase">{p}</span><div className="flex-1 h-8 bg-slate-100 border border-brand-border overflow-hidden relative"><div className="h-full bg-emerald-400 border-r border-brand-border" style={{width:`${((c as number)/children.length)*100}%`}}></div></div><span className="text-sm font-black w-8 text-right">{c as number}</span></div>
              ))}
            </div>
          </div>
          <button onClick={() => exportPDF('Children Report', `<h1>Children Report</h1><div class="stat"><h3>${children.length}</h3><p>Total Enrolled</p></div>`)}
            className="px-6 py-3 bg-emerald-400 text-black border border-brand-border font-black uppercase text-sm shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-all flex items-center justify-center gap-2"><Download className="w-5 h-5" /> EXPORT REPORT</button>
        </div>
      )}

      {tab === 'donation' && (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-6">
            {[{l:'TOTAL DONATED',v:`₹${donations.reduce((s:number,d:any)=>s+d.amount,0).toLocaleString()}`},{l:'DONATIONS',v:donations.length},{l:'AVG/DONATION',v:`₹${donations.length>0?Math.round(donations.reduce((s:number,d:any)=>s+d.amount,0)/donations.length).toLocaleString():0}`}].map(s => <div key={s.l} className="bg-white border border-brand-border p-5 shadow-[4px_4px_0_0_rgba(0,0,0,1)] text-center"><p className="text-4xl font-black text-black font-mono">{s.v}</p><p className="text-xs mt-2 font-bold uppercase text-slate-500 tracking-wider">{s.l}</p></div>)}
          </div>
          <div className="bg-white border border-brand-border p-5 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
            <h3 className="font-black text-xl uppercase mb-4 text-black">By Project</h3>
            <div className="space-y-4 font-mono">
              {Object.entries(donations.reduce((acc:any,d:any)=>({...acc,[d.project]:(acc[d.project]||0)+d.amount}),{})).map(([p,a]) => (
                <div key={p} className="flex items-center gap-4"><span className="w-40 text-sm font-bold uppercase">{p}</span><div className="flex-1 h-8 bg-slate-100 border border-brand-border overflow-hidden relative"><div className="h-full bg-pink-400 border-r border-brand-border" style={{width:`${(a as number)/donations.reduce((s:number,d:any)=>s+d.amount,0)*100}%`}}></div></div><span className="text-sm font-black text-right w-32">₹{(a as number).toLocaleString()}</span></div>
              ))}
            </div>
          </div>
          <button onClick={() => {
            const csv = 'Date,Donor,Amount,Project,Mode\n' + donations.map((d:any)=>`${new Date(d.donated_at).toLocaleDateString()},${d.donor_name||d.donor_id},${d.amount},${d.project},${d.payment_mode}`).join('\n');
            const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='donations.csv';a.click();
          }} className="px-6 py-3 bg-pink-400 text-black border border-brand-border font-black uppercase text-sm shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-all flex items-center justify-center gap-2"><Download className="w-5 h-5" /> DOWNLOAD CSV</button>
        </div>
      )}

      {tab === 'compliance' && (
        <div className="space-y-6">
          <div className="bg-white border border-brand-border shadow-[4px_4px_0_0_rgba(0,0,0,1)] overflow-hidden">
            <table className="w-full text-sm font-mono"><thead><tr className="bg-emerald-400 border-b border-brand-border text-black"><th className="text-left px-4 py-3 font-bold uppercase">Policy</th><th className="text-left px-4 py-3 font-bold uppercase">Status</th><th className="text-left px-4 py-3 font-bold uppercase">Next Deadline</th><th className="text-left px-4 py-3 font-bold uppercase">Days Left</th></tr></thead>
            <tbody>{compliance.map((c:any)=>{const d=c.next_deadline?Math.ceil((new Date(c.next_deadline).getTime()-Date.now())/86400000):null;return(
              <tr key={c.id} className="border-b border-brand-border last:border-b-0 hover:bg-slate-50 transition-colors"><td className="px-4 py-3 font-bold uppercase">{c.policy_name}</td><td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 border border-brand-border shadow-[2px_2px_0_0_rgba(0,0,0,1)] font-bold uppercase ${c.status==='ACTIVE'?'bg-green-400 text-black':c.status==='DUE_SOON'?'bg-amber-400 text-black':'bg-red-400 text-black'}`}>{c.status}</span></td><td className="px-4 py-3 font-bold uppercase text-slate-600">{c.next_deadline?new Date(c.next_deadline).toLocaleDateString():'—'}</td><td className={`px-4 py-3 font-black ${d&&d<=30?'text-red-600':'text-black'}`}>{d!==null?d:'—'}</td></tr>
            )})}</tbody></table>
          </div>
        </div>
      )}
    </div>
  );
}
