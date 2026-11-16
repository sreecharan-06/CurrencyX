import React from 'react';
import { X, AlertCircle } from 'lucide-react';
import { CURRENCY_SYMBOLS, isValidAmount } from '../utils/converter';

export const CurrencyInput = ({
  value = '100',
  onChange,
  currencyCode = 'USD',
  label = 'Amount',
  placeholder = '0.00',
  disabled = false,
  showPresets = true
}) => {
  const PRESETS = [10, 50, 100, 500, 1000, 5000];
  const symbol = CURRENCY_SYMBOLS[currencyCode.toUpperCase()] || '';
  const isInvalid = value !== '' && !isValidAmount(value);

  const handlePresetClick = (amount) => {
    onChange(String(amount));
  };

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {label}
        </label>
        {isInvalid && (
          <span className="flex items-center gap-1 text-xs text-rose-500 dark:text-rose-400 font-medium animate-in fade-in">
            <AlertCircle className="w-3.5 h-3.5" /> Enter valid amount &gt; 0
          </span>
        )}
      </div>

      <div className="relative">
        {/* Symbol Prefix */}
        {symbol && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 font-semibold text-lg select-none">
            {symbol}
          </div>
        )}

        <input
          type="text"
          inputMode="decimal"
          pattern="[0-9]*[.]?[0-9]*"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full ${
            symbol ? 'pl-11' : 'pl-4'
          } pr-10 py-3.5 rounded-2xl bg-white dark:bg-slate-900/90 border ${
            isInvalid
              ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/30'
              : 'border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-blue-500/30'
          } text-xl font-bold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 transition-all shadow-inner`}
        />

        {value && !disabled && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Clear amount"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Quick Amount Presets */}
      {showPresets && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mr-1 select-none">Quick:</span>
          {PRESETS.map((preset) => {
            const isSelected = value === String(preset);
            return (
              <button
                key={preset}
                type="button"
                onClick={() => handlePresetClick(preset)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-400'
                    : 'bg-slate-100 dark:bg-slate-900/60 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800/80'
                }`}
              >
                +{preset}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CurrencyInput;
