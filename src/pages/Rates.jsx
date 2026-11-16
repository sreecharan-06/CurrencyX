import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  TrendingUp,
  Search,
  RefreshCw,
  ArrowUpDown,
  Star,
  Sparkles,
  LayoutGrid,
  Table as TableIcon
} from 'lucide-react';
import CurrencyDropdown from '../components/CurrencyDropdown';
import RateCard from '../components/RateCard';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import OfflineNotice from '../components/OfflineNotice';
import Toast from '../components/Toast';
import { fetchMultipleRates } from '../services/currencyAPI';
import {
  formatAmount,
  getCurrencyFlagEmoji,
  getCurrencyFlagUrl
} from '../utils/converter';

export const Rates = ({ currencyContext }) => {
  const {
    currencies,
    favorites,
    toggleFavorite,
    isOnline
  } = currencyContext;

  const [baseCurrency, setBaseCurrency] = useState('USD');
  const [ratesMap, setRatesMap] = useState({});
  const [rateDate, setRateDate] = useState(null);
  const [isCached, setIsCached] = useState(false);
  const [cachedAt, setCachedAt] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // UI states
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'favorites' | 'popular'
  const [sortField, setSortField] = useState('code'); // 'code' | 'name' | 'rate'
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' | 'desc'
  const [toastMessage, setToastMessage] = useState(null);

  const POPULAR_CODES = useMemo(() => ['EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'NZD', 'SGD', 'BRL', 'ZAR', 'AED', 'SEK'], []);

  // Fetch all rates for base currency
  const loadRates = useCallback(async (base, force = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchMultipleRates(base, null, force);
      setRatesMap(res.rates || {});
      setRateDate(res.date);
      setIsCached(res.isCached);
      setCachedAt(res.cachedAt);
    } catch (err) {
      setError(err.message || 'Failed to fetch live exchange rates');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRates(baseCurrency);
  }, [baseCurrency, loadRates]);

  const handleRefresh = () => {
    loadRates(baseCurrency, true);
    setToastMessage({ message: `Refreshed exchange rates for ${baseCurrency}`, type: 'success' });
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection(field === 'rate' ? 'desc' : 'asc');
    }
  };

  // Compile list with currency metadata
  const ratesList = useMemo(() => {
    const list = Object.entries(ratesMap).map(([quote, rate]) => {
      const meta = currencies.find(c => c.iso_code === quote) || {
        iso_code: quote,
        name: quote,
        symbol: ''
      };
      return {
        code: quote,
        name: meta.name,
        symbol: meta.symbol,
        rate: parseFloat(rate),
        isFav: favorites.includes(quote),
        isPopular: POPULAR_CODES.includes(quote)
      };
    });

    // Filtering
    let filtered = list;
    if (filterTab === 'favorites') {
      filtered = filtered.filter(item => item.isFav);
    } else if (filterTab === 'popular') {
      filtered = filtered.filter(item => item.isPopular);
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(item =>
        item.code.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q)
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'code') {
        comparison = a.code.localeCompare(b.code);
      } else if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === 'rate') {
        comparison = a.rate - b.rate;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [ratesMap, currencies, favorites, POPULAR_CODES, filterTab, search, sortField, sortDirection]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {toastMessage && (
        <Toast
          message={toastMessage.message}
          type={toastMessage.type}
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Live Exchange Rates
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
              Global Board
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Compare world exchange rates against your chosen base currency in real time.
          </p>
        </div>

        {/* Base Currency Picker + Refresh */}
        <div className="flex items-center gap-3">
          <div className="w-56">
            <CurrencyDropdown
              selectedCurrency={baseCurrency}
              onSelect={setBaseCurrency}
              currencies={currencies}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
              label=""
              disabled={isLoading}
            />
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isLoading}
            className="p-3 rounded-2xl bg-white dark:bg-slate-900/90 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all disabled:opacity-50 shadow-sm"
            title="Refresh exchange rates"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Network / Cache Notification */}
      <OfflineNotice
        isOnline={isOnline}
        isCached={isCached}
        cachedAt={cachedAt}
        showDisclaimer={true}
      />

      {/* Error state */}
      {error && (
        <ErrorMessage
          title="Could not load exchange rates"
          message={error}
          onRetry={() => loadRates(baseCurrency, true)}
          isOffline={!isOnline}
        />
      )}

      {/* Controls & Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 backdrop-blur-md shadow-sm">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search currencies by code or name..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
          />
        </div>

        {/* Filter Tabs + View Mode Toggle */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Filter Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setFilterTab('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                filterTab === 'all'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All ({ratesList.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('popular')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1 ${
                filterTab === 'popular'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-3 h-3 text-amber-500" /> Popular
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('favorites')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1 ${
                filterTab === 'favorites'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Star className="w-3 h-3 text-amber-400" /> Favorites
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table' ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Table view"
            >
              <TableIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Grid card view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <Loading type="skeleton" rows={8} />
      ) : ratesList.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 space-y-3 shadow-sm">
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            No exchange rates match your filters. Try clearing your search.
          </p>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Clear search query
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid Card View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {ratesList.map((item) => (
            <RateCard
              key={item.code}
              baseCurrency={baseCurrency}
              quoteCurrency={item.code}
              quoteName={item.name}
              rate={item.rate}
              isFavorite={item.isFav}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold select-none">
                  <th className="py-3.5 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white" onClick={() => handleSort('code')}>
                    <div className="flex items-center gap-1.5">
                      <span>Currency</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white hidden sm:table-cell" onClick={() => handleSort('name')}>
                    <div className="flex items-center gap-1.5">
                      <span>Name</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white text-right" onClick={() => handleSort('rate')}>
                    <div className="flex items-center justify-end gap-1.5">
                      <span>Exchange Rate (1 {baseCurrency})</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4 text-right hidden md:table-cell">
                    <span>Inverse Rate</span>
                  </th>
                  <th className="py-3.5 px-4 text-center w-16">Fav</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-sm">
                {ratesList.map((item) => {
                  const flagUrl = getCurrencyFlagUrl(item.code);
                  const flagEmoji = getCurrencyFlagEmoji(item.code);
                  const inverse = item.rate > 0 ? 1 / item.rate : 0;

                  return (
                    <tr
                      key={item.code}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group"
                    >
                      {/* Currency Code & Flag */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                            {flagUrl ? (
                              <img
                                src={flagUrl}
                                alt={item.code}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'block';
                                }}
                              />
                            ) : null}
                            <span className={flagUrl ? 'hidden text-base' : 'text-base'}>{flagEmoji}</span>
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white tracking-wide">
                              {item.code}
                            </span>
                            <div className="sm:hidden text-xs text-slate-500 dark:text-slate-400 truncate max-w-[120px]">
                              {item.name}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Full Name */}
                      <td className="py-3.5 px-4 hidden sm:table-cell text-slate-700 dark:text-slate-300">
                        {item.name}
                      </td>

                      {/* Exchange Rate */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-white text-base">
                        {formatAmount(item.rate, 4)}
                      </td>

                      {/* Inverse Rate */}
                      <td className="py-3.5 px-4 text-right hidden md:table-cell font-mono text-xs text-slate-500 dark:text-slate-400">
                        1 {item.code} = {formatAmount(inverse, 4)} {baseCurrency}
                      </td>

                      {/* Favorite Button */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => toggleFavorite(item.code)}
                          className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-amber-500 transition-colors"
                          title={item.isFav ? 'Remove favorite' : 'Add favorite'}
                        >
                          <Star className={`w-4 h-4 ${item.isFav ? 'text-amber-400 fill-amber-400' : ''}`} />
                        </button>
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

export default Rates;
