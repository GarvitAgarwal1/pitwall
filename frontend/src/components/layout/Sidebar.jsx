import React from 'react';
import {
  Home,
  Activity,
  Trophy,
  LineChart,
  Gauge,
  Cpu,
  BookOpen,
  Newspaper,
  MapPin,
  Sliders,
  X,
  Zap,
} from 'lucide-react';

export const NAVIGATION_ITEMS = [
  { id: 'home', label: 'Home', icon: Home, badge: null, path: '/' },
  { id: 'live', label: 'Live Timing', icon: Activity, badge: 'LIVE', path: '/live' },
  { id: 'stats', label: 'Historical Stats', icon: Trophy, badge: null, path: '/stats' },
  { id: 'analysis', label: 'Race Analysis', icon: LineChart, badge: null, path: '/analysis' },
  { id: 'telemetry', label: 'Telemetry', icon: Gauge, badge: null, path: '/telemetry' },
  { id: 'strategy', label: 'Strategy Tools', icon: Cpu, badge: null, path: '/strategy' },
  { id: 'guide', label: 'F1 Guide', icon: BookOpen, badge: null, path: '/guide' },
  { id: 'news', label: 'F1 News', icon: Newspaper, badge: null, path: '/news' },
  { id: 'circuits', label: 'Circuits', icon: MapPin, badge: null, path: '/circuits' },
  { id: 'settings', label: 'Settings', icon: Sliders, badge: 'NEW', path: '/settings' },
];

/**
 * Sidebar Navigation Component
 * Features all 10 PitWall views with active route indicators and icons.
 */
export default function Sidebar({
  activeTab = 'home',
  onSelectTab,
  isOpen = false,
  onClose,
  theme = 'dark',
}) {
  const isLight = theme === 'light';

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 flex flex-col transition-all duration-300 ease-in-out lg:translate-x-0 ${
          isLight ? 'bg-white border-r border-slate-200 text-slate-900 shadow-sm' : 'bg-[#151922] border-r border-[#2A3245] text-white'
        } ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* PitWall Brand Header */}
        <div className={`h-16 px-5 border-b flex items-center justify-between ${isLight ? 'border-slate-200' : 'border-[#2A3245]'}`}>
          <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => onSelectTab && onSelectTab('home')}>
            <div className="w-8 h-8 rounded-lg bg-[#E10600] flex items-center justify-center shadow-md shadow-red-900/30 group-hover:scale-105 transition-all">
              <svg viewBox="0 0 28 28" className="w-5 h-5 fill-white" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 21L11 5h5L8 21H3zm10 0l8-16h5l-8 16h-5z" />
              </svg>
            </div>
            <div className="flex items-center gap-1">
              <span className={`font-black italic text-xl tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                PITWALL
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#E10600] mb-2" />
            </div>
          </div>

          <button
            onClick={onClose}
            className={`lg:hidden p-1.5 rounded-lg ${isLight ? 'text-slate-400 hover:text-slate-800 hover:bg-slate-100' : 'text-[#64748B] hover:text-white hover:bg-[#1C2230]'}`}
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAVIGATION_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab && onSelectTab(item.id);
                  onClose && onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-mono font-medium transition-all group ${
                  isActive
                    ? isLight
                      ? 'bg-[#E10600]/10 text-[#E10600] border border-[#E10600]/30 font-bold shadow-sm'
                      : 'bg-[#E10600]/15 text-white border border-[#E10600]/40 shadow-sm'
                    : isLight
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                    : 'text-[#94A3B8] hover:text-white hover:bg-[#1C2230] border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-[#E10600]' : isLight ? 'text-slate-400 group-hover:text-slate-800' : 'text-[#64748B] group-hover:text-white'
                    }`}
                  />
                  <span className="tracking-wide">{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`px-1.5 py-0.5 text-[10px] font-mono font-bold tracking-wider rounded ${
                      isActive
                        ? 'bg-[#E10600] text-white animate-pulse'
                        : item.badge === 'LIVE'
                        ? isLight
                          ? 'bg-red-50 text-red-600 border border-red-200'
                          : 'bg-[#1C2230] text-red-400 border border-red-500/30'
                        : isLight
                        ? 'bg-sky-50 text-sky-700 border border-sky-200'
                        : 'bg-[#1C2230] text-[#00F0FF] border border-[#00F0FF]/30'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer — Status & Attribution */}
        <div className={`p-3.5 border-t ${isLight ? 'border-slate-200 bg-slate-50' : 'border-[#2A3245] bg-[#0B0E14]/50'}`}>
          <div className={`p-2.5 rounded-lg border flex items-center gap-2.5 ${isLight ? 'bg-white border-slate-200' : 'bg-[#1C2230] border-[#2A3245]/70'}`}>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <div className="flex-1 min-w-0">
              <p className={`text-[11px] font-mono font-semibold truncate ${isLight ? 'text-slate-800' : 'text-[#F8FAFC]'}`}>Telemetry Link Active</p>
              <p className={`text-[10px] font-mono truncate ${isLight ? 'text-slate-400' : 'text-[#64748B]'}`}>OpenF1 & Jolpica 2026</p>
            </div>
            <Zap className="w-3.5 h-3.5 text-amber-500" />
          </div>
        </div>
      </aside>
    </>
  );
}

export { Sidebar };
