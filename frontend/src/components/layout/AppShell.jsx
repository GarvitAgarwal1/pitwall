import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';

/**
 * AppShell
 * Top-level application frame coordinating the responsive Sidebar, TopHeader,
 * and main scrollable content area.
 */
export default function AppShell({
  activeTab = 'home',
  onSelectTab,
  connectionStatus = 'SIMULATED',
  children,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-[#0B0E14] text-[#F8FAFC] flex flex-col antialiased">
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
        />

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-x-hidden max-w-[1600px] w-full mx-auto">
          {children}
        </main>

        {/* Global Footer */}
        <footer className="px-6 py-4 border-t border-[#2A3245] bg-[#12161F] text-xs font-mono text-[#64748B] flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#E10600]" />
            <span>PitWall — Formula 1 Strategy, Telemetry & Live Timing Showcase</span>
          </div>
          <div>
            <span>Data powered by Jolpica Ergast & OpenF1 APIs</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

export { AppShell };
