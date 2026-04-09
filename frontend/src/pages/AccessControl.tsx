import { useState, useEffect } from 'react';
import { allowlistAPI } from '../api/client';
import type { RoleAllowlistEntry } from '../types';
import { ShieldCheck, Plus, Pencil, Trash2, Loader2, Users, Shield, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../components/UI/Modal';
import ConfirmModal from '../components/UI/ConfirmModal';
import EmptyState from '../components/UI/EmptyState';
import { SkeletonTable } from '../components/UI/Skeleton';

const ROLE_BADGE: Record<string, string> = {
  ADMIN: 'bg-red-500 text-white',
  NGO_STAFF: 'bg-blue-500 text-white',
  VOLUNTEER: 'bg-green-500 text-white',
};

export default function AccessControl() {
  const [entries, setEntries] = useState<RoleAllowlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<RoleAllowlistEntry | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RoleAllowlistEntry | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [notes, setNotes] = useState('');

  const fetchEntries = () => {
    setLoading(true);
    allowlistAPI.getAll()
      .then(setEntries)
      .catch(() => toast.error('Failed to load allowlist'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchEntries(); }, []);

  const resetForm = () => { setEmail(''); setRole(''); setNotes(''); setEditing(null); };

  const openAdd = () => { resetForm(); setShowModal(true); };

  const openEdit = (entry: RoleAllowlistEntry) => {
    setEditing(entry);
    setEmail(entry.email);
    setRole(entry.assigned_role);
    setNotes(entry.notes || '');
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!email.trim()) { toast.error('Email is required'); return; }
    if (!role) { toast.error('Select a role'); return; }
    setSaving(true);
    try {
      if (editing) {
        await allowlistAPI.update(editing.id, { assigned_role: role, notes: notes || undefined });
        toast.success('Entry updated');
      } else {
        await allowlistAPI.create({ email, assigned_role: role, notes: notes || undefined });
        toast.success('Email added to allowlist');
      }
      setShowModal(false);
      resetForm();
      fetchEntries();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? 'Operation failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await allowlistAPI.remove(deleteTarget.id);
      toast.success('Entry removed');
      setDeleteTarget(null);
      fetchEntries();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? 'Delete failed');
    } finally { setSaving(false); }
  };

  // Stats derived from entries
  const adminCount = entries.filter(e => e.assigned_role === 'ADMIN').length;
  const staffCount = entries.filter(e => e.assigned_role === 'NGO_STAFF').length;
  const volCount = entries.filter(e => e.assigned_role === 'VOLUNTEER').length;

  return (
    <div className="p-8 space-y-8">
      {/* Page title */}
      <div className="flex items-center justify-between">
        <div>
          <div className="page-title">ACCESS CONTROL</div>
          <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mt-1">
            Pre-assign roles to Google sign-in emails. Default role for all others: DONOR.
          </p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> ADD EMAIL
        </button>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'TOTAL ALLOWLISTED', value: entries.length, icon: ShieldCheck, color: 'bg-brand-primary' },
          { label: 'ADMIN', value: adminCount, icon: Shield, color: 'bg-red-500' },
          { label: 'NGO STAFF', value: staffCount, icon: Users, color: 'bg-blue-500' },
          { label: 'VOLUNTEER', value: volCount, icon: UserCheck, color: 'bg-green-500' },
        ].map(s => (
          <div key={s.label} className="card p-5">
            <div className={`w-10 h-10 ${s.color} border-2 border-black flex items-center justify-center mb-3`}>
              <s.icon size={18} className="text-white" />
            </div>
            <p className="text-2xl font-black font-mono text-black">{s.value}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <SkeletonTable rows={5} columns={5} />
      ) : entries.length === 0 ? (
        <EmptyState
          title="NO_ENTRIES"
          description="No emails pre-assigned. All Google sign-ins become Donors by default."
          action={{ label: '+ ADD EMAIL', onClick: openAdd }}
        />
      ) : (
        <div className="border-2 border-black bg-white overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-black text-white">
                {['EMAIL', 'ROLE', 'NOTES', 'DATE ADDED', 'ACTIONS'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold tracking-widest uppercase font-mono">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entries.map(entry => (
                <tr key={entry.id} className="border-b border-black/10 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-mono font-bold text-black">{entry.email}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 text-[10px] font-black tracking-widest uppercase font-mono border-2 border-black ${ROLE_BADGE[entry.assigned_role] || 'bg-slate-200 text-black'}`}>
                      {entry.assigned_role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-slate-500 max-w-[200px] truncate">{entry.notes || '—'}</td>
                  <td className="px-4 py-3 text-xs font-mono text-slate-500 uppercase">
                    {new Date(entry.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(entry)} className="btn-secondary text-[10px] px-2 py-1 flex items-center gap-1">
                        <Pencil size={12} /> EDIT
                      </button>
                      <button onClick={() => setDeleteTarget(entry)} className="btn-danger text-[10px] px-2 py-1 flex items-center gap-1">
                        <Trash2 size={12} /> REMOVE
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); resetForm(); }} title={editing ? 'EDIT_ENTRY' : 'ADD_EMAIL'}>
        <div className="space-y-4">
          <div>
            <label className="font-mono uppercase text-xs tracking-widest block mb-1 font-bold">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={!!editing}
              className="input-field w-full disabled:opacity-50 disabled:bg-slate-100"
              placeholder="user@example.com"
            />
          </div>
          <div>
            <label className="font-mono uppercase text-xs tracking-widest block mb-1 font-bold">Assigned Role</label>
            <select value={role} onChange={e => setRole(e.target.value)} className="input-field w-full">
              <option value="">Select a role</option>
              <option value="NGO_STAFF">NGO STAFF</option>
              <option value="VOLUNTEER">VOLUNTEER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>
          <div>
            <label className="font-mono uppercase text-xs tracking-widest block mb-1 font-bold">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="input-field w-full"
              rows={3}
              placeholder="e.g., Invited by operations team"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => { setShowModal(false); resetForm(); }} className="btn-secondary flex-1">CANCEL</button>
            <button onClick={handleSubmit} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {saving && <Loader2 size={14} className="animate-spin" />}
              {editing ? 'UPDATE' : 'ADD TO ALLOWLIST'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="REMOVE_ENTRY"
        message={`Remove ${deleteTarget?.email} from the allowlist? They will default to DONOR on next sign-in.`}
        confirmLabel="REMOVE"
        variant="danger"
        loading={saving}
      />
    </div>
  );
}
