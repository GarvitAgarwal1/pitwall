import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Search,
  Trophy,
  Navigation,
  Clock,
  Gauge,
  Flag,
  Zap,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Calendar,
  Layers,
  Sliders,
  Compass,
  ArrowRight,
  ArrowLeft,
  ShieldAlert,
  Activity,
  Maximize2,
  Columns,
  Grid,
} from 'lucide-react';
import Modal from '../components/common/Modal';
import { OFFICIAL_CIRCUITS } from '../data/circuitsData';

export { OFFICIAL_CIRCUITS };

/**
 * Formula-Timer Inspired Circuits & Telemetry Atlas
 * Displays Formula 1 championship circuits with authentic technical layouts,
 * turn-by-turn corner callouts, sector-by-sector engineering dossiers,
 * aerodynamic downforce setups, tyre stress ratings, and historical honor rolls.
 */
export default function CircuitsPage({ onNavigate, theme = 'dark' }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('ALL');
  const [viewMode, setViewMode] = useState('blueprint'); // 'blueprint' | 'grid'
  const [activeCircuitId, setActiveCircuitId] = useState('albert_park');
  const [modalCircuit, setModalCircuit] = useState(null);
  const [showAllWinners, setShowAllWinners] = useState(false);

  // Filter circuits by region & search query
  const filteredCircuits = useMemo(() => {
    return OFFICIAL_CIRCUITS.filter((c) => {
      if (selectedRegion !== 'ALL' && c.region !== selectedRegion) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          c.circuit_name.toLowerCase().includes(q) ||
          c.locality.toLowerCase().includes(q) ||
          c.country.toLowerCase().includes(q) ||
          c.lap_record.driver.toLowerCase().includes(q) ||
          c.official_title?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [selectedRegion, searchQuery]);

  // Selected spotlight circuit for blueprint view
  const activeCircuit = useMemo(() => {
    const found = OFFICIAL_CIRCUITS.find((c) => c.circuit_id === activeCircuitId);
    return found || filteredCircuits[0] || OFFICIAL_CIRCUITS[0];
  }, [activeCircuitId, filteredCircuits]);

  // Active circuit index in calendar order for Prev/Next navigation
  const currentIndex = useMemo(() => {
    return OFFICIAL_CIRCUITS.findIndex((c) => c.circuit_id === activeCircuit.circuit_id);
  }, [activeCircuit]);

  const prevCircuit = OFFICIAL_CIRCUITS[(currentIndex - 1 + OFFICIAL_CIRCUITS.length) % OFFICIAL_CIRCUITS.length];
  const nextCircuit = OFFICIAL_CIRCUITS[(currentIndex + 1) % OFFICIAL_CIRCUITS.length];

  return (
    <div className="space-y-6">
      {/* =========================================================================
          1. HEADER TOOLBAR & TELEMETRY CONTROLS (FORMULA-TIMER STYLE)
          ========================================================================= */}
      <div className="bg-white dark:bg-[#12161F] border border-slate-200 dark:border-[#2A3245] rounded-2xl p-5 sm:p-6 shadow-sm dark:shadow-xl transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#E10600]/15 text-[#E10600] border border-[#E10600]/30 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E10600] animate-pulse" />
                Formula 1 Circuits 2026
              </span>
              <span className="text-xs font-mono text-slate-500 dark:text-[#64748B]">
                24 Championship Venues • Technical Layouts, Lap Records & Sector Analysis
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-display font-black text-slate-900 dark:text-white tracking-wide uppercase">
              Championship Circuits Directory
            </h1>
            {/* Formula-Timer signature red accent bar */}
            <div className="h-1 w-20 bg-[#E10600] rounded-full mt-2" />
          </div>

          {/* Right Toolbar Controls: Search & View Mode Switcher */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Box */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 dark:text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search circuit, country, record..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#1C2230] border border-slate-200 dark:border-[#2A3245] rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#64748B] focus:outline-none focus:border-[#E10600] transition-colors"
              />
            </div>

            {/* View Mode Toggle (Blueprint vs Grid) */}
            <div className="flex items-center bg-slate-100 dark:bg-[#1C2230] p-1 rounded-xl border border-slate-200 dark:border-[#2A3245] shrink-0">
              <button
                onClick={() => setViewMode('blueprint')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  viewMode === 'blueprint'
                    ? 'bg-[#E10600] text-white font-bold shadow-sm'
                    : 'text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Interactive Telemetry Blueprint"
              >
                <Columns className="w-3.5 h-3.5" />
                <span>Blueprint</span>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  viewMode === 'grid'
                    ? 'bg-[#E10600] text-white font-bold shadow-sm'
                    : 'text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Full Grid Directory"
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Grid Atlas</span>
              </button>
            </div>
          </div>
        </div>

        {/* Region Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-4 mt-4 border-t border-slate-100 dark:border-[#2A3245]">
          {['ALL', 'Europe', 'Americas', 'Middle East', 'Asia & Pacific'].map((reg) => (
            <button
              key={reg}
              onClick={() => setSelectedRegion(reg)}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                selectedRegion === reg
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-100 dark:bg-[#1C2230] text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-[#2A3245]'
              }`}
            >
              {reg.toUpperCase()}
            </button>
          ))}
          <span className="ml-auto text-xs font-mono text-slate-500 dark:text-[#64748B] hidden sm:inline">
            Showing {filteredCircuits.length} of {OFFICIAL_CIRCUITS.length} Grand Prix Circuits
          </span>
        </div>
      </div>

      {/* =========================================================================
          2. VIEW MODE A: FORMULA-TIMER SPOTLIGHT TELEMETRY BLUEPRINT
          ========================================================================= */}
      {viewMode === 'blueprint' && (
        <div className="space-y-6">
          {/* Horizontal Circuit Ribbon Selector */}
          <div className="bg-white dark:bg-[#12161F] border border-slate-200 dark:border-[#2A3245] rounded-2xl p-3 shadow-sm dark:shadow-xl transition-colors">
            <div className="text-[10px] font-mono text-slate-500 dark:text-[#64748B] mb-2 px-1 uppercase tracking-wider flex items-center justify-between">
              <span>Select Grand Prix Weekend Venue</span>
              <span className="text-[#E10600] font-bold">2026 Calendar Order (Rounds 01–24)</span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-[#2A3245]">
              {filteredCircuits.map((c) => {
                const isSelected = activeCircuit?.circuit_id === c.circuit_id;
                return (
                  <button
                    key={c.circuit_id}
                    onClick={() => {
                      setActiveCircuitId(c.circuit_id);
                      setShowAllWinners(false);
                    }}
                    className={`shrink-0 flex items-center gap-2.5 px-3 py-2 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-red-50 dark:bg-[#1C2230] border-[#E10600] ring-1 ring-[#E10600] shadow-sm'
                        : 'bg-slate-50 dark:bg-[#151922] border-slate-200 dark:border-[#2A3245] hover:border-slate-300 dark:hover:border-[#64748B]'
                    }`}
                  >
                    <span className="text-base">{c.flag}</span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-mono font-bold ${isSelected ? 'text-[#E10600]' : 'text-slate-500 dark:text-[#64748B]'}`}>
                          R{String(c.round_2026).padStart(2, '0')}
                        </span>
                        <span className={`text-xs font-bold truncate max-w-[110px] ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                          {c.locality}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 dark:text-[#64748B] block truncate max-w-[110px]">
                        {c.length_km} km • {c.turns} Turns
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Active Circuit Telemetry Blueprint Hub */}
          {activeCircuit && (
            <div className="space-y-6">
              {/* Circuit Header Card */}
              <div className="bg-white dark:bg-[#12161F] border border-slate-200 dark:border-[#2A3245] rounded-2xl p-6 shadow-sm dark:shadow-xl transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-[#2A3245]">
                  <div className="flex items-start sm:items-center gap-4">
                    <span className="text-4xl sm:text-5xl p-2 rounded-2xl bg-slate-100 dark:bg-[#1C2230] border border-slate-200 dark:border-[#2A3245] shrink-0 shadow-sm">
                      {activeCircuit.flag}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#E10600] text-white">
                          On 2026 Calendar • Round {activeCircuit.round_2026}
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-500 dark:text-[#94A3B8] uppercase">
                          {activeCircuit.country} • {activeCircuit.region}
                        </span>
                        <span className="text-xs font-mono text-[#00D26A] font-bold">
                          {activeCircuit.direction}
                        </span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-display font-black text-slate-900 dark:text-white tracking-tight">
                        {activeCircuit.circuit_name}
                      </h2>
                      <p className="text-xs font-mono text-slate-500 dark:text-[#64748B] mt-0.5">
                        {activeCircuit.official_title}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-start lg:self-auto font-mono text-xs">
                    <div className="bg-slate-50 dark:bg-[#151922] p-3 rounded-xl border border-slate-200 dark:border-[#2A3245] text-right">
                      <span className="block text-slate-500 dark:text-[#64748B] text-[10px]">2026 RACE WEEKEND</span>
                      <span className="text-slate-900 dark:text-[#00F0FF] font-black text-sm">{activeCircuit.date_2026}</span>
                    </div>
                    <button
                      onClick={() => setModalCircuit(activeCircuit)}
                      className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-100 dark:bg-[#1C2230] hover:bg-[#E10600] hover:text-white dark:hover:bg-[#E10600] border border-slate-200 dark:border-[#2A3245] text-slate-700 dark:text-slate-200 font-bold transition-all shadow-sm"
                      title="Expand Technical Blueprint"
                    >
                      <Maximize2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Inspect Full Screen</span>
                    </button>
                  </div>
                </div>

                {/* ==================== TECHNICAL TRACK LAYOUT CANVAS (FORMULA-TIMER / FIA STYLE) ==================== */}
                <div className="mt-6 rounded-2xl bg-slate-50 dark:bg-[#0D1117] border border-slate-200 dark:border-[#2A3245] p-5 sm:p-7 relative shadow-inner overflow-hidden transition-colors">
                  {/* Top Canvas Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-slate-200 dark:border-[#2A3245]/80 text-xs font-mono gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-[10px] font-bold uppercase tracking-wider">
                        FIA Technical Circuit Geometry
                      </span>
                      <span className="text-slate-600 dark:text-slate-300 font-semibold">
                        Turns 01 – {String(activeCircuit.turns).padStart(2, '0')} ({activeCircuit.turns_breakdown?.right || 0} Right, {activeCircuit.turns_breakdown?.left || 0} Left)
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-1 rounded text-[10px] font-mono font-bold bg-[#00D26A] text-black shadow-sm flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
                        {activeCircuit.drs_zones} DRS {activeCircuit.drs_zones > 1 ? 'ZONES' : 'ZONE'}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 border border-fuchsia-500/30 font-bold">
                        V-MAX RADAR: {activeCircuit.top_speed_kmh} KM/H
                      </span>
                    </div>
                  </div>

                  {/* Main Authentic High-Resolution Circuit Diagram Image */}
                  <div className="w-full h-80 sm:h-[420px] flex items-center justify-center py-2 relative">
                    <img
                      src={activeCircuit.map_image}
                      alt={`${activeCircuit.circuit_name} Official Track Layout, Sectors, Corners & DRS Zones`}
                      className="max-h-full max-w-full object-contain filter contrast-105 drop-shadow-md select-none transition-transform duration-300 hover:scale-[1.02]"
                      onError={(e) => {
                        if (activeCircuit.cdn_fallback && e.currentTarget.src !== activeCircuit.cdn_fallback) {
                          e.currentTarget.src = activeCircuit.cdn_fallback;
                        }
                      }}
                    />
                  </div>

                  {/* Formula-Timer Track Legend Bar */}
                  <div className="mt-4 pt-3 border-t border-slate-200 dark:border-[#2A3245]/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 rounded bg-[#00D26A] flex items-center justify-center text-[9px] font-bold text-black shrink-0">
                        ✓
                      </span>
                      <div>
                        <span className="font-bold block text-slate-900 dark:text-white">
                          {activeCircuit.drs_zones} DRS Zones
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-[#64748B]">Green dashed lines</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 rounded-full bg-[#E6007A] shrink-0" />
                      <div>
                        <span className="font-bold block text-slate-900 dark:text-white">Speed Trap</span>
                        <span className="text-[10px] text-slate-500 dark:text-[#64748B]">Magenta radar point</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="w-2 h-2 rounded-full bg-[#E10600]" />
                        <span className="w-2 h-2 rounded-full bg-[#00D2FF]" />
                        <span className="w-2 h-2 rounded-full bg-[#FFD700]" />
                      </div>
                      <div>
                        <span className="font-bold block text-slate-900 dark:text-white">Sectors 1, 2, 3</span>
                        <span className="text-[10px] text-slate-500 dark:text-[#64748B]">Timing split boundaries</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-base shrink-0">🏁</span>
                      <div>
                        <span className="font-bold block text-slate-900 dark:text-white">Start / Finish Line</span>
                        <span className="text-[10px] text-slate-500 dark:text-[#64748B]">Sector boundary loop</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ==================== 8-POINT PERFORMANCE TELEMETRY MATRIX ==================== */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                  {/* Metric 1: Track Length */}
                  <div className="bg-slate-50 dark:bg-[#1C2230] p-4 rounded-xl border border-slate-200 dark:border-[#2A3245] transition-colors">
                    <span className="block text-slate-500 dark:text-[#64748B] text-[10px] font-mono uppercase mb-1">
                      Circuit Length
                    </span>
                    <span className="text-slate-900 dark:text-white font-black text-lg font-mono">
                      {activeCircuit.length_km} <span className="text-xs font-normal text-slate-500">km</span>
                    </span>
                  </div>

                  {/* Metric 2: Race Distance & Laps */}
                  <div className="bg-slate-50 dark:bg-[#1C2230] p-4 rounded-xl border border-slate-200 dark:border-[#2A3245] transition-colors">
                    <span className="block text-slate-500 dark:text-[#64748B] text-[10px] font-mono uppercase mb-1">
                      Race Distance
                    </span>
                    <span className="text-[#00D26A] font-black text-lg font-mono">
                      {activeCircuit.laps} <span className="text-xs font-normal text-slate-500">Laps</span>
                    </span>
                    <span className="block text-[10px] font-mono text-slate-500 dark:text-[#64748B]">
                      {activeCircuit.race_distance_km} km
                    </span>
                  </div>

                  {/* Metric 3: Total Corners & Breakdown */}
                  <div className="bg-slate-50 dark:bg-[#1C2230] p-4 rounded-xl border border-slate-200 dark:border-[#2A3245] transition-colors">
                    <span className="block text-slate-500 dark:text-[#64748B] text-[10px] font-mono uppercase mb-1">
                      Total Turns
                    </span>
                    <span className="text-slate-900 dark:text-white font-black text-lg font-mono">
                      {activeCircuit.turns} <span className="text-xs font-normal text-slate-500">Corners</span>
                    </span>
                    <span className="block text-[10px] font-mono text-slate-500 dark:text-[#64748B]">
                      {activeCircuit.turns_breakdown?.right} Right • {activeCircuit.turns_breakdown?.left} Left
                    </span>
                  </div>

                  {/* Metric 4: DRS Zones */}
                  <div className="bg-slate-50 dark:bg-[#1C2230] p-4 rounded-xl border border-slate-200 dark:border-[#2A3245] transition-colors">
                    <span className="block text-slate-500 dark:text-[#64748B] text-[10px] font-mono uppercase mb-1">
                      DRS Deployment
                    </span>
                    <span className="text-emerald-600 dark:text-[#00D26A] font-black text-lg font-mono">
                      {activeCircuit.drs_zones} <span className="text-xs font-normal text-slate-500">Zones</span>
                    </span>
                    <span className="block text-[10px] font-mono text-slate-500 dark:text-[#64748B]">
                      Straight mode loops: {activeCircuit.drs_zones}
                    </span>
                  </div>

                  {/* Metric 5: Downforce Setup */}
                  <div className="bg-slate-50 dark:bg-[#1C2230] p-4 rounded-xl border border-slate-200 dark:border-[#2A3245] transition-colors">
                    <span className="block text-slate-500 dark:text-[#64748B] text-[10px] font-mono uppercase mb-1">
                      Aero Downforce
                    </span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-black text-base font-mono">
                      {activeCircuit.downforce}
                    </span>
                    <span className="block text-[10px] font-mono text-slate-500 dark:text-[#64748B]">
                      Wing package setup
                    </span>
                  </div>

                  {/* Metric 6: Full Throttle % */}
                  <div className="bg-slate-50 dark:bg-[#1C2230] p-4 rounded-xl border border-slate-200 dark:border-[#2A3245] transition-colors">
                    <span className="block text-slate-500 dark:text-[#64748B] text-[10px] font-mono uppercase mb-1">
                      Full Throttle
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[#E10600] font-black text-lg font-mono">
                        {activeCircuit.full_throttle_pct}%
                      </span>
                      <div className="w-12 bg-slate-200 dark:bg-[#0B0E14] h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#E10600] h-full rounded-full"
                          style={{ width: `${activeCircuit.full_throttle_pct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Metric 7: Tyre Abrasion / Stress */}
                  <div className="bg-slate-50 dark:bg-[#1C2230] p-4 rounded-xl border border-slate-200 dark:border-[#2A3245] transition-colors">
                    <span className="block text-slate-500 dark:text-[#64748B] text-[10px] font-mono uppercase mb-1">
                      Tyre Abrasion Stress
                    </span>
                    <span className="text-amber-500 font-bold text-sm tracking-widest block font-mono">
                      {'★'.repeat(activeCircuit.tyre_stress)}
                      {'☆'.repeat(5 - activeCircuit.tyre_stress)}
                    </span>
                    <span className="block text-[10px] font-mono text-slate-500 dark:text-[#64748B]">
                      Level {activeCircuit.tyre_stress} of 5
                    </span>
                  </div>

                  {/* Metric 8: Gear Shifts per Lap */}
                  <div className="bg-slate-50 dark:bg-[#1C2230] p-4 rounded-xl border border-slate-200 dark:border-[#2A3245] transition-colors">
                    <span className="block text-slate-500 dark:text-[#64748B] text-[10px] font-mono uppercase mb-1">
                      Gear Changes / Lap
                    </span>
                    <span className="text-purple-600 dark:text-purple-400 font-black text-lg font-mono">
                      ~{activeCircuit.gear_changes}
                    </span>
                    <span className="block text-[10px] font-mono text-slate-500 dark:text-[#64748B]">
                      Sequential shifts
                    </span>
                  </div>
                </div>

                {/* ==================== OFFICIAL RACE LAP RECORD CHRONOMETER ==================== */}
                <div className="mt-6 p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="p-3 rounded-xl bg-amber-500/20 text-amber-500 border border-amber-500/40 shrink-0">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 uppercase font-bold tracking-wider">
                        Official Grand Prix Race Lap Record
                      </span>
                      <div className="text-2xl sm:text-3xl font-mono font-black text-slate-900 dark:text-white tracking-wide">
                        {activeCircuit.lap_record.time}
                      </div>
                    </div>
                  </div>

                  <div className="sm:text-right font-mono text-xs">
                    <span className="text-slate-900 dark:text-white font-bold text-sm block">
                      {activeCircuit.lap_record.driver}
                    </span>
                    <span className="text-slate-500 dark:text-[#94A3B8] text-xs">
                      {activeCircuit.lap_record.team} • {activeCircuit.lap_record.year}
                    </span>
                    {activeCircuit.lap_record.avg_speed && (
                      <span className="block text-[10px] text-amber-600 dark:text-amber-400 font-bold mt-0.5">
                        Avg Lap Speed: {activeCircuit.lap_record.avg_speed}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* ==================== SECTOR-BY-SECTOR IN-DEPTH ENGINEERING DOSSIER ==================== */}
              <div className="bg-white dark:bg-[#12161F] border border-slate-200 dark:border-[#2A3245] rounded-2xl p-6 shadow-sm dark:shadow-xl transition-colors space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#2A3245]">
                  <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-[#E10600]" />
                    <h3 className="font-bold text-sm sm:text-base uppercase tracking-wider text-slate-900 dark:text-white">
                      Track Sectors & Aerodynamic Analysis
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-slate-500 dark:text-[#64748B]">
                    Formula-Timer Signature Sector Breakdown
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
                  {/* Sector 1 */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#151922] border-t-4 border-[#E10600] border-x border-b border-slate-200 dark:border-x-[#2A3245] dark:border-b-[#2A3245] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E10600]/15 text-[#E10600]">
                        SECTOR 1
                      </span>
                      <span className="text-slate-500 text-[11px] font-bold">
                        {activeCircuit.sectors?.s1?.distance_km} km
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs">
                      {activeCircuit.sectors?.s1?.turns}
                    </h4>
                    <span className="text-[11px] text-slate-700 dark:text-slate-300 font-semibold block">
                      {activeCircuit.sectors?.s1?.focus}
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-[#94A3B8] leading-relaxed">
                      {activeCircuit.sectors?.s1?.description}
                    </p>
                  </div>

                  {/* Sector 2 */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#151922] border-t-4 border-[#00D2FF] border-x border-b border-slate-200 dark:border-x-[#2A3245] dark:border-b-[#2A3245] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#00D2FF]/15 text-[#00D2FF]">
                        SECTOR 2
                      </span>
                      <span className="text-slate-500 text-[11px] font-bold">
                        {activeCircuit.sectors?.s2?.distance_km} km
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs">
                      {activeCircuit.sectors?.s2?.turns}
                    </h4>
                    <span className="text-[11px] text-slate-700 dark:text-slate-300 font-semibold block">
                      {activeCircuit.sectors?.s2?.focus}
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-[#94A3B8] leading-relaxed">
                      {activeCircuit.sectors?.s2?.description}
                    </p>
                  </div>

                  {/* Sector 3 */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#151922] border-t-4 border-[#FFD700] border-x border-b border-slate-200 dark:border-x-[#2A3245] dark:border-b-[#2A3245] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-500">
                        SECTOR 3
                      </span>
                      <span className="text-slate-500 text-[11px] font-bold">
                        {activeCircuit.sectors?.s3?.distance_km} km
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs">
                      {activeCircuit.sectors?.s3?.turns}
                    </h4>
                    <span className="text-[11px] text-slate-700 dark:text-slate-300 font-semibold block">
                      {activeCircuit.sectors?.s3?.focus}
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-[#94A3B8] leading-relaxed">
                      {activeCircuit.sectors?.s3?.description}
                    </p>
                  </div>
                </div>

                {/* DRS Activation & Speed Trap Telemetry Card */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#151922] border border-slate-200 dark:border-[#2A3245] space-y-2.5 font-mono text-xs">
                  <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold pb-2 border-b border-slate-200 dark:border-[#2A3245]">
                    <Zap className="w-4 h-4 text-[#00D26A]" />
                    <span>Telemetry Sensors & Detection Coordinates</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-white dark:bg-[#1C2230] p-3 rounded-lg border border-slate-200 dark:border-[#2A3245]">
                      <span className="text-[10px] text-[#00D26A] font-bold block mb-1">DRS ACTIVATION ZONES</span>
                      <span className="text-slate-700 dark:text-slate-200 text-xs block leading-relaxed">{activeCircuit.drs_details}</span>
                    </div>
                    <div className="bg-white dark:bg-[#1C2230] p-3 rounded-lg border border-slate-200 dark:border-[#2A3245]">
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block mb-1">DETECTION RADAR POINTS</span>
                      <span className="text-slate-700 dark:text-slate-200 text-xs block leading-relaxed">{activeCircuit.drs_detection}</span>
                    </div>
                    <div className="bg-white dark:bg-[#1C2230] p-3 rounded-lg border border-slate-200 dark:border-[#2A3245]">
                      <span className="text-[10px] text-fuchsia-600 dark:text-fuchsia-400 font-bold block mb-1">SPEED TRAP LOCATION</span>
                      <span className="text-slate-700 dark:text-slate-200 text-xs block leading-relaxed">{activeCircuit.speed_trap}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ==================== HISTORICAL HONOR ROLL & RECENT WINNERS ==================== */}
              <div className="bg-white dark:bg-[#12161F] border border-slate-200 dark:border-[#2A3245] rounded-2xl p-6 shadow-sm dark:shadow-xl transition-colors space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-[#2A3245] gap-2">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-500" />
                    <h3 className="font-bold text-sm sm:text-base uppercase tracking-wider text-slate-900 dark:text-white">
                      Grand Prix History & Honor Roll
                    </h3>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-mono text-slate-500 dark:text-[#64748B]">
                    <span>Inaugural GP: <strong className="text-slate-900 dark:text-white">{activeCircuit.first_grand_prix}</strong></span>
                    <span>•</span>
                    <span>Most Wins: <strong className="text-[#00F0FF]">{activeCircuit.most_successful_driver}</strong></span>
                  </div>
                </div>

                {/* Winners Table */}
                <div className="space-y-2">
                  {(showAllWinners ? activeCircuit.past_winners : activeCircuit.past_winners.slice(0, 3)).map((w) => (
                    <div
                      key={w.year}
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#151922] border border-slate-200 dark:border-[#2A3245] flex items-center justify-between text-xs font-mono hover:border-slate-300 dark:hover:border-[#64748B] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 rounded bg-slate-200 dark:bg-[#1C2230] text-slate-900 dark:text-[#00F0FF] font-black text-xs">
                          {w.year}
                        </span>
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white text-sm block">{w.winner}</span>
                          <span className="text-[11px] text-slate-500 dark:text-[#94A3B8]">{w.team}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-slate-700 dark:text-slate-300 font-bold block">{w.time}</span>
                        <span className="text-[10px] text-slate-400 dark:text-[#64748B]">{w.laps} race laps completed</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Formula-Timer "Show all winners" toggle */}
                {activeCircuit.past_winners.length > 3 && (
                  <div className="pt-2 text-center">
                    <button
                      onClick={() => setShowAllWinners(!showAllWinners)}
                      className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#1C2230] hover:bg-slate-200 dark:hover:bg-[#2A3245] border border-slate-200 dark:border-[#2A3245] text-xs font-mono font-bold text-slate-700 dark:text-slate-200 transition-colors"
                    >
                      {showAllWinners
                        ? 'Show Recent Winners (Collapse)'
                        : `Show All ${activeCircuit.past_winners.length} Verified Winners`}
                    </button>
                  </div>
                )}
              </div>

              {/* ==================== FORMULA-TIMER PREV / NEXT CIRCUIT NAVIGATION ==================== */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Previous Circuit */}
                <button
                  onClick={() => {
                    setActiveCircuitId(prevCircuit.circuit_id);
                    setShowAllWinners(false);
                    window.scrollTo({ top: 180, behavior: 'smooth' });
                  }}
                  className="p-4 rounded-2xl bg-white dark:bg-[#12161F] border border-slate-200 dark:border-[#2A3245] hover:border-[#E10600] flex items-center justify-between text-left group shadow-sm transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-[#1C2230] group-hover:bg-[#E10600] group-hover:text-white transition-colors text-slate-600 dark:text-slate-300">
                      <ArrowLeft className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 dark:text-[#64748B] uppercase block">
                        Previous Round {prevCircuit.round_2026}
                      </span>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-[#E10600] transition-colors">
                        {prevCircuit.flag} {prevCircuit.circuit_name}
                      </h4>
                    </div>
                  </div>
                </button>

                {/* Next Circuit */}
                <button
                  onClick={() => {
                    setActiveCircuitId(nextCircuit.circuit_id);
                    setShowAllWinners(false);
                    window.scrollTo({ top: 180, behavior: 'smooth' });
                  }}
                  className="p-4 rounded-2xl bg-white dark:bg-[#12161F] border border-slate-200 dark:border-[#2A3245] hover:border-[#E10600] flex items-center justify-between text-right group shadow-sm transition-all"
                >
                  <div className="ml-auto flex items-center gap-3 flex-row-reverse">
                    <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-[#1C2230] group-hover:bg-[#E10600] group-hover:text-white transition-colors text-slate-600 dark:text-slate-300">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 dark:text-[#64748B] uppercase block">
                        Next Round {nextCircuit.round_2026}
                      </span>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-[#E10600] transition-colors">
                        {nextCircuit.circuit_name} {nextCircuit.flag}
                      </h4>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          3. VIEW MODE B: FULL PADDOCK GRID DIRECTORY (FORMULA-TIMER 3-COLUMN CARDS)
          ========================================================================= */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCircuits.map((circuit) => {
            const latestWinner = circuit.past_winners[0];

            return (
              <div
                key={circuit.circuit_id}
                onClick={() => setModalCircuit(circuit)}
                className="bg-white dark:bg-[#12161F] border border-slate-200 dark:border-[#2A3245] rounded-2xl p-5 hover:border-[#E10600] transition-all cursor-pointer group shadow-sm hover:shadow-xl flex flex-col justify-between"
              >
                <div>
                  {/* Track Diagram Header Area */}
                  <div className="h-48 rounded-xl bg-slate-50 dark:bg-[#0D1117] border border-slate-200 dark:border-[#2A3245] flex items-center justify-center p-3 mb-4 relative overflow-hidden group-hover:border-[#E10600]/60 transition-all shadow-inner">
                    <img
                      src={circuit.map_image}
                      alt={`${circuit.circuit_name} Official Track Layout & DRS Zones`}
                      className="w-full h-full max-h-40 object-contain filter contrast-105 transition-transform duration-300 group-hover:scale-105 select-none"
                      loading="lazy"
                      onError={(e) => {
                        if (circuit.cdn_fallback && e.currentTarget.src !== circuit.cdn_fallback) {
                          e.currentTarget.src = circuit.cdn_fallback;
                        }
                      }}
                    />

                    {/* Formula-Timer Top Badges: "On 2026 Calendar" pill & Flag */}
                    <div className="absolute top-2.5 left-2.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#E10600] text-white shadow-sm">
                        On 2026 calendar
                      </span>
                    </div>

                    <div className="absolute top-2.5 right-2.5">
                      <span className="text-xl p-1 rounded-lg bg-white/90 dark:bg-[#12161F]/90 backdrop-blur-sm border border-slate-200 dark:border-[#2A3245]">
                        {circuit.flag}
                      </span>
                    </div>

                    {/* Sectors overlay */}
                    <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 bg-white/90 dark:bg-[#12161F]/90 backdrop-blur-md px-2 py-0.5 rounded text-[9px] font-mono text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-[#2A3245]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E10600]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00D2FF]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FFD700]" />
                      <span className="ml-1 font-bold">SECTORS</span>
                    </div>

                    {/* DRS pill */}
                    <div className="absolute bottom-2.5 right-2.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#00D26A] text-black shadow-sm flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
                        {circuit.drs_zones} DRS
                      </span>
                    </div>
                  </div>

                  {/* Circuit Title & Location */}
                  <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-[#E10600] transition-colors leading-snug mb-1">
                    {circuit.circuit_name}
                  </h3>
                  <p className="text-xs font-mono text-slate-500 dark:text-[#64748B] mb-3 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#E10600]" />
                    <span>{circuit.locality}, {circuit.country}</span>
                  </p>

                  {/* Key Stats Row (Length, Corners, First GP) */}
                  <div className="grid grid-cols-3 gap-2 py-2.5 border-t border-b border-slate-100 dark:border-[#2A3245]/60 text-center font-mono text-xs">
                    <div>
                      <span className="block text-[10px] text-slate-500 dark:text-[#64748B]">LENGTH</span>
                      <span className="text-slate-900 dark:text-white font-bold">{circuit.length_km} km</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-500 dark:text-[#64748B]">CORNERS</span>
                      <span className="text-slate-900 dark:text-white font-bold">{circuit.turns}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-500 dark:text-[#64748B]">FIRST GP</span>
                      <span className="text-slate-900 dark:text-[#00F0FF] font-bold">{circuit.first_grand_prix}</span>
                    </div>
                  </div>

                  {/* Description Snippet */}
                  <p className="text-[11px] font-mono text-slate-500 dark:text-[#94A3B8] mt-3 line-clamp-2 leading-relaxed">
                    {circuit.sectors?.s1?.description || `${circuit.circuit_name} features ${circuit.turns} corners and ${circuit.drs_zones} DRS zones.`}
                  </p>
                </div>

                {/* Footer with latest winner */}
                <div className="pt-3 mt-3 flex items-center justify-between text-xs font-mono border-t border-slate-100 dark:border-transparent">
                  <div className="flex items-center gap-1.5 truncate">
                    <Trophy className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="text-slate-600 dark:text-[#94A3B8] truncate">
                      {latestWinner ? `${latestWinner.year}: ${latestWinner.winner}` : 'TBD'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-[#64748B] group-hover:text-slate-900 dark:group-hover:text-white transition-colors shrink-0">
                    <span>Blueprint</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =========================================================================
          4. DETAILED CIRCUIT DOSSIER MODAL (FULL TELEMETRY BLUEPRINT)
          ========================================================================= */}
      <Modal
        isOpen={Boolean(modalCircuit)}
        onClose={() => setModalCircuit(null)}
        title={modalCircuit?.circuit_name}
        icon={MapPin}
        maxWidth="max-w-5xl"
      >
        {modalCircuit && (
          <div className="space-y-6">
            {/* Modal Header Meta */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-[#2A3245] gap-3">
              <div className="flex items-center gap-3">
                <span className="text-4xl p-2 rounded-xl bg-slate-100 dark:bg-[#1C2230] border border-slate-200 dark:border-[#2A3245]">
                  {modalCircuit.flag}
                </span>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-lg sm:text-xl">
                    {modalCircuit.locality}, {modalCircuit.country}
                  </h4>
                  <span className="text-xs font-mono text-slate-500 dark:text-[#64748B]">
                    Region: <span className="text-slate-800 dark:text-slate-300 font-semibold">{modalCircuit.region}</span> • 2026 Season Round {modalCircuit.round_2026}
                  </span>
                </div>
              </div>
              <div className="sm:text-right font-mono text-xs bg-slate-50 dark:bg-[#151922] p-2.5 rounded-xl border border-slate-200 dark:border-[#2A3245] self-start sm:self-auto">
                <span className="block text-slate-500 dark:text-[#64748B] text-[10px]">2026 GP RACE DATE</span>
                <span className="text-slate-900 dark:text-[#00F0FF] font-bold text-sm">{modalCircuit.date_2026}</span>
              </div>
            </div>

            {/* Official Technical Layout Canvas */}
            <div className="rounded-2xl bg-slate-50 dark:bg-[#0D1117] border border-slate-200 dark:border-[#2A3245] p-5 sm:p-6 flex flex-col items-center justify-center relative shadow-inner overflow-hidden">
              <div className="w-full flex items-center justify-between pb-3 mb-2 border-b border-slate-200 dark:border-[#2A3245]/80 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-[10px] font-bold uppercase tracking-wider">
                    FIA Technical Layout
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    Turns 01 – {String(modalCircuit.turns).padStart(2, '0')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-[#00D26A] text-black text-[10px] font-bold shadow-sm">
                    {modalCircuit.drs_zones} DRS {modalCircuit.drs_zones > 1 ? 'ZONES' : 'ZONE'}
                  </span>
                </div>
              </div>

              {/* Large Image */}
              <div className="w-full h-72 sm:h-[380px] flex items-center justify-center py-2">
                <img
                  src={modalCircuit.map_image}
                  alt={`${modalCircuit.circuit_name} Official Track Layout, Sectors, Corners & DRS Zones`}
                  className="max-h-full max-w-full object-contain filter contrast-105 drop-shadow-md select-none"
                  onError={(e) => {
                    if (modalCircuit.cdn_fallback && e.currentTarget.src !== modalCircuit.cdn_fallback) {
                      e.currentTarget.src = modalCircuit.cdn_fallback;
                    }
                  }}
                />
              </div>

              {/* Legend */}
              <div className="w-full mt-3 pt-3 border-t border-slate-200 dark:border-[#2A3245]/70 grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px] font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded bg-[#00D26A] flex items-center justify-center text-[9px] font-bold text-black shrink-0">✓</span>
                  <div>
                    <span className="font-bold block text-slate-900 dark:text-white">{modalCircuit.drs_zones} DRS Zones</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Green dashed lines</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#E6007A] shrink-0" />
                  <div>
                    <span className="font-bold block text-slate-900 dark:text-white">Speed Trap</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Magenta radar point</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="w-2 h-2 rounded-full bg-[#E10600]" />
                    <span className="w-2 h-2 rounded-full bg-[#00D2FF]" />
                    <span className="w-2 h-2 rounded-full bg-[#FFD700]" />
                  </div>
                  <div>
                    <span className="font-bold block text-slate-900 dark:text-white">Sectors 1, 2, 3</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Timing split lines</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-base shrink-0">🏁</span>
                  <div>
                    <span className="font-bold block text-slate-900 dark:text-white">Start / Finish</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Sector boundary loop</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-mono text-xs">
              <div className="bg-slate-50 dark:bg-[#1C2230] p-3 rounded-xl border border-slate-200 dark:border-[#2A3245]">
                <span className="block text-slate-500 dark:text-[#64748B] text-[10px]">TRACK LENGTH</span>
                <span className="text-slate-900 dark:text-white font-bold text-sm">{modalCircuit.length_km} km</span>
              </div>
              <div className="bg-slate-50 dark:bg-[#1C2230] p-3 rounded-xl border border-slate-200 dark:border-[#2A3245]">
                <span className="block text-slate-500 dark:text-[#64748B] text-[10px]">TOTAL CORNERS</span>
                <span className="text-slate-900 dark:text-white font-bold text-sm">{modalCircuit.turns} Turns</span>
              </div>
              <div className="bg-slate-50 dark:bg-[#1C2230] p-3 rounded-xl border border-slate-200 dark:border-[#2A3245]">
                <span className="block text-slate-500 dark:text-[#64748B] text-[10px]">RACE DISTANCE</span>
                <span className="text-slate-900 dark:text-[#00F0FF] font-bold text-sm">{modalCircuit.laps} Laps</span>
                <span className="block text-[9px] text-slate-500 dark:text-[#64748B]">({modalCircuit.race_distance_km} km)</span>
              </div>
              <div className="bg-slate-50 dark:bg-[#1C2230] p-3 rounded-xl border border-slate-200 dark:border-[#2A3245]">
                <span className="block text-slate-500 dark:text-[#64748B] text-[10px]">TYRE ABRASION</span>
                <span className="text-amber-500 font-bold text-sm">
                  {'★'.repeat(modalCircuit.tyre_stress)}{'☆'.repeat(5 - modalCircuit.tyre_stress)}
                </span>
                <span className="block text-[9px] text-slate-500 dark:text-[#64748B]">Level {modalCircuit.tyre_stress}/5</span>
              </div>
            </div>

            {/* Official Lap Record Card */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#1C2230] border border-slate-200 dark:border-[#2A3245] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-amber-500/15 text-amber-500 border border-amber-500/30">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-slate-500 dark:text-[#64748B] uppercase">Official Race Lap Record</span>
                  <div className="text-lg font-mono font-black text-slate-900 dark:text-white tracking-wide">
                    {modalCircuit.lap_record.time}
                  </div>
                </div>
              </div>
              <div className="text-right font-mono text-xs">
                <span className="text-slate-900 dark:text-white font-bold block">{modalCircuit.lap_record.driver}</span>
                <span className="text-slate-500 dark:text-[#64748B] text-[11px]">
                  {modalCircuit.lap_record.team} ({modalCircuit.lap_record.year})
                </span>
              </div>
            </div>

            {/* Verified Race Winners */}
            <div>
              <h5 className="font-bold text-slate-900 dark:text-white uppercase text-xs tracking-wider mb-3 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>Recent Grand Prix Winners</span>
              </h5>

              <div className="space-y-2">
                {modalCircuit.past_winners.map((w) => (
                  <div
                    key={w.year}
                    className="p-3 rounded-lg bg-slate-50 dark:bg-[#151922] border border-slate-200 dark:border-[#2A3245] flex items-center justify-between text-xs font-mono"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-[#1C2230] text-slate-900 dark:text-[#00F0FF] font-bold">
                        {w.year}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">{w.winner}</span>
                    </div>
                    <span className="text-slate-600 dark:text-[#94A3B8]">{w.team}</span>
                    <span className="text-slate-400 dark:text-[#64748B] hidden sm:inline">{w.time} ({w.laps} laps)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
