import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import LapTimeChart from '../components/visualizations/LapTimeChart';
import PositionChangesChart from '../components/visualizations/PositionChangesChart';
import TyreStintTimeline from '../components/visualizations/TyreStintTimeline';
import GapEvolutionChart from '../components/visualizations/GapEvolutionChart';
import {
  LineChart as LineChartIcon,
  TrendingUp,
  Clock,
  CloudRain,
  Radio,
  Sliders,
  Filter,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

// Standard 2024 Drivers for Analysis
const ANALYSIS_DRIVERS = [
  { code: 'VER', number: 1, team: 'redbull', color: '#3671C6', name: 'Max Verstappen' },
  { code: 'NOR', number: 4, team: 'mclaren', color: '#FF8000', name: 'Lando Norris' },
  { code: 'LEC', number: 16, team: 'ferrari', color: '#E80020', name: 'Charles Leclerc' },
  { code: 'PIA', number: 81, team: 'mclaren', color: '#FF8000', name: 'Oscar Piastri' },
  { code: 'SAI', number: 55, team: 'ferrari', color: '#E80020', name: 'Carlos Sainz' },
  { code: 'RUS', number: 63, team: 'mercedes', color: '#27F4D2', name: 'George Russell' },
  { code: 'HAM', number: 44, team: 'mercedes', color: '#27F4D2', name: 'Lewis Hamilton' },
  { code: 'OCO', number: 31, team: 'alpine', color: '#0093CC', name: 'Esteban Ocon' },
  { code: 'GAS', number: 10, team: 'alpine', color: '#0093CC', name: 'Pierre Gasly' },
];

// Generate realistic 57-lap race telemetry
function generateMockRaceData() {
  const laps = [];
  const positions = [];
  const gaps = [];
  const weather = [];

  let verGap = 0;
  let norGap = 2.4;
  let lecGap = 4.8;
  let piaGap = 8.1;
  let ocoGap = 19.5;

  for (let lap = 1; lap <= 57; lap++) {
    const isSC = lap >= 32 && lap <= 35;
    const basePace = isSC ? 112.5 : 81.2;

    // Simulate degradation
    const deg = (lap % 25) * 0.06;

    // Lap times
    laps.push({
      lap,
      VER: isSC ? 111.4 : basePace + deg + (Math.random() * 0.4 - 0.2),
      NOR: isSC ? 111.8 : basePace + 0.2 + deg * 1.05 + (Math.random() * 0.4 - 0.2),
      LEC: isSC ? 112.1 : basePace + 0.4 + deg * 0.95 + (Math.random() * 0.4 - 0.2),
      PIA: isSC ? 112.5 : basePace + 0.6 + deg * 1.1 + (Math.random() * 0.4 - 0.2),
      SAI: isSC ? 112.9 : basePace + 0.7 + deg + (Math.random() * 0.4 - 0.2),
      RUS: isSC ? 113.1 : basePace + 0.9 + deg + (Math.random() * 0.4 - 0.2),
      HAM: isSC ? 112.4 : basePace + 0.5 + deg + (Math.random() * 0.4 - 0.2),
      OCO: isSC ? 113.4 : basePace + 1.2 + deg + (Math.random() * 0.4 - 0.2),
      GAS: isSC ? 113.8 : basePace + 1.4 + deg + (Math.random() * 0.4 - 0.2),
    });

    // Positions evolution
    positions.push({
      lap,
      VER: 1,
      NOR: lap < 20 ? 2 : lap < 33 ? 3 : 2,
      LEC: lap < 20 ? 3 : lap < 33 ? 2 : 3,
      PIA: 4,
      SAI: lap < 28 ? 5 : 6,
      RUS: lap < 28 ? 6 : 5,
      HAM: 7,
      OCO: lap < 33 ? 8 : 4,
      GAS: lap < 33 ? 9 : 5,
    });

    // Gaps to winner VER
    if (!isSC) {
      norGap += 0.05 + (Math.random() * 0.1 - 0.05);
      lecGap += 0.08 + (Math.random() * 0.1 - 0.05);
      piaGap += 0.12 + (Math.random() * 0.1 - 0.05);
      ocoGap += 0.15;
    }
    gaps.push({
      lap,
      VER: 0,
      NOR: Number(norGap.toFixed(3)),
      LEC: Number(lecGap.toFixed(3)),
      PIA: Number(piaGap.toFixed(3)),
      OCO: Number(ocoGap.toFixed(3)),
    });

    // Weather progression
    weather.push({
      lap,
      track_temp: Number((38.5 - lap * 0.08).toFixed(1)),
      air_temp: Number((26.2 - lap * 0.03).toFixed(1)),
      humidity: Number((45 + lap * 0.3).toFixed(1)),
    });
  }

  return { laps, positions, gaps, weather };
}

// Stints Data for Gantt
const MOCK_STINTS_DATA = [
  { driverCode: 'VER', driverName: 'Max Verstappen', team: 'redbull', stints: [
    { compound: 'MEDIUM', lapStart: 1, lapEnd: 24, pitDuration: 2.3 },
    { compound: 'HARD', lapStart: 25, lapEnd: 57, pitDuration: null },
  ]},
  { driverCode: 'NOR', driverName: 'Lando Norris', team: 'mclaren', stints: [
    { compound: 'MEDIUM', lapStart: 1, lapEnd: 22, pitDuration: 2.1 },
    { compound: 'HARD', lapStart: 23, lapEnd: 57, pitDuration: null },
  ]},
  { driverCode: 'LEC', driverName: 'Charles Leclerc', team: 'ferrari', stints: [
    { compound: 'HARD', lapStart: 1, lapEnd: 26, pitDuration: 2.5 },
    { compound: 'MEDIUM', lapStart: 27, lapEnd: 57, pitDuration: null },
  ]},
  { driverCode: 'PIA', driverName: 'Oscar Piastri', team: 'mclaren', stints: [
    { compound: 'MEDIUM', lapStart: 1, lapEnd: 23, pitDuration: 2.4 },
    { compound: 'HARD', lapStart: 24, lapEnd: 57, pitDuration: null },
  ]},
  { driverCode: 'SAI', driverName: 'Carlos Sainz', team: 'ferrari', stints: [
    { compound: 'MEDIUM', lapStart: 1, lapEnd: 25, pitDuration: 2.8 },
    { compound: 'HARD', lapStart: 26, lapEnd: 57, pitDuration: null },
  ]},
  { driverCode: 'RUS', driverName: 'George Russell', team: 'mercedes', stints: [
    { compound: 'MEDIUM', lapStart: 1, lapEnd: 21, pitDuration: 2.6 },
    { compound: 'HARD', lapStart: 22, lapEnd: 57, pitDuration: null },
  ]},
  { driverCode: 'HAM', driverName: 'Lewis Hamilton', team: 'mercedes', stints: [
    { compound: 'HARD', lapStart: 1, lapEnd: 28, pitDuration: 2.3 },
    { compound: 'MEDIUM', lapStart: 29, lapEnd: 46, pitDuration: 2.4 },
    { compound: 'SOFT', lapStart: 47, lapEnd: 57, pitDuration: null },
  ]},
  { driverCode: 'OCO', driverName: 'Esteban Ocon', team: 'alpine', stints: [
    { compound: 'INTERMEDIATE', lapStart: 1, lapEnd: 32, pitDuration: 3.1 },
    { compound: 'HARD', lapStart: 33, lapEnd: 57, pitDuration: null },
  ]},
];

export default function RaceAnalysisPage() {
  const [selectedSeason, setSelectedSeason] = useState('2024');
  const [selectedRound, setSelectedRound] = useState('21'); // São Paulo GP
  const [activeAnalysisView, setActiveAnalysisView] = useState('laptimes'); // 'laptimes' | 'positions' | 'stints' | 'gaps' | 'weather'

  const mockData = useMemo(() => generateMockRaceData(), []);

  return (
    <div className="space-y-6">
      {/* 1. Race & Grand Prix Selector Header */}
      <div className="bg-[#12161F] border border-[#2A3245] rounded-xl p-5 space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#E10600]/20 text-[#E10600] border border-[#E10600]/40 uppercase tracking-wider">
                Telemetry Post-Race Breakdown
              </span>
              <span className="text-xs font-mono text-[#64748B]">Official Race Stint Analysis</span>
            </div>
            <h2 className="text-xl lg:text-2xl font-display font-black text-white tracking-wide uppercase">
              Grand Prix Race Telemetry & Strategy Analysis
            </h2>
          </div>

          {/* Race Selectors */}
          <div className="flex items-center gap-2 font-mono text-xs">
            <select
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(e.target.value)}
              className="bg-[#1C2230] border border-[#2A3245] text-white rounded-lg p-2 focus:outline-none focus:border-[#E10600]"
            >
              <option value="2024">2024 Season</option>
              <option value="2023">2023 Season</option>
            </select>

            <select
              value={selectedRound}
              onChange={(e) => setSelectedRound(e.target.value)}
              className="bg-[#1C2230] border border-[#2A3245] text-white rounded-lg p-2 focus:outline-none focus:border-[#E10600]"
            >
              <option value="21">Round 21 — São Paulo GP</option>
              <option value="20">Round 20 — Mexico City GP</option>
              <option value="19">Round 19 — United States GP</option>
              <option value="18">Round 18 — Singapore GP</option>
              <option value="12">Round 12 — British GP (Silverstone)</option>
              <option value="8">Round 8 — Monaco GP</option>
            </select>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[#2A3245]">
          {[
            { id: 'laptimes', label: 'Lap Time Degradation', icon: LineChartIcon },
            { id: 'positions', label: 'Position Changes', icon: TrendingUp },
            { id: 'stints', label: 'Tyre Stint Timeline', icon: Clock },
            { id: 'gaps', label: 'Gap Evolution to Leader', icon: Sliders },
            { id: 'weather', label: 'Track Weather Overlay', icon: CloudRain },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveAnalysisView(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition-colors ${
                  activeAnalysisView === tab.id
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
      </div>

      {/* 2. Visualizations Container */}
      <div>
        {activeAnalysisView === 'laptimes' && (
          <LapTimeChart
            lapsData={mockData.laps}
            drivers={ANALYSIS_DRIVERS}
            scPeriods={[{ startLap: 32, endLap: 35, type: 'SC' }]}
            height={440}
          />
        )}

        {activeAnalysisView === 'positions' && (
          <PositionChangesChart
            positionsData={mockData.positions}
            drivers={ANALYSIS_DRIVERS}
            height={460}
          />
        )}

        {activeAnalysisView === 'stints' && (
          <TyreStintTimeline stintsData={MOCK_STINTS_DATA} totalLaps={57} />
        )}

        {activeAnalysisView === 'gaps' && (
          <GapEvolutionChart
            gapsData={mockData.gaps}
            drivers={ANALYSIS_DRIVERS}
            defaultReference="VER"
            height={420}
          />
        )}

        {activeAnalysisView === 'weather' && (
          <div className="bg-[#12161F] border border-[#2A3245] rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#2A3245] pb-3">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">Track & Ambient Weather Conditions</h3>
                <p className="text-xs font-mono text-[#64748B]">Minute-by-minute sensor readings across 57 laps</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="flex items-center gap-1.5 text-amber-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span>Track Temp (°C)</span>
                </span>
                <span className="flex items-center gap-1.5 text-[#00F0FF]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00F0FF]" />
                  <span>Air Temp (°C)</span>
                </span>
                <span className="flex items-center gap-1.5 text-blue-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                  <span>Humidity (%)</span>
                </span>
              </div>
            </div>

            <div style={{ width: '100%', height: 360 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockData.weather} margin={{ top: 10, right: 15, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A3245" vertical={false} opacity={0.6} />
                  <XAxis
                    dataKey="lap"
                    stroke="#64748B"
                    tick={{ fill: '#94A3B8', fontSize: 11, fontFamily: 'monospace' }}
                  />
                  <YAxis
                    stroke="#64748B"
                    tick={{ fill: '#94A3B8', fontSize: 11, fontFamily: 'monospace' }}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#151922', borderColor: '#2A3245', fontFamily: 'monospace', fontSize: '11px' }}
                  />
                  <Line type="monotone" dataKey="track_temp" stroke="#F59E0B" strokeWidth={2} dot={false} name="Track Temp" />
                  <Line type="monotone" dataKey="air_temp" stroke="#00F0FF" strokeWidth={2} dot={false} name="Air Temp" />
                  <Line type="monotone" dataKey="humidity" stroke="#3B82F6" strokeWidth={1.5} strokeDasharray="3 3" dot={false} name="Humidity" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* 3. Race Control Incident Highlights Bar */}
      <div className="bg-[#12161F] border border-[#2A3245] rounded-xl p-4 space-y-2 text-xs font-mono">
        <div className="flex items-center gap-2 text-amber-400">
          <Radio className="w-4 h-4" />
          <span className="font-bold uppercase tracking-wider">Key Session Incidents Timeline:</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          <div className="p-2.5 bg-[#1C2230] rounded border border-[#2A3245]/60">
            <span className="text-amber-400 font-bold block">LAP 32 — SAFETY CAR</span>
            <span className="text-[#94A3B8]">Heavy rainfall intensified; SC deployed to neutralize field.</span>
          </div>
          <div className="p-2.5 bg-[#1C2230] rounded border border-[#2A3245]/60">
            <span className="text-emerald-400 font-bold block">LAP 36 — GREEN FLAG</span>
            <span className="text-[#94A3B8]">Track deemed raceable; rolling restart executed.</span>
          </div>
          <div className="p-2.5 bg-[#1C2230] rounded border border-[#2A3245]/60">
            <span className="text-purple-400 font-bold block">LAP 43 — FASTEST LAP</span>
            <span className="text-[#94A3B8]">VER set fastest lap (1:20.472) on intermediate tyres.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
