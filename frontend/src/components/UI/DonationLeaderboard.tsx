import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Award } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

interface LeaderboardEntry {
  id: number;
  full_name: string;
  total_donated: number;
  pan_number?: string;
  is_verified?: boolean;
}

interface DonationLeaderboardProps {
  donors: LeaderboardEntry[];
  maxItems?: number;
}

const RANK_STYLES: Record<number, { bg: string; border: string; icon: any; badge: string }> = {
  0: { bg: 'bg-amber-50', border: 'border-amber-400', icon: Trophy, badge: 'bg-amber-400 text-black' },
  1: { bg: 'bg-slate-50', border: 'border-slate-400', icon: Award,  badge: 'bg-slate-400 text-white' },
  2: { bg: 'bg-orange-50', border: 'border-orange-400', icon: Award, badge: 'bg-orange-400 text-white' },
};

const DEFAULT_STYLE = { bg: 'bg-white', border: 'border-black', icon: TrendingUp, badge: 'bg-slate-200 text-black' };

const DonationLeaderboard: React.FC<DonationLeaderboardProps> = ({ donors, maxItems = 10 }) => {
  const sorted = [...donors]
    .sort((a, b) => b.total_donated - a.total_donated)
    .slice(0, maxItems);

  const maxDonation = sorted[0]?.total_donated || 1;

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-amber-400 border-2 border-black flex items-center justify-center shadow-[2px_2px_0_rgba(0,0,0,1)]">
            <Trophy size={14} className="text-black" />
          </div>
          <h3 className="text-[10px] font-bold text-black uppercase tracking-[0.2em] font-mono">
            DONOR_LEADERBOARD
          </h3>
        </div>
        <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">
          TOP {sorted.length}
        </span>
      </div>

      {/* Entries */}
      {sorted.map((donor, index) => {
        const style = RANK_STYLES[index] || DEFAULT_STYLE;
        const Icon = style.icon;
        const barWidth = (donor.total_donated / maxDonation) * 100;

        return (
          <motion.div
            key={donor.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.06, duration: 0.3 }}
            className={`relative border-2 ${style.border} ${style.bg} p-3 group hover:shadow-[3px_3px_0_rgba(0,0,0,0.15)] transition-shadow`}
          >
            {/* Progress bar background */}
            <div
              className="absolute inset-0 bg-black/[0.03] transition-all duration-500"
              style={{ width: `${barWidth}%` }}
            />

            <div className="relative flex items-center gap-3">
              {/* Rank badge */}
              <div className={`w-7 h-7 ${style.badge} border border-black flex items-center justify-center shrink-0`}>
                <span className="text-[10px] font-bold font-mono">
                  {index < 3 ? <Icon size={12} /> : `#${index + 1}`}
                </span>
              </div>

              {/* Name */}
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold font-mono text-black uppercase tracking-wider truncate">
                  {donor.full_name}
                </p>
                {donor.pan_number && (
                  <p className="text-[8px] font-mono text-slate-400 tracking-widest">
                    PAN: {donor.pan_number}
                  </p>
                )}
              </div>

              {/* Amount */}
              <div className="text-right shrink-0">
                <p className="text-xs font-bold font-mono text-black">
                  {formatCurrency(donor.total_donated)}
                </p>
              </div>
            </div>
          </motion.div>
        );
      })}

      {sorted.length === 0 && (
        <div className="border-2 border-dashed border-slate-300 p-8 text-center">
          <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
            NO_DONOR_DATA_AVAILABLE
          </p>
        </div>
      )}
    </div>
  );
};

export default DonationLeaderboard;
