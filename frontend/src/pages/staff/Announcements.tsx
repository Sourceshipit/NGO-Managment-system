import { useState, useEffect } from 'react';
import { announcementsAPI } from '../../api/client';
import type { Announcement } from '../../types';
import { Plus, Edit, Trash2, Eye, X, Loader2, Megaphone } from 'lucide-react';
import toast from 'react-hot-toast';

const priorities = ['HIGH','MEDIUM','LOW'];
const colors: Record<string,string> = {HIGH:'bg-red-200 text-red-900 border-red-900',MEDIUM:'bg-yellow-200 text-yellow-900 border-yellow-900',LOW:'bg-emerald-200 text-emerald-900 border-emerald-900'};

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
      <div className="flex justify-between items-end mb-6 border-b-4 border-black pb-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900">Announcements</h1>
          <p className="font-mono text-sm font-bold text-slate-600 mt-1 uppercase">{list.length} POSTED</p>
        </div>
        <button onClick={() => { setShowModal(true); setEditAnn(null); setForm({title:'',content:'',priority:'MEDIUM'}); }}
          className="px-4 py-2 bg-emerald-500 text-black border-2 border-black font-black uppercase tracking-wider hover:bg-emerald-400 active:translate-y-1 transition-all shadow-[4px_4px_0px_rgba(0,0,0,1)] active:shadow-none flex items-center gap-2">
          <Plus className="w-4 h-4" /> NEW ANNOUNCEMENT
        </button>
      </div>

      <div className="space-y-4">
        {list.length === 0 ? (
          <div className="card bg-slate-50 border-dashed border-4 border-slate-300 p-16 text-center">
            <Megaphone className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <p className="font-black uppercase text-xl text-slate-500 tracking-tight">NO ANNOUNCEMENTS YET</p>
          </div>
        ) : list.map(a => (
          <div key={a.id} className="card bg-white p-5 border-l-8 hover:translate-x-1 transition-transform" style={{ borderLeftColor: a.priority === 'HIGH' ? '#f87171' : a.priority === 'MEDIUM' ? '#fbbf24' : '#34d399' }}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <h3 className="font-black text-lg uppercase tracking-tight text-slate-900">{a.title}</h3>
                <span className={`text-[10px] px-2 py-0.5 border-2 font-black uppercase tracking-wider ${colors[a.priority]}`}>
                  {a.priority}
                </span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => showReaders(a)} className="w-8 h-8 border-2 border-black flex items-center justify-center bg-blue-100 hover:bg-blue-200 transition-colors" title="View Readers"><Eye className="w-4 h-4 text-black" /></button>
                <button onClick={() => { setEditAnn(a); setForm({title:a.title,content:a.content,priority:a.priority}); setShowModal(true); }} className="w-8 h-8 border-2 border-black flex items-center justify-center bg-amber-100 hover:bg-amber-200 transition-colors"><Edit className="w-4 h-4 text-black" /></button>
                <button onClick={() => remove(a.id)} className="w-8 h-8 border-2 border-black flex items-center justify-center bg-red-100 hover:bg-red-200 transition-colors"><Trash2 className="w-4 h-4 text-black" /></button>
              </div>
            </div>
            <p className="font-mono text-sm text-slate-800 mb-4 whitespace-pre-wrap">{a.content}</p>
            <div className="flex items-center gap-4 text-xs font-bold font-mono text-slate-500 border-t-2 border-black/10 pt-3 uppercase">
              <span>BY {a.creator_name || 'STAFF'}</span>
              <span>•</span>
              <span>{new Date(a.created_at).toLocaleDateString('en-IN').toUpperCase()}</span>
              <span>•</span>
              <span>{a.read_count} READS</span>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="card bg-white p-6 w-full max-w-md shadow-[8px_8px_0px_rgba(0,0,0,1)] m-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 border-b-2 border-black pb-4">
              <h3 className="text-xl font-black uppercase tracking-tight">{editAnn ? 'Edit' : 'New'} Announcement</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="w-8 h-8 border-2 border-black flex items-center justify-center hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5 text-black" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="font-mono text-sm font-bold text-slate-800 mb-2 block uppercase">Title</label>
                <input 
                  value={form.title} 
                  onChange={e => setForm({...form, title: e.target.value})} 
                  placeholder="Enter title..." 
                  className="w-full h-12 px-4 bg-white border-2 border-black font-mono text-sm focus:outline-none focus:border-emerald-500 transition-colors" 
                />
              </div>
              
              <div>
                <label className="font-mono text-sm font-bold text-slate-800 mb-2 block uppercase">Content</label>
                <textarea 
                  value={form.content} 
                  onChange={e => setForm({...form, content: e.target.value})} 
                  placeholder="Body text..." 
                  rows={5} 
                  className="w-full p-4 bg-white border-2 border-black font-mono text-sm focus:outline-none focus:border-emerald-500 transition-colors resize-none" 
                />
              </div>
              
              <div>
                <label className="font-mono text-sm font-bold text-slate-800 mb-2 block uppercase">Priority Level</label>
                <div className="flex gap-2">
                  {priorities.map(p => (
                    <button 
                      key={p} 
                      onClick={() => setForm({...form, priority: p})} 
                      className={`flex-1 py-2 border-2 border-black font-black uppercase text-sm tracking-wider transition-colors ${
                        form.priority===p ? 'bg-black text-emerald-400' : 'bg-slate-50 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              
              <button 
                onClick={submit} 
                className="w-full h-12 mt-4 bg-emerald-500 text-black border-2 border-black font-black uppercase tracking-wider hover:bg-emerald-400 active:translate-y-1 transition-all shadow-[4px_4px_0px_rgba(0,0,0,1)] active:shadow-none"
              >
                {editAnn ? 'SAVE CHANGES' : 'POST ANNOUNCEMENT'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Readers Modal */}
      {viewReaders && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setViewReaders(null)}>
          <div className="card bg-white p-6 w-full max-w-sm shadow-[8px_8px_0px_rgba(0,0,0,1)] m-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 border-b-2 border-black pb-4">
              <h3 className="text-xl font-black uppercase tracking-tight">Read By</h3>
              <button 
                onClick={() => setViewReaders(null)}
                className="w-8 h-8 border-2 border-black flex items-center justify-center hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5 text-black" />
              </button>
            </div>
            
            {viewReaders.readers.length === 0 ? (
              <p className="font-mono text-sm font-bold text-slate-400 py-6 text-center uppercase tracking-widest">NOBODY HAS READ THIS YET</p>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto no-scrollbar">
                {viewReaders.readers.map((r: any, i: number) => (
                  <div key={i} className="flex justify-between items-center p-3 border-2 border-black bg-slate-50">
                    <span className="font-bold uppercase tracking-tight">{r.user_name}</span>
                    <span className="font-mono text-xs text-slate-500">{new Date(r.read_at).toLocaleDateString()}</span>
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
