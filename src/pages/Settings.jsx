import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Sun,
  Moon,
  Trash2,
  RotateCcw,
  Database,
  ShieldCheck,
  ExternalLink,
  Check
} from 'lucide-react';
import CurrencyDropdown from '../components/CurrencyDropdown';
import Toast from '../components/Toast';
import {
  getSettings,
  saveSettings,
  resetSettings,
  clearHistory
} from '../utils/storage';

export const Settings = ({
  theme,
  onToggleTheme,
  currencyContext
}) => {
  const { currencies, favorites, toggleFavorite } = currencyContext;
  const [settings, setLocalSettings] = useState(getSettings());
  const [toastMessage, setToastMessage] = useState(null);
  const [confirmClearHistory, setConfirmClearHistory] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleUpdate = (updates) => {
    const updated = saveSettings(updates);
    setLocalSettings(updated);
    setToastMessage({ message: 'Settings saved successfully', type: 'success' });
  };

  const handleClearHistory = () => {
    clearHistory();
    setConfirmClearHistory(false);
    setToastMessage({ message: 'Conversion history cleared', type: 'info' });
  };

  const handleResetDefaults = () => {
    const defaults = resetSettings();
    setLocalSettings(defaults);
    setConfirmReset(false);
    setToastMessage({ message: 'Preferences reset to initial defaults', type: 'info' });
  };

  const handleClearLocalStorageCache = () => {
    // Clear only currencyx cache keys
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('currencyx_rates_cache_') || key.startsWith('currencyx_pair_cache_') || key.startsWith('currencyx_history_series_')) {
        localStorage.removeItem(key);
      }
    });
    setToastMessage({ message: 'Local exchange rates cache purged', type: 'info' });
  };

  return (
    <div className="space-y-8 max-w-4xl animate-in fade-in duration-300">
      {toastMessage && (
        <Toast
          message={toastMessage.message}
          type={toastMessage.type}
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* Page Title */}
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Settings & Preferences
          </h1>
          <span className="px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold">
            System
          </span>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Customize your default conversion currency pairs, UI appearance, and local storage cache.
        </p>
      </div>

      <div className="space-y-6">
        {/* Appearance / Theme */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sun className="w-4 h-4 text-amber-500" /> Interface Appearance
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Select your preferred display theme for dashboard navigation and components.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 max-w-md pt-2">
            <button
              type="button"
              onClick={() => {
                if (theme !== 'dark') onToggleTheme();
              }}
              className={`flex items-center justify-center gap-2.5 p-3.5 rounded-2xl border font-semibold text-sm transition-all ${
                theme === 'dark'
                  ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-500/10'
                  : 'bg-slate-100 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Moon className="w-4 h-4 text-blue-400" />
              <span>Dark Theme</span>
              {theme === 'dark' && <Check className="w-4 h-4 text-blue-400 ml-auto" />}
            </button>

            <button
              type="button"
              onClick={() => {
                if (theme !== 'light') onToggleTheme();
              }}
              className={`flex items-center justify-center gap-2.5 p-3.5 rounded-2xl border font-semibold text-sm transition-all ${
                theme === 'light'
                  ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-lg shadow-blue-500/10'
                  : 'bg-slate-100 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sun className="w-4 h-4 text-amber-500" />
              <span>Light Theme</span>
              {theme === 'light' && <Check className="w-4 h-4 text-blue-600 ml-auto" />}
            </button>
          </div>
        </div>

        {/* Currency Defaults */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <SettingsIcon className="w-4 h-4 text-blue-500" /> Default Currencies
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Choose the default source and target currencies loaded on the Converter page.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <CurrencyDropdown
                selectedCurrency={settings.defaultFrom || 'USD'}
                onSelect={(code) => handleUpdate({ defaultFrom: code })}
                currencies={currencies}
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
                label="Default Source Currency"
              />
            </div>

            <div>
              <CurrencyDropdown
                selectedCurrency={settings.defaultTo || 'EUR'}
                onSelect={(code) => handleUpdate({ defaultTo: code })}
                currencies={currencies}
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
                label="Default Target Currency"
              />
            </div>
          </div>
        </div>

        {/* Calculation & Precision */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-500" /> Decimal Precision
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Set the number of decimal digits displayed for exchange calculations.
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            {[2, 3, 4, 6].map((dec) => {
              const isSelected = settings.precision === dec;
              return (
                <button
                  key={dec}
                  type="button"
                  onClick={() => handleUpdate({ precision: dec })}
                  className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-1 ring-blue-400'
                      : 'bg-slate-100 dark:bg-slate-950/60 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {dec} decimals (0.{'0'.repeat(dec)})
                </button>
              );
            })}
          </div>
        </div>

        {/* Storage, Cache & Data Maintenance */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-rose-500" /> Data & Local Storage Maintenance
          </h2>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {/* Clear History */}
            <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Clear Conversion History
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Permanently deletes all saved conversions from this device.
                </p>
              </div>

              {confirmClearHistory ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleClearHistory}
                    className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors"
                  >
                    Confirm Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmClearHistory(false)}
                    className="px-3.5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmClearHistory(true)}
                  className="px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 border border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs font-semibold transition-colors self-start sm:self-auto"
                >
                  Clear History
                </button>
              )}
            </div>

            {/* Clear Local Cache */}
            <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Purge Cached Exchange Rates
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Removes cached offline exchange rate records to force fresh downloads.
                </p>
              </div>

              <button
                type="button"
                onClick={handleClearLocalStorageCache}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors self-start sm:self-auto"
              >
                Purge Cache
              </button>
            </div>

            {/* Reset All Settings */}
            <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Reset App Preferences
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Revert all configuration values to their factory defaults.
                </p>
              </div>

              {confirmReset ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetDefaults}
                    className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-colors"
                  >
                    Confirm Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    className="px-3.5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmReset(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors self-start sm:self-auto"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset Defaults
                </button>
              )}
            </div>
          </div>
        </div>

        {/* API Attribution & Disclaimer */}
        <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 space-y-3 text-xs text-slate-500 dark:text-slate-400 leading-relaxed shadow-sm">
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-300 font-semibold text-sm">
            <ShieldCheck className="w-4 h-4 text-blue-500" /> About CurrencyX & API Attribution
          </div>
          <p>
            <strong>CurrencyX</strong> is a production-grade live currency exchange application developed with React, Tailwind CSS, Vite, and Recharts. Exchange rates and currency pairs are sourced from the open-source{' '}
            <a
              href="https://frankfurter.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 font-medium"
            >
              Frankfurter API <ExternalLink className="w-3 h-3" />
            </a>
            , which tracks reference rates published by the European Central Bank (ECB).
          </p>
          <div className="p-3 rounded-xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
            <strong>Important Disclaimer:</strong> ECB reference exchange rates are published once per working day (around 16:00 CET) for informational purposes. They are reference midpoint rates and do not represent live retail or trading bid/ask spreads.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
