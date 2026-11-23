import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';
import {
  Home,
  Activity,
  Trophy,
  Gauge,
  MapPin,
  Menu,
  Sliders,
  ChevronUp,
} from 'lucide-react';

/**
 * AppShell
 * High-performance responsive paddock frame with desktop sidebar and
 * mobile-first ergonomic bottom telemetry dock.
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

  const isLight = theme === 'light';

  // Primary mobile navigation items
  const MOBILE_NAV_ITEMS = [
    { id: 'home', label: '2026 Hub', icon: Home },
    { id: 'live', label: 'Live Timing', icon: Activity, badge: 'LIVE' },
    { id: 'stats', label: 'Stats Archive', icon: Trophy },
    { id: 'telemetry', label: 'Telemetry', icon: Gauge },
    { id: 'circuits', label: 'Circuits', icon: MapPin },
  ];

  return (
    <div
      className={`min-h-screen flex flex-col antialiased transition-colors duration-200 ${
        isLight
          ? 'bg-[#F8FAFC] text-[#0F172A]'
          : 'bg-[#0B0E14] text-[#F8FAFC]'
      }`}
    >
      {/* Sidebar Navigation (Desktop fixed + Mobile slide-over drawer) */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={(tabId) => {
          onSelectTab && onSelectTab(tabId);
          closeSidebar();
        }}
        isOpen={sidebarOpen}
        onClose={closeSidebar}
        theme={theme}
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

        {/* Dynamic Page Content (With bottom padding for mobile dock) */}
        <main className="flex-1 p-3 sm:p-4 lg:p-6 pb-24 lg:pb-8 overflow-x-hidden max-w-[1600px] w-full mx-auto">
          {children}
        </main>

        {/* Global Footer (Desktop visible, condensed on mobile) */}
        <footer
          className={`px-4 lg:px-6 py-4 border-t text-xs font-mono flex flex-col sm:flex-row items-center justify-between gap-2 mb-16 lg:mb-0 transition-colors ${
            isLight
              ? 'bg-white border-slate-200 text-slate-500'
              : 'bg-[#12161F] border-[#2A3245] text-[#64748B]'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#E10600] animate-pulse" />
            <span className="font-bold tracking-tight">PitWall F1 — Paddock Strategy & Live Telemetry (2026 Season)</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Official APIs: Jolpica Ergast & OpenF1</span>
            <span>•</span>
            <span className="text-[#00F0FF]">FIA Regulations 2026 Compliant</span>
          </div>
        </footer>
      </div>

      {/* ==================== MOBILE FLOATING BOTTOM NAVIGATION DOCK ==================== */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 px-3 pb-safe pt-2 pointer-events-none">
        <nav
          className={`pointer-events-auto mx-auto max-w-md rounded-2xl border backdrop-blur-xl px-2 py-1.5 shadow-2xl flex items-center justify-around transition-all ${
            isLight
              ? 'bg-white/95 border-slate-200 shadow-slate-300/50'
              : 'bg-[#12161F]/95 border-[#2A3245] shadow-black/80'
          }`}
        >
          {MOBILE_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab && onSelectTab(item.id)}
                className={`relative flex flex-col items-center justify-center py-1.5 px-2.5 rounded-xl transition-all ${
                  isActive
                    ? 'text-[#E10600] scale-105'
                    : isLight
                      ? 'text-slate-500 hover:text-slate-900'
                      : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {item.badge && (
                    <span className="absolute -top-1 -right-2 w-2 h-2 rounded-full bg-[#E10600] animate-pulse" />
                  )}
                </div>
                <span className={`text-[10px] font-mono tracking-tight mt-0.5 ${isActive ? 'font-black' : 'font-medium'}`}>
                  {item.label}
                </span>

                {/* Active Indicator Pip */}
                {isActive && (
                  <span className="absolute -bottom-1 w-4 h-0.5 rounded-full bg-[#E10600]" />
                )}
              </button>
            );
          })}

          {/* More / Menu Drawer Toggle */}
          <button
            onClick={toggleSidebar}
            className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all ${
              sidebarOpen
                ? 'text-[#E10600]'
                : isLight
                  ? 'text-slate-500 hover:text-slate-900'
                  : 'text-[#94A3B8] hover:text-white'
            }`}
            title="Open Paddock Menu"
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px] font-mono font-medium tracking-tight mt-0.5">
              Menu
            </span>
          </button>
        </nav>
      </div>
    </div>
  );
}

export { AppShell };
