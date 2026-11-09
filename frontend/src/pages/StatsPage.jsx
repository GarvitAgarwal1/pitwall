import React, { useState, useEffect, useMemo } from 'react';
import apiClient from '../api/client';
import {
  Trophy,
  Search,
  ArrowUpDown,
  Filter,
  Users,
  Shield,
  X,
  Award,
  Sparkles,
} from 'lucide-react';

// Historical Champions Dataset (Sample representative of 1950-2024 archive)
const HISTORICAL_CHAMPIONS = [
  { year: 2023, driver: 'Max Verstappen', team: 'Red Bull Racing', wins: 19, points: 575 },
  { year: 2022, driver: 'Max Verstappen', team: 'Red Bull Racing', wins: 15, points: 454 },
  { year: 2021, driver: 'Max Verstappen', team: 'Red Bull Racing', wins: 10, points: 395.5 },
  { year: 2020, driver: 'Lewis Hamilton', team: 'Mercedes', wins: 11, points: 347 },
  { year: 2019, driver: 'Lewis Hamilton', team: 'Mercedes', wins: 11, points: 413 },
  { year: 2018, driver: 'Lewis Hamilton', team: 'Mercedes', wins: 11, points: 408 },
  { year: 2017, driver: 'Lewis Hamilton', team: 'Mercedes', wins: 9, points: 363 },
  { year: 2016, driver: 'Nico Rosberg', team: 'Mercedes', wins: 9, points: 385 },
  { year: 2015, driver: 'Lewis Hamilton', team: 'Mercedes', wins: 10, points: 381 },
  { year: 2014, driver: 'Lewis Hamilton', team: 'Mercedes', wins: 11, points: 384 },
  { year: 2013, driver: 'Sebastian Vettel', team: 'Red Bull Racing', wins: 13, points: 397 },
  { year: 2012, driver: 'Sebastian Vettel', team: 'Red Bull Racing', wins: 5, points: 281 },
  { year: 2011, driver: 'Sebastian Vettel', team: 'Red Bull Racing', wins: 11, points: 392 },
  { year: 2010, driver: 'Sebastian Vettel', team: 'Red Bull Racing', wins: 5, points: 256 },
  { year: 2009, driver: 'Jenson Button', team: 'Brawn GP', wins: 6, points: 95 },
  { year: 2008, driver: 'Lewis Hamilton', team: 'McLaren', wins: 5, points: 98 },
  { year: 2007, driver: 'Kimi Räikkönen', team: 'Ferrari', wins: 6, points: 110 },
  { year: 2006, driver: 'Fernando Alonso', team: 'Renault', wins: 7, points: 134 },
  { year: 2005, driver: 'Fernando Alonso', team: 'Renault', wins: 7, points: 133 },
  { year: 2004, driver: 'Michael Schumacher', team: 'Ferrari', wins: 13, points: 148 },
  { year: 1994, driver: 'Michael Schumacher', team: 'Benetton', wins: 8, points: 92 },
  { year: 1993, driver: 'Alain Prost', team: 'Williams', wins: 7, points: 99 },
  { year: 1991, driver: 'Ayrton Senna', team: 'McLaren', wins: 7, points: 96 },
  { year: 1988, driver: 'Ayrton Senna', team: 'McLaren', wins: 8, points: 90 },
];

// Baseline all-time driver statistics (1950-present)
const FALLBACK_ALL_TIME_DRIVERS = [
  { driver_id: 'hamilton', driver_name: 'Lewis Hamilton', nationality: 'British', active_years: '2007–2024', world_championships: 7, race_entries: 353, race_wins: 105, podiums: 201, pole_positions: 104, fastest_laps: 67, dnf_count: 32, dns_count: 0, win_percentage: 29.7 },
  { driver_id: 'michael_schumacher', driver_name: 'Michael Schumacher', nationality: 'German', active_years: '1991–2012', world_championships: 7, race_entries: 308, race_wins: 91, podiums: 155, pole_positions: 68, fastest_laps: 77, dnf_count: 68, dns_count: 2, win_percentage: 29.5 },
  { driver_id: 'max_verstappen', driver_name: 'Max Verstappen', nationality: 'Dutch', active_years: '2015–2024', world_championships: 3, race_entries: 206, race_wins: 62, podiums: 111, pole_positions: 40, fastest_laps: 33, dnf_count: 32, dns_count: 1, win_percentage: 30.1 },
  { driver_id: 'vettel', driver_name: 'Sebastian Vettel', nationality: 'German', active_years: '2007–2022', world_championships: 4, race_entries: 299, race_wins: 53, podiums: 122, pole_positions: 57, fastest_laps: 38, dnf_count: 44, dns_count: 1, win_percentage: 17.7 },
  { driver_id: 'prost', driver_name: 'Alain Prost', nationality: 'French', active_years: '1980–1993', world_championships: 4, race_entries: 202, race_wins: 51, podiums: 106, pole_positions: 33, fastest_laps: 41, dnf_count: 57, dns_count: 2, win_percentage: 25.2 },
  { driver_id: 'senna', driver_name: 'Ayrton Senna', nationality: 'Brazilian', active_years: '1984–1994', world_championships: 3, race_entries: 162, race_wins: 41, podiums: 80, pole_positions: 65, fastest_laps: 19, dnf_count: 56, dns_count: 1, win_percentage: 25.3 },
  { driver_id: 'alonso', driver_name: 'Fernando Alonso', nationality: 'Spanish', active_years: '2001–2024', world_championships: 2, race_entries: 398, race_wins: 32, podiums: 106, pole_positions: 22, fastest_laps: 26, dnf_count: 78, dns_count: 3, win_percentage: 8.0 },
  { driver_id: 'mansell', driver_name: 'Nigel Mansell', nationality: 'British', active_years: '1980–1995', world_championships: 1, race_entries: 191, race_wins: 31, podiums: 59, pole_positions: 32, fastest_laps: 30, dnf_count: 86, dns_count: 4, win_percentage: 16.2 },
  { driver_id: 'stewart', driver_name: 'Jackie Stewart', nationality: 'British', active_years: '1965–1973', world_championships: 3, race_entries: 100, race_wins: 27, podiums: 43, pole_positions: 17, fastest_laps: 15, dnf_count: 34, dns_count: 1, win_percentage: 27.0 },
  { driver_id: 'clark', driver_name: 'Jim Clark', nationality: 'British', active_years: '1960–1968', world_championships: 2, race_entries: 73, race_wins: 25, podiums: 32, pole_positions: 33, fastest_laps: 28, dnf_count: 27, dns_count: 1, win_percentage: 34.2 },
  { driver_id: 'lauda', driver_name: 'Niki Lauda', nationality: 'Austrian', active_years: '1971–1985', world_championships: 3, race_entries: 177, race_wins: 25, podiums: 54, pole_positions: 24, fastest_laps: 24, dnf_count: 81, dns_count: 1, win_percentage: 14.1 },
  { driver_id: 'fangio', driver_name: 'Juan Manuel Fangio', nationality: 'Argentine', active_years: '1950–1958', world_championships: 5, race_entries: 52, race_wins: 24, podiums: 35, pole_positions: 29, fastest_laps: 23, dnf_count: 13, dns_count: 1, win_percentage: 46.2 },
];

// Baseline all-time constructor statistics
const FALLBACK_ALL_TIME_CONSTRUCTORS = [
  { constructor_id: 'ferrari', constructor_name: 'Ferrari', nationality: 'Italian', active_years: '1950–2024', championships: 16, race_entries: 1098, race_wins: 248, podiums: 825, pole_positions: 253, dnf_count: 512, dns_count: 12, win_percentage: 22.6 },
  { constructor_id: 'mclaren', constructor_name: 'McLaren', nationality: 'British', active_years: '1966–2024', championships: 8, race_entries: 968, race_wins: 188, podiums: 522, pole_positions: 163, dnf_count: 420, dns_count: 18, win_percentage: 19.4 },
  { constructor_id: 'mercedes', constructor_name: 'Mercedes', nationality: 'German', active_years: '1954–2024', championships: 8, race_entries: 315, race_wins: 128, podiums: 298, pole_positions: 139, dnf_count: 62, dns_count: 1, win_percentage: 40.6 },
  { constructor_id: 'williams', constructor_name: 'Williams', nationality: 'British', active_years: '1977–2024', championships: 9, race_entries: 824, race_wins: 114, podiums: 313, pole_positions: 128, dnf_count: 410, dns_count: 15, win_percentage: 13.8 },
  { constructor_id: 'red_bull', constructor_name: 'Red Bull Racing', nationality: 'Austrian', active_years: '2005–2024', championships: 6, race_entries: 391, race_wins: 120, podiums: 281, pole_positions: 103, dnf_count: 110, dns_count: 2, win_percentage: 30.7 },
  { constructor_id: 'team_lotus', constructor_name: 'Team Lotus', nationality: 'British', active_years: '1958–1994', championships: 7, race_entries: 491, race_wins: 79, podiums: 172, pole_positions: 107, dnf_count: 280, dns_count: 14, win_percentage: 16.1 },
];

export default function StatsPage() {
  const [activeTab, setActiveTab] = useState('drivers'); // 'drivers' | 'constructors' | 'champions'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDecade, setSelectedDecade] = useState('ALL');
  const [sortField, setSortField] = useState('race_wins');
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' | 'desc'

  // Head to Head Modal State
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [compareDriver1Id, setCompareDriver1Id] = useState('hamilton');
  const [compareDriver2Id, setCompareDriver2Id] = useState('max_verstappen');

  const [driversList, setDriversList] = useState(FALLBACK_ALL_TIME_DRIVERS);
  const [constructorsList, setConstructorsList] = useState(FALLBACK_ALL_TIME_CONSTRUCTORS);

  // Fetch from backend
  useEffect(() => {
    let isMounted = true;
    async function loadStats() {
      try {
        const [dRes, cRes] = await Promise.allSettled([
          apiClient.get('/stats/drivers?limit=100'),
          apiClient.get('/stats/constructors?limit=50'),
        ]);
        if (!isMounted) return;
        if (dRes.status === 'fulfilled' && dRes.value?.drivers?.length > 0) {
          setDriversList(dRes.value.drivers);
        }
        if (cRes.status === 'fulfilled' && cRes.value?.constructors?.length > 0) {
          setConstructorsList(cRes.value.constructors);
        }
      } catch (err) {
        // Fallback intact
      }
    }
    loadStats();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter & sort drivers
  const filteredDrivers = useMemo(() => {
    return driversList
      .filter((d) => {
        const matchesSearch =
          d.driver_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.nationality.toLowerCase().includes(searchQuery.toLowerCase());
        if (!matchesSearch) return false;

        if (selectedDecade === 'ALL') return true;
        return d.active_years.includes(selectedDecade.substring(0, 3));
      })
      .sort((a, b) => {
        const aVal = a[sortField] || 0;
        const bVal = b[sortField] || 0;
        return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
      });
  }, [driversList, searchQuery, selectedDecade, sortField, sortOrder]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Compare driver objects
  const driver1 = driversList.find((d) => d.driver_id === compareDriver1Id) || driversList[0];
  const driver2 = driversList.find((d) => d.driver_id === compareDriver2Id) || driversList[2];

  return (
    <div className="space-y-6">
      {/* 1. Header & Search Toolbar */}
      <div className="bg-[#12161F] border border-[#2A3245] rounded-xl p-5 space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#E10600]/20 text-[#E10600] border border-[#E10600]/40 uppercase tracking-wider">
                1950 – Present Archive
              </span>
              <span className="text-xs font-mono text-[#64748B]">Powered by Jolpica Ergast</span>
            </div>
            <h2 className="text-xl lg:text-2xl font-display font-black text-white tracking-wide uppercase">
              Formula 1 Historical Statistics & Champions
            </h2>
          </div>

          {/* Quick Head-to-Head Compare Trigger */}
          <button
            onClick={() => setCompareModalOpen(true)}
            className="px-4 py-2 bg-[#E10600] hover:bg-[#FF1801] text-white text-xs font-mono font-bold uppercase tracking-wider rounded-lg flex items-center gap-2 shadow-lg shadow-red-900/30 transition-colors"
          >
            <Users className="w-4 h-4" />
            <span>Driver Head-to-Head</span>
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#2A3245]">
          {/* Main Category Tabs */}
          <div className="flex items-center gap-2">
            {[
              { id: 'drivers', label: 'Driver Records', icon: Users },
              { id: 'constructors', label: 'Constructor Records', icon: Shield },
              { id: 'champions', label: 'Champions Hall of Fame', icon: Trophy },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition-colors ${
                    activeTab === tab.id
                      ? 'bg-[#E10600] text-white shadow-md'
                      : 'bg-[#1C2230] text-[#94A3B8] hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Box & Decade Filter */}
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search driver, team, nationality..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1C2230] border border-[#2A3245] rounded-lg pl-9 pr-3 py-1.5 text-xs font-mono text-white placeholder-[#64748B] focus:outline-none focus:border-[#E10600]"
              />
            </div>

            <select
              value={selectedDecade}
              onChange={(e) => setSelectedDecade(e.target.value)}
              className="bg-[#1C2230] border border-[#2A3245] text-[#94A3B8] text-xs font-mono rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#E10600]"
            >
              <option value="ALL">All Eras</option>
              <option value="2020">2020s</option>
              <option value="2010">2010s</option>
              <option value="2000">2000s</option>
              <option value="1990">1990s</option>
              <option value="1980">1980s</option>
              <option value="1970">1970s</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. TAB 1: Drivers All-Time Records Table */}
      {activeTab === 'drivers' && (
        <div className="bg-[#12161F] border border-[#2A3245] rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="bg-[#151922] text-[#64748B] border-b border-[#2A3245] text-[11px] uppercase tracking-wider select-none">
                  <th className="py-3 px-3 w-12 text-center">#</th>
                  <th className="py-3 px-3">DRIVER</th>
                  <th className="py-3 px-3">ERA</th>
                  <th
                    className="py-3 px-3 text-center cursor-pointer hover:text-white"
                    onClick={() => handleSort('world_championships')}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>TITLES</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="py-3 px-3 text-right cursor-pointer hover:text-white"
                    onClick={() => handleSort('race_wins')}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>WINS</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="py-3 px-3 text-right cursor-pointer hover:text-white"
                    onClick={() => handleSort('pole_positions')}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>POLES</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="py-3 px-3 text-right cursor-pointer hover:text-white"
                    onClick={() => handleSort('podiums')}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>PODIUMS</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3 px-3 text-right">STARTS</th>
                  <th className="py-3 px-3 text-right text-red-400">DNFs</th>
                  <th
                    className="py-3 px-3 text-right cursor-pointer hover:text-white"
                    onClick={() => handleSort('win_percentage')}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>WIN %</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3 px-3 text-center">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A3245]/50">
                {filteredDrivers.map((d, index) => (
                  <tr key={d.driver_id} className="hover:bg-[#1C2230]/60 transition-colors">
                    <td className="py-2.5 px-3 text-center font-bold text-[#64748B]">
                      {index + 1}
                    </td>
                    <td className="py-2.5 px-3">
                      <div>
                        <span className="font-bold text-white text-sm block">{d.driver_name}</span>
                        <span className="text-[10px] text-[#64748B]">{d.nationality}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-[#94A3B8]">{d.active_years}</td>
                    <td className="py-2.5 px-3 text-center">
                      {d.world_championships > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
                          <Trophy className="w-3 h-3" />
                          <span>{d.world_championships}</span>
                        </span>
                      ) : (
                        <span className="text-[#64748B]">-</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right font-black text-white tabular-nums text-sm">
                      {d.race_wins}
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium text-[#94A3B8] tabular-nums">
                      {d.pole_positions}
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium text-white tabular-nums">
                      {d.podiums}
                    </td>
                    <td className="py-2.5 px-3 text-right text-[#64748B] tabular-nums">
                      {d.race_entries}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-red-400 tabular-nums">
                      {d.dnf_count}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-400 tabular-nums">
                      {d.win_percentage.toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => {
                          setCompareDriver1Id(d.driver_id);
                          setCompareModalOpen(true);
                        }}
                        className="px-2 py-1 rounded bg-[#1C2230] hover:bg-[#2A3245] text-[10px] font-mono text-amber-400 border border-[#2A3245] transition-colors"
                      >
                        Compare
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. TAB 2: Constructor All-Time Records */}
      {activeTab === 'constructors' && (
        <div className="bg-[#12161F] border border-[#2A3245] rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="bg-[#151922] text-[#64748B] border-b border-[#2A3245] text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-3 w-12 text-center">#</th>
                  <th className="py-3 px-3">CONSTRUCTOR</th>
                  <th className="py-3 px-3">COUNTRY</th>
                  <th className="py-3 px-3">ACTIVE ERA</th>
                  <th className="py-3 px-3 text-center">CHAMPIONSHIPS</th>
                  <th className="py-3 px-3 text-right">RACE WINS</th>
                  <th className="py-3 px-3 text-right">PODIUMS</th>
                  <th className="py-3 px-3 text-right">ENTRIES</th>
                  <th className="py-3 px-3 text-right">WIN RATE %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A3245]/50">
                {constructorsList.map((c, i) => (
                  <tr key={c.constructor_id} className="hover:bg-[#1C2230]/60 transition-colors">
                    <td className="py-2.5 px-3 text-center font-bold text-[#64748B]">{i + 1}</td>
                    <td className="py-2.5 px-3 font-bold text-white text-sm">{c.constructor_name}</td>
                    <td className="py-2.5 px-3 text-[#94A3B8]">{c.nationality}</td>
                    <td className="py-2.5 px-3 text-[#64748B]">{c.active_years}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-black bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        <Trophy className="w-3 h-3" />
                        <span>{c.championships}</span>
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-black text-white tabular-nums text-sm">
                      {c.race_wins}
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium text-white tabular-nums">
                      {c.podiums}
                    </td>
                    <td className="py-2.5 px-3 text-right text-[#64748B] tabular-nums">
                      {c.race_entries}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-400 tabular-nums">
                      {c.win_percentage.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. TAB 3: Champions Hall of Fame Grid */}
      {activeTab === 'champions' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {HISTORICAL_CHAMPIONS.map((champ) => (
              <div
                key={champ.year}
                className="bg-[#12161F] border border-[#2A3245] rounded-xl p-4 space-y-2 hover:border-amber-500/50 transition-all shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-xs font-mono font-black bg-amber-500/20 text-amber-400 border border-amber-500/40">
                    {champ.year} WDC
                  </span>
                  <Trophy className="w-4 h-4 text-amber-400" />
                </div>
                <h4 className="font-bold text-base text-white">{champ.driver}</h4>
                <p className="text-xs text-[#94A3B8] font-mono">{champ.team}</p>
                <div className="pt-2 border-t border-[#2A3245]/60 flex items-center justify-between text-xs font-mono text-[#64748B]">
                  <span>{champ.wins} Wins</span>
                  <span className="text-white font-bold">{champ.points} PTS</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Head-to-Head Comparison Modal */}
      {compareModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#12161F] border border-[#2A3245] rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl space-y-5 p-6">
            <div className="flex items-center justify-between border-b border-[#2A3245] pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#E10600]" />
                <h3 className="text-base font-bold uppercase tracking-wider text-white">
                  Driver Head-to-Head Career Comparison
                </h3>
              </div>
              <button
                onClick={() => setCompareModalOpen(false)}
                className="p-1 text-[#64748B] hover:text-white rounded hover:bg-[#1C2230]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selectors */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-[#64748B] mb-1">DRIVER 1</label>
                <select
                  value={compareDriver1Id}
                  onChange={(e) => setCompareDriver1Id(e.target.value)}
                  className="w-full bg-[#1C2230] border border-[#2A3245] text-white text-xs font-mono font-bold rounded-lg p-2 focus:outline-none focus:border-[#E10600]"
                >
                  {driversList.map((d) => (
                    <option key={d.driver_id} value={d.driver_id}>
                      {d.driver_name} ({d.world_championships}x WDC)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-[#64748B] mb-1">DRIVER 2</label>
                <select
                  value={compareDriver2Id}
                  onChange={(e) => setCompareDriver2Id(e.target.value)}
                  className="w-full bg-[#1C2230] border border-[#2A3245] text-white text-xs font-mono font-bold rounded-lg p-2 focus:outline-none focus:border-[#E10600]"
                >
                  {driversList.map((d) => (
                    <option key={d.driver_id} value={d.driver_id}>
                      {d.driver_name} ({d.world_championships}x WDC)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Comparison Comparison Matrix */}
            <div className="space-y-3 font-mono text-xs">
              {[
                { label: 'World Championships', v1: driver1.world_championships, v2: driver2.world_championships },
                { label: 'Race Wins', v1: driver1.race_wins, v2: driver2.race_wins },
                { label: 'Pole Positions', v1: driver1.pole_positions, v2: driver2.pole_positions },
                { label: 'Podiums', v1: driver1.podiums, v2: driver2.podiums },
                { label: 'Win Percentage', v1: `${driver1.win_percentage.toFixed(1)}%`, v2: `${driver2.win_percentage.toFixed(1)}%`, num1: driver1.win_percentage, num2: driver2.win_percentage },
                { label: 'Race Starts', v1: driver1.race_entries, v2: driver2.race_entries },
                { label: 'DNFs (Retirements)', v1: driver1.dnf_count, v2: driver2.dnf_count, invert: true },
              ].map((row) => {
                const n1 = row.num1 !== undefined ? row.num1 : Number(row.v1);
                const n2 = row.num2 !== undefined ? row.num2 : Number(row.v2);
                const d1Wins = row.invert ? n1 < n2 : n1 > n2;
                const d2Wins = row.invert ? n2 < n1 : n2 > n1;

                return (
                  <div key={row.label} className="p-3 bg-[#1C2230] rounded-xl border border-[#2A3245]/60 flex items-center justify-between">
                    <span className={`w-24 font-bold text-sm tabular-nums ${d1Wins ? 'text-amber-400' : 'text-white'}`}>
                      {row.v1}
                    </span>
                    <span className="text-center font-bold text-[#94A3B8] uppercase text-[11px]">
                      {row.label}
                    </span>
                    <span className={`w-24 text-right font-bold text-sm tabular-nums ${d2Wins ? 'text-amber-400' : 'text-white'}`}>
                      {row.v2}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
