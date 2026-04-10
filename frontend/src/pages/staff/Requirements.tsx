import { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { Target, Search, Plus, Edit, X, Trash2, Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface Requirement {
  id: number;
  title: string;
  category: string;
  urgency: string;
  description: string;
  quantity_needed: number;
  quantity_fulfilled: number;
  is_active: boolean;
}

export default function StaffRequirements() {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editingReq, setEditingReq] = useState<Requirement | null>(null);
  const [form, setForm] = useState({
    title: '',
    category: 'Logistics',
    urgency: 'MEDIUM',
    description: '',
    quantity_needed: 1
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { load(); }, []);
  
  const load = async () => {
    try {
      const response = await api.get('/requirements');
      setRequirements(response.data);
    } catch { 
      toast.error('Failed to load NGO requirements'); 
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingReq(null);
    setForm({ title: '', category: 'Logistics', urgency: 'MEDIUM', description: '', quantity_needed: 1 });
    setModalOpen(true);
  };

  const openEditModal = (r: Requirement) => {
    setEditingReq(r);
    setForm({ 
      title: r.title, 
      category: r.category, 
      urgency: r.urgency, 
      description: r.description, 
      quantity_needed: r.quantity_needed 
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.title || !form.description || form.quantity_needed <= 0) {
      toast.error('Please fill all fields correctly');
      return;
    }
    setSubmitting(true);
    try {
      if (editingReq) {
        await api.put(`/requirements/${editingReq.id}`, form);
        toast.success('Requirement updated');
      } else {
        await api.post('/requirements', form);
        toast.success('Requirement created');
      }
      setModalOpen(false);
      load();
    } catch (e: any) {
      toast.error(e.response?.data?.detail || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this requirement?')) return;
    try {
      await api.delete(`/requirements/${id}`);
      toast.success('Requirement deleted');
      load();
    } catch (e: any) {
      toast.error('Failed to delete requirement');
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'HIGH': return 'bg-red-100 text-red-700';
      case 'MEDIUM': return 'bg-amber-100 text-amber-700';
      case 'LOW': return 'bg-emerald-100 text-emerald-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  if (loading) return <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>;

  const filtered = requirements.filter(r => !search || r.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="page-title text-brand-dark mb-0">NGO Requirements</h1>
        <button onClick={openAddModal} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Requirement
        </button>
      </div>

      <div className="space-y-6">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-3.5 w-5 h-5 text-brand-dark/40" />
          <input value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-10" placeholder="Search requirements..." />
        </div>
        
        <div className="card bg-white overflow-hidden border-transparent">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-brand-border/50 text-brand-dark/60">
                  <th className="text-left px-5 py-3.5 font-semibold text-xs uppercase tracking-wider">Title</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-xs uppercase tracking-wider">Category</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-xs uppercase tracking-wider">Urgency</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-xs uppercase tracking-wider">Fulfilled</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-xs uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => {
                  const isFullyFunded = r.quantity_fulfilled >= r.quantity_needed;
                  return (
                    <tr key={r.id} className="border-b border-brand-border/30 last:border-b-0 hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-4 font-bold text-brand-dark max-w-[200px] truncate" title={r.title}>{r.title}</td>
                      <td className="px-5 py-4 text-brand-dark/70 font-medium text-xs uppercase tracking-wider">{r.category}</td>
                      <td className="px-5 py-4">
                        <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${getUrgencyColor(r.urgency)}`}>
                          {r.urgency}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-bold">
                        <span className={isFullyFunded ? "text-emerald-600 bg-emerald-50 px-2 py-1 rounded" : "text-brand-dark"}>
                          {r.quantity_fulfilled} / {r.quantity_needed}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {isFullyFunded ? (
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-1 rounded">Complete</span>
                        ) : (
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-1 rounded">Open</span>
                        )}
                      </td>
                      <td className="px-5 py-4 flex gap-2">
                        <button onClick={() => openEditModal(r)} className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors" title="Edit Requirement"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(r.id)} className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors" title="Delete Requirement"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-brand-dark/40 font-medium">
                      <AlertCircle className="mx-auto h-8 w-8 mb-2 opacity-50" />
                      No requirements found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 border-b border-brand-border/50 pb-4">
              <h3 className="text-xl font-bold text-brand-dark">{editingReq ? 'Edit Requirement' : 'Add New Requirement'}</h3>
              <button onClick={() => setModalOpen(false)} className="p-1.5 rounded-full hover:bg-slate-100 transition-colors"><X className="w-5 h-5 text-brand-dark/50" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-brand-dark/60 uppercase mb-1 block">Title</label>
                <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="input-field" placeholder="E.g., Winter Blankets" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-brand-dark/60 uppercase mb-1 block">Category</label>
                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="input-field appearance-none bg-white">
                    <option>Logistics</option>
                    <option>Supplies</option>
                    <option>Funding</option>
                    <option>Volunteering</option>
                    <option>Technology</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-brand-dark/60 uppercase mb-1 block">Urgency</label>
                  <select value={form.urgency} onChange={e => setForm({...form, urgency: e.target.value})} className="input-field appearance-none bg-white">
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-brand-dark/60 uppercase mb-1 block">Quantity Needed</label>
                <input type="number" min="1" value={form.quantity_needed} onChange={e => setForm({...form, quantity_needed: parseInt(e.target.value) || 1})} className="input-field" />
              </div>
              <div>
                <label className="text-xs font-bold text-brand-dark/60 uppercase mb-1 block">Description</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} className="input-field py-3 resize-none" placeholder="Provide details about the mission..." />
              </div>
              <button onClick={handleSubmit} disabled={submitting} className="btn-primary w-full mt-6 shadow-sm flex items-center justify-center gap-2">
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingReq ? 'Save Changes' : 'Publish Requirement'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
