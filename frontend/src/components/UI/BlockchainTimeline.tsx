import React from 'react';
import { motion } from 'framer-motion';
import { Link, ShieldCheck, AlertTriangle, FileText, Users, Heart, Baby, Briefcase } from 'lucide-react';
import { formatRelative, formatDateTime } from '../../utils/formatters';

interface TimelineEntry {
  id: number;
  tx_hash: string;
  record_type: string;
  data_summary: string;
  timestamp: string;
  previous_hash: string;
}

interface BlockchainTimelineProps {
  entries: TimelineEntry[];
}

const TYPE_CONFIG: Record<string, { icon: any; color: string; bg: string }> = {
  DONATION:       { icon: Heart,       color: 'text-pink-500',    bg: 'bg-pink-500' },
  CHILD_ENROLLED: { icon: Baby,        color: 'text-emerald-500', bg: 'bg-emerald-500' },
  CHILD_REMOVED:  { icon: Baby,        color: 'text-red-500',     bg: 'bg-red-500' },
  COMPLIANCE:     { icon: ShieldCheck,  color: 'text-blue-500',    bg: 'bg-blue-500' },
  EMPLOYEE:       { icon: Briefcase,    color: 'text-amber-500',   bg: 'bg-amber-500' },
  USER_TOGGLE:    { icon: Users,        color: 'text-violet-500',  bg: 'bg-violet-500' },
  LEAVE_DECISION: { icon: FileText,     color: 'text-cyan-500',    bg: 'bg-cyan-500' },
  SLOT_CREATED:   { icon: Users,        color: 'text-orange-500',  bg: 'bg-orange-500' },
};

const DEFAULT_CONFIG = { icon: Link, color: 'text-slate-500', bg: 'bg-slate-500' };

const BlockchainTimeline: React.FC<BlockchainTimelineProps> = ({ entries }) => {
  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-black/10" />

      <div className="space-y-0">
        {entries.map((entry, index) => {
          const config = TYPE_CONFIG[entry.record_type] || DEFAULT_CONFIG;
          const Icon = config.icon;

          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              className="relative flex gap-4 py-4 group"
            >
              {/* Node dot */}
              <div className={`relative z-10 w-12 h-12 shrink-0 border-2 border-black flex items-center justify-center ${config.bg} shadow-[3px_3px_0_rgba(0,0,0,1)]`}>
                <Icon size={18} className="text-white" />
              </div>

              {/* Content card */}
              <div className="flex-1 border-2 border-black bg-white p-4 group-hover:shadow-[4px_4px_0_rgba(0,0,0,0.15)] transition-shadow">
                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                  <span className="text-[10px] font-bold text-black uppercase tracking-widest font-mono bg-slate-100 border border-black px-2 py-0.5">
                    {entry.record_type}
                  </span>
                  <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">
                    {formatRelative(entry.timestamp)}
                  </span>
                </div>

                {/* Summary */}
                <p className="text-xs font-mono text-slate-700 mb-3 leading-relaxed">
                  {entry.data_summary}
                </p>

                {/* Hash footer */}
                <div className="flex items-center gap-2 text-[9px] font-mono text-slate-400 border-t border-dashed border-slate-200 pt-2">
                  <Link size={10} className="shrink-0" />
                  <span className="truncate" title={entry.tx_hash}>
                    TX: {entry.tx_hash.slice(0, 16)}...{entry.tx_hash.slice(-8)}
                  </span>
                </div>

                {/* Full date on hover */}
                <div className="text-[9px] font-mono text-slate-300 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {formatDateTime(entry.timestamp)}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default BlockchainTimeline;
