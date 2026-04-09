import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { volunteersAPI, authAPI, usersAPI } from '../../api/client';
import type { VolunteerStats } from '../../types';
import { Loader2, X, Plus, ChevronDown, ChevronUp, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const suggestedSkills = ['Teaching', 'Medical Aid', 'IT Support', 'Legal Aid', 'Fundraising', 'Photography', 'Communication', 'Translation'];
const achievements = [
  { icon: '🌱', name: 'First Step', desc: 'Complete first booking', check: (s: VolunteerStats) => s.total_bookings > 0 },
  { icon: '⏰', name: 'Time Giver', desc: 'Log 10+ hours', check: (s: VolunteerStats) => s.total_hours >= 10 },
  { icon: '🌟', name: 'Star Volunteer', desc: 'Log 50+ hours', check: (s: VolunteerStats) => s.total_hours >= 50 },
  { icon: '💯', name: 'Century Club', desc: 'Log 100+ hours', check: (s: VolunteerStats) => s.total_hours >= 100 },
  { icon: '🔥', name: 'Dedicated', desc: '5+ completed slots', check: (s: VolunteerStats) => s.confirmed_bookings >= 5 },
  { icon: '🏆', name: 'Champion', desc: '200+ hours', check: (s: VolunteerStats) => s.total_hours >= 200 },
];

export default function VolunteerProfile() {
  const { user } = useAuth();
  const [stats, setStats] = useState<VolunteerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [saving, setSaving] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [curPwd, setCurPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdSaving, setPwdSaving] = useState(false);

  useEffect(() => { load(); }, []);
  const load = async () => {
    try {
      const s = await volunteersAPI.getMyStats();
      setStats(s);
      if (user) setName(user.full_name);
      const vols = await volunteersAPI.getAll();
      const myVol = vols.find(v => v.user_id === user?.id);
      if (myVol) {
        try { const p = JSON.parse(myVol.skills); setSkills(Array.isArray(p) ? p : [String(p)]); } catch { setSkills(typeof myVol.skills === 'string' ? myVol.skills.split(',').map(x=>x.trim()) : []); }
        setBio(myVol.bio || '');
      }
    } catch { toast.error('Failed to load'); }
    setLoading(false);
  };

  const saveProfile = async () => {
    if (!name.trim()) { toast.error('Name is required'); return; }
    if (bio.length > 300) { toast.error('Bio must be 300 chars max'); return; }
    setSaving(true);
    try {
      await usersAPI.update(user!.id, { full_name: name });
      await volunteersAPI.updateMyProfile({ skills: JSON.stringify(skills), bio });
      toast.success('Profile updated!');
    } catch { toast.error('Update failed'); }
    setSaving(false);
  };

  const changePassword = async () => {
    if (newPwd !== confirmPwd) { toast.error('Passwords do not match'); return; }
    if (newPwd.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setPwdSaving(true);
    try {
      await authAPI.changePassword(curPwd, newPwd);
      toast.success('Password updated!');
      setCurPwd(''); setNewPwd(''); setConfirmPwd(''); setShowPwd(false);
    } catch (e: any) { toast.error(e.response?.data?.detail || 'Failed to update password'); }
    setPwdSaving(false);
  };

  const removeSkill = (s: string) => setSkills(skills.filter(sk => sk !== s));
  const addSkill = (s: string) => { if (s && !skills.includes(s)) setSkills([...skills, s]); setNewSkill(''); };

  if (loading) return <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>;

  const progress = stats ? Math.min(100, (stats.total_hours / stats.next_milestone) * 100) : 0;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="card p-6 flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="w-24 h-24 bg-blue-600 border-2 border-black flex items-center justify-center text-white text-4xl font-black font-mono">
          {user?.full_name?.charAt(0) || 'V'}
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-black uppercase tracking-widest text-black">{user?.full_name}</h1>
          <p className="font-mono text-slate-600 mt-1">{user?.email}</p>
          <div className="flex items-center gap-3 mt-3">
            <span className="text-xs px-2 py-1 bg-blue-100 border-2 border-black text-black font-bold font-mono">VOLUNTEER</span>
            <span className="font-mono text-xs text-slate-500 font-bold">MEMBER SINCE: {user?.created_at ? new Date(user.created_at).toLocaleDateString().toUpperCase() : 'N/A'}</span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Edit Form */}
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-xl font-black uppercase tracking-widest text-black border-b-2 border-black pb-4 mb-6">Personal Info</h3>
            <div className="space-y-5">
              <div>
                <label className="text-sm font-bold font-mono text-black uppercase block mb-2">Full Name</label>
                <input value={name} onChange={e => setName(e.target.value)} className="w-full h-12 px-4 bg-white border-2 border-black font-mono text-black focus:outline-none focus:ring-0 focus:border-blue-500 rounded-none border-shadow-sm" />
              </div>
              <div>
                <label className="text-sm font-bold font-mono text-black uppercase block mb-2">Email</label>
                <input value={user?.email} readOnly className="w-full h-12 px-4 bg-slate-100 border-2 border-black font-mono text-slate-500 cursor-not-allowed rounded-none" />
              </div>
              <div>
                <label className="text-sm font-bold font-mono text-black uppercase block mb-2">Bio <span className="text-slate-500 font-normal">({bio.length}/300)</span></label>
                <textarea value={bio} onChange={e => setBio(e.target.value.slice(0, 300))} rows={4} className="w-full px-4 py-3 bg-white border-2 border-black font-mono text-black focus:outline-none focus:ring-0 focus:border-blue-500 resize-none rounded-none border-shadow-sm" />
              </div>
            </div>
            
            <div className="mt-8">
              <label className="text-sm font-bold font-mono text-black uppercase block mb-4">My Skills</label>
              <div className="flex flex-wrap gap-2 mb-4">
                {skills.map(s => (
                  <span key={s} className="flex items-center gap-1.5 px-3 py-1 bg-blue-100 border-2 border-black text-black font-bold font-mono text-xs">
                    {s} <button onClick={() => removeSkill(s)} className="hover:text-red-500"><X className="w-3.5 h-3.5" /></button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2 mb-4">
                <input value={newSkill} onChange={e => setNewSkill(e.target.value)} onKeyDown={e => e.key === 'Enter' && addSkill(newSkill)}
                  className="flex-1 h-12 px-4 bg-white border-2 border-black font-mono text-sm focus:outline-none focus:ring-0 focus:border-blue-500 rounded-none border-shadow-sm uppercase" placeholder="ADD SKILL..." />
                <button onClick={() => addSkill(newSkill)} className="h-12 px-4 bg-blue-600 border-2 border-black text-white hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_#000] transition-all rounded-none"><Plus className="w-5 h-5" /></button>
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestedSkills.filter(s => !skills.includes(s)).map(s => (
                  <button key={s} onClick={() => addSkill(s)} className="text-xs font-mono font-bold px-2 py-1 bg-slate-100 border-2 border-black text-slate-600 hover:bg-blue-100 hover:text-black transition-colors rounded-none">{s}</button>
                ))}
              </div>
            </div>
            <button onClick={saveProfile} disabled={saving}
              className="w-full mt-8 py-3 bg-blue-600 text-white font-black font-mono uppercase tracking-widest border-2 border-black hover:bg-blue-700 hover:-translate-y-1 hover:shadow-[4px_4px_0px_#000] transition-all disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center gap-2 rounded-none">
              {saving ? <><Loader2 className="w-5 h-5 animate-spin" /> SAVING...</> : <><Save className="w-5 h-5" /> SAVE CHANGES</>}
            </button>
          </div>

          {/* Change Password */}
          <div className="card p-6">
            <button onClick={() => setShowPwd(!showPwd)} className="flex items-center justify-between w-full text-left">
              <h3 className="text-xl font-black uppercase tracking-widest text-black">Change Password</h3>
              {showPwd ? <ChevronUp className="w-6 h-6 text-black" /> : <ChevronDown className="w-6 h-6 text-black" />}
            </button>
            {showPwd && (
              <div className="mt-6 space-y-4 pt-6 border-t-2 border-black">
                <input type="password" value={curPwd} onChange={e => setCurPwd(e.target.value)} placeholder="CURRENT PASSWORD" className="w-full h-12 px-4 bg-white border-2 border-black font-mono text-sm focus:outline-none focus:ring-0 focus:border-blue-500 rounded-none placeholder-slate-400 uppercase border-shadow-sm" />
                <input type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} placeholder="NEW PASSWORD" className="w-full h-12 px-4 bg-white border-2 border-black font-mono text-sm focus:outline-none focus:ring-0 focus:border-blue-500 rounded-none placeholder-slate-400 uppercase border-shadow-sm" />
                <input type="password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} placeholder="CONFIRM NEW PASSWORD" className="w-full h-12 px-4 bg-white border-2 border-black font-mono text-sm focus:outline-none focus:ring-0 focus:border-blue-500 rounded-none placeholder-slate-400 uppercase border-shadow-sm" />
                <button onClick={changePassword} disabled={pwdSaving}
                  className="w-full py-3 bg-black text-white font-black font-mono uppercase tracking-widest border-2 border-black hover:bg-slate-800 hover:-translate-y-1 hover:shadow-[4px_4px_0px_#2563eb] transition-all disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none rounded-none mt-2">
                  {pwdSaving ? 'UPDATING...' : 'UPDATE PASSWORD'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stats & Achievements */}
        <div className="card p-6 h-fit bg-slate-50">
          <h3 className="text-xl font-black uppercase tracking-widest text-black border-b-2 border-black pb-4 mb-6">My Stats</h3>
          {stats && (
            <>
              <div className="space-y-4 mb-8">
                {[
                  ['TOTAL HOURS', `${stats.total_hours}H`],
                  ['SLOTS BOOKED', stats.total_bookings],
                  ['CONFIRMED', stats.confirmed_bookings],
                  ['IMPACT SCORE', `${stats.impact_score} PTS`],
                ].map(([l, v]) => (
                  <div key={String(l)} className="flex justify-between py-3 border-b-2 border-slate-200">
                    <span className="font-mono text-sm font-bold text-slate-600">{l}</span>
                    <span className="font-mono text-base font-black text-black">{v}</span>
                  </div>
                ))}
              </div>
              <div className="mb-8 p-5 bg-white border-2 border-black">
                <div className="flex justify-between font-mono text-sm font-bold mb-3 uppercase">
                  <span className="text-black">Milestone Progress</span>
                  <span className="text-blue-600">{stats.total_hours}H / {stats.next_milestone}H</span>
                </div>
                <div className="w-full h-4 bg-slate-100 border-2 border-black overflow-hidden relative">
                  <div className="absolute top-0 left-0 h-full bg-blue-600 border-r-2 border-black" style={{width: `${progress}%`}}></div>
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNCIgaGVpZ2h0PSI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9Im5vbmUiLz48cGF0aCBkPSJNMCAwTDQgNE00IDBMMCA0IiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4yKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9zdmc+')]"></div>
                </div>
              </div>
              <h3 className="text-xl font-black uppercase tracking-widest text-black border-b-2 border-black pb-4 mb-6 mt-8">Achievements</h3>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map(a => {
                  const unlocked = a.check(stats);
                  return (
                    <div key={a.name} className={`text-center p-4 border-2 border-black bg-white transition-all ${unlocked ? 'hover:-translate-y-1 hover:shadow-[4px_4px_0px_#000]' : 'opacity-40 grayscale'} flex flex-col items-center justify-center`}>
                      <div className="text-3xl mb-2">{a.icon}</div>
                      <p className="font-mono text-[10px] font-black uppercase tracking-wide text-black leading-tight">{a.name}</p>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
