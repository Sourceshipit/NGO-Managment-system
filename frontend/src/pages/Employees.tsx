import React, { useEffect, useState } from 'react';
import { Briefcase, Calendar, Download, Plus, CheckCircle, XCircle } from 'lucide-react';
import { format, parseISO, addMonths, subMonths, getDaysInMonth, startOfMonth } from 'date-fns';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { employeesAPI } from '../api/client';
import { Employee, Attendance, LeaveRequest } from '../types';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { DataTable } from '../components/UI/DataTable';
import { Badge, getStatusVariant } from '../components/UI/Badge';
import Modal from '../components/UI/Modal';

export function formatIndianCurrency(n: number): string {
  return n.toLocaleString('en-IN');
}

const Employees: React.FC = () => {
  const { isAdmin } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [payroll, setPayroll] = useState<any>(null);
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [viewMonth, setViewMonth] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [leaveTab, setLeaveTab] = useState('All');

  // Add Employee Form
  const [formData, setFormData] = useState({
    full_name: '', role: '', department: 'Programs', joining_date: '', salary: 0, 
    contact: '', status: 'ACTIVE', documents: [] as string[]
  });

  const fetchData = async () => {
    try {
      const [empData, leaveData, payrollData] = await Promise.all([
        employeesAPI.getAll(),
        employeesAPI.getLeaves(),
        employeesAPI.getPayroll()
      ]);
      setEmployees(empData);
      setLeaves(leaveData);
      setPayroll(payrollData);
    } catch (error) {
      toast.error("Failed to load employee data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedEmployee) {
      const fetchAtt = async () => {
        try {
          const data = await employeesAPI.getAttendance(selectedEmployee.id, viewMonth.getMonth() + 1, viewMonth.getFullYear());
          const attMap: Record<string, string> = {};
          data.forEach(a => { attMap[a.date] = a.status; });
          setAttendance(attMap);
        } catch (e) {
          toast.error("Failed to load attendance");
        }
      };
      fetchAtt();
    }
  }, [selectedEmployee, viewMonth]);

  const handleUpdateLeave = async (id: number, status: string) => {
    try {
      await employeesAPI.updateLeave(id, status);
      toast.success(`Leave ${status.toLowerCase()}`);
      fetchData();
    } catch {
      toast.error("Failed to update leave");
    }
  };

  const handleAddEmployee = async () => {
    if (!formData.full_name || !formData.role || !formData.joining_date) {
      toast.error("Please fill required fields"); return;
    }
    try {
      await employeesAPI.create({
        ...formData,
        documents_uploaded: JSON.stringify(formData.documents)
      });
      toast.success("Employee added successfully");
      setIsModalOpen(false);
      fetchData();
    } catch {
      toast.error("Failed to add employee");
    }
  };

  const toggleDoc = (doc: string) => {
    if (formData.documents.includes(doc)) {
      setFormData({...formData, documents: formData.documents.filter(d => d !== doc)});
    } else {
      setFormData({...formData, documents: [...formData.documents, doc]});
    }
  };

  if (isLoading) return <LoadingSpinner />;

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const leavesToday = leaves.filter(l => l.status === 'APPROVED' && todayStr >= l.from_date && todayStr <= l.to_date).length;

  // Calendar rendering logic
  const daysInMonth = getDaysInMonth(viewMonth);
  const startDay = startOfMonth(viewMonth).getDay(); // 0 is Sunday
  const calendarCells = [];
  for (let i = 0; i < (startDay === 0 ? 6 : startDay - 1); i++) {
    calendarCells.push({ empty: true });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), d);
    const dateStr = format(dateObj, 'yyyy-MM-dd');
    calendarCells.push({ 
      empty: false, 
      date: d, 
      dateStr, 
      isWeekend: dateObj.getDay() === 0 || dateObj.getDay() === 6
    });
  }

  const getCellClass = (cell: any) => {
    if (cell.empty) return "bg-transparent";
    const status = attendance[cell.dateStr];
    let base = "border w-9 h-9 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ";
    
    if (cell.dateStr === todayStr) base += "ring-2 ring-orange-500 ring-offset-1 ";
    
    if (status === 'PRESENT') return base + "bg-green-100 text-green-700 border-green-200";
    if (status === 'ABSENT') return base + "bg-red-100 text-red-700 border-red-200";
    if (status === 'LEAVE') return base + "bg-amber-100 text-amber-700 border-amber-200";
    
    if (cell.dateStr > todayStr) return base + "bg-white text-slate-300 border-slate-200 border-2";
    if (cell.isWeekend) return base + "bg-slate-100 text-slate-400 border-slate-200 border-2 shadow-[2px_2px_0px_#000]";
    
    return base + "bg-white text-slate-600 hover:bg-slate-50 cursor-pointer border-2 border-black shadow-[2px_2px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all";
  };

  const filteredLeaves = leaves.filter(l => leaveTab === 'All' || l.status === leaveTab.toUpperCase());

  return (
    <div className="page-enter">
      <div className="flex justify-between items-end mb-6 font-dm">
        <h1 className="page-title !mb-0 text-3xl font-black text-black uppercase tracking-tighter">Employee Tracking</h1>
        {isAdmin && <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} className="inline mr-1" /> Add Employee
        </button>}
      </div>

      <div className="grid grid-cols-4 gap-5 mb-8 font-dm">
        <div className="bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000] p-4 flex flex-col justify-center transition-all">
          <div className="text-[10px] uppercase tracking-wider text-slate-600 font-bold font-mono">Total Staff</div>
          <div className="text-2xl font-mono font-bold text-slate-800">{employees.length}</div>
        </div>
        <div className="bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000] p-4 flex flex-col justify-center transition-all">
          <div className="text-[10px] uppercase tracking-wider text-slate-600 font-bold font-mono">Present Today</div>
          <div className="text-2xl font-mono font-bold text-green-600">{employees.length - leavesToday}</div>
        </div>
        <div className="bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000] p-4 flex flex-col justify-center transition-all">
          <div className="text-[10px] uppercase tracking-wider text-slate-600 font-bold font-mono">On Leave</div>
          <div className="text-2xl font-mono font-bold text-amber-500">{leavesToday}</div>
        </div>
        <div className="bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000] p-4 flex flex-col justify-center transition-all">
          <div className="text-[10px] uppercase tracking-wider text-slate-600 font-bold font-mono">Monthly Payroll</div>
          <div className="text-2xl font-mono font-bold text-orange-600">₹{payroll ? formatIndianCurrency(payroll.total_payroll) : '0'}</div>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-6 mb-6 font-dm">
        <div className="col-span-3 card !p-0 overflow-hidden flex flex-col h-[500px]">
          <div className="p-5 border-b-2 border-black bg-slate-50 z-10">
            <h2 className="font-mono font-bold uppercase text-slate-800">Team Members</h2>
          </div>
          <div className="flex-1 overflow-auto">
            <DataTable 
              data={employees}
              columns={[
                { key: 'full_name', header: 'Employee Name', render: (row) => (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs shrink-0">{row.full_name[0]}</div>
                    <span className="font-semibold text-slate-800">{row.full_name}</span>
                  </div>
                )},
                { key: 'role', header: 'Role', render: (row) => <span className="text-slate-600">{row.role}</span> },
                { key: 'department', header: 'Department', render: (row) => <Badge variant={row.department === 'Programs' ? 'info' : 'orange'}>{row.department}</Badge> },
                { key: 'action', header: 'Action', render: (row) => (
                  <button 
                    onClick={() => setSelectedEmployee(row)}
                    className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${selectedEmployee?.id === row.id ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  >
                    View
                  </button>
                )}
              ]}
            />
          </div>
        </div>

        <div className="col-span-2 card bg-slate-50">
          <h2 className="font-mono font-bold uppercase text-slate-800 mb-6 border-b-2 border-black pb-2">Attendance Calendar</h2>
          {!selectedEmployee ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-300 bg-white">
              <Calendar size={48} className="mb-3 opacity-50" />
              <p className="font-mono font-bold uppercase text-xs">Select an employee</p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-100 mb-4">
                <span className="font-semibold text-slate-800">{selectedEmployee.full_name}</span>
                <Badge variant="neutral">{selectedEmployee.department}</Badge>
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <button className="text-slate-400 hover:text-slate-600" onClick={() => setViewMonth(subMonths(viewMonth, 1))}>← prev</button>
                <div className="font-sora font-semibold text-orange-600">{format(viewMonth, 'MMMM yyyy')}</div>
                <button className="text-slate-400 hover:text-slate-600" onClick={() => setViewMonth(addMonths(viewMonth, 1))}>next →</button>
              </div>
              
              <div className="grid grid-cols-7 gap-1 text-center mb-1 text-xs font-semibold text-slate-400">
                <div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div><div>Su</div>
              </div>
              
              <div className="grid grid-cols-7 gap-1 flex-wrap">
                {calendarCells.map((cell, idx) => (
                  <div key={idx} className="flex justify-center">
                    <div className={getCellClass(cell)}>{!cell.empty && cell.date}</div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 flex gap-4 text-xs font-medium text-slate-600 justify-center">
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-green-100 border border-green-200 rounded"></div> Present</div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div> Absent</div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-amber-100 border border-amber-200 rounded"></div> Leave</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="card !p-0 overflow-hidden mb-6 font-dm">
        <div className="p-5 border-b-2 border-black bg-slate-50 flex justify-between items-center">
          <h2 className="font-mono font-bold uppercase text-slate-800">Leave Requests</h2>
          <div className="flex bg-white border-2 border-black p-1 shadow-[2px_2px_0px_#000]">
            {['All', 'Pending', 'Approved', 'Rejected'].map(tab => (
              <button 
                key={tab} 
                className={`text-[10px] px-3 py-1 font-mono font-bold uppercase transition-all ${leaveTab === tab ? 'bg-black text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                onClick={() => setLeaveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        <DataTable 
          data={filteredLeaves}
          columns={[
            { key: 'employee_name', header: 'Employee', render: (row) => <span className="font-medium text-slate-800">{row.employee_name}</span> },
            { key: 'leave_type', header: 'Type', render: (row) => <Badge variant="neutral">{row.leave_type}</Badge> },
            { key: 'from_date', header: 'Duration', render: (row) => <span className="text-slate-600">{format(parseISO(row.from_date), 'dd MMM')} - {format(parseISO(row.to_date), 'dd MMM')}</span> },
            { key: 'status', header: 'Status', render: (row) => <Badge variant={getStatusVariant(row.status)}>{row.status}</Badge> },
            { key: 'action', header: 'Actions', render: (row) => {
              if (row.status === 'PENDING' && isAdmin) {
                return (
                  <div className="flex gap-2">
                    <button onClick={() => handleUpdateLeave(row.id, 'APPROVED')} className="p-1 px-3 bg-green-50 text-green-600 hover:bg-green-100 rounded font-semibold text-xs border border-green-200 flex items-center gap-1"><CheckCircle size={14}/> Approve</button>
                    <button onClick={() => handleUpdateLeave(row.id, 'REJECTED')} className="p-1 px-3 bg-red-50 text-red-600 hover:bg-red-100 rounded font-semibold text-xs border border-red-200 flex items-center gap-1"><XCircle size={14}/> Reject</button>
                  </div>
                )
              }
              return <span className="text-slate-300">-</span>;
            }}
          ]}
        />
      </div>
      
      {isAdmin && (
        <div className="card font-dm bg-orange-50 border-orange-500">
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-1 border-r-2 border-black pr-6 flex flex-col justify-center">
              <h2 className="text-slate-500 font-bold mb-1 tracking-widest uppercase text-[10px] font-mono">Monthly Payroll Summary</h2>
              <div className="text-4xl font-mono font-bold text-orange-500 mb-2">₹{payroll ? formatIndianCurrency(payroll.total_payroll) : '0'}</div>
              <p className="text-xs text-slate-500 font-mono font-bold uppercase">{employees.length} active employees processed</p>
            </div>
            <div className="col-span-1 pr-6 flex flex-col justify-center">
              <h3 className="font-mono font-bold text-slate-700 mb-3 text-sm uppercase border-b-2 border-black pb-1 inline-block">Department Breakdown</h3>
              <div className="space-y-3 font-mono">
                {payroll?.breakdown.map((b: any, i: number) => (
                  <div key={i} className="flex justify-between text-xs font-bold uppercase border-b border-orange-200 pb-1">
                    <span className="text-slate-600 shrink-0w-24 truncate">{b.department} <span className="text-slate-400 text-[10px] ml-1">({b.count})</span></span>
                    <span className="font-bold text-slate-800">₹{(b.total/1000).toFixed(0)}k</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="col-span-1 flex flex-col justify-center items-center px-4">
              <button className="btn-secondary w-full py-4 text-orange-600 border-orange-200 border bg-orange-50 hover:bg-orange-100 mb-3">
                <Download size={18} /> Export Payroll CSV
              </button>
              <p className="text-xs text-slate-400 text-center">Export requires finance authorization. Actions are blockchain logged.</p>
            </div>
          </div>
        </div>
      )}

      {isAdmin && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="ADD EMPLOYEE" size="lg">
          <div className="grid grid-cols-2 gap-4 font-mono">
            <div><label className="block text-xs font-bold mb-1 uppercase">Full Name *</label><input type="text" className="input-field" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} /></div>
            <div><label className="block text-xs font-bold mb-1 uppercase">Role *</label><input type="text" className="input-field" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} /></div>
            <div><label className="block text-xs font-bold mb-1 uppercase">Department *</label>
              <select className="input-field" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})}>
                <option>Programs</option><option>IT</option><option>Finance</option><option>Operations</option><option>Admin</option>
              </select>
            </div>
            <div><label className="block text-xs font-bold mb-1 uppercase">Joining Date *</label><input type="date" className="input-field bg-white" value={formData.joining_date} onChange={e => setFormData({...formData, joining_date: e.target.value})} /></div>
            <div><label className="block text-xs font-bold mb-1 uppercase">Salary (₹)</label><input type="number" className="input-field" value={formData.salary} onChange={e => setFormData({...formData, salary: Number(e.target.value)})} /></div>
            <div><label className="block text-xs font-bold mb-1 uppercase">Status </label><select className="input-field" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}><option>ACTIVE</option><option>INACTIVE</option></select></div>
            
            <div className="col-span-2 border-t-2 border-black pt-4 mt-2">
              <h4 className="text-sm font-mono font-bold uppercase bg-black text-white inline-block px-2 py-1 mb-3">Documents Uploaded</h4>
              <div className="flex gap-6">
                {['Aadhar', 'PAN', 'Offer Letter', 'Bank Details'].map(doc => (
                  <label key={doc} className="flex items-center gap-2 text-xs font-bold uppercase text-slate-700 cursor-pointer">
                    <input type="checkbox" checked={formData.documents.includes(doc)} onChange={() => toggleDoc(doc)} className="w-4 h-4 border-2 border-black" />
                    {doc}
                  </label>
                ))}
              </div>
            </div>
            
            <div className="col-span-2 pt-4 flex justify-end gap-3 border-t-2 border-black mt-2">
              <button className="border-2 border-black px-4 py-2 font-bold uppercase hover:bg-slate-100" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleAddEmployee}><Briefcase size={16}/> Save Employee</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Employees;
