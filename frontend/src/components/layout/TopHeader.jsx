import React, { useState, useEffect } from 'react';
import { Menu, Radio, Clock, ShieldCheck, Flag } from 'lucide-react';
import { formatCountdown } from '../../utils/formatters';
import { StatusBadge } from '../common/Badge';

/**
 * TopHeader
 * Top navigation bar featuring next race countdown ticker, session title, and telemetry status indicator.
 */
export default function TopHeader({
  activeTab = 'home',
  onToggleSidebar,
  connectionStatus = 'SIMULATED', // 'LIVE' | 'SIMULATED' | 'REPLAY'
  nextRace = {
    name: 'Las Vegas Grand Prix',
    circuit: 'Las Vegas Strip Circuit',
    date: '2024-11-23T22:00:00Z',
  },
}) {
  // Live ticker for countdown
  const [timeLeft, setTimeLeft] = useState({
    days: '12',
    hours: '08',
    minutes: '44',
    seconds: '20',
  });

  useEffect(() => {
    function updateCountdown() {
      if (!nextRace?.date) return;
      const targetTime = new Date(nextRace.date).getTime();
      const now = Date.now();
      const diffSecs = Math.max(0, Math.floor((targetTime - now) / 1000));
      // If past or mock future, ensure clean countdown display
      if (diffSecs > 0) {
        setTimeLeft(formatCountdown(diffSecs));
      } else {
        // Fallback realistic showcase ticker
        const fallbackSecs = 12 * 86400 + 4 * 3600 + 22 * 60 + (60 - (Math.floor(now / 1000) % 60));
        setTimeLeft(formatCountdown(fallbackSecs));
      }
    }

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [nextRace?.date]);

  const viewTitles = {
    home: 'Season Overview & Championship Standings',
    live: 'Live Timing Tower & Race Control',
    stats: 'Historical Archive (1950–Present)',
    analysis: 'Post-Race Telemetry & Strategy Analysis',
    telemetry: 'Dual-Driver Car Telemetry Comparison',
    strategy: 'Pit Window Detector & Race Predictor',
    guide: 'Formula 1 Regulations & Technical Guide',
    news: 'Motorsport RSS News Feed',
    circuits: 'Grand Prix Circuits Directory',
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
            Formula 1 World Championship Official Data Streams
          </p>
        </div>
      </div>

      {/* Right: Next GP Countdown Pill & Telemetry Status */}
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
          <span className="text-[#2A3245] hidden lg:inline">|</span>
          <span className="font-mono text-amber-400 font-semibold tabular-nums">
            {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
          </span>
        </div>

        {/* Connection Status Badge */}
        <StatusBadge status={connectionStatus} />
      </div>
    </header>
  );
}

export { TopHeader };
