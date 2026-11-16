import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Rates from './pages/Rates';
import History from './pages/History';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import { useCurrency } from './hooks/useCurrency';
import { getSettings, saveSettings } from './utils/storage';

export const App = () => {
  const initialSettings = getSettings();
  const [theme, setTheme] = useState(initialSettings.theme || 'dark');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Central currency hook instance
  const currencyContext = useCurrency();

  // Apply Theme class to document root
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    saveSettings({ theme: newTheme });
  };

  return (
    <BrowserRouter>
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#070b14] text-slate-100' : 'bg-slate-50 text-slate-900'} font-sans flex flex-col transition-colors duration-200`}>
        {/* Top Navbar */}
        <Navbar
          theme={theme}
          onToggleTheme={toggleTheme}
          isOnline={currencyContext.isOnline}
          isCached={currencyContext.isCachedRate}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
        />

        <div className="flex-1 flex max-w-7xl w-full mx-auto">
          {/* Collapsible / Responsive Sidebar */}
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />

          {/* Main Workspace Page View */}
          <main className="flex-1 md:ml-60 lg:ml-64 p-4 sm:p-6 lg:p-8 overflow-x-hidden min-h-[calc(100vh-4rem)]">
            <Routes>
              <Route
                path="/"
                element={<Home currencyContext={currencyContext} />}
              />
              <Route
                path="/rates"
                element={<Rates currencyContext={currencyContext} />}
              />
              <Route
                path="/analytics"
                element={<Analytics currencyContext={currencyContext} />}
              />
              <Route
                path="/history"
                element={<History />}
              />
              <Route
                path="/settings"
                element={
                  <Settings
                    theme={theme}
                    onToggleTheme={toggleTheme}
                    currencyContext={currencyContext}
                  />
                }
              />
              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
};

export default App;
