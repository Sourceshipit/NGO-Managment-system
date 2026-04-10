import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { authAPI, usersAPI } from '../../api/client';
import { Save, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DonorProfile() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [curPwd, setCurPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdSaving, setPwdSaving] = useState(false);

  const save = async () => {
    if (!name.trim()) { toast.error('Name required'); return; }
    setSaving(true);
    try { await usersAPI.update(user!.id, {full_name:name,phone}); toast.success('Profile updated'); }
    catch { toast.error('Failed'); }
    setSaving(false);
  };

  const changePwd = async () => {
    if (newPwd !== confirmPwd) { toast.error('Mismatch'); return; }
    if (newPwd.length < 8) { toast.error('Min 8 chars'); return; }
    setPwdSaving(true);
    try { await authAPI.changePassword(curPwd, newPwd); toast.success('Password updated'); setCurPwd(''); setNewPwd(''); setConfirmPwd(''); setShowPwd(false); }
    catch (e: any) { toast.error(e.response?.data?.detail || 'Failed'); }
    setPwdSaving(false);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="mb-2">
        <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900 border-b-4 border-black pb-4">Donor Profile</h1>
      </div>

      <div className="card bg-white p-6 flex items-center gap-6">
        <div className="w-24 h-24 border border-brand-border rounded-xl bg-pink-500 flex items-center justify-center text-white text-4xl font-black uppercase shadow-[4px_4px_0px_rgba(0,0,0,1)]">
          {user?.full_name?.charAt(0)||'D'}
        </div>
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900 mb-1">{user?.full_name}</h2>
          <p className="font-mono text-slate-600 mb-3">{user?.email}</p>
          <span className="px-3 py-1 bg-pink-100 text-pink-700 border border-brand-border font-black uppercase text-xs tracking-wider shadow-sm">
            DONOR
          </span>
        </div>
      </div>

      <div className="card bg-white p-6">
        <h3 className="font-black uppercase tracking-tight text-slate-900 mb-6 border-b border-brand-border pb-2">Personal Information</h3>
        <div className="space-y-5">
          <div>
            <label className="font-mono text-sm font-bold text-slate-800 mb-2 block uppercase">Full Name</label>
            <input 
              value={name} 
              onChange={e=>setName(e.target.value)} 
              className="w-full h-12 px-4 bg-white border border-brand-border font-mono text-sm focus:outline-none focus:ring-0 focus:border-pink-500 transition-colors placeholder:text-slate-400" 
            />
          </div>
          <div>
            <label className="font-mono text-sm font-bold text-slate-800 mb-2 block uppercase">Email</label>
            <input 
              value={user?.email} 
              readOnly 
              className="w-full h-12 px-4 bg-slate-100 border border-brand-border font-mono text-sm text-slate-500 cursor-not-allowed" 
            />
          </div>
          <div>
            <label className="font-mono text-sm font-bold text-slate-800 mb-2 block uppercase">Phone</label>
            <input 
              value={phone} 
              onChange={e=>setPhone(e.target.value)} 
              className="w-full h-12 px-4 bg-white border border-brand-border font-mono text-sm focus:outline-none focus:ring-0 focus:border-pink-500 transition-colors placeholder:text-slate-400" 
              placeholder="9876543210" 
            />
          </div>
          
          <button 
            onClick={save} 
            disabled={saving} 
            className="w-full h-12 mt-2 bg-pink-500 text-white border border-brand-border font-black uppercase tracking-wider hover:bg-pink-600 active:translate-y-1 transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-[4px_4px_0px_rgba(0,0,0,1)] active:shadow-none"
          >
            {saving ? <><Loader2 className="w-5 h-5 animate-spin"/> SAVING...</> : <><Save className="w-5 h-5"/> SAVE CHANGES</>}
          </button>
        </div>
      </div>

      <div className="card bg-white p-6">
        <button 
          onClick={()=>setShowPwd(!showPwd)} 
          className="flex items-center justify-between w-full text-left"
        >
          <h3 className="font-black uppercase tracking-tight text-slate-900 border-b-2 border-transparent hover:border-black transition-colors">Change Password</h3>
          <div className="w-8 h-8 border border-brand-border flex items-center justify-center bg-slate-50">
            {showPwd ? <ChevronUp className="w-5 h-5"/> : <ChevronDown className="w-5 h-5"/>}
          </div>
        </button>
        
        {showPwd && (
          <div className="mt-6 space-y-4 pt-4 border-t border-brand-border">
            <div>
              <label className="font-mono text-sm font-bold text-slate-800 mb-2 block uppercase">Current Password</label>
              <input 
                type="password" 
                value={curPwd} 
                onChange={e=>setCurPwd(e.target.value)} 
                className="w-full h-12 px-4 bg-white border border-brand-border font-mono text-sm focus:outline-none focus:border-pink-500 transition-colors placeholder:text-slate-300"
              />
            </div>
            <div>
              <label className="font-mono text-sm font-bold text-slate-800 mb-2 block uppercase">New Password</label>
              <input 
                type="password" 
                value={newPwd} 
                onChange={e=>setNewPwd(e.target.value)} 
                className="w-full h-12 px-4 bg-white border border-brand-border font-mono text-sm focus:outline-none focus:border-pink-500 transition-colors placeholder:text-slate-300"
              />
            </div>
            <div>
              <label className="font-mono text-sm font-bold text-slate-800 mb-2 block uppercase">Confirm Password</label>
              <input 
                type="password" 
                value={confirmPwd} 
                onChange={e=>setConfirmPwd(e.target.value)} 
                className="w-full h-12 px-4 bg-white border border-brand-border font-mono text-sm focus:outline-none focus:border-pink-500 transition-colors placeholder:text-slate-300"
              />
            </div>
            
            <button 
              onClick={changePwd} 
              disabled={pwdSaving} 
              className="w-full h-12 mt-2 bg-slate-900 text-white border border-brand-border font-black uppercase tracking-wider hover:bg-slate-800 active:translate-y-1 transition-all flex items-center justify-center shadow-[4px_4px_0px_rgba(244,114,182,1)] active:shadow-none"
            >
              {pwdSaving ? 'UPDATING...' : 'UPDATE PASSWORD'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
