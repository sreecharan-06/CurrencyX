/**
 * CurrencyX - Custom React Hook: useCurrency
 * Central state and data fetching management for currency conversions.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchCurrencies, fetchSingleRate } from '../services/currencyAPI';
import {
  getSettings,
  getFavorites,
  toggleFavorite as toggleFavStorage,
  saveHistoryItem
} from '../utils/storage';
import { calculateConversion, sanitizeAmountInput, isValidAmount } from '../utils/converter';

export const useCurrency = () => {
  const settings = getSettings();

  // Currencies metadata state
  const [currencies, setCurrencies] = useState([]);
  const [isLoadingCurrencies, setIsLoadingCurrencies] = useState(true);
  const [currencyError, setCurrencyError] = useState(null);
  const [currenciesCachedInfo, setCurrenciesCachedInfo] = useState({ isCached: false, cachedAt: null });

  // Conversion core state
  const [fromCurrency, setFromCurrency] = useState(settings.defaultFrom || 'USD');
  const [toCurrency, setToCurrency] = useState(settings.defaultTo || 'EUR');
  const [amount, setAmount] = useState('100');
  const [convertedAmount, setConvertedAmount] = useState(null);
  
  // Rate metadata
  const [rate, setRate] = useState(null);
  const [rateDate, setRateDate] = useState(null);
  const [isCachedRate, setIsCachedRate] = useState(false);
  const [cachedRateAt, setCachedRateAt] = useState(null);
  const [rateNotice, setRateNotice] = useState(null);
  
  // Status states
  const [isLoadingRate, setIsLoadingRate] = useState(false);
  const [rateError, setRateError] = useState(null);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Favorites
  const [favorites, setFavorites] = useState(getFavorites());

  // Keep track of active requests
  const requestRef = useRef(0);

  // Network online/offline listener
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load available currencies on mount
  const loadCurrencies = useCallback(async (force = false) => {
    setIsLoadingCurrencies(true);
    setCurrencyError(null);
    try {
      const res = await fetchCurrencies(force);
      setCurrencies(res.currencies || []);
      setCurrenciesCachedInfo({
        isCached: res.isCached,
        cachedAt: res.cachedAt,
        message: res.message
      });
    } catch (err) {
      setCurrencyError(err.message || 'Failed to load currencies');
    } finally {
      setIsLoadingCurrencies(false);
    }
  }, []);

  useEffect(() => {
    loadCurrencies();
  }, [loadCurrencies]);

  // Fetch exchange rate between fromCurrency and toCurrency
  const fetchRate = useCallback(async (base, quote, force = false) => {
    const from = (base || fromCurrency).toUpperCase();
    const to = (quote || toCurrency).toUpperCase();

    if (from === to) {
      setRate(1.0);
      setRateDate(new Date().toISOString().split('T')[0]);
      setIsCachedRate(false);
      setCachedRateAt(null);
      setRateNotice(null);
      setRateError(null);
      setIsLoadingRate(false);
      return 1.0;
    }

    const currentRequestId = ++requestRef.current;
    setIsLoadingRate(true);
    setRateError(null);

    try {
      const res = await fetchSingleRate(from, to, force);
      if (currentRequestId === requestRef.current) {
        setRate(res.rate);
        setRateDate(res.date);
        setIsCachedRate(res.isCached);
        setCachedRateAt(res.cachedAt);
        setRateNotice(res.message || null);
        return res.rate;
      }
    } catch (err) {
      if (currentRequestId === requestRef.current) {
        setRateError(err.message || 'Unable to retrieve exchange rate');
        setRate(null);
      }
    } finally {
      if (currentRequestId === requestRef.current) {
        setIsLoadingRate(false);
      }
    }
    return null;
  }, [fromCurrency, toCurrency]);

  // Trigger rate fetch when currency selection changes
  useEffect(() => {
    fetchRate(fromCurrency, toCurrency);
  }, [fromCurrency, toCurrency, fetchRate]);

  // Recalculate converted amount when amount or rate changes
  useEffect(() => {
    if (isValidAmount(amount) && rate !== null && rate !== undefined) {
      const result = calculateConversion(amount, rate);
      setConvertedAmount(result);
    } else {
      setConvertedAmount(null);
    }
  }, [amount, rate]);

  // Swap currencies
  const swapCurrencies = useCallback(() => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  }, [fromCurrency, toCurrency]);

  // Update Amount safely
  const updateAmount = useCallback((val) => {
    const sanitized = sanitizeAmountInput(val);
    setAmount(sanitized);
  }, []);

  // Explicit Convert & Record to history
  const performConvert = useCallback((customAmount = null) => {
    const targetAmount = customAmount !== null ? customAmount : amount;
    if (!isValidAmount(targetAmount) || rate === null) {
      return null;
    }

    const calculated = calculateConversion(targetAmount, rate);
    setConvertedAmount(calculated);

    // Save to conversion history
    const historyItem = saveHistoryItem({
      fromCurrency,
      toCurrency,
      fromAmount: parseFloat(targetAmount),
      toAmount: calculated,
      rate,
      rateDate,
      isCached: isCachedRate
    });

    return {
      convertedAmount: calculated,
      historyItem
    };
  }, [amount, rate, fromCurrency, toCurrency, rateDate, isCachedRate]);

  // Reset conversion state
  const reset = useCallback(() => {
    setAmount('100');
    setFromCurrency(settings.defaultFrom || 'USD');
    setToCurrency(settings.defaultTo || 'EUR');
    setRateError(null);
  }, [settings.defaultFrom, settings.defaultTo]);

  // Toggle favorite currency
  const toggleFavoriteCurrency = useCallback((code) => {
    const updated = toggleFavStorage(code);
    setFavorites(updated);
  }, []);

  return {
    // Currencies list
    currencies,
    isLoadingCurrencies,
    currencyError,
    currenciesCachedInfo,
    refreshCurrencies: () => loadCurrencies(true),

    // Conversion state
    fromCurrency,
    setFromCurrency,
    toCurrency,
    setToCurrency,
    amount,
    setAmount: updateAmount,
    convertedAmount,
    rate,
    inverseRate: rate && rate > 0 ? 1 / rate : null,
    rateDate,
    isCachedRate,
    cachedRateAt,
    rateNotice,

    // Status
    isLoadingRate,
    rateError,
    isOnline,

    // Actions
    swapCurrencies,
    convert: performConvert,
    reset,
    refreshRate: () => fetchRate(fromCurrency, toCurrency, true),

    // Favorites
    favorites,
    toggleFavorite: toggleFavoriteCurrency
  };
};
