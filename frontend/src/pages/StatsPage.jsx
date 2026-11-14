import React, { useState, useMemo } from 'react';
import {
  Trophy,
  Search,
  Users,
  Shield,
  Award,
  Sparkles,
  ArrowUpDown,
  Filter,
} from 'lucide-react';
import DriverAvatar from '../components/common/DriverAvatar';
import Modal from '../components/common/Modal';
import { DRIVER_PROFILES } from '../utils/drivers';

/**
 * Complete, unbroken archive of Formula 1 World Champions (1950–Present)
 */
export const ALL_TIME_CHAMPIONS = [
  { year: 2025, driver: 'Lando Norris', code: 'NOR', team: 'McLaren', wins: 8, points: 421 },
  { year: 2024, driver: 'Max Verstappen', code: 'VER', team: 'Red Bull Racing', wins: 9, points: 437 },
  { year: 2023, driver: 'Max Verstappen', code: 'VER', team: 'Red Bull Racing', wins: 19, points: 575 },
  { year: 2022, driver: 'Max Verstappen', code: 'VER', team: 'Red Bull Racing', wins: 15, points: 454 },
  { year: 2021, driver: 'Max Verstappen', code: 'VER', team: 'Red Bull Racing', wins: 10, points: 395.5 },
  { year: 2020, driver: 'Lewis Hamilton', code: 'HAM', team: 'Mercedes', wins: 11, points: 347 },
  { year: 2019, driver: 'Lewis Hamilton', code: 'HAM', team: 'Mercedes', wins: 11, points: 413 },
  { year: 2018, driver: 'Lewis Hamilton', code: 'HAM', team: 'Mercedes', wins: 11, points: 408 },
  { year: 2017, driver: 'Lewis Hamilton', code: 'HAM', team: 'Mercedes', wins: 9, points: 363 },
  { year: 2016, driver: 'Nico Rosberg', code: 'ROS', team: 'Mercedes', wins: 9, points: 385 },
  { year: 2015, driver: 'Lewis Hamilton', code: 'HAM', team: 'Mercedes', wins: 10, points: 381 },
  { year: 2014, driver: 'Lewis Hamilton', code: 'HAM', team: 'Mercedes', wins: 11, points: 384 },
  { year: 2013, driver: 'Sebastian Vettel', code: 'VET', team: 'Red Bull Racing', wins: 13, points: 397 },
  { year: 2012, driver: 'Sebastian Vettel', code: 'VET', team: 'Red Bull Racing', wins: 5, points: 281 },
  { year: 2011, driver: 'Sebastian Vettel', code: 'VET', team: 'Red Bull Racing', wins: 11, points: 392 },
  { year: 2010, driver: 'Sebastian Vettel', code: 'VET', team: 'Red Bull Racing', wins: 5, points: 256 },
  { year: 2009, driver: 'Jenson Button', code: 'BUT', team: 'Brawn GP', wins: 6, points: 95 },
  { year: 2008, driver: 'Lewis Hamilton', code: 'HAM', team: 'McLaren', wins: 5, points: 98 },
  { year: 2007, driver: 'Kimi Räikkönen', code: 'RAI', team: 'Ferrari', wins: 6, points: 110 },
  { year: 2006, driver: 'Fernando Alonso', code: 'ALO', team: 'Renault', wins: 7, points: 134 },
  { year: 2005, driver: 'Fernando Alonso', code: 'ALO', team: 'Renault', wins: 7, points: 133 },
  { year: 2004, driver: 'Michael Schumacher', code: 'MSC', team: 'Ferrari', wins: 13, points: 148 },
  { year: 2003, driver: 'Michael Schumacher', code: 'MSC', team: 'Ferrari', wins: 6, points: 93 },
  { year: 2002, driver: 'Michael Schumacher', code: 'MSC', team: 'Ferrari', wins: 11, points: 144 },
  { year: 2001, driver: 'Michael Schumacher', code: 'MSC', team: 'Ferrari', wins: 9, points: 123 },
  { year: 2000, driver: 'Michael Schumacher', code: 'MSC', team: 'Ferrari', wins: 9, points: 108 },
  { year: 1999, driver: 'Mika Häkkinen', code: 'HAK', team: 'McLaren', wins: 5, points: 76 },
  { year: 1998, driver: 'Mika Häkkinen', code: 'HAK', team: 'McLaren', wins: 8, points: 100 },
  { year: 1997, driver: 'Jacques Villeneuve', code: 'VIL', team: 'Williams', wins: 7, points: 81 },
  { year: 1996, driver: 'Damon Hill', code: 'HIL', team: 'Williams', wins: 8, points: 97 },
  { year: 1995, driver: 'Michael Schumacher', code: 'MSC', team: 'Benetton', wins: 9, points: 102 },
  { year: 1994, driver: 'Michael Schumacher', code: 'MSC', team: 'Benetton', wins: 8, points: 92 },
  { year: 1993, driver: 'Alain Prost', code: 'PRO', team: 'Williams', wins: 7, points: 99 },
  { year: 1992, driver: 'Nigel Mansell', code: 'MAN', team: 'Williams', wins: 9, points: 108 },
  { year: 1991, driver: 'Ayrton Senna', code: 'SEN', team: 'McLaren', wins: 7, points: 96 },
  { year: 1990, driver: 'Ayrton Senna', code: 'SEN', team: 'McLaren', wins: 6, points: 78 },
  { year: 1989, driver: 'Alain Prost', code: 'PRO', team: 'McLaren', wins: 4, points: 76 },
  { year: 1988, driver: 'Ayrton Senna', code: 'SEN', team: 'McLaren', wins: 8, points: 90 },
  { year: 1987, driver: 'Nelson Piquet', code: 'PIQ', team: 'Williams', wins: 3, points: 73 },
  { year: 1986, driver: 'Alain Prost', code: 'PRO', team: 'McLaren', wins: 4, points: 72 },
  { year: 1985, driver: 'Alain Prost', code: 'PRO', team: 'McLaren', wins: 5, points: 73 },
  { year: 1984, driver: 'Niki Lauda', code: 'LAU', team: 'McLaren', wins: 5, points: 72 },
  { year: 1983, driver: 'Nelson Piquet', code: 'PIQ', team: 'Brabham', wins: 3, points: 59 },
  { year: 1982, driver: 'Keke Rosberg', code: 'ROS', team: 'Williams', wins: 1, points: 44 },
  { year: 1981, driver: 'Nelson Piquet', code: 'PIQ', team: 'Brabham', wins: 3, points: 50 },
  { year: 1980, driver: 'Alan Jones', code: 'JON', team: 'Williams', wins: 5, points: 67 },
  { year: 1979, driver: 'Jody Scheckter', code: 'SCH', team: 'Ferrari', wins: 3, points: 51 },
  { year: 1978, driver: 'Mario Andretti', code: 'AND', team: 'Lotus', wins: 6, points: 64 },
  { year: 1977, driver: 'Niki Lauda', code: 'LAU', team: 'Ferrari', wins: 3, points: 72 },
  { year: 1976, driver: 'James Hunt', code: 'HUN', team: 'McLaren', wins: 6, points: 69 },
  { year: 1975, driver: 'Niki Lauda', code: 'LAU', team: 'Ferrari', wins: 5, points: 64.5 },
  { year: 1974, driver: 'Emerson Fittipaldi', code: 'FIT', team: 'McLaren', wins: 3, points: 55 },
  { year: 1973, driver: 'Jackie Stewart', code: 'STE', team: 'Tyrrell', wins: 5, points: 71 },
  { year: 1972, driver: 'Emerson Fittipaldi', code: 'FIT', team: 'Lotus', wins: 5, points: 61 },
  { year: 1971, driver: 'Jackie Stewart', code: 'STE', team: 'Tyrrell', wins: 6, points: 62 },
  { year: 1970, driver: 'Jochen Rindt', code: 'RIN', team: 'Lotus', wins: 5, points: 45 },
  { year: 1969, driver: 'Jackie Stewart', code: 'STE', team: 'Matra', wins: 6, points: 63 },
  { year: 1968, driver: 'Graham Hill', code: 'HIL', team: 'Lotus', wins: 3, points: 48 },
  { year: 1967, driver: 'Denny Hulme', code: 'HUL', team: 'Brabham', wins: 2, points: 51 },
  { year: 1966, driver: 'Jack Brabham', code: 'BRA', team: 'Brabham', wins: 4, points: 42 },
  { year: 1965, driver: 'Jim Clark', code: 'CLA', team: 'Lotus', wins: 6, points: 54 },
  { year: 1964, driver: 'John Surtees', code: 'SUR', team: 'Ferrari', wins: 2, points: 40 },
  { year: 1963, driver: 'Jim Clark', code: 'CLA', team: 'Lotus', wins: 7, points: 54 },
  { year: 1962, driver: 'Graham Hill', code: 'HIL', team: 'BRM', wins: 4, points: 42 },
  { year: 1961, driver: 'Phil Hill', code: 'HIL', team: 'Ferrari', wins: 2, points: 34 },
  { year: 1960, driver: 'Jack Brabham', code: 'BRA', team: 'Cooper', wins: 5, points: 43 },
  { year: 1959, driver: 'Jack Brabham', code: 'BRA', team: 'Cooper', wins: 2, points: 31 },
  { year: 1958, driver: 'Mike Hawthorn', code: 'HAW', team: 'Ferrari', wins: 1, points: 42 },
  { year: 1957, driver: 'Juan Manuel Fangio', code: 'FAN', team: 'Maserati', wins: 4, points: 40 },
  { year: 1956, driver: 'Juan Manuel Fangio', code: 'FAN', team: 'Ferrari', wins: 3, points: 30 },
  { year: 1955, driver: 'Juan Manuel Fangio', code: 'FAN', team: 'Mercedes', wins: 4, points: 40 },
  { year: 1954, driver: 'Juan Manuel Fangio', code: 'FAN', team: 'Maserati / Mercedes', wins: 6, points: 42 },
  { year: 1953, driver: 'Alberto Ascari', code: 'ASC', team: 'Ferrari', wins: 5, points: 34.5 },
  { year: 1952, driver: 'Alberto Ascari', code: 'ASC', team: 'Ferrari', wins: 6, points: 36 },
  { year: 1951, driver: 'Juan Manuel Fangio', code: 'FAN', team: 'Alfa Romeo', wins: 3, points: 31 },
  { year: 1950, driver: 'Giuseppe Farina', code: 'FAR', team: 'Alfa Romeo', wins: 3, points: 30 },
];

/**
 * All-Time Driver Legend Records (1950–Present)
 */
export const ALL_TIME_DRIVERS = [
  { driver_id: 'hamilton', driver_code: 'HAM', driver_name: 'Lewis Hamilton', nationality: 'British', flag: '🇬🇧', championships: 7, race_entries: 360, race_wins: 105, podiums: 202, pole_positions: 104, fastest_laps: 67, dnf_count: 32, win_percentage: 29.2 },
  { driver_id: 'michael_schumacher', driver_code: 'MSC', driver_name: 'Michael Schumacher', nationality: 'German', flag: '🇩🇪', championships: 7, race_entries: 308, race_wins: 91, podiums: 155, pole_positions: 68, fastest_laps: 77, dnf_count: 68, win_percentage: 29.5 },
  { driver_id: 'max_verstappen', driver_code: 'VER', driver_name: 'Max Verstappen', nationality: 'Dutch', flag: '🇳🇱', championships: 4, race_entries: 215, race_wins: 65, podiums: 115, pole_positions: 42, fastest_laps: 35, dnf_count: 32, win_percentage: 30.2 },
  { driver_id: 'vettel', driver_code: 'VET', driver_name: 'Sebastian Vettel', nationality: 'German', flag: '🇩🇪', championships: 4, race_entries: 299, race_wins: 53, podiums: 122, pole_positions: 57, fastest_laps: 38, dnf_count: 44, win_percentage: 17.7 },
  { driver_id: 'prost', driver_code: 'PRO', driver_name: 'Alain Prost', nationality: 'French', flag: '🇫🇷', championships: 4, race_entries: 202, race_wins: 51, podiums: 106, pole_positions: 33, fastest_laps: 41, dnf_count: 57, win_percentage: 25.2 },
  { driver_id: 'senna', driver_code: 'SEN', driver_name: 'Ayrton Senna', nationality: 'Brazilian', flag: '🇧🇷', championships: 3, race_entries: 162, race_wins: 41, podiums: 80, pole_positions: 65, fastest_laps: 19, dnf_count: 56, win_percentage: 25.3 },
  { driver_id: 'alonso', driver_code: 'ALO', driver_name: 'Fernando Alonso', nationality: 'Spanish', flag: '🇪🇸', championships: 2, race_entries: 405, race_wins: 32, podiums: 106, pole_positions: 22, fastest_laps: 26, dnf_count: 80, win_percentage: 7.9 },
  { driver_id: 'mansell', driver_code: 'MAN', driver_name: 'Nigel Mansell', nationality: 'British', flag: '🇬🇧', championships: 1, race_entries: 191, race_wins: 31, podiums: 59, pole_positions: 32, fastest_laps: 30, dnf_count: 86, win_percentage: 16.2 },
  { driver_id: 'stewart', driver_code: 'STE', driver_name: 'Jackie Stewart', nationality: 'British', flag: '🇬🇧', championships: 3, race_entries: 100, race_wins: 27, podiums: 43, pole_positions: 17, fastest_laps: 15, dnf_count: 34, win_percentage: 27.0 },
  { driver_id: 'clark', driver_code: 'CLA', driver_name: 'Jim Clark', nationality: 'British', flag: '🇬🇧', championships: 2, race_entries: 73, race_wins: 25, podiums: 32, pole_positions: 33, fastest_laps: 28, dnf_count: 27, win_percentage: 34.2 },
  { driver_id: 'lauda', driver_code: 'LAU', driver_name: 'Niki Lauda', nationality: 'Austrian', flag: '🇦🇹', championships: 3, race_entries: 177, race_wins: 25, podiums: 54, pole_positions: 24, fastest_laps: 24, dnf_count: 81, win_percentage: 14.1 },
  { driver_id: 'fangio', driver_code: 'FAN', driver_name: 'Juan Manuel Fangio', nationality: 'Argentine', flag: '🇦🇷', championships: 5, race_entries: 52, race_wins: 24, podiums: 35, pole_positions: 29, fastest_laps: 23, dnf_count: 13, win_percentage: 46.2 },
  { driver_id: 'norris', driver_code: 'NOR', driver_name: 'Lando Norris', nationality: 'British', flag: '🇬🇧', championships: 1, race_entries: 135, race_wins: 11, podiums: 35, pole_positions: 12, fastest_laps: 14, dnf_count: 12, win_percentage: 8.1 },
  { driver_id: 'piastri', driver_code: 'PIA', driver_name: 'Oscar Piastri', nationality: 'Australian', flag: '🇦🇺', championships: 0, race_entries: 50, race_wins: 5, podiums: 18, pole_positions: 2, fastest_laps: 4, dnf_count: 4, win_percentage: 10.0 },
  { driver_id: 'leclerc', driver_code: 'LEC', driver_name: 'Charles Leclerc', nationality: 'Monegasque', flag: '🇲🇨', championships: 0, race_entries: 150, race_wins: 9, podiums: 45, pole_positions: 26, fastest_laps: 11, dnf_count: 21, win_percentage: 6.0 },
  { driver_id: 'russell', driver_code: 'RUS', driver_name: 'George Russell', nationality: 'British', flag: '🇬🇧', championships: 0, race_entries: 130, race_wins: 5, podiums: 20, pole_positions: 5, fastest_laps: 8, dnf_count: 15, win_percentage: 3.8 },
];

/**
 * All-Time Constructor Records
 */
export const ALL_TIME_CONSTRUCTORS = [
  { constructor_id: 'ferrari', constructor_name: 'Ferrari', nationality: 'Italian', flag: '🇮🇹', championships: 16, race_entries: 1105, race_wins: 250, podiums: 830, pole_positions: 254, win_percentage: 22.6 },
  { constructor_id: 'mclaren', constructor_name: 'McLaren', nationality: 'British', flag: '🇬🇧', championships: 9, race_entries: 975, race_wins: 195, podiums: 535, pole_positions: 168, win_percentage: 20.0 },
  { constructor_id: 'mercedes', constructor_name: 'Mercedes', nationality: 'German', flag: '🇩🇪', championships: 8, race_entries: 320, race_wins: 130, podiums: 302, pole_positions: 140, win_percentage: 40.6 },
  { constructor_id: 'williams', constructor_name: 'Williams', nationality: 'British', flag: '🇬🇧', championships: 9, race_entries: 830, race_wins: 114, podiums: 313, pole_positions: 128, win_percentage: 13.7 },
  { constructor_id: 'red_bull', constructor_name: 'Red Bull Racing', nationality: 'Austrian', flag: '🇦🇹', championships: 6, race_entries: 400, race_wins: 125, podiums: 290, pole_positions: 106, win_percentage: 31.2 },
  { constructor_id: 'team_lotus', constructor_name: 'Team Lotus', nationality: 'British', flag: '🇬🇧', championships: 7, race_entries: 491, race_wins: 79, podiums: 172, pole_positions: 107, win_percentage: 16.1 },
  { constructor_id: 'brabham', constructor_name: 'Brabham', nationality: 'British', flag: '🇬🇧', championships: 2, race_entries: 402, race_wins: 35, podiums: 124, pole_positions: 40, win_percentage: 8.7 },
  { constructor_id: 'renault', constructor_name: 'Renault / Alpine', nationality: 'French', flag: '🇫🇷', championships: 2, race_entries: 440, race_wins: 36, podiums: 108, pole_positions: 51, win_percentage: 8.1 },
];

export default function StatsPage() {
  const [activeTab, setActiveTab] = useState('champions'); // 'champions' | 'drivers' | 'constructors'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDecade, setSelectedDecade] = useState('ALL');

  // Head-to-Head Compare Modal
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [driver1Code, setDriver1Code] = useState('HAM');
  const [driver2Code, setDriver2Code] = useState('VER');

  // Filter Champions by Decade & Search
  const filteredChampions = useMemo(() => {
    return ALL_TIME_CHAMPIONS.filter((c) => {
      if (selectedDecade !== 'ALL') {
        const year = c.year;
        if (selectedDecade === '2020s' && (year < 2020 || year > 2029)) return false;
        if (selectedDecade === '2010s' && (year < 2010 || year > 2019)) return false;
        if (selectedDecade === '2000s' && (year < 2000 || year > 2009)) return false;
        if (selectedDecade === '90s' && (year < 1990 || year > 1999)) return false;
        if (selectedDecade === '80s' && (year < 1980 || year > 1989)) return false;
        if (selectedDecade === '70s' && (year < 1970 || year > 1979)) return false;
        if (selectedDecade === '60s' && (year < 1960 || year > 1969)) return false;
        if (selectedDecade === '50s' && (year < 1950 || year > 1959)) return false;
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          c.driver.toLowerCase().includes(q) ||
          c.team.toLowerCase().includes(q) ||
          String(c.year).includes(q)
        );
      }
      return true;
    });
  }, [selectedDecade, searchQuery]);

  // Filter Drivers by Search
  const filteredDrivers = useMemo(() => {
    return ALL_TIME_DRIVERS.filter((d) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          d.driver_name.toLowerCase().includes(q) ||
          d.nationality.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [searchQuery]);

  const d1 = ALL_TIME_DRIVERS.find((d) => d.driver_code === driver1Code) || ALL_TIME_DRIVERS[0];
  const d2 = ALL_TIME_DRIVERS.find((d) => d.driver_code === driver2Code) || ALL_TIME_DRIVERS[2];

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar */}
      <div className="bg-[#12161F] border border-[#2A3245] rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#E10600]/20 text-[#E10600] border border-[#E10600]/40 uppercase tracking-wider">
                Historical Archive
              </span>
              <span className="text-xs font-mono text-[#64748B]">Complete Records 1950–Present</span>
            </div>
            <h2 className="text-xl lg:text-2xl font-display font-black text-white tracking-wide uppercase">
              Formula 1 All-Time Championships & Hall of Fame
            </h2>
          </div>

          {/* Action Button: Head-to-Head Compare */}
          <button
            onClick={() => setCompareModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#E10600] hover:bg-[#B30500] text-white rounded-lg font-mono text-xs font-bold transition-all shadow-lg shadow-red-950/40 shrink-0"
          >
            <Users className="w-4 h-4" />
            <span>Driver Head-to-Head Matrix</span>
          </button>
        </div>

        {/* Tab Switcher & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#2A3245]">
          <div className="flex items-center gap-2">
            {[
              { id: 'champions', label: 'World Champions (1950–Now)', icon: Trophy },
              { id: 'drivers', label: 'Driver Career Records', icon: Award },
              { id: 'constructors', label: 'Constructors Records', icon: Shield },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                    activeTab === tab.id
                      ? 'bg-[#1C2230] border border-[#E10600] text-white font-bold'
                      : 'text-[#94A3B8] hover:text-white hover:bg-[#151922]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 text-[#E10600]" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search driver, team, year..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1C2230] border border-[#2A3245] rounded-lg pl-9 pr-3 py-1.5 text-xs font-mono text-white placeholder-[#64748B] focus:outline-none focus:border-[#E10600]"
            />
          </div>
        </div>

        {/* Decade Filters (Only shown on Champions tab) */}
        {activeTab === 'champions' && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#2A3245]/60 text-xs font-mono">
            <span className="text-[#64748B] mr-2">Decade:</span>
            {['ALL', '2020s', '2010s', '2000s', '90s', '80s', '70s', '60s', '50s'].map((dec) => (
              <button
                key={dec}
                onClick={() => setSelectedDecade(dec)}
                className={`px-2.5 py-0.5 rounded text-[11px] transition-all ${
                  selectedDecade === dec
                    ? 'bg-[#E10600] text-white font-bold'
                    : 'bg-[#1C2230] text-[#94A3B8] hover:text-white border border-[#2A3245]'
                }`}
              >
                {dec}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. Champions Archive Grid (Every Single Year from 1950 to Present) */}
      {activeTab === 'champions' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {filteredChampions.map((champ) => (
            <div
              key={champ.year}
              className="bg-[#12161F] border border-[#2A3245] rounded-xl p-4 hover:border-[#E10600]/60 transition-all shadow-md group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-base font-mono font-black text-white px-2 py-0.5 rounded bg-[#1C2230] border border-[#2A3245]">
                    {champ.year}
                  </span>
                  <Trophy className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                </div>

                <div className="flex items-center gap-3 mb-3">
                  <DriverAvatar code={champ.code} name={champ.driver} size="md" />
                  <div className="min-w-0">
                    <h4 className="font-bold text-white text-sm truncate leading-snug">
                      {champ.driver}
                    </h4>
                    <p className="text-[11px] font-mono text-[#94A3B8] truncate">{champ.team}</p>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#2A3245]/60 flex items-center justify-between text-xs font-mono text-[#64748B]">
                <span className="text-[#00F0FF] font-bold">{champ.wins} Wins</span>
                <span className="text-white font-bold">{champ.points} PTS</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. Driver All-Time Career Leaderboards */}
      {activeTab === 'drivers' && (
        <div className="bg-[#12161F] border border-[#2A3245] rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-[#151922] border-b border-[#2A3245] text-[#94A3B8] uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Driver</th>
                  <th className="py-3 px-4 text-center">WDC Titles</th>
                  <th className="py-3 px-4 text-center">Wins</th>
                  <th className="py-3 px-4 text-center">Podiums</th>
                  <th className="py-3 px-4 text-center">Poles</th>
                  <th className="py-3 px-4 text-center">Fastest Laps</th>
                  <th className="py-3 px-4 text-center">Entries</th>
                  <th className="py-3 px-4 text-right">Win Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A3245]/60">
                {filteredDrivers.map((d, idx) => (
                  <tr key={d.driver_id} className="hover:bg-[#1C2230]/70 transition-colors">
                    <td className="py-3 px-4 text-[#64748B] font-bold">{idx + 1}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <DriverAvatar code={d.driver_code} name={d.driver_name} size="sm" />
                        <div>
                          <span className="font-bold text-white text-sm block">
                            {d.driver_name}
                          </span>
                          <span className="text-[10px] text-[#64748B]">
                            {d.flag} {d.nationality}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30">
                        {d.championships}x
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-white font-bold">{d.race_wins}</td>
                    <td className="py-3 px-4 text-center text-[#94A3B8]">{d.podiums}</td>
                    <td className="py-3 px-4 text-center text-[#94A3B8]">{d.pole_positions}</td>
                    <td className="py-3 px-4 text-center text-[#94A3B8]">{d.fastest_laps}</td>
                    <td className="py-3 px-4 text-center text-[#64748B]">{d.race_entries}</td>
                    <td className="py-3 px-4 text-right text-[#00F0FF] font-bold">
                      {d.win_percentage.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Constructor All-Time Leaderboards */}
      {activeTab === 'constructors' && (
        <div className="bg-[#12161F] border border-[#2A3245] rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-[#151922] border-b border-[#2A3245] text-[#94A3B8] uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Constructor</th>
                  <th className="py-3 px-4 text-center">Championships</th>
                  <th className="py-3 px-4 text-center">Race Wins</th>
                  <th className="py-3 px-4 text-center">Podiums</th>
                  <th className="py-3 px-4 text-center">Poles</th>
                  <th className="py-3 px-4 text-center">Total Entries</th>
                  <th className="py-3 px-4 text-right">Win Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A3245]/60">
                {ALL_TIME_CONSTRUCTORS.map((c, idx) => (
                  <tr key={c.constructor_id} className="hover:bg-[#1C2230]/70 transition-colors">
                    <td className="py-3 px-4 text-[#64748B] font-bold">{idx + 1}</td>
                    <td className="py-3 px-4 font-bold text-white text-sm">
                      <div className="flex items-center gap-2">
                        <span>{c.flag}</span>
                        <span>{c.constructor_name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30">
                        {c.championships}x WCC
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-white font-bold">{c.race_wins}</td>
                    <td className="py-3 px-4 text-center text-[#94A3B8]">{c.podiums}</td>
                    <td className="py-3 px-4 text-center text-[#94A3B8]">{c.pole_positions}</td>
                    <td className="py-3 px-4 text-center text-[#64748B]">{c.race_entries}</td>
                    <td className="py-3 px-4 text-right text-[#00F0FF] font-bold">
                      {c.win_percentage.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Head-to-Head Compare Modal (PORTALED TO DOCUMENT.BODY: ZERO BACKDROP CLIPPING) */}
      <Modal
        isOpen={compareModalOpen}
        onClose={() => setCompareModalOpen(false)}
        title="Driver Career Head-to-Head Matrix"
        icon={Users}
        maxWidth="max-w-2xl"
      >
        <div className="space-y-6">
          {/* Driver Selectors with Real Photos */}
          <div className="grid grid-cols-2 gap-4">
            {/* Driver 1 */}
            <div className="p-3 bg-[#151922] rounded-xl border border-[#2A3245] flex items-center gap-3">
              <DriverAvatar code={driver1Code} size="md" />
              <div className="flex-1 min-w-0">
                <label className="block text-[10px] font-mono text-[#64748B]">DRIVER 1</label>
                <select
                  value={driver1Code}
                  onChange={(e) => setDriver1Code(e.target.value)}
                  className="w-full bg-[#1C2230] border border-[#2A3245] text-white text-xs font-mono font-bold rounded p-1.5 focus:outline-none focus:border-[#E10600]"
                >
                  {ALL_TIME_DRIVERS.map((d) => (
                    <option key={d.driver_code} value={d.driver_code}>
                      {d.driver_name} ({d.championships}x WDC)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Driver 2 */}
            <div className="p-3 bg-[#151922] rounded-xl border border-[#2A3245] flex items-center gap-3">
              <DriverAvatar code={driver2Code} size="md" />
              <div className="flex-1 min-w-0">
                <label className="block text-[10px] font-mono text-[#64748B]">DRIVER 2</label>
                <select
                  value={driver2Code}
                  onChange={(e) => setDriver2Code(e.target.value)}
                  className="w-full bg-[#1C2230] border border-[#2A3245] text-white text-xs font-mono font-bold rounded p-1.5 focus:outline-none focus:border-[#E10600]"
                >
                  {ALL_TIME_DRIVERS.map((d) => (
                    <option key={d.driver_code} value={d.driver_code}>
                      {d.driver_name} ({d.championships}x WDC)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Comparison Matrix Rows */}
          <div className="space-y-2.5 font-mono text-xs">
            {[
              { label: 'World Championships', v1: d1.championships, v2: d2.championships },
              { label: 'Grand Prix Wins', v1: d1.race_wins, v2: d2.race_wins },
              { label: 'Podium Finishes', v1: d1.podiums, v2: d2.podiums },
              { label: 'Pole Positions', v1: d1.pole_positions, v2: d2.pole_positions },
              { label: 'Fastest Laps', v1: d1.fastest_laps, v2: d2.fastest_laps },
              { label: 'Career Win Rate', v1: `${d1.win_percentage.toFixed(1)}%`, v2: `${d2.win_percentage.toFixed(1)}%`, num1: d1.win_percentage, num2: d2.win_percentage },
              { label: 'Race Starts', v1: d1.race_entries, v2: d2.race_entries },
            ].map((row) => {
              const n1 = row.num1 !== undefined ? row.num1 : Number(row.v1);
              const n2 = row.num2 !== undefined ? row.num2 : Number(row.v2);
              const d1Wins = n1 > n2;
              const d2Wins = n2 > n1;

              return (
                <div
                  key={row.label}
                  className="p-3 bg-[#1C2230] rounded-xl border border-[#2A3245] flex items-center justify-between"
                >
                  <span className={`w-20 font-bold text-sm tabular-nums ${d1Wins ? 'text-amber-400' : 'text-white'}`}>
                    {row.v1}
                  </span>
                  <span className="text-center font-bold text-[#94A3B8] uppercase text-[11px]">
                    {row.label}
                  </span>
                  <span className={`w-20 text-right font-bold text-sm tabular-nums ${d2Wins ? 'text-amber-400' : 'text-white'}`}>
                    {row.v2}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </Modal>
    </div>
  );
}
