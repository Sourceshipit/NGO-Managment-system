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
    return <LoadingSpinner text="VERIFYING_DATASTREAM..." />;
  }

  const pieColors = ['#000000', '#F97316', '#475569', '#cbd5e1'];

  const filteredMonthly = stats.monthly_donations.slice(
    activeRange === '3M' ? -3 : activeRange === '6M' ? -6 : -12
  );

  return (
    <div className="font-mono">
      <div className="flex items-end justify-between border-b-2 border-black pb-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-widest text-black">SYS_DASHBOARD</h1>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">AUTH_NODE: {user?.full_name}</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold bg-brand-primary/10 border-2 border-brand-primary px-3 py-1">
          <Activity size={14} className="text-brand-primary" />
          <span className="text-brand-primary uppercase">SYSTEM_ONLINE</span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-5 gap-5 mb-5 relative">
        <div className="col-span-2 h-full">
          <StatCard 
            title="DONATION_VOL" 
            value={formatIndianCurrency(stats.total_donations_amount)} 
            prefix="INR "
            icon={<IndianRupee size={22} className="text-black"/>} 
            iconBg="bg-brand-primary"
            trend="up" trendValue="+12% Δ"
            variant="primary"
          />
        </div>
        <StatCard 
          title="ACTIVE_NODES" 
          value={stats.active_volunteers} 
          icon={<Users size={22} className="text-black"/>} 
          iconBg="bg-slate-200"
          trend="up" trendValue="+3 Δ"
        />
        <StatCard 
          title="ENROLLMENTS" 
          value={stats.children_enrolled} 
          icon={<Baby size={22} className="text-black"/>} 
          iconBg="bg-slate-200"
          trend="up" trendValue="+8 Δ"
        />
        <StatCard 
          title="COMPLIANCE" 
          value={`${stats.compliance_score}%`} 
          icon={<ShieldCheck size={22} className="text-black"/>} 
          iconBg="bg-slate-200"
        />
      </div>

      <div className="grid grid-cols-5 gap-5 mb-5">
        {/* Fund Breakdown */}
        <div className="col-span-3 border-2 border-black bg-white shadow-[8px_8px_0_rgba(0,0,0,0.1)] p-6 relative">
          <h2 className="text-xs font-bold text-black uppercase tracking-widest mb-4 border-b-2 border-black pb-2">[ ALLOCATION_CHART ]</h2>
          <div className="flex flex-col h-64">
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie 
                  data={stats.fund_breakdown} 
                  innerRadius={60} 
                  outerRadius={80} 
                  paddingAngle={2}
                  dataKey="value"
                  stroke="#000"
                  strokeWidth={2}
                >
                  {stats.fund_breakdown.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  formatter={(value: number) => `INR ${formatIndianCurrency(value)}`}
                  contentStyle={{ borderRadius: '0', border: '2px solid black', boxShadow: '4px 4px 0 rgba(0,0,0,1)', fontFamily: 'Space Mono, monospace' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-4 mt-2">
              {stats.fund_breakdown.map((item, index) => (
                <div key={index} className="flex items-center gap-2 border border-black px-2 py-1 bg-slate-50">
                  <div className="w-2 h-2 border border-black" style={{ backgroundColor: pieColors[index % pieColors.length] }}></div>
                  <div className="text-[10px] text-black font-bold uppercase tracking-widest">{item.name}</div>
                  <div className="text-[10px] font-bold text-brand-primary">INR {(item.value / 1000).toFixed(0)}k</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="col-span-2 flex flex-col border-2 border-black bg-white shadow-[8px_8px_0_rgba(0,0,0,0.1)] p-6">
          <div className="flex justify-between items-center mb-4 border-b-2 border-black pb-2">
            <h2 className="text-xs font-bold text-black uppercase tracking-widest">[ EVENT_LOG ]</h2>
            <button className="text-[10px] font-bold text-black hover:text-white hover:bg-black border border-transparent hover:border-black transition-colors uppercase tracking-widest px-1">VIEW_ALL</button>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 no-scrollbar max-h-64 space-y-0 text-xs">
            {stats.recent_activity.map((item, index) => (
              <div key={index} className="flex items-start gap-3 py-3 border-b border-black/10 last:border-0 relative hover:bg-brand-primary/10 transition-colors px-2 -mx-2">
                <div className={`w-2 h-2 border border-black mt-1 shrink-0 ${
                  item.type === 'donation' ? 'bg-brand-primary' : 
                  item.type === 'child' ? 'bg-black' : 'bg-slate-300'
                }`}></div>
                <div>
                  <p className="font-bold text-black uppercase tracking-widest">{item.text}</p>
                  <p className="text-[9px] text-slate-500 mt-1 uppercase tracking-widest">{format(new Date(item.time), 'dd MMM yyyy, HH:mm')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-5 mb-5">
        {/* Monthly Trend */}
        <div className="col-span-3 border-2 border-black bg-white shadow-[8px_8px_0_rgba(0,0,0,0.1)] p-6">
          <div className="flex justify-between items-center mb-6 border-b-2 border-black pb-2">
            <h2 className="text-xs font-bold text-black uppercase tracking-widest">[ VALUE_METRICS ]</h2>
            <div className="flex border-2 border-black bg-slate-50">
              {['3M', '6M', '12M'].map(range => (
                <button
                  key={range}
                  onClick={() => setActiveRange(range)}
                  className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest transition-all ${
                    activeRange === range ? 'bg-black text-brand-primary' : 'text-black hover:bg-slate-200'
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
                    <stop offset="5%" stopColor="#000000" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#000000" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" axisLine={{ stroke: '#000', strokeWidth: 2 }} tickLine={false} tick={{ fontSize: 10, fill: '#000', fontFamily: 'Space Mono' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#000', fontFamily: 'Space Mono' }} tickFormatter={(val) => `INR ${val/1000}k`} />
                <RechartsTooltip 
                  formatter={(value: number) => [`INR ${formatIndianCurrency(value)}`, 'VOLUME']}
                  contentStyle={{ borderRadius: '0', border: '2px solid black', boxShadow: '4px 4px 0 rgba(0,0,0,1)', fontFamily: 'Space Mono, monospace' }}
                />
                <Area type="step" dataKey="amount" stroke="#000" strokeWidth={2} fillOpacity={1} fill="url(#colorAmount)" activeDot={{ r: 4, stroke: '#000', strokeWidth: 2, fill: '#F97316' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="col-span-2 border-2 border-black bg-brand-primary shadow-[8px_8px_0_rgba(0,0,0,0.1)] p-6">
          <h2 className="text-xs font-bold text-black uppercase tracking-widest mb-6 border-b-2 border-black pb-2">[ QUICK_INIT ]</h2>
          <div className="flex flex-col gap-3">
            {[
              { title: "INIT_SLOT", sub: "VOLUNTEER OP", icon: Users, link: "/volunteers" },
              { title: "RECORD_TX", sub: "DONATION LOG", icon: IndianRupee, link: "/donors" },
              { title: "GEN_REPORT", sub: "COMPLIANCE DOC", icon: FileText, link: "/policies" }
            ].map((action, i) => (
              <div 
                key={i}
                className="flex items-center gap-4 p-3 border-2 border-black bg-white hover:bg-black hover:text-brand-primary transition-all cursor-pointer group"
                onClick={() => window.location.href=action.link}
                style={{ animation: `slideInRight 0.3s ${i * 0.08}s cubic-bezier(0.16, 1, 0.3, 1) both` }}
              >
                <div className="w-10 h-10 border-2 border-black bg-slate-100 text-black flex items-center justify-center shrink-0 group-hover:bg-brand-primary transform transition-transform group-hover:scale-110">
                  <action.icon size={18} />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-xs uppercase tracking-widest group-hover:text-white">{action.title}</h4>
                  <p className="text-[9px] text-slate-500 uppercase tracking-widest group-hover:text-brand-primary">{action.sub}</p>
                </div>
                <ChevronRight className="text-black group-hover:text-brand-primary" size={20} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Donations Table */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xs font-bold text-black uppercase tracking-widest border-b-2 border-black pb-1">[ TX_LEDGER ]</h2>
          <button className="text-[10px] font-bold text-brand-primary hover:text-black bg-black hover:bg-white border-2 border-black px-2 py-1 transition-colors uppercase tracking-widest" onClick={() => window.location.href='/donors'}>VIEW_ALL</button>
        </div>
        <DataTable
          data={stats.recent_donations}
          columns={[
            { key: 'donor_name', header: 'ENTITY', render: (row) => <span className="font-bold">{row.donor_name}</span> },
            { key: 'amount', header: 'VAL', render: (row) => <span className="font-bold">INR {formatIndianCurrency(row.amount)}</span> },
            { key: 'project', header: 'DESTINATION', render: (row) => <span className="bg-slate-200 border text-black border-black text-[9px] px-1 font-bold">{row.project}</span> },
            { key: 'donated_at', header: 'TIMESTAMP', render: (row) => <span>{format(new Date(row.donated_at), 'dd MMM yyyy')}</span> },
            { key: 'action', header: 'STATUS', render: () => <span className="text-brand-primary font-bold flex items-center gap-1 text-[10px]"><CheckCircle2 size={12}/> VERIFIED</span> }
          ]}
        />
      </div>
    </div>
  );
};

export default Dashboard;
