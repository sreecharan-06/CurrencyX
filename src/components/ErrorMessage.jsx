import React from 'react';
import { AlertCircle, RefreshCw, WifiOff } from 'lucide-react';

export const ErrorMessage = ({
  title = 'Something went wrong',
  message,
  onRetry,
  isOffline = false
}) => {
  return (
    <div className="w-full p-6 rounded-2xl bg-rose-950/20 border border-rose-500/30 text-rose-200">
      <div className="flex items-start gap-4">
        <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 shrink-0">
          {isOffline ? <WifiOff className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
        </div>
        <div className="flex-1 space-y-1.5">
          <h3 className="font-semibold text-rose-100 text-base">{title}</h3>
          <p className="text-sm text-rose-300/90 leading-relaxed">
            {message || 'An unexpected error occurred while communicating with the exchange rate server.'}
          </p>
          {onRetry && (
            <div className="pt-2">
              <button
                onClick={onRetry}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-xs font-semibold text-rose-200 transition-colors shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry Request
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;
