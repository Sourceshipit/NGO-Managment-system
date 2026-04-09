import React from 'react';
import { motion } from 'framer-motion';

interface ComplianceGaugeProps {
  score: number;   // 0-100
  size?: number;   // px diameter (default 120)
  label?: string;
}

/**
 * SVG radial gauge for compliance score.
 * Color-coded: green ≥80%, orange 50-79%, red <50%.
 * Animated arc via Framer Motion pathLength.
 */
const ComplianceGauge: React.FC<ComplianceGaugeProps> = ({ score, size = 120, label = 'COMPLIANCE' }) => {
  const normalizedScore = Math.max(0, Math.min(100, score));
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  const getColor = () => {
    if (normalizedScore >= 80) return '#22C55E';
    if (normalizedScore >= 50) return '#F59E0B';
    return '#EF4444';
  };

  const getBgColor = () => {
    if (normalizedScore >= 80) return 'rgba(34,197,94,0.1)';
    if (normalizedScore >= 50) return 'rgba(245,158,11,0.1)';
    return 'rgba(239,68,68,0.1)';
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Background track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#E2E8F0"
            strokeWidth="6"
          />
          {/* Animated foreground arc */}
          <motion.circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={getColor()}
            strokeWidth="6"
            strokeLinecap="butt"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference * (1 - normalizedScore / 100) }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        </svg>
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div
            className="w-16 h-16 flex items-center justify-center border-2 border-black font-mono"
            style={{ backgroundColor: getBgColor() }}
          >
            <span className="text-lg font-bold text-black">{normalizedScore}%</span>
          </div>
        </div>
      </div>
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
        {label}
      </span>
    </div>
  );
};

export default ComplianceGauge;
