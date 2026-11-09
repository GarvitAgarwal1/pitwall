import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { getTeamColor } from '../../utils/theme';

/**
 * Custom Tooltip for Position Bump Chart
 */
function CustomPositionTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;

  // Sort payload by position ascending (P1 first)
  const sorted = payload
    .slice()
    .filter((entry) => entry.value !== null && entry.value !== undefined)
    .sort((a, b) => Number(a.value) - Number(b.value));

  return (
    <div className="bg-[#151922] border border-[#2A3245] p-3 rounded-lg shadow-2xl font-mono text-xs z-50 min-w-[200px]">
      <div className="font-bold text-white border-b border-[#2A3245] pb-1.5 mb-2 flex items-center justify-between">
        <span className="text-[#94A3B8]">LAP {label}</span>
        <span className="text-[10px] text-emerald-400 font-normal">CLASSIFICATION</span>
      </div>
      <div className="space-y-1 max-h-56 overflow-y-auto">
        {sorted.slice(0, 10).map((entry) => (
          <div key={entry.name} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span
                className="w-4 text-center font-bold text-[11px]"
                style={{ color: entry.value <= 3 ? '#F59E0B' : '#94A3B8' }}
              >
                P{entry.value}
              </span>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="font-bold text-white">{entry.name}</span>
            </div>
          </div>
        ))}
        {sorted.length > 10 && (
          <div className="pt-1 text-[10px] text-[#64748B] text-center border-t border-[#2A3245]/50">
            +{sorted.length - 10} more drivers
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * PositionChangesChart Component
 * Bump chart / flowchart tracing driver positions from start to finish.
 */
export default function PositionChangesChart({
  positionsData = [],
  drivers = [],
  height = 420,
}) {
  const [highlightedDriver, setHighlightedDriver] = useState(null);

  // Available drivers list
  const activeDriversList = useMemo(() => {
    if (drivers && drivers.length > 0) return drivers;
    // Derive from keys if drivers not explicitly provided
    if (!positionsData.length) return [];
    const keys = Object.keys(positionsData[0]).filter((k) => k !== 'lap');
    return keys.map((k, idx) => ({
      code: k,
      number: idx + 1,
      team: 'default',
      color: getTeamColor(k),
    }));
  }, [drivers, positionsData]);

  if (!positionsData || !positionsData.length) {
    return (
      <div className="h-64 flex flex-col items-center justify-center p-6 bg-[#12161F] border border-[#2A3245] rounded-xl text-center">
        <p className="font-mono text-sm text-[#64748B]">No position change telemetry available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 bg-[#12161F] border border-[#2A3245] rounded-xl p-4 lg:p-5">
      {/* Driver Interactive Filter / Highlight Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-mono text-[#64748B] mr-1 hidden sm:inline">FOCUS DRIVER:</span>
          {activeDriversList.slice(0, 10).map((d) => {
            const isHighlighted = highlightedDriver === d.code;
            const color = d.color || getTeamColor(d.team || d.code);

            return (
              <button
                key={d.code}
                onClick={() => setHighlightedDriver(isHighlighted ? null : d.code)}
                onMouseEnter={() => setHighlightedDriver(d.code)}
                onMouseLeave={() => setHighlightedDriver(null)}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-bold transition-all border ${
                  isHighlighted
                    ? 'text-white shadow-md'
                    : highlightedDriver
                    ? 'opacity-30 border-[#2A3245] bg-[#1C2230] text-[#64748B]'
                    : 'bg-[#1C2230] text-[#94A3B8] border-[#2A3245] hover:text-white'
                }`}
                style={{
                  backgroundColor: isHighlighted ? `${color}30` : undefined,
                  borderColor: isHighlighted ? color : undefined,
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                <span>{d.code}</span>
              </button>
            );
          })}
        </div>

        {highlightedDriver && (
          <button
            onClick={() => setHighlightedDriver(null)}
            className="text-xs font-mono text-[#E10600] hover:underline"
          >
            Clear Focus
          </button>
        )}
      </div>

      {/* Chart */}
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={positionsData} margin={{ top: 15, right: 20, left: 0, bottom: 5 }}>
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
              reversed={true}
              domain={[1, 20]}
              ticks={[1, 5, 10, 15, 20]}
              tickFormatter={(val) => `P${val}`}
              stroke="#64748B"
              tick={{ fill: '#94A3B8', fontSize: 11, fontFamily: 'monospace' }}
              tickLine={{ stroke: '#2A3245' }}
              axisLine={{ stroke: '#2A3245' }}
              width={45}
            />

            <Tooltip content={<CustomPositionTooltip />} />

            {activeDriversList.map((d) => {
              const isTarget = highlightedDriver === d.code;
              const hasFocus = highlightedDriver !== null;
              const color = d.color || getTeamColor(d.team || d.code);

              return (
                <Line
                  key={d.code}
                  type="monotone"
                  dataKey={d.code}
                  stroke={color}
                  strokeWidth={isTarget ? 3.5 : hasFocus ? 1 : 2}
                  strokeOpacity={isTarget ? 1 : hasFocus ? 0.2 : 0.85}
                  dot={false}
                  activeDot={{ r: 5, fill: color, stroke: '#FFFFFF', strokeWidth: 1.5 }}
                  isAnimationActive={false}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-[11px] font-mono text-[#64748B] pt-2 border-t border-[#2A3245]/60">
        <span>Y-Axis: Track Position (P1 at top, P20 at bottom)</span>
        <span>Hover or click driver to highlight their race progression</span>
      </div>
    </div>
  );
}
