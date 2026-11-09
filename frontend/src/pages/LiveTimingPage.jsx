import React, { useState } from 'react';
import useLiveTiming from '../hooks/useLiveTiming';
import TimingTower from '../components/visualizations/TimingTower';
import { FlagBadge, StatusBadge } from '../components/common/Badge';
import {
  Activity,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Sliders,
  AlertTriangle,
  Radio,
  CloudRain,
  Thermometer,
  Wind,
  ShieldAlert,
} from 'lucide-react';

export default function LiveTimingPage({ onNavigate }) {
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [filterCategory, setFilterCategory] = useState('ALL');

  const {
    timingData,
    raceControl,
    penalties,
    sessionMeta,
    isLoading,
    isPolling,
    togglePolling,
    intervalMs,
    setIntervalMs,
    isReplay,
    setIsReplay,
    replayLap,
    setReplayLap,
    replaySpeed,
    setReplaySpeed,
    isPlaying,
    togglePlayReplay,
    refetch,
  } = useLiveTiming({
    sessionKey: 'latest',
    pollingInterval: 5000,
    totalLaps: 57,
  });

  // Filter race control messages
  const filteredMessages = raceControl.filter((msg) => {
    if (filterCategory === 'ALL') return true;
    if (filterCategory === 'SAFETY CAR') return msg.category === 'SafetyCar' || msg.message?.includes('SAFETY CAR');
    if (filterCategory === 'FLAGS') return msg.category === 'Flag' || msg.flag;
    if (filterCategory === 'INVESTIGATIONS') return msg.category === 'Investigation' || msg.message?.includes('INVESTIGATION');
    if (filterCategory === 'PENALTIES') return msg.category === 'Penalty' || msg.message?.includes('PENALTY');
    return true;
  });

  return (
    <div className="space-y-5">
      {/* 1. Session Status Bar & Conditions */}
      <div className="bg-[#12161F] border border-[#2A3245] rounded-xl p-4 lg:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xl">
        {/* Left: Session Title, Lap, Flag */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#E10600] animate-pulse" />
            <h2 className="text-lg lg:text-xl font-display font-black text-white tracking-wide uppercase">
              {sessionMeta.session_name || 'Grand Prix Race Session'}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-[#1C2230] border border-[#2A3245] rounded text-xs font-mono font-bold text-white tabular-nums">
              LAP {sessionMeta.current_lap} / {sessionMeta.total_laps}
            </span>
            <FlagBadge
              flag={
                sessionMeta.safety_car_status === 'SAFETY_CAR'
                  ? 'SC'
                  : sessionMeta.safety_car_status === 'VIRTUAL_SAFETY_CAR'
                  ? 'VSC'
                  : sessionMeta.safety_car_status === 'RED_FLAG'
                  ? 'RED'
                  : 'GREEN'
              }
            />
          </div>
        </div>

        {/* Right: Weather & Polling Indicator */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
          {/* Weather Pill */}
          <div className="flex items-center gap-3 px-3 py-1.5 bg-[#1C2230] border border-[#2A3245] rounded-lg text-[#94A3B8]">
            <span className="flex items-center gap-1">
              <Thermometer className="w-3.5 h-3.5 text-amber-400" />
              <span>Track {sessionMeta.track_temp || 38.2}°C</span>
            </span>
            <span>|</span>
            <span className="flex items-center gap-1">
              <span>Air {sessionMeta.air_temp || 26.4}°C</span>
            </span>
            <span>|</span>
            <span className="flex items-center gap-1">
              <CloudRain className="w-3.5 h-3.5 text-blue-400" />
              <span>Rain {sessionMeta.rain_risk || 0}%</span>
            </span>
          </div>

          {/* Automated Polling Toggle */}
          <div className="flex items-center gap-1.5 bg-[#1C2230] border border-[#2A3245] p-1 rounded-lg">
            <button
              onClick={togglePolling}
              className={`px-2.5 py-1 rounded text-xs font-bold transition-colors ${
                isPolling && !isReplay
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'text-[#64748B] hover:text-white'
              }`}
            >
              {isPolling && !isReplay ? 'POLLING (5s)' : 'PAUSED'}
            </button>

            <button
              onClick={() => {
                setIsReplay((p) => !p);
              }}
              className={`px-2.5 py-1 rounded text-xs font-bold transition-colors ${
                isReplay
                  ? 'bg-amber-500 text-black font-black'
                  : 'text-[#64748B] hover:text-white'
              }`}
            >
              {isReplay ? 'REPLAY MODE' : 'LIVE MODE'}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Interactive Simulation & Replay Scrubber Control Bar */}
      {isReplay && (
        <div className="bg-gradient-to-r from-amber-500/10 via-[#1C2230] to-amber-500/10 border border-amber-500/40 rounded-xl p-4 space-y-3 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              <span className="font-mono font-bold text-xs uppercase tracking-wider text-amber-300">
                Session Telemetry Replay Scrubber
              </span>
            </div>

            {/* Playback Speed Multipliers */}
            <div className="flex items-center gap-1 font-mono text-xs">
              <span className="text-[#64748B] mr-1">SPEED:</span>
              {[1, 2, 5, 10].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setReplaySpeed(spd)}
                  className={`px-2 py-0.5 rounded font-bold transition-colors ${
                    replaySpeed === spd
                      ? 'bg-amber-400 text-black'
                      : 'bg-[#151922] text-[#94A3B8] border border-[#2A3245] hover:text-white'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>

          {/* Slider and Buttons */}
          <div className="flex items-center gap-4">
            <button
              onClick={togglePlayReplay}
              className="p-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold flex items-center justify-center transition-colors shadow-md"
              title={isPlaying ? 'Pause Replay' : 'Play Replay'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>

            {/* Lap Slider */}
            <div className="flex-1 flex items-center gap-3">
              <span className="font-mono text-xs text-[#94A3B8] w-12 text-right tabular-nums">
                Lap {replayLap}
              </span>
              <input
                type="range"
                min="1"
                max={sessionMeta.total_laps}
                value={replayLap}
                onChange={(e) => setReplayLap(Number(e.target.value))}
                className="w-full accent-amber-400 h-1.5 bg-[#2A3245] rounded-lg cursor-pointer"
              />
              <span className="font-mono text-xs text-[#64748B] w-12 tabular-nums">
                Lap {sessionMeta.total_laps}
              </span>
            </div>

            <button
              onClick={() => setReplayLap(1)}
              className="p-1.5 text-[#64748B] hover:text-white rounded hover:bg-[#151922]"
              title="Reset to Lap 1"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 3. Penalties & Race Control Banner if active */}
      {penalties && penalties.length > 0 && (
        <div className="bg-red-500/15 border border-red-500/40 rounded-xl p-3 flex items-center gap-3 text-red-200 font-mono text-xs shadow-md">
          <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
          <div className="flex-1 flex flex-wrap items-center gap-3">
            <span className="font-bold text-white uppercase tracking-wider">ACTIVE PENALTIES:</span>
            {penalties.map((pen, idx) => (
              <span key={idx} className="bg-red-950/60 px-2 py-0.5 rounded border border-red-500/30">
                Car #{pen.driver_number}: {pen.penalty_type} ({pen.reason})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 4. Main 2-Column Grid: Timing Tower (Left 65%) & Race Control Feed (Right 35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left: Timing Tower */}
        <div className="lg:col-span-8 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#E10600]" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Live Leaderboard Tower</h3>
            </div>
            <span className="text-xs font-mono text-[#64748B]">20 Cars Classified</span>
          </div>

          <TimingTower
            timingData={timingData}
            selectedDriverNumber={selectedDriver?.driver_number}
            onSelectDriver={(d) => setSelectedDriver(d)}
          />
        </div>

        {/* Right: Race Control Feed & Selected Driver Telemetry Card */}
        <div className="lg:col-span-4 space-y-4">
          {/* Selected Driver Inspection Card */}
          {selectedDriver && (
            <div className="bg-[#12161F] border border-[#2A3245] rounded-xl p-4 space-y-3 shadow-lg">
              <div className="flex items-center justify-between border-b border-[#2A3245] pb-2">
                <div>
                  <span className="text-[10px] font-mono text-[#64748B] uppercase">Driver Focus</span>
                  <h4 className="text-base font-bold text-white font-mono flex items-center gap-2">
                    <span>{selectedDriver.driver_code} #{selectedDriver.driver_number}</span>
                    <span className="text-xs font-normal text-[#94A3B8]">({selectedDriver.team_name})</span>
                  </h4>
                </div>
                <button
                  onClick={() => setSelectedDriver(null)}
                  className="text-xs font-mono text-[#64748B] hover:text-white"
                >
                  Close
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                <div className="p-2 bg-[#1C2230] rounded border border-[#2A3245]/60">
                  <span className="text-[10px] text-[#64748B] block">GAP TO LEADER</span>
                  <span className="font-bold text-white">{selectedDriver.gap_to_leader}</span>
                </div>
                <div className="p-2 bg-[#1C2230] rounded border border-[#2A3245]/60">
                  <span className="text-[10px] text-[#64748B] block">INTERVAL AHEAD</span>
                  <span className="font-bold text-emerald-400">{selectedDriver.interval}</span>
                </div>
                <div className="p-2 bg-[#1C2230] rounded border border-[#2A3245]/60">
                  <span className="text-[10px] text-[#64748B] block">TYRE STINT</span>
                  <span className="font-bold text-white">
                    {selectedDriver.tyre_compound} (L{selectedDriver.tyre_age})
                  </span>
                </div>
                <div className="p-2 bg-[#1C2230] rounded border border-[#2A3245]/60">
                  <span className="text-[10px] text-[#64748B] block">PIT STOPS</span>
                  <span className="font-bold text-white">{selectedDriver.pit_stop_count}</span>
                </div>
              </div>

              <button
                onClick={() => onNavigate('telemetry')}
                className="w-full py-1.5 bg-[#1C2230] hover:bg-[#2A3245] text-xs font-mono text-amber-400 font-bold rounded border border-[#2A3245] transition-colors"
              >
                Inspect Telemetry Traces →
              </button>
            </div>
          )}

          {/* Race Control Incident Stream */}
          <div className="bg-[#12161F] border border-[#2A3245] rounded-xl p-4 space-y-3 shadow-lg">
            <div className="flex items-center justify-between border-b border-[#2A3245] pb-2">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">Race Control Feed</h3>
              </div>
              <span className="text-[10px] font-mono text-[#64748B]">FIA Official Log</span>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-1 font-mono text-[10px]">
              {['ALL', 'FLAGS', 'SAFETY CAR', 'INVESTIGATIONS'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-2 py-0.5 rounded border transition-colors ${
                    filterCategory === cat
                      ? 'bg-[#E10600] text-white border-transparent'
                      : 'bg-[#1C2230] text-[#94A3B8] border-[#2A3245] hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Message List */}
            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {filteredMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-[#1C2230] border border-[#2A3245]/70 font-mono text-xs space-y-1"
                >
                  <div className="flex items-center justify-between text-[10px] text-[#64748B]">
                    <span className="font-bold text-amber-400">
                      {msg.lap_number ? `LAP ${msg.lap_number}` : 'SESSION'}
                    </span>
                    <span>{new Date(msg.date).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-white text-[11px] leading-snug">{msg.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
