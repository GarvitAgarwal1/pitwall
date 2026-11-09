import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { useInterval } from '../hooks/useInterval';
import { getTeamColor } from '../utils/theme';
import { formatCountdown, formatDate } from '../utils/formatters';
import { FlagBadge } from '../components/common/Badge';
import {
  Trophy,
  Activity,
  Calendar,
  Clock,
  Flag,
  MapPin,
  ChevronRight,
  Sparkles,
  Zap,
} from 'lucide-react';

// Baseline 2024 WDC standings fallback
const FALLBACK_WDC = [
  { position: 1, driver_code: 'VER', given_name: 'Max', family_name: 'Verstappen', constructor_name: 'Red Bull Racing', points: 393, wins: 8 },
  { position: 2, driver_code: 'NOR', given_name: 'Lando', family_name: 'Norris', constructor_name: 'McLaren', points: 331, wins: 3 },
  { position: 3, driver_code: 'LEC', given_name: 'Charles', family_name: 'Leclerc', constructor_name: 'Ferrari', points: 307, wins: 3 },
  { position: 4, driver_code: 'PIA', given_name: 'Oscar', family_name: 'Piastri', constructor_name: 'McLaren', points: 262, wins: 2 },
  { position: 5, driver_code: 'SAI', given_name: 'Carlos', family_name: 'Sainz', constructor_name: 'Ferrari', points: 244, wins: 2 },
  { position: 6, driver_code: 'RUS', given_name: 'George', family_name: 'Russell', constructor_name: 'Mercedes', points: 192, wins: 1 },
  { position: 7, driver_code: 'HAM', given_name: 'Lewis', family_name: 'Hamilton', constructor_name: 'Mercedes', points: 190, wins: 2 },
  { position: 8, driver_code: 'PER', given_name: 'Sergio', family_name: 'Perez', constructor_name: 'Red Bull Racing', points: 151, wins: 0 },
  { position: 9, driver_code: 'ALO', given_name: 'Fernando', family_name: 'Alonso', constructor_name: 'Aston Martin', points: 62, wins: 0 },
  { position: 10, driver_code: 'HUL', given_name: 'Nico', family_name: 'Hulkenberg', constructor_name: 'Haas', points: 31, wins: 0 },
];

// Baseline 2024 WCC standings fallback
const FALLBACK_WCC = [
  { position: 1, constructor_name: 'McLaren', points: 593, wins: 5 },
  { position: 2, constructor_name: 'Ferrari', points: 557, wins: 5 },
  { position: 3, constructor_name: 'Red Bull Racing', points: 544, wins: 8 },
  { position: 4, constructor_name: 'Mercedes', points: 382, wins: 3 },
  { position: 5, constructor_name: 'Aston Martin', points: 86, wins: 0 },
  { position: 6, constructor_name: 'Haas', points: 46, wins: 0 },
  { position: 7, constructor_name: 'Alpine', points: 49, wins: 0 },
  { position: 8, constructor_name: 'RB', points: 44, wins: 0 },
  { position: 9, constructor_name: 'Williams', points: 17, wins: 0 },
  { position: 10, constructor_name: 'Kick Sauber', points: 0, wins: 0 },
];

// 24-Round 2024 Calendar Fallback
const FALLBACK_CALENDAR = [
  { round: 1, race_name: 'Bahrain Grand Prix', circuit_name: 'Bahrain International Circuit', country: 'Bahrain', date: '2024-03-02', is_completed: true, sprint: false },
  { round: 2, race_name: 'Saudi Arabian Grand Prix', circuit_name: 'Jeddah Corniche Circuit', country: 'Saudi Arabia', date: '2024-03-09', is_completed: true, sprint: false },
  { round: 3, race_name: 'Australian Grand Prix', circuit_name: 'Albert Park Circuit', country: 'Australia', date: '2024-03-24', is_completed: true, sprint: false },
  { round: 4, race_name: 'Japanese Grand Prix', circuit_name: 'Suzuka International Racing Course', country: 'Japan', date: '2024-04-07', is_completed: true, sprint: false },
  { round: 5, race_name: 'Chinese Grand Prix', circuit_name: 'Shanghai International Circuit', country: 'China', date: '2024-04-21', is_completed: true, sprint: true },
  { round: 6, race_name: 'Miami Grand Prix', circuit_name: 'Miami International Autodrome', country: 'USA', date: '2024-05-05', is_completed: true, sprint: true },
  { round: 7, race_name: 'Emilia Romagna Grand Prix', circuit_name: 'Autodromo Enzo e Dino Ferrari', country: 'Italy', date: '2024-05-19', is_completed: true, sprint: false },
  { round: 8, race_name: 'Monaco Grand Prix', circuit_name: 'Circuit de Monaco', country: 'Monaco', date: '2024-05-26', is_completed: true, sprint: false },
  { round: 9, race_name: 'Canadian Grand Prix', circuit_name: 'Circuit Gilles Villeneuve', country: 'Canada', date: '2024-06-09', is_completed: true, sprint: false },
  { round: 10, race_name: 'Spanish Grand Prix', circuit_name: 'Circuit de Barcelona-Catalunya', country: 'Spain', date: '2024-06-23', is_completed: true, sprint: false },
  { round: 11, race_name: 'Austrian Grand Prix', circuit_name: 'Red Bull Ring', country: 'Austria', date: '2024-06-30', is_completed: true, sprint: true },
  { round: 12, race_name: 'British Grand Prix', circuit_name: 'Silverstone Circuit', country: 'United Kingdom', date: '2024-07-07', is_completed: true, sprint: false },
  { round: 13, race_name: 'Hungarian Grand Prix', circuit_name: 'Hungaroring', country: 'Hungary', date: '2024-07-21', is_completed: true, sprint: false },
  { round: 14, race_name: 'Belgian Grand Prix', circuit_name: 'Circuit de Spa-Francorchamps', country: 'Belgium', date: '2024-07-28', is_completed: true, sprint: false },
  { round: 15, race_name: 'Dutch Grand Prix', circuit_name: 'Circuit Zandvoort', country: 'Netherlands', date: '2024-08-25', is_completed: true, sprint: false },
  { round: 16, race_name: 'Italian Grand Prix', circuit_name: 'Autodromo Nazionale Monza', country: 'Italy', date: '2024-09-01', is_completed: true, sprint: false },
  { round: 17, race_name: 'Azerbaijan Grand Prix', circuit_name: 'Baku City Circuit', country: 'Azerbaijan', date: '2024-09-15', is_completed: true, sprint: false },
  { round: 18, race_name: 'Singapore Grand Prix', circuit_name: 'Marina Bay Street Circuit', country: 'Singapore', date: '2024-09-22', is_completed: true, sprint: false },
  { round: 19, race_name: 'United States Grand Prix', circuit_name: 'Circuit of the Americas', country: 'USA', date: '2024-10-20', is_completed: true, sprint: true },
  { round: 20, race_name: 'Mexico City Grand Prix', circuit_name: 'Autódromo Hermanos Rodríguez', country: 'Mexico', date: '2024-10-27', is_completed: true, sprint: false },
  { round: 21, race_name: 'São Paulo Grand Prix', circuit_name: 'Autódromo José Carlos Pace', country: 'Brazil', date: '2024-11-03', is_completed: true, sprint: true },
  { round: 22, race_name: 'Las Vegas Grand Prix', circuit_name: 'Las Vegas Strip Circuit', country: 'USA', date: '2024-11-23', is_completed: false, sprint: false },
  { round: 23, race_name: 'Qatar Grand Prix', circuit_name: 'Lusail International Circuit', country: 'Qatar', date: '2024-12-01', is_completed: false, sprint: true },
  { round: 24, race_name: 'Abu Dhabi Grand Prix', circuit_name: 'Yas Marina Circuit', country: 'UAE', date: '2024-12-08', is_completed: false, sprint: false },
];

export default function HomePage({ onNavigate }) {
  const [wdcStandings, setWdcStandings] = useState(FALLBACK_WDC);
  const [wccStandings, setWccStandings] = useState(FALLBACK_WCC);
  const [calendar, setCalendar] = useState(FALLBACK_CALENDAR);
  const [standingsTab, setStandingsTab] = useState('wdc'); // 'wdc' | 'wcc'

  // Next Race Target: Las Vegas GP
  const nextGp = {
    name: 'FORMULA 1 HEINEKEN SILVER LAS VEGAS GRAND PRIX 2024',
    shortName: 'Las Vegas Grand Prix',
    circuit: 'Las Vegas Strip Circuit',
    country: 'United States',
    flag: '🇺🇸',
    date: '2024-11-23T22:00:00Z',
    round: 22,
    laps: 50,
    length: '6.201 km',
  };

  // Live Countdown ticker
  const [countdown, setCountdown] = useState({ days: '12', hours: '08', minutes: '44', seconds: '20' });

  useInterval(() => {
    const target = new Date(nextGp.date).getTime();
    const diff = Math.max(0, Math.floor((target - Date.now()) / 1000));
    if (diff > 0) {
      setCountdown(formatCountdown(diff));
    } else {
      // Loop realistic countdown
      const simulatedDiff = 12 * 86400 + 4 * 3600 + 22 * 60 + (60 - (Math.floor(Date.now() / 1000) % 60));
      setCountdown(formatCountdown(simulatedDiff));
    }
  }, 1000, true);

  // Fetch live standings from backend
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const [driversRes, constructorsRes, racesRes] = await Promise.allSettled([
          apiClient.get('/standings/drivers/2024'),
          apiClient.get('/standings/constructors/2024'),
          apiClient.get('/races/2024'),
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
        // Fallbacks remain active
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Leader points for gap bar calculation
  const leaderPoints = wdcStandings[0]?.points || 393;
  const wccLeaderPoints = wccStandings[0]?.points || 593;

  return (
    <div className="space-y-6">
      {/* 1. Next Grand Prix Countdown Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#12161F] via-[#1A202C] to-[#12161F] border border-[#2A3245] p-6 lg:p-8 shadow-2xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-red-600/15 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-[#E10600]/20 text-[#E10600] border border-[#E10600]/40 uppercase tracking-wider">
                Round {nextGp.round} of 24
              </span>
              <span className="text-xl">{nextGp.flag}</span>
              <FlagBadge flag="GREEN" />
            </div>

            <h2 className="text-2xl lg:text-3xl font-display font-black tracking-wide text-white">
              {nextGp.name}
            </h2>

            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#94A3B8]">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#E10600]" />
                {nextGp.circuit}, {nextGp.country}
              </span>
              <span>•</span>
              <span>{nextGp.laps} Laps ({nextGp.length})</span>
              <span>•</span>
              <span>Lights Out: Nov 23, 22:00 Local</span>
            </div>
          </div>

          {/* Countdown Display Box */}
          <div className="flex items-center gap-3 bg-[#0B0E14]/80 border border-[#2A3245] p-4 rounded-xl shadow-inner">
            {[
              { val: countdown.days, label: 'DAYS' },
              { val: countdown.hours, label: 'HOURS' },
              { val: countdown.minutes, label: 'MINS' },
              { val: countdown.seconds, label: 'SECS' },
            ].map((unit, i) => (
              <React.Fragment key={unit.label}>
                <div className="text-center min-w-[50px]">
                  <span className="block text-2xl lg:text-3xl font-mono font-black text-amber-400 tabular-nums">
                    {unit.val}
                  </span>
                  <span className="text-[9px] font-mono font-bold tracking-widest text-[#64748B]">
                    {unit.label}
                  </span>
                </div>
                {i < 3 && <span className="text-xl font-mono font-bold text-[#2A3245]">:</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Last Race Podium Card & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Podium Card (São Paulo GP) */}
        <div className="lg:col-span-2 bg-[#12161F] border border-[#2A3245] rounded-xl p-5 space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-[#2A3245] pb-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Last Grand Prix Podium — São Paulo</h3>
            </div>
            <button
              onClick={() => onNavigate('analysis')}
              className="text-xs font-mono text-[#E10600] hover:underline flex items-center gap-1"
            >
              <span>Full Analysis</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Stepped Visual Podium Cards */}
          <div className="grid grid-cols-3 gap-3 items-end pt-2">
            {/* P2: Ocon */}
            <div className="bg-[#1C2230] border border-[#2A3245] rounded-xl p-3 text-center space-y-2 relative overflow-hidden h-36 flex flex-col justify-between">
              <div className="w-full h-1 absolute top-0 left-0" style={{ backgroundColor: getTeamColor('alpine') }} />
              <div>
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-400/20 text-slate-300">
                  P2 (Silver)
                </span>
                <p className="font-mono font-black text-base text-white mt-1">OCO</p>
                <p className="text-[11px] text-[#94A3B8] truncate">Esteban Ocon</p>
              </div>
              <p className="text-[10px] font-mono text-[#64748B]">+19.477s</p>
            </div>

            {/* P1: Verstappen */}
            <div className="bg-[#1C2230] border border-amber-500/40 rounded-xl p-3 text-center space-y-2 relative overflow-hidden h-44 flex flex-col justify-between shadow-lg shadow-amber-950/20">
              <div className="w-full h-1.5 absolute top-0 left-0" style={{ backgroundColor: getTeamColor('redbull') }} />
              <div>
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  P1 (Winner)
                </span>
                <p className="font-mono font-black text-xl text-white mt-1">VER</p>
                <p className="text-xs font-semibold text-[#94A3B8] truncate">Max Verstappen</p>
              </div>
              <div className="space-y-0.5">
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-purple-500/20 text-purple-300">
                  Fastest Lap
                </span>
                <p className="text-[11px] font-mono font-bold text-white">2:06:54.430</p>
              </div>
            </div>

            {/* P3: Gasly */}
            <div className="bg-[#1C2230] border border-[#2A3245] rounded-xl p-3 text-center space-y-2 relative overflow-hidden h-32 flex flex-col justify-between">
              <div className="w-full h-1 absolute top-0 left-0" style={{ backgroundColor: getTeamColor('alpine') }} />
              <div>
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-700/20 text-amber-500">
                  P3 (Bronze)
                </span>
                <p className="font-mono font-black text-base text-white mt-1">GAS</p>
                <p className="text-[11px] text-[#94A3B8] truncate">Pierre Gasly</p>
              </div>
              <p className="text-[10px] font-mono text-[#64748B]">+22.532s</p>
            </div>
          </div>
        </div>

        {/* Quick Launch Card */}
        <div className="bg-[#12161F] border border-[#2A3245] rounded-xl p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2 text-[#E10600]">
              <Sparkles className="w-4 h-4" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">PitWall Command Suite</h3>
            </div>
            <p className="text-xs text-[#94A3B8] font-mono leading-relaxed">
              Real-time telemetry, simulated session replay, historical records from 1950 to present, and predictive undercut pit window modeling.
            </p>
          </div>

          <div className="space-y-2 font-mono text-xs">
            <button
              onClick={() => onNavigate('live')}
              className="w-full p-2.5 rounded-lg bg-[#E10600] hover:bg-[#FF1801] text-white font-bold flex items-center justify-between transition-colors shadow-lg shadow-red-900/30"
            >
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                <span>Launch Live Timing</span>
              </div>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('strategy')}
              className="w-full p-2.5 rounded-lg bg-[#1C2230] hover:bg-[#2A3245] text-white font-medium flex items-center justify-between border border-[#2A3245] transition-colors"
            >
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Strategy Pit Simulator</span>
              </div>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Championship Standings Tables (WDC / WCC) */}
      <div className="bg-[#12161F] border border-[#2A3245] rounded-xl p-5 space-y-4 shadow-lg">
        {/* Tabs & Full Stats Link */}
        <div className="flex items-center justify-between border-b border-[#2A3245] pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setStandingsTab('wdc')}
              className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition-colors ${
                standingsTab === 'wdc'
                  ? 'bg-[#E10600] text-white'
                  : 'bg-[#1C2230] text-[#94A3B8] hover:text-white'
              }`}
            >
              Drivers Championship (WDC)
            </button>
            <button
              onClick={() => setStandingsTab('wcc')}
              className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition-colors ${
                standingsTab === 'wcc'
                  ? 'bg-[#E10600] text-white'
                  : 'bg-[#1C2230] text-[#94A3B8] hover:text-white'
              }`}
            >
              Constructors Championship (WCC)
            </button>
          </div>

          <button
            onClick={() => onNavigate('stats')}
            className="text-xs font-mono text-[#E10600] hover:underline hidden sm:flex items-center gap-1"
          >
            <span>All Historical Records (1950–Present)</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* WDC Table */}
        {standingsTab === 'wdc' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="text-[#64748B] border-b border-[#2A3245] pb-2 text-[11px] uppercase">
                  <th className="py-2 px-2 w-10 text-center">POS</th>
                  <th className="py-2 px-3">DRIVER</th>
                  <th className="py-2 px-3">TEAM</th>
                  <th className="py-2 px-2 text-center">WINS</th>
                  <th className="py-2 px-3 text-right">POINTS</th>
                  <th className="py-2 px-3 w-40 hidden md:table-cell">GAP TO LEADER</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A3245]/40">
                {wdcStandings.slice(0, 10).map((row, idx) => {
                  const teamColor = getTeamColor(row.constructor_name || row.constructor_id);
                  const gap = leaderPoints - row.points;
                  const pct = Math.max(5, (row.points / leaderPoints) * 100);

                  return (
                    <tr key={row.driver_code || idx} className="hover:bg-[#1C2230]/50 transition-colors">
                      <td className="py-2.5 px-2 text-center font-bold">
                        <span className={`inline-block w-6 text-center ${row.position === 1 ? 'text-amber-400 font-black' : 'text-[#94A3B8]'}`}>
                          {row.position}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <span className="w-1 h-3.5 rounded-full" style={{ backgroundColor: teamColor }} />
                          <span className="font-bold text-white">{row.driver_code}</span>
                          <span className="text-[#94A3B8] hidden sm:inline">
                            {row.given_name} {row.family_name}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-[#94A3B8] truncate max-w-[150px]">
                        {row.constructor_name}
                      </td>
                      <td className="py-2.5 px-2 text-center font-bold text-white">
                        {row.wins || 0}
                      </td>
                      <td className="py-2.5 px-3 text-right font-black text-white tabular-nums">
                        {row.points}
                      </td>
                      <td className="py-2.5 px-3 hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-[#1C2230] rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: teamColor }} />
                          </div>
                          <span className="text-[10px] text-[#64748B] w-10 text-right">
                            {gap === 0 ? 'LEAD' : `-${gap}`}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* WCC Table */}
        {standingsTab === 'wcc' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="text-[#64748B] border-b border-[#2A3245] pb-2 text-[11px] uppercase">
                  <th className="py-2 px-2 w-10 text-center">POS</th>
                  <th className="py-2 px-3">CONSTRUCTOR</th>
                  <th className="py-2 px-2 text-center">WINS</th>
                  <th className="py-2 px-3 text-right">POINTS</th>
                  <th className="py-2 px-3 w-40 hidden md:table-cell">GAP TO LEADER</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A3245]/40">
                {wccStandings.map((row, idx) => {
                  const teamColor = getTeamColor(row.constructor_name || row.constructor_id);
                  const gap = wccLeaderPoints - row.points;
                  const pct = Math.max(5, (row.points / wccLeaderPoints) * 100);

                  return (
                    <tr key={row.constructor_name || idx} className="hover:bg-[#1C2230]/50 transition-colors">
                      <td className="py-2.5 px-2 text-center font-bold">
                        <span className={`inline-block w-6 text-center ${row.position === 1 ? 'text-amber-400 font-black' : 'text-[#94A3B8]'}`}>
                          {row.position}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-4 rounded-full" style={{ backgroundColor: teamColor }} />
                          <span className="font-bold text-white text-sm">{row.constructor_name}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-2 text-center font-bold text-white">
                        {row.wins || 0}
                      </td>
                      <td className="py-2.5 px-3 text-right font-black text-white tabular-nums text-sm">
                        {row.points}
                      </td>
                      <td className="py-2.5 px-3 hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-[#1C2230] rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: teamColor }} />
                          </div>
                          <span className="text-[10px] text-[#64748B] w-12 text-right">
                            {gap === 0 ? 'LEAD' : `-${gap} PTS`}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. 24-Round Season Calendar Grid */}
      <div className="bg-[#12161F] border border-[#2A3245] rounded-xl p-5 space-y-4 shadow-lg">
        <div className="flex items-center justify-between border-b border-[#2A3245] pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#E10600]" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">2024 Season Calendar (24 Rounds)</h3>
          </div>
          <span className="text-xs font-mono text-[#64748B]">Click any completed Grand Prix to view Race Analysis</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {calendar.map((race) => {
            const isNext = race.round === nextGp.round;

            return (
              <div
                key={race.round}
                onClick={() => {
                  if (race.is_completed) onNavigate('analysis');
                }}
                className={`p-3.5 rounded-xl border transition-all ${
                  isNext
                    ? 'bg-[#E10600]/10 border-[#E10600] shadow-lg shadow-red-950/30 ring-1 ring-[#E10600]'
                    : race.is_completed
                    ? 'bg-[#1C2230] border-[#2A3245] hover:border-[#64748B] cursor-pointer'
                    : 'bg-[#151922] border-[#2A3245]/60 opacity-70'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[10px] font-mono font-bold text-[#64748B]">ROUND {race.round}</span>
                  {isNext ? (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#E10600] text-white animate-pulse">
                      NEXT UP
                    </span>
                  ) : race.is_completed ? (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      COMPLETED
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#2A3245] text-[#94A3B8]">
                      UPCOMING
                    </span>
                  )}
                </div>

                <h4 className="font-bold text-sm text-white truncate">{race.race_name}</h4>
                <p className="text-[11px] font-mono text-[#94A3B8] truncate mt-0.5">{race.circuit_name}</p>

                <div className="flex items-center justify-between pt-2 mt-2 border-t border-[#2A3245]/60 text-[10px] font-mono text-[#64748B]">
                  <span>{formatDate(race.date)}</span>
                  {race.sprint && (
                    <span className="text-amber-400 font-bold">SPRINT</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
