import { useState, useEffect } from 'react';
import { volunteersAPI, dashboardAPI } from '../../api/client';
import type { LeaderboardEntry, VolunteerStats, DashboardStats } from '../../types';
import { Loader2, Trophy, TrendingUp, Users, Heart, BookOpen, Star } from 'lucide-react';
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
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Hero */}
      <div className="card bg-gradient-to-br from-brand-primary via-blue-600 to-blue-800 p-10 text-white relative overflow-hidden shadow-xl border-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-primary-light/20 rounded-full blur-2xl translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>
        <h1 className="text-3xl font-bold relative z-10">Together, We Make a Difference</h1>
        <p className="text-blue-100 font-medium mt-2 relative z-10 max-w-xl">Every hour you contribute builds a stronger, more resilient community through CareConnect.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10 relative z-10 border-t border-white/20 pt-8">
          <div><p className="text-5xl font-black">{totalVolHours.toFixed(0)}</p><p className="text-blue-200 mt-2 text-sm font-semibold">Total Volunteer Hours</p></div>
          <div><p className="text-5xl font-black">{dash?.children_enrolled || 0}</p><p className="text-blue-200 mt-2 text-sm font-semibold">Children Helped</p></div>
          <div><p className="text-5xl font-black">{leaders.reduce((s, l) => s + l.slots, 0)}</p><p className="text-blue-200 mt-2 text-sm font-semibold">Slots Completed</p></div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="card p-8 bg-white/80 backdrop-blur-md">
        <h2 className="text-2xl font-bold text-brand-dark mb-8 flex items-center gap-3 border-b border-brand-border/50 pb-4">
          <Trophy className="w-6 h-6 text-amber-400" /> Top Volunteers
        </h2>
        {leaders.length >= 3 && (
          <div className="flex justify-center items-end gap-4 md:gap-8 mb-10 border-b border-brand-border/50 pb-10">
            {[leaders[1], leaders[0], leaders[2]].map((l, i) => {
              const place = [2, 1, 3][i];
              const heights = ['h-28', 'h-40', 'h-24'];
              const badges = ['🥈', '👑', '🥉'];
              const colors = ['bg-slate-100', 'bg-gradient-to-t from-brand-primary to-blue-400', 'bg-brand-light'];
              const textColors = ['text-slate-500', 'text-white', 'text-brand-primary'];
              return (
                <div key={place} className="text-center flex flex-col items-center">
                  <div className="text-4xl mb-3 drop-shadow-md">{badges[i]}</div>
                  <div className="w-16 h-16 bg-gradient-to-br from-brand-primary to-blue-500 shadow-lg rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 border-4 border-white">
                    {l.name.charAt(0).toUpperCase()}
                  </div>
                  <p className="text-sm font-bold text-brand-dark truncate max-w-[100px]">{l.name.split(' ')[0]}</p>
                  <p className="text-xs font-semibold text-brand-dark/60 mb-3">{l.hours} Hours</p>
                  <div className={`${colors[i]} ${heights[i]} w-24 rounded-t-xl flex items-end justify-center pb-4 relative overflow-hidden shadow-inner`}>
                    <span className={`text-3xl font-black ${textColors[i]} relative`}>#{place}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {leaders.slice(3).length > 0 && (
          <div className="space-y-3">
            {leaders.slice(3).map(l => (
              <div key={l.rank} className="flex items-center gap-4 p-4 rounded-xl bg-white border border-brand-border/50 hover:shadow-md hover:border-brand-primary/30 transition-all duration-300">
                <span className="text-lg font-bold text-brand-dark/40 w-8 text-center">#{l.rank}</span>
                <div className="w-10 h-10 bg-brand-primary/10 rounded-full flex items-center justify-center text-brand-primary font-bold text-sm">{l.name.charAt(0).toUpperCase()}</div>
                <span className="flex-1 font-semibold text-brand-dark truncate">{l.name}</span>
                <span className="text-sm font-semibold text-brand-dark/60 w-20 text-right">{l.hours} Hrs</span>
                <span className="text-sm font-semibold text-brand-dark/60 w-20 text-right">{l.slots} Slots</span>
                <span className="text-xs px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full font-bold ml-2 whitespace-nowrap">{l.impact_score} PTS</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Program Impact */}
      <h2 className="text-2xl font-bold text-brand-dark pt-4 px-2">Collective Milestones</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { name: 'Shiksha (Education)', icon: BookOpen, stat: `${dash?.children_enrolled || 0} CHLD`, sub: 'Reading level progression', color: 'from-blue-400 to-blue-500' },
          { name: 'Swasthya (Health)', icon: Heart, stat: `${Math.round((dash?.total_donations_amount || 0) / 5000)} CHK`, sub: 'Health services provided', color: 'from-emerald-400 to-emerald-500' },
          { name: 'Aajeevika (Livelihood)', icon: Users, stat: `${Math.round((dash?.total_donations_amount || 0) / 10000)} FAM`, sub: 'Families supported', color: 'from-indigo-400 to-indigo-500' },
          { name: 'Unnati (Growth)', icon: TrendingUp, stat: `${Math.round((dash?.active_volunteers || 0) * 3)} YTH`, sub: 'Skill sessions held', color: 'from-orange-400 to-orange-500' },
        ].map(p => (
          <div key={p.name} className="card p-6 border-transparent bg-white/80 hover:-translate-y-1 transition-all duration-300">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${p.color} shadow-sm flex items-center justify-center mb-5`}><p.icon className="w-6 h-6 text-white" /></div>
            <h3 className="text-sm font-semibold text-brand-dark/70 mb-2 truncate">{p.name}</h3>
            <p className="text-3xl font-bold text-brand-dark leading-none">{p.stat}</p>
            <p className="text-xs font-medium text-brand-dark/50 mt-3 border-t border-brand-border/50 pt-3 line-clamp-1">{p.sub}</p>
          </div>
        ))}
      </div>

      {/* My Contribution */}
      {stats && (
        <div className="card bg-brand-dark p-10 text-white relative overflow-hidden rounded-2xl border-0 shadow-xl mt-4">
          <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-brand-primary/20 rounded-full blur-2xl pointer-events-none"></div>
          <h3 className="text-2xl font-bold border-b border-white/10 pb-4 mb-8 relative z-10 flex items-center gap-2">Your Personal Impact <Star className="w-5 h-5 text-amber-400" /></h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            <div><p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-brand-primary">{stats.total_hours}h</p><p className="text-white/60 font-medium text-sm mt-2">Time Dedicated</p></div>
            <div><p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-emerald-500">{stats.total_bookings}</p><p className="text-white/60 font-medium text-sm mt-2">Activities Joined</p></div>
            <div><p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-indigo-400">{(stats.total_hours / 8).toFixed(1)}</p><p className="text-white/60 font-medium text-sm mt-2">Work Days Given</p></div>
          </div>
        </div>
      )}
    </div>
  );
}
