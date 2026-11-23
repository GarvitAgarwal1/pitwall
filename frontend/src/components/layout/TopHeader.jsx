import React, { useState, useEffect } from 'react';
import { Menu, Sun, Moon, Sliders, Flag, ShieldCheck, Zap } from 'lucide-react';
import { formatCountdown } from '../../utils/formatters';

/**
 * TopHeader
 * Sleek responsive telemetry header with live race countdown, theme switch,
 * and adaptive title display.
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
    home: { short: '2026 Hub', full: '2026 Season Championship Hub' },
    live: { short: 'Live Timing', full: 'Live Timing Tower & Race Control' },
    stats: { short: 'Archive', full: 'Historical Archive (1950–Present)' },
    analysis: { short: 'Analysis', full: 'Post-Race Strategy & Telemetry' },
    telemetry: { short: 'Telemetry', full: 'Dual-Car Telemetry Comparison' },
    strategy: { short: 'Strategy', full: 'Pit Window Predictor & Undercut' },
    guide: { short: 'F1 Guide', full: '2026 Technical Regulations & Aero' },
    news: { short: 'News Feed', full: 'Motorsport RSS Live Wire' },
    circuits: { short: 'Circuits', full: 'Grand Prix Technical Track Maps' },
    settings: { short: 'Settings', full: 'Dashboard & Telemetry Preferences' },
  };

  const titleMeta = viewTitles[activeTab] || { short: 'PitWall F1', full: 'Formula 1 Strategy & Timing' };
  const isLight = theme === 'light';

  return (
    <header className={`h-14 sm:h-16 px-3 sm:px-5 lg:px-6 backdrop-blur-md border-b sticky top-0 z-30 flex items-center justify-between gap-3 transition-colors ${
      isLight
        ? 'bg-white/95 border-slate-200 text-slate-900 shadow-sm'
        : 'bg-[#0E1118]/90 border-[#2A3245] text-[#F8FAFC]'
    }`}>
      {/* Left: Mobile Menu Toggle & Brand / Title */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          className={`lg:hidden p-1.5 sm:p-2 rounded-lg border transition-colors shrink-0 ${
            isLight
              ? 'text-slate-600 hover:text-slate-900 bg-slate-100 border-slate-200'
              : 'text-[#94A3B8] hover:text-white bg-[#151922] border-[#2A3245]'
          }`}
          aria-label="Toggle Navigation"
        >
          <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Mobile PitWall Logo */}
        <div
          className="lg:hidden flex items-center gap-1.5 cursor-pointer shrink-0"
          onClick={() => onNavigate && onNavigate('home')}
        >
          <div className="w-7 h-7 rounded-lg bg-[#E10600] flex items-center justify-center shadow-md shadow-red-900/40">
            <svg viewBox="0 0 28 28" className="w-4 h-4 fill-white" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 21L11 5h5L8 21H3zm10 0l8-16h5l-8 16h-5z" />
            </svg>
          </div>
        </div>

        {/* Dynamic Title */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className={`text-xs sm:text-sm lg:text-base font-black italic tracking-tight uppercase truncate ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}>
              <span className="md:hidden">{titleMeta.short}</span>
              <span className="hidden md:inline">{titleMeta.full}</span>
            </h1>
            <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-[#E10600]" />
          </div>
          <p className={`hidden lg:block text-[11px] font-mono tracking-tight truncate ${
            isLight ? 'text-slate-500' : 'text-[#64748B]'
          }`}>
            FIA Official Timing Telemetry • Active Season 2026
          </p>
        </div>
      </div>

      {/* Right: Next GP Countdown Pill, Theme Toggle, & Settings */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Next Race Countdown Pill (Sleek Digital Timing Badge) */}
        <div className={`hidden sm:flex items-center gap-2 px-3 py-1 border rounded-full text-xs font-mono transition-all ${
          isLight
            ? 'bg-slate-100 border-slate-200 text-slate-800'
            : 'bg-[#151922] border-[#2A3245] text-white shadow-inner'
        }`}>
          <div className="flex items-center gap-1.5 text-[#E10600]">
            <Flag className="w-3.5 h-3.5" />
            <span className="font-bold uppercase tracking-wider text-[10px] hidden xl:inline text-[#64748B]">
              NEXT GP:
            </span>
          </div>
          <span className="font-bold tracking-tight hidden lg:inline text-xs">
            {nextRace?.name?.replace('Grand Prix', 'GP') || 'Interlagos'}
          </span>
          <span className="text-[#E10600] font-black tabular-nums tracking-wider text-xs">
            {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
          </span>
        </div>

        {/* Theme Mode Toggle (Sun/Moon) */}
        <button
          onClick={() => onToggleTheme && onToggleTheme(theme === 'dark' ? 'light' : 'dark')}
          className={`p-1.5 sm:p-2 rounded-lg border transition-colors ${
            isLight
              ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
              : 'bg-[#151922] border-[#2A3245] text-[#94A3B8] hover:text-white hover:border-[#64748B]'
          }`}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          aria-label="Toggle Theme"
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
          className={`p-1.5 sm:p-2 rounded-lg border transition-colors ${
            isLight
              ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
              : 'bg-[#151922] border-[#2A3245] text-[#94A3B8] hover:text-white hover:border-[#64748B]'
          }`}
          title="Open Settings"
          aria-label="Settings"
        >
          <Sliders className="w-4 h-4" />
        </button>

        {/* Live Status Pill */}
        <div className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono ${
          isLight
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
        }`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold tracking-wider">{connectionStatus}</span>
        </div>
      </div>
    </header>
  );
}

export { TopHeader };
