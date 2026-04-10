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
 * Empty-state card. Shows when a list or dashboard section has no data.
 */
const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action
}) => (
  <div className="flex flex-col items-center justify-center py-16 px-8 border border-dashed border-brand-border rounded-xl bg-slate-50/50">
    <div className="w-14 h-14 bg-white border border-brand-border rounded-xl flex items-center justify-center mb-5 shadow-xs">
      {icon || <Inbox size={24} className="text-slate-400" />}
    </div>
    <h3 className="text-sm font-semibold text-brand-text mb-1">
      {title}
    </h3>
    {description && (
      <p className="text-sm text-brand-muted text-center max-w-xs mb-6">
        {description}
      </p>
    )}
    {action && (
      <button
        onClick={action.onClick}
        className="btn-primary"
      >
        {action.label}
      </button>
    )}
  </div>
);

export default EmptyState;
