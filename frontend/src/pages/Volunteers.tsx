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
      <h1 className="page-title">Volunteer Management</h1>
      <p className="page-subtitle">Manage slots, volunteers, and scheduling</p>

      <div className="flex gap-4 mb-8">
        <div className="bg-white border border-brand-border rounded-xl shadow-card p-4 flex items-center gap-3 w-64">
          <div className="text-2xl font-semibold text-brand-primary">{volunteers.length}</div>
          <div className="text-sm text-brand-muted">Total Volunteers</div>
        </div>
        <div className="bg-white border border-brand-border rounded-xl shadow-card p-4 flex items-center gap-3 w-64">
          <div className="text-2xl font-semibold text-blue-600">{slots.length}</div>
          <div className="text-sm text-brand-muted">Open Slots</div>
        </div>
        <div className="bg-white border border-brand-border rounded-xl shadow-card p-4 flex items-center gap-3 w-64">
          <div className="text-2xl font-semibold text-emerald-600">
            {volunteers.reduce((acc, v) => acc + v.total_hours, 0)}h
          </div>
          <div className="text-sm text-brand-muted">Hours Logged</div>
        </div>
      </div>

      <div className="border-b border-brand-border mb-6 flex text-sm font-medium">
        <button 
          className={`px-5 py-3 border-b-2 transition-all -mb-px ${activeTab === 'slots' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-brand-muted hover:text-brand-text hover:bg-slate-50'}`}
          onClick={() => setActiveTab('slots')}
        >
          Open Slots
        </button>
        <button 
          className={`px-5 py-3 border-b-2 transition-all -mb-px ${activeTab === 'volunteers' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-brand-muted hover:text-brand-text hover:bg-slate-50'}`}
          onClick={() => setActiveTab('volunteers')}
        >
          Volunteer Directory
        </button>
        {isStaff && (
          <button 
            className={`px-5 py-3 border-b-2 transition-all -mb-px ${activeTab === 'post' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-brand-muted hover:text-brand-text hover:bg-slate-50'}`}
            onClick={() => setActiveTab('post')}
          >
            Post New Slot
          </button>
        )}
      </div>

      <div>
        {activeTab === 'slots' && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
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
                <div key={slot.id} className="card flex flex-col group hover:shadow-lg transition-all duration-200">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-brand-text">{slot.task_name}</h3>
                    <span className="bg-brand-primary text-white text-xs font-medium px-2.5 py-1 rounded-full shrink-0">
                      {format(parseISO(slot.date), 'dd MMM')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-brand-muted mb-3 mt-1">
                    <MapPin size={12} className="text-brand-primary" />
                    {slot.location} • {slot.time}
                  </div>
                  
                  {parsedSkills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {parsedSkills.map((s: string, i: number) => (
                        <span key={i} className="border border-brand-border bg-slate-50 text-brand-muted text-xs font-medium px-2 py-0.5 rounded-full">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="border-t border-brand-border/50 my-3"></div>
                  
                  <div className="flex-1 text-sm text-brand-muted line-clamp-2 mb-4">
                    {slot.description}
                  </div>
                  
                  <div className="mt-auto">
                    <div className="flex justify-between text-xs text-brand-muted mb-1.5">
                      <span>{slot.booked_count} Booked</span>
                      <span>{slot.max_volunteers} Required</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full mb-4 overflow-hidden">
                      <div className="bg-brand-primary h-full rounded-full transition-all duration-500" style={{ width: `${fillPercentage}%` }}></div>
                    </div>
                    <button 
                      onClick={() => handleBookSlot(slot.id)}
                      disabled={isFull}
                      className={isFull ? "bg-slate-100 text-brand-muted text-sm font-medium py-2.5 w-full rounded-lg cursor-not-allowed" : "btn-primary w-full"}
                    >
                      {isFull ? 'Slot Full' : 'Book Slot'}
                    </button>
                  </div>
                </div>
              );
            })}
            {slots.length === 0 && (
              <div className="col-span-3 py-10 text-center text-brand-muted bg-white rounded-xl border border-dashed border-brand-border">
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
                { key: 'user.full_name', header: 'Volunteer Name', render: (row) => <div className="font-medium text-brand-text">{row.user.full_name}</div> },
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
                        {parsed.slice(0,2).map((s: string, i: number) => <span key={i} className="bg-slate-100 px-2 py-1 rounded-full text-xs truncate max-w-[100px]">{s}</span>)}
                        {parsed.length > 2 && <span className="bg-slate-100 px-2 py-1 rounded-full text-xs shrink-0">+{parsed.length - 2}</span>}
                      </div>
                    )
                }},
                { key: 'total_hours', header: 'Total Hours', render: (row) => <span className="font-mono font-semibold text-brand-primary">{row.total_hours}h</span> },
                { key: 'status', header: 'Status', render: (row) => <Badge variant={getStatusVariant(row.status)}>{row.status}</Badge> },
                { key: 'joined_at', header: 'Joined Date', render: (row) => <span className="text-brand-muted">{format(parseISO(row.joined_at), 'dd/MM/yyyy')}</span> }
              ]}
            />
          </div>
        )}

        {activeTab === 'post' && isStaff && (
          <div className="card max-w-2xl">
            <h2 className="text-lg font-semibold text-brand-text mb-6">Create Volunteer Opportunity</h2>
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-brand-text mb-1.5">Task Name *</label>
                <input type="text" className="input-field" value={taskName} onChange={e => setTaskName(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-text mb-1.5">Date *</label>
                <input type="date" className="input-field" value={date} onChange={e => setDate(e.target.value)} />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-brand-text mb-1.5">Description</label>
                <textarea rows={3} className="input-field" value={description} onChange={e => setDescription(e.target.value)}></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-text mb-1.5">Location</label>
                <input type="text" className="input-field" value={location} onChange={e => setLocation(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-text mb-1.5">Time</label>
                <input type="text" placeholder="e.g. 10:00 AM - 2:00 PM" className="input-field" value={time} onChange={e => setTime(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-text mb-1.5">Max Volunteers</label>
                <input type="number" min={1} className="input-field" value={maxVolunteers} onChange={e => setMaxVolunteers(Number(e.target.value))} />
              </div>
              <div className="col-span-2 border-t border-brand-border pt-4">
                <label className="block text-sm font-medium text-brand-text mb-1.5">Required Skills</label>
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
                  <div className="flex flex-wrap gap-2 mt-2 border border-dashed border-brand-border p-3 rounded-lg bg-slate-50 min-h-12">
                    {skills.map((s, i) => (
                      <span key={i} className="bg-brand-primary-light text-brand-primary text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1">
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
