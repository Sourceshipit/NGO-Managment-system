import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { authAPI, usersAPI } from '../../api/client';
import { User, Shield, Loader2, Save, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';

export default function StaffProfile() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [dept, setDept] = useState(user?.department || '');
  const [saving, setSaving] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [curPwd, setCurPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdSaving, setPwdSaving] = useState(false);

  const save = async () => {
    if (!name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try { await usersAPI.update(user!.id, { full_name: name, phone, department: dept }); toast.success('Profile updated'); }
    catch { toast.error('Failed to update'); }
    setSaving(false);
  };

  const changePwd = async () => {
    if (newPwd !== confirmPwd) { toast.error('Passwords do not match'); return; }
    if (newPwd.length < 8) { toast.error('Min 8 characters'); return; }
    setPwdSaving(true);
    try { await authAPI.changePassword(curPwd, newPwd); toast.success('Password updated'); setCurPwd(''); setNewPwd(''); setConfirmPwd(''); setShowPwd(false); }
    catch (e: any) { toast.error(e.response?.data?.detail || 'Failed'); }
    setPwdSaving(false);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="mb-2">
        <h1 className="page-title text-brand-dark">Staff Profile</h1>
      </div>

      <div className="card bg-white p-6 flex flex-col sm:flex-row items-center gap-6">
        <div className="w-24 h-24 rounded-full bg-brand-light flex items-center justify-center text-brand-primary text-4xl font-bold shadow-inner border border-brand-border/40">
          {user?.full_name?.charAt(0) || 'S'}
        </div>
        <div className="text-center sm:text-left">
          <h2 className="text-2xl font-bold text-brand-dark mb-1">{user?.full_name}</h2>
          <p className="text-brand-dark/60 mb-3">{user?.email}</p>
          <span className="px-3.5 py-1.5 bg-emerald-50 text-emerald-700 rounded-full font-bold uppercase text-[10px] tracking-wider border border-emerald-200/50">
            NGO STAFF
          </span>
        </div>
      </div>

      <div className="card bg-white p-6">
        <h3 className="text-lg font-bold text-brand-dark mb-6 border-b border-brand-border/50 pb-4">Personal Information</h3>
        <div className="space-y-5">
          <div>
            <label className="text-xs font-bold text-brand-dark/60 uppercase mb-1 block">Full Name</label>
            <input value={name} onChange={e => setName(e.target.value)} className="input-field" placeholder="Your full name" />
          </div>
          <div>
            <label className="text-xs font-bold text-brand-dark/60 uppercase mb-1 block">Email</label>
            <input value={user?.email} readOnly className="input-field bg-slate-50 text-brand-dark/50 cursor-not-allowed" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-bold text-brand-dark/60 uppercase mb-1 block">Phone</label>
              <input value={phone} onChange={e => setPhone(e.target.value)} className="input-field" placeholder="9876543210" />
            </div>
            <div>
              <label className="text-xs font-bold text-brand-dark/60 uppercase mb-1 block">Department</label>
              <input value={dept} onChange={e => setDept(e.target.value)} className="input-field" placeholder="Operations" />
            </div>
          </div>
          <button onClick={save} disabled={saving} className="btn-primary w-full mt-2 shadow-sm flex items-center justify-center gap-2">
            {saving ? <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Changes</>}
          </button>
        </div>
      </div>

      <div className="card bg-white p-6">
        <button onClick={() => setShowPwd(!showPwd)} className="flex items-center justify-between w-full text-left group">
          <h3 className="text-lg font-bold text-brand-dark group-hover:text-brand-primary transition-colors">Change Password</h3>
          <div className="p-1.5 rounded-full bg-slate-50 text-brand-dark/50 group-hover:bg-brand-light group-hover:text-brand-primary transition-colors">
            {showPwd ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </button>
        {showPwd && (
          <div className="mt-6 space-y-4 pt-4 border-t border-brand-border/30">
            <div>
              <label className="text-xs font-bold text-brand-dark/60 uppercase mb-1 block">Current Password</label>
              <input type="password" value={curPwd} onChange={e => setCurPwd(e.target.value)} className="input-field" placeholder="Enter current password" />
            </div>
            <div>
              <label className="text-xs font-bold text-brand-dark/60 uppercase mb-1 block">New Password</label>
              <input type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} className="input-field" placeholder="Enter new password" />
            </div>
            <div>
              <label className="text-xs font-bold text-brand-dark/60 uppercase mb-1 block">Confirm New Password</label>
              <input type="password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} className="input-field" placeholder="Confirm new password" />
            </div>
            <button onClick={changePwd} disabled={pwdSaving} className="btn-secondary w-full mt-2 justify-center font-semibold text-brand-dark">
              {pwdSaving ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
