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
  const [error, setError] = useState<string | null>(null);
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [showChildModal, setShowChildModal] = useState(false);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [showAnnModal, setShowAnnModal] = useState(false);

  useEffect(() => { load(); }, []);
  const load = async () => {
    setLoading(true);
    setError(null);
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
    } catch (e: any) {
      setError(e.response?.data?.detail || e.message || 'Failed to load dashboard data');
      toast.error('Failed to load dashboard'); 
    }
    setLoading(false);
  };

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="w-8 h-8 animate-spin text-brand-primary" /></div>;
  if (error) return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 flex flex-col items-center justify-center min-h-[40vh]">
      <div className="card shadow-sm border-red-200 bg-red-50/50 p-8 max-w-lg text-center backdrop-blur-sm rounded-2xl">
        <h2 className="text-xl font-semibold text-red-800 mb-2">Dashboard Unavailable</h2>
        <p className="text-red-600/80 mb-6">{error}</p>
        <button onClick={load} className="btn-primary">Try Again</button>
      </div>
    </div>
  );

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div className="flex items-center gap-4 bg-white/50 p-6 rounded-2xl border border-brand-border/30 shadow-sm backdrop-blur-md">
        <div>
           <h1 className="page-title text-2xl text-brand-dark">{greeting}, {user?.full_name?.split(' ')[0]}</h1>
           <p className="text-sm font-semibold text-brand-dark/60 mt-1">CareConnect Foundation — Operations Dashboard</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {[
          { icon: Calendar, label: 'Post Volunteer Slot', desc: 'Add new opportunity', link: '/staff/volunteers', color: 'from-blue-400 to-brand-primary' },
          { icon: Baby, label: 'Add Child Record', desc: 'Register new child', link: '/staff/children', color: 'from-emerald-400 to-emerald-500' },
          { icon: Heart, label: 'Record Donation', desc: 'Log with auto 80G', link: '/staff/donors', color: 'from-pink-400 to-pink-500' },
          { icon: Megaphone, label: 'Send Announcement', desc: 'Notify volunteers', link: '/staff/announcements', color: 'from-amber-400 to-orange-400' },
        ].map(a => (
          <Link key={a.label} to={a.link} className="card p-6 group hover:-translate-y-1 hover:shadow-md transition-all duration-300 border-transparent hover:border-brand-primary/20 bg-white/80 backdrop-blur-sm cursor-pointer">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${a.color} shadow-sm flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}><a.icon className="w-6 h-6 text-white" /></div>
            <h3 className="font-bold text-base text-brand-dark">{a.label}</h3>
            <p className="text-xs text-brand-dark/60 mt-1.5 font-medium">{a.desc}</p>
            <p className="text-xs text-brand-primary mt-4 font-bold flex items-center gap-1 group-hover:gap-2 transition-all">Open <span>&rarr;</span></p>
          </Link>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: 'Active Volunteers', value: volCount, icon: Users, color: 'text-brand-primary', bg: 'bg-brand-primary/10' },
          { label: 'Open Slots', value: openSlots, icon: Calendar, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Children Enrolled', value: childCount, icon: Baby, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Alerts', value: alerts.length, icon: AlertTriangle, color: alerts.length > 0 ? 'text-red-500' : 'text-slate-400', bg: alerts.length > 0 ? 'bg-red-500/10' : 'bg-slate-100' },
        ].map(s => (
          <div key={s.label} className="card p-6 flex flex-col items-center justify-center text-center bg-white/80 backdrop-blur-sm border-transparent hover:shadow-sm transition-shadow">
            <div className={`w-12 h-12 rounded-full ${s.bg} flex items-center justify-center mb-3`}><s.icon className={`w-6 h-6 ${s.color}`} /></div>
            <p className="text-4xl font-extrabold text-brand-dark leading-none Drop-shadow-sm">{s.value}</p>
            <p className="text-xs font-semibold text-brand-dark/60 uppercase tracking-widest mt-2">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {/* Today's Slots */}
        <div className="card p-6 bg-white/80 backdrop-blur-sm border-transparent flex flex-col">
          <h3 className="text-lg font-bold text-brand-dark mb-4 border-b border-brand-border/50 pb-3 flex justify-between items-center">
            Today's Schedule <span className="text-sm font-semibold text-brand-primary bg-brand-primary/10 px-3 py-1 rounded-full">{new Date().toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'numeric'})}</span>
          </h3>
          {todaySlots.length === 0 ? <div className="flex-1 flex items-center justify-center"><p className="text-sm font-medium text-brand-dark/50 py-8 text-center bg-brand-border/10 rounded-xl w-full border border-dashed border-brand-border/30">No assignments scheduled for today</p></div> : (
            <div className="space-y-3 flex-1">
              {todaySlots.map(s => (
                <div key={s.id} className="flex items-center justify-between p-4 rounded-xl border border-brand-border/50 bg-white hover:border-brand-primary/30 hover:shadow-sm transition-all duration-300">
                  <div>
                    <p className="text-sm font-bold text-brand-dark">{s.task_name}</p>
                    <p className="text-xs font-semibold text-brand-dark/60 mt-1 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{s.time}</p>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <p className="text-sm font-bold text-brand-dark">{s.booked_count} / {s.max_volunteers}</p>
                    {s.booked_count >= s.max_volunteers ? 
                       <span className="text-[10px] bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider mt-1.5">Full</span> : 
                       <span className="text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider mt-1.5">Open</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Alerts */}
        <div className="card p-6 bg-white/80 backdrop-blur-sm border-transparent flex flex-col">
          <h3 className="text-lg font-bold text-brand-dark mb-4 border-b border-brand-border/50 pb-3 flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-amber-500" /> Attention Required</h3>
          {alerts.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
               <div className="flex flex-col items-center gap-3 p-6 rounded-xl border border-emerald-100 bg-emerald-50/50 w-full text-center">
                  <CheckCircle className="w-8 h-8 text-emerald-500" />
                  <p className="text-sm font-semibold text-emerald-800">No pending issues — everything is on track.</p>
               </div>
            </div>
          ) : (
            <div className="space-y-3 flex-1 overflow-y-auto max-h-[400px] pr-1 custom-scrollbar">
              {alerts.map((a, i) => (
                <Link key={i} to={a.link} className={`flex items-start md:items-center gap-3 p-4 rounded-xl border transition-all duration-300 hover:-translate-y-0.5 ${
                  a.color === 'red' ? 'bg-red-50/50 border-red-200 hover:shadow-md hover:border-red-300' : 'bg-amber-50/50 border-amber-200 hover:shadow-md hover:border-amber-300'
                }`}>
                  <div className={`p-2 rounded-full mt-0.5 md:mt-0 ${a.color === 'red' ? 'bg-red-100 text-red-500' : 'bg-amber-100 text-amber-500'}`}>
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <span className={`text-sm font-semibold flex-1 ${a.color === 'red' ? 'text-red-900' : 'text-amber-900'}`}>{a.msg}</span>
                  <span className={`hidden md:block text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                     a.color === 'red' ? 'bg-red-100 text-red-700 hover:bg-red-500 hover:text-white' : 'bg-amber-100 text-amber-700 hover:bg-amber-500 hover:text-white'
                  }`}>Resolve</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
