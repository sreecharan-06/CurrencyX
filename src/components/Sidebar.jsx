import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Coins,
  TrendingUp,
  History,
  BarChart3,
  Settings,
  ExternalLink,
  Globe2
} from 'lucide-react';

const NAV_ITEMS = [
  {
    path: '/',
    label: 'Converter',
    description: 'Instant currency conversion',
    icon: Coins
  },
  {
    path: '/rates',
    label: 'Live Rates',
    description: 'Real-time multi-currency board',
    icon: TrendingUp
  },
  {
    path: '/analytics',
    label: 'Analytics',
    description: 'Historical charts & volatility',
    icon: BarChart3
  },
  {
    path: '/history',
    label: 'History',
    description: 'Audit log & CSV export',
    icon: History
  },
  {
    path: '/settings',
    label: 'Settings',
    description: 'Preferences & defaults',
    icon: Settings
  }
];

export const Sidebar = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden animate-in fade-in"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 md:w-60 lg:w-64 bg-white/95 dark:bg-slate-950/95 border-r border-slate-200 dark:border-slate-800/80 p-4 flex flex-col justify-between transition-transform duration-300 ease-in-out md:translate-x-0 shadow-sm md:shadow-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Navigation Items */}
        <div className="space-y-6">
          <div className="px-3 pt-2">
            <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500 select-none">
              Navigation
            </span>
          </div>

          <nav className="space-y-1.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  onClick={() => {
                    if (window.innerWidth < 768) onClose();
                  }}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-semibold transition-all group ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900/80'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${
                          isActive ? 'text-white' : 'text-slate-400 dark:text-slate-400 group-hover:text-blue-500'
                        }`}
                      />
                      <div className="truncate">
                        <span className="block leading-tight">{item.label}</span>
                        <span
                          className={`text-[10px] font-normal truncate block ${
                            isActive ? 'text-blue-100' : 'text-slate-400 dark:text-slate-400'
                          }`}
                        >
                          {item.description}
                        </span>
                      </div>
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Info Card */}
        <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-gradient-to-br dark:from-slate-900/90 dark:to-blue-950/40 border border-slate-200 dark:border-slate-800/80 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-300">
            <Globe2 className="w-4 h-4 text-blue-500 dark:text-blue-400" />
            <span>Frankfurter API</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            European Central Bank reference data with zero tracking & client-side caching.
          </p>
          <a
            href="https://frankfurter.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white transition-colors"
          >
            Frankfurter Docs <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
