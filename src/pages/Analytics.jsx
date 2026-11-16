import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Info
} from 'lucide-react';
import CurrencyDropdown from '../components/CurrencyDropdown';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import OfflineNotice from '../components/OfflineNotice';
import { fetchHistoricalRates } from '../services/currencyAPI';
import { formatAmount, formatDateClean } from '../utils/converter';

const DATE_RANGES = [
  { label: '7D', days: 7, desc: 'Last 7 Days' },
  { label: '30D', days: 30, desc: 'Last 1 Month' },
  { label: '90D', days: 90, desc: 'Last 3 Months' },
  { label: '1Y', days: 365, desc: 'Last 1 Year' }
];

export const Analytics = ({ currencyContext }) => {
  const [searchParams] = useSearchParams();
  const {
    currencies,
    favorites,
    toggleFavorite,
    isOnline
  } = currencyContext;

  const [baseCurrency, setBaseCurrency] = useState(
    searchParams.get('base')?.toUpperCase() || 'USD'
  );
  const [quoteCurrency, setQuoteCurrency] = useState(
    searchParams.get('quote')?.toUpperCase() || 'EUR'
  );
  const [selectedRange, setSelectedRange] = useState(30);

  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCached, setIsCached] = useState(false);
  const [cachedAt, setCachedAt] = useState(null);

  // Load historical rates
  const loadHistoricalData = useCallback(async (base, quote, days) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchHistoricalRates(base, quote, days);
      setChartData(res.data || []);
      setIsCached(res.isCached);
      setCachedAt(res.cachedAt || null);
    } catch (err) {
      setError(
        err.message ||
        'Historical exchange rates could not be retrieved from European Central Bank data.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistoricalData(baseCurrency, quoteCurrency, selectedRange);
  }, [baseCurrency, quoteCurrency, selectedRange, loadHistoricalData]);

  // Compute Statistics
  const statistics = useMemo(() => {
    if (!chartData || chartData.length === 0) return null;

    const rates = chartData.map(d => d.rate);
    const firstRate = rates[0];
    const currentRate = rates[rates.length - 1];
    const high = Math.max(...rates);
    const low = Math.min(...rates);
    const sum = rates.reduce((acc, val) => acc + val, 0);
    const average = sum / rates.length;
    const change = currentRate - firstRate;
    const changePercent = firstRate > 0 ? (change / firstRate) * 100 : 0;
    const spread = high - low;

    return {
      currentRate,
      firstRate,
      high,
      low,
      average,
      change,
      changePercent,
      spread,
      isPositive: change >= 0
    };
  }, [chartData]);

  // Swap currencies for analytics
  const handleSwap = () => {
    const temp = baseCurrency;
    setBaseCurrency(quoteCurrency);
    setQuoteCurrency(temp);
  };

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const rateVal = payload[0].value;
      return (
        <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 shadow-2xl backdrop-blur-md text-xs space-y-1">
          <p className="font-semibold text-slate-700 dark:text-slate-300">{formatDateClean(label)}</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
              1 {baseCurrency} = {formatAmount(rateVal, 4)} {quoteCurrency}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Exchange Rate Analytics
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
              ECB Time Series
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Historical trend charts, period volatility, and currency movement statistics.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadHistoricalData(baseCurrency, quoteCurrency, selectedRange)}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900/90 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all disabled:opacity-50 self-start sm:self-auto shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-500' : ''}`} />
          <span>Refresh Trend</span>
        </button>
      </div>

      {/* Network / Cache notice */}
      <OfflineNotice
        isOnline={isOnline}
        isCached={isCached}
        cachedAt={cachedAt}
        showDisclaimer={true}
      />

      {/* Currency Selection and Date Range Controls */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 backdrop-blur-md space-y-4 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          {/* Currency Selectors */}
          <div className="flex flex-col sm:flex-row items-center gap-3 flex-1">
            <div className="w-full sm:w-60">
              <CurrencyDropdown
                selectedCurrency={baseCurrency}
                onSelect={setBaseCurrency}
                currencies={currencies}
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
                label="Base Currency"
                disabled={isLoading}
              />
            </div>

            <button
              type="button"
              onClick={handleSwap}
              className="p-3 mt-0 sm:mt-5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700/60 transition-colors"
              title="Invert pair"
            >
              ⇄
            </button>

            <div className="w-full sm:w-60">
              <CurrencyDropdown
                selectedCurrency={quoteCurrency}
                onSelect={setQuoteCurrency}
                currencies={currencies}
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
                label="Target Currency"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Date Range Selector */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 self-start lg:self-end text-xs">
            {DATE_RANGES.map((range) => {
              const isSelected = selectedRange === range.days;
              return (
                <button
                  key={range.days}
                  type="button"
                  onClick={() => setSelectedRange(range.days)}
                  className={`px-3.5 py-2 rounded-lg font-bold transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/40'
                  }`}
                  title={range.desc}
                >
                  {range.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <ErrorMessage
          title="Analytics Data Unavailable"
          message={error}
          onRetry={() => loadHistoricalData(baseCurrency, quoteCurrency, selectedRange)}
          isOffline={!isOnline}
        />
      )}

      {/* Statistics Cards Row */}
      {statistics && !isLoading && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Current Rate */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 space-y-1 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Current Rate
            </span>
            <div className="text-xl font-black text-slate-900 dark:text-white font-mono">
              {formatAmount(statistics.currentRate, 4)}
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">1 {baseCurrency}</p>
          </div>

          {/* Period Change */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 space-y-1 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Period Change
            </span>
            <div
              className={`text-xl font-black font-mono flex items-center gap-1 ${
                statistics.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {statistics.isPositive ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              {statistics.changePercent > 0 ? '+' : ''}
              {statistics.changePercent.toFixed(2)}%
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">
              {statistics.change > 0 ? '+' : ''}
              {formatAmount(statistics.change, 4)} {quoteCurrency}
            </p>
          </div>

          {/* Period High */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 space-y-1 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              High
            </span>
            <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {formatAmount(statistics.high, 4)}
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">Peak value</p>
          </div>

          {/* Period Low */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 space-y-1 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Low
            </span>
            <div className="text-xl font-black text-rose-600 dark:text-rose-400 font-mono">
              {formatAmount(statistics.low, 4)}
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">Trough value</p>
          </div>

          {/* Average */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 space-y-1 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Period Avg
            </span>
            <div className="text-xl font-black text-slate-800 dark:text-slate-200 font-mono">
              {formatAmount(statistics.average, 4)}
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">Arithmetic mean</p>
          </div>

          {/* Spread / Volatility */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 space-y-1 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Volatility Spread
            </span>
            <div className="text-xl font-black text-blue-600 dark:text-blue-400 font-mono">
              {formatAmount(statistics.spread, 4)}
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">High - Low spread</p>
          </div>
        </div>
      )}

      {/* Main Historical Chart */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-2xl backdrop-blur-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>{baseCurrency} to {quoteCurrency}</span>
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                ({chartData.length} data points)
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              European Central Bank daily reference fixing rates over time
            </p>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            {chartData.length > 0 && (
              <span>
                {formatDateClean(chartData[0].date)} → {formatDateClean(chartData[chartData.length - 1].date)}
              </span>
            )}
          </div>
        </div>

        {/* Chart Container */}
        <div className="w-full h-[360px] pt-4">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <Loading text="Loading official historical data series..." />
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-2">
              <BarChart3 className="w-10 h-10 text-slate-400 dark:text-slate-600" />
              <p className="text-sm text-slate-600 dark:text-slate-400">
                No historical rate data points returned for {baseCurrency}/{quoteCurrency} within this period.
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Note: Some emerging currencies or metals have shorter reference windows on the ECB exchange feed.
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="rateGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" strokeOpacity={0.3} vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={(val) => {
                    const parts = val.split('-');
                    return `${parts[1]}/${parts[2]}`;
                  }}
                  stroke="#94a3b8"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                />
                <YAxis
                  domain={['auto', 'auto']}
                  stroke="#94a3b8"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickFormatter={(val) => formatAmount(val, 2)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="rate"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#rateGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
