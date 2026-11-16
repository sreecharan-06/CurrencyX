import React, { useState, useMemo } from 'react';
import {
  Trash2,
  Search,
  ArrowRight,
  Copy,
  Check,
  RefreshCw,
  Download,
  Clock,
  History
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  formatAmount,
  formatDateClean,
  formatTimeClean,
  timeAgo,
  getCurrencyFlagEmoji,
  getCurrencyFlagUrl
} from '../utils/converter';

export const HistoryTable = ({
  history = [],
  onDelete,
  onClear,
  onCopySuccess
}) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [confirmClear, setConfirmClear] = useState(false);

  // Filter history items by search
  const filteredHistory = useMemo(() => {
    if (!search.trim()) return history;
    const query = search.toLowerCase().trim();
    return history.filter(item =>
      item.fromCurrency.toLowerCase().includes(query) ||
      item.toCurrency.toLowerCase().includes(query) ||
      String(item.fromAmount).includes(query) ||
      String(item.toAmount).includes(query) ||
      formatDateClean(item.dateStr || item.timestamp).toLowerCase().includes(query)
    );
  }, [history, search]);

  const handleCopy = (item) => {
    const text = `${formatAmount(item.fromAmount)} ${item.fromCurrency} = ${formatAmount(item.toAmount, 4)} ${item.toCurrency} (Rate: ${formatAmount(item.rate, 4)})`;
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    if (onCopySuccess) onCopySuccess('Conversion copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleReconvert = (item) => {
    navigate(`/?from=${item.fromCurrency}&to=${item.toCurrency}&amount=${item.fromAmount}`);
  };

  const handleExportCSV = () => {
    if (history.length === 0) return;
    const headers = ['ID', 'Date', 'Time', 'From Currency', 'Amount', 'To Currency', 'Converted Amount', 'Rate'];
    const rows = history.map(h => [
      h.id,
      formatDateClean(h.dateStr || h.timestamp),
      formatTimeClean(h.dateStr || h.timestamp),
      h.fromCurrency,
      h.fromAmount,
      h.toCurrency,
      h.toAmount,
      h.rate
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `currencyx_conversions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Search and Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversions by currency, amount, date..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          {history.length > 0 && (
            <>
              <button
                type="button"
                onClick={handleExportCSV}
                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                title="Download CSV"
              >
                <Download className="w-3.5 h-3.5" /> Export CSV
              </button>

              {confirmClear ? (
                <div className="flex items-center gap-1.5 animate-in fade-in">
                  <button
                    type="button"
                    onClick={() => {
                      onClear();
                      setConfirmClear(false);
                    }}
                    className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors"
                  >
                    Confirm Clear
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmClear(false)}
                    className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmClear(true)}
                  className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-xs font-semibold text-rose-600 dark:text-rose-300 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear All
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Main Table or Empty State */}
      {filteredHistory.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 flex items-center justify-center mx-auto text-slate-400 shadow-inner">
            <History className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">No conversions found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              {search
                ? `No history records match "${search}". Try adjusting your query.`
                : 'Your recent currency conversions will be automatically logged and saved here in your browser.'}
            </p>
          </div>
          {!search && (
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all"
            >
              Start Converting <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold select-none">
                  <th className="py-3.5 px-4">Original Amount</th>
                  <th className="py-3.5 px-4">Converted Result</th>
                  <th className="py-3.5 px-4 hidden md:table-cell">Applied Rate</th>
                  <th className="py-3.5 px-4 hidden sm:table-cell">Timestamp</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-sm">
                {filteredHistory.map((item) => {
                  const fromFlag = getCurrencyFlagUrl(item.fromCurrency);
                  const fromEmoji = getCurrencyFlagEmoji(item.fromCurrency);
                  const toFlag = getCurrencyFlagUrl(item.toCurrency);
                  const toEmoji = getCurrencyFlagEmoji(item.toCurrency);
                  const isCopied = copiedId === item.id;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group"
                    >
                      {/* From */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                            {fromFlag ? (
                              <img src={fromFlag} alt={item.fromCurrency} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-xs">{fromEmoji}</span>
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white font-mono">
                              {formatAmount(item.fromAmount, 2)}
                            </span>{' '}
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                              {item.fromCurrency}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* To */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                            {toFlag ? (
                              <img src={toFlag} alt={item.toCurrency} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-xs">{toEmoji}</span>
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                              {formatAmount(item.toAmount, 4)}
                            </span>{' '}
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                              {item.toCurrency}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Rate */}
                      <td className="py-3.5 px-4 hidden md:table-cell text-xs font-mono text-slate-500 dark:text-slate-400">
                        1 {item.fromCurrency} = {formatAmount(item.rate, 4)} {item.toCurrency}
                      </td>

                      {/* Date / Time */}
                      <td className="py-3.5 px-4 hidden sm:table-cell">
                        <div className="text-xs text-slate-700 dark:text-slate-300">
                          {formatDateClean(item.dateStr || item.timestamp)}
                        </div>
                        <div className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {timeAgo(item.timestamp)}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleCopy(item)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                            title="Copy conversion details"
                          >
                            {isCopied ? (
                              <Check className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleReconvert(item)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            title="Convert again in Home"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onDelete(item.id)}
                            className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/20 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                            title="Delete this record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryTable;
