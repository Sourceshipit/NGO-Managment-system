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
      <h1 className="page-title text-brand-dark mb-6">Reports & Analytics</h1>
      <div className="flex gap-3 mb-8 overflow-x-auto custom-scrollbar pb-2">
        {([['volunteer','Volunteers',Users],['children','Children',Baby],['donation','Donations',Heart],['compliance','Compliance',Shield]] as const).map(([key, label, Icon]) => (
          <button key={key} onClick={() => setTab(key as any)} className={`px-4 py-2.5 text-sm font-semibold transition-all flex items-center gap-2 rounded-xl border whitespace-nowrap ${tab===key?'bg-brand-dark text-white border-transparent shadow-sm':'bg-white text-brand-dark/60 border-brand-border/40 hover:bg-slate-50 hover:text-brand-dark hover:border-brand-border'}`}>
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {tab === 'volunteer' && (
        <div className="space-y-6">
          <div className="grid grid-cols-4 gap-6">
            {[
              {l:'Total Volunteers',v:vols.length},{l:'Total Hours',v:`${vols.reduce((s:number,v:any)=>s+v.total_hours,0).toFixed(0)}h`},
              {l:'Avg Hours/Vol',v:`${vols.length>0?(vols.reduce((s:number,v:any)=>s+v.total_hours,0)/vols.length).toFixed(1):0}h`},{l:'Active',v:vols.filter((v:any)=>v.status==='ACTIVE').length}
            ].map(s => <div key={s.l} className="card bg-white p-5 text-center shadow-sm hover:shadow-md transition-shadow"><p className="text-3xl font-bold text-brand-dark">{s.v}</p><p className="text-xs mt-2 font-bold uppercase text-brand-dark/50 tracking-wider whitespace-nowrap overflow-hidden text-ellipsis">{s.l}</p></div>)}
          </div>
          <div className="card bg-white p-6 shadow-sm">
            <h3 className="font-bold text-lg text-brand-dark mb-4 filter drop-shadow-sm">Top 5 Most Active</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm"><thead><tr className="border-b border-brand-border/40 text-brand-dark/60 text-xs uppercase tracking-wider"><th className="text-left pb-3 font-semibold">Name</th><th className="text-left pb-3 font-semibold">Hours</th><th className="text-left pb-3 font-semibold">Skills</th></tr></thead>
              <tbody>{vols.sort((a:any,b:any)=>b.total_hours-a.total_hours).slice(0,5).map((v:any) => <tr key={v.id} className="border-b border-brand-border/20 last:border-0 hover:bg-slate-50 transition-colors"><td className="py-3 font-bold text-brand-dark w-1/3">{v.user?.full_name}</td><td className="py-3 font-bold text-emerald-600">{v.total_hours}h</td><td className="py-3 text-brand-dark/60 text-xs w-1/2">{v.skills.split(',').slice(0,3).join(', ')}</td></tr>)}</tbody></table>
            </div>
          </div>
          <button onClick={() => exportPDF('Volunteer Report', `<h1>Volunteer Report</h1><div class="stat"><h3>${vols.length}</h3><p>Total Volunteers</p></div><div class="stat"><h3>${vols.reduce((s:number,v:any)=>s+v.total_hours,0).toFixed(0)}h</h3><p>Total Hours</p></div>`)}
            className="btn-secondary text-brand-dark font-semibold justify-center flex items-center md:w-auto w-full gap-2 shadow-sm"><Download className="w-4 h-4" /> Export Report</button>
        </div>
      )}

      {tab === 'children' && (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-6">
            {[{l:'Total Enrolled',v:children.length},{l:'Active',v:children.filter((c:any)=>c.is_active).length},{l:'Programs',v:new Set(children.map((c:any)=>c.program)).size}].map(s => <div key={s.l} className="card bg-white p-5 text-center shadow-sm hover:shadow-md transition-shadow"><p className="text-3xl font-bold text-brand-dark">{s.v}</p><p className="text-xs mt-2 font-bold uppercase tracking-wider text-brand-dark/50">{s.l}</p></div>)}
          </div>
          <div className="card bg-white p-6 shadow-sm">
            <h3 className="font-bold text-lg text-brand-dark mb-6">Enrollment by Program</h3>
            <div className="space-y-5">
              {Object.entries(children.reduce((acc:any,c:any) => ({...acc,[c.program]:(acc[c.program]||0)+1}),{})).map(([p,c]) => (
                <div key={p} className="flex items-center gap-4"><span className="w-32 sm:w-40 text-sm font-semibold text-brand-dark truncate">{p}</span><div className="flex-1 h-3 sm:h-4 bg-brand-light rounded-full overflow-hidden"><div className="h-full bg-brand-primary rounded-full transition-all duration-500 ease-out" style={{width:`${((c as number)/children.length)*100}%`}}></div></div><span className="text-sm font-bold text-brand-dark w-12 text-right">{c as number}</span></div>
              ))}
            </div>
          </div>
          <button onClick={() => exportPDF('Children Report', `<h1>Children Report</h1><div class="stat"><h3>${children.length}</h3><p>Total Enrolled</p></div>`)}
            className="btn-secondary text-brand-dark font-semibold justify-center flex items-center md:w-auto w-full gap-2 shadow-sm"><Download className="w-4 h-4" /> Export Report</button>
        </div>
      )}

      {tab === 'donation' && (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-6">
            {[{l:'Total Donated',v:`₹${donations.reduce((s:number,d:any)=>s+d.amount,0).toLocaleString()}`},{l:'Donations',v:donations.length},{l:'Avg/Donation',v:`₹${donations.length>0?Math.round(donations.reduce((s:number,d:any)=>s+d.amount,0)/donations.length).toLocaleString():0}`}].map(s => <div key={s.l} className="card bg-white p-5 text-center shadow-sm hover:shadow-md transition-shadow"><p className="text-3xl font-bold text-brand-dark">{s.v}</p><p className="text-xs mt-2 font-bold uppercase tracking-wider text-brand-dark/50">{s.l}</p></div>)}
          </div>
          <div className="card bg-white p-6 shadow-sm">
            <h3 className="font-bold text-lg text-brand-dark mb-6">Funding by Project</h3>
            <div className="space-y-5">
              {Object.entries(donations.reduce((acc:any,d:any)=>({...acc,[d.project]:(acc[d.project]||0)+d.amount}),{})).map(([p,a]) => (
                <div key={p} className="flex items-center gap-4"><span className="w-32 sm:w-40 text-sm font-semibold text-brand-dark truncate" title={p}>{p}</span><div className="flex-1 h-3 sm:h-4 bg-brand-light rounded-full overflow-hidden"><div className="h-full bg-brand-primary rounded-full transition-all duration-500 ease-out" style={{width:`${(a as number)/donations.reduce((s:number,d:any)=>s+d.amount,0)*100}%`}}></div></div><span className="text-sm font-bold text-brand-dark text-right w-24">₹{(a as number).toLocaleString()}</span></div>
              ))}
            </div>
          </div>
          <button onClick={() => {
            const csv = 'Date,Donor,Amount,Project,Mode\n' + donations.map((d:any)=>`${new Date(d.donated_at).toLocaleDateString()},${d.donor_name||d.donor_id},${d.amount},${d.project},${d.payment_mode}`).join('\n');
            const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='donations.csv';a.click();
          }} className="btn-secondary text-brand-dark font-semibold justify-center flex items-center md:w-auto w-full gap-2 shadow-sm"><Download className="w-4 h-4" /> Download CSV</button>
        </div>
      )}

      {tab === 'compliance' && (
        <div className="space-y-6">
          <div className="card bg-white overflow-hidden border-transparent">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-sm"><thead><tr className="bg-slate-50 border-b border-brand-border/50 text-brand-dark/60"><th className="text-left px-5 py-3.5 font-semibold text-xs uppercase tracking-wider">Policy</th><th className="text-left px-5 py-3.5 font-semibold text-xs uppercase tracking-wider">Status</th><th className="text-left px-5 py-3.5 font-semibold text-xs uppercase tracking-wider">Next Deadline</th><th className="text-left px-5 py-3.5 font-semibold text-xs uppercase tracking-wider">Days Left</th></tr></thead>
              <tbody>{compliance.map((c:any)=>{const d=c.next_deadline?Math.ceil((new Date(c.next_deadline).getTime()-Date.now())/86400000):null;return(
                <tr key={c.id} className="border-b border-brand-border/30 last:border-b-0 hover:bg-slate-50/50 transition-colors"><td className="px-5 py-4 font-bold text-brand-dark">{c.policy_name}</td><td className="px-5 py-4"><span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${c.status==='ACTIVE'?'bg-emerald-100 text-emerald-800':c.status==='DUE_SOON'?'bg-amber-100 text-amber-800':'bg-red-100 text-red-800'}`}>{c.status.replace('_', ' ')}</span></td><td className="px-5 py-4 font-medium text-brand-dark/80">{c.next_deadline?new Date(c.next_deadline).toLocaleDateString():'—'}</td><td className={`px-5 py-4 font-bold ${d&&d<=30?'text-red-500':'text-brand-dark/80'}`}>{d!==null?d:'—'}</td></tr>
              )})}</tbody></table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
