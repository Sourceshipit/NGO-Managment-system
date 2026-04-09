import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { volunteersAPI, childrenAPI, donorsAPI, complianceAPI, employeesAPI } from '../../api/client';
import type { VolunteerSlot, ComplianceRecord, LeaveRequest } from '../../types';
import { Users, Calendar, Baby, AlertTriangle, Plus, Loader2, FileText, Heart, Megaphone, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function StaffDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [volCount, setVolCount] = useState(0);
  const [openSlots, setOpenSlots] = useState(0);
  const [childCount, setChildCount] = useState(0);
  const [alerts, setAlerts] = useState<{msg: string; link: string; color: string}[]>([]);
  const [todaySlots, setTodaySlots] = useState<VolunteerSlot[]>([]);
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [showChildModal, setShowChildModal] = useState(false);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [showAnnModal, setShowAnnModal] = useState(false);

  useEffect(() => { load(); }, []);
  const load = async () => {
    try {
      const [vols, slots, children, compliance, leaves] = await Promise.all([
        volunteersAPI.getAll(),
        volunteersAPI.getSlots(true),
        childrenAPI.getAll(),
        complianceAPI.getAll(),
        employeesAPI.getLeaves()
      ]);
      setVolCount(vols.filter(v => v.status === 'ACTIVE').length);
      const active = slots.filter(s => s.is_active);
      setOpenSlots(active.length);
      setChildCount(children.length);
      
      const today = new Date().toISOString().split('T')[0];
      setTodaySlots(slots.filter(s => s.date === today));

      const a: {msg: string; link: string; color: string}[] = [];
      compliance.forEach((c: ComplianceRecord) => {
        if (c.next_deadline) {
          const diff = Math.ceil((new Date(c.next_deadline).getTime() - Date.now()) / 86400000);
          if (diff <= 30) a.push({msg: `${c.policy_name} compliance due in ${diff} days`, link: '/staff/compliance', color: diff<=10?'red':'amber'});
        }
      });
      const pending = leaves.filter((l: LeaveRequest) => l.status === 'PENDING');
      if (pending.length > 0) a.push({msg: `${pending.length} leave request(s) pending`, link: '/staff/volunteers', color: 'amber'});
      active.forEach(s => {
        if (s.booked_count / s.max_volunteers >= 0.75) a.push({msg: `'${s.task_name}' is ${Math.round(s.booked_count/s.max_volunteers*100)}% full`, link: '/staff/volunteers', color: 'amber'});
      });
      setAlerts(a);
    } catch { toast.error('Failed to load'); }
    setLoading(false);
  };

  if (loading) return <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <h1 className="page-title text-2xl">{greeting}, {user?.full_name?.split(' ')[0]}</h1>
        <p className="text-sm font-bold uppercase tracking-widest text-slate-500 mt-2">CareConnect Foundation — Operations Dashboard</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { icon: Calendar, label: 'Post Volunteer Slot', desc: 'Add new opportunity', link: '/staff/volunteers', color: 'bg-emerald-400' },
          { icon: Baby, label: 'Add Child Record', desc: 'Register new child', link: '/staff/children', color: 'bg-emerald-500' },
          { icon: Heart, label: 'Record Donation', desc: 'Log with auto 80G', link: '/staff/donors', color: 'bg-emerald-400' },
          { icon: Megaphone, label: 'Send Announcement', desc: 'Notify volunteers', link: '/staff/announcements', color: 'bg-emerald-500' },
        ].map(a => (
          <Link key={a.label} to={a.link} className="card p-5 group hover:bg-emerald-50 transition-colors">
            <div className={`w-10 h-10 border-2 border-black ${a.color} flex items-center justify-center mb-3`}><a.icon className="w-5 h-5 text-black" /></div>
            <h3 className="font-bold text-sm text-black uppercase tracking-widest">{a.label}</h3>
            <p className="text-xs text-slate-500 mt-1 font-mono uppercase">{a.desc}</p>
            <p className="text-xs text-brand-primary mt-3 font-bold uppercase tracking-widest group-hover:underline">Open →</p>
          </Link>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Active Volunteers', value: volCount, icon: Users, bg: 'bg-white' },
          { label: 'Open Slots', value: openSlots, icon: Calendar, bg: 'bg-emerald-100' },
          { label: 'Children Enrolled', value: childCount, icon: Baby, bg: 'bg-white' },
          { label: 'Alerts', value: alerts.length, icon: AlertTriangle, bg: alerts.length > 0 ? 'bg-brand-primary' : 'bg-emerald-100' },
        ].map(s => (
          <div key={s.label} className={`card p-5 flex items-center gap-4 ${s.bg}`}>
            <div className="w-12 h-12 border-2 border-black bg-white flex items-center justify-center"><s.icon className="w-6 h-6 text-black" /></div>
            <div>
              <p className="text-3xl font-black text-black leading-none">{s.value}</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Today's Slots */}
        <div className="card p-5 bg-white">
          <h3 className="font-bold text-black uppercase tracking-widest mb-4 border-b-2 border-black pb-2">Today — {new Date().toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'numeric'}).toUpperCase()}</h3>
          {todaySlots.length === 0 ? <p className="text-xs font-bold font-mono text-slate-400 py-4 text-center uppercase">No slots scheduled today</p> : (
            <div className="space-y-3">
              {todaySlots.map(s => (
                <div key={s.id} className="flex items-center justify-between p-3 border-2 border-black bg-slate-50 hover:bg-emerald-50 transition-colors">
                  <div>
                    <p className="text-sm font-bold text-black tracking-wider uppercase">{s.task_name}</p>
                    <p className="text-xs font-mono text-slate-500 uppercase">{s.time}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold font-mono">{s.booked_count}/{s.max_volunteers}</p>
                    {s.booked_count >= s.max_volunteers ? <span className="text-[10px] border-2 border-black bg-emerald-400 text-black px-1.5 py-0.5 tracking-widest font-bold uppercase block mt-1">Full</span> : <span className="text-[10px] border-2 border-black bg-white text-black px-1.5 py-0.5 tracking-widest font-bold uppercase block mt-1">Open</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Alerts */}
        <div className="card p-5 bg-white">
          <h3 className="font-bold text-black uppercase tracking-widest mb-4 border-b-2 border-black pb-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-black" /> Attention Required</h3>
          {alerts.length === 0 ? (
            <div className="flex items-center gap-2 p-4 border-2 border-black bg-emerald-50"><CheckCircle className="w-5 h-5 text-emerald-500" /><p className="text-sm font-bold uppercase tracking-widest text-black">No issues — everything is on track</p></div>
          ) : (
            <div className="space-y-3">
              {alerts.map((a, i) => (
                <Link key={i} to={a.link} className={`flex items-center gap-3 p-3 border-2 border-black transition-colors ${
                  a.color === 'red' ? 'bg-red-50 hover:bg-red-100' : 'bg-brand-primary hover:bg-orange-400'
                }`}>
                  <AlertTriangle className={`w-4 h-4 text-black`} />
                  <span className="text-xs font-bold uppercase tracking-widest text-black flex-1">{a.msg}</span>
                  <span className="text-[10px] text-black font-bold uppercase tracking-widest px-2 py-0.5 border-2 border-black bg-white group-hover:bg-black group-hover:text-white transition-colors">Resolve →</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
