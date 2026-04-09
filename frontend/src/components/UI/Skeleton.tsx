import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
}

/**
 * Brutalist skeleton loader — pulsing block with black border, no radius, shimmer animation.
 */
export const Skeleton: React.FC<SkeletonProps> = ({ className = '', width, height }) => (
  <div
    className={`bg-slate-200 animate-pulse border border-slate-300 ${className}`}
    style={{ width, height }}
  />
);

/** Skeleton for StatCard component */
export const SkeletonStatCard: React.FC = () => (
  <div className="bg-white border border-brand-border p-6 space-y-4">
    <div className="flex justify-between items-start">
      <Skeleton className="w-12 h-12" />
      <Skeleton className="w-16 h-4" />
    </div>
    <div className="space-y-2">
      <Skeleton className="w-24 h-8" />
      <Skeleton className="w-32 h-3" />
    </div>
  </div>
);

/** Skeleton for a single table row */
export const SkeletonTableRow: React.FC<{ columns?: number }> = ({ columns = 5 }) => (
  <tr className="border-b border-black/10">
    {Array.from({ length: columns }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <Skeleton className="h-4" width={i === 0 ? '60%' : '80%'} />
      </td>
    ))}
  </tr>
);

/** Skeleton for a full table */
export const SkeletonTable: React.FC<{ rows?: number; columns?: number }> = ({ rows = 5, columns = 5 }) => (
  <div className="border-2 border-black bg-white overflow-hidden">
    <div className="border-b-2 border-black bg-slate-50 px-4 py-3 flex gap-4">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className="h-3 flex-1" />
      ))}
    </div>
    <table className="w-full">
      <tbody>
        {Array.from({ length: rows }).map((_, i) => (
          <SkeletonTableRow key={i} columns={columns} />
        ))}
      </tbody>
    </table>
  </div>
);

/** Skeleton for a generic card */
export const SkeletonCard: React.FC = () => (
  <div className="bg-white border-2 border-black p-6 space-y-4">
    <Skeleton className="w-3/4 h-4" />
    <Skeleton className="w-full h-3" />
    <Skeleton className="w-5/6 h-3" />
    <div className="flex gap-2 pt-2">
      <Skeleton className="w-16 h-6" />
      <Skeleton className="w-16 h-6" />
    </div>
  </div>
);

/** Skeleton for a dashboard page with stat cards + table */
export const SkeletonDashboard: React.FC = () => (
  <div className="space-y-8 p-8">
    <Skeleton className="w-48 h-6" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonStatCard key={i} />
      ))}
    </div>
    <SkeletonTable rows={6} columns={5} />
  </div>
);

export default Skeleton;
