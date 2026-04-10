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
    <div className={`rounded-xl p-5 h-full flex flex-col justify-between group transition-all duration-300 stagger-item ${
      isPrimary
        ? 'bg-brand-primary text-white shadow-md hover:shadow-lg hover:-translate-y-1'
        : 'bg-white border border-brand-border shadow-card hover:shadow-card-hover hover:-translate-y-1'
    }`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-transform duration-200 group-hover:scale-110 ${
          isPrimary
            ? 'bg-white/20 text-white'
            : `${iconBg} text-brand-text`
        }`}>
          {icon}
        </div>
        {trend && trendValue && (
          <div className={`flex items-center gap-1 text-xs font-medium rounded-full px-2 py-0.5 ${
            trend === 'up'
              ? isPrimary ? 'bg-white/20 text-white' : 'bg-green-50 text-green-600'
              : isPrimary ? 'bg-white/20 text-white' : 'bg-red-50 text-red-600'
          }`}>
            {trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            <span>{trendValue}</span>
          </div>
        )}
      </div>
      <div>
        <div className={`font-semibold flex items-baseline gap-1 ${
          isPrimary ? 'text-3xl text-white' : 'text-2xl text-brand-text'
        }`}>
          {prefix && <span className={`text-lg ${isPrimary ? 'text-white/70' : 'text-brand-muted'}`}>{prefix}</span>}
          <span className="font-mono">{value}</span>
        </div>
        <h3 className={`text-sm mt-1.5 ${
          isPrimary ? 'text-white/80' : 'text-brand-muted'
        }`}>{title}</h3>
      </div>
    </div>
  );
};

export default StatCard;
