/**
 * CurrencyX - LocalStorage Persistence Utility
 * Manages caching, preferences, favorites, and conversion history.
 */

const STORAGE_KEYS = {
  HISTORY: 'currencyx_history',
  SETTINGS: 'currencyx_settings',
  FAVORITES: 'currencyx_favorites',
  CURRENCIES_CACHE: 'currencyx_currencies_cache',
  RATES_CACHE: 'currencyx_rates_cache_',
  PAIR_CACHE: 'currencyx_pair_cache_',
  LAST_FETCH: 'currencyx_last_fetch'
};

const DEFAULT_SETTINGS = {
  theme: 'dark', // 'dark' | 'light' | 'system'
  defaultFrom: 'USD',
  defaultTo: 'EUR',
  autoConvert: true,
  precision: 4, // decimal places
  cacheDurationMinutes: 60, // 1 hour ECB cache
  soundEffects: false
};

const DEFAULT_FAVORITES = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD', 'CHF'];

// Safe JSON parser helper
const safeJsonParse = (value, fallback) => {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch (e) {
    console.error('LocalStorage parse error:', e);
    return fallback;
  }
};

// ================= HISTORIES =================
export const getHistory = () => {
  return safeJsonParse(localStorage.getItem(STORAGE_KEYS.HISTORY), []);
};

export const saveHistoryItem = (item) => {
  const history = getHistory();
  const newItem = {
    id: `conv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: Date.now(),
    dateStr: new Date().toISOString(),
    ...item
  };
  // Prepend and keep latest 100 entries
  const updated = [newItem, ...history.filter(h => 
    // prevent immediate duplicates within 5 seconds with exact same amounts
    !(h.fromCurrency === item.fromCurrency && 
      h.toCurrency === item.toCurrency && 
      Math.abs(h.fromAmount - item.fromAmount) < 0.0001 &&
      Date.now() - h.timestamp < 5000)
  )].slice(0, 100);

  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
  return newItem;
};

export const deleteHistoryItem = (id) => {
  const history = getHistory();
  const updated = history.filter(item => item.id !== id);
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
  return updated;
};

export const clearHistory = () => {
  localStorage.removeItem(STORAGE_KEYS.HISTORY);
  return [];
};

// ================= SETTINGS =================
export const getSettings = () => {
  const stored = safeJsonParse(localStorage.getItem(STORAGE_KEYS.SETTINGS), null);
  return { ...DEFAULT_SETTINGS, ...(stored || {}) };
};

export const saveSettings = (newSettings) => {
  const current = getSettings();
  const merged = { ...current, ...newSettings };
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(merged));
  return merged;
};

export const resetSettings = () => {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
  return DEFAULT_SETTINGS;
};

// ================= FAVORITES =================
export const getFavorites = () => {
  return safeJsonParse(localStorage.getItem(STORAGE_KEYS.FAVORITES), DEFAULT_FAVORITES);
};

export const toggleFavorite = (code) => {
  const favorites = getFavorites();
  const exists = favorites.includes(code);
  const updated = exists ? favorites.filter(c => c !== code) : [...favorites, code];
  localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(updated));
  return updated;
};

export const isFavorite = (code) => {
  const favorites = getFavorites();
  return favorites.includes(code);
};

// ================= CACHING =================
export const getCachedCurrencies = () => {
  const cached = safeJsonParse(localStorage.getItem(STORAGE_KEYS.CURRENCIES_CACHE), null);
  if (!cached) return null;
  return cached;
};

export const setCachedCurrencies = (currencies) => {
  const payload = {
    data: currencies,
    timestamp: Date.now(),
    cachedAt: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEYS.CURRENCIES_CACHE, JSON.stringify(payload));
};

export const getCachedRates = (base) => {
  const key = `${STORAGE_KEYS.RATES_CACHE}${base.toUpperCase()}`;
  const cached = safeJsonParse(localStorage.getItem(key), null);
  return cached;
};

export const setCachedRates = (base, rates, date) => {
  const key = `${STORAGE_KEYS.RATES_CACHE}${base.toUpperCase()}`;
  const payload = {
    base: base.toUpperCase(),
    rates,
    date,
    timestamp: Date.now(),
    cachedAt: new Date().toISOString()
  };
  localStorage.setItem(key, JSON.stringify(payload));
};

export const getCachedPair = (base, quote) => {
  const key = `${STORAGE_KEYS.PAIR_CACHE}${base.toUpperCase()}_${quote.toUpperCase()}`;
  return safeJsonParse(localStorage.getItem(key), null);
};

export const setCachedPair = (base, quote, rate, date) => {
  const key = `${STORAGE_KEYS.PAIR_CACHE}${base.toUpperCase()}_${quote.toUpperCase()}`;
  const payload = {
    base: base.toUpperCase(),
    quote: quote.toUpperCase(),
    rate,
    date,
    timestamp: Date.now(),
    cachedAt: new Date().toISOString()
  };
  localStorage.setItem(key, JSON.stringify(payload));
};
