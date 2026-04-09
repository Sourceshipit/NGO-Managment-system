import React, { ReactNode } from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Brutalist empty-state card. Shows when a list or dashboard section has no data.
 */
const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action
}) => (
  <div className="flex flex-col items-center justify-center py-16 px-8 border-2 border-dashed border-black/20 bg-white">
    <div className="w-16 h-16 border-2 border-black bg-slate-100 flex items-center justify-center mb-6">
      {icon || <Inbox size={28} className="text-slate-400" />}
    </div>
    <h3 className="text-sm font-bold text-black uppercase tracking-widest font-mono mb-2">
      {title}
    </h3>
    {description && (
      <p className="text-[11px] font-mono text-slate-500 uppercase tracking-widest text-center max-w-xs mb-6">
        {description}
      </p>
    )}
    {action && (
      <button
        onClick={action.onClick}
        className="px-6 py-2.5 bg-brand-primary border-2 border-black text-black text-xs font-bold uppercase tracking-widest font-mono hover:bg-black hover:text-brand-primary transition-colors shadow-[4px_4px_0_rgba(0,0,0,1)]"
      >
        {action.label}
      </button>
    )}
  </div>
);

export default EmptyState;
