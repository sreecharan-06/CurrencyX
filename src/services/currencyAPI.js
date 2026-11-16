/**
 * CurrencyX - Currency API Service
 * Interacts with the official Frankfurter API (v2 and v1 historical).
 * Features caching, offline fallback, and structured error handling.
 */

import {
  getCachedCurrencies,
  setCachedCurrencies,
  getCachedRates,
  setCachedRates,
  getCachedPair,
  setCachedPair
} from '../utils/storage';

const API_BASE_V2 = 'https://api.frankfurter.dev/v2';
const API_BASE_V1 = 'https://api.frankfurter.dev/v1';

// Cache expiration: 1 hour (Frankfurter ECB updates once daily around 16:00 CET)
const CACHE_TTL_MS = 60 * 60 * 1000;

// Currencies fallback if first load has zero internet
const FALLBACK_CURRENCIES = [
  { iso_code: 'USD', name: 'United States Dollar', symbol: '$', type: 'currency' },
  { iso_code: 'EUR', name: 'Euro', symbol: '€', type: 'currency' },
  { iso_code: 'GBP', name: 'British Pound Sterling', symbol: '£', type: 'currency' },
  { iso_code: 'INR', name: 'Indian Rupee', symbol: '₹', type: 'currency' },
  { iso_code: 'JPY', name: 'Japanese Yen', symbol: '¥', type: 'currency' },
  { iso_code: 'CAD', name: 'Canadian Dollar', symbol: '$', type: 'currency' },
  { iso_code: 'AUD', name: 'Australian Dollar', symbol: '$', type: 'currency' },
  { iso_code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', type: 'currency' },
  { iso_code: 'CNY', name: 'Chinese Yuan', symbol: '¥', type: 'currency' },
  { iso_code: 'SGD', name: 'Singapore Dollar', symbol: '$', type: 'currency' }
];

/**
 * Fetch list of all available currencies
 * Endpoint: /v2/currencies
 */
export const fetchCurrencies = async (forceRefresh = false) => {
  const cached = getCachedCurrencies();
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  if (!forceRefresh && cached && cached.data && Array.isArray(cached.data) && cached.data.length > 0) {
    const isFresh = Date.now() - cached.timestamp < CACHE_TTL_MS;
    if (isFresh || !isOnline) {
      return {
        currencies: cached.data,
        isCached: true,
        cachedAt: cached.cachedAt,
        message: !isOnline ? 'Offline: Using cached currencies list' : 'Loaded from cache'
      };
    }
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(`${API_BASE_V2}/currencies`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Structure: array of { iso_code, name, symbol, type, start_date, end_date }
    let currenciesList = [];
    if (Array.isArray(data)) {
      currenciesList = data;
    } else if (typeof data === 'object') {
      // In case it returns an object of code -> name
      currenciesList = Object.entries(data).map(([code, name]) => ({
        iso_code: code,
        name: typeof name === 'string' ? name : name.name || code,
        symbol: typeof name === 'object' ? name.symbol || '' : '',
        type: 'currency'
      }));
    }

    if (currenciesList.length > 0) {
      setCachedCurrencies(currenciesList);
      return {
        currencies: currenciesList,
        isCached: false,
        cachedAt: null
      };
    }

    throw new Error('Received empty currencies list from API');
  } catch (error) {
    console.warn('Currency list fetch failed, falling back to cache:', error.message);
    if (cached && cached.data && cached.data.length > 0) {
      return {
        currencies: cached.data,
        isCached: true,
        cachedAt: cached.cachedAt,
        error: error.message,
        message: 'Network error: Displaying previously cached currency list'
      };
    }
    return {
      currencies: FALLBACK_CURRENCIES,
      isCached: true,
      cachedAt: new Date().toISOString(),
      error: error.message,
      message: 'Using emergency offline currency list'
    };
  }
};

/**
 * Fetch a single exchange rate between two currencies
 * Endpoint: /v2/rate/{base}/{quote}
 */
export const fetchSingleRate = async (base, quote, forceRefresh = false) => {
  const normBase = (base || 'USD').toUpperCase();
  const normQuote = (quote || 'EUR').toUpperCase();

  // If same currency, rate is always 1.0
  if (normBase === normQuote) {
    return {
      rate: 1.0,
      base: normBase,
      quote: normQuote,
      date: new Date().toISOString().split('T')[0],
      isCached: false,
      cachedAt: null
    };
  }

  const cached = getCachedPair(normBase, normQuote);
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  if (!forceRefresh && cached && cached.rate) {
    const isFresh = Date.now() - cached.timestamp < CACHE_TTL_MS;
    if (isFresh || !isOnline) {
      return {
        rate: cached.rate,
        base: normBase,
        quote: normQuote,
        date: cached.date,
        isCached: true,
        cachedAt: cached.cachedAt,
        message: !isOnline ? 'Offline: Using cached rate' : 'Loaded from cache'
      };
    }
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    const response = await fetch(
      `${API_BASE_V2}/rate/${normBase.toLowerCase()}/${normQuote.toLowerCase()}`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to fetch rate (${response.status}): ${response.statusText}`);
    }

    const data = await response.json();
    // Expected: { date: "2026-11-16", base: "USD", quote: "EUR", rate: 0.90465 }
    const rateValue = parseFloat(data.rate);

    if (isNaN(rateValue)) {
      throw new Error('Invalid rate format received from API');
    }

    setCachedPair(normBase, normQuote, rateValue, data.date);

    return {
      rate: rateValue,
      base: normBase,
      quote: normQuote,
      date: data.date,
      isCached: false,
      cachedAt: null
    };
  } catch (error) {
    console.warn(`Fetch rate ${normBase}->${normQuote} failed:`, error.message);
    if (cached && cached.rate) {
      return {
        rate: cached.rate,
        base: normBase,
        quote: normQuote,
        date: cached.date,
        isCached: true,
        cachedAt: cached.cachedAt,
        error: error.message,
        message: 'Could not fetch live rate. Displaying cached exchange rate (potentially outdated).'
      };
    }
    throw error;
  }
};

/**
 * Fetch multiple exchange rates for a base currency
 * Endpoint: /v2/rates?base={base}&quotes={quotes} or /v2/rates?base={base}
 */
export const fetchMultipleRates = async (base = 'USD', quotes = null, forceRefresh = false) => {
  const normBase = base.toUpperCase();
  const cached = getCachedRates(normBase);
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  if (!forceRefresh && cached && cached.rates && Object.keys(cached.rates).length > 0) {
    const isFresh = Date.now() - cached.timestamp < CACHE_TTL_MS;
    if (isFresh || !isOnline) {
      return {
        base: normBase,
        rates: cached.rates,
        date: cached.date,
        isCached: true,
        cachedAt: cached.cachedAt,
        message: !isOnline ? 'Offline: Using cached exchange rates' : 'Loaded from cache'
      };
    }
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000);

    let url = `${API_BASE_V2}/rates?base=${encodeURIComponent(normBase)}`;
    if (quotes && quotes.length > 0) {
      const quoteStr = Array.isArray(quotes) ? quotes.join(',') : quotes;
      url += `&quotes=${encodeURIComponent(quoteStr)}`;
    }

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to fetch exchange rates (${response.status})`);
    }

    const data = await response.json();
    // v2 returns array of items: [{ date, base, quote, rate }] or object
    const ratesMap = {};
    let rateDate = new Date().toISOString().split('T')[0];

    if (Array.isArray(data)) {
      data.forEach(item => {
        if (item.quote && item.rate !== undefined) {
          ratesMap[item.quote] = parseFloat(item.rate);
          if (item.date) rateDate = item.date;
        }
      });
    } else if (data && typeof data.rates === 'object') {
      Object.assign(ratesMap, data.rates);
      if (data.date) rateDate = data.date;
    }

    // Always include base to base = 1
    ratesMap[normBase] = 1.0;

    setCachedRates(normBase, ratesMap, rateDate);

    return {
      base: normBase,
      rates: ratesMap,
      date: rateDate,
      isCached: false,
      cachedAt: null
    };
  } catch (error) {
    console.warn(`Fetch multiple rates for base ${normBase} failed:`, error.message);
    if (cached && cached.rates) {
      return {
        base: normBase,
        rates: cached.rates,
        date: cached.date,
        isCached: true,
        cachedAt: cached.cachedAt,
        error: error.message,
        message: 'Could not fetch live rates. Displaying cached exchange rates (potentially outdated).'
      };
    }
    throw error;
  }
};

/**
 * Fetch Historical Time Series for Analytics using Frankfurter's official time series endpoint
 * Endpoint: /v1/{startDate}..{endDate}?base={base}&symbols={quote}
 */
export const fetchHistoricalRates = async (base = 'USD', quote = 'EUR', days = 30) => {
  const normBase = base.toUpperCase();
  const normQuote = quote.toUpperCase();

  // If base and quote are same, generate 1.0 series
  if (normBase === normQuote) {
    const points = [];
    const now = new Date();
    for (let i = days; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      points.push({ date: dateStr, rate: 1.0 });
    }
    return {
      base: normBase,
      quote: normQuote,
      data: points,
      isCached: false
    };
  }

  // Calculate start date and end date
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days);

  const startStr = startDate.toISOString().split('T')[0];
  const endStr = endDate.toISOString().split('T')[0];

  const cacheKey = `currencyx_history_series_${normBase}_${normQuote}_${days}`;
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < CACHE_TTL_MS || !isOnline) {
        return {
          ...parsed,
          isCached: true
        };
      }
    }
  } catch {
    // ignore
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const url = `${API_BASE_V1}/${startStr}..${endStr}?base=${normBase}&symbols=${normQuote}`;
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to fetch historical rates (${response.status})`);
    }

    const data = await response.json();
    // Format: data.rates = { "2026-10-15": { "EUR": 0.912 }, ... }
    const timePoints = [];

    if (data.rates && typeof data.rates === 'object') {
      const sortedDates = Object.keys(data.rates).sort();
      sortedDates.forEach(date => {
        const rateObj = data.rates[date];
        if (rateObj && rateObj[normQuote] !== undefined) {
          timePoints.push({
            date,
            rate: parseFloat(rateObj[normQuote])
          });
        }
      });
    }

    const result = {
      base: normBase,
      quote: normQuote,
      startDate: data.start_date || startStr,
      endDate: data.end_date || endStr,
      data: timePoints,
      isCached: false,
      timestamp: Date.now()
    };

    try {
      localStorage.setItem(cacheKey, JSON.stringify(result));
    } catch {
      // storage quota or ignore
    }

    return result;
  } catch (error) {
    console.warn(`Historical rates fetch failed:`, error.message);
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        return {
          ...parsed,
          isCached: true,
          cachedAt: new Date(parsed.timestamp).toISOString(),
          error: error.message,
          message: 'Offline: Displaying cached historical chart data'
        };
      } catch {
        // ignore
      }
    }
    throw error;
  }
};
