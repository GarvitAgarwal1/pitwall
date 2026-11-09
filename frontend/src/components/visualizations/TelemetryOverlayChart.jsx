import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  AreaChart,
  Area,
} from 'recharts';

/**
 * Custom Tooltip for Synchronized Telemetry
 */
function TelemetryTooltip({ active, payload, label, unit = '', metricName = '' }) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-[#151922] border border-[#2A3245] px-2.5 py-1.5 rounded shadow-xl font-mono text-[11px] z-50">
      <div className="text-[#64748B] flex items-center justify-between gap-3 mb-1">
        <span>{Math.round(label)} m</span>
        <span className="font-bold text-white uppercase">{metricName}</span>
      </div>
      <div className="flex items-center gap-4">
        {payload.map((entry) => (
          <div key={entry.name} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-[#94A3B8]">{entry.name}:</span>
            <span className="font-bold tabular-nums text-white">
              {entry.value !== null && entry.value !== undefined ? `${entry.value} ${unit}` : '-'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * TelemetryOverlayChart Component
 * Multi-trace synchronized telemetry analysis: Speed, Throttle, Brake, Gear, DRS, and Delta Time.
 */
export default function TelemetryOverlayChart({
  telemetryData = [],
  driver1 = { code: 'VER', number: 1, color: '#00F0FF', name: 'Max Verstappen' },
  driver2 = { code: 'NOR', number: 4, color: '#FF8000', name: 'Lando Norris' },
  onHoverDistance,
}) {
  if (!telemetryData || !telemetryData.length) {
    return (
      <div className="h-64 flex flex-col items-center justify-center p-6 bg-[#12161F] border border-[#2A3245] rounded-xl text-center">
        <p className="font-mono text-sm text-[#64748B]">No telemetry data available for lap comparison.</p>
      </div>
    );
  }

  const d1Color = driver1?.color || '#00F0FF';
  const d2Color = driver2?.color || '#FF8000';

  const handleMouseMove = (state) => {
    if (state && state.activeLabel !== undefined && onHoverDistance) {
      onHoverDistance(state.activeLabel);
    }
  };

  return (
    <div className="space-y-4 bg-[#12161F] border border-[#2A3245] rounded-xl p-4 lg:p-5">
      {/* Driver Legend Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2A3245] pb-3">
        <div className="flex items-center gap-6">
          {/* Driver 1 */}
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full shadow-lg" style={{ backgroundColor: d1Color }} />
            <div>
              <span className="font-mono font-bold text-white text-sm">
                {driver1.code} #{driver1.number}
              </span>
              <span className="text-[11px] font-mono text-[#94A3B8] ml-2">
                {driver1.lapTime ? `(${driver1.lapTime})` : ''}
              </span>
            </div>
          </div>

          <span className="text-xs font-mono text-[#64748B]">VS</span>

          {/* Driver 2 */}
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full shadow-lg" style={{ backgroundColor: d2Color }} />
            <div>
              <span className="font-mono font-bold text-white text-sm">
                {driver2.code} #{driver2.number}
              </span>
              <span className="text-[11px] font-mono text-[#94A3B8] ml-2">
                {driver2.lapTime ? `(${driver2.lapTime})` : ''}
              </span>
            </div>
          </div>
        </div>

        <div className="text-[11px] font-mono text-[#64748B]">
          SYNCHRONIZED DISTANCE (0m → {Math.round(telemetryData[telemetryData.length - 1]?.distance_m || 5400)}m)
        </div>
      </div>

      {/* Synchronized Charts Stack */}
      <div className="space-y-2">
        {/* 1. Speed (km/h) */}
        <div className="bg-[#151922] p-2 rounded-lg border border-[#2A3245]/60">
          <div className="flex items-center justify-between px-2 mb-1 text-[11px] font-mono">
            <span className="text-[#00F0FF] font-bold">SPEED (KM/H)</span>
            <span className="text-[#64748B]">0 – 350 km/h</span>
          </div>
          <div style={{ width: '100%', height: 160 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                syncId="f1telemetry"
                data={telemetryData}
                onMouseMove={handleMouseMove}
                margin={{ top: 5, right: 15, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#2A3245" vertical={false} opacity={0.5} />
                <XAxis dataKey="distance_m" hide />
                <YAxis
                  domain={[60, 360]}
                  stroke="#64748B"
                  tick={{ fill: '#94A3B8', fontSize: 10, fontFamily: 'monospace' }}
                  tickLine={{ stroke: '#2A3245' }}
                  width={45}
                />
                <Tooltip content={<TelemetryTooltip unit="km/h" metricName="Speed" />} />
                <Line
                  type="monotone"
                  dataKey="d1_speed"
                  name={driver1.code}
                  stroke={d1Color}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="d2_speed"
                  name={driver2.code}
                  stroke={d2Color}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Throttle & Brake Combined / Stacked */}
        <div className="bg-[#151922] p-2 rounded-lg border border-[#2A3245]/60">
          <div className="flex items-center justify-between px-2 mb-1 text-[11px] font-mono">
            <span className="text-[#00E676] font-bold">THROTTLE & BRAKE (%)</span>
            <span className="text-[#64748B]">0 – 100%</span>
          </div>
          <div style={{ width: '100%', height: 120 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                syncId="f1telemetry"
                data={telemetryData}
                onMouseMove={handleMouseMove}
                margin={{ top: 5, right: 15, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#2A3245" vertical={false} opacity={0.5} />
                <XAxis dataKey="distance_m" hide />
                <YAxis
                  domain={[0, 100]}
                  ticks={[0, 50, 100]}
                  stroke="#64748B"
                  tick={{ fill: '#94A3B8', fontSize: 10, fontFamily: 'monospace' }}
                  tickLine={{ stroke: '#2A3245' }}
                  width={45}
                />
                <Tooltip content={<TelemetryTooltip unit="%" metricName="Pedals" />} />
                {/* D1 Throttle & Brake */}
                <Line
                  type="monotone"
                  dataKey="d1_throttle"
                  name={`${driver1.code} Thr`}
                  stroke={d1Color}
                  strokeWidth={1.5}
                  dot={false}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="d1_brake"
                  name={`${driver1.code} Brk`}
                  stroke="#FF1744"
                  strokeWidth={1.5}
                  dot={false}
                  isAnimationActive={false}
                />
                {/* D2 Throttle & Brake */}
                <Line
                  type="monotone"
                  dataKey="d2_throttle"
                  name={`${driver2.code} Thr`}
                  stroke={d2Color}
                  strokeWidth={1.5}
                  strokeDasharray="3 2"
                  dot={false}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="d2_brake"
                  name={`${driver2.code} Brk`}
                  stroke="#FF5252"
                  strokeWidth={1.5}
                  strokeDasharray="3 2"
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Gear & DRS */}
        <div className="bg-[#151922] p-2 rounded-lg border border-[#2A3245]/60">
          <div className="flex items-center justify-between px-2 mb-1 text-[11px] font-mono">
            <span className="text-[#FFD600] font-bold">GEAR SELECTION (1-8)</span>
            <span className="text-[#7C4DFF] font-bold">DRS STATUS</span>
          </div>
          <div style={{ width: '100%', height: 90 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                syncId="f1telemetry"
                data={telemetryData}
                onMouseMove={handleMouseMove}
                margin={{ top: 5, right: 15, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#2A3245" vertical={false} opacity={0.5} />
                <XAxis dataKey="distance_m" hide />
                <YAxis
                  domain={[1, 8]}
                  ticks={[1, 4, 8]}
                  stroke="#64748B"
                  tick={{ fill: '#94A3B8', fontSize: 10, fontFamily: 'monospace' }}
                  tickLine={{ stroke: '#2A3245' }}
                  width={45}
                />
                <Tooltip content={<TelemetryTooltip unit="" metricName="Gear" />} />
                <Line
                  type="stepAfter"
                  dataKey="d1_gear"
                  name={`${driver1.code} Gear`}
                  stroke={d1Color}
                  strokeWidth={1.5}
                  dot={false}
                  isAnimationActive={false}
                />
                <Line
                  type="stepAfter"
                  dataKey="d2_gear"
                  name={`${driver2.code} Gear`}
                  stroke={d2Color}
                  strokeWidth={1.5}
                  strokeDasharray="3 2"
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. Delta Time (+/- s) */}
        <div className="bg-[#151922] p-2 rounded-lg border border-[#2A3245]/60">
          <div className="flex items-center justify-between px-2 mb-1 text-[11px] font-mono">
            <span className="text-[#F59E0B] font-bold">TIME DELTA (+/- S)</span>
            <span className="text-[#94A3B8]">
              Above 0: {driver1.code} ahead | Below 0: {driver2.code} ahead
            </span>
          </div>
          <div style={{ width: '100%', height: 100 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                syncId="f1telemetry"
                data={telemetryData}
                onMouseMove={handleMouseMove}
                margin={{ top: 5, right: 15, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#2A3245" vertical={false} opacity={0.5} />
                <XAxis
                  dataKey="distance_m"
                  stroke="#64748B"
                  tick={{ fill: '#94A3B8', fontSize: 10, fontFamily: 'monospace' }}
                  tickLine={{ stroke: '#2A3245' }}
                  tickFormatter={(v) => `${Math.round(v)}m`}
                  label={{
                    value: 'LAP DISTANCE (METERS)',
                    position: 'insideBottom',
                    offset: -12,
                    fill: '#64748B',
                    fontSize: 10,
                    fontFamily: 'monospace',
                  }}
                />
                <YAxis
                  stroke="#64748B"
                  tick={{ fill: '#94A3B8', fontSize: 10, fontFamily: 'monospace' }}
                  tickLine={{ stroke: '#2A3245' }}
                  tickFormatter={(v) => `${v > 0 ? '+' : ''}${v.toFixed(2)}s`}
                  width={45}
                />
                <ReferenceLine y={0} stroke="#94A3B8" strokeWidth={1} />
                <Tooltip content={<TelemetryTooltip unit="s" metricName="Delta" />} />
                <Area
                  type="monotone"
                  dataKey="delta_time"
                  name="Delta"
                  stroke="#F59E0B"
                  fill="#F59E0B"
                  fillOpacity={0.2}
                  strokeWidth={2}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
