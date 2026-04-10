import { useState, useEffect } from 'react';
import { complianceAPI } from '../../api/client';
import type { ComplianceRecord } from '../../types';
import { Shield, AlertTriangle, CheckCircle, Clock, Edit, FileText, Loader2, X, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

const statusColors: Record<string,string> = {ACTIVE:'bg-emerald-100 text-emerald-800',DUE_SOON:'bg-amber-100 text-amber-800',EXPIRED:'bg-red-100 text-red-800',PENDING:'bg-blue-100 text-blue-800'};
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="page-title text-brand-dark">Government Compliance</h1>
          <p className="text-sm font-medium text-brand-dark/60 mt-1">Compliance Score: <span className={`font-bold ${score>=75?'text-emerald-500':score>=50?'text-amber-500':'text-red-500'}`}>{score}%</span></p>
        </div>
        <button onClick={generateReport} className="btn-primary shadow-sm flex items-center gap-2"><FileText className="w-4 h-4" /> Generate Report</button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {records.map(r => {
          const daysUntil = r.next_deadline ? Math.ceil((new Date(r.next_deadline).getTime() - Date.now()) / 86400000) : null;
          return (
            <div key={r.id} className="card p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow bg-white">
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-brand-light flex items-center justify-center shadow-sm">
                      <Shield className="w-6 h-6 text-brand-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-brand-dark">{r.policy_name}</h3>
                      <p className="text-xs text-brand-dark/60 font-medium">{r.registration_id || 'Not registered'}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${statusColors[r.status] || 'bg-slate-100 text-slate-600'}`}>{r.status.replace('_', ' ')}</span>
                </div>
                <div className="space-y-3 text-sm text-brand-dark/80 font-medium mb-6">
                  {r.last_filed && <p className="flex items-center gap-2 text-brand-dark/60"><CheckCircle className="w-4 h-4 text-emerald-500" /> Last filed: <span className="text-brand-dark font-semibold">{new Date(r.last_filed).toLocaleDateString()}</span></p>}
                  {r.next_deadline && <p className={`flex items-center gap-2 ${daysUntil && daysUntil <= 30 ? 'text-red-500 font-semibold' : 'text-brand-dark/60'}`}>
                    {daysUntil && daysUntil <= 30 ? <AlertTriangle className="w-4 h-4 text-red-500" /> : <Clock className="w-4 h-4 text-amber-500" />}
                    Next deadline: <span className={daysUntil && daysUntil <= 30 ? 'text-red-500' : 'text-brand-dark font-semibold'}>{new Date(r.next_deadline).toLocaleDateString()}</span> {daysUntil !== null && <span className="opacity-80">({daysUntil} days)</span>}
                  </p>}
                  {r.notes && <p className="text-xs bg-slate-50 p-3 rounded-lg border border-brand-border/40 text-brand-dark/80 italic mt-4">{r.notes}</p>}
                </div>
              </div>
              <div className="flex gap-3 mt-auto pt-4 border-t border-brand-border/30">
                <button onClick={() => { setEditRecord(r); setForm({status:r.status,registration_id:r.registration_id||'',last_filed:r.last_filed||'',next_deadline:r.next_deadline||'',notes:r.notes||''}); }}
                  className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-brand-dark rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 text-sm border border-brand-border/40"><Edit className="w-4 h-4" /> Update</button>
                {portals[r.policy_name] && <button onClick={() => window.open(portals[r.policy_name], '_blank')}
                  className="w-full py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 text-sm border border-blue-200/50"><ExternalLink className="w-4 h-4" /> Portal</button>}
              </div>
            </div>
          );
        })}
      </div>

      {editRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setEditRecord(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-transparent" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 border-b border-brand-border/50 pb-4">
              <h3 className="text-xl font-bold text-brand-dark">Update {editRecord.policy_name}</h3>
              <button onClick={() => setEditRecord(null)} className="p-1.5 rounded-full hover:bg-slate-100 transition-colors"><X className="w-5 h-5 text-brand-dark/50" /></button>
            </div>
            <div className="space-y-4">
              <div><label className="text-xs font-bold text-brand-dark/60 uppercase mb-1 block">Status</label><select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="input-field appearance-none">
                <option value="ACTIVE">ACTIVE</option><option value="DUE_SOON">DUE SOON</option><option value="EXPIRED">EXPIRED</option><option value="PENDING">PENDING</option>
              </select></div>
              <div><label className="text-xs font-bold text-brand-dark/60 uppercase mb-1 block">Registration ID</label><input value={form.registration_id} onChange={e => setForm({...form, registration_id: e.target.value})} placeholder="Registration Number" className="input-field" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-bold text-brand-dark/60 uppercase mb-1 block">Last Filed</label><input type="date" value={form.last_filed} onChange={e => setForm({...form, last_filed: e.target.value})} className="input-field" /></div>
                <div><label className="text-xs font-bold text-brand-dark/60 uppercase mb-1 block">Next Deadline</label><input type="date" value={form.next_deadline} onChange={e => setForm({...form, next_deadline: e.target.value})} className="input-field" /></div>
              </div>
              <div><label className="text-xs font-bold text-brand-dark/60 uppercase mb-1 block">Notes</label><textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={2} placeholder="Additional details or remarks" className="input-field py-3 resize-none" /></div>
              <button onClick={update} className="btn-primary w-full mt-6 shadow-sm">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
