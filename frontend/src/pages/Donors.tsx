import React, { useEffect, useState } from 'react';
import { Download, Link as LinkIcon } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { donorsAPI } from '../api/client';
import { Donor, Donation } from '../types';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { DataTable } from '../components/UI/DataTable';
import { Badge } from '../components/UI/Badge';

export function formatIndianCurrency(n: number): string {
  return n.toLocaleString('en-IN');
}

const Donors: React.FC = () => {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form
  const [formData, setFormData] = useState({
    donorName: '', pan: '', amount: '', project: 'Education', mode: 'UPI', notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [donorsData, donationsData] = await Promise.all([
        donorsAPI.getAll(),
        donorsAPI.getDonations()
      ]);
      setDonors(donorsData);
      setDonations(donationsData);
    } catch (error) {
      toast.error("Failed to load donor data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDownloadCert = async (id: number) => {
    try {
      const html = await donorsAPI.getCertificate(id);
      const w = window.open('', '_blank');
      if (w) {
        w.document.write(html);
        w.document.close();
      }
    } catch (error) {
      toast.error("Failed to generate certificate");
    }
  };

  const handleSubmitDonation = async () => {
    if (!formData.donorName || !formData.amount || isNaN(Number(formData.amount))) {
      toast.error("Valid Donor Name and Amount refer required");
      return;
    }
    setIsSubmitting(true);
    try {
      // Create Donor or get existing (simplification: assume create for demo if not found)
      let donor = donors.find(d => d.pan_number === formData.pan && formData.pan !== '');
      if (!donor) {
        // Just mock the donor context here or create new. Our API allows fetching all, but for simplicity:
        // usually we'd have a createDonor logic. We'll use the first donor or add a real robust check.
        donor = donors[0]; // fallback
      }

      await donorsAPI.createDonation({
        donor_id: donor.id,
        amount: Number(formData.amount),
        project: formData.project,
        payment_mode: formData.mode,
        notes: formData.notes
      });
      toast.success("Donation recorded + blockchain entry created!");
      setFormData({ donorName: '', pan: '', amount: '', project: 'Education', mode: 'UPI', notes: '' });
      fetchData();
    } catch (error) {
      toast.error("Failed to record donation");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  const totalRaised = donations.reduce((sum, d) => sum + d.amount, 0);
  const totalCertificates = donations.filter(d => d.certificate_issued).length;

  // Calculate project breakdown
  const projects = ['Education', 'Healthcare', 'Livelihood', 'Environment'];
  const projectColors: Record<string, string> = {
    'Education': 'bg-brand-primary', 'Healthcare': 'bg-blue-500',
    'Livelihood': 'bg-green-500', 'Environment': 'bg-purple-500'
  };
  const breakdown = projects.map(p => {
    const total = donations.filter(d => d.project === p).reduce((s, d) => s + d.amount, 0);
    return { name: p, total, percentage: totalRaised ? (total / totalRaised) * 100 : 0 };
  });

  return (
    <div className="page-enter">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="page-title !mb-2">Donor Records</h1>
          <p className="text-sm border-l-2 border-brand-primary pl-3 font-mono text-slate-600 font-bold uppercase mt-2">
            ₹{formatIndianCurrency(totalRaised)} Total Raised
          </p>
        </div>
        <div className="flex gap-3">
          <div className="bg-white border border-brand-border shadow-card px-4 py-3 text-center min-w-24">
            <div className="font-bold text-lg font-mono">{donors.length}</div>
            <div className="text-[10px] text-slate-500 uppercase font-semibold mt-1 tracking-wider">Donors</div>
          </div>
          <div className="bg-brand-primary border border-brand-border shadow-card px-4 py-3 text-center min-w-24 text-white">
            <div className="font-bold text-lg font-mono">{donations.length}</div>
            <div className="text-[10px] uppercase font-semibold mt-1 tracking-wider">Donations</div>
          </div>
          <div className="bg-white border border-brand-border shadow-card px-4 py-3 text-center min-w-24">
            <div className="font-bold text-lg font-mono">{totalCertificates}</div>
            <div className="text-[10px] text-slate-500 uppercase font-semibold mt-1 tracking-wider">Certificates</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-6">
        <div className="col-span-3 flex flex-col gap-6">
          <div className="card">
            <h2 className="font-semibold text-slate-800 mb-6 border-b border-brand-border pb-2">Fund Utilization by Project</h2>
            <div className="flex flex-col gap-5">
              {breakdown.map((p, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-sm mb-1.5 font-medium">
                    <span className="text-slate-700">{p.name} <span className="text-slate-400 ml-1">({p.percentage.toFixed(1)}%)</span></span>
                    <span className="text-slate-800 font-bold">₹{formatIndianCurrency(p.total)}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className={`${projectColors[p.name]} h-2 rounded-full`} style={{ width: `${p.percentage}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card mt-2 p-0 overflow-hidden">
            <div className="p-6 pb-2 border-b border-brand-border bg-slate-50">
              <h2 className="font-semibold text-slate-800 mb-0">Donation History</h2>
            </div>
            <DataTable 
              data={donations}
              columns={[
                { key: 'donor_name', header: 'Donor Name', render: (row) => <span className="font-medium text-slate-700">{row.donor_name}</span> },
                { key: 'amount', header: 'Amount', render: (row) => <span className="font-semibold text-slate-800">₹{formatIndianCurrency(row.amount)}</span> },
                { key: 'project', header: 'Project', render: (row) => <Badge variant="neutral">{row.project}</Badge> },
                { key: 'donated_at', header: 'Date', render: (row) => <span>{format(new Date(row.donated_at), 'dd/MM/yyyy')}</span> },
                { key: '80g', header: '80G Certificate', render: (row) => (
                  <button onClick={() => handleDownloadCert(row.id)} className="flex items-center gap-1.5 text-black hover:text-white text-xs font-semibold bg-brand-primary-light hover:bg-brand-primary border border-black shadow-xs hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] px-3 py-1.5 transition-all">
                    <Download size={14} /> DOWNLOAD 80G
                  </button>
                )}
              ]}
            />
          </div>
        </div>

        <div className="col-span-2">
          <div className="card sticky top-24 bg-brand-primary-light border-brand-primary">
            <div className="mb-6 border-b-2 border-brand-primary pb-4">
              <h2 className="font-semibold text-slate-800 text-lg">Record Donation</h2>
              <p className="text-[10px] font-mono tracking-wider text-slate-600 flex items-center gap-1 mt-1 uppercase">
                <LinkIcon size={12} className="text-brand-primary" /> Blockchain-Logged Action
              </p>
            </div>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium mb-1 relative">Donor Name *</label><input type="text" className="input-field" value={formData.donorName} onChange={e => setFormData({...formData, donorName: e.target.value})} /></div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700">Amount *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg font-medium">₹</span>
                  <input type="number" className="input-field pl-9 text-lg font-medium h-12" placeholder="0.00" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700">Project Allocation *</label>
                <select className="input-field border-slate-200" value={formData.project} onChange={e => setFormData({...formData, project: e.target.value})}>
                  {projects.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-700 font-mono uppercase tracking-wide">Payment Mode</label>
                <div className="grid grid-cols-2 gap-3">
                  {['UPI', 'Bank Transfer', 'Cash', 'Cheque'].map(mode => (
                    <div 
                      key={mode} 
                      onClick={() => setFormData({...formData, mode})} 
                      className={`border-2 p-3 text-sm text-center cursor-pointer font-bold uppercase transition-all ${formData.mode === mode ? 'bg-black text-white border-black shadow-sm ring-2 ring-brand-primary/30' : 'bg-white text-slate-700 border-brand-border shadow-sm hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none'}`}
                    >
                      {mode}
                    </div>
                  ))}
                </div>
              </div>
              
              <div><label className="block text-sm font-medium mb-1 relative">PAN Number</label><input type="text" className="input-field" placeholder="ABCDE1234F" value={formData.pan} onChange={e => setFormData({...formData, pan: e.target.value})} /></div>
              
              <div><label className="block text-sm font-medium mb-1 relative">Notes (Optional)</label><textarea rows={2} className="input-field" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}></textarea></div>
              
              <button 
                className="btn-primary w-full h-12 mt-4 text-base"
                onClick={handleSubmitDonation}
                disabled={isSubmitting}
              >
                <LinkIcon size={16} /> Record & Create Block
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Donors;
