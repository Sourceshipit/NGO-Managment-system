import React, { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { MapPin, Settings2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { volunteersAPI } from '../api/client';
import { Volunteer, VolunteerSlot } from '../types';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { DataTable } from '../components/UI/DataTable';
import { Badge, getStatusVariant } from '../components/UI/Badge';

const Volunteers: React.FC = () => {
  const { isStaff } = useAuth();
  const [activeTab, setActiveTab] = useState<'slots' | 'volunteers' | 'post'>('slots');
  const [slots, setSlots] = useState<VolunteerSlot[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [taskName, setTaskName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [maxVolunteers, setMaxVolunteers] = useState(5);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [s, v] = await Promise.all([volunteersAPI.getSlots(), volunteersAPI.getAll()]);
      setSlots(s);
      setVolunteers(v);
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleBookSlot = async (id: number) => {
    try {
      await volunteersAPI.bookSlot(id);
      toast.success("Successfully booked slot!");
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to book slot");
    }
  };

  const handlePostSlot = async () => {
    if (!taskName || !date) {
      toast.error("Task Name and Date are required");
      return;
    }
    setIsPosting(true);
    try {
      await volunteersAPI.createSlot({
        task_name: taskName,
        date: date,
        time: time,
        location: location,
        description: description,
        max_volunteers: maxVolunteers,
        required_skills: JSON.stringify(skills)
      });
      toast.success("Slot posted successfully!");
      setActiveTab('slots');
      fetchData();
      // Reset form
      setTaskName(''); setDate(''); setTime(''); setLocation(''); 
      setDescription(''); setMaxVolunteers(5); setSkills([]);
    } catch (error) {
      toast.error("Failed to post slot");
    } finally {
      setIsPosting(false);
    }
  };

  const addSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="page-enter">
      <h1 className="page-title mb-6">Volunteer Management</h1>

      <div className="flex gap-4 mb-8 font-dm">
        <div className="bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000] p-4 flex items-center gap-3 w-64 transition-all">
          <div className="text-2xl font-mono font-bold text-orange-500">{volunteers.length}</div>
          <div className="text-xs uppercase tracking-wider text-slate-600 font-bold font-mono">Total Volunteers</div>
        </div>
        <div className="bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000] p-4 flex items-center gap-3 w-64 transition-all">
          <div className="text-2xl font-mono font-bold text-blue-500">{slots.length}</div>
          <div className="text-xs uppercase tracking-wider text-slate-600 font-bold font-mono">Open Slots</div>
        </div>
        <div className="bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000] p-4 flex items-center gap-3 w-64 transition-all">
          <div className="text-2xl font-mono font-bold text-green-500">
            {volunteers.reduce((acc, v) => acc + v.total_hours, 0)}h
          </div>
          <div className="text-xs uppercase tracking-wider text-slate-600 font-bold font-mono">Hours Logged</div>
        </div>
      </div>

      <div className="border-b-2 border-black mb-6 flex font-mono uppercase font-bold text-sm">
        <button 
          className={`px-6 py-3 border-b-4 transition-all -mb-[2px] ${activeTab === 'slots' ? 'border-orange-500 text-black bg-orange-50' : 'border-transparent text-slate-500 hover:text-black hover:bg-slate-50'}`}
          onClick={() => setActiveTab('slots')}
        >
          Open Slots
        </button>
        <button 
          className={`px-6 py-3 border-b-4 transition-all -mb-[2px] ${activeTab === 'volunteers' ? 'border-orange-500 text-black bg-orange-50' : 'border-transparent text-slate-500 hover:text-black hover:bg-slate-50'}`}
          onClick={() => setActiveTab('volunteers')}
        >
          Volunteer Directory
        </button>
        {isStaff && (
          <button 
            className={`px-6 py-3 border-b-4 transition-all -mb-[2px] ${activeTab === 'post' ? 'border-orange-500 text-black bg-orange-50' : 'border-transparent text-slate-500 hover:text-black hover:bg-slate-50'}`}
            onClick={() => setActiveTab('post')}
          >
            Post New Slot
          </button>
        )}
      </div>

      <div className="font-dm">
        {activeTab === 'slots' && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {slots.map(slot => {
              let parsedSkills: string[] = [];
              if (slot.required_skills) {
                try {
                  const parsedData = JSON.parse(slot.required_skills);
                  parsedSkills = Array.isArray(parsedData) ? parsedData : [String(parsedData)];
                } catch (e) {
                  parsedSkills = typeof slot.required_skills === 'string' ? slot.required_skills.split(',').map(s => s.trim()) : [];
                }
              }
              const isFull = slot.booked_count >= slot.max_volunteers;
              const fillPercentage = (slot.booked_count / slot.max_volunteers) * 100;

              return (
                <div key={slot.id} className="card flex flex-col hover:shadow-[4px_4px_0px_#F97316] transition-all group">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-mono font-bold text-slate-800 tracking-tight uppercase border-b-2 border-black inline-block pb-0.5">{slot.task_name}</h3>
                    <span className="bg-black text-white text-[10px] font-mono font-bold px-2 py-1 uppercase shrink-0 border border-black shadow-[1px_1px_0px_#F97316]">
                      {format(parseISO(slot.date), 'dd MMM')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-slate-600 mb-3 mt-1">
                    <MapPin size={12} className="text-orange-500" />
                    {slot.location} • {slot.time}
                  </div>
                  
                  {parsedSkills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {parsedSkills.map((s: string, i: number) => (
                        <span key={i} className="border border-slate-300 bg-slate-100 text-slate-700 text-[10px] font-mono font-bold px-2 py-0.5 uppercase">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="border-t border-slate-100 my-3"></div>
                  
                  <div className="flex-1 text-sm text-slate-600 line-clamp-2 mb-4">
                    {slot.description}
                  </div>
                  
                  <div className="mt-auto">
                    <div className="flex justify-between text-[10px] font-mono font-bold uppercase text-slate-500 mb-1.5">
                      <span>{slot.booked_count} Booked</span>
                      <span>{slot.max_volunteers} Required</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 mb-4 border border-black shadow-[1px_1px_0px_#000]">
                      <div className="bg-orange-500 h-full border-r border-black" style={{ width: `${fillPercentage}%` }}></div>
                    </div>
                    <button 
                      onClick={() => handleBookSlot(slot.id)}
                      disabled={isFull}
                      className={isFull ? "bg-slate-200 text-slate-500 text-sm font-mono font-bold uppercase py-2 w-full border-2 border-slate-300 cursor-not-allowed" : "btn-primary w-full"}
                    >
                      {isFull ? 'SLOT FULL' : 'BOOK SLOT'}
                    </button>
                  </div>
                </div>
              );
            })}
            {slots.length === 0 && (
              <div className="col-span-3 py-10 text-center text-slate-500 bg-white rounded-2xl border border-dashed">
                <Settings2 size={40} className="mx-auto text-slate-300 mb-2" />
                <p>No active slots available. Check back later!</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'volunteers' && (
          <div className="card !p-0 overflow-hidden">
            <DataTable 
              searchable
              data={volunteers}
              columns={[
                { key: 'user.full_name', header: 'Volunteer Name', render: (row) => <div className="font-semibold text-slate-800">{row.user.full_name}</div> },
                { key: 'skills', header: 'Skills', render: (row) => {
                    let parsed: string[] = [];
                    if (row.skills) {
                      try {
                        const parsedData = JSON.parse(row.skills);
                        parsed = Array.isArray(parsedData) ? parsedData : [String(parsedData)];
                      } catch (e) {
                         // If it's not valid JSON, just treat the raw string as a single skill
                        parsed = typeof row.skills === 'string' ? row.skills.split(',').map(s => s.trim()) : [];
                      }
                    }
                    return (
                      <div className="flex gap-1 flex-wrap">
                        {parsed.slice(0,2).map((s: string, i: number) => <span key={i} className="bg-slate-100 px-2 py-1 rounded text-xs truncate max-w-[100px]">{s}</span>)}
                        {parsed.length > 2 && <span className="bg-slate-100 px-2 py-1 rounded text-xs shrink-0">+{parsed.length - 2}</span>}
                      </div>
                    )
                }},
                { key: 'total_hours', header: 'Total Hours', render: (row) => <span className="font-bold text-orange-600">{row.total_hours}h</span> },
                { key: 'status', header: 'Status', render: (row) => <Badge variant={getStatusVariant(row.status)}>{row.status}</Badge> },
                { key: 'joined_at', header: 'Joined Date', render: (row) => <span>{format(parseISO(row.joined_at), 'dd/MM/yyyy')}</span> }
              ]}
            />
          </div>
        )}

        {activeTab === 'post' && isStaff && (
          <div className="card max-w-2xl bg-orange-50 border-orange-500">
            <h2 className="text-xl font-mono uppercase bg-black text-white inline-block px-4 py-2 font-bold mb-6 border-2 border-black shadow-[4px_4px_0px_#F97316]">Create Volunteer Opp</h2>
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium mb-1.5">Task Name *</label>
                <input type="text" className="input-field" value={taskName} onChange={e => setTaskName(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Date *</label>
                <input type="date" className="input-field" value={date} onChange={e => setDate(e.target.value)} />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1.5">Description</label>
                <textarea rows={3} className="input-field" value={description} onChange={e => setDescription(e.target.value)}></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Location</label>
                <input type="text" className="input-field" value={location} onChange={e => setLocation(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Time</label>
                <input type="text" placeholder="e.g. 10:00 AM - 2:00 PM" className="input-field" value={time} onChange={e => setTime(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Max Volunteers</label>
                <input type="number" min={1} className="input-field" value={maxVolunteers} onChange={e => setMaxVolunteers(Number(e.target.value))} />
              </div>
              <div className="col-span-2 border-t pt-4">
                <label className="block text-sm font-medium mb-1.5">Required Skills</label>
                <div className="flex gap-2 mb-2">
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="Type skill and press Enter" 
                    value={skillInput}
                    onChange={e => setSkillInput(e.target.value)}
                    onKeyDown={addSkill}
                  />
                </div>
                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2 border p-3 rounded-lg bg-slate-50 min-h-12 border-dashed">
                    {skills.map((s, i) => (
                      <span key={i} className="bg-orange-100 text-orange-700 text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1">
                        {s}
                        <button onClick={() => removeSkill(i)} className="hover:text-red-500 font-bold ml-1">×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="col-span-2 pt-2">
                <button 
                  onClick={handlePostSlot}
                  disabled={isPosting} 
                  className="btn-primary w-full h-12"
                >
                  {isPosting ? 'Posting...' : 'Publish Slot'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Volunteers;
