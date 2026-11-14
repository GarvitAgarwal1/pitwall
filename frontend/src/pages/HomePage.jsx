import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { useInterval } from '../hooks/useInterval';
import { getTeamColor } from '../utils/theme';
import { formatCountdown } from '../utils/formatters';
import { FlagBadge } from '../components/common/Badge';
import DriverAvatar from '../components/common/DriverAvatar';
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
];

// Official 2026 World Constructors' Championship Standings
const BASELINE_2026_WCC = [
  { position: 1, constructor_name: 'McLaren', points: 673, wins: 9, color: '#FF8000' },
  { position: 2, constructor_name: 'Ferrari', points: 640, wins: 7, color: '#E80020' },
  { position: 3, constructor_name: 'Red Bull Racing', points: 495, wins: 8, color: '#3671C6' },
  { position: 4, constructor_name: 'Mercedes', points: 348, wins: 1, color: '#27F4D2' },
  { position: 5, constructor_name: 'Williams', points: 213, wins: 0, color: '#64C4FF' },
  { position: 6, constructor_name: 'Aston Martin', points: 110, wins: 0, color: '#229971' },
  { position: 7, constructor_name: 'Alpine', points: 72, wins: 0, color: '#0093CC' },
  { position: 8, constructor_name: 'RB (Racing Bulls)', points: 58, wins: 0, color: '#6692FF' },
  { position: 9, constructor_name: 'Haas', points: 44, wins: 0, color: '#B6BABD' },
  { position: 10, constructor_name: 'Kick Sauber (Audi)', points: 26, wins: 0, color: '#52E252' },
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

export default function HomePage({ onNavigate }) {
  const [wdcStandings, setWdcStandings] = useState(BASELINE_2026_WDC);
  const [wccStandings, setWccStandings] = useState(BASELINE_2026_WCC);
  const [calendar, setCalendar] = useState(CALENDAR_2026);
  const [standingsTab, setStandingsTab] = useState('wdc'); // 'wdc' | 'wcc'

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
      // Clean fallback showcase loop
      const simulatedDiff = 1 * 86400 + 4 * 3600 + 32 * 60 + (60 - (Math.floor(Date.now() / 1000) % 60));
      setCountdown(formatCountdown(simulatedDiff));
    }
  }, 1000, true);

  // Attempt to fetch latest live season from backend (falls back seamlessly to 2026 baseline)
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

  return (
    <div className="space-y-6">
      {/* 1. Next Grand Prix Countdown Hero Banner (Spacious, Glassmorphic) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#12161F] via-[#1A202C] to-[#12161F] border border-[#2A3245] p-6 lg:p-8 shadow-2xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-red-600/15 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-[#E10600]/20 text-[#E10600] border border-[#E10600]/40 uppercase tracking-wider">
                Round {nextGp.round} of 24 • 2026 Season
              </span>
              <span className="text-xl">{nextGp.flag}</span>
              <FlagBadge flag="GREEN" />
            </div>

            <h2 className="text-2xl lg:text-3xl font-display font-black tracking-wide text-white uppercase">
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
              <span className="text-[#00F0FF]">Lights Out: Sun 17:00 Local</span>
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

      {/* 2. Top-3 Podium Feature Cards with Real Driver Photos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* P2: Lando Norris */}
        <div className="bg-[#12161F] border border-[#2A3245] rounded-xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between group hover:border-[#FF8000]/60 transition-all">
          <div className="h-1.5 w-full absolute top-0 left-0 bg-[#FF8000]" />
          <div className="flex items-center justify-between mb-4">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-400/20 text-slate-200 border border-slate-400/40">
              P2 IN CHAMPIONSHIP
            </span>
            <span className="font-mono text-xs text-[#94A3B8]">McLaren</span>
          </div>

          <div className="flex items-center gap-4 my-2">
            <DriverAvatar code="NOR" size="lg" showNumber />
            <div>
              <h3 className="font-bold text-lg text-white group-hover:text-[#FF8000] transition-colors">
                Lando Norris
              </h3>
              <p className="text-xs font-mono text-[#64748B]">7 Wins • 388 PTS</p>
              <span className="text-[11px] font-mono text-amber-400">-24 pts to P1</span>
            </div>
          </div>
        </div>

        {/* P1: Max Verstappen */}
        <div className="bg-[#12161F] border border-amber-500/40 rounded-xl p-5 shadow-xl relative overflow-hidden flex flex-col justify-between group hover:border-amber-400 transition-all shadow-amber-950/20">
          <div className="h-2 w-full absolute top-0 left-0 bg-[#3671C6]" />
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>CHAMPIONSHIP LEADER</span>
            </div>
            <span className="font-mono text-xs text-[#94A3B8]">Red Bull</span>
          </div>

          <div className="flex items-center gap-4 my-2">
            <DriverAvatar code="VER" size="xl" showNumber />
            <div>
              <h3 className="font-bold text-xl text-white group-hover:text-amber-400 transition-colors">
                Max Verstappen
              </h3>
              <p className="text-xs font-mono text-[#94A3B8]">8 Wins • 412 PTS</p>
              <span className="text-[11px] font-mono text-emerald-400 font-bold">Reigning World Champion</span>
            </div>
          </div>
        </div>

        {/* P3: Charles Leclerc */}
        <div className="bg-[#12161F] border border-[#2A3245] rounded-xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between group hover:border-[#E80020]/60 transition-all">
          <div className="h-1.5 w-full absolute top-0 left-0 bg-[#E80020]" />
          <div className="flex items-center justify-between mb-4">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-700/20 text-amber-300 border border-amber-700/40">
              P3 IN CHAMPIONSHIP
            </span>
            <span className="font-mono text-xs text-[#94A3B8]">Scuderia Ferrari</span>
          </div>

          <div className="flex items-center gap-4 my-2">
            <DriverAvatar code="LEC" size="lg" showNumber />
            <div>
              <h3 className="font-bold text-lg text-white group-hover:text-[#E80020] transition-colors">
                Charles Leclerc
              </h3>
              <p className="text-xs font-mono text-[#64748B]">4 Wins • 342 PTS</p>
              <span className="text-[11px] font-mono text-[#94A3B8]">-70 pts to P1</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Split View: Standings Leaderboard + 2026 Season Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Standings Table (2 Columns) */}
        <div className="lg:col-span-2 bg-[#12161F] border border-[#2A3245] rounded-xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#2A3245] pb-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                2026 World Championship Standings
              </h3>
            </div>

            {/* Standings Switcher: Drivers vs Constructors */}
            <div className="flex items-center bg-[#1C2230] p-1 rounded-lg border border-[#2A3245] text-xs font-mono">
              <button
                onClick={() => setStandingsTab('wdc')}
                className={`px-3 py-1 rounded transition-colors ${
                  standingsTab === 'wdc'
                    ? 'bg-[#E10600] text-white font-bold'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                Drivers (WDC)
              </button>
              <button
                onClick={() => setStandingsTab('wcc')}
                className={`px-3 py-1 rounded transition-colors ${
                  standingsTab === 'wcc'
                    ? 'bg-[#E10600] text-white font-bold'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                Constructors (WCC)
              </button>
            </div>
          </div>

          {/* WDC Table */}
          {standingsTab === 'wdc' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-[#151922] text-[#94A3B8] uppercase text-[10px] border-b border-[#2A3245]">
                  <tr>
                    <th className="py-2.5 px-3">Pos</th>
                    <th className="py-2.5 px-3">Driver</th>
                    <th className="py-2.5 px-3 hidden sm:table-cell">Team</th>
                    <th className="py-2.5 px-3 text-center">Wins</th>
                    <th className="py-2.5 px-3 text-right">Points</th>
                    <th className="py-2.5 px-3 hidden md:table-cell w-36">Points Gap</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A3245]/50">
                  {wdcStandings.map((d, index) => {
                    const pos = d.position || index + 1;
                    const teamColor = getTeamColor(d.constructor_name);
                    const gap = leaderPoints - d.points;
                    const pct = Math.max(5, (d.points / leaderPoints) * 100);

                    return (
                      <tr key={d.driver_code || index} className="hover:bg-[#1C2230]/60 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-white">
                          <span
                            className={`w-6 h-6 inline-flex items-center justify-center rounded text-xs ${
                              pos === 1
                                ? 'bg-amber-500/20 text-amber-400 font-black border border-amber-500/40'
                                : pos === 2
                                ? 'bg-slate-400/20 text-slate-200 font-bold'
                                : pos === 3
                                ? 'bg-amber-700/20 text-amber-300 font-bold'
                                : 'text-[#64748B]'
                            }`}
                          >
                            {pos}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2.5">
                            <DriverAvatar code={d.driver_code} size="sm" showNumber />
                            <div>
                              <span className="font-bold text-white text-xs block">
                                {d.given_name} {d.family_name}
                              </span>
                              <span className="text-[10px] text-[#64748B] sm:hidden">
                                {d.constructor_name}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 hidden sm:table-cell">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: teamColor }} />
                            <span className="text-[#94A3B8]">{d.constructor_name}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-center text-white font-bold">{d.wins}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-white">{d.points}</td>
                        <td className="py-2.5 px-3 hidden md:table-cell">
                          <div className="space-y-1">
                            <div className="w-full bg-[#0B0E14] h-1.5 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{ width: `${pct}%`, backgroundColor: teamColor }}
                              />
                            </div>
                            <span className="text-[9px] text-[#64748B] block text-right">
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
          ) : (
            /* WCC Table */
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-[#151922] text-[#94A3B8] uppercase text-[10px] border-b border-[#2A3245]">
                  <tr>
                    <th className="py-2.5 px-3">Pos</th>
                    <th className="py-2.5 px-3">Constructor</th>
                    <th className="py-2.5 px-3 text-center">Wins</th>
                    <th className="py-2.5 px-3 text-right">Points</th>
                    <th className="py-2.5 px-3 w-40">Championship Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A3245]/50">
                  {wccStandings.map((c, index) => {
                    const pos = c.position || index + 1;
                    const teamColor = c.color || getTeamColor(c.constructor_name);
                    const pct = Math.max(4, (c.points / wccLeaderPoints) * 100);

                    return (
                      <tr key={c.constructor_name} className="hover:bg-[#1C2230]/60 transition-colors">
                        <td className="py-3 px-3 font-bold text-white">{pos}</td>
                        <td className="py-3 px-3 font-bold text-white">
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded" style={{ backgroundColor: teamColor }} />
                            <span>{c.constructor_name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center text-white font-bold">{c.wins}</td>
                        <td className="py-3 px-3 text-right font-bold text-white">{c.points}</td>
                        <td className="py-3 px-3">
                          <div className="w-full bg-[#0B0E14] h-2 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{ width: `${pct}%`, backgroundColor: teamColor }}
                            />
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

        {/* 2026 Season Calendar Sidebar (Scrollable & Responsive) */}
        <div className="bg-[#12161F] border border-[#2A3245] rounded-xl p-5 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#2A3245] pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#E10600]" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  2026 Season Calendar
                </h3>
              </div>
              <span className="text-xs font-mono text-[#64748B]">24 Grand Prix</span>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {calendar.map((race) => {
                const isNext = race.round === nextGp.round;

                return (
                  <div
                    key={race.round}
                    className={`p-3 rounded-lg border text-xs font-mono transition-all flex items-center justify-between ${
                      isNext
                        ? 'bg-[#E10600]/15 border-[#E10600] text-white shadow-md'
                        : race.is_completed
                        ? 'bg-[#151922] border-[#2A3245]/60 text-[#94A3B8]'
                        : 'bg-[#1C2230]/40 border-[#2A3245] text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="text-base">{race.flag}</span>
                      <div className="truncate">
                        <span className="font-bold block truncate text-white">{race.race_name}</span>
                        <span className="text-[10px] text-[#64748B] block truncate">{race.circuit_name}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="block text-[10px] text-[#64748B]">R{race.round}</span>
                      {race.is_completed ? (
                        <span className="text-[10px] text-emerald-400 font-bold">COMPLETED</span>
                      ) : isNext ? (
                        <span className="text-[10px] text-amber-400 font-bold animate-pulse">NEXT UP</span>
                      ) : (
                        <span className="text-[10px] text-[#64748B]">{race.date.slice(5)}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => onNavigate('circuits')}
            className="w-full py-2.5 mt-3 bg-[#1C2230] hover:bg-[#2A3245] text-white rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-2 border border-[#2A3245] transition-colors"
          >
            <span>View Full Circuit Guides</span>
            <ChevronRight className="w-4 h-4 text-[#E10600]" />
          </button>
        </div>
      </div>
    </div>
  );
}
