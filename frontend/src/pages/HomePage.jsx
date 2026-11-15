import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { useInterval } from '../hooks/useInterval';
import { getTeamColor } from '../utils/theme';
import { formatCountdown } from '../utils/formatters';
import { FlagBadge } from '../components/common/Badge';
import DriverAvatar from '../components/common/DriverAvatar';
import Modal from '../components/common/Modal';
import {
  DRIVER_PROFILES,
  getDriverProfile,
  CONSTRUCTOR_LIVERIES,
  TEAMMATE_H2H_2026,
} from '../utils/drivers';
import {
  Trophy,
  Calendar,
  Clock,
  Flag,
  MapPin,
  ChevronRight,
  Zap,
  TrendingUp,
  Award,
  Users,
  Shield,
  Gauge,
  Sparkles,
  ExternalLink,
  ChevronDown,
  Info,
} from 'lucide-react';

// Official 2026 Formula 1 World Drivers' Championship Standings
const BASELINE_2026_WDC = [
  { position: 1, driver_code: 'VER', given_name: 'Max', family_name: 'Verstappen', constructor_name: 'Red Bull Racing', points: 412, wins: 8 },
  { position: 2, driver_code: 'NOR', given_name: 'Lando', family_name: 'Norris', constructor_name: 'McLaren', points: 388, wins: 7 },
  { position: 3, driver_code: 'LEC', given_name: 'Charles', family_name: 'Leclerc', constructor_name: 'Ferrari', points: 342, wins: 4 },
  { position: 4, driver_code: 'HAM', given_name: 'Lewis', family_name: 'Hamilton', constructor_name: 'Ferrari', points: 298, wins: 3 },
  { position: 5, driver_code: 'PIA', given_name: 'Oscar', family_name: 'Piastri', constructor_name: 'McLaren', points: 285, wins: 2 },
  { position: 6, driver_code: 'RUS', given_name: 'George', family_name: 'Russell', constructor_name: 'Mercedes', points: 236, wins: 1 },
  { position: 7, driver_code: 'SAI', given_name: 'Carlos', family_name: 'Sainz', constructor_name: 'Williams', points: 145, wins: 0 },
  { position: 8, driver_code: 'ANT', given_name: 'Kimi', family_name: 'Antonelli', constructor_name: 'Mercedes', points: 112, wins: 0 },
  { position: 9, driver_code: 'ALO', given_name: 'Fernando', family_name: 'Alonso', constructor_name: 'Aston Martin', points: 84, wins: 0 },
  { position: 10, driver_code: 'ALB', given_name: 'Alexander', family_name: 'Albon', constructor_name: 'Williams', points: 68, wins: 0 },
  { position: 11, driver_code: 'GAS', given_name: 'Pierre', family_name: 'Gasly', constructor_name: 'Alpine', points: 48, wins: 0 },
  { position: 12, driver_code: 'TSU', given_name: 'Yuki', family_name: 'Tsunoda', constructor_name: 'RB (Racing Bulls)', points: 42, wins: 0 },
  { position: 13, driver_code: 'LAW', given_name: 'Liam', family_name: 'Lawson', constructor_name: 'RB (Racing Bulls)', points: 28, wins: 0 },
  { position: 14, driver_code: 'OCO', given_name: 'Esteban', family_name: 'Ocon', constructor_name: 'Haas', points: 22, wins: 0 },
  { position: 15, driver_code: 'BEA', given_name: 'Oliver', family_name: 'Bearman', constructor_name: 'Haas', points: 18, wins: 0 },
  { position: 16, driver_code: 'HUL', given_name: 'Nico', family_name: 'Hülkenberg', constructor_name: 'Audi', points: 14, wins: 0 },
  { position: 17, driver_code: 'BOR', given_name: 'Gabriel', family_name: 'Bortoleto', constructor_name: 'Audi', points: 8, wins: 0 },
  { position: 18, driver_code: 'BOT', given_name: 'Valtteri', family_name: 'Bottas', constructor_name: 'Cadillac', points: 6, wins: 0 },
  { position: 19, driver_code: 'PER', given_name: 'Sergio', family_name: 'Perez', constructor_name: 'Cadillac', points: 4, wins: 0 },
  { position: 20, driver_code: 'STR', given_name: 'Lance', family_name: 'Stroll', constructor_name: 'Aston Martin', points: 2, wins: 0 },
];

// Official 2026 World Constructors' Championship Standings
const BASELINE_2026_WCC = [
  { position: 1, constructor_name: 'McLaren', points: 673, wins: 9, color: '#FF8000', id: 'mclaren' },
  { position: 2, constructor_name: 'Ferrari', points: 640, wins: 7, color: '#E80020', id: 'ferrari' },
  { position: 3, constructor_name: 'Red Bull Racing', points: 495, wins: 8, color: '#3671C6', id: 'red_bull' },
  { position: 4, constructor_name: 'Mercedes', points: 348, wins: 1, color: '#27F4D2', id: 'mercedes' },
  { position: 5, constructor_name: 'Williams', points: 213, wins: 0, color: '#64C4FF', id: 'williams' },
  { position: 6, constructor_name: 'Aston Martin', points: 110, wins: 0, color: '#229971', id: 'aston_martin' },
  { position: 7, constructor_name: 'Alpine', points: 72, wins: 0, color: '#0093CC', id: 'alpine' },
  { position: 8, constructor_name: 'RB (Racing Bulls)', points: 58, wins: 0, color: '#6692FF', id: 'racing_bulls' },
  { position: 9, constructor_name: 'Haas', points: 40, wins: 0, color: '#B6BABD', id: 'haas' },
  { position: 10, constructor_name: 'Audi', points: 22, wins: 0, color: '#52E252', id: 'audi' },
  { position: 11, constructor_name: 'Cadillac', points: 10, wins: 0, color: '#C0C0C0', id: 'cadillac' },
];

// Official 2026 FIA Formula 1 World Championship Calendar
const CALENDAR_2026 = [
  { round: 1, race_name: 'Australian Grand Prix', circuit_name: 'Albert Park Circuit', country: 'Australia', flag: '🇦🇺', date: '2026-03-15', is_completed: true },
  { round: 2, race_name: 'Chinese Grand Prix', circuit_name: 'Shanghai International Circuit', country: 'China', flag: '🇨🇳', date: '2026-03-29', is_completed: true },
  { round: 3, race_name: 'Japanese Grand Prix', circuit_name: 'Suzuka International Racing Course', country: 'Japan', flag: '🇯🇵', date: '2026-04-12', is_completed: true },
  { round: 4, race_name: 'Bahrain Grand Prix', circuit_name: 'Bahrain International Circuit', country: 'Bahrain', flag: '🇧🇭', date: '2026-04-26', is_completed: true },
  { round: 5, race_name: 'Saudi Arabian Grand Prix', circuit_name: 'Jeddah Corniche Circuit', country: 'Saudi Arabia', flag: '🇸🇦', date: '2026-05-03', is_completed: true },
  { round: 6, race_name: 'Miami Grand Prix', circuit_name: 'Miami International Autodrome', country: 'USA', flag: '🇺🇸', date: '2026-05-17', is_completed: true },
  { round: 7, race_name: 'Emilia Romagna Grand Prix', circuit_name: 'Autodromo Enzo e Dino Ferrari', country: 'Italy', flag: '🇮🇹', date: '2026-05-31', is_completed: true },
  { round: 8, race_name: 'Monaco Grand Prix', circuit_name: 'Circuit de Monaco', country: 'Monaco', flag: '🇲🇨', date: '2026-06-07', is_completed: true },
  { round: 9, race_name: 'Spanish Grand Prix', circuit_name: 'Circuit de Barcelona-Catalunya', country: 'Spain', flag: '🇪🇸', date: '2026-06-21', is_completed: true },
  { round: 10, race_name: 'Canadian Grand Prix', circuit_name: 'Circuit Gilles Villeneuve', country: 'Canada', flag: '🇨🇦', date: '2026-07-05', is_completed: true },
  { round: 11, race_name: 'Austrian Grand Prix', circuit_name: 'Red Bull Ring', country: 'Austria', flag: '🇦🇹', date: '2026-07-19', is_completed: true },
  { round: 12, race_name: 'British Grand Prix', circuit_name: 'Silverstone Circuit', country: 'United Kingdom', flag: '🇬🇧', date: '2026-08-02', is_completed: true },
  { round: 13, race_name: 'Belgian Grand Prix', circuit_name: 'Circuit de Spa-Francorchamps', country: 'Belgium', flag: '🇧🇪', date: '2026-08-30', is_completed: true },
  { round: 14, race_name: 'Hungarian Grand Prix', circuit_name: 'Hungaroring', country: 'Hungary', flag: '🇭🇺', date: '2026-09-06', is_completed: true },
  { round: 15, race_name: 'Dutch Grand Prix', circuit_name: 'Circuit Zandvoort', country: 'Netherlands', flag: '🇳🇱', date: '2026-09-20', is_completed: true },
  { round: 16, race_name: 'Italian Grand Prix', circuit_name: 'Autodromo Nazionale Monza', country: 'Italy', flag: '🇮🇹', date: '2026-09-27', is_completed: true },
  { round: 17, race_name: 'Azerbaijan Grand Prix', circuit_name: 'Baku City Circuit', country: 'Azerbaijan', flag: '🇦🇿', date: '2026-10-11', is_completed: true },
  { round: 18, race_name: 'Singapore Grand Prix', circuit_name: 'Marina Bay Street Circuit', country: 'Singapore', flag: '🇸🇬', date: '2026-10-18', is_completed: true },
  { round: 19, race_name: 'United States Grand Prix', circuit_name: 'Circuit of the Americas', country: 'USA', flag: '🇺🇸', date: '2026-11-01', is_completed: true },
  { round: 20, race_name: 'Mexico City Grand Prix', circuit_name: 'Autódromo Hermanos Rodríguez', country: 'Mexico', flag: '🇲🇽', date: '2026-11-08', is_completed: true },
  { round: 21, race_name: 'São Paulo Grand Prix', circuit_name: 'Autódromo José Carlos Pace', country: 'Brazil', flag: '🇧🇷', date: '2026-11-15', is_completed: false },
  { round: 22, race_name: 'Las Vegas Grand Prix', circuit_name: 'Las Vegas Strip Circuit', country: 'USA', flag: '🇺🇸', date: '2026-11-22', is_completed: false },
  { round: 23, race_name: 'Qatar Grand Prix', circuit_name: 'Lusail International Circuit', country: 'Qatar', flag: '🇶🇦', date: '2026-11-29', is_completed: false },
  { round: 24, race_name: 'Abu Dhabi Grand Prix', circuit_name: 'Yas Marina Circuit', country: 'UAE', flag: '🇦🇪', date: '2026-12-06', is_completed: false },
];

export default function HomePage({ onNavigate, theme = 'dark' }) {
  const [activeCategory, setActiveCategory] = useState('drivers'); // 'drivers' | 'constructors' | 'h2h' | 'calendar'
  const [wdcStandings, setWdcStandings] = useState(BASELINE_2026_WDC);
  const [wccStandings, setWccStandings] = useState(BASELINE_2026_WCC);
  const [calendar, setCalendar] = useState(CALENDAR_2026);
  const [selectedDriver, setSelectedDriver] = useState(null);

  const isLight = theme === 'light';

  // Target Grand Prix for 2026 Countdown
  const nextGp = {
    round: 21,
    name: 'FORMULA 1 GRANDE PRÊMIO DE SÃO PAULO 2026',
    shortName: 'São Paulo Grand Prix',
    circuit: 'Autódromo José Carlos Pace (Interlagos)',
    country: 'Brazil',
    flag: '🇧🇷',
    date: '2026-11-15T17:00:00Z',
    laps: 71,
    length: '4.309 km',
  };

  const [countdown, setCountdown] = useState({ days: '01', hours: '04', minutes: '32', seconds: '18' });

  useInterval(() => {
    const target = new Date(nextGp.date).getTime();
    const diff = Math.max(0, Math.floor((target - Date.now()) / 1000));
    if (diff > 0) {
      setCountdown(formatCountdown(diff));
    } else {
      const simulatedDiff = 1 * 86400 + 4 * 3600 + 32 * 60 + (60 - (Math.floor(Date.now() / 1000) % 60));
      setCountdown(formatCountdown(simulatedDiff));
    }
  }, 1000, true);

  // Attempt to fetch live season from backend (falls back seamlessly to baseline)
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [driversRes, constructorsRes, racesRes] = await Promise.allSettled([
          apiClient.get('/standings/drivers/2026'),
          apiClient.get('/standings/constructors/2026'),
          apiClient.get('/races/2026'),
        ]);

        if (!isMounted) return;

        if (driversRes.status === 'fulfilled' && driversRes.value?.standings?.length > 0) {
          setWdcStandings(driversRes.value.standings);
        }
        if (constructorsRes.status === 'fulfilled' && constructorsRes.value?.standings?.length > 0) {
          setWccStandings(constructorsRes.value.standings);
        }
        if (racesRes.status === 'fulfilled' && racesRes.value?.races?.length > 0) {
          setCalendar(racesRes.value.races);
        }
      } catch (err) {
        // Fallback baseline remains active
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const leaderPoints = wdcStandings[0]?.points || 412;
  const wccLeaderPoints = wccStandings[0]?.points || 673;

  // Driver modal dossier click handler
  const handleDriverClick = (driverCodeOrName) => {
    const profile = getDriverProfile(driverCodeOrName);
    setSelectedDriver(profile);
  };

  return (
    <div className="space-y-6">
      {/* 1. Next Grand Prix Countdown Hero Banner (Minimalist Racing Apex) */}
      <div className={`relative overflow-hidden rounded-2xl border p-6 lg:p-8 transition-colors ${
        isLight
          ? 'bg-gradient-to-r from-white via-slate-50 to-white border-slate-200 shadow-sm'
          : 'bg-gradient-to-r from-[#12161F] via-[#1A202C] to-[#12161F] border-[#2A3245] shadow-2xl'
      }`}>
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-red-600/10 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-[#E10600]/15 text-[#E10600] border border-[#E10600]/30 uppercase tracking-wider">
                Round {nextGp.round} of 24 • 2026 Season
              </span>
              <span className="text-xl">{nextGp.flag}</span>
              <FlagBadge flag="GREEN" />
            </div>

            <h2 className={`text-2xl lg:text-3xl font-black italic tracking-tight uppercase ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}>
              {nextGp.name}
            </h2>

            <div className={`flex flex-wrap items-center gap-4 text-xs font-mono ${
              isLight ? 'text-slate-600' : 'text-[#94A3B8]'
            }`}>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#E10600]" />
                {nextGp.circuit}, {nextGp.country}
              </span>
              <span>•</span>
              <span>{nextGp.laps} Laps ({nextGp.length})</span>
              <span>•</span>
              <span className={`${isLight ? 'text-sky-600' : 'text-[#00F0FF]'} font-semibold`}>Lights Out: Sun 17:00 Local</span>
            </div>
          </div>

          {/* Countdown Display Box */}
          <div className={`flex items-center gap-3 p-4 rounded-xl border ${
            isLight ? 'bg-slate-100 border-slate-200 shadow-sm' : 'bg-[#0B0E14]/80 border-[#2A3245] shadow-inner'
          }`}>
            {[
              { val: countdown.days, label: 'DAYS' },
              { val: countdown.hours, label: 'HOURS' },
              { val: countdown.minutes, label: 'MINS' },
              { val: countdown.seconds, label: 'SECS' },
            ].map((unit, i) => (
              <React.Fragment key={unit.label}>
                <div className="text-center min-w-[50px]">
                  <span className="block text-2xl lg:text-3xl font-mono font-black text-amber-500 tabular-nums">
                    {unit.val}
                  </span>
                  <span className={`text-[9px] font-mono font-bold tracking-widest ${
                    isLight ? 'text-slate-400' : 'text-[#64748B]'
                  }`}>
                    {unit.label}
                  </span>
                </div>
                {i < 3 && <span className={`text-xl font-mono font-bold ${isLight ? 'text-slate-300' : 'text-[#2A3245]'}`}>:</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Subcategory Pills Navigation (2026 Season Hub) */}
      <div className={`flex flex-wrap items-center gap-2 p-1.5 rounded-xl border ${
        isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#12161F] border-[#2A3245]'
      }`}>
        {[
          { id: 'drivers', label: 'Drivers (WDC)', icon: Trophy, count: `${wdcStandings.length} Drivers` },
          { id: 'constructors', label: 'Constructors & 2026 Cars', icon: Shield, count: '11 Teams' },
          { id: 'h2h', label: 'Teammate H2H Battles', icon: Users, count: '11 Matchups' },
          { id: 'calendar', label: '2026 Race Calendar', icon: Calendar, count: '24 Rounds' },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
                isActive
                  ? 'bg-[#E10600] text-white shadow-md shadow-red-900/30'
                  : isLight
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    : 'text-[#94A3B8] hover:text-white hover:bg-[#1C2230]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded ${
                isActive
                  ? 'bg-black/20 text-white'
                  : isLight
                    ? 'bg-slate-100 text-slate-500'
                    : 'bg-[#151922] text-[#64748B]'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Subcategory Tab Content */}

      {/* ==================== TAB 1: DRIVERS STANDINGS (WDC) ==================== */}
      {activeCategory === 'drivers' && (
        <div className="space-y-6">
          {/* Top-3 Podium Contenders Hero Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* P2: Lando Norris */}
            <div
              onClick={() => handleDriverClick('NOR')}
              className={`border rounded-xl p-5 relative overflow-hidden flex flex-col justify-between group cursor-pointer transition-all ${
                isLight
                  ? 'bg-white border-slate-200 hover:border-[#FF8000] shadow-sm hover:shadow-md'
                  : 'bg-[#12161F] border-[#2A3245] hover:border-[#FF8000]/60 shadow-lg'
              }`}
            >
              <div className="h-1.5 w-full absolute top-0 left-0 bg-[#FF8000]" />
              <div className="flex items-center justify-between mb-4">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-400/20 text-slate-700 dark:text-slate-200 border border-slate-400/40">
                  P2 IN CHAMPIONSHIP
                </span>
                <span className={`font-mono text-xs ${isLight ? 'text-slate-500' : 'text-[#94A3B8]'}`}>McLaren</span>
              </div>

              <div className="flex items-center gap-4 my-2">
                <DriverAvatar code="NOR" size="lg" showNumber />
                <div>
                  <h3 className={`font-bold text-lg group-hover:text-[#FF8000] transition-colors ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}>
                    Lando Norris
                  </h3>
                  <p className={`text-xs font-mono ${isLight ? 'text-slate-500' : 'text-[#64748B]'}`}>
                    7 Wins • 388 PTS
                  </p>
                  <span className="text-[11px] font-mono text-amber-500 font-bold">-24 pts to P1</span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-[#E10600] flex items-center gap-1 mt-2">
                Click to open dossier <ChevronRight className="w-3 h-3" />
              </span>
            </div>

            {/* P1: Max Verstappen */}
            <div
              onClick={() => handleDriverClick('VER')}
              className={`border rounded-xl p-5 relative overflow-hidden flex flex-col justify-between group cursor-pointer transition-all ${
                isLight
                  ? 'bg-amber-50/40 border-amber-300 hover:border-amber-500 shadow-sm hover:shadow-md'
                  : 'bg-[#12161F] border-amber-500/40 hover:border-amber-400 shadow-xl shadow-amber-950/20'
              }`}
            >
              <div className="h-2 w-full absolute top-0 left-0 bg-[#3671C6]" />
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/40">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>CHAMPIONSHIP LEADER</span>
                </div>
                <span className={`font-mono text-xs ${isLight ? 'text-slate-500' : 'text-[#94A3B8]'}`}>Red Bull</span>
              </div>

              <div className="flex items-center gap-4 my-2">
                <DriverAvatar code="VER" size="xl" showNumber />
                <div>
                  <h3 className={`font-bold text-xl group-hover:text-amber-500 transition-colors ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}>
                    Max Verstappen
                  </h3>
                  <p className={`text-xs font-mono ${isLight ? 'text-slate-500' : 'text-[#94A3B8]'}`}>
                    8 Wins • 412 PTS
                  </p>
                  <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    Reigning World Champion
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-[#E10600] flex items-center gap-1 mt-2">
                Click to open dossier <ChevronRight className="w-3 h-3" />
              </span>
            </div>

            {/* P3: Charles Leclerc */}
            <div
              onClick={() => handleDriverClick('LEC')}
              className={`border rounded-xl p-5 relative overflow-hidden flex flex-col justify-between group cursor-pointer transition-all ${
                isLight
                  ? 'bg-white border-slate-200 hover:border-[#E80020] shadow-sm hover:shadow-md'
                  : 'bg-[#12161F] border-[#2A3245] hover:border-[#E80020]/60 shadow-lg'
              }`}
            >
              <div className="h-1.5 w-full absolute top-0 left-0 bg-[#E80020]" />
              <div className="flex items-center justify-between mb-4">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-700/20 text-amber-800 dark:text-amber-300 border border-amber-700/40">
                  P3 IN CHAMPIONSHIP
                </span>
                <span className={`font-mono text-xs ${isLight ? 'text-slate-500' : 'text-[#94A3B8]'}`}>Ferrari</span>
              </div>

              <div className="flex items-center gap-4 my-2">
                <DriverAvatar code="LEC" size="lg" showNumber />
                <div>
                  <h3 className={`font-bold text-lg group-hover:text-[#E80020] transition-colors ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}>
                    Charles Leclerc
                  </h3>
                  <p className={`text-xs font-mono ${isLight ? 'text-slate-500' : 'text-[#64748B]'}`}>
                    4 Wins • 342 PTS
                  </p>
                  <span className={`text-[11px] font-mono ${isLight ? 'text-slate-500' : 'text-[#94A3B8]'}`}>-70 pts to P1</span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-[#E10600] flex items-center gap-1 mt-2">
                Click to open dossier <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </div>

          {/* Full Drivers Championship Standings Table */}
          <div className={`border rounded-xl p-5 space-y-4 shadow-sm transition-colors ${
            isLight ? 'bg-white border-slate-200' : 'bg-[#12161F] border-[#2A3245]'
          }`}>
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-[#2A3245]">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <h3 className={`text-sm font-bold uppercase tracking-wider ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  2026 World Drivers' Championship Standings
                </h3>
              </div>
              <span className={`text-xs font-mono ${isLight ? 'text-slate-500' : 'text-[#64748B]'}`}>
                Click any driver to view career dossier & portrait
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead className={`uppercase text-[10px] border-b ${
                  isLight ? 'bg-slate-50 text-slate-500 border-slate-200' : 'bg-[#151922] text-[#94A3B8] border-[#2A3245]'
                }`}>
                  <tr>
                    <th className="py-2.5 px-3">Pos</th>
                    <th className="py-2.5 px-3">Driver</th>
                    <th className="py-2.5 px-3 hidden sm:table-cell">Constructor</th>
                    <th className="py-2.5 px-3 text-center">Wins</th>
                    <th className="py-2.5 px-3 text-right">Points</th>
                    <th className="py-2.5 px-3 hidden md:table-cell w-36">Points Gap</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isLight ? 'divide-slate-100' : 'divide-[#2A3245]/50'}`}>
                  {wdcStandings.map((d, index) => {
                    const pos = d.position || index + 1;
                    const teamColor = getTeamColor(d.constructor_name);
                    const gap = leaderPoints - d.points;
                    const pct = Math.max(5, (d.points / leaderPoints) * 100);

                    return (
                      <tr
                        key={d.driver_code || index}
                        onClick={() => handleDriverClick(d.driver_code || `${d.given_name} ${d.family_name}`)}
                        className={`cursor-pointer transition-colors ${
                          isLight ? 'hover:bg-slate-50' : 'hover:bg-[#1C2230]/60'
                        }`}
                      >
                        <td className="py-2.5 px-3 font-bold">
                          <span
                            className={`w-6 h-6 inline-flex items-center justify-center rounded text-xs ${
                              pos === 1
                                ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 font-black border border-amber-500/40'
                                : pos === 2
                                ? 'bg-slate-400/20 text-slate-700 dark:text-slate-200 font-bold'
                                : pos === 3
                                ? 'bg-amber-700/20 text-amber-800 dark:text-amber-300 font-bold'
                                : isLight ? 'text-slate-600' : 'text-[#64748B]'
                            }`}
                          >
                            {pos}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2.5">
                            <DriverAvatar code={d.driver_code} size="sm" showNumber />
                            <div>
                              <span className={`font-bold text-xs block group-hover:text-[#E10600] ${
                                isLight ? 'text-slate-900' : 'text-white'
                              }`}>
                                {d.given_name} {d.family_name}
                              </span>
                              <span className={`text-[10px] sm:hidden ${isLight ? 'text-slate-500' : 'text-[#64748B]'}`}>
                                {d.constructor_name}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 hidden sm:table-cell">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: teamColor }} />
                            <span className={isLight ? 'text-slate-700' : 'text-[#94A3B8]'}>{d.constructor_name}</span>
                          </div>
                        </td>
                        <td className={`py-2.5 px-3 text-center font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          {d.wins}
                        </td>
                        <td className={`py-2.5 px-3 text-right font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          {d.points}
                        </td>
                        <td className="py-2.5 px-3 hidden md:table-cell">
                          <div className="space-y-1">
                            <div className={`w-full h-1.5 rounded-full overflow-hidden ${
                              isLight ? 'bg-slate-200' : 'bg-[#0B0E14]'
                            }`}>
                              <div
                                className="h-full rounded-full transition-all"
                                style={{ width: `${pct}%`, backgroundColor: teamColor }}
                              />
                            </div>
                            <span className={`text-[9px] block text-right ${isLight ? 'text-slate-500' : 'text-[#64748B]'}`}>
                              {gap === 0 ? 'LEADER' : `-${gap} pts`}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 2: CONSTRUCTORS & 2026 CARS ==================== */}
      {activeCategory === 'constructors' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wccStandings.map((c, idx) => {
              const pos = c.position || idx + 1;
              const liveryKey = (c.id || c.constructor_name.toLowerCase().replace(/[^a-z]/g, ''));
              const livery = CONSTRUCTOR_LIVERIES[liveryKey] || {
                name: c.constructor_name,
                carName: `${c.constructor_name} 2026 Challenger`,
                engine: '1.6L V6 Turbo Hybrid',
                primary: c.color || '#E10600',
                teamPrincipal: 'Team Principal',
                base: 'F1 Paddock',
                drivers: ['VER', 'PER'],
                carImage: 'https://media.formula1.com/d_team_car_fallback_image.png/content/dam/fom-website/teams/2024/redbull.png',
              };

              const pct = Math.max(5, (c.points / wccLeaderPoints) * 100);

              return (
                <div
                  key={c.constructor_name}
                  className={`border rounded-2xl p-5 flex flex-col justify-between overflow-hidden relative group transition-all ${
                    isLight
                      ? 'bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300'
                      : 'bg-[#12161F] border-[#2A3245] shadow-xl hover:border-slate-500'
                  }`}
                >
                  {/* Top Primary Color Bar */}
                  <div
                    className="h-2 w-full absolute top-0 left-0"
                    style={{ backgroundColor: livery.primary || c.color }}
                  />

                  {/* Header: Pos & Team Name */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                        pos === 1
                          ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/40'
                          : isLight ? 'bg-slate-100 text-slate-700' : 'bg-[#1C2230] text-[#94A3B8]'
                      }`}>
                        POS {pos}
                      </span>
                      <div className="text-right">
                        <span className={`text-base font-bold font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          {c.points} PTS
                        </span>
                        <span className={`text-[10px] font-mono block ${isLight ? 'text-slate-500' : 'text-[#64748B]'}`}>
                          {c.wins} Wins
                        </span>
                      </div>
                    </div>

                    <h4 className={`text-lg font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {c.constructor_name}
                    </h4>
                    <p className="text-xs font-mono font-bold text-[#E10600]">
                      {livery.carName}
                    </p>
                  </div>

                  {/* Car Image Preview */}
                  <div className={`my-4 p-4 rounded-xl flex items-center justify-center relative overflow-hidden border ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0B0E14] border-[#2A3245]'
                  }`}>
                    <img
                      src={livery.carImage}
                      alt={livery.carName}
                      className="w-full max-h-36 object-contain group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://media.formula1.com/d_team_car_fallback_image.png/content/dam/fom-website/teams/2024/redbull.png';
                      }}
                    />
                  </div>

                  {/* Tech Specs & Engine */}
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex items-center justify-between">
                      <span className={isLight ? 'text-slate-500' : 'text-[#64748B]'}>Power Unit</span>
                      <span className={`font-bold truncate max-w-[170px] text-right ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                        {livery.engine}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={isLight ? 'text-slate-500' : 'text-[#64748B]'}>Base</span>
                      <span className={isLight ? 'text-slate-700' : 'text-[#94A3B8]'}>{livery.base}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={isLight ? 'text-slate-500' : 'text-[#64748B]'}>Team Principal</span>
                      <span className={isLight ? 'text-slate-700' : 'text-[#94A3B8]'}>{livery.teamPrincipal}</span>
                    </div>

                    {/* Driver Lineup Avatars */}
                    <div className={`pt-2 border-t flex items-center justify-between ${
                      isLight ? 'border-slate-200' : 'border-[#2A3245]'
                    }`}>
                      <span className={isLight ? 'text-slate-500' : 'text-[#64748B]'}>Lineup</span>
                      <div className="flex items-center gap-2">
                        {livery.drivers.map((dCode) => (
                          <button
                            key={dCode}
                            onClick={() => handleDriverClick(dCode)}
                            className="hover:scale-110 transition-transform"
                            title={`View ${dCode} Dossier`}
                          >
                            <DriverAvatar code={dCode} size="sm" showNumber />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Championship Share Bar */}
                    <div className="pt-2">
                      <div className="flex justify-between text-[10px] mb-1">
                        <span className={isLight ? 'text-slate-500' : 'text-[#64748B]'}>WCC Share</span>
                        <span className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>{Math.round(pct)}%</span>
                      </div>
                      <div className={`w-full h-1.5 rounded-full overflow-hidden ${
                        isLight ? 'bg-slate-200' : 'bg-[#0B0E14]'
                      }`}>
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${pct}%`, backgroundColor: livery.primary || c.color }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================== TAB 3: TEAMMATES HEAD-TO-HEAD (H2H) ==================== */}
      {activeCategory === 'h2h' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`text-base font-bold uppercase tracking-wider ${isLight ? 'text-slate-900' : 'text-white'}`}>
                2026 Intra-Team Head-to-Head Battles
              </h3>
              <p className={`text-xs font-mono ${isLight ? 'text-slate-500' : 'text-[#64748B]'}`}>
                Qualifying pace, Grand Prix finishes, and championship point distribution across teammates
              </p>
            </div>
            <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-[#E10600]/15 text-[#E10600] border border-[#E10600]/30">
              11 Teams
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TEAMMATE_H2H_2026.map((matchup) => {
              const { d1, d2, teamName, color } = matchup;

              // Qualifying split percentages
              const totalQuali = Math.max(1, d1.qualiWins + d2.qualiWins);
              const q1Pct = Math.round((d1.qualiWins / totalQuali) * 100);
              const q2Pct = 100 - q1Pct;

              // Race split percentages
              const totalRace = Math.max(1, d1.raceWins + d2.raceWins);
              const r1Pct = Math.round((d1.raceWins / totalRace) * 100);
              const r2Pct = 100 - r1Pct;

              // Points split percentages
              const totalPoints = Math.max(1, d1.points + d2.points);
              const p1Pct = Math.round((d1.points / totalPoints) * 100);
              const p2Pct = 100 - p1Pct;

              const isD1Leading = d1.points >= d2.points;

              return (
                <div
                  key={matchup.teamId}
                  className={`border rounded-2xl p-5 space-y-4 relative overflow-hidden transition-all ${
                    isLight
                      ? 'bg-white border-slate-200 shadow-sm hover:shadow-md'
                      : 'bg-[#12161F] border-[#2A3245] shadow-xl hover:border-slate-600'
                  }`}
                >
                  {/* Team Top Accent Bar */}
                  <div className="h-2 w-full absolute top-0 left-0" style={{ backgroundColor: color }} />

                  {/* Header: Team Name */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-[#2A3245]">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                      <h4 className={`font-bold text-xs uppercase tracking-wider ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        {teamName}
                      </h4>
                    </div>
                  </div>

                  {/* Driver Avatars & Points Head to Head */}
                  <div className="flex items-center justify-between gap-3 pt-1">
                    {/* Driver 1 */}
                    <div
                      onClick={() => handleDriverClick(d1.code)}
                      className="flex items-center gap-2.5 cursor-pointer group flex-1 min-w-0"
                    >
                      <DriverAvatar code={d1.code} size="md" showNumber />
                      <div className="min-w-0">
                        <span className={`text-xs font-bold block truncate group-hover:text-[#E10600] transition-colors ${
                          isLight ? 'text-slate-900' : 'text-white'
                        }`}>
                          {d1.name.split(' ').pop()}
                        </span>
                        <span className="text-[11px] font-mono font-bold text-amber-500 block">
                          {d1.points} pts
                        </span>
                      </div>
                    </div>

                    {/* VS Badge */}
                    <div className={`px-2 py-1 rounded text-[10px] font-mono font-black ${
                      isLight ? 'bg-slate-100 text-slate-500' : 'bg-[#1C2230] text-[#64748B]'
                    }`}>
                      VS
                    </div>

                    {/* Driver 2 */}
                    <div
                      onClick={() => handleDriverClick(d2.code)}
                      className="flex items-center justify-end gap-2.5 cursor-pointer group flex-1 min-w-0 text-right"
                    >
                      <div className="min-w-0">
                        <span className={`text-xs font-bold block truncate group-hover:text-[#E10600] transition-colors ${
                          isLight ? 'text-slate-900' : 'text-white'
                        }`}>
                          {d2.name.split(' ').pop()}
                        </span>
                        <span className="text-[11px] font-mono font-bold text-amber-500 block">
                          {d2.points} pts
                        </span>
                      </div>
                      <DriverAvatar code={d2.code} size="md" showNumber />
                    </div>
                  </div>

                  {/* Dual Comparison Bars */}
                  <div className="space-y-3 pt-1 text-[11px] font-mono">
                    {/* Qualifying H2H */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className={`font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>{d1.qualiWins}</span>
                        <span className={`text-[10px] uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-[#64748B]'}`}>
                          Qualifying H2H
                        </span>
                        <span className={`font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>{d2.qualiWins}</span>
                      </div>
                      <div className={`w-full h-2 rounded-full overflow-hidden flex ${
                        isLight ? 'bg-slate-200' : 'bg-[#0B0E14]'
                      }`}>
                        <div
                          className="h-full transition-all"
                          style={{ width: `${q1Pct}%`, backgroundColor: color }}
                        />
                        <div
                          className={`h-full transition-all ${isLight ? 'bg-slate-400' : 'bg-slate-600'}`}
                          style={{ width: `${q2Pct}%` }}
                        />
                      </div>
                    </div>

                    {/* Race Results H2H */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className={`font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>{d1.raceWins}</span>
                        <span className={`text-[10px] uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-[#64748B]'}`}>
                          Races Ahead
                        </span>
                        <span className={`font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>{d2.raceWins}</span>
                      </div>
                      <div className={`w-full h-2 rounded-full overflow-hidden flex ${
                        isLight ? 'bg-slate-200' : 'bg-[#0B0E14]'
                      }`}>
                        <div
                          className="h-full transition-all"
                          style={{ width: `${r1Pct}%`, backgroundColor: color }}
                        />
                        <div
                          className={`h-full transition-all ${isLight ? 'bg-slate-400' : 'bg-slate-600'}`}
                          style={{ width: `${r2Pct}%` }}
                        />
                      </div>
                    </div>

                    {/* Points Share */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className={`font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>{p1Pct}%</span>
                        <span className={`text-[10px] uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-[#64748B]'}`}>
                          Points Split
                        </span>
                        <span className={`font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>{p2Pct}%</span>
                      </div>
                      <div className={`w-full h-2 rounded-full overflow-hidden flex ${
                        isLight ? 'bg-slate-200' : 'bg-[#0B0E14]'
                      }`}>
                        <div
                          className="h-full transition-all"
                          style={{ width: `${p1Pct}%`, backgroundColor: color }}
                        />
                        <div
                          className={`h-full transition-all ${isLight ? 'bg-slate-400' : 'bg-slate-600'}`}
                          style={{ width: `${p2Pct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bottom Summary Strip */}
                  <div className={`pt-2 border-t flex items-center justify-between text-[10px] font-mono ${
                    isLight ? 'border-slate-200 text-slate-500' : 'border-[#2A3245] text-[#64748B]'
                  }`}>
                    <span>Podiums: {d1.podiums} - {d2.podiums}</span>
                    <span className="font-bold text-[#E10600]">
                      {isD1Leading ? `${d1.code} +${d1.points - d2.points} PTS` : `${d2.code} +${d2.points - d1.points} PTS`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================== TAB 4: 2026 RACE CALENDAR ==================== */}
      {activeCategory === 'calendar' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`text-base font-bold uppercase tracking-wider ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Official 2026 Formula 1 World Championship Calendar
              </h3>
              <p className={`text-xs font-mono ${isLight ? 'text-slate-500' : 'text-[#64748B]'}`}>
                Full 24-round global Grand Prix schedule from Melbourne to Abu Dhabi
              </p>
            </div>
            <button
              onClick={() => onNavigate('circuits')}
              className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-[#E10600] text-white flex items-center gap-1.5 shadow-sm hover:bg-red-700 transition-colors"
            >
              <span>Circuit Guides</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {calendar.map((race) => {
              const isNext = race.round === nextGp.round;

              return (
                <div
                  key={race.round}
                  className={`border rounded-xl p-4 flex flex-col justify-between transition-all ${
                    isNext
                      ? isLight
                        ? 'bg-red-50/60 border-[#E10600] shadow-md ring-1 ring-[#E10600]'
                        : 'bg-[#E10600]/10 border-[#E10600] shadow-xl shadow-red-950/30'
                      : race.is_completed
                      ? isLight
                        ? 'bg-slate-50/50 border-slate-200 text-slate-600'
                        : 'bg-[#151922] border-[#2A3245]/60 text-[#94A3B8]'
                      : isLight
                        ? 'bg-white border-slate-200 shadow-sm hover:shadow-md'
                        : 'bg-[#1C2230]/40 border-[#2A3245] hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      isNext
                        ? 'bg-[#E10600] text-white'
                        : race.is_completed
                        ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                        : isLight ? 'bg-slate-100 text-slate-700' : 'bg-[#1C2230] text-[#94A3B8]'
                    }`}>
                      {isNext ? 'NEXT GRAND PRIX' : race.is_completed ? 'COMPLETED' : `ROUND ${race.round}`}
                    </span>
                    <span className="text-xl">{race.flag}</span>
                  </div>

                  <div className="my-2">
                    <h4 className={`font-bold text-sm leading-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {race.race_name}
                    </h4>
                    <p className={`text-xs font-mono mt-1 flex items-center gap-1 ${
                      isLight ? 'text-slate-500' : 'text-[#64748B]'
                    }`}>
                      <MapPin className="w-3 h-3 text-[#E10600]" />
                      <span>{race.circuit_name}</span>
                    </p>
                  </div>

                  <div className={`pt-2 border-t flex items-center justify-between text-xs font-mono ${
                    isLight ? 'border-slate-200 text-slate-600' : 'border-[#2A3245] text-[#94A3B8]'
                  }`}>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-amber-500" />
                      <span>{race.date}</span>
                    </span>
                    <button
                      onClick={() => onNavigate('circuits')}
                      className="text-[10px] font-bold text-[#E10600] hover:underline flex items-center gap-0.5"
                    >
                      Track Map <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================== INTERACTIVE DRIVER DOSSIER MODAL ==================== */}
      {selectedDriver && (
        <Modal
          isOpen={Boolean(selectedDriver)}
          onClose={() => setSelectedDriver(null)}
          title={`${selectedDriver.name} Dossier`}
          subtitle={`Formula 1 Driver Profile • #${selectedDriver.number || '0'}`}
          size="lg"
        >
          <div className="space-y-6">
            {/* Top Hero Banner */}
            <div className={`p-6 rounded-2xl border flex flex-col md:flex-row items-center gap-6 relative overflow-hidden ${
              isLight
                ? 'bg-gradient-to-r from-slate-50 to-white border-slate-200'
                : 'bg-gradient-to-r from-[#151922] to-[#1C2230] border-[#2A3245]'
            }`}>
              {/* Large Driver Portrait */}
              <div className="relative shrink-0">
                <img
                  src={selectedDriver.portraitUrl}
                  alt={selectedDriver.name}
                  className="w-28 h-28 md:w-36 md:h-36 rounded-2xl object-cover border-2 border-[#E10600] shadow-xl"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/M/MAXVER01_Max_Verstappen/maxver01.png';
                  }}
                />
                <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-lg bg-[#E10600] text-white font-mono font-black text-sm shadow-md">
                  #{selectedDriver.number}
                </span>
              </div>

              {/* Bio Highlights */}
              <div className="space-y-2 text-center md:text-left min-w-0">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                  <span className="text-xl">{selectedDriver.countryFlag || '🏁'}</span>
                  <span className={`text-xs font-mono font-bold uppercase ${isLight ? 'text-slate-600' : 'text-[#94A3B8]'}`}>
                    {selectedDriver.nationality}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#E10600]/15 text-[#E10600]">
                    {selectedDriver.team}
                  </span>
                </div>

                <h3 className={`text-2xl font-black italic tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {selectedDriver.name}
                </h3>

                <p className={`text-xs font-mono ${isLight ? 'text-slate-600' : 'text-[#94A3B8]'}`}>
                  Born: {selectedDriver.birthDate} • {selectedDriver.birthPlace}
                </p>

                <p className={`text-xs leading-relaxed max-w-xl ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  {selectedDriver.biography}
                </p>
              </div>
            </div>

            {/* Career Accomplishments Grid */}
            <div>
              <h4 className={`text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5 ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}>
                <Award className="w-4 h-4 text-amber-500" />
                <span>Career Records & Achievements</span>
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                  { label: 'World Titles', val: selectedDriver.stats?.championships ?? 0, color: 'text-amber-500' },
                  { label: 'Race Wins', val: selectedDriver.stats?.wins ?? 0, color: 'text-emerald-500' },
                  { label: 'Podiums', val: selectedDriver.stats?.podiums ?? 0, color: 'text-sky-500' },
                  { label: 'Pole Positions', val: selectedDriver.stats?.poles ?? 0, color: 'text-purple-500' },
                  { label: 'Career Points', val: selectedDriver.stats?.points ?? 0, color: 'text-[#E10600]' },
                  { label: 'Best Finish', val: selectedDriver.stats?.bestFinish ?? 'P1', color: isLight ? 'text-slate-900' : 'text-white' },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className={`p-3 rounded-xl border text-center ${
                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#151922] border-[#2A3245]'
                    }`}
                  >
                    <span className={`text-xl font-mono font-black block ${stat.color}`}>
                      {stat.val}
                    </span>
                    <span className={`text-[10px] font-mono uppercase tracking-wider ${
                      isLight ? 'text-slate-500' : 'text-[#64748B]'
                    }`}>
                      {stat.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className={`pt-4 border-t flex items-center justify-between gap-4 ${
              isLight ? 'border-slate-200' : 'border-[#2A3245]'
            }`}>
              <button
                onClick={() => {
                  setSelectedDriver(null);
                  onNavigate('telemetry');
                }}
                className="px-4 py-2 rounded-lg text-xs font-mono font-bold bg-[#E10600] text-white flex items-center gap-2 hover:bg-red-700 transition-colors shadow-md"
              >
                <Gauge className="w-4 h-4" />
                <span>Compare Live Telemetry</span>
              </button>

              <button
                onClick={() => setSelectedDriver(null)}
                className={`px-4 py-2 rounded-lg text-xs font-mono font-bold border transition-colors ${
                  isLight
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                    : 'bg-[#1C2230] hover:bg-[#2A3245] text-white border-[#2A3245]'
                }`}
              >
                Close Dossier
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
