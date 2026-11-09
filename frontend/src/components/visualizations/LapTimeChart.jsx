import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceArea,
  ReferenceLine,
} from 'recharts';
import { getTeamColor } from '../../utils/theme';
import { formatLapTime } from '../../utils/formatters';
import { Filter, Eye, EyeOff } from 'lucide-react';

/**
 * Custom Tooltip for Lap Time Trends
 */
function CustomLapTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-[#151922] border border-[#2A3245] p-3 rounded-lg shadow-2xl font-mono text-xs z-50 min-w-[180px]">
      <div className="font-bold text-white border-b border-[#2A3245] pb-1.5 mb-2 flex items-center justify-between">
        <span className="text-[#94A3B8]">LAP {label}</span>
        <span className="text-[10px] text-amber-400 font-normal">PACE TREND</span>
      </div>
      <div className="space-y-1.5 max-h-48 overflow-y-auto">
        {payload
          .slice()
          .sort((a, b) => (Number(a.value) || 999) - (Number(b.value) || 999))
          .map((entry) => (
            <div key={entry.name} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="font-bold text-white">{entry.name}</span>
              </div>
              <span className="font-bold tabular-nums" style={{ color: entry.color }}>
                {formatLapTime(entry.value)}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}

/**
 * LapTimeChart Component
 * Visualizes driver stint pace degradation, safety car laps, and lap-by-lap pace trends.
 */
export default function LapTimeChart({
  lapsData = [],
  drivers = [
    { code: 'VER', number: 1, team: 'redbull', color: '#3671C6' },
    { code: 'NOR', number: 4, team: 'mclaren', color: '#FF8000' },
    { code: 'LEC', number: 16, team: 'ferrari', color: '#E80020' },
  ],
  scPeriods = [], // e.g. [{ startLap: 32, endLap: 35, type: 'SC' }]
  height = 360,
}) {
  // Track which drivers are toggled ON for display
  const [selectedDriverCodes, setSelectedDriverCodes] = useState(() => {
    // Default: Top 3 or first 3 drivers
    return drivers.slice(0, 4).map((d) => d.code);
  });

  const [filterOutliers, setFilterOutliers] = useState(true);

  // Toggle driver visibility
  const toggleDriver = (code) => {
    setSelectedDriverCodes((prev) =>
      prev.includes(code)
        ? prev.length > 1
          ? prev.filter((c) => c !== code)
          : prev
        : [...prev, code]
    );
  };

  const selectAll = () => setSelectedDriverCodes(drivers.map((d) => d.code));
  const deselectAll = () => setSelectedDriverCodes(drivers.slice(0, 1).map((d) => d.code));

  // Process data for Recharts, optionally filtering pit stop out-laps and massive anomalies
  const chartData = useMemo(() => {
    if (!lapsData || !lapsData.length) return [];

    return lapsData.map((row) => {
      const formatted = { lap: row.lap };
      drivers.forEach((d) => {
        const val = row[d.code];
        if (typeof val === 'number') {
          // If outlier filtering enabled and lap time is > 115s (standard race lap ~80-90s)
          if (filterOutliers && (val > 115 || val < 60)) {
            formatted[d.code] = null;
          } else {
            formatted[d.code] = Number(val.toFixed(3));
          }
        } else {
          formatted[d.code] = null;
        }
      });
      return formatted;
    });
  }, [lapsData, drivers, filterOutliers]);

  // Compute reasonable Y-axis domain
  const yDomain = useMemo(() => {
    if (!chartData.length) return [78, 92];
    let min = 999;
    let max = 0;
    chartData.forEach((row) => {
      selectedDriverCodes.forEach((code) => {
        const val = row[code];
        if (val && typeof val === 'number') {
          if (val < min) min = val;
          if (val > max) max = val;
        }
      });
    });
    if (min === 999) return [78, 92];
    return [Math.floor(min - 1), Math.ceil(max + 1)];
  }, [chartData, selectedDriverCodes]);

  if (!chartData.length) {
    return (
      <div className="h-64 flex flex-col items-center justify-center p-6 bg-[#12161F] border border-[#2A3245] rounded-xl text-center">
        <p className="font-mono text-sm text-[#64748B]">No lap telemetry available for current selection.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 bg-[#12161F] border border-[#2A3245] rounded-xl p-4 lg:p-5">
      {/* Top Controls: Driver Chips & Outlier Filter Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Driver Selection Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-mono text-[#64748B] mr-1 hidden sm:inline">DRIVERS:</span>
          {drivers.map((d) => {
            const isSelected = selectedDriverCodes.includes(d.code);
            const color = d.color || getTeamColor(d.team);

            return (
              <button
                key={d.code}
                onClick={() => toggleDriver(d.code)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-bold transition-all border ${
                  isSelected
                    ? 'text-white border-transparent shadow-sm'
                    : 'bg-[#1C2230] text-[#64748B] border-[#2A3245] opacity-50 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: isSelected ? `${color}25` : undefined,
                  borderColor: isSelected ? color : undefined,
                }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span>{d.code}</span>
                <span className="text-[10px] opacity-75">#{d.number}</span>
              </button>
            );
          })}
        </div>

        {/* Action Buttons: Outliers & Batch Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterOutliers((p) => !p)}
            className={`px-2.5 py-1 text-xs font-mono rounded border flex items-center gap-1.5 transition-colors ${
              filterOutliers
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-[#1C2230] text-[#64748B] border-[#2A3245]'
            }`}
            title="Hide in-lap and out-lap pit spikes to view clean stint pace"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filter Pit Outliers</span>
          </button>

          <button
            onClick={selectedDriverCodes.length === drivers.length ? deselectAll : selectAll}
            className="p-1 text-[#64748B] hover:text-white rounded hover:bg-[#1C2230] text-xs font-mono"
            title="Toggle All Drivers"
          >
            {selectedDriverCodes.length === drivers.length ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Recharts Container */}
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 15, left: 0, bottom: 5 }}>
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
              domain={yDomain}
              stroke="#64748B"
              tick={{ fill: '#94A3B8', fontSize: 11, fontFamily: 'monospace' }}
              tickLine={{ stroke: '#2A3245' }}
              axisLine={{ stroke: '#2A3245' }}
              tickFormatter={(v) => formatLapTime(v)}
              width={70}
            />

            <Tooltip content={<CustomLapTooltip />} />

            {/* SC / VSC Reference Highlights */}
            {scPeriods.map((sc, i) => (
              <ReferenceArea
                key={`sc-${i}`}
                x1={sc.startLap}
                x2={sc.endLap}
                fill="#F59E0B"
                fillOpacity={0.12}
                stroke="#F59E0B"
                strokeOpacity={0.4}
                strokeDasharray="3 3"
              />
            ))}

            {/* Driver Lines */}
            {drivers.map((d) => {
              if (!selectedDriverCodes.includes(d.code)) return null;
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
                  connectNulls={false}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Footer Legend Notes */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#2A3245]/60 text-[11px] font-mono text-[#64748B]">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-[#3671C6]" />
            <span>Pace Degradation Trace</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-2 bg-amber-500/20 border border-amber-500/40 rounded-sm" />
            <span>Safety Car / VSC Period</span>
          </span>
        </div>
        <span>Y-Axis: Lap Time (m:ss.SSS)</span>
      </div>
    </div>
  );
}
