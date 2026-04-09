import { useState, useEffect } from 'react';
import { donorsAPI } from '../../api/client';
import type { Donation } from '../../types';
import { Award, Download, Loader2, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DonorCertificates() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    donorsAPI.getDonations().then(d => setDonations(d.filter(x => x.certificate_issued))).catch(() => toast.error('Failed')).finally(() => setLoading(false));
  }, []);

  const openCert = async (id: number) => {
    try { const html = await donorsAPI.getCertificate(id); const w = window.open('','_blank'); if(w){w.document.write(html as string);w.document.close();} }
    catch { toast.error('Failed'); }
  };

  if (loading) return <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-pink-500" /></div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6 border-b-4 border-black pb-4">
        <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900">80G TAX CERTIFICATES</h1>
        <p className="font-mono text-sm font-bold text-slate-600 mt-2 uppercase">{donations.length} CERTIFICATES AVAILABLE FOR DOWNLOAD</p>
      </div>

      {donations.length === 0 ? (
        <div className="card bg-slate-50 border-dashed border-4 border-slate-300 p-16 text-center">
          <Award className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <p className="font-black uppercase text-xl text-slate-500 tracking-tight">NO CERTIFICATES AVAILABLE</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {donations.map(d => (
            <div key={d.id} className="card bg-white p-5 flex flex-col h-full">
              <div className="flex items-center gap-4 mb-4 border-b-2 border-black pb-4">
                <div className="w-12 h-12 border-2 border-black bg-pink-100 flex items-center justify-center">
                  <Award className="w-6 h-6 text-pink-600" />
                </div>
                <div>
                  <h3 className="font-black uppercase tracking-tight text-slate-900">80G Certificate</h3>
                  <p className="font-mono text-xs font-bold text-slate-500">DONATION #{d.id}</p>
                </div>
              </div>
              
              <div className="space-y-3 font-mono text-sm text-slate-800 mb-6 flex-grow">
                <div className="flex justify-between items-center border-b border-black/10 pb-1">
                  <span className="font-bold">AMOUNT</span>
                  <span className="font-black">₹{d.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center border-b border-black/10 pb-1">
                  <span className="font-bold">PROJECT</span>
                  <span>{d.project}</span>
                </div>
                <div className="flex justify-between items-center border-b border-black/10 pb-1">
                  <span className="font-bold">DATE</span>
                  <span>{new Date(d.donated_at).toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'numeric'}).toUpperCase()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold">MODE</span>
                  <span>{d.payment_mode}</span>
                </div>
              </div>
              
              <button 
                onClick={() => openCert(d.id)} 
                className="w-full h-12 border-2 border-black bg-pink-500 text-white font-black uppercase tracking-wider hover:bg-pink-600 active:translate-y-1 transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" /> View Certificate
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
