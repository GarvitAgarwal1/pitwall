import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { getTeamColor } from '../../utils/theme';
import { formatDelta } from '../../utils/formatters';

/**
 * Custom Tooltip for Gap Evolution
 */
function CustomGapTooltip({ active, payload, label, referenceDriver }) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-[#151922] border border-[#2A3245] p-3 rounded-lg shadow-2xl font-mono text-xs z-50 min-w-[190px]">
      <div className="font-bold text-white border-b border-[#2A3245] pb-1.5 mb-2 flex items-center justify-between">
        <span className="text-[#94A3B8]">LAP {label}</span>
        <span className="text-[10px] text-amber-400 font-normal">DELTA TO {referenceDriver}</span>
      </div>
      <div className="space-y-1.5 max-h-48 overflow-y-auto">
        {payload.map((entry) => (
          <div key={entry.name} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="font-bold text-white">{entry.name}</span>
            </div>
            <span className="font-bold tabular-nums" style={{ color: entry.color }}>
              {entry.value === 0 ? 'BASELINE' : formatDelta(entry.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * GapEvolutionChart Component
 * Visualizes the delta time gap in seconds between a reference driver and rivals across laps.
 */
export default function GapEvolutionChart({
  gapsData = [],
  drivers = [
    { code: 'VER', number: 1, team: 'redbull', color: '#3671C6' },
    { code: 'NOR', number: 4, team: 'mclaren', color: '#FF8000' },
    { code: 'LEC', number: 16, team: 'ferrari', color: '#E80020' },
    { code: 'PIA', number: 81, team: 'mclaren', color: '#FF8000' },
    { code: 'SAI', number: 55, team: 'ferrari', color: '#E80020' },
  ],
  defaultReference = 'VER',
  height = 360,
}) {
  const [referenceDriver, setReferenceDriver] = useState(defaultReference);
  const [selectedRivals, setSelectedRivals] = useState(() => {
    // Default select 2-3 rivals other than reference
    return drivers
      .map((d) => d.code)
      .filter((c) => c !== defaultReference)
      .slice(0, 3);
  });

  const toggleRival = (code) => {
    if (code === referenceDriver) return;
    setSelectedRivals((prev) =>
      prev.includes(code)
        ? prev.length > 1
          ? prev.filter((c) => c !== code)
          : prev
        : [...prev, code]
    );
  };

  // Compute delta gaps relative to selected referenceDriver
  const computedChartData = useMemo(() => {
    if (!gapsData || !gapsData.length) return [];

    return gapsData.map((row) => {
      const refVal = row[referenceDriver] ?? 0;
      const formatted = { lap: row.lap };

      drivers.forEach((d) => {
        if (d.code === referenceDriver) {
          formatted[d.code] = 0;
        } else {
          const rivalVal = row[d.code];
          if (typeof rivalVal === 'number' && typeof refVal === 'number') {
            // Delta relative to reference (positive = behind reference)
            formatted[d.code] = Number((rivalVal - refVal).toFixed(3));
          } else {
            formatted[d.code] = null;
          }
        }
      });
      return formatted;
    });
  }, [gapsData, referenceDriver, drivers]);

  if (!computedChartData.length) {
    return (
      <div className="h-64 flex flex-col items-center justify-center p-6 bg-[#12161F] border border-[#2A3245] rounded-xl text-center">
        <p className="font-mono text-sm text-[#64748B]">No interval gap telemetry available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 bg-[#12161F] border border-[#2A3245] rounded-xl p-4 lg:p-5">
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Baseline Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[#64748B]">BASELINE:</span>
          <select
            value={referenceDriver}
            onChange={(e) => {
              const newRef = e.target.value;
              setReferenceDriver(newRef);
              setSelectedRivals((prev) => prev.filter((c) => c !== newRef));
            }}
            className="bg-[#1C2230] border border-[#2A3245] text-white text-xs font-mono font-bold rounded px-2.5 py-1 focus:outline-none focus:border-[#E10600]"
          >
            {drivers.map((d) => (
              <option key={d.code} value={d.code}>
                {d.code} (#{d.number})
              </option>
            ))}
          </select>
        </div>

        {/* Rival Selection Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-mono text-[#64748B] mr-1 hidden sm:inline">RIVALS:</span>
          {drivers
            .filter((d) => d.code !== referenceDriver)
            .map((d) => {
              const isSelected = selectedRivals.includes(d.code);
              const color = d.color || getTeamColor(d.team);

              return (
                <button
                  key={d.code}
                  onClick={() => toggleRival(d.code)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-bold transition-all border ${
                    isSelected
                      ? 'text-white shadow-sm'
                      : 'bg-[#1C2230] text-[#64748B] border-[#2A3245] opacity-50 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: isSelected ? `${color}25` : undefined,
                    borderColor: isSelected ? color : undefined,
                  }}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                  <span>{d.code}</span>
                </button>
              );
            })}
        </div>
      </div>

      {/* Recharts LineChart */}
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={computedChartData} margin={{ top: 10, right: 15, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A3245" vertical={false} opacity={0.6} />

            <XAxis
              dataKey="lap"
              stroke="#64748B"
              tick={{ fill: '#94A3B8', fontSize: 11, fontFamily: 'monospace' }}
              tickLine={{ stroke: '#2A3245' }}
              axisLine={{ stroke: '#2A3245' }}
              label={{
                value: 'LAP NUMBER',
                position: 'insideBottom',
                offset: -4,
                fill: '#64748B',
                fontSize: 10,
                fontFamily: 'monospace',
              }}
            />

            <YAxis
              stroke="#64748B"
              tick={{ fill: '#94A3B8', fontSize: 11, fontFamily: 'monospace' }}
              tickLine={{ stroke: '#2A3245' }}
              axisLine={{ stroke: '#2A3245' }}
              tickFormatter={(v) => `${v > 0 ? '+' : ''}${v}s`}
              width={65}
            />

            <Tooltip content={<CustomGapTooltip referenceDriver={referenceDriver} />} />

            {/* Zero Baseline Reference Line */}
            <ReferenceLine y={0} stroke="#94A3B8" strokeWidth={1.5} label={{ value: `${referenceDriver} BASELINE`, fill: '#94A3B8', fontSize: 10, position: 'right' }} />

            {/* 1.0s DRS Threshold Line */}
            <ReferenceLine y={1.0} stroke="#10B981" strokeDasharray="4 4" strokeWidth={1} label={{ value: '1.0s DRS WINDOW', fill: '#10B981', fontSize: 10, position: 'right' }} />

            {/* Selected Rival Lines */}
            {drivers.map((d) => {
              if (!selectedRivals.includes(d.code)) return null;
              const color = d.color || getTeamColor(d.team);

              return (
                <Line
                  key={d.code}
                  type="monotone"
                  dataKey={d.code}
                  stroke={color}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: color, stroke: '#FFFFFF', strokeWidth: 1.5 }}
                  isAnimationActive={false}
                  connectNulls={true}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Notes */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#2A3245]/60 text-[11px] font-mono text-[#64748B]">
        <span>Positive values: Behind {referenceDriver} | Negative values: Ahead of {referenceDriver}</span>
        <span className="text-emerald-400">Green dashed line: 1.000s DRS activation zone</span>
      </div>
    </div>
  );
}
