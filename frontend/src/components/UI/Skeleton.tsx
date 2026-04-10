import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
}

/**
 * Skeleton loader — pulsing rounded block for loading states.
 */
export const Skeleton: React.FC<SkeletonProps> = ({ className = '', width, height }) => (
  <div
    className={`bg-slate-100 animate-pulse rounded-md ${className}`}
    style={{ width, height }}
  />
);

/** Skeleton for StatCard component */
export const SkeletonStatCard: React.FC = () => (
  <div className="bg-white border border-brand-border rounded-xl p-5 space-y-4">
    <div className="flex justify-between items-start">
      <Skeleton className="w-10 h-10 rounded-lg" />
      <Skeleton className="w-14 h-5 rounded-full" />
    </div>
    <div className="space-y-2">
      <Skeleton className="w-20 h-7" />
      <Skeleton className="w-28 h-3" />
    </div>
  </div>
);

/** Skeleton for a single table row */
export const SkeletonTableRow: React.FC<{ columns?: number }> = ({ columns = 5 }) => (
  <tr className="border-b border-brand-border">
    {Array.from({ length: columns }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <Skeleton className="h-4" width={i === 0 ? '60%' : '80%'} />
      </td>
    ))}
  </tr>
);

/** Skeleton for a full table */
export const SkeletonTable: React.FC<{ rows?: number; columns?: number }> = ({ rows = 5, columns = 5 }) => (
  <div className="border border-brand-border rounded-xl bg-white overflow-hidden">
    <div className="border-b border-brand-border bg-slate-50 px-4 py-3 flex gap-4">
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
  <div className="bg-white border border-brand-border rounded-xl p-6 space-y-4">
    <Skeleton className="w-3/4 h-4" />
    <Skeleton className="w-full h-3" />
    <Skeleton className="w-5/6 h-3" />
    <div className="flex gap-2 pt-2">
      <Skeleton className="w-16 h-7 rounded-lg" />
      <Skeleton className="w-16 h-7 rounded-lg" />
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
