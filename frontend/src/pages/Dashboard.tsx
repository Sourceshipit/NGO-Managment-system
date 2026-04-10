import React, { useEffect, useState } from 'react';
import { IndianRupee, Users, Baby, ShieldCheck, ChevronRight, CheckCircle2, FileText, Activity } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Area, AreaChart } from 'recharts';
import { format } from 'date-fns';
import StatCard from '../components/UI/StatCard';
import { DataTable } from '../components/UI/DataTable';
import { Badge, getStatusVariant } from '../components/UI/Badge';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';
import { dashboardAPI } from '../api/client';
import { DashboardStats } from '../types';

export function formatIndianCurrency(n: number): string {
  return n.toLocaleString('en-IN');
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeRange, setActiveRange] = useState('12M');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await dashboardAPI.getStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading || !stats) {
    return <LoadingSpinner text="Loading dashboard..." />;
  }

  const pieColors = ['#0D9488', '#F59E0B', '#2563EB', '#94A3B8'];

  const filteredMonthly = stats.monthly_donations.slice(
    activeRange === '3M' ? -3 : activeRange === '6M' ? -6 : -12
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back, {user?.full_name}</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium bg-green-50 text-green-700 rounded-full px-3 py-1.5">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse-dot" />
          System Online
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-5 gap-5 mb-6">
        <div className="col-span-2 h-full">
          <StatCard 
            title="Total Donations" 
            value={formatIndianCurrency(stats.total_donations_amount)} 
            prefix="₹"
            icon={<IndianRupee size={20}/>} 
            iconBg="bg-brand-primary-light"
            trend="up" trendValue="+12%"
            variant="primary"
          />
        </div>
        <StatCard 
          title="Active Volunteers" 
          value={stats.active_volunteers} 
          icon={<Users size={20}/>} 
          iconBg="bg-blue-50"
          trend="up" trendValue="+3"
        />
        <StatCard 
          title="Children Enrolled" 
          value={stats.children_enrolled} 
          icon={<Baby size={20}/>} 
          iconBg="bg-amber-50"
          trend="up" trendValue="+8"
        />
        <StatCard 
          title="Compliance Score" 
          value={`${stats.compliance_score}%`} 
          icon={<ShieldCheck size={20}/>} 
          iconBg="bg-emerald-50"
        />
      </div>

      <div className="grid grid-cols-5 gap-5 mb-6">
        {/* Fund Breakdown */}
        <div className="col-span-3 card">
          <h2 className="text-sm font-semibold text-brand-text mb-4">Fund Allocation</h2>
          <div className="flex flex-col h-64">
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie 
                  data={stats.fund_breakdown} 
                  innerRadius={60} 
                  outerRadius={80} 
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                  strokeWidth={0}
                >
                  {stats.fund_breakdown.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  formatter={(value: number) => `₹${formatIndianCurrency(value)}`}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontFamily: 'DM Sans, sans-serif', fontSize: '13px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {stats.fund_breakdown.map((item, index) => (
                <div key={index} className="flex items-center gap-2 bg-slate-50 rounded-full px-3 py-1">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: pieColors[index % pieColors.length] }}></div>
                  <span className="text-xs text-brand-muted">{item.name}</span>
                  <span className="text-xs font-semibold text-brand-text">₹{(item.value / 1000).toFixed(0)}k</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="col-span-2 card flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-semibold text-brand-text">Recent Activity</h2>
            <button className="text-xs text-brand-primary font-medium hover:text-brand-primary-hover transition-colors">View all</button>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar max-h-64 space-y-0">
            {stats.recent_activity.map((item, index) => (
              <div key={index} className="flex items-start gap-3 py-3 border-b border-brand-border/50 last:border-0 hover:bg-slate-50 transition-colors px-2 -mx-2 rounded-lg">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                  item.type === 'donation' ? 'bg-brand-primary-light text-brand-primary' : 
                  item.type === 'child' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-500'
                }`}>
                  {item.type === 'donation' ? <IndianRupee size={14}/> : item.type === 'child' ? <Baby size={14}/> : <Activity size={14}/>}
                </div>
                <div>
                  <p className="text-sm text-brand-text">{item.text}</p>
                  <p className="text-xs text-brand-muted mt-0.5">{format(new Date(item.time), 'dd MMM yyyy, HH:mm')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-5 mb-6">
        {/* Monthly Trend */}
        <div className="col-span-3 card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-sm font-semibold text-brand-text">Donation Trends</h2>
            <div className="flex bg-slate-100 rounded-lg p-0.5">
              {['3M', '6M', '12M'].map(range => (
                <button
                  key={range}
                  onClick={() => setActiveRange(range)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all duration-200 ${
                    activeRange === range ? 'bg-white text-brand-text shadow-xs' : 'text-brand-muted hover:text-brand-text'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filteredMonthly} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0D9488" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#0D9488" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B', fontFamily: 'DM Sans' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B', fontFamily: 'DM Sans' }} tickFormatter={(val) => `₹${val/1000}k`} />
                <RechartsTooltip 
                  formatter={(value: number) => [`₹${formatIndianCurrency(value)}`, 'Amount']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontFamily: 'DM Sans, sans-serif', fontSize: '13px' }}
                />
                <Area type="monotone" dataKey="amount" stroke="#0D9488" strokeWidth={2} fillOpacity={1} fill="url(#colorAmount)" activeDot={{ r: 5, stroke: '#0D9488', strokeWidth: 2, fill: '#FFFFFF' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="col-span-2 bg-brand-primary rounded-xl shadow-md p-6">
          <h2 className="text-sm font-semibold text-white/90 mb-5">Quick Actions</h2>
          <div className="flex flex-col gap-3">
            {[
              { title: "Schedule Slot", sub: "Volunteer management", icon: Users, link: "/volunteers" },
              { title: "Record Donation", sub: "Financial tracking", icon: IndianRupee, link: "/donors" },
              { title: "Generate Report", sub: "Compliance docs", icon: FileText, link: "/policies" }
            ].map((action, i) => (
              <div 
                key={i}
                className="flex items-center gap-4 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg transition-all duration-200 cursor-pointer group"
                onClick={() => window.location.href=action.link}
                style={{ animation: `slideInRight 0.3s ${i * 0.08}s cubic-bezier(0.16, 1, 0.3, 1) both` }}
              >
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center shrink-0 text-white group-hover:scale-110 transition-transform duration-200">
                  <action.icon size={18} />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm text-white">{action.title}</h4>
                  <p className="text-xs text-white/60">{action.sub}</p>
                </div>
                <ChevronRight className="text-white/40 group-hover:text-white group-hover:translate-x-0.5 transition-all duration-200" size={18} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Donations Table */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-semibold text-brand-text">Recent Donations</h2>
          <button className="text-xs text-brand-primary font-medium hover:text-brand-primary-hover transition-colors" onClick={() => window.location.href='/donors'}>View all</button>
        </div>
        <DataTable
          data={stats.recent_donations}
          columns={[
            { key: 'donor_name', header: 'Donor', render: (row) => <span className="font-medium text-brand-text">{row.donor_name}</span> },
            { key: 'amount', header: 'Amount', render: (row) => <span className="font-mono font-semibold text-brand-text">₹{formatIndianCurrency(row.amount)}</span> },
            { key: 'project', header: 'Project', render: (row) => <span className="bg-slate-100 text-slate-600 text-xs rounded-full px-2.5 py-0.5 font-medium">{row.project}</span> },
            { key: 'donated_at', header: 'Date', render: (row) => <span className="text-brand-muted">{format(new Date(row.donated_at), 'dd MMM yyyy')}</span> },
            { key: 'action', header: 'Status', render: () => <span className="text-green-600 font-medium flex items-center gap-1 text-xs"><CheckCircle2 size={14}/> Verified</span> }
          ]}
        />
      </div>
    </div>
  );
};

export default Dashboard;
