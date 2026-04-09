import React, { useEffect, useState } from 'react';
import { Lock, Plus, Pencil, Eye, ShieldAlert } from 'lucide-react';
import { format, parseISO, differenceInYears } from 'date-fns';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { childrenAPI } from '../api/client';
import { Child } from '../types';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { DataTable } from '../components/UI/DataTable';
import { Badge } from '../components/UI/Badge';
import Modal from '../components/UI/Modal';

const Children: React.FC = () => {
  const { canAccessChildren, isAdmin } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingChild, setEditingChild] = useState<Child | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [progFilter, setProgFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '', dob: '', gender: 'Male', program: 'SHIKSHA', branch: 'Mumbai Central',
    guardian_name: '', guardian_contact: '', address: '', medical_notes: ''
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await childrenAPI.getAll();
      setChildren(data);
    } catch (error) {
      toast.error("Failed to load records");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (canAccessChildren) {
      fetchData();
    }
  }, [canAccessChildren]);

  if (!canAccessChildren) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center font-mono">
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] p-10 max-w-md text-center">
          <div className="w-20 h-20 bg-slate-100 border-2 border-black flex items-center justify-center mx-auto mb-5">
            <Lock size={40} className="text-black" />
          </div>
          <h2 className="text-xl font-bold text-black mb-2 uppercase tracking-tighter">Access Restricted</h2>
          <p className="text-slate-600 text-sm mb-4 leading-relaxed">
            This section contains sensitive child records and requires NGO Staff or Admin privileges.
          </p>
          <div className="text-xs font-bold text-black bg-yellow-400 py-2 border-2 border-black">
            CONTACT ADMINISTRATOR
          </div>
        </div>
      </div>
    );
  }

  const maskName = (name: string) => {
    return name.split(' ').map(w => w[0] + '****').join(' ');
  };

  const maskPhone = (phone: string) => {
    if (!phone || phone.length < 6) return phone;
    return phone.substring(0,2) + '***' + phone.substring(phone.length - 4);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.dob) {
      toast.error('Complete required fields');
      return;
    }
    try {
      if (editingChild) {
        await childrenAPI.update(editingChild.id, formData);
        toast.success("Record updated securely");
      } else {
        await childrenAPI.create(formData);
        toast.success("Child record added");
      }
      setModalOpen(false);
      fetchData();
    } catch (e) {
      toast.error("Operation failed");
    }
  };

  const openModal = (child: Child | null = null) => {
    if (child) {
      setEditingChild(child);
      setFormData({
        name: child.name, dob: child.dob, gender: child.gender, program: child.program,
        branch: child.branch, guardian_name: child.guardian_name, guardian_contact: child.guardian_contact,
        address: child.address, medical_notes: child.medical_notes || ''
      });
    } else {
      setEditingChild(null);
      setFormData({
        name: '', dob: '', gender: 'Male', program: 'SHIKSHA', branch: 'Mumbai Central',
        guardian_name: '', guardian_contact: '', address: '', medical_notes: ''
      });
    }
    setModalOpen(true);
  };

  const filtered = children.filter(c => {
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (progFilter && c.program !== progFilter) return false;
    if (branchFilter && c.branch !== branchFilter) return false;
    return true;
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <>
      <div className="bg-yellow-400 border-4 border-black p-4 mb-6 flex items-start gap-3 shadow-[4px_4px_0px_0px_#000] font-mono relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#000_10px,#000_20px)]"></div>
        <ShieldAlert size={24} className="text-black mt-0.5 shrink-0 relative z-10" />
        <div className="relative z-10">
          <h4 className="font-bold text-black text-sm uppercase">Confidential Data Protocol Active</h4>
          <p className="text-black text-xs mt-1 font-bold">
            Sensitive information. All queries logged on blockchain.
          </p>
        </div>
      </div>

      <div className="flex justify-between items-end mb-6 font-mono">
        <h1 className="text-3xl font-black text-black uppercase tracking-tighter">Children Records</h1>
        <button className="bg-black text-white px-6 py-2 font-bold uppercase border-2 border-black hover:bg-white hover:text-black transition-all shadow-[4px_4px_0px_0px_#000]" onClick={() => openModal()}>
          <Plus size={18} className="inline mr-2" /> Add Child
        </button>
      </div>

      <div className="flex gap-3 mb-8 font-mono">
        <input 
          type="text" 
          placeholder="Search..." 
          className="border-2 border-black p-2 w-64 focus:outline-none focus:shadow-[2px_2px_0px_0px_#000]"
          value={search} onChange={e => setSearch(e.target.value)}
        />
        <select className="border-2 border-black p-2 w-56" value={progFilter} onChange={e => setProgFilter(e.target.value)}>
          <option value="">All Programs</option>
          <option value="SHIKSHA">Shiksha</option>
          <option value="SWASTHYA">Swasthya</option>
          <option value="AAJEEVIKA">Aajeevika</option>
          <option value="UNNATI">Unnati</option>
        </select>
        <select className="border-2 border-black p-2 w-56" value={branchFilter} onChange={e => setBranchFilter(e.target.value)}>
          <option value="">All Branches</option>
          <option value="Mumbai Central">Mumbai Central</option>
          <option value="Pune West">Pune West</option>
          <option value="Nashik North">Nashik North</option>
        </select>
        <div className="ml-auto text-sm font-bold self-center border-2 border-black px-4 py-2 bg-slate-100">
          {filtered.length} RECORDS
        </div>
      </div>

      <div className="border-2 border-black shadow-[8px_8px_0px_0px_#000]">
        <DataTable 
          data={filtered}
          columns={[
            { key: 'id', header: 'ID', render: (row) => <span className="font-mono font-bold text-slate-400">#{row.id}</span> },
            { key: 'name', header: 'Name', render: (row) => <span className="font-bold text-black uppercase">{isAdmin ? row.name : maskName(row.name)}</span> },
            { key: 'age', header: 'Age', render: (row) => <span className="font-mono font-bold">{differenceInYears(new Date(), parseISO(row.dob))}y</span> },
            { key: 'program', header: 'Program', render: (row) => <span className="bg-black text-white px-2 py-1 text-[10px] font-bold">{row.program}</span> },
            { key: 'branch', header: 'Branch' },
            { key: 'guardian', header: 'Guardian', render: (row) => (
                <div className="text-xs font-mono">
                  <p className="font-bold">{isAdmin ? row.guardian_name : maskName(row.guardian_name)}</p>
                  <p className="text-slate-500">{isAdmin ? row.guardian_contact : maskPhone(row.guardian_contact)}</p>
                </div>
              )
            },
            { key: 'action', header: 'Actions', render: (row) => (
                <div className="flex gap-2">
                  {isAdmin && <button className="p-2 border-2 border-black hover:bg-slate-100">
                    <Eye size={16} />
                  </button>}
                  <button onClick={() => openModal(row)} className="p-2 border-2 border-black bg-yellow-400 hover:bg-yellow-500">
                    <Pencil size={16} />
                  </button>
                </div>
            )}
          ]}
        />
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingChild ? "EDIT RECORD" : "ADD CHILD RECORD"} size="lg">
        <div className="grid grid-cols-2 gap-4 font-mono">
          <div><label className="block text-xs font-bold mb-1 uppercase">Full Name *</label><input type="text" className="border-2 border-black w-full p-2" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
          <div><label className="block text-xs font-bold mb-1 uppercase">Date of Birth *</label><input type="date" className="border-2 border-black w-full p-2" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} /></div>
          <div><label className="block text-xs font-bold mb-1 uppercase">Gender *</label><select className="border-2 border-black w-full p-2" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}><option>Male</option><option>Female</option><option>Other</option></select></div>
          <div>
            <label className="block text-xs font-bold mb-1 uppercase">Program *</label>
            <select className="border-2 border-black w-full p-2" value={formData.program} onChange={e => setFormData({...formData, program: e.target.value})}>
              <option value="SHIKSHA">Shiksha</option>
              <option value="SWASTHYA">Swasthya</option>
              <option value="AAJEEVIKA">Aajeevika</option>
              <option value="UNNATI">Unnati</option>
            </select>
          </div>
          <div><label className="block text-xs font-bold mb-1 uppercase">Branch *</label><input type="text" className="border-2 border-black w-full p-2" value={formData.branch} onChange={e => setFormData({...formData, branch: e.target.value})} /></div>
          <div><label className="block text-xs font-bold mb-1 uppercase">Guardian Name *</label><input type="text" className="border-2 border-black w-full p-2" value={formData.guardian_name} onChange={e => setFormData({...formData, guardian_name: e.target.value})} /></div>
          <div><label className="block text-xs font-bold mb-1 uppercase">Guardian Contact *</label><input type="text" className="border-2 border-black w-full p-2" value={formData.guardian_contact} onChange={e => setFormData({...formData, guardian_contact: e.target.value})} /></div>
          <div className="col-span-2"><label className="block text-xs font-bold mb-1 uppercase">Address</label><textarea rows={2} className="border-2 border-black w-full p-2" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}></textarea></div>
          <div className="col-span-2"><label className="block text-xs font-bold mb-1 uppercase">Medical Notes</label><textarea rows={2} className="border-2 border-black w-full p-2" value={formData.medical_notes} onChange={e => setFormData({...formData, medical_notes: e.target.value})}></textarea></div>
        </div>
        <div className="mt-6 flex justify-end gap-3 pt-4 border-t-2 border-black">
          <button className="border-2 border-black px-4 py-2 font-bold uppercase hover:bg-slate-100" onClick={() => setModalOpen(false)}>Cancel</button>
          <button className="bg-black text-white px-6 py-2 font-bold uppercase border-2 border-black hover:bg-white hover:text-black" onClick={handleSubmit}><Lock size={16} className="inline mr-2"/> {editingChild ? "Update" : "Save"}</button>
        </div>
      </Modal>
    </>
  );
};

export default Children;
