import React from 'react';
import { CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

const StatusBadge = ({ status, loading, error, onRetry }) => {
  if (loading) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-medium text-slate-300">
        <RefreshCw className="w-3.5 h-3.5 animate-spin text-violet-400" />
        <span>Connecting to Backend API...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-xs font-medium text-rose-300">
        <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
        <span>API Offline ({error})</span>
        {onRetry && (
          <button
            onClick={onRetry}
            className="ml-1 text-rose-300 hover:text-white underline font-semibold focus:outline-none"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-300">
      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
      <span>Backend Active ({status?.services?.api || 'Operational'})</span>
    </div>
  );
};

export default StatusBadge;
