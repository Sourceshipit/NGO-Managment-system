import React, { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  iconBg: string;
  trend?: 'up' | 'down';
  trendValue?: string;
  prefix?: string;
  variant?: 'default' | 'primary';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, iconBg, trend, trendValue, prefix, variant = 'default' }) => {
  const isPrimary = variant === 'primary';

  return (
    <div className={`rounded-none p-6 shadow-none h-full flex flex-col justify-between group transition-colors relative overflow-hidden ${
      isPrimary
        ? 'bg-black border-2 border-black hover:border-brand-primary'
        : 'bg-brand-card border border-brand-border hover:border-brand-text'
    }`}>
      {/* Decorative scanline on hover */}
      <div className={`absolute inset-x-0 top-0 h-[2px] -translate-x-full group-hover:translate-x-0 transition-transform duration-700 ease-out z-10 ${
        isPrimary ? 'bg-brand-primary' : 'bg-brand-primary'
      }`} />
      
      <div className="flex justify-between items-start mb-4 relative z-20">
        <div className={`w-12 h-12 rounded-none border flex items-center justify-center ${
          isPrimary
            ? 'border-brand-primary/30 bg-brand-primary text-black'
            : `border-white/20 text-white ${iconBg} shadow-none`
        }`}>
          {icon}
        </div>
        {trend && trendValue && (
          <div className="flex flex-col items-end">
             <div className={`flex items-center gap-1 text-xs font-mono tracking-tight uppercase ${
               trend === 'up'
                 ? isPrimary ? 'text-green-400' : 'text-green-600'
                 : isPrimary ? 'text-red-400' : 'text-red-600'
             }`}>
                {trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                <span>{trendValue}</span>
             </div>
          </div>
        )}
      </div>
      <div className="relative z-20">
        <div className={`font-mono tracking-tight font-bold flex items-baseline gap-1 ${
          isPrimary ? 'text-4xl text-white' : 'text-3xl text-brand-text'
        }`}>
          {prefix && <span className={`text-xl ${isPrimary ? 'text-brand-primary' : 'text-brand-muted'}`}>{prefix}</span>}
          {value}
        </div>
        <h3 className={`text-[11px] font-mono uppercase tracking-widest mt-2 block ${
          isPrimary ? 'text-brand-primary' : 'text-brand-muted'
        }`}>{title}</h3>
      </div>
      
      {/* Decorative dot matrix in corner */}
      <div className={`absolute -bottom-2 -right-2 transition-opacity pointer-events-none ${
        isPrimary ? 'opacity-10 group-hover:opacity-20' : 'opacity-[0.03] group-hover:opacity-10'
      }`}>
        <svg width="40" height="40" viewBox="0 0 40 40">
          <pattern id={`dots-${isPrimary ? 'primary' : 'default'}`} x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.5" fill={isPrimary ? '#F97316' : 'currentColor'} />
          </pattern>
          <rect width="40" height="40" fill={`url(#dots-${isPrimary ? 'primary' : 'default'})`} />
        </svg>
      </div>
    </div>
  );
};

export default StatCard;
