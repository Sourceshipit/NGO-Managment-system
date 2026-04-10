import React, { useEffect, useState } from 'react';
import { FileText, Shield, Globe, Building2, Star, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { complianceAPI } from '../api/client';
import { ComplianceRecord } from '../types';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { DataTable } from '../components/UI/DataTable';
import { Badge, getStatusVariant } from '../components/UI/Badge';
import toast from 'react-hot-toast';

const Policies: React.FC = () => {
  const [compliance, setCompliance] = useState<ComplianceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCompliance = async () => {
      try {
        const data = await complianceAPI.getAll();
        setCompliance(data);
      } catch (error) {
        toast.error("Failed to load compliance records");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCompliance();
  }, []);

  const handleGenerateReport = async () => {
    try {
      const html = await complianceAPI.getReport();
      const w = window.open('', '_blank');
      if (w) {
        w.document.write(html);
        w.document.close();
      }
    } catch (error) {
      toast.error("Failed to generate report");
    }
  };

  const getDaysUntil = (dateStr: string | null) => {
    if (!dateStr) return 0;
    return differenceInDays(parseISO(dateStr), new Date());
  };

  const getUrgencyColor = (days: number) => {
    if (days < 0) return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300', dot: 'bg-red-500' };
    if (days <= 30) return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300', dot: 'bg-red-500' };
    if (days <= 60) return { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300', dot: 'bg-amber-500' };
    return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-transparent', dot: 'bg-green-500' };
  };

  const getPolicyIcon = (name: string) => {
    if (name.includes('FCRA')) return <Shield size={24} className="text-blue-500" />;
    if (name.includes('NITI')) return <Globe size={24} className="text-purple-500" />;
    if (name.includes('MCA')) return <Building2 size={24} className="text-brand-primary" />;
    return <Star size={24} className="text-green-500" />;
  };

  if (isLoading) return <LoadingSpinner />;

  // Sort by upcoming
  const upcoming = [...compliance].sort((a, b) => {
    if (!a.next_deadline) return 1;
    if (!b.next_deadline) return -1;
    return new Date(a.next_deadline).getTime() - new Date(b.next_deadline).getTime();
  });

  return (
    <div className="page-enter">
      <div className="flex justify-between items-end mb-6">
        <h1 className="page-title !mb-0 text-3xl font-black text-black ">Regulatory Compliance</h1>
        <button className="btn-primary flex items-center gap-2" onClick={handleGenerateReport}>
          <FileText size={18} /> GENERATE REPORT
        </button>
      </div>

      <div className="grid grid-cols-2 gap-5 mb-8">
        {compliance.map(record => {
          const days = getDaysUntil(record.next_deadline);
          const urgency = getUrgencyColor(days);
          const isUrgent = days <= 30 || record.status === 'EXPIRED';
          
          return (
            <div key={record.id} className="card border border-brand-border hover:translate-x-1 hover:-translate-y-1 hover:shadow-lg transition-all cursor-pointer">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-slate-50 border border-brand-border shadow-sm">
                    {getPolicyIcon(record.policy_name)}
                  </div>
                  <h3 className="font-semibold text-lg text-slate-800 uppercase tracking-tight">{record.policy_name}</h3>
                </div>
                <span className="text-[10px] uppercase font-semibold px-3 py-1 bg-black text-white shadow-sm ring-2 ring-brand-primary/30 border border-black tracking-widest">{record.status}</span>
              </div>
              <p className="text-xs text-slate-500 mb-4 pl-[3.25rem] font-semibold">Govt of India compliance filing</p>
              
              <div className="border-t border-brand-border my-4"></div>
              
              <div className="grid grid-cols-2 gap-y-3 text-sm mb-4 font-mono">
                <div>
                  <span className="text-slate-400 block mb-0.5 text-[10px] uppercase font-bold tracking-widest">Registration ID</span>
                  <span className="font-bold text-slate-700 bg-slate-100 p-1 border border-slate-300 inline-block">{record.registration_id || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5 text-[10px] uppercase font-bold tracking-widest">Last Filed</span>
                  <span className="font-bold text-slate-700">{record.last_filed ? format(parseISO(record.last_filed), 'dd MMM yyyy') : 'N/A'}</span>
                </div>
                <div className="col-span-2 mt-2">
                  <span className="text-slate-400 block mb-0.5 text-[10px] uppercase font-bold tracking-widest">Next Deadline</span>
                  <span className={`font-black text-slate-800 text-lg ${isUrgent ? 'text-red-600 underline decoration-4 underline-offset-4 decoration-red-500' : ''}`}>{record.next_deadline ? format(parseISO(record.next_deadline), 'dd MMM yyyy') : 'N/A'}</span>
                </div>
              </div>
              
              <div className={`mt-2 inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold tracking-wider uppercase border-2 shadow-card border-black ${isUrgent ? 'bg-[#ffcc00] text-black relative pl-8 overflow-hidden' : 'bg-green-100 text-green-800'}`}>
                {isUrgent && <div className="absolute inset-y-0 left-0 w-6 opacity-20 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#000_10px,#000_20px)] border-r border-brand-border"></div>}
                {days < 0 ? <AlertTriangle size={14} className="relative z-10" /> : days <= 60 ? <Clock size={14} className="relative z-10" /> : <CheckCircle size={14} />}
                <span className="relative z-10">{days < 0 ? `Overdue by ${Math.abs(days)} days` : `Due in ${days} days`}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card mb-8 p-6 bg-slate-50 border-black border-2 shadow-[8px_8px_0px_#000]">
        <h2 className="font-semibold text-xl text-white mb-6 bg-black inline-block px-4 py-2 border border-brand-border shadow-lg">Upcoming Deadlines</h2>
        <div className="relative border-l-4 border-black ml-4 space-y-8 pb-4">
          {upcoming.map((record, idx) => {
            const days = getDaysUntil(record.next_deadline);
            const urgency = getUrgencyColor(days);
            
            return (
              <div key={idx} className="relative pl-6 flex flex-col items-start font-mono">
                <div className={`absolute -left-[10px] w-4 h-4 border border-brand-border rounded-xl bg-white top-1 ${days <= 30 || days < 0 ? 'bg-red-500' : ''}`}></div>
                <h4 className="font-bold text-slate-800 text-lg uppercase">{record.policy_name}</h4>
                <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">
                  <span className="bg-white border border-brand-border px-2 py-0.5 shadow-xs">{record.next_deadline ? format(parseISO(record.next_deadline), 'dd MMMM yyyy') : 'No deadline'}</span>
                  <span className="mx-2 text-slate-300">|</span> 
                  <span className={days <= 30 || days < 0 ? "text-red-600 bg-red-100 border border-red-200 px-2 py-0.5" : "text-green-600 bg-green-100 border border-green-200 px-2 py-0.5"}>{days < 0 ? 'OVERDUE' : `${days} DAYS REMAINING`}</span>
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className="font-semibold text-lg text-slate-800 mb-4 border-b border-brand-border inline-block pr-6 pb-1">Regulatory Portals</h2>
        <div className="grid grid-cols-4 gap-4 font-mono">
          {[
            { icon: <Shield className="text-black" />, name: 'FCRA Online', desc: 'Ministry of Home Affairs' },
            { icon: <Globe className="text-black" />, name: 'NGO Darpan', desc: 'NITI Aayog Portal' },
            { icon: <Building2 className="text-black" />, name: 'MCA21', desc: 'Ministry of Corporate Affairs' },
            { icon: <Star className="text-black" />, name: 'Income Tax', desc: 'E-Filing Portal for 80G/12A' }
          ].map(p => (
            <div key={p.name} className="bg-white border border-brand-border hover:translate-x-1 hover:-translate-y-1 hover:shadow-lg transition-all p-4 cursor-pointer shadow-sm group relative">
              <div className="w-10 h-10 bg-brand-primary-light border border-brand-border flex items-center justify-center mb-4 shadow-xs">
                {p.icon}
              </div>
              <h4 className="font-bold text-slate-800 uppercase tracking-tight">{p.name}</h4>
              <p className="text-[10px] text-slate-500 mt-1 font-bold uppercase">{p.desc}</p>
              <div className="text-[10px] bg-black text-white font-bold px-2 py-1 uppercase tracking-wider mt-4 inline-block opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-4 right-4">
                OPEN PORTAL
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Policies;
