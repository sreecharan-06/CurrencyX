import React from 'react';
import { WifiOff, Database, AlertTriangle, Info } from 'lucide-react';
import { formatDateClean, formatTimeClean } from '../utils/converter';

export const OfflineNotice = ({ isOnline, isCached, cachedAt, showDisclaimer = false }) => {
  return (
    <div className="space-y-2">
      {/* Network Offline Alert */}
      {!isOnline && (
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm animate-pulse">
          <WifiOff className="w-5 h-5 shrink-0 text-amber-400" />
          <div className="flex-1">
            <span className="font-semibold">Offline Mode Active:</span> You are currently disconnected from the internet. All conversion rates and currencies are served from local device cache.
          </div>
        </div>
      )}

      {/* Cached Rates Warning */}
      {isCached && (
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-200 text-xs sm:text-sm">
          <Database className="w-4 h-4 mt-0.5 shrink-0 text-blue-400" />
          <div className="flex-1">
            <span className="font-semibold text-blue-300">Potentially Outdated Cached Rate:</span> This rate was retrieved earlier {cachedAt ? `on ${formatDateClean(cachedAt)} at ${formatTimeClean(cachedAt)}` : ''}. Cached values may not reflect recent market updates.
          </div>
        </div>
      )}

      {/* Official ECB Reference Rate Disclaimer */}
      {showDisclaimer && (
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-900/40 border border-slate-800 text-slate-400 text-xs">
          <Info className="w-4 h-4 mt-0.5 shrink-0 text-slate-500" />
          <p>
            <span className="font-medium text-slate-300">Reference Rate Notice:</span> Exchange rates are supplied by the European Central Bank (ECB) via the open Frankfurter API. They are reference rates published once daily around 16:00 CET and are not intended for real-time high-frequency financial trading.
          </p>
        </div>
      )}
    </div>
  );
};

export default OfflineNotice;
