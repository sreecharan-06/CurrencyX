import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, ChevronDown, Star, Check, X, Sparkles } from 'lucide-react';
import { getCurrencyFlagEmoji, getCurrencyFlagUrl, CURRENCY_SYMBOLS } from '../utils/converter';

export const CurrencyDropdown = ({
  selectedCurrency = 'USD',
  onSelect,
  currencies = [],
  favorites = [],
  onToggleFavorite,
  label = 'Select Currency',
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'favorites' | 'popular'
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Popular currencies list
  const POPULAR_CODES = useMemo(() => ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'SGD'], []);

  // Close when clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Autofocus search input when open
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Filtered currency list
  const filteredCurrencies = useMemo(() => {
    let list = currencies;

    if (activeTab === 'favorites') {
      list = list.filter(c => favorites.includes(c.iso_code));
    } else if (activeTab === 'popular') {
      list = list.filter(c => POPULAR_CODES.includes(c.iso_code));
    }

    if (!searchQuery.trim()) return list;

    const query = searchQuery.toLowerCase().trim();
    return list.filter(c => 
      c.iso_code?.toLowerCase().includes(query) ||
      c.name?.toLowerCase().includes(query) ||
      c.symbol?.toLowerCase().includes(query)
    );
  }, [currencies, searchQuery, activeTab, favorites, POPULAR_CODES]);

  // Find active currency metadata
  const activeCurrencyInfo = useMemo(() => {
    return currencies.find(c => c.iso_code === selectedCurrency) || {
      iso_code: selectedCurrency,
      name: selectedCurrency,
      symbol: CURRENCY_SYMBOLS[selectedCurrency] || ''
    };
  }, [currencies, selectedCurrency]);

  const flagEmoji = getCurrencyFlagEmoji(selectedCurrency);
  const flagUrl = getCurrencyFlagUrl(selectedCurrency);

  const handleSelectCurrency = (code) => {
    onSelect(code);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
          {label}
        </label>
      )}

      {/* Main Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-3 px-3.5 py-3 rounded-2xl bg-white dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-sm group"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
            {flagUrl ? (
              <img
                src={flagUrl}
                alt={selectedCurrency}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
            ) : null}
            <span className={flagUrl ? 'hidden text-base' : 'text-base leading-none'}>
              {flagEmoji}
            </span>
          </div>

          <div className="truncate">
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-slate-900 dark:text-white tracking-wide">
                {selectedCurrency}
              </span>
              {activeCurrencyInfo.symbol && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                  {activeCurrencyInfo.symbol}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[160px] sm:max-w-[200px]">
              {activeCurrencyInfo.name}
            </p>
          </div>
        </div>

        <ChevronDown className={`w-4 h-4 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-white transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-500' : ''}`} />
      </button>

      {/* Dropdown Modal / Popover */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 min-w-[300px]">
          {/* Search Header */}
          <div className="p-3 border-b border-slate-100 dark:border-slate-800 space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search currency, code or symbol..."
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-950/60 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`flex-1 py-1 px-2 rounded-lg font-medium transition-all ${
                  activeTab === 'all'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/40'
                }`}
              >
                All ({currencies.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('popular')}
                className={`flex-1 py-1 px-2 rounded-lg font-medium transition-all flex items-center justify-center gap-1 ${
                  activeTab === 'popular'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/40'
                }`}
              >
                <Sparkles className="w-3 h-3 text-amber-500" /> Popular
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('favorites')}
                className={`flex-1 py-1 px-2 rounded-lg font-medium transition-all flex items-center justify-center gap-1 ${
                  activeTab === 'favorites'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/40'
                }`}
              >
                <Star className="w-3 h-3 text-amber-400" /> Favorites ({favorites.length})
              </button>
            </div>
          </div>

          {/* Currency List */}
          <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/50 p-1 custom-scrollbar">
            {filteredCurrencies.length === 0 ? (
              <div className="p-6 text-center text-slate-500 dark:text-slate-400 text-xs">
                No currencies found matching &quot;{searchQuery}&quot;
              </div>
            ) : (
              filteredCurrencies.map((c) => {
                const code = c.iso_code;
                const isSelected = code === selectedCurrency;
                const isFav = favorites.includes(code);
                const emoji = getCurrencyFlagEmoji(code);
                const flagSrc = getCurrencyFlagUrl(code);

                return (
                  <div
                    key={code}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-600/20 text-blue-600 dark:text-white'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800/70 text-slate-800 dark:text-slate-200'
                    }`}
                    onClick={() => handleSelectCurrency(code)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 flex items-center justify-center overflow-hidden shrink-0">
                        {flagSrc ? (
                          <img
                            src={flagSrc}
                            alt={code}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'block';
                            }}
                          />
                        ) : null}
                        <span className={flagSrc ? 'hidden text-sm' : 'text-sm leading-none'}>
                          {emoji}
                        </span>
                      </div>

                      <div className="truncate">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm tracking-wide text-slate-900 dark:text-white">
                            {code}
                          </span>
                          {c.symbol && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                              {c.symbol}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[170px] sm:max-w-[210px]">
                          {c.name}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      {isSelected && <Check className="w-4 h-4 text-blue-500" />}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onToggleFavorite) onToggleFavorite(code);
                        }}
                        className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700/50 text-slate-400 hover:text-amber-400 transition-colors"
                        title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        <Star className={`w-4 h-4 ${isFav ? 'text-amber-400 fill-amber-400' : 'text-slate-400'}`} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrencyDropdown;
