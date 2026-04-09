import React, { useEffect, useState } from 'react';

const LoadingSpinner: React.FC<{ text?: string }> = ({ text = 'LOADING...' }) => {
  const [frame, setFrame] = useState(0);
  const [barWidth, setBarWidth] = useState(0);
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

  useEffect(() => {
    const t = setInterval(() => setFrame(f => (f + 1) % frames.length), 80);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setBarWidth(w => (w >= 100 ? 0 : w + 2));
    }, 30);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-64 flex flex-col items-center justify-center gap-3 w-full font-mono">
      <div className="flex items-center gap-3 border-2 border-black bg-white px-6 py-4 shadow-[4px_4px_0_rgba(0,0,0,1)]">
        <span className="text-brand-primary text-xl leading-none">{frames[frame]}</span>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-black uppercase tracking-widest">{text}</span>
          <div className="w-32 h-[3px] bg-slate-200 mt-2 overflow-hidden">
            <div
              className="h-full bg-brand-primary transition-[width] duration-75 ease-linear"
              style={{ width: `${barWidth}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export const SmallSpinner: React.FC = () => {
  const [frame, setFrame] = useState(0);
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

  useEffect(() => {
    const t = setInterval(() => setFrame(f => (f + 1) % frames.length), 80);
    return () => clearInterval(t);
  }, []);

  return (
    <span className="font-mono text-brand-primary text-sm leading-none inline-block">{frames[frame]}</span>
  );
};

export default LoadingSpinner;
