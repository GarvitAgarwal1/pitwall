import React, { useState, useMemo, useEffect } from 'react';
import apiClient from '../api/client';
import {
  Trophy,
  Search,
  Users,
  Shield,
  Award,
  Sparkles,
  ArrowUpDown,
  Filter,
  Calendar,
  ChevronRight,
  ChevronDown,
  Info,
  ExternalLink,
  Flame,
} from 'lucide-react';
import DriverAvatar from '../components/common/DriverAvatar';
import Modal from '../components/common/Modal';
import {
  DRIVER_PROFILES,
  getDriverProfile,
  CONSTRUCTOR_LIVERIES,
} from '../utils/drivers';
import { getTeamColor } from '../utils/theme';

/**
 * Complete, unbroken archive of Formula 1 World Champions (1950–Present)
 */
export const ALL_TIME_CHAMPIONS = [
  { year: 2026, driver: 'Max Verstappen', code: 'VER', team: 'Red Bull Racing', wins: 8, points: 412 },
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
  { driver_id: 'hamilton', driver_code: 'HAM', driver_name: 'Lewis Hamilton', nationality: 'British', flag: '🇬🇧', championships: 7, race_entries: 360, race_wins: 105, podiums: 202, pole_positions: 104, fastest_laps: 67, win_percentage: 29.2 },
  { driver_id: 'michael_schumacher', driver_code: 'MSC', driver_name: 'Michael Schumacher', nationality: 'German', flag: '🇩🇪', championships: 7, race_entries: 308, race_wins: 91, podiums: 155, pole_positions: 68, fastest_laps: 77, win_percentage: 29.5 },
  { driver_id: 'max_verstappen', driver_code: 'VER', driver_name: 'Max Verstappen', nationality: 'Dutch', flag: '🇳🇱', championships: 4, race_entries: 215, race_wins: 65, podiums: 115, pole_positions: 42, fastest_laps: 35, win_percentage: 30.2 },
  { driver_id: 'fangio', driver_code: 'FAN', driver_name: 'Juan Manuel Fangio', nationality: 'Argentine', flag: '🇦🇷', championships: 5, race_entries: 52, race_wins: 24, podiums: 35, pole_positions: 29, fastest_laps: 23, win_percentage: 46.2 },
  { driver_id: 'vettel', driver_code: 'VET', driver_name: 'Sebastian Vettel', nationality: 'German', flag: '🇩🇪', championships: 4, race_entries: 299, race_wins: 53, podiums: 122, pole_positions: 57, fastest_laps: 38, win_percentage: 17.7 },
  { driver_id: 'prost', driver_code: 'PRO', driver_name: 'Alain Prost', nationality: 'French', flag: '🇫🇷', championships: 4, race_entries: 202, race_wins: 51, podiums: 106, pole_positions: 33, fastest_laps: 41, win_percentage: 25.2 },
  { driver_id: 'senna', driver_code: 'SEN', driver_name: 'Ayrton Senna', nationality: 'Brazilian', flag: '🇧🇷', championships: 3, race_entries: 162, race_wins: 41, podiums: 80, pole_positions: 65, fastest_laps: 19, win_percentage: 25.3 },
  { driver_id: 'lauda', driver_code: 'LAU', driver_name: 'Niki Lauda', nationality: 'Austrian', flag: '🇦🇹', championships: 3, race_entries: 177, race_wins: 25, podiums: 54, pole_positions: 24, fastest_laps: 24, win_percentage: 14.1 },
  { driver_id: 'stewart', driver_code: 'STE', driver_name: 'Jackie Stewart', nationality: 'British', flag: '🇬🇧', championships: 3, race_entries: 100, race_wins: 27, podiums: 43, pole_positions: 17, fastest_laps: 15, win_percentage: 27.0 },
  { driver_id: 'clark', driver_code: 'CLA', driver_name: 'Jim Clark', nationality: 'British', flag: '🇬🇧', championships: 2, race_entries: 73, race_wins: 25, podiums: 32, pole_positions: 33, fastest_laps: 28, win_percentage: 34.2 },
  { driver_id: 'ascari', driver_code: 'ASC', driver_name: 'Alberto Ascari', nationality: 'Italian', flag: '🇮🇹', championships: 2, race_entries: 33, race_wins: 13, podiums: 17, pole_positions: 14, fastest_laps: 12, win_percentage: 39.4 },
  { driver_id: 'alonso', driver_code: 'ALO', driver_name: 'Fernando Alonso', nationality: 'Spanish', flag: '🇪🇸', championships: 2, race_entries: 405, race_wins: 32, podiums: 106, pole_positions: 22, fastest_laps: 26, win_percentage: 7.9 },
  { driver_id: 'mansell', driver_code: 'MAN', driver_name: 'Nigel Mansell', nationality: 'British', flag: '🇬🇧', championships: 1, race_entries: 191, race_wins: 31, podiums: 59, pole_positions: 32, fastest_laps: 30, win_percentage: 16.2 },
  { driver_id: 'hakkinen', driver_code: 'HAK', driver_name: 'Mika Häkkinen', nationality: 'Finnish', flag: '🇫🇮', championships: 2, race_entries: 161, race_wins: 20, podiums: 51, pole_positions: 26, fastest_laps: 25, win_percentage: 12.4 },
  { driver_id: 'norris', driver_code: 'NOR', driver_name: 'Lando Norris', nationality: 'British', flag: '🇬🇧', championships: 1, race_entries: 135, race_wins: 11, podiums: 35, pole_positions: 12, fastest_laps: 14, win_percentage: 8.1 },
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

export default function StatsPage({ theme = 'dark' }) {
  const [activeTab, setActiveTab] = useState('year_explorer'); // 'year_explorer' | 'champions' | 'drivers' | 'constructors'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDecade, setSelectedDecade] = useState('ALL');

  // Year-by-Year Standings Explorer State
  const [selectedYear, setSelectedYear] = useState('2024');
  const [yearStandingsLoading, setYearStandingsLoading] = useState(false);
  const [yearDriverStandings, setYearDriverStandings] = useState([]);
  const [yearConstructorStandings, setYearConstructorStandings] = useState([]);

  // Driver Dossier Modal
  const [selectedDriver, setSelectedDriver] = useState(null);

  // Head-to-Head Compare Modal
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [driver1Code, setDriver1Code] = useState('HAM');
  const [driver2Code, setDriver2Code] = useState('VER');

  const isLight = theme === 'light';

  // Load standings whenever selectedYear changes in Year-by-Year Explorer
  useEffect(() => {
    let isMounted = true;
    async function loadYearStandings() {
      setYearStandingsLoading(true);
      try {
        const [driversRes, constructorsRes] = await Promise.allSettled([
          apiClient.get(`/standings/drivers/${selectedYear}`),
          apiClient.get(`/standings/constructors/${selectedYear}`),
        ]);

        if (!isMounted) return;

        if (driversRes.status === 'fulfilled' && driversRes.value?.standings) {
          setYearDriverStandings(driversRes.value.standings);
        } else {
          setYearDriverStandings([]);
        }

        if (constructorsRes.status === 'fulfilled' && constructorsRes.value?.standings) {
          setYearConstructorStandings(constructorsRes.value.standings);
        } else {
          setYearConstructorStandings([]);
        }
      } catch (err) {
        if (isMounted) {
          setYearDriverStandings([]);
          setYearConstructorStandings([]);
        }
      } finally {
        if (isMounted) setYearStandingsLoading(false);
      }
    }

    loadYearStandings();
    return () => {
      isMounted = false;
    };
  }, [selectedYear]);

  // Find champion of selected year
  const yearChamp = useMemo(() => {
    return ALL_TIME_CHAMPIONS.find((c) => String(c.year) === String(selectedYear));
  }, [selectedYear]);

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

  const handleDriverClick = (driverCodeOrName) => {
    const profile = getDriverProfile(driverCodeOrName);
    setSelectedDriver(profile);
  };

  const d1 = ALL_TIME_DRIVERS.find((d) => d.driver_code === driver1Code) || ALL_TIME_DRIVERS[0];
  const d2 = ALL_TIME_DRIVERS.find((d) => d.driver_code === driver2Code) || ALL_TIME_DRIVERS[2];

  // Milestone years for quick jump
  const MILESTONE_YEARS = [
    { year: '2026', label: '2026 Season' },
    { year: '2024', label: '2024 Verstappen' },
    { year: '2021', label: '2021 Title Decider' },
    { year: '2008', label: '2008 Hamilton' },
    { year: '2004', label: '2004 Schumacher Ferrari' },
    { year: '1998', label: '1998 Häkkinen' },
    { year: '1988', label: '1988 Senna vs Prost' },
    { year: '1976', label: '1976 Hunt vs Lauda' },
    { year: '1965', label: '1965 Jim Clark' },
    { year: '1957', label: '1957 Fangio Maserati' },
    { year: '1953', label: '1953 Alberto Ascari' },
    { year: '1950', label: '1950 Giuseppe Farina' },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar */}
      <div className={`border rounded-2xl p-5 shadow-sm space-y-4 transition-colors ${
        isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#12161F] border-[#2A3245] shadow-xl'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#E10600]/15 text-[#E10600] border border-[#E10600]/30 uppercase tracking-wider">
                Historical Archive (1950–Present)
              </span>
              <span className={`text-xs font-mono ${isLight ? 'text-slate-500' : 'text-[#64748B]'}`}>
                Every Season & Legend in Formula 1 History
              </span>
            </div>
            <h2 className={`text-xl lg:text-2xl font-black italic tracking-tight uppercase ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}>
              Championship Standings & Hall of Fame
            </h2>
          </div>

          {/* Action Button: Head-to-Head Compare */}
          <button
            onClick={() => setCompareModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#E10600] hover:bg-red-700 text-white rounded-lg font-mono text-xs font-bold transition-all shadow-md shadow-red-950/30 shrink-0"
          >
            <Users className="w-4 h-4" />
            <span>Driver Career H2H Matrix</span>
          </button>
        </div>

        {/* Tab Switcher */}
        <div className={`flex flex-wrap items-center justify-between gap-3 pt-3 border-t ${
          isLight ? 'border-slate-200' : 'border-[#2A3245]'
        }`}>
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'year_explorer', label: 'Year-by-Year Standings Explorer', icon: Calendar },
              { id: 'champions', label: 'World Champions (1950–Present)', icon: Trophy },
              { id: 'drivers', label: 'Driver Career Records', icon: Award },
              { id: 'constructors', label: 'Constructors Records', icon: Shield },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                    isActive
                      ? 'bg-[#E10600] text-white shadow-sm'
                      : isLight
                        ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        : 'text-[#94A3B8] hover:text-white hover:bg-[#151922]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Box (Active on non-explorer tabs) */}
          {activeTab !== 'year_explorer' && (
            <div className="relative w-full sm:w-64">
              <Search className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${
                isLight ? 'text-slate-400' : 'text-[#64748B]'
              }`} />
              <input
                type="text"
                placeholder="Search driver, team, year..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full rounded-lg pl-9 pr-3 py-1.5 text-xs font-mono border focus:outline-none focus:border-[#E10600] ${
                  isLight
                    ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                    : 'bg-[#1C2230] border-[#2A3245] text-white placeholder-[#64748B]'
                }`}
              />
            </div>
          )}
        </div>
      </div>

      {/* ==================== TAB: YEAR-BY-YEAR STANDINGS EXPLORER (1950-2026) ==================== */}
      {activeTab === 'year_explorer' && (
        <div className="space-y-6">
          {/* Year Selector Control Panel */}
          <div className={`border rounded-xl p-5 space-y-4 ${
            isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#12161F] border-[#2A3245] shadow-xl'
          }`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-[#E10600]" />
                <div>
                  <h3 className={`font-bold text-sm uppercase tracking-wider ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    Select Formula 1 Championship Season
                  </h3>
                  <p className={`text-xs font-mono ${isLight ? 'text-slate-500' : 'text-[#64748B]'}`}>
                    Full championship driver & constructor standings from the 1950 British GP to 2026
                  </p>
                </div>
              </div>

              {/* Year Dropdown & Slider */}
              <div className="flex items-center gap-3">
                <span className={`text-xs font-mono ${isLight ? 'text-slate-500' : 'text-[#64748B]'}`}>Season:</span>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className={`px-3 py-1.5 rounded-lg border font-mono font-bold text-sm focus:outline-none focus:border-[#E10600] ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900'
                      : 'bg-[#1C2230] border-[#2A3245] text-white'
                  }`}
                >
                  {Array.from({ length: 2026 - 1950 + 1 }, (_, i) => 2026 - i).map((y) => (
                    <option key={y} value={String(y)}>
                      {y} Championship Season
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Era Milestone Chips (Horizontally swipeable on mobile) */}
            <div className={`pt-3 border-t flex items-center gap-1.5 text-xs font-mono overflow-x-auto no-scrollbar py-1 ${
              isLight ? 'border-slate-100' : 'border-[#2A3245]/60'
            }`}>
              <span className={`mr-1 shrink-0 ${isLight ? 'text-slate-500' : 'text-[#64748B]'}`}>Milestones:</span>
              {MILESTONE_YEARS.map((m) => (
                <button
                  key={m.year}
                  onClick={() => setSelectedYear(m.year)}
                  className={`px-2.5 py-1 rounded-md text-[11px] transition-all font-semibold shrink-0 ${
                    selectedYear === m.year
                      ? 'bg-[#E10600] text-white shadow-sm'
                      : isLight
                        ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        : 'bg-[#1C2230] text-[#94A3B8] hover:text-white border border-[#2A3245]'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Year Champion Banner (Hero Preview) */}
          {yearChamp && (
            <div
              onClick={() => handleDriverClick(yearChamp.code || yearChamp.driver)}
              className={`p-6 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden group cursor-pointer transition-all ${
                isLight
                  ? 'bg-gradient-to-r from-amber-50/70 via-white to-amber-50/40 border-amber-300 shadow-sm hover:shadow-md'
                  : 'bg-gradient-to-r from-[#1A1E29] to-[#12161F] border-amber-500/40 shadow-xl shadow-amber-950/20 hover:border-amber-400'
              }`}
            >
              <div className="flex items-center gap-5">
                <DriverAvatar code={yearChamp.code} name={yearChamp.driver} size="xl" showNumber />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/40 uppercase">
                      {selectedYear} World Champion
                    </span>
                    <Trophy className="w-4 h-4 text-amber-500" />
                  </div>
                  <h3 className={`text-2xl font-black italic tracking-tight group-hover:text-amber-500 transition-colors ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}>
                    {yearChamp.driver}
                  </h3>
                  <p className={`text-xs font-mono ${isLight ? 'text-slate-600' : 'text-[#94A3B8]'}`}>
                    {yearChamp.team} • {yearChamp.wins} Wins • {yearChamp.points} Points
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#E10600] group-hover:translate-x-1 transition-transform">
                <span>View Full Career Dossier</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          )}

          {/* Season Tables: Drivers & Constructors */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Drivers Standings for selectedYear */}
            <div className={`border rounded-xl p-5 space-y-3 ${
              isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#12161F] border-[#2A3245] shadow-xl'
            }`}>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-[#2A3245]">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <h4 className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {selectedYear} Driver Standings
                  </h4>
                </div>
                <span className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-[#64748B]'}`}>
                  Click row to view portrait & bio
                </span>
              </div>

              {yearStandingsLoading ? (
                <div className="py-12 text-center font-mono text-xs text-[#64748B]">
                  Loading official {selectedYear} standings...
                </div>
              ) : yearDriverStandings.length > 0 ? (
                <div className="overflow-x-auto max-h-[460px] overflow-y-auto">
                  <table className="w-full text-left font-mono text-xs">
                    <thead className={`text-[10px] uppercase border-b sticky top-0 ${
                      isLight ? 'bg-slate-50 text-slate-500 border-slate-200' : 'bg-[#151922] text-[#94A3B8] border-[#2A3245]'
                    }`}>
                      <tr>
                        <th className="py-2 px-2.5">Pos</th>
                        <th className="py-2 px-2.5">Driver</th>
                        <th className="py-2 px-2.5 hidden sm:table-cell">Team</th>
                        <th className="py-2 px-2.5 text-center">Wins</th>
                        <th className="py-2 px-2.5 text-right">Points</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isLight ? 'divide-slate-100' : 'divide-[#2A3245]/50'}`}>
                      {yearDriverStandings.map((item, idx) => (
                        <tr
                          key={item.driver_id || idx}
                          onClick={() => handleDriverClick(item.driver_code || `${item.given_name} ${item.family_name}`)}
                          className={`cursor-pointer transition-colors ${
                            isLight ? 'hover:bg-slate-50' : 'hover:bg-[#1C2230]/70'
                          }`}
                        >
                          <td className="py-2 px-2.5 font-bold">
                            <span className={`w-5 h-5 inline-flex items-center justify-center rounded text-[11px] ${
                              item.position === 1
                                ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 font-black'
                                : isLight ? 'text-slate-600' : 'text-[#64748B]'
                            }`}>
                              {item.position}
                            </span>
                          </td>
                          <td className="py-2 px-2.5">
                            <span className={`font-bold block ${isLight ? 'text-slate-900' : 'text-white'}`}>
                              {item.given_name} {item.family_name}
                            </span>
                            <span className={`text-[10px] sm:hidden ${isLight ? 'text-slate-500' : 'text-[#64748B]'}`}>
                              {item.constructor_name}
                            </span>
                          </td>
                          <td className={`py-2 px-2.5 hidden sm:table-cell truncate max-w-[130px] ${
                            isLight ? 'text-slate-600' : 'text-[#94A3B8]'
                          }`}>
                            {item.constructor_name}
                          </td>
                          <td className={`py-2 px-2.5 text-center font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                            {item.wins}
                          </td>
                          <td className={`py-2 px-2.5 text-right font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                            {item.points}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-8 text-center text-xs font-mono text-[#64748B]">
                  No driver standings recorded for {selectedYear}
                </div>
              )}
            </div>

            {/* Constructors Standings for selectedYear */}
            <div className={`border rounded-xl p-5 space-y-3 ${
              isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#12161F] border-[#2A3245] shadow-xl'
            }`}>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-[#2A3245]">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#00F0FF]" />
                  <h4 className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {selectedYear} Constructor Standings
                  </h4>
                </div>
                <span className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-[#64748B]'}`}>
                  {yearConstructorStandings.length} Teams
                </span>
              </div>

              {yearStandingsLoading ? (
                <div className="py-12 text-center font-mono text-xs text-[#64748B]">
                  Loading official {selectedYear} constructors...
                </div>
              ) : yearConstructorStandings.length > 0 ? (
                <div className="overflow-x-auto max-h-[460px] overflow-y-auto">
                  <table className="w-full text-left font-mono text-xs">
                    <thead className={`text-[10px] uppercase border-b sticky top-0 ${
                      isLight ? 'bg-slate-50 text-slate-500 border-slate-200' : 'bg-[#151922] text-[#94A3B8] border-[#2A3245]'
                    }`}>
                      <tr>
                        <th className="py-2 px-2.5">Pos</th>
                        <th className="py-2 px-2.5">Constructor</th>
                        <th className="py-2 px-2.5 text-center">Wins</th>
                        <th className="py-2 px-2.5 text-right">Points</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isLight ? 'divide-slate-100' : 'divide-[#2A3245]/50'}`}>
                      {yearConstructorStandings.map((c, idx) => (
                        <tr
                          key={c.constructor_id || idx}
                          className={`transition-colors ${isLight ? 'hover:bg-slate-50' : 'hover:bg-[#1C2230]/70'}`}
                        >
                          <td className="py-2.5 px-2.5 font-bold">
                            <span className={`w-5 h-5 inline-flex items-center justify-center rounded text-[11px] ${
                              c.position === 1
                                ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 font-black'
                                : isLight ? 'text-slate-600' : 'text-[#64748B]'
                            }`}>
                              {c.position}
                            </span>
                          </td>
                          <td className={`py-2.5 px-2.5 font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                            {c.constructor_name}
                          </td>
                          <td className={`py-2.5 px-2.5 text-center font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                            {c.wins}
                          </td>
                          <td className={`py-2.5 px-2.5 text-right font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                            {c.points}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-8 text-center text-xs font-mono text-[#64748B]">
                  {Number(selectedYear) < 1958
                    ? 'Constructor Championship was inaugurated in 1958'
                    : `No constructor standings recorded for ${selectedYear}`}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB: WORLD CHAMPIONS (1950–PRESENT) ==================== */}
      {activeTab === 'champions' && (
        <div className="space-y-4">
          {/* Decade Filters */}
          <div className={`p-3 rounded-xl border flex flex-wrap items-center gap-1.5 text-xs font-mono ${
            isLight ? 'bg-white border-slate-200' : 'bg-[#12161F] border-[#2A3245]'
          }`}>
            <span className={`mr-2 ${isLight ? 'text-slate-500' : 'text-[#64748B]'}`}>Filter Decade:</span>
            {['ALL', '2020s', '2010s', '2000s', '90s', '80s', '70s', '60s', '50s'].map((dec) => (
              <button
                key={dec}
                onClick={() => setSelectedDecade(dec)}
                className={`px-2.5 py-1 rounded text-[11px] transition-all font-semibold ${
                  selectedDecade === dec
                    ? 'bg-[#E10600] text-white shadow-sm'
                    : isLight
                      ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      : 'bg-[#1C2230] text-[#94A3B8] hover:text-white border border-[#2A3245]'
                }`}
              >
                {dec}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-3">
            {filteredChampions.map((champ) => (
              <div
                key={champ.year}
                onClick={() => handleDriverClick(champ.code || champ.driver)}
                className={`border rounded-xl p-3 sm:p-4 transition-all shadow-sm group flex flex-col justify-between cursor-pointer ${
                  isLight
                    ? 'bg-white border-slate-200 hover:border-[#E10600] hover:shadow-md'
                    : 'bg-[#12161F] border-[#2A3245] hover:border-[#E10600]/60 shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <span className={`text-xs sm:text-base font-racing px-1.5 sm:px-2 py-0.5 rounded border ${
                      isLight ? 'bg-slate-100 border-slate-200 text-slate-900' : 'bg-[#1C2230] border-[#2A3245] text-white'
                    }`}>
                      {champ.year}
                    </span>
                    <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 group-hover:scale-110 transition-transform" />
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <DriverAvatar code={champ.code} name={champ.driver} size="sm" />
                    <div className="min-w-0">
                      <h4 className={`font-racing uppercase text-xs sm:text-sm truncate leading-snug group-hover:text-[#E10600] transition-colors ${
                        isLight ? 'text-slate-900' : 'text-white'
                      }`}>
                        {champ.driver}
                      </h4>
                      <p className={`text-[10px] sm:text-[11px] font-mono truncate ${isLight ? 'text-slate-500' : 'text-[#94A3B8]'}`}>
                        {champ.team}
                      </p>
                    </div>
                  </div>
                </div>

                <div className={`pt-2 border-t flex items-center justify-between text-[10px] sm:text-xs font-mono ${
                  isLight ? 'border-slate-100 text-slate-600' : 'border-[#2A3245]/60 text-[#64748B]'
                }`}>
                  <span className={`${isLight ? 'text-sky-600' : 'text-[#00F0FF]'} font-bold`}>{champ.wins} Wins</span>
                  <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{champ.points} PTS</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================== TAB: DRIVER LEGENDS & CAREER RECORDS ==================== */}
      {activeTab === 'drivers' && (
        <div className={`border rounded-xl overflow-hidden shadow-sm ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#12161F] border-[#2A3245]'
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className={`border-b uppercase text-[10px] ${
                isLight ? 'bg-slate-50 text-slate-500 border-slate-200' : 'bg-[#151922] text-[#94A3B8] border-[#2A3245]'
              }`}>
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
              <tbody className={`divide-y ${isLight ? 'divide-slate-100' : 'divide-[#2A3245]/60'}`}>
                {filteredDrivers.map((d, idx) => (
                  <tr
                    key={d.driver_id}
                    onClick={() => handleDriverClick(d.driver_code || d.driver_name)}
                    className={`cursor-pointer transition-colors ${
                      isLight ? 'hover:bg-slate-50' : 'hover:bg-[#1C2230]/70'
                    }`}
                  >
                    <td className="py-3 px-4 font-bold text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <DriverAvatar code={d.driver_code} name={d.driver_name} size="sm" />
                        <div>
                          <span className={`font-bold text-sm block group-hover:text-[#E10600] ${
                            isLight ? 'text-slate-900' : 'text-white'
                          }`}>
                            {d.driver_name}
                          </span>
                          <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-[#64748B]'}`}>
                            {d.flag} {d.nationality}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/30">
                        {d.championships}x
                      </span>
                    </td>
                    <td className={`py-3 px-4 text-center font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{d.race_wins}</td>
                    <td className={`py-3 px-4 text-center ${isLight ? 'text-slate-600' : 'text-[#94A3B8]'}`}>{d.podiums}</td>
                    <td className={`py-3 px-4 text-center ${isLight ? 'text-slate-600' : 'text-[#94A3B8]'}`}>{d.pole_positions}</td>
                    <td className={`py-3 px-4 text-center ${isLight ? 'text-slate-600' : 'text-[#94A3B8]'}`}>{d.fastest_laps}</td>
                    <td className="py-3 px-4 text-center text-slate-400">{d.race_entries}</td>
                    <td className={`py-3 px-4 text-right font-bold ${isLight ? 'text-sky-600' : 'text-[#00F0FF]'}`}>
                      {d.win_percentage.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================== TAB: CONSTRUCTOR RECORDS ==================== */}
      {activeTab === 'constructors' && (
        <div className={`border rounded-xl overflow-hidden shadow-sm ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#12161F] border-[#2A3245]'
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className={`border-b uppercase text-[10px] ${
                isLight ? 'bg-slate-50 text-slate-500 border-slate-200' : 'bg-[#151922] text-[#94A3B8] border-[#2A3245]'
              }`}>
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
              <tbody className={`divide-y ${isLight ? 'divide-slate-100' : 'divide-[#2A3245]/60'}`}>
                {ALL_TIME_CONSTRUCTORS.map((c, idx) => (
                  <tr
                    key={c.constructor_id}
                    className={`transition-colors ${isLight ? 'hover:bg-slate-50' : 'hover:bg-[#1C2230]/70'}`}
                  >
                    <td className="py-3 px-4 text-slate-400 font-bold">{idx + 1}</td>
                    <td className={`py-3 px-4 font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      <div className="flex items-center gap-2">
                        <span>{c.flag}</span>
                        <span>{c.constructor_name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/30">
                        {c.championships}x WCC
                      </span>
                    </td>
                    <td className={`py-3 px-4 text-center font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{c.race_wins}</td>
                    <td className={`py-3 px-4 text-center ${isLight ? 'text-slate-600' : 'text-[#94A3B8]'}`}>{c.podiums}</td>
                    <td className={`py-3 px-4 text-center ${isLight ? 'text-slate-600' : 'text-[#94A3B8]'}`}>{c.pole_positions}</td>
                    <td className="py-3 px-4 text-center text-slate-400">{c.race_entries}</td>
                    <td className={`py-3 px-4 text-right font-bold ${isLight ? 'text-sky-600' : 'text-[#00F0FF]'}`}>
                      {c.win_percentage.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================== INTERACTIVE DRIVER DOSSIER MODAL ==================== */}
      {selectedDriver && (
        <Modal
          isOpen={Boolean(selectedDriver)}
          onClose={() => setSelectedDriver(null)}
          title={`${selectedDriver.name} Dossier`}
          subtitle={`Formula 1 Driver Archive • #${selectedDriver.number || 'Legend'}`}
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
                  #{selectedDriver.number || '★'}
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

            {/* Close */}
            <div className={`pt-4 border-t flex justify-end ${isLight ? 'border-slate-200' : 'border-[#2A3245]'}`}>
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

      {/* ==================== HEAD-TO-HEAD COMPARE MODAL ==================== */}
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
            <div className={`p-3 rounded-xl border flex items-center gap-3 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#151922] border-[#2A3245]'
            }`}>
              <DriverAvatar code={driver1Code} size="md" />
              <div className="flex-1 min-w-0">
                <label className={`block text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-[#64748B]'}`}>DRIVER 1</label>
                <select
                  value={driver1Code}
                  onChange={(e) => setDriver1Code(e.target.value)}
                  className={`w-full border text-xs font-mono font-bold rounded p-1.5 focus:outline-none focus:border-[#E10600] ${
                    isLight
                      ? 'bg-white border-slate-300 text-slate-900'
                      : 'bg-[#1C2230] border-[#2A3245] text-white'
                  }`}
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
            <div className={`p-3 rounded-xl border flex items-center gap-3 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#151922] border-[#2A3245]'
            }`}>
              <DriverAvatar code={driver2Code} size="md" />
              <div className="flex-1 min-w-0">
                <label className={`block text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-[#64748B]'}`}>DRIVER 2</label>
                <select
                  value={driver2Code}
                  onChange={(e) => setDriver2Code(e.target.value)}
                  className={`w-full border text-xs font-mono font-bold rounded p-1.5 focus:outline-none focus:border-[#E10600] ${
                    isLight
                      ? 'bg-white border-slate-300 text-slate-900'
                      : 'bg-[#1C2230] border-[#2A3245] text-white'
                  }`}
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
                  className={`p-3 rounded-xl border flex items-center justify-between ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#1C2230] border-[#2A3245]'
                  }`}
                >
                  <span className={`w-20 font-bold text-sm tabular-nums ${
                    d1Wins ? 'text-amber-500 font-black' : isLight ? 'text-slate-800' : 'text-white'
                  }`}>
                    {row.v1}
                  </span>
                  <span className={`text-center font-bold uppercase text-[11px] ${
                    isLight ? 'text-slate-600' : 'text-[#94A3B8]'
                  }`}>
                    {row.label}
                  </span>
                  <span className={`w-20 text-right font-bold text-sm tabular-nums ${
                    d2Wins ? 'text-amber-500 font-black' : isLight ? 'text-slate-800' : 'text-white'
                  }`}>
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
