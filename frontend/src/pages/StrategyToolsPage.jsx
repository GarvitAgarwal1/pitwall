import React, { useState, useMemo } from 'react';
import apiClient from '../api/client';
import {
  Cpu,
  Zap,
  TrendingDown,
  Gauge,
  Sliders,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  ReferenceArea,
} from 'recharts';
import { getTyreInfo, getTeamColor } from '../utils/theme';

export default function StrategyToolsPage() {
  const [activeDriver, setActiveDriver] = useState('NOR');
  const [currentLap, setCurrentLap] = useState(24);
  const [totalLaps, setTotalLaps] = useState(57);

  // What-if simulator interactive state
  const [simulatedPitLap, setSimulatedPitLap] = useState(28);
  const [simulatedCompound, setSimulatedCompound] = useState('HARD');
  const [simulatedPitDuration, setSimulatedPitDuration] = useState(2.4);

  // Pit Window Parameters & Calculations
  const pitWindowResult = useMemo(() => {
    // Degradation rate based on compound
    const degRate = simulatedCompound === 'SOFT' ? 0.115 : simulatedCompound === 'MEDIUM' ? 0.078 : 0.048;
    const cliffLap = 34;
    const lapsUntilCliff = Math.max(0, cliffLap - currentLap);

    const earliestPitLap = 25;
    const latestPitLap = 32;
    const recommendedPitLap = 28;

    // Undercut viability
    const gapToCarAhead = 1.85; // seconds behind Russell
    const freshTyrePaceDelta = 1.9; // 1.9s pace gain on fresh tyre out-lap
    const netUndercutAdvantage = freshTyrePaceDelta - gapToCarAhead;

    return {
      degradation_rate: degRate,
      cliff_lap: cliffLap,
      laps_until_cliff: lapsUntilCliff,
      earliest_pit_lap: earliestPitLap,
      latest_pit_lap: latestPitLap,
      recommended_pit_lap: recommendedPitLap,
      undercut_status: netUndercutAdvantage > 0 ? 'HIGHLY_VIABLE' : 'MARGINAL',
      net_advantage: Number(netUndercutAdvantage.toFixed(2)),
      projected_rejoin_pos: 5,
    };
  }, [simulatedCompound, currentLap]);

  // Degradation curve chart data
  const degradationCurveData = useMemo(() => {
    const data = [];
    for (let l = 1; l <= 35; l++) {
      const isPastCliff = l > pitWindowResult.cliff_lap;
      const degPenalty = (l * pitWindowResult.degradation_rate) + (isPastCliff ? (l - pitWindowResult.cliff_lap) * 0.45 : 0);
      data.push({
        lap: l,
        lap_time: Number((80.8 + degPenalty).toFixed(3)),
        cliff_threshold: 83.0,
      });
    }
    return data;
  }, [pitWindowResult]);

  // Race Result Predictor finishing order forecast
  const predictedOrder = [
    { predicted_pos: 1, current_pos: 1, code: 'VER', team: 'redbull', win_pct: 78, podium_pct: 99, confidence: 92, stops: 1, compound: 'HARD', tyre_age: 18, delta_to_win: '0.000s' },
    { predicted_pos: 2, current_pos: 3, code: 'NOR', team: 'mclaren', win_pct: 18, podium_pct: 94, confidence: 88, stops: 1, compound: 'HARD', tyre_age: 16, delta_to_win: '+4.120s' },
    { predicted_pos: 3, current_pos: 2, code: 'LEC', team: 'ferrari', win_pct: 4, podium_pct: 82, confidence: 84, stops: 1, compound: 'MEDIUM', tyre_age: 19, delta_to_win: '+8.450s' },
    { predicted_pos: 4, current_pos: 4, code: 'PIA', team: 'mclaren', win_pct: 0, podium_pct: 45, confidence: 81, stops: 1, compound: 'HARD', tyre_age: 15, delta_to_win: '+14.200s' },
    { predicted_pos: 5, current_pos: 6, code: 'RUS', team: 'mercedes', win_pct: 0, podium_pct: 18, confidence: 79, stops: 2, compound: 'MEDIUM', tyre_age: 8, delta_to_win: '+24.500s' },
    { predicted_pos: 6, current_pos: 5, code: 'SAI', team: 'ferrari', win_pct: 0, podium_pct: 12, confidence: 76, stops: 2, compound: 'HARD', tyre_age: 20, delta_to_win: '+31.800s' },
    { predicted_pos: 7, current_pos: 7, code: 'HAM', team: 'mercedes', win_pct: 0, podium_pct: 6, confidence: 74, stops: 2, compound: 'MEDIUM', tyre_age: 10, delta_to_win: '+38.100s' },
    { predicted_pos: 8, current_pos: 9, code: 'PER', team: 'redbull', win_pct: 0, podium_pct: 2, confidence: 72, stops: 2, compound: 'SOFT', tyre_age: 5, delta_to_win: '+49.400s' },
  ];

  // What-if calculation outcome
  const isUndercutSuccess = simulatedPitLap <= 29 && simulatedPitDuration <= 3.2;

  return (
    <div className="space-y-6">
      {/* 1. Header & Driver Selector */}
      <div className="bg-[#12161F] border border-[#2A3245] rounded-xl p-5 space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#E10600]/20 text-[#E10600] border border-[#E10600]/40 uppercase tracking-wider">
                R3 Algorithm Suite
              </span>
              <span className="text-xs font-mono text-[#64748B]">Pit Wall Machine Strategy Models</span>
            </div>
            <h2 className="text-xl lg:text-2xl font-display font-black text-white tracking-wide uppercase">
              Pit Window Detector & Race Result Predictor
            </h2>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-[#64748B]">STRATEGY TARGET:</span>
            <select
              value={activeDriver}
              onChange={(e) => setActiveDriver(e.target.value)}
              className="bg-[#1C2230] border border-[#2A3245] text-white rounded-lg p-2 font-bold focus:outline-none focus:border-[#E10600]"
            >
              <option value="NOR">NOR — Lando Norris (P3)</option>
              <option value="VER">VER — Max Verstappen (P1)</option>
              <option value="LEC">LEC — Charles Leclerc (P2)</option>
              <option value="PIA">PIA — Oscar Piastri (P4)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Pit Window Detector UI */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Pit Window Metrics Cards */}
        <div className="lg:col-span-5 bg-[#12161F] border border-[#2A3245] rounded-xl p-5 space-y-4 shadow-lg">
          <div className="border-b border-[#2A3245] pb-3">
            <div className="flex items-center gap-2 text-amber-400">
              <Cpu className="w-4 h-4" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Pit Window Detector Output</h3>
            </div>
            <p className="text-xs font-mono text-[#64748B]">Tyre cliff detection & undercut viability calculations</p>
          </div>

          {/* Metric Tiles */}
          <div className="grid grid-cols-2 gap-3 font-mono">
            <div className="p-3 bg-[#1C2230] rounded-xl border border-[#2A3245]/60">
              <span className="text-[10px] text-[#64748B] uppercase block">Degradation Rate</span>
              <span className="text-lg font-black text-white">
                +{pitWindowResult.degradation_rate.toFixed(3)}s
              </span>
              <span className="text-[10px] text-[#94A3B8] block">per racing lap</span>
            </div>

            <div className="p-3 bg-[#1C2230] rounded-xl border border-[#2A3245]/60">
              <span className="text-[10px] text-[#64748B] uppercase block">Tyre Cliff Horizon</span>
              <span className="text-lg font-black text-amber-400">
                Lap {pitWindowResult.cliff_lap}
              </span>
              <span className="text-[10px] text-amber-300 block">
                {pitWindowResult.laps_until_cliff} laps remaining
              </span>
            </div>

            <div className="p-3 bg-[#1C2230] rounded-xl border border-[#2A3245]/60 col-span-2">
              <span className="text-[10px] text-[#64748B] uppercase block mb-1">Optimal Pit Window Target</span>
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="text-[#64748B] block text-[10px]">EARLIEST</span>
                  <span className="font-bold text-white text-sm">Lap {pitWindowResult.earliest_pit_lap}</span>
                </div>
                <div className="text-center p-1.5 bg-[#E10600]/20 border border-[#E10600]/40 rounded-lg">
                  <span className="text-[#E10600] font-bold block text-[10px]">RECOMMENDED</span>
                  <span className="font-black text-white text-base">Lap {pitWindowResult.recommended_pit_lap}</span>
                </div>
                <div className="text-right">
                  <span className="text-[#64748B] block text-[10px]">LATEST</span>
                  <span className="font-bold text-white text-sm">Lap {pitWindowResult.latest_pit_lap}</span>
                </div>
              </div>
            </div>

            {/* Undercut Viability Meter */}
            <div className="p-3 bg-[#1C2230] rounded-xl border border-[#2A3245]/60 col-span-2 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#64748B] uppercase">Undercut Viability Meter</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  {pitWindowResult.undercut_status} (88% Chance)
                </span>
              </div>
              <div className="w-full h-2 bg-[#151922] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full w-[88%]" />
              </div>
              <p className="text-[11px] text-[#94A3B8]">
                Projected track re-entry into clean air ahead of traffic. Net delta advantage: <strong className="text-white">+{pitWindowResult.net_advantage}s</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Degradation Curve Chart */}
        <div className="lg:col-span-7 bg-[#12161F] border border-[#2A3245] rounded-xl p-5 space-y-3 shadow-lg">
          <div className="flex items-center justify-between border-b border-[#2A3245] pb-2">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Tyre Pace Degradation & Cliff Curve</h3>
              <p className="text-xs font-mono text-[#64748B]">Linear degradation vs exponential cliff threshold</p>
            </div>
            <span className="text-xs font-mono text-amber-400">Target: Lap 28</span>
          </div>

          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={degradationCurveData} margin={{ top: 10, right: 15, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A3245" vertical={false} opacity={0.6} />
                <XAxis
                  dataKey="lap"
                  stroke="#64748B"
                  tick={{ fill: '#94A3B8', fontSize: 10, fontFamily: 'monospace' }}
                  label={{ value: 'TYRE AGE (LAPS)', position: 'insideBottom', offset: -4, fill: '#64748B', fontSize: 10 }}
                />
                <YAxis
                  domain={[80.5, 84.5]}
                  stroke="#64748B"
                  tick={{ fill: '#94A3B8', fontSize: 10, fontFamily: 'monospace' }}
                  tickFormatter={(v) => `${v.toFixed(1)}s`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#151922', borderColor: '#2A3245', fontFamily: 'monospace', fontSize: '11px' }}
                />
                <ReferenceLine y={83.0} stroke="#EF4444" strokeDasharray="3 3" label={{ value: 'PERFORMANCE CLIFF', fill: '#EF4444', fontSize: 10, position: 'top' }} />
                <ReferenceArea x1={25} x2={32} fill="#F59E0B" fillOpacity={0.15} label={{ value: 'PIT WINDOW', fill: '#F59E0B', fontSize: 10, position: 'center' }} />
                <Line
                  type="monotone"
                  dataKey="lap_time"
                  stroke="#00F0FF"
                  strokeWidth={2.5}
                  dot={false}
                  name="Degradation Pace"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 3. Interactive What-If Pit Stop Simulator Sandbox */}
      <div className="bg-[#12161F] border border-[#2A3245] rounded-xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#2A3245] pb-3">
          <div className="flex items-center gap-2 text-[#E10600]">
            <Sliders className="w-5 h-5" />
            <h3 className="text-base font-bold uppercase tracking-wider text-white">
              Interactive What-If Pit Stop Simulator
            </h3>
          </div>
          <span className="text-xs font-mono text-[#94A3B8]">Adjust strategic parameters in real-time</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 font-mono text-xs">
          {/* Slider 1: Pit Stop Lap */}
          <div className="p-4 bg-[#1C2230] rounded-xl border border-[#2A3245]/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[#94A3B8]">PIT STOP LAP</span>
              <span className="font-black text-amber-400 text-sm">Lap {simulatedPitLap}</span>
            </div>
            <input
              type="range"
              min="20"
              max="40"
              value={simulatedPitLap}
              onChange={(e) => setSimulatedPitLap(Number(e.target.value))}
              className="w-full accent-amber-400 h-1.5 bg-[#2A3245] rounded-lg cursor-pointer"
            />
            <div className="flex items-center justify-between text-[10px] text-[#64748B]">
              <span>Lap 20 (Early Undercut)</span>
              <span>Lap 40 (Overcut)</span>
            </div>
          </div>

          {/* Slider 2: Target Compound Selector */}
          <div className="p-4 bg-[#1C2230] rounded-xl border border-[#2A3245]/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[#94A3B8]">NEW TYRE COMPOUND</span>
              <span className="font-black text-white text-sm">{simulatedCompound}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {['SOFT', 'MEDIUM', 'HARD'].map((comp) => {
                const tyre = getTyreInfo(comp);
                const isSelected = simulatedCompound === comp;
                return (
                  <button
                    key={comp}
                    onClick={() => setSimulatedCompound(comp)}
                    className={`py-2 rounded-lg font-bold text-center border transition-all ${
                      isSelected
                        ? `${tyre.bgClass} ${tyre.borderClass} ${tyre.textClass} ring-1 ring-white/50`
                        : 'bg-[#151922] text-[#64748B] border-[#2A3245]'
                    }`}
                  >
                    {tyre.code} ({tyre.name})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Slider 3: Pit Stop Duration */}
          <div className="p-4 bg-[#1C2230] rounded-xl border border-[#2A3245]/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[#94A3B8]">STATIONARY STOP DURATION</span>
              <span className="font-black text-emerald-400 text-sm">{simulatedPitDuration.toFixed(1)}s</span>
            </div>
            <input
              type="range"
              min="2.0"
              max="5.0"
              step="0.1"
              value={simulatedPitDuration}
              onChange={(e) => setSimulatedPitDuration(Number(e.target.value))}
              className="w-full accent-emerald-400 h-1.5 bg-[#2A3245] rounded-lg cursor-pointer"
            />
            <div className="flex items-center justify-between text-[10px] text-[#64748B]">
              <span>2.0s (Flawless)</span>
              <span>5.0s (Slow / Stuck Wheel)</span>
            </div>
          </div>
        </div>

        {/* Live Simulation Strategic Outcome Banner */}
        <div
          className={`p-4 rounded-xl border font-mono text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
            isUndercutSuccess
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200'
              : 'bg-red-500/15 border-red-500/40 text-red-200'
          }`}
        >
          <div className="flex items-center gap-3">
            {isUndercutSuccess ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            )}
            <div>
              <span className="font-bold text-white text-sm block">
                {isUndercutSuccess
                  ? 'SIMULATION RESULT: UNDERCUT STRATEGY SUCCEEDS'
                  : 'SIMULATION RESULT: STRATEGY MARGINAL OR RE-JOINS IN DIRTY AIR'}
              </span>
              <p className="text-[11px] opacity-90 mt-0.5">
                {isUndercutSuccess
                  ? `Re-joins P4 in clean air with +1.7s margin over Russell on Lap ${simulatedPitLap + 1}. Projected finish: P2 (+3.2s).`
                  : `Late stop or slow pit duration loses track position. Re-joins behind traffic at P6 with 0.4s delta disadvantage.`}
              </p>
            </div>
          </div>

          <div className="shrink-0 text-right">
            <span className="px-3 py-1 rounded-full font-black text-xs uppercase tracking-wider bg-black/40 border border-white/20">
              {isUndercutSuccess ? 'NET GAIN: +1 POSITION' : 'NET LOSS: -1 POSITION'}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Race Result Predictor UI */}
      <div className="bg-[#12161F] border border-[#2A3245] rounded-xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#2A3245] pb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Race Result Predictor Algorithm Forecast
            </h3>
          </div>
          <span className="text-xs font-mono text-[#64748B]">Modeling remaining 33 laps pace & compound degradation</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="bg-[#151922] text-[#64748B] border-b border-[#2A3245] text-[11px] uppercase">
                <th className="py-2.5 px-3 w-12 text-center">PRED</th>
                <th className="py-2.5 px-2 w-10 text-center">CURR</th>
                <th className="py-2.5 px-3">DRIVER</th>
                <th className="py-2.5 px-3 text-center">STOPS</th>
                <th className="py-2.5 px-3 text-right">PREDICTED GAP</th>
                <th className="py-2.5 px-3 text-center">CONFIDENCE</th>
                <th className="py-2.5 px-3 w-44">WIN / PODIUM CHANCE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A3245]/50">
              {predictedOrder.map((row) => {
                const teamColor = getTeamColor(row.team);
                const posDelta = row.current_pos - row.predicted_pos;

                return (
                  <tr key={row.code} className="hover:bg-[#1C2230]/60 transition-colors">
                    <td className="py-2.5 px-3 text-center font-black text-sm text-white">
                      P{row.predicted_pos}
                    </td>
                    <td className="py-2.5 px-2 text-center text-[#64748B]">
                      <span className="flex items-center justify-center gap-1 font-bold">
                        <span>P{row.current_pos}</span>
                        {posDelta > 0 && <span className="text-emerald-400">▲+{posDelta}</span>}
                        {posDelta < 0 && <span className="text-red-400">▼{posDelta}</span>}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-4 rounded-full" style={{ backgroundColor: teamColor }} />
                        <span className="font-bold text-white text-sm">{row.code}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-center text-[#94A3B8]">
                      {row.stops} stop
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-white tabular-nums">
                      {row.delta_to_win}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#1C2230] text-amber-300 border border-amber-500/30">
                        {row.confidence}% Conf.
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-[#64748B]">
                          <span>Win {row.win_pct}%</span>
                          <span>Podium {row.podium_pct}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-[#1C2230] rounded-full overflow-hidden flex">
                          <div className="h-full bg-amber-400" style={{ width: `${row.win_pct}%` }} />
                          <div className="h-full bg-emerald-400" style={{ width: `${Math.max(0, row.podium_pct - row.win_pct)}%` }} />
                        </div>
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
  );
}
