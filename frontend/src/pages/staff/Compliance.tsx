import { useState, useEffect } from 'react';
import { complianceAPI } from '../../api/client';
import type { ComplianceRecord } from '../../types';
import { Shield, AlertTriangle, CheckCircle, Clock, Edit, FileText, Loader2, X, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

const statusColors: Record<string,string> = {ACTIVE:'bg-green-400 text-black border border-brand-border translate-x-[2px] translate-y-[-2px] shadow-[2px_2px_0_0_rgba(0,0,0,1)]',DUE_SOON:'bg-amber-400 text-black border border-brand-border translate-x-[2px] translate-y-[-2px] shadow-[2px_2px_0_0_rgba(0,0,0,1)]',EXPIRED:'bg-red-400 text-black border border-brand-border translate-x-[2px] translate-y-[-2px] shadow-[2px_2px_0_0_rgba(0,0,0,1)]',PENDING:'bg-blue-400 text-black border border-brand-border translate-x-[2px] translate-y-[-2px] shadow-[2px_2px_0_0_rgba(0,0,0,1)]'};
const portals: Record<string,string> = {FCRA:'https://fcraonline.nic.in','NITI Aayog Darpan':'https://ngo.india.gov.in',MCA21:'https://www.mca.gov.in','80G / 12A':'https://www.incometax.gov.in'};

export default function StaffCompliance() {
  const [records, setRecords] = useState<ComplianceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [editRecord, setEditRecord] = useState<ComplianceRecord | null>(null);
  const [form, setForm] = useState({status:'',registration_id:'',last_filed:'',next_deadline:'',notes:''});

  useEffect(() => { load(); }, []);
  const load = async () => {
    try { setRecords(await complianceAPI.getAll()); } catch { toast.error('Failed to load'); }
    setLoading(false);
  };

  const update = async () => {
    if (!editRecord) return;
    try {
      await complianceAPI.update(editRecord.id, {
        policy_name: editRecord.policy_name, status: form.status || editRecord.status,
        registration_id: form.registration_id || editRecord.registration_id,
        last_filed: form.last_filed || editRecord.last_filed,
        next_deadline: form.next_deadline || editRecord.next_deadline,
        notes: form.notes
      });
      toast.success('Compliance record updated');
      setEditRecord(null); load();
    } catch { toast.error('Failed to update'); }
  };

  const generateReport = async () => {
    try {
      const html = await complianceAPI.getReport();
      const w = window.open('', '_blank');
      if (w) { w.document.write(html as string); w.document.close(); }
    } catch { toast.error('Failed to generate report'); }
  };

  if (loading) return <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>;
  const score = Math.round((records.filter(r => r.status === 'ACTIVE').length / Math.max(1, records.length)) * 100);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div><h1 className="text-3xl font-black text-black uppercase tracking-tight">Government Compliance</h1><p className="text-sm font-semibold text-slate-500">Score: <span className={`font-black ${score>=75?'text-green-600':score>=50?'text-amber-600':'text-red-600'}`}>{score}%</span></p></div>
        <button onClick={generateReport} className="px-4 py-2 bg-emerald-400 text-black border border-brand-border shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-all font-semibold text-sm flex items-center gap-2"><FileText className="w-4 h-4" /> Generate Report</button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {records.map(r => {
          const daysUntil = r.next_deadline ? Math.ceil((new Date(r.next_deadline).getTime() - Date.now()) / 86400000) : null;
          return (
            <div key={r.id} className="bg-white border border-brand-border shadow-[4px_4px_0_0_rgba(0,0,0,1)] p-5 flex flex-col justify-between hover:bg-slate-50 transition-colors">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white border border-brand-border shadow-[2px_2px_0_0_rgba(0,0,0,1)] flex items-center justify-center"><Shield className="w-6 h-6 text-black" /></div>
                    <div><h3 className="font-black text-black uppercase">{r.policy_name}</h3><p className="text-xs text-slate-500 font-semibold">{r.registration_id}</p></div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 font-bold uppercase ${statusColors[r.status] || 'bg-slate-200 text-black border border-brand-border shadow-[2px_2px_0_0_rgba(0,0,0,1)] translate-x-[2px] translate-y-[2px]'}`}>{r.status}</span>
                </div>
                <div className="space-y-2 text-sm text-black font-semibold mb-6">
                  {r.last_filed && <p>LAST FILED: {new Date(r.last_filed).toLocaleDateString()}</p>}
                  {r.next_deadline && <p className={`flex items-center gap-1 ${daysUntil && daysUntil <= 30 ? 'text-red-500' : ''}`}>
                    {daysUntil && daysUntil <= 30 ? <AlertTriangle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                    NEXT DEADLINE: {new Date(r.next_deadline).toLocaleDateString()} {daysUntil !== null && `(${daysUntil} DAYS)`}
                  </p>}
                  {r.notes && <p className="text-xs text-slate-500 mt-2">{r.notes}</p>}
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setEditRecord(r); setForm({status:r.status,registration_id:r.registration_id||'',last_filed:r.last_filed||'',next_deadline:r.next_deadline||'',notes:r.notes||''}); }}
                  className="flex-1 py-2 text-sm border border-brand-border bg-white text-black font-bold uppercase shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:bg-emerald-400 hover:translate-y-[1px] hover:shadow-[1px_1px_0_0_rgba(0,0,0,1)] transition-all flex items-center justify-center gap-2"><Edit className="w-4 h-4" /> UPDATE</button>
                {portals[r.policy_name] && <button onClick={() => window.open(portals[r.policy_name], '_blank')}
                  className="flex-1 py-2 text-sm border border-brand-border bg-white text-black font-bold uppercase shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:bg-blue-400 hover:translate-y-[1px] hover:shadow-[1px_1px_0_0_rgba(0,0,0,1)] transition-all flex items-center justify-center gap-2"><ExternalLink className="w-4 h-4" /> PORTAL</button>}
              </div>
            </div>
          );
        })}
      </div>

      {editRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setEditRecord(null)}>
          <div className="bg-white border border-brand-border rounded-xl p-6 w-full max-w-md shadow-[8px_8px_0_0_rgba(0,0,0,1)]" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between mb-4"><h3 className="text-xl font-black text-black uppercase">UPDATE {editRecord.policy_name}</h3><button onClick={() => setEditRecord(null)} className="hover:bg-red-500 hover:text-white p-1 border-2 border-transparent hover:border-black transition-colors"><X className="w-5 h-5 text-black" /></button></div>
            <div className="space-y-4 font-mono">
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full h-10 px-3 bg-white border border-brand-border shadow-[2px_2px_0_0_rgba(0,0,0,1)] text-sm font-bold uppercase focus:outline-none">
                <option value="ACTIVE">ACTIVE</option><option value="DUE_SOON">DUE SOON</option><option value="EXPIRED">EXPIRED</option><option value="PENDING">PENDING</option>
              </select>
              <input value={form.registration_id} onChange={e => setForm({...form, registration_id: e.target.value})} placeholder="REGISTRATION ID" className="w-full h-10 px-3 bg-white border border-brand-border shadow-[2px_2px_0_0_rgba(0,0,0,1)] text-sm font-bold uppercase focus:outline-none" />
              <div className="grid grid-cols-2 gap-4">
                <input type="date" value={form.last_filed} onChange={e => setForm({...form, last_filed: e.target.value})} className="h-10 px-3 border border-brand-border shadow-[2px_2px_0_0_rgba(0,0,0,1)] text-sm font-bold uppercase focus:outline-none" />
                <input type="date" value={form.next_deadline} onChange={e => setForm({...form, next_deadline: e.target.value})} className="h-10 px-3 border border-brand-border shadow-[2px_2px_0_0_rgba(0,0,0,1)] text-sm font-bold uppercase focus:outline-none" />
              </div>
              <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={2} placeholder="NOTES" className="w-full px-3 py-2 border border-brand-border shadow-[2px_2px_0_0_rgba(0,0,0,1)] text-sm font-bold uppercase resize-none focus:outline-none" />
              <button onClick={update} className="w-full py-3 bg-emerald-400 text-black border border-brand-border font-black uppercase text-lg shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-all mt-4">SAVE CHANGES</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
