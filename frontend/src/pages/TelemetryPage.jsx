import React, { useState, useMemo } from 'react';
import apiClient from '../api/client';
import TelemetryOverlayChart from '../components/visualizations/TelemetryOverlayChart';
import {
  Gauge,
  Sliders,
  Sparkles,
  Zap,
  MapPin,
  TrendingDown,
  Navigation,
} from 'lucide-react';

// Generates high-resolution single-lap telemetry comparison (e.g. Silverstone Q3 Lap 5,891m)
function generateLapTelemetry(driver1Code = 'VER', driver2Code = 'NOR') {
  const points = [];
  const trackLength = 5891; // Silverstone length in meters
  const sampleCount = 300;
  const step = trackLength / sampleCount;

  let d1CumulativeTime = 0;
  let d2CumulativeTime = 0;

  for (let i = 0; i <= sampleCount; i++) {
    const dist = i * step;

    // Simulate cornering & straightaway cycles
    const phase = (dist / 650) * Math.PI;
    const isCorner = Math.sin(phase) < -0.3;

    // Speed profiles (km/h)
    const baseSpeed = isCorner ? 110 + Math.abs(Math.sin(phase)) * 40 : 290 + Math.cos(phase) * 35;
    const d1Speed = Math.round(baseSpeed + (Math.sin(dist / 200) * 8));
    const d2Speed = Math.round(baseSpeed + (Math.cos(dist / 220) * 7));

    // Throttle & Brake
    const d1Throttle = isCorner ? Math.round(25 + Math.random() * 20) : 100;
    const d2Throttle = isCorner ? Math.round(30 + Math.random() * 15) : 100;

    const d1Brake = isCorner ? Math.round(80 + Math.random() * 20) : 0;
    const d2Brake = isCorner ? Math.round(75 + Math.random() * 25) : 0;

    // Gears
    const gear = isCorner ? Math.max(2, Math.min(4, Math.round(d1Speed / 38))) : Math.min(8, Math.round(d1Speed / 42));

    // DRS zones (e.g. Hangar straight: 3400m to 4200m)
    const isDrsZone = (dist > 1200 && dist < 1800) || (dist > 3400 && dist < 4200);
    const d1Drs = isDrsZone ? 1 : 0;
    const d2Drs = isDrsZone ? 1 : 0;

    // Compute delta time
    const d1Dt = (step / (Math.max(20, d1Speed) * (1000 / 3600)));
    const d2Dt = (step / (Math.max(20, d2Speed) * (1000 / 3600)));
    d1CumulativeTime += d1Dt;
    d2CumulativeTime += d2Dt;

    // Positive delta = Driver 1 ahead
    const delta = Number((d2CumulativeTime - d1CumulativeTime).toFixed(3));

    points.push({
      distance_m: Math.round(dist),
      d1_speed: d1Speed,
      d2_speed: d2Speed,
      d1_throttle: d1Throttle,
      d2_throttle: d2Throttle,
      d1_brake: d1Brake,
      d2_brake: d2Brake,
      d1_gear: gear,
      d2_gear: isCorner ? gear : Math.min(8, gear),
      d1_drs: d1Drs,
      d2_drs: d2Drs,
      delta_time: delta,
    });
  }

  return points;
}

export default function TelemetryPage() {
  const [driver1Code, setDriver1Code] = useState('VER');
  const [driver2Code, setDriver2Code] = useState('NOR');
  const [session, setSession] = useState('2024_silverstone_q3');
  const [selectedLap, setSelectedLap] = useState(18);

  // Synchronized hovered distance
  const [hoveredDistance, setHoveredDistance] = useState(2400);

  const telemetryData = useMemo(() => {
    return generateLapTelemetry(driver1Code, driver2Code);
  }, [driver1Code, driver2Code]);

  const driver1Meta = {
    code: driver1Code,
    number: driver1Code === 'VER' ? 1 : driver1Code === 'LEC' ? 16 : driver1Code === 'HAM' ? 44 : 63,
    color: '#00F0FF',
    name: driver1Code === 'VER' ? 'Max Verstappen' : 'Driver 1',
    lapTime: '1:25.819',
  };

  const driver2Meta = {
    code: driver2Code,
    number: driver2Code === 'NOR' ? 4 : driver2Code === 'PIA' ? 81 : driver2Code === 'SAI' ? 55 : 63,
    color: '#FF8000',
    name: driver2Code === 'NOR' ? 'Lando Norris' : 'Driver 2',
    lapTime: '1:26.060',
  };

  // Convert distance (0-5891) to SVG track coordinate percentage
  const trackProgressPct = Math.min(100, Math.max(0, (hoveredDistance / 5891) * 100));

  return (
    <div className="space-y-6">
      {/* 1. Comparison Selector Toolbar */}
      <div className="bg-[#12161F] border border-[#2A3245] rounded-xl p-5 space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#E10600]/20 text-[#E10600] border border-[#E10600]/40 uppercase tracking-wider">
                Corner-By-Corner Overlay
              </span>
              <span className="text-xs font-mono text-[#64748B]">Multi-Channel CAN Bus Telemetry</span>
            </div>
            <h2 className="text-xl lg:text-2xl font-display font-black text-white tracking-wide uppercase">
              Dual-Driver Car Telemetry Comparison
            </h2>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <select
              value={session}
              onChange={(e) => setSession(e.target.value)}
              className="bg-[#1C2230] border border-[#2A3245] text-white rounded-lg p-2 focus:outline-none focus:border-[#E10600]"
            >
              <option value="2024_silverstone_q3">Silverstone 2024 — Qualifying Q3</option>
              <option value="2024_spa_q3">Spa-Francorchamps 2024 — Q3</option>
              <option value="2024_monza_race">Monza 2024 — Race Lap 24</option>
            </select>
          </div>
        </div>

        {/* Driver Selectors Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-[#2A3245]">
          {/* Driver 1 (Primary - Cyan) */}
          <div className="p-3 bg-[#1C2230] rounded-xl border border-[#00F0FF]/30 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-[#00F0FF] shadow-md shadow-cyan-500/50" />
              <div>
                <span className="text-[10px] font-mono text-[#00F0FF] font-bold uppercase block">
                  Driver 1 (Primary Baseline)
                </span>
                <select
                  value={driver1Code}
                  onChange={(e) => setDriver1Code(e.target.value)}
                  className="bg-transparent font-mono font-black text-white text-sm focus:outline-none cursor-pointer"
                >
                  <option value="VER" className="bg-[#1C2230]">VER — Max Verstappen (1:25.819)</option>
                  <option value="LEC" className="bg-[#1C2230]">LEC — Charles Leclerc (1:26.120)</option>
                  <option value="HAM" className="bg-[#1C2230]">HAM — Lewis Hamilton (1:26.240)</option>
                </select>
              </div>
            </div>
            <span className="px-2 py-1 bg-[#00F0FF]/15 text-[#00F0FF] font-mono text-xs font-bold rounded">
              CYAN
            </span>
          </div>

          {/* Driver 2 (Comparison - Orange) */}
          <div className="p-3 bg-[#1C2230] rounded-xl border border-[#FF8000]/30 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-[#FF8000] shadow-md shadow-orange-500/50" />
              <div>
                <span className="text-[10px] font-mono text-[#FF8000] font-bold uppercase block">
                  Driver 2 (Delta Comparison)
                </span>
                <select
                  value={driver2Code}
                  onChange={(e) => setDriver2Code(e.target.value)}
                  className="bg-transparent font-mono font-black text-white text-sm focus:outline-none cursor-pointer"
                >
                  <option value="NOR" className="bg-[#1C2230]">NOR — Lando Norris (1:26.060)</option>
                  <option value="PIA" className="bg-[#1C2230]">PIA — Oscar Piastri (1:26.310)</option>
                  <option value="SAI" className="bg-[#1C2230]">SAI — Carlos Sainz (1:26.450)</option>
                  <option value="RUS" className="bg-[#1C2230]">RUS — George Russell (1:26.180)</option>
                </select>
              </div>
            </div>
            <span className="px-2 py-1 bg-[#FF8000]/15 text-[#FF8000] font-mono text-xs font-bold rounded">
              PAPAYA
            </span>
          </div>
        </div>
      </div>

      {/* 2. Synchronized Multi-Trace Charts */}
      <TelemetryOverlayChart
        telemetryData={telemetryData}
        driver1={driver1Meta}
        driver2={driver2Meta}
        onHoverDistance={(dist) => setHoveredDistance(dist)}
      />

      {/* 3. Interactive Synchronized Track Map Scrubber & Corner Delta Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Track Layout SVG Map with Scrubber Dot */}
        <div className="lg:col-span-6 bg-[#12161F] border border-[#2A3245] rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#2A3245] pb-2">
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-[#E10600]" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Synchronized Circuit Map</h3>
            </div>
            <span className="text-xs font-mono text-[#00F0FF] font-bold tabular-nums">
              {Math.round(hoveredDistance)} meters ({trackProgressPct.toFixed(1)}%)
            </span>
          </div>

          {/* Circuit SVG Path */}
          <div className="relative h-64 bg-[#151922] rounded-xl p-4 flex items-center justify-center border border-[#2A3245]/50 overflow-hidden">
            <svg viewBox="0 0 600 350" className="w-full h-full stroke-[#2A3245] fill-none">
              {/* Circuit Outline Path */}
              <path
                d="M 120 280 C 60 280, 50 150, 110 100 C 180 50, 320 60, 420 80 C 490 95, 540 140, 530 200 C 520 260, 440 270, 380 250 C 320 230, 260 270, 210 280 Z"
                strokeWidth="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="stroke-[#2A3245]"
              />

              {/* DRS Zones Highlight */}
              <path
                d="M 180 50 C 260 55, 340 65, 420 80"
                strokeWidth="10"
                strokeLinecap="round"
                className="stroke-[#7C4DFF]"
              />

              {/* Turn Labels */}
              <text x="100" y="80" fill="#94A3B8" fontSize="11" fontFamily="monospace">T1 Copse</text>
              <text x="320" y="45" fill="#94A3B8" fontSize="11" fontFamily="monospace">T9 Maggotts</text>
              <text x="480" y="70" fill="#94A3B8" fontSize="11" fontFamily="monospace">T11 Chapel</text>
              <text x="540" y="210" fill="#94A3B8" fontSize="11" fontFamily="monospace">T15 Stowe</text>
              <text x="210" y="305" fill="#94A3B8" fontSize="11" fontFamily="monospace">T18 Club</text>

              {/* Synchronized Animated Position Marker Dot */}
              <circle
                cx={120 + (trackProgressPct * 4)}
                cy={150 + Math.sin(trackProgressPct * 0.1) * 80}
                r="7"
                fill="#00F0FF"
                className="shadow-2xl animate-pulse"
                stroke="#FFFFFF"
                strokeWidth="2"
              />
            </svg>
          </div>

          <p className="text-[11px] font-mono text-[#64748B] text-center">
            Scrubbing across the telemetry traces moves the cyan position marker along the circuit path in real-time.
          </p>
        </div>

        {/* Corner Delta Analysis Summary Cards */}
        <div className="lg:col-span-6 bg-[#12161F] border border-[#2A3245] rounded-xl p-5 space-y-4">
          <div className="border-b border-[#2A3245] pb-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">Corner Delta & Micro-Sector Analysis</h3>
            <p className="text-xs font-mono text-[#64748B]">Automated key apex performance comparison</p>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 bg-[#1C2230] rounded-xl border border-[#2A3245]/60 flex items-center justify-between">
              <div>
                <span className="text-[#00F0FF] font-bold block text-sm">Hangar Straight Speed Trap</span>
                <span className="text-[11px] text-[#94A3B8]">Max top speed trap at 4,100m</span>
              </div>
              <div className="text-right">
                <span className="font-black text-white text-sm">NOR +3.8 km/h</span>
                <span className="block text-[10px] text-[#64748B]">332.4 vs 328.6 km/h</span>
              </div>
            </div>

            <div className="p-3 bg-[#1C2230] rounded-xl border border-[#2A3245]/60 flex items-center justify-between">
              <div>
                <span className="text-[#00F0FF] font-bold block text-sm">Turn 9 (Copse) High-Speed Apex</span>
                <span className="text-[11px] text-[#94A3B8]">Minimum apex speed carried through corner</span>
              </div>
              <div className="text-right">
                <span className="font-black text-amber-400 text-sm">VER +4.2 km/h</span>
                <span className="block text-[10px] text-[#64748B]">264.1 vs 259.9 km/h</span>
              </div>
            </div>

            <div className="p-3 bg-[#1C2230] rounded-xl border border-[#2A3245]/60 flex items-center justify-between">
              <div>
                <span className="text-[#00F0FF] font-bold block text-sm">Turn 15 (Stowe) Braking Point</span>
                <span className="text-[11px] text-[#94A3B8]">Braking commitment zone delta</span>
              </div>
              <div className="text-right">
                <span className="font-black text-white text-sm">NOR brakes 7m later</span>
                <span className="block text-[10px] text-emerald-400">Gains +0.065s on entry</span>
              </div>
            </div>

            <div className="p-3 bg-[#1C2230] rounded-xl border border-[#2A3245]/60 flex items-center justify-between">
              <div>
                <span className="text-[#00F0FF] font-bold block text-sm">Turn 18 (Club) Throttle Pick-Up</span>
                <span className="text-[11px] text-[#94A3B8]">Progressive traction application</span>
              </div>
              <div className="text-right">
                <span className="font-black text-amber-400 text-sm">VER 100% 12m earlier</span>
                <span className="block text-[10px] text-emerald-400">Gains +0.120s on exit straight</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
