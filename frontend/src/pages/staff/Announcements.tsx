import { useState, useEffect } from 'react';
import { announcementsAPI } from '../../api/client';
import type { Announcement } from '../../types';
import { Plus, Edit, Trash2, Eye, X, Loader2, Megaphone } from 'lucide-react';
import toast from 'react-hot-toast';

const priorities = ['HIGH','MEDIUM','LOW'];
const colors: Record<string,string> = {HIGH:'bg-red-100 text-red-700',MEDIUM:'bg-amber-100 text-amber-700',LOW:'bg-emerald-100 text-emerald-700'};

export default function StaffAnnouncements() {
  const [list, setList] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editAnn, setEditAnn] = useState<Announcement | null>(null);
  const [form, setForm] = useState({title:'',content:'',priority:'MEDIUM'});
  const [viewReaders, setViewReaders] = useState<{id:number; title:string; readers: any[]} | null>(null);

  useEffect(() => { load(); }, []);
  const load = async () => {
    try { setList(await announcementsAPI.getAll()); } catch { toast.error('Failed to load'); }
    setLoading(false);
  };

  const submit = async () => {
    if (!form.title || !form.content) { toast.error('Title and content are required'); return; }
    try {
      if (editAnn) { await announcementsAPI.update(editAnn.id, form); toast.success('Updated'); }
      else { await announcementsAPI.create(form); toast.success('Announcement posted'); }
      setShowModal(false); setEditAnn(null); setForm({title:'',content:'',priority:'MEDIUM'}); load();
    } catch { toast.error('Failed'); }
  };

  const remove = async (id: number) => {
    try { await announcementsAPI.remove(id); toast.success('Deleted'); load(); } catch { toast.error('Failed'); }
  };

  const showReaders = async (a: Announcement) => {
    try { const r = await announcementsAPI.getReaders(a.id); setViewReaders({id: a.id, title: a.title, readers: r}); }
    catch { toast.error('Failed'); }
  };

  if (loading) return <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="page-title text-brand-dark">Announcements</h1>
          <p className="text-sm font-medium text-brand-dark/60 mt-1">{list.length} POSTED</p>
        </div>
        <button onClick={() => { setShowModal(true); setEditAnn(null); setForm({title:'',content:'',priority:'MEDIUM'}); }}
          className="btn-primary flex items-center gap-2 shadow-sm">
          <Plus className="w-5 h-5" /> New Announcement
        </button>
      </div>

      <div className="space-y-4">
        {list.length === 0 ? (
          <div className="card bg-slate-50 border-dashed border-2 border-brand-border/40 p-16 text-center">
            <Megaphone className="w-12 h-12 text-brand-dark/20 mx-auto mb-4" />
            <p className="font-semibold text-lg text-brand-dark/40 tracking-tight">No announcements posted yet</p>
          </div>
        ) : list.map(a => (
          <div key={a.id} className="card bg-white p-6 border-l-4 shadow-sm hover:shadow-md transition-shadow" style={{ borderLeftColor: a.priority === 'HIGH' ? '#f87171' : a.priority === 'MEDIUM' ? '#fbbf24' : '#34d399' }}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <h3 className="font-bold text-lg text-brand-dark">{a.title}</h3>
                <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${colors[a.priority]}`}>
                  {a.priority}
                </span>
              </div>
              <div className="flex items-center gap-1.5 opacity-80">
                <button onClick={() => showReaders(a)} className="p-1.5 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors" title="View Readers"><Eye className="w-4 h-4" /></button>
                <button onClick={() => { setEditAnn(a); setForm({title:a.title,content:a.content,priority:a.priority}); setShowModal(true); }} className="p-1.5 rounded bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors" title="Edit"><Edit className="w-4 h-4" /></button>
                <button onClick={() => remove(a.id)} className="p-1.5 rounded bg-red-50 text-red-600 hover:bg-red-100 transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            <p className="text-sm text-brand-dark/80 mb-6 whitespace-pre-wrap leading-relaxed">{a.content}</p>
            <div className="flex items-center gap-4 text-xs font-medium text-brand-dark/50 pt-4 border-t border-brand-border/30 uppercase tracking-widest">
              <span>By {a.creator_name || 'Staff'}</span>
              <span>•</span>
              <span>{new Date(a.created_at).toLocaleDateString('en-IN', {month:'short', day:'numeric', year:'numeric'})}</span>
              <span>•</span>
              <span>{a.read_count} READS</span>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-transparent m-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 border-b border-brand-border/50 pb-4">
              <h3 className="text-xl font-bold text-brand-dark">{editAnn ? 'Edit' : 'New'} Announcement</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-full hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5 text-brand-dark/50" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-brand-dark/60 uppercase mb-1 block">Title</label>
                <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Announcement title" className="input-field" />
              </div>
              
              <div>
                <label className="text-xs font-bold text-brand-dark/60 uppercase mb-1 block">Content</label>
                <textarea value={form.content} onChange={e => setForm({...form, content: e.target.value})} placeholder="Body text..." rows={5} className="input-field py-3 resize-none" />
              </div>
              
              <div>
                <label className="text-xs font-bold text-brand-dark/60 uppercase mb-1 block">Priority Level</label>
                <div className="flex gap-2">
                  {priorities.map(p => (
                    <button key={p} onClick={() => setForm({...form, priority: p})} className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-colors ${form.priority===p ? 'bg-brand-primary text-white shadow-sm' : 'bg-slate-50 text-brand-dark/60 hover:bg-slate-100 border border-brand-border/40'}`}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              
              <button onClick={submit} className="btn-primary w-full mt-6 shadow-sm">
                {editAnn ? 'Save Changes' : 'Post Announcement'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Readers Modal */}
      {viewReaders && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setViewReaders(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl border border-transparent m-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 border-b border-brand-border/50 pb-4">
              <h3 className="text-xl font-bold text-brand-dark">Read By</h3>
              <button onClick={() => setViewReaders(null)} className="p-1.5 rounded-full hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5 text-brand-dark/50" />
              </button>
            </div>
            
            {viewReaders.readers.length === 0 ? (
              <p className="text-sm font-medium text-brand-dark/40 py-8 text-center bg-slate-50 rounded-xl border border-dashed border-brand-border/40">Nobody has read this yet</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                {viewReaders.readers.map((r: any, i: number) => (
                  <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-brand-border/40">
                    <span className="font-semibold text-sm text-brand-dark">{r.user_name}</span>
                    <span className="text-[10px] uppercase font-bold text-brand-dark/40">{new Date(r.read_at).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
