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
  const isLight = theme === 'light';

  return (
    <header className={`h-16 px-4 lg:px-6 backdrop-blur-md border-b sticky top-0 z-30 flex items-center justify-between gap-4 transition-colors ${
      isLight ? 'bg-white/95 border-slate-200 text-slate-900 shadow-sm' : 'bg-[#151922]/90 border-[#2A3245] text-[#F8FAFC]'
    }`}>
      {/* Left: Mobile Menu Toggle & Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          className={`lg:hidden p-2 rounded-lg border transition-colors ${
            isLight
              ? 'text-slate-600 hover:text-slate-900 bg-slate-100 border-slate-200'
              : 'text-[#94A3B8] hover:text-white bg-[#1C2230] border-[#2A3245]'
          }`}
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="lg:hidden flex items-center gap-1.5 cursor-pointer mr-1" onClick={() => onNavigate && onNavigate('home')}>
          <div className="w-7 h-7 rounded-lg bg-[#E10600] flex items-center justify-center shadow-sm">
            <svg viewBox="0 0 28 28" className="w-4 h-4 fill-white" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 21L11 5h5L8 21H3zm10 0l8-16h5l-8 16h-5z" />
            </svg>
          </div>
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className={`text-sm lg:text-base font-bold tracking-tight truncate uppercase ${
              isLight ? 'text-slate-900' : 'text-[#F8FAFC]'
            }`}>
              {title}
            </h1>
            <span className="hidden md:inline-block w-1.5 h-1.5 rounded-full bg-[#E10600]" />
          </div>
          <p className={`hidden md:block text-[11px] font-mono truncate ${
            isLight ? 'text-slate-500' : 'text-[#64748B]'
          }`}>
            Formula 1 Official Data Streams • Season 2026
          </p>
        </div>
      </div>

      {/* Right: Next GP Countdown Pill, Theme Toggle, & Settings */}
      <div className="flex items-center gap-2 lg:gap-3 shrink-0">
        {/* Next Race Countdown Pill */}
        <div className={`hidden sm:flex items-center gap-2 px-3 py-1 border rounded-full text-xs font-mono ${
          isLight ? 'bg-slate-100 border-slate-200 text-slate-800' : 'bg-[#1C2230] border-[#2A3245] text-[#F8FAFC]'
        }`}>
          <div className="flex items-center gap-1.5 text-[#E10600]">
            <Flag className="w-3.5 h-3.5" />
            <span className={`font-bold uppercase tracking-wider text-[10px] hidden xl:inline ${
              isLight ? 'text-slate-500' : 'text-[#94A3B8]'
            }`}>
              Next GP:
            </span>
          </div>
          <span className={`font-bold tracking-wide hidden lg:inline ${
            isLight ? 'text-slate-900' : 'text-[#F8FAFC]'
          }`}>
            {nextRace?.name?.replace('Grand Prix', 'GP') || 'Next Race'}
          </span>
          <span className={`${isLight ? 'text-sky-600' : 'text-[#00F0FF]'} font-bold tabular-nums`}>
            {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
          </span>
        </div>

        {/* Theme Mode Toggle (Sun/Moon) */}
        <button
          onClick={() => onToggleTheme && onToggleTheme(theme === 'dark' ? 'light' : 'dark')}
          className={`p-2 rounded-lg border transition-colors ${
            isLight
              ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
              : 'bg-[#1C2230] border-[#2A3245] text-[#94A3B8] hover:text-white hover:border-[#64748B]'
          }`}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-sky-600" />
          )}
        </button>

        {/* Quick Settings Shortcut */}
        <button
          onClick={() => onNavigate && onNavigate('settings')}
          className={`p-2 rounded-lg border transition-colors ${
            isLight
              ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
              : 'bg-[#1C2230] border-[#2A3245] text-[#94A3B8] hover:text-white hover:border-[#64748B]'
          }`}
          title="Open Settings"
        >
          <Sliders className="w-4 h-4" />
        </button>

        {/* Status Badge */}
        <div className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono ${
          isLight
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
        }`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold">{connectionStatus}</span>
        </div>
      </div>
    </header>
  );
}

export { TopHeader };
