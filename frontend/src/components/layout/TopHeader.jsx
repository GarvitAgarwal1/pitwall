import React, { useState, useEffect } from 'react';
import { Menu, Sun, Moon, Sliders, Flag, ShieldCheck } from 'lucide-react';
import { formatCountdown } from '../../utils/formatters';

/**
 * TopHeader
 * Top navigation bar with theme switcher, 2026 GP countdown, and settings quick-action.
 */
export default function TopHeader({
  activeTab = 'home',
  onToggleSidebar,
  connectionStatus = 'LIVE',
  theme = 'dark',
  onToggleTheme,
  onNavigate,
  nextRace = {
    name: 'São Paulo Grand Prix',
    circuit: 'Interlagos',
    date: '2026-11-15T17:00:00Z',
  },
}) {
  const [timeLeft, setTimeLeft] = useState({
    days: '01',
    hours: '04',
    minutes: '32',
    seconds: '18',
  });

  useEffect(() => {
    function updateCountdown() {
      if (!nextRace?.date) return;
      const targetTime = new Date(nextRace.date).getTime();
      const now = Date.now();
      const diffSecs = Math.max(0, Math.floor((targetTime - now) / 1000));
      if (diffSecs > 0) {
        setTimeLeft(formatCountdown(diffSecs));
      } else {
        const fallbackSecs = 1 * 86400 + 4 * 3600 + 32 * 60 + (60 - (Math.floor(now / 1000) % 60));
        setTimeLeft(formatCountdown(fallbackSecs));
      }
    }

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [nextRace?.date]);

  const viewTitles = {
    home: 'Season Overview & Championship Standings (2026)',
    live: 'Live Timing Tower & Race Control',
    stats: 'Historical Archive (1950–Present Hall of Fame)',
    analysis: 'Post-Race Telemetry & Strategy Analysis',
    telemetry: 'Dual-Driver Car Telemetry Comparison',
    strategy: 'Pit Window Detector & Race Predictor',
    guide: 'Formula 1 Regulations & Technical Guide',
    news: 'Motorsport RSS News Feed',
    circuits: 'Grand Prix Modern Circuits Directory (2021–2026)',
    settings: 'Dashboard Settings & Preferences',
  };

  const title = viewTitles[activeTab] || 'Formula 1 Strategy & Telemetry';

  return (
    <header className="h-16 px-4 lg:px-6 bg-[#151922]/90 backdrop-blur-md border-b border-[#2A3245] sticky top-0 z-30 flex items-center justify-between gap-4">
      {/* Left: Mobile Menu Toggle & Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-[#94A3B8] hover:text-white rounded-lg hover:bg-[#1C2230] border border-[#2A3245]"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-sm lg:text-base font-bold text-[#F8FAFC] tracking-tight truncate uppercase">
              {title}
            </h1>
            <span className="hidden md:inline-block w-1.5 h-1.5 rounded-full bg-[#E10600]" />
          </div>
          <p className="hidden md:block text-[11px] font-mono text-[#64748B] truncate">
            Formula 1 Official Data Streams • Season 2026
          </p>
        </div>
      </div>

      {/* Right: Next GP Countdown Pill, Theme Toggle, & Settings */}
      <div className="flex items-center gap-2 lg:gap-3 shrink-0">
        {/* Next Race Countdown Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-[#1C2230] border border-[#2A3245] rounded-full text-xs font-mono">
          <div className="flex items-center gap-1.5 text-[#E10600]">
            <Flag className="w-3.5 h-3.5" />
            <span className="font-bold uppercase tracking-wider text-[10px] text-[#94A3B8] hidden xl:inline">
              Next GP:
            </span>
          </div>
          <span className="font-bold text-[#F8FAFC] tracking-wide hidden lg:inline">
            {nextRace?.name?.replace('Grand Prix', 'GP') || 'Next Race'}
          </span>
          <span className="text-[#00F0FF] font-bold tabular-nums">
            {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
          </span>
        </div>

        {/* Theme Mode Toggle (Sun/Moon) */}
        <button
          onClick={() => onToggleTheme && onToggleTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 text-[#94A3B8] hover:text-white rounded-lg bg-[#1C2230] border border-[#2A3245] hover:border-[#64748B] transition-colors"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-[#00F0FF]" />
          )}
        </button>

        {/* Quick Settings Shortcut */}
        <button
          onClick={() => onNavigate && onNavigate('settings')}
          className="p-2 text-[#94A3B8] hover:text-white rounded-lg bg-[#1C2230] border border-[#2A3245] hover:border-[#64748B] transition-colors"
          title="Open Settings"
        >
          <Sliders className="w-4 h-4" />
        </button>

        {/* Status Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold">{connectionStatus}</span>
        </div>
      </div>
    </header>
  );
}

export { TopHeader };
