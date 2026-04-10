import React from 'react';

const LoadingSpinner: React.FC<{ text?: string }> = ({ text = 'Loading...' }) => {
  return (
    <div className="min-h-64 flex flex-col items-center justify-center gap-3 w-full">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full border-2 border-brand-border" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-brand-primary animate-spin-slow" />
      </div>
      <span className="text-sm text-brand-muted">{text}</span>
    </div>
  );
};

export const SmallSpinner: React.FC = () => {
  return (
    <div className="relative w-4 h-4 inline-block">
      <div className="absolute inset-0 rounded-full border-2 border-brand-border" />
      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-brand-primary animate-spin-slow" />
    </div>
  );
};

export default LoadingSpinner;
