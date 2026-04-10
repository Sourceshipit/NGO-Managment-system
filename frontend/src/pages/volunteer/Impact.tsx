import { useState, useEffect } from 'react';
import { volunteersAPI, dashboardAPI } from '../../api/client';
import type { LeaderboardEntry, VolunteerStats, DashboardStats } from '../../types';
import { Loader2, Trophy, TrendingUp, Users, Heart, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';

export default function VolunteerImpact() {
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [stats, setStats] = useState<VolunteerStats | null>(null);
  const [dash, setDash] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      volunteersAPI.getLeaderboard(),
      volunteersAPI.getMyStats(),
      dashboardAPI.getStats()
    ]).then(([l, s, d]) => { setLeaders(l); setStats(s); setDash(d); })
    .catch(() => toast.error('Failed to load'))
    .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-brand-primary" /></div>;

  const totalVolHours = leaders.reduce((s, l) => s + l.hours, 0);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Hero */}
      <div className="card bg-blue-600 p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdHRoIGQ9Ik0wIDBoMjB2MjBIMHoiIGZpbGw9Im5vbmUiLz48cGF0aCBkPSJNMCAwdjIwTDIwIDB6IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiLz48L3N2Zz4=')] opacity-20"></div>
        <h1 className="text-3xl font-black uppercase tracking-widest relative">Together, We Make a Difference</h1>
        <div className="grid grid-cols-3 gap-8 mt-8 relative border-t-2 border-white/30 pt-8">
          <div><p className="text-5xl font-black font-mono">{totalVolHours.toFixed(0)}</p><p className="font-mono text-blue-200 mt-2 text-sm uppercase font-bold">Total Volunteer Hours</p></div>
          <div><p className="text-5xl font-black font-mono">{dash?.children_enrolled || 0}</p><p className="font-mono text-blue-200 mt-2 text-sm uppercase font-bold">Children Helped</p></div>
          <div><p className="text-5xl font-black font-mono">{leaders.reduce((s, l) => s + l.slots, 0)}</p><p className="font-mono text-blue-200 mt-2 text-sm uppercase font-bold">Slots Completed</p></div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="card p-6">
        <h2 className="text-xl font-black uppercase tracking-widest text-black mb-6 flex items-center gap-3 border-b border-brand-border pb-4">
          <Trophy className="w-6 h-6 text-amber-400" /> Top Volunteers
        </h2>
        {leaders.length >= 3 && (
          <div className="flex justify-center items-end gap-6 mb-8 mt-8 border-b border-brand-border pb-8">
            {[leaders[1], leaders[0], leaders[2]].map((l, i) => {
              const place = [2, 1, 3][i];
              const heights = ['h-24', 'h-32', 'h-20'];
              const badges = ['🥈', '👑', '🥉'];
              const colors = ['bg-slate-200', 'bg-blue-400', 'bg-blue-200'];
              return (
                <div key={place} className="text-center flex flex-col items-center">
                  <div className="text-3xl mb-2">{badges[i]}</div>
                  <div className="w-14 h-14 bg-black border border-brand-border flex items-center justify-center text-white font-bold font-mono text-2xl mx-auto mb-3">
                    {l.name.charAt(0).toUpperCase()}
                  </div>
                  <p className="text-sm font-bold text-black uppercase tracking-wide truncate max-w-[80px]">{l.name.split(' ')[0]}</p>
                  <p className="font-mono text-sm font-bold text-slate-600 mb-2">{l.hours}H</p>
                  <div className={`${colors[i]} ${heights[i]} w-24 border border-brand-border border-b-0 flex items-end justify-center pb-2 relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNCIgaGVpZ2h0PSI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9Im5vbmUiLz48Y2lyY2xlIGN4PSIyIiBjeT0iMiIgcj0iMSIgZmlsbD0icmdiYSgwLDAsMCwwLjEpIi8+PC9zdmc+')]"></div>
                    <span className="text-2xl font-black font-mono text-black relative">#{place}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {leaders.slice(3).length > 0 && (
          <div className="space-y-3">
            {leaders.slice(3).map(l => (
              <div key={l.rank} className="flex items-center gap-4 p-3 bg-white border border-brand-border hover:-translate-y-0.5 hover:shadow-sm transition-all">
                <span className="text-lg font-black font-mono text-black w-8 text-center">#{l.rank}</span>
                <div className="w-8 h-8 bg-black flex items-center justify-center text-white text-xs font-bold font-mono">{l.name.charAt(0).toUpperCase()}</div>
                <span className="flex-1 font-bold text-black uppercase tracking-wide truncate">{l.name}</span>
                <span className="font-mono text-sm font-bold text-slate-600 w-16 text-right">{l.hours}H</span>
                <span className="font-mono text-sm font-bold text-slate-600 w-24 text-right">{l.slots} SLOTS</span>
                <span className="text-xs px-2 py-1 bg-blue-100 border border-brand-border text-black font-bold font-mono whitespace-nowrap">{l.impact_score} PTS</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Program Impact */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { name: 'Shiksha (Edu)', icon: BookOpen, stat: `${dash?.children_enrolled || 0} CHLD`, sub: 'Reading level up', color: 'bg-blue-400' },
          { name: 'Swasthya (Health)', icon: Heart, stat: `${Math.round((dash?.total_donations_amount || 0) / 5000)} CHK`, sub: 'Health services', color: 'bg-green-400' },
          { name: 'Aajeevika (Life)', icon: Users, stat: `${Math.round((dash?.total_donations_amount || 0) / 10000)} FAM`, sub: 'Livelihood workshops', color: 'bg-purple-400' },
          { name: 'Unnati (Growth)', icon: TrendingUp, stat: `${Math.round((dash?.active_volunteers || 0) * 3)} YTH`, sub: 'Skill sessions', color: 'bg-rose-400' },
        ].map(p => (
          <div key={p.name} className="card p-5">
            <div className={`w-12 h-12 border border-brand-border ${p.color} flex items-center justify-center mb-4`}><p.icon className="w-6 h-6 text-black" /></div>
            <h3 className="text-sm font-bold text-black uppercase mb-2 line-clamp-1">{p.name}</h3>
            <p className="text-xl font-black font-mono text-black">{p.stat}</p>
            <p className="text-xs font-mono text-slate-600 mt-2 border-t-2 border-slate-100 pt-2 truncate">{p.sub}</p>
          </div>
        ))}
      </div>

      {/* My Contribution */}
      {stats && (
        <div className="card bg-black p-8 text-white relative">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdHRoIGQ9Ik0wIDBoMjB2MjBIMHoiIGZpbGw9Im5vbmUiLz48cGF0aCBkPSJNMCAwdjIwTDIwIDB6IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMikiLz48L3N2Zz4=')] opacity-10"></div>
          <h3 className="text-xl font-black uppercase tracking-widest border-b-2 border-white/20 pb-4 mb-6 relative">Your Personal Impact</h3>
          <div className="flex gap-12 relative">
            <div><p className="text-4xl font-black font-mono text-blue-400">{stats.total_hours}H</p><p className="font-mono text-slate-400 text-sm mt-1 uppercase">Of your time</p></div>
            <div><p className="text-4xl font-black font-mono text-blue-400">{stats.total_bookings}</p><p className="font-mono text-slate-400 text-sm mt-1 uppercase">Activities joined</p></div>
            <div><p className="text-4xl font-black font-mono text-blue-400">{(stats.total_hours / 8).toFixed(1)}</p><p className="font-mono text-slate-400 text-sm mt-1 uppercase">Work days given</p></div>
          </div>
        </div>
      )}
    </div>
  );
}
