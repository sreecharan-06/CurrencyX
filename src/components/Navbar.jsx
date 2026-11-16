import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sun,
  Moon,
  WifiOff,
  Menu,
  X,
  Database
} from 'lucide-react';

export const Navbar = ({
  theme = 'dark',
  onToggleTheme,
  isOnline = true,
  isCached = false,
  isSidebarOpen,
  onToggleSidebar
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/80 backdrop-blur-xl transition-colors duration-200 shadow-sm">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Left: Mobile Menu Trigger + Brand Logo */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-0.5 shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="CurrencyX Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
                  Currency<span className="text-blue-500">X</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.2 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400">
                  LIVE
                </span>
              </div>
              <p className="hidden sm:block text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                Official ECB Reference Rates
              </p>
            </div>
          </Link>
        </div>

        {/* Right: API Network Status & Quick Theme Toggle */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Status Indicator */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-xs">
            {isOnline ? (
              isCached ? (
                <>
                  <Database className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                  <span className="text-slate-700 dark:text-slate-300 font-medium">Cached Mode</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">Frankfurter API Live</span>
                </>
              )
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                <span className="text-amber-600 dark:text-amber-300 font-medium">Offline Cache</span>
              </>
            )}
          </div>

          {/* Theme Switcher Button */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900/90 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 hover:rotate-90 transition-transform duration-300" />
            ) : (
              <Moon className="w-4 h-4 text-blue-600 hover:-rotate-12 transition-transform duration-300" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
