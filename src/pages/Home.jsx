import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Coins,
  RefreshCw,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Calendar,
  ArrowRight
} from 'lucide-react';
import CurrencyInput from '../components/CurrencyInput';
import CurrencyDropdown from '../components/CurrencyDropdown';
import SwapButton from '../components/SwapButton';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import OfflineNotice from '../components/OfflineNotice';
import Toast from '../components/Toast';
import {
  formatAmount,
  formatRateDisplay,
  formatInverseRateDisplay,
  formatDateClean,
  isValidAmount,
  getCurrencyFlagEmoji
} from '../utils/converter';

export const Home = ({ currencyContext }) => {
  const [searchParams] = useSearchParams();
  const [toastMessage, setToastMessage] = useState(null);
  const [copied, setCopied] = useState(false);

  const {
    currencies,
    isLoadingCurrencies,
    fromCurrency,
    setFromCurrency,
    toCurrency,
    setToCurrency,
    amount,
    setAmount,
    convertedAmount,
    rate,
    inverseRate,
    rateDate,
    isCachedRate,
    cachedRateAt,
    isLoadingRate,
    rateError,
    isOnline,
    swapCurrencies,
    convert,
    reset,
    refreshRate,
    favorites,
    toggleFavorite
  } = currencyContext;

  // Handle URL search params on mount or param changes
  useEffect(() => {
    const urlFrom = searchParams.get('from');
    const urlTo = searchParams.get('to');
    const urlAmount = searchParams.get('amount');

    if (urlFrom && urlFrom.toUpperCase() !== fromCurrency) {
      setFromCurrency(urlFrom.toUpperCase());
    }
    if (urlTo && urlTo.toUpperCase() !== toCurrency) {
      setToCurrency(urlTo.toUpperCase());
    }
    if (urlAmount && isValidAmount(urlAmount)) {
      setAmount(urlAmount);
    }
  }, [searchParams]);

  // Handle manual Convert click
  const handleConvertClick = () => {
    if (!isValidAmount(amount)) {
      setToastMessage({ message: 'Please enter a valid amount greater than 0', type: 'error' });
      return;
    }
    const result = convert();
    if (result) {
      setToastMessage({
        message: `Converted ${formatAmount(amount)} ${fromCurrency} = ${formatAmount(result.convertedAmount, 4)} ${toCurrency} (Saved to History)`,
        type: 'success'
      });
    }
  };

  // Copy result to clipboard
  const handleCopyResult = () => {
    if (convertedAmount === null) return;
    const text = `${amount} ${fromCurrency} = ${formatAmount(convertedAmount, 4)} ${toCurrency} (Rate: ${rate})`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setToastMessage({ message: 'Conversion result copied to clipboard!', type: 'success' });
    setTimeout(() => setCopied(false), 2000);
  };

  // Quick preset pairs
  const POPULAR_PAIRS = [
    { from: 'USD', to: 'EUR' },
    { from: 'USD', to: 'INR' },
    { from: 'USD', to: 'GBP' },
    { from: 'EUR', to: 'GBP' },
    { from: 'USD', to: 'JPY' },
    { from: 'USD', to: 'CAD' }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Toast Feedback */}
      {toastMessage && (
        <Toast
          message={toastMessage.message}
          type={toastMessage.type}
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Currency Converter
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold">
              Live Rates
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time multi-currency conversions powered by European Central Bank reference data.
          </p>
        </div>

        {/* Refresh & Reset Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={refreshRate}
            disabled={isLoadingRate}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900/90 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all disabled:opacity-50 shadow-sm"
            title="Refresh current exchange rate"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingRate ? 'animate-spin text-blue-500' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900/90 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-all shadow-sm"
            title="Reset conversion fields"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Network or Cache Alert */}
      <OfflineNotice
        isOnline={isOnline}
        isCached={isCachedRate}
        cachedAt={cachedRateAt}
        showDisclaimer={true}
      />

      {/* Error state if currencies or rate failed */}
      {rateError && (
        <ErrorMessage
          title="Exchange Rate Error"
          message={rateError}
          onRetry={refreshRate}
          isOffline={!isOnline}
        />
      )}

      {/* Main Converter Card */}
      <div className="rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 backdrop-blur-xl shadow-xl dark:shadow-2xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Amount and Currencies Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
            {/* Amount Input */}
            <div className="lg:col-span-5">
              <CurrencyInput
                value={amount}
                onChange={setAmount}
                currencyCode={fromCurrency}
                label="Amount to Convert"
                placeholder="100.00"
              />
            </div>

            {/* Currency Selectors & Swap Button */}
            <div className="lg:col-span-7 flex flex-col sm:flex-row items-center gap-3">
              {/* From Dropdown */}
              <div className="w-full sm:flex-1">
                <CurrencyDropdown
                  selectedCurrency={fromCurrency}
                  onSelect={setFromCurrency}
                  currencies={currencies}
                  favorites={favorites}
                  onToggleFavorite={toggleFavorite}
                  label="From Currency"
                  disabled={isLoadingCurrencies}
                />
              </div>

              {/* Swap Button */}
              <div className="pt-2 sm:pt-6">
                <SwapButton onSwap={swapCurrencies} disabled={isLoadingRate} />
              </div>

              {/* To Dropdown */}
              <div className="w-full sm:flex-1">
                <CurrencyDropdown
                  selectedCurrency={toCurrency}
                  onSelect={setToCurrency}
                  currencies={currencies}
                  favorites={favorites}
                  onToggleFavorite={toggleFavorite}
                  label="To Currency"
                  disabled={isLoadingCurrencies}
                />
              </div>
            </div>
          </div>

          {/* Action Row: Convert Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {rateDate && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                  Rate Date: <strong className="text-slate-700 dark:text-slate-200">{formatDateClean(rateDate)}</strong>
                  {isCachedRate && <span className="text-amber-500 dark:text-amber-400">(cached)</span>}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleConvertClick}
              disabled={isLoadingRate || !isValidAmount(amount)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-blue-500/25 active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoadingRate ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Fetching Rate...</span>
                </>
              ) : (
                <>
                  <Coins className="w-4 h-4" />
                  <span>Convert & Save</span>
                </>
              )}
            </button>
          </div>

          {/* Result Display Box */}
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/90 shadow-inner space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Conversion Result
              </span>
              {convertedAmount !== null && (
                <button
                  type="button"
                  onClick={handleCopyResult}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-850 text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 transition-colors shadow-sm"
                  title="Copy formatted result"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {isLoadingRate ? (
              <Loading text="Calculating live exchange rate..." />
            ) : convertedAmount !== null && rate !== null ? (
              <div className="space-y-3">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {formatAmount(amount)} {fromCurrency} =
                </div>
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white font-mono tracking-tight dark:bg-gradient-to-r dark:from-white dark:via-slate-100 dark:to-blue-200 dark:bg-clip-text dark:text-transparent">
                    {formatAmount(convertedAmount, 4)}
                  </span>
                  <span className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {toCurrency}
                  </span>
                </div>

                {/* Exchange Rates Breakdown */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800/60 flex flex-wrap items-center gap-4 text-xs font-mono text-slate-500 dark:text-slate-400">
                  <div>{formatRateDisplay(rate, fromCurrency, toCurrency, 4)}</div>
                  <span className="text-slate-400 hidden sm:inline">•</span>
                  <div>{formatInverseRateDisplay(rate, fromCurrency, toCurrency, 4)}</div>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-slate-400 dark:text-slate-500 text-sm">
                Enter an amount above to view live conversion.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Popular Currency Presets Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" /> Popular Currency Pairs
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">Click to quick load</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {POPULAR_PAIRS.map((pair) => {
            const isCurrent = fromCurrency === pair.from && toCurrency === pair.to;
            return (
              <button
                key={`${pair.from}-${pair.to}`}
                type="button"
                onClick={() => {
                  setFromCurrency(pair.from);
                  setToCurrency(pair.to);
                }}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  isCurrent
                    ? 'bg-blue-50 dark:bg-blue-600/20 border-blue-500 text-blue-700 dark:text-white shadow-md'
                    : 'bg-white dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold">
                  <span>{pair.from}</span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                  <span className="text-blue-600 dark:text-blue-400">{pair.to}</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                  <span>{getCurrencyFlagEmoji(pair.from)}</span>
                  <span>{getCurrencyFlagEmoji(pair.to)}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Home;
