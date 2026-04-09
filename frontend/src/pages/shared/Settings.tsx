import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { authAPI, usersAPI } from '../../api/client';
import { User, Bell, Palette, Info, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<'account'|'notifications'|'appearance'|'about'>('account');
  const [name, setName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);
  const [curPwd, setCurPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [theme, setTheme] = useState('light');
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);

  const saveProfile = async () => {
    setSaving(true);
    try { await usersAPI.update(user!.id, {full_name:name,phone}); toast.success('Settings saved'); }
    catch { toast.error('Failed'); }
    setSaving(false);
  };

  const changePwd = async () => {
    if (newPwd.length < 8) { toast.error('Min 8 chars'); return; }
    try { await authAPI.changePassword(curPwd, newPwd); toast.success('Password updated'); setCurPwd(''); setNewPwd(''); }
    catch (e: any) { toast.error(e.response?.data?.detail || 'Failed'); }
  };

  const tabs = [
    {key:'account',label:'Account',icon:User},
    {key:'notifications',label:'Notifications',icon:Bell},
    {key:'appearance',label:'Appearance',icon:Palette},
    {key:'about',label:'About',icon:Info},
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Settings</h1>
      <div className="flex gap-6">
        <div className="w-48 space-y-1">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key as any)}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2.5 transition ${tab===t.key?'bg-orange-50 text-orange-600':'text-slate-500 hover:bg-slate-50'}`}>
              <t.icon className="w-4 h-4" />{t.label}
            </button>
          ))}
        </div>
        <div className="flex-1 bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          {tab === 'account' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-slate-800 mb-4">Profile</h3>
                <div className="space-y-3">
                  <div><label className="text-sm font-medium text-slate-600 mb-1 block">Full Name</label><input value={name} onChange={e=>setName(e.target.value)} className="w-full h-10 px-3 bg-slate-50 border rounded-lg text-sm" /></div>
                  <div><label className="text-sm font-medium text-slate-600 mb-1 block">Email</label><input value={user?.email} readOnly className="w-full h-10 px-3 bg-slate-100 border rounded-lg text-sm text-slate-500 cursor-not-allowed" /></div>
                  <div><label className="text-sm font-medium text-slate-600 mb-1 block">Phone</label><input value={phone} onChange={e=>setPhone(e.target.value)} className="w-full h-10 px-3 bg-slate-50 border rounded-lg text-sm" /></div>
                  <button onClick={saveProfile} disabled={saving} className="px-6 py-2.5 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 disabled:opacity-60 flex items-center gap-2">
                    {saving?<Loader2 className="w-4 h-4 animate-spin"/>:null} Save
                  </button>
                </div>
              </div>
              <hr />
              <div>
                <h3 className="font-semibold text-slate-800 mb-4">Change Password</h3>
                <div className="space-y-3">
                  <input type="password" value={curPwd} onChange={e=>setCurPwd(e.target.value)} placeholder="Current Password" className="w-full h-10 px-3 bg-slate-50 border rounded-lg text-sm" />
                  <input type="password" value={newPwd} onChange={e=>setNewPwd(e.target.value)} placeholder="New Password (min 8 chars)" className="w-full h-10 px-3 bg-slate-50 border rounded-lg text-sm" />
                  <button onClick={changePwd} className="px-6 py-2.5 bg-slate-800 text-white rounded-lg font-semibold hover:bg-slate-700">Update Password</button>
                </div>
              </div>
            </div>
          )}

          {tab === 'notifications' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-800 mb-4">Notification Preferences</h3>
              {[
                {label:'Email Notifications',desc:'Receive updates via email',value:emailNotifs,set:setEmailNotifs},
                {label:'Push Notifications',desc:'Browser push notifications',value:pushNotifs,set:setPushNotifs},
              ].map(n => (
                <div key={n.label} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div><p className="text-sm font-medium text-slate-800">{n.label}</p><p className="text-xs text-slate-500">{n.desc}</p></div>
                  <button onClick={() => n.set(!n.value)} className={`w-12 h-6 rounded-full transition-colors ${n.value?'bg-orange-500':'bg-slate-300'}`}>
                    <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${n.value?'translate-x-6':'translate-x-0.5'}`}></div>
                  </button>
                </div>
              ))}
              <button onClick={() => toast.success('Preferences saved')} className="px-6 py-2.5 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600">Save Preferences</button>
            </div>
          )}

          {tab === 'appearance' && (
            <div>
              <h3 className="font-semibold text-slate-800 mb-4">Theme</h3>
              <div className="grid grid-cols-3 gap-4">
                {[
                  {key:'light',label:'Light',bg:'bg-white',border:'border-slate-200'},
                  {key:'dark',label:'Dark',bg:'bg-slate-900',border:'border-slate-700'},
                  {key:'auto',label:'System',bg:'bg-gradient-to-r from-white to-slate-900',border:'border-slate-300'},
                ].map(t => (
                  <button key={t.key} onClick={()=>setTheme(t.key)} className={`p-4 rounded-xl border-2 text-center transition ${theme===t.key?'border-orange-500':'border-slate-200 hover:border-orange-300'}`}>
                    <div className={`w-full h-12 ${t.bg} ${t.border} border rounded-lg mb-2`}></div>
                    <p className="text-sm font-medium text-slate-700">{t.label}</p>
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-3">Theme preferences are saved locally.</p>
            </div>
          )}

          {tab === 'about' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center"><Info className="w-6 h-6 text-white" /></div>
                <div><h2 className="text-xl font-bold text-slate-800">Clarion v2.0</h2><p className="text-sm text-slate-500">NGO Transparency & Management Platform</p></div>
              </div>
              <div className="space-y-2 text-sm text-slate-600">
                <p><strong>Organization:</strong> CareConnect Foundation</p>
                <p><strong>Tagline:</strong> Transparency for Those Who Serve</p>
                <p><strong>Stack:</strong> FastAPI + React + SQLite + Blockchain Audit</p>
                <p><strong>Role:</strong> {user?.role}</p>
              </div>
              <div className="mt-6 p-4 bg-orange-50 rounded-xl border border-orange-200">
                <p className="text-sm text-orange-700">Built with ❤️ for CareConnect Foundation. All donations are tracked with blockchain-secured audit trails for full transparency and accountability.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
