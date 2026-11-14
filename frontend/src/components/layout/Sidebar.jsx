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
}) {
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
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#151922] border-r border-[#2A3245] flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* PitWall Brand Header */}
        <div className="h-16 px-5 border-b border-[#2A3245] flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectTab && onSelectTab('home')}>
            <div className="w-9 h-9 rounded-lg bg-[#E10600] flex items-center justify-center shadow-lg shadow-red-900/40">
              <span className="font-mono font-black text-white text-lg tracking-tighter">PW</span>
            </div>
            <div>
              <span className="font-display font-black text-white text-lg tracking-wider block leading-none">
                PITWALL
              </span>
              <span className="text-[10px] font-mono text-[#E10600] uppercase tracking-widest font-bold">
                F1 STRATEGY 2026
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-[#64748B] hover:text-white rounded-lg hover:bg-[#1C2230]"
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
                    ? 'bg-[#E10600]/15 text-white border border-[#E10600]/40 shadow-sm'
                    : 'text-[#94A3B8] hover:text-white hover:bg-[#1C2230] border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-[#E10600]' : 'text-[#64748B] group-hover:text-white'
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
                        ? 'bg-[#1C2230] text-red-400 border border-red-500/30'
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
        <div className="p-3.5 border-t border-[#2A3245] bg-[#0B0E14]/50">
          <div className="p-2.5 rounded-lg bg-[#1C2230] border border-[#2A3245]/70 flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-mono font-semibold text-[#F8FAFC] truncate">Telemetry Link Active</p>
              <p className="text-[10px] font-mono text-[#64748B] truncate">OpenF1 & Jolpica 2026</p>
            </div>
            <Zap className="w-3.5 h-3.5 text-amber-400" />
          </div>
        </div>
      </aside>
    </>
  );
}

export { Sidebar };
