import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';

/**
 * AppShell
 * Top-level application frame coordinating the responsive Sidebar, TopHeader,
 * light/dark theme modes, and main scrollable content area.
 */
export default function AppShell({
  activeTab = 'home',
  onSelectTab,
  connectionStatus = 'LIVE',
  theme = 'dark',
  onToggleTheme,
  children,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div
      className={`min-h-screen flex flex-col antialiased transition-colors duration-200 ${
        theme === 'light'
          ? 'bg-[#F1F5F9] text-[#0F172A]'
          : 'bg-[#0B0E14] text-[#F8FAFC]'
      }`}
    >
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={onSelectTab}
        isOpen={sidebarOpen}
        onClose={closeSidebar}
      />

      {/* Main Content Area (Offset for desktop sidebar w-64) */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0 transition-all duration-300">
        {/* Top Header Bar */}
        <TopHeader
          activeTab={activeTab}
          onToggleSidebar={toggleSidebar}
          connectionStatus={connectionStatus}
          theme={theme}
          onToggleTheme={onToggleTheme}
          onNavigate={onSelectTab}
        />

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-x-hidden max-w-[1600px] w-full mx-auto">
          {children}
        </main>

        {/* Global Footer */}
        <footer
          className={`px-6 py-4 border-t text-xs font-mono flex flex-col sm:flex-row items-center justify-between gap-2 transition-colors ${
            theme === 'light'
              ? 'bg-[#FFFFFF] border-slate-300 text-slate-500'
              : 'bg-[#12161F] border-[#2A3245] text-[#64748B]'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#E10600]" />
            <span className="font-bold">PitWall — Formula 1 Strategy, Telemetry & Live Timing (2026 Season)</span>
          </div>
          <div>
            <span>Official APIs: Jolpica Ergast & OpenF1</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

export { AppShell };
