/**
 * CurrencyX - Converter & Formatting Utilities
 */

// Mapping of Currency Code to ISO 3166-1 alpha-2 country code for flags
export const CURRENCY_COUNTRY_MAP = {
  USD: 'us',
  EUR: 'eu',
  GBP: 'gb',
  INR: 'in',
  JPY: 'jp',
  CAD: 'ca',
  AUD: 'au',
  CHF: 'ch',
  CNY: 'cn',
  HKD: 'hk',
  NZD: 'nz',
  SGD: 'sg',
  KRW: 'kr',
  SEK: 'se',
  NOK: 'no',
  DKK: 'dk',
  MXN: 'mx',
  BRL: 'br',
  ZAR: 'za',
  TRY: 'tr',
  PLN: 'pl',
  THB: 'th',
  IDR: 'id',
  HUF: 'hu',
  CZK: 'cz',
  ILS: 'il',
  CLP: 'cl',
  PHP: 'ph',
  AED: 'ae',
  COP: 'co',
  SAR: 'sa',
  MYR: 'my',
  RON: 'ro',
  BGN: 'bg',
  ISK: 'is',
  HRK: 'hr',
  RUB: 'ru',
  NGN: 'ng',
  EGP: 'eg',
  PKR: 'pk',
  BDT: 'bd',
  VND: 'vn',
  ARS: 'ar',
  UAH: 'ua',
  KWD: 'kw',
  QAR: 'qa',
  OMR: 'om',
  BHD: 'bh',
  TWD: 'tw',
  KES: 'ke',
  GHS: 'gh',
  LKR: 'lk',
  MAD: 'ma'
};

// Common currency symbols map for immediate fallback
export const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
  JPY: '¥',
  CNY: '¥',
  CAD: 'CA$',
  AUD: 'A$',
  CHF: 'CHF',
  HKD: 'HK$',
  NZD: 'NZ$',
  SGD: 'S$',
  KRW: '₩',
  SEK: 'kr',
  NOK: 'kr',
  DKK: 'kr',
  MXN: 'Mex$',
  BRL: 'R$',
  ZAR: 'R',
  TRY: '₺',
  PLN: 'zł',
  THB: '฿',
  IDR: 'Rp',
  HUF: 'Ft',
  CZK: 'Kč',
  ILS: '₪',
  PHP: '₱',
  AED: 'د.إ',
  SAR: '﷼',
  MYR: 'RM',
  BTC: '₿',
  ETH: 'Ξ'
};

/**
 * Returns flag emoji for a given currency code
 */
export const getCurrencyFlagEmoji = (currencyCode) => {
  if (!currencyCode) return '🌐';
  const code = currencyCode.toUpperCase();
  const country = CURRENCY_COUNTRY_MAP[code];

  if (!country || country === 'eu') {
    if (code === 'EUR') return '🇪🇺';
    if (code === 'XAU' || code === 'XAG' || code === 'XPT') return '🪙';
    if (code === 'BTC' || code === 'ETH') return '⚡';
    // Fallback: derive first two letters if standard ISO currency
    const fallbackCountry = code.slice(0, 2);
    if (/^[A-Z]{2}$/.test(fallbackCountry)) {
      return String.fromCodePoint(
        ...fallbackCountry.split('').map(c => 127397 + c.charCodeAt(0))
      );
    }
    return '🌐';
  }

  // Convert two letter country code to emoji flag
  return String.fromCodePoint(
    ...country.toUpperCase().split('').map(c => 127397 + c.charCodeAt(0))
  );
};

/**
 * Returns flag image URL from CDN (with reliable high-res SVG or PNG)
 */
export const getCurrencyFlagUrl = (currencyCode) => {
  if (!currencyCode) return null;
  const code = currencyCode.toUpperCase();
  const country = CURRENCY_COUNTRY_MAP[code];
  if (!country) return null;
  return `https://flagcdn.com/w40/${country.toLowerCase()}.png`;
};

/**
 * Calculate converted amount
 */
export const calculateConversion = (amount, rate) => {
  const numAmount = parseFloat(amount);
  const numRate = parseFloat(rate);
  if (isNaN(numAmount) || isNaN(numRate)) return 0;
  return numAmount * numRate;
};

/**
 * Format currency amount with precision and optional symbol
 */
export const formatAmount = (amount, precision = 2) => {
  if (amount === undefined || amount === null || isNaN(amount)) return '0.00';
  const num = parseFloat(amount);

  // If very small number, use more precision dynamically
  if (num > 0 && num < 0.0001) {
    return num.toExponential(4);
  } else if (num > 0 && num < 0.01) {
    return num.toFixed(6);
  }

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: Math.min(2, precision),
    maximumFractionDigits: precision
  }).format(num);
};

/**
 * Format full currency with code/symbol
 */
export const formatCurrency = (amount, currencyCode = 'USD', precision = 2) => {
  const formatted = formatAmount(amount, precision);
  const symbol = CURRENCY_SYMBOLS[currencyCode.toUpperCase()] || '';
  return symbol ? `${symbol} ${formatted}` : `${formatted} ${currencyCode}`;
};

/**
 * Format exchange rate display (e.g. 1 USD = 0.9234 EUR)
 */
export const formatRateDisplay = (rate, from = 'USD', to = 'EUR', precision = 4) => {
  if (!rate || isNaN(rate)) return '-';
  const formattedRate = formatAmount(rate, precision);
  return `1 ${from} = ${formattedRate} ${to}`;
};

/**
 * Format inverse rate display (e.g. 1 EUR = 1.0829 USD)
 */
export const formatInverseRateDisplay = (rate, from = 'USD', to = 'EUR', precision = 4) => {
  if (!rate || isNaN(rate) || rate === 0) return '-';
  const inverse = 1 / parseFloat(rate);
  return `1 ${to} = ${formatAmount(inverse, precision)} ${from}`;
};

/**
 * Validate currency input string
 */
export const isValidAmount = (value) => {
  if (value === '' || value === null || value === undefined) return false;
  const num = Number(value);
  return !isNaN(num) && num > 0 && isFinite(num);
};

/**
 * Clean and sanitize user input for amount
 */
export const sanitizeAmountInput = (input) => {
  // Allow only numbers and single decimal dot
  let cleaned = input.replace(/[^0-9.]/g, '');
  const parts = cleaned.split('.');
  if (parts.length > 2) {
    cleaned = parts[0] + '.' + parts.slice(1).join('');
  }
  return cleaned;
};

/**
 * Format Date cleanly
 */
export const formatDateClean = (dateInput) => {
  if (!dateInput) return 'N/A';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return String(dateInput);
  }
};

/**
 * Format Time cleanly
 */
export const formatTimeClean = (dateInput) => {
  if (!dateInput) return '';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch {
    return '';
  }
};

/**
 * Relative time description (e.g., "5 mins ago", "Just now")
 */
export const timeAgo = (timestamp) => {
  if (!timestamp) return 'Unknown';
  const elapsed = Math.floor((Date.now() - Number(timestamp)) / 1000);
  if (elapsed < 30) return 'Just now';
  if (elapsed < 60) return `${elapsed}s ago`;
  const mins = Math.floor(elapsed / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};
