import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Clock, Users, Heart, Baby, Zap } from 'lucide-react';
import { useCountUp } from '../../hooks/useCountUp';

interface ImpactMetric {
  label: string;
  value: number;
  icon: any;
  suffix?: string;
  color: string;
  bgColor: string;
}

interface ImpactDashboardProps {
  totalDonations: number;
  totalVolunteerHours: number;
  totalChildren: number;
  totalVolunteers: number;
  totalDonors: number;
  lastActivityTimestamp?: string;
}

/** Animated radial progress ring */
const ProgressRing: React.FC<{ progress: number; color: string; size?: number }> = ({
  progress,
  color,
  size = 80,
}) => {
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="rgba(0,0,0,0.08)"
        strokeWidth={strokeWidth}
        fill="none"
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="butt"
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
        style={{ strokeDasharray: circumference }}
      />
    </svg>
  );
};

/** Live "hours since last activity" counter */
const HoursSinceCounter: React.FC<{ timestamp?: string }> = ({ timestamp }) => {
  const [hoursSince, setHoursSince] = useState(0);

  useEffect(() => {
    if (!timestamp) return;

    const update = () => {
      const diff = Date.now() - new Date(timestamp).getTime();
      setHoursSince(Math.max(0, diff / (1000 * 60 * 60)));
    };

    update();
    const interval = setInterval(update, 60_000); // update every minute
    return () => clearInterval(interval);
  }, [timestamp]);

  const hours = Math.floor(hoursSince);
  const minutes = Math.floor((hoursSince - hours) * 60);

  return (
    <div className="border-2 border-black bg-black p-4 text-center">
      <div className="flex items-center justify-center gap-1 mb-2">
        <Clock size={12} className="text-brand-primary" />
        <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400">
          SINCE_LAST_ACTIVITY
        </span>
      </div>
      <div className="font-mono text-2xl font-bold text-white tracking-widest">
        <span className="text-brand-primary">{String(hours).padStart(2, '0')}</span>
        <span className="text-slate-500 animate-pulse-dot">:</span>
        <span className="text-brand-primary">{String(minutes).padStart(2, '0')}</span>
      </div>
      <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">HRS : MIN</span>
    </div>
  );
};

const ImpactDashboard: React.FC<ImpactDashboardProps> = ({
  totalDonations,
  totalVolunteerHours,
  totalChildren,
  totalVolunteers,
  totalDonors,
  lastActivityTimestamp,
}) => {
  const metrics: ImpactMetric[] = [
    { label: 'DONATION_VOL', value: totalDonations, icon: Heart, suffix: 'INR', color: '#EC4899', bgColor: 'bg-pink-500' },
    { label: 'VOL_HOURS', value: totalVolunteerHours, icon: Clock, suffix: 'hrs', color: '#3B82F6', bgColor: 'bg-blue-500' },
    { label: 'CHILDREN', value: totalChildren, icon: Baby, color: '#22C55E', bgColor: 'bg-emerald-500' },
    { label: 'VOLUNTEERS', value: totalVolunteers, icon: Users, color: '#F59E0B', bgColor: 'bg-amber-500' },
    { label: 'DONORS', value: totalDonors, icon: Zap, color: '#8B5CF6', bgColor: 'bg-violet-500' },
  ];

  // Calculate an "impact score" as a percentage (arbitrary formula)
  const impactScore = Math.min(
    100,
    Math.round(
      (totalVolunteerHours / 500) * 25 +
      (totalChildren / 20) * 25 +
      (totalDonations / 200000) * 25 +
      (totalDonors / 10) * 25
    )
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-brand-primary border-2 border-black flex items-center justify-center shadow-brutal-sm">
          <TrendingUp size={14} className="text-white" />
        </div>
        <h2 className="text-[10px] font-bold text-black uppercase tracking-[0.2em] font-mono">
          IMPACT_DASHBOARD
        </h2>
      </div>

      {/* Impact score ring + hours since */}
      <div className="grid grid-cols-2 gap-4">
        <div className="border-2 border-black p-4 flex flex-col items-center justify-center bg-white">
          <div className="relative">
            <ProgressRing progress={impactScore} color="#F97316" size={90} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold font-mono text-black">{impactScore}</span>
              <span className="text-[7px] font-mono text-slate-400 uppercase tracking-widest">SCORE</span>
            </div>
          </div>
          <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest mt-2">
            IMPACT_INDEX
          </span>
        </div>

        <HoursSinceCounter timestamp={lastActivityTimestamp} />
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 gap-2">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.08 }}
              className="border-2 border-black bg-white p-3 flex items-center gap-3 group hover:shadow-brutal-sm transition-shadow"
            >
              <div className={`w-9 h-9 ${metric.bgColor} border-2 border-black flex items-center justify-center shrink-0`}>
                <Icon size={14} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[8px] font-mono text-slate-400 uppercase tracking-widest">
                  {metric.label}
                </p>
                <p className="text-sm font-bold font-mono text-black">
                  {metric.suffix === 'INR' ? 'INR ' : ''}
                  <AnimatedValue value={metric.value} />
                  {metric.suffix && metric.suffix !== 'INR' ? ` ${metric.suffix}` : ''}
                </p>
              </div>
              {/* Mini bar */}
              <div className="w-16 h-1.5 bg-slate-100 border border-black overflow-hidden shrink-0">
                <motion.div
                  className="h-full"
                  style={{ backgroundColor: metric.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (metric.value / (metrics[0]?.value || 1)) * 100)}%` }}
                  transition={{ duration: 1, delay: index * 0.1 }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

/** Small wrapper for count-up in each metric */
const AnimatedValue: React.FC<{ value: number }> = ({ value }) => {
  const display = useCountUp(value, 1000);
  return <>{display}</>;
};

export default ImpactDashboard;
