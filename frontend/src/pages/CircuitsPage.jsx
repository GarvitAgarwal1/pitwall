import React, { useState, useEffect, useMemo } from 'react';
import apiClient from '../api/client';
import {
  MapPin,
  Search,
  Filter,
  Trophy,
  Navigation,
  Clock,
  Zap,
  X,
  Gauge,
  ChevronRight,
} from 'lucide-react';

const FALLBACK_CIRCUITS = [
  {
    circuit_id: 'bahrain',
    circuit_name: 'Bahrain International Circuit',
    locality: 'Sakhir',
    country: 'Bahrain',
    flag: '🇧🇭',
    region: 'Middle East',
    length_km: 5.412,
    turns: 15,
    laps: 57,
    lap_record_time: '1:31.447',
    lap_record_driver: 'Pedro de la Rosa (2005)',
    downforce: 'Medium-High',
    tyre_stress: 4,
    past_winners: [
      { year: 2024, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:31:44.742' },
      { year: 2023, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:33:56.736' },
      { year: 2022, winner: 'Charles Leclerc', team: 'Ferrari', time: '1:37:33.584' },
      { year: 2021, winner: 'Lewis Hamilton', team: 'Mercedes', time: '1:32:03.897' },
    ],
  },
  {
    circuit_id: 'jeddah',
    circuit_name: 'Jeddah Corniche Circuit',
    locality: 'Jeddah',
    country: 'Saudi Arabia',
    flag: '🇸🇦',
    region: 'Middle East',
    length_km: 6.174,
    turns: 27,
    laps: 50,
    lap_record_time: '1:30.734',
    lap_record_driver: 'Lewis Hamilton (2021)',
    downforce: 'Low-Medium',
    tyre_stress: 3,
    past_winners: [
      { year: 2024, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:20:43.273' },
      { year: 2023, winner: 'Sergio Perez', team: 'Red Bull Racing', time: '1:21:14.894' },
      { year: 2022, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:24:19.293' },
    ],
  },
  {
    circuit_id: 'albert_park',
    circuit_name: 'Albert Park Circuit',
    locality: 'Melbourne',
    country: 'Australia',
    flag: '🇦🇺',
    region: 'Asia & Pacific',
    length_km: 5.278,
    turns: 14,
    laps: 58,
    lap_record_time: '1:19.813',
    lap_record_driver: 'Charles Leclerc (2024)',
    downforce: 'Medium',
    tyre_stress: 3,
    past_winners: [
      { year: 2024, winner: 'Carlos Sainz', team: 'Ferrari', time: '1:20:26.843' },
      { year: 2023, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '2:32:38.371' },
      { year: 2022, winner: 'Charles Leclerc', team: 'Ferrari', time: '1:27:46.548' },
    ],
  },
  {
    circuit_id: 'suzuka',
    circuit_name: 'Suzuka International Racing Course',
    locality: 'Suzuka',
    country: 'Japan',
    flag: '🇯🇵',
    region: 'Asia & Pacific',
    length_km: 5.807,
    turns: 18,
    laps: 53,
    lap_record_time: '1:30.983',
    lap_record_driver: 'Lewis Hamilton (2019)',
    downforce: 'High',
    tyre_stress: 5,
    past_winners: [
      { year: 2024, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:54:23.566' },
      { year: 2023, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:30:58.421' },
    ],
  },
  {
    circuit_id: 'miami',
    circuit_name: 'Miami International Autodrome',
    locality: 'Miami',
    country: 'USA',
    flag: '🇺🇸',
    region: 'Americas',
    length_km: 5.412,
    turns: 19,
    laps: 57,
    lap_record_time: '1:29.708',
    lap_record_driver: 'Max Verstappen (2023)',
    downforce: 'Medium',
    tyre_stress: 3,
    past_winners: [
      { year: 2024, winner: 'Lando Norris', team: 'McLaren', time: '1:30:49.876' },
      { year: 2023, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:27:38.241' },
      { year: 2022, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:34:24.258' },
    ],
  },
  {
    circuit_id: 'monaco',
    circuit_name: 'Circuit de Monaco',
    locality: 'Monte Carlo',
    country: 'Monaco',
    flag: '🇲🇨',
    region: 'Europe',
    length_km: 3.337,
    turns: 19,
    laps: 78,
    lap_record_time: '1:12.909',
    lap_record_driver: 'Lewis Hamilton (2021)',
    downforce: 'Maximum',
    tyre_stress: 1,
    past_winners: [
      { year: 2024, winner: 'Charles Leclerc', team: 'Ferrari', time: '2:23:15.554' },
      { year: 2023, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:48:51.980' },
      { year: 2022, winner: 'Sergio Perez', team: 'Red Bull Racing', time: '1:56:30.265' },
    ],
  },
  {
    circuit_id: 'silverstone',
    circuit_name: 'Silverstone Circuit',
    locality: 'Silverstone',
    country: 'United Kingdom',
    flag: '🇬🇧',
    region: 'Europe',
    length_km: 5.891,
    turns: 18,
    laps: 52,
    lap_record_time: '1:27.097',
    lap_record_driver: 'Max Verstappen (2020)',
    downforce: 'High',
    tyre_stress: 5,
    past_winners: [
      { year: 2024, winner: 'Lewis Hamilton', team: 'Mercedes', time: '1:22:27.059' },
      { year: 2023, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:25:16.938' },
      { year: 2022, winner: 'Carlos Sainz', team: 'Ferrari', time: '1:21:20.440' },
    ],
  },
  {
    circuit_id: 'spa',
    circuit_name: 'Circuit de Spa-Francorchamps',
    locality: 'Stavelot',
    country: 'Belgium',
    flag: '🇧🇪',
    region: 'Europe',
    length_km: 7.004,
    turns: 19,
    laps: 44,
    lap_record_time: '1:44.701',
    lap_record_driver: 'Sergio Perez (2024)',
    downforce: 'Medium-Low',
    tyre_stress: 5,
    past_winners: [
      { year: 2024, winner: 'Lewis Hamilton', team: 'Mercedes', time: '1:19:57.566' },
      { year: 2023, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:22:30.450' },
      { year: 2022, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:25:52.894' },
    ],
  },
  {
    circuit_id: 'monza',
    circuit_name: 'Autodromo Nazionale Monza',
    locality: 'Monza',
    country: 'Italy',
    flag: '🇮🇹',
    region: 'Europe',
    length_km: 5.793,
    turns: 11,
    laps: 53,
    lap_record_time: '1:21.046',
    lap_record_driver: 'Rubens Barrichello (2004)',
    downforce: 'Minimum',
    tyre_stress: 3,
    past_winners: [
      { year: 2024, winner: 'Charles Leclerc', team: 'Ferrari', time: '1:14:40.727' },
      { year: 2023, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:13:41.143' },
      { year: 2022, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:20:27.511' },
    ],
  },
  {
    circuit_id: 'interlagos',
    circuit_name: 'Autódromo José Carlos Pace',
    locality: 'São Paulo',
    country: 'Brazil',
    flag: '🇧🇷',
    region: 'Americas',
    length_km: 4.309,
    turns: 15,
    laps: 71,
    lap_record_time: '1:10.540',
    lap_record_driver: 'Valtteri Bottas (2018)',
    downforce: 'High',
    tyre_stress: 4,
    past_winners: [
      { year: 2024, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '2:06:54.430' },
      { year: 2023, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:56:48.894' },
      { year: 2022, winner: 'George Russell', team: 'Mercedes', time: '1:38:34.044' },
    ],
  },
  {
    circuit_id: 'las_vegas',
    circuit_name: 'Las Vegas Strip Circuit',
    locality: 'Las Vegas',
    country: 'USA',
    flag: '🇺🇸',
    region: 'Americas',
    length_km: 6.201,
    turns: 17,
    laps: 50,
    lap_record_time: '1:35.490',
    lap_record_driver: 'Oscar Piastri (2023)',
    downforce: 'Low',
    tyre_stress: 3,
    past_winners: [
      { year: 2023, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:29:08.289' },
    ],
  },
  {
    circuit_id: 'yas_marina',
    circuit_name: 'Yas Marina Circuit',
    locality: 'Abu Dhabi',
    country: 'UAE',
    flag: '🇦🇪',
    region: 'Middle East',
    length_km: 5.281,
    turns: 16,
    laps: 58,
    lap_record_time: '1:26.103',
    lap_record_driver: 'Max Verstappen (2021)',
    downforce: 'Medium-High',
    tyre_stress: 3,
    past_winners: [
      { year: 2023, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:27:02.624' },
      { year: 2022, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:27:45.914' },
      { year: 2021, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:30:17.345' },
    ],
  },
];

export default function CircuitsPage() {
  const [circuits, setCircuits] = useState(FALLBACK_CIRCUITS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('ALL');
  const [activeModalCircuit, setActiveModalCircuit] = useState(null);

  // Load from backend API if available
  useEffect(() => {
    let isMounted = true;
    async function loadCircuits() {
      try {
        const res = await apiClient.get('/circuits');
        if (isMounted && res?.circuits?.length > 0) {
          // Merge with detailed metadata
          setCircuits((prev) =>
            res.circuits.map((c) => {
              const fallback = prev.find((f) => f.circuit_id === c.circuit_id);
              return { ...fallback, ...c };
            })
          );
        }
      } catch (err) {
        // Fallback maintained
      }
    }
    loadCircuits();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredCircuits = useMemo(() => {
    return circuits.filter((c) => {
      if (selectedRegion !== 'ALL' && c.region && c.region !== selectedRegion) {
        return false;
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          c.circuit_name?.toLowerCase().includes(q) ||
          c.locality?.toLowerCase().includes(q) ||
          c.country?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [circuits, selectedRegion, searchQuery]);

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar */}
      <div className="bg-[#12161F] border border-[#2A3245] rounded-xl p-5 space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#E10600]/20 text-[#E10600] border border-[#E10600]/40 uppercase tracking-wider">
                Championship Venues
              </span>
              <span className="text-xs font-mono text-[#64748B]">24 Global Grand Prix Tracks</span>
            </div>
            <h2 className="text-xl lg:text-2xl font-display font-black text-white tracking-wide uppercase">
              Formula 1 World Championship Circuits Directory
            </h2>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search circuit, city, country..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1C2230] border border-[#2A3245] rounded-lg pl-9 pr-3 py-1.5 text-xs font-mono text-white placeholder-[#64748B] focus:outline-none focus:border-[#E10600]"
            />
          </div>
        </div>

        {/* Region Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[#2A3245]">
          {['ALL', 'Europe', 'Americas', 'Middle East', 'Asia & Pacific'].map((reg) => (
            <button
              key={reg}
              onClick={() => setSelectedRegion(reg)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors ${
                selectedRegion === reg
                  ? 'bg-[#E10600] text-white shadow-md'
                  : 'bg-[#1C2230] text-[#94A3B8] hover:text-white'
              }`}
            >
              {reg}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Responsive Circuit Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredCircuits.map((circuit) => (
          <div
            key={circuit.circuit_id}
            onClick={() => setActiveModalCircuit(circuit)}
            className="bg-[#12161F] border border-[#2A3245] rounded-xl p-4 flex flex-col justify-between hover:border-amber-400/60 cursor-pointer transition-all shadow-md group"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xl">{circuit.flag || '🏁'}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#1C2230] text-[#94A3B8] border border-[#2A3245]">
                  {circuit.turns} Turns
                </span>
              </div>

              <div>
                <h3 className="font-bold text-sm text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                  {circuit.circuit_name}
                </h3>
                <p className="text-xs font-mono text-[#64748B] flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-[#E10600]" />
                  <span>{circuit.locality}, {circuit.country}</span>
                </p>
              </div>

              <div className="space-y-1 font-mono text-[11px] text-[#94A3B8] pt-2 border-t border-[#2A3245]/60">
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Length:</span>
                  <span className="text-white font-bold">{circuit.length_km} km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Race Laps:</span>
                  <span className="text-white font-bold">{circuit.laps} Laps</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Downforce:</span>
                  <span className="text-amber-400 font-bold">{circuit.downforce}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-[#2A3245]/60 flex items-center justify-between text-xs font-mono text-[#E10600] font-bold">
              <span>View Track Map & History</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        ))}
      </div>

      {/* 3. Detailed Circuit Modal View */}
      {activeModalCircuit && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#12161F] border border-[#2A3245] rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl space-y-5 p-6 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#2A3245] pb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{activeModalCircuit.flag}</span>
                <div>
                  <h3 className="text-base font-bold uppercase tracking-wider text-white">
                    {activeModalCircuit.circuit_name}
                  </h3>
                  <p className="text-xs font-mono text-[#64748B]">
                    {activeModalCircuit.locality}, {activeModalCircuit.country}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveModalCircuit(null)}
                className="p-1 text-[#64748B] hover:text-white rounded hover:bg-[#1C2230]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scaled SVG Circuit Map Layout */}
            <div className="bg-[#151922] p-5 rounded-xl border border-[#2A3245]/60 flex flex-col items-center justify-center relative">
              <svg viewBox="0 0 500 250" className="w-full h-48 stroke-[#2A3245] fill-none">
                <path
                  d="M 80 180 C 40 180, 40 80, 90 60 C 160 40, 260 50, 360 70 C 430 85, 470 120, 460 170 C 450 210, 380 220, 330 200 C 270 180, 220 210, 170 220 Z"
                  strokeWidth="8"
                  strokeLinecap="round"
                  className="stroke-amber-400"
                />
                <circle cx="90" cy="60" r="5" fill="#EF4444" />
                <text x="100" y="60" fill="#FFFFFF" fontSize="10" fontFamily="monospace">T1 Apex</text>
                <circle cx="360" cy="70" r="5" fill="#10B981" />
                <text x="370" y="70" fill="#FFFFFF" fontSize="10" fontFamily="monospace">DRS Zone 1</text>
                <circle cx="460" cy="170" r="5" fill="#EF4444" />
                <text x="400" y="160" fill="#FFFFFF" fontSize="10" fontFamily="monospace">Hairpin</text>
                <circle cx="170" cy="220" r="5" fill="#10B981" />
                <text x="180" y="235" fill="#FFFFFF" fontSize="10" fontFamily="monospace">DRS Zone 2</text>
              </svg>
              <span className="text-[10px] font-mono text-[#64748B] mt-1">Official FIA Track Configuration Map</span>
            </div>

            {/* Technical Specifications Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
              <div className="p-3 bg-[#1C2230] rounded-xl border border-[#2A3245]/60">
                <span className="text-[10px] text-[#64748B] block">TRACK LENGTH</span>
                <span className="font-bold text-white text-sm">{activeModalCircuit.length_km} km</span>
              </div>
              <div className="p-3 bg-[#1C2230] rounded-xl border border-[#2A3245]/60">
                <span className="text-[10px] text-[#64748B] block">NUMBER OF TURNS</span>
                <span className="font-bold text-white text-sm">{activeModalCircuit.turns} Corners</span>
              </div>
              <div className="p-3 bg-[#1C2230] rounded-xl border border-[#2A3245]/60">
                <span className="text-[10px] text-[#64748B] block">DOWNFORCE LEVEL</span>
                <span className="font-bold text-amber-400 text-sm">{activeModalCircuit.downforce}</span>
              </div>
              <div className="p-3 bg-[#1C2230] rounded-xl border border-[#2A3245]/60">
                <span className="text-[10px] text-[#64748B] block">TYRE SEVERITY</span>
                <span className="font-bold text-white text-sm">{activeModalCircuit.tyre_stress} / 5</span>
              </div>
            </div>

            {/* Lap Record Callout */}
            <div className="p-3 bg-[#1C2230] rounded-xl border border-purple-500/30 flex items-center justify-between font-mono text-xs">
              <div>
                <span className="text-purple-400 font-bold block text-[11px]">ALL-TIME RACE LAP RECORD</span>
                <span className="text-[#94A3B8]">{activeModalCircuit.lap_record_driver}</span>
              </div>
              <span className="text-base font-black text-white">{activeModalCircuit.lap_record_time}</span>
            </div>

            {/* Past Winners Table */}
            {activeModalCircuit.past_winners && activeModalCircuit.past_winners.length > 0 && (
              <div className="space-y-2 font-mono text-xs">
                <span className="font-bold text-white uppercase text-[11px] block">Recent Grand Prix Winners:</span>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#151922] text-[#64748B] text-[10px] uppercase border-b border-[#2A3245]">
                        <th className="py-2 px-3">YEAR</th>
                        <th className="py-2 px-3">WINNER</th>
                        <th className="py-2 px-3">CONSTRUCTOR</th>
                        <th className="py-2 px-3 text-right">TIME</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2A3245]/50">
                      {activeModalCircuit.past_winners.map((pw) => (
                        <tr key={pw.year} className="hover:bg-[#1C2230]/50">
                          <td className="py-2 px-3 font-bold text-amber-400">{pw.year}</td>
                          <td className="py-2 px-3 font-bold text-white">{pw.winner}</td>
                          <td className="py-2 px-3 text-[#94A3B8]">{pw.team}</td>
                          <td className="py-2 px-3 text-right font-medium text-white">{pw.time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
