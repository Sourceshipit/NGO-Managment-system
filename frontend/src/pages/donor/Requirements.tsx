import { useEffect, useState } from 'react';
import { Target, Flag, Package, Box, MapPin, CheckCircle2, X } from 'lucide-react';
import { api } from '../../api/client';
import toast from 'react-hot-toast';

interface Requirement {
  id: number;
  title: string;
  category: string;
  urgency: string;
  description: string;
  quantity_needed: number;
  quantity_fulfilled: number;
}

export default function NgoRequirements() {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [pledgeReq, setPledgeReq] = useState<Requirement | null>(null);
  const [pledgeQuantity, setPledgeQuantity] = useState(1);
  const [pledging, setPledging] = useState(false);

  useEffect(() => {
    const fetchRequirements = async () => {
      try {
        const response = await api.get('/requirements');
        setRequirements(response.data);
      } catch (error) {
        console.error('Error fetching requirements:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRequirements();
  }, []);

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'HIGH': return 'bg-red-600 text-white border-red-700 shadow-sm shadow-red-200';
      case 'MEDIUM': return 'bg-amber-500 text-white border-amber-600';
      case 'LOW': return 'bg-emerald-500 text-white border-emerald-600';
      default: return 'bg-slate-300 text-slate-800 border-slate-400';
    }
  };

  const getUrgencyText = (urgency: string) => {
    return urgency.charAt(0) + urgency.slice(1).toLowerCase() + ' Priority';
  };

  const handlePledge = async () => {
    if (!pledgeReq || pledgeQuantity <= 0) return;
    setPledging(true);
    try {
      await api.post(`/requirements/${pledgeReq.id}/pledge`, { quantity: pledgeQuantity });
      toast.success('Pledge successful! Thank you for your support.');
      setPledgeReq(null);
      
      // refresh
      const response = await api.get('/requirements');
      setRequirements(response.data);
    } catch (e: any) {
      toast.error(e.response?.data?.detail || 'Failed to pledge. Try again later.');
    } finally {
      setPledging(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header section with Editorial Brutalist inspiration */}
      <div className="border-b-4 border-brand-text pb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-brand-text uppercase">Mission Dockets</h1>
            <p className="mt-2 text-lg text-brand-muted max-w-2xl font-medium">
              Directly impact our active missions. Every contribution shown below goes straight into fulfilling an immediate on-the-ground need.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-brand-text text-white font-bold tracking-wider text-sm">
            <Target size={18} />
            <span>ACTIVE OPS</span>
          </div>
        </div>
      </div>

      {requirements.length === 0 ? (
        <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-12 text-center">
          <CheckCircle2 size={48} className="mx-auto text-emerald-500 mb-4" />
          <h3 className="text-xl font-bold text-brand-text mb-2">No Open Requirements</h3>
          <p className="text-brand-muted">Our needs are currently fulfilled. Check back later!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {requirements.map((req) => {
            const progress = Math.min(100, Math.round((req.quantity_fulfilled / req.quantity_needed) * 100));
            const isFullyFunded = progress >= 100;

            return (
              <div 
                key={req.id} 
                className="group relative flex flex-col bg-white border-2 border-brand-text rounded-none overflow-hidden hover:shadow-[8px_8px_0px_0px_rgba(225,29,72,1)] transition-all duration-300 hover:-translate-y-1 hover:-translate-x-1"
              >
                {/* Perforation line detail */}
                <div className="absolute left-4 top-0 bottom-0 w-px border-l-2 border-dashed border-slate-200" />
                
                <div className="p-6 pl-10 flex flex-col h-full z-10 bg-white">
                  {/* Top Bar */}
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-brand-muted bg-slate-100 px-2 py-1">
                      {req.category}
                    </span>
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 border ${getUrgencyColor(req.urgency)}`}>
                      {getUrgencyText(req.urgency)}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-brand-text leading-tight mb-3">
                    {req.title}
                  </h3>
                  
                  <p className="text-sm text-slate-600 mb-6 flex-grow">
                    {req.description}
                  </p>

                  <div className="space-y-4">
                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between text-xs font-bold text-brand-text mb-1 uppercase tracking-wide">
                        <span>Fulfilled</span>
                        <span>{req.quantity_fulfilled} / {req.quantity_needed}</span>
                      </div>
                      <div className="h-3 w-full bg-slate-100 border border-slate-200 overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000 ${isFullyFunded ? 'bg-emerald-500' : 'bg-brand-text'}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    <button 
                      onClick={() => { setPledgeReq(req); setPledgeQuantity(1); }}
                      disabled={isFullyFunded}
                      className={`w-full py-3 px-4 font-bold uppercase tracking-wider text-sm transition-all border-2
                        ${isFullyFunded 
                          ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' 
                          : 'bg-rose-600 text-white border-rose-600 hover:bg-rose-700 hover:border-rose-700 active:scale-[0.98]'
                        }
                      `}
                    >
                      {isFullyFunded ? 'Mission Complete' : 'Pledge Support'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pledge Modal */}
      {pledgeReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={() => !pledging && setPledgeReq(null)}>
          <div className="bg-white p-8 w-full max-w-sm border-4 border-brand-text shadow-[12px_12px_0px_0px_rgba(225,29,72,1)]" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6 border-b-2 border-brand-text pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 mb-1 block">Operation Support</span>
                <h3 className="text-2xl font-extrabold text-brand-text leading-tight">{pledgeReq.title}</h3>
              </div>
              <button onClick={() => !pledging && setPledgeReq(null)} className="hover:text-rose-600 transition-colors bg-slate-100 p-1"><X size={20} /></button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Pledge Quantity</label>
                <div className="flex items-center gap-4">
                  <button onClick={() => setPledgeQuantity(q => Math.max(1, q - 1))} className="w-10 h-10 flex items-center justify-center bg-slate-100 font-bold hover:bg-slate-200">-</button>
                  <input 
                    type="number" 
                    value={pledgeQuantity} 
                    onChange={e => setPledgeQuantity(Math.min(pledgeReq.quantity_needed - pledgeReq.quantity_fulfilled, Math.max(1, parseInt(e.target.value) || 1)))} 
                    className="flex-1 text-center font-bold text-xl py-2 border-2 border-slate-200 outline-none focus:border-rose-600"
                    min={1}
                    max={pledgeReq.quantity_needed - pledgeReq.quantity_fulfilled}
                  />
                  <button onClick={() => setPledgeQuantity(q => Math.min(pledgeReq.quantity_needed - pledgeReq.quantity_fulfilled, q + 1))} className="w-10 h-10 flex items-center justify-center bg-slate-100 font-bold hover:bg-slate-200">+</button>
                </div>
                <p className="text-xs font-semibold text-slate-400 mt-2 text-center uppercase">
                  Remaining Items Needed: {pledgeReq.quantity_needed - pledgeReq.quantity_fulfilled}
                </p>
              </div>
              
              <button 
                onClick={handlePledge}
                disabled={pledging}
                className="w-full py-4 text-sm font-bold uppercase tracking-widest bg-emerald-500 hover:bg-emerald-600 text-white transition-colors border-2 border-emerald-600 active:translate-y-1 mt-2 disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {pledging ? 'Confirming...' : 'Confirm Pledge'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
