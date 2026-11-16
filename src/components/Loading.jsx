import React from 'react';
import { Loader2 } from 'lucide-react';

export const Loading = ({ text = 'Loading data...', type = 'spinner', rows = 5 }) => {
  if (type === 'skeleton') {
    return (
      <div className="w-full space-y-4 animate-pulse">
        <div className="h-10 bg-slate-800/60 rounded-xl w-3/4"></div>
        <div className="space-y-3">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="h-16 bg-slate-800/40 rounded-xl w-full border border-slate-800/50"></div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'card') {
    return (
      <div className="w-full p-6 rounded-2xl bg-slate-900/50 border border-slate-800 animate-pulse space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-6 w-24 bg-slate-800 rounded-lg"></div>
          <div className="h-6 w-16 bg-slate-800 rounded-lg"></div>
        </div>
        <div className="h-12 bg-slate-800/70 rounded-xl w-full"></div>
        <div className="h-4 bg-slate-800/50 rounded-md w-1/2"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
      <div className="relative">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-md"></div>
      </div>
      <p className="text-sm font-medium text-slate-400">{text}</p>
    </div>
  );
};

export default Loading;
