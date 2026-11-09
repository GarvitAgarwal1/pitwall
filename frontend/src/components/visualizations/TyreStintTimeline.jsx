import React, { useState } from 'react';
import { getTyreInfo, getTeamColor } from '../../utils/theme';

/**
 * TyreStintTimeline Component
 * High-fidelity Gantt-style horizontal timeline visualizing tyre compound stints,
 * pit stop laps, and stint lengths for all classified drivers.
 */
export default function TyreStintTimeline({
  stintsData = [],
  totalLaps = 57,
}) {
  const [hoveredStint, setHoveredStint] = useState(null);

  if (!stintsData || !stintsData.length) {
    return (
      <div className="h-64 flex flex-col items-center justify-center p-6 bg-[#12161F] border border-[#2A3245] rounded-xl text-center">
        <p className="font-mono text-sm text-[#64748B]">No tyre stint data recorded for this session.</p>
      </div>
    );
  }

  // Lap markers (e.g. 0, 10, 20, 30, 40, 50, totalLaps)
  const lapTicks = [];
  for (let l = 0; l <= totalLaps; l += 10) {
    lapTicks.push(l);
  }
  if (!lapTicks.includes(totalLaps)) lapTicks.push(totalLaps);

  return (
    <div className="bg-[#12161F] border border-[#2A3245] rounded-xl p-4 lg:p-5 space-y-4">
      {/* Header & Compound Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2A3245] pb-3">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">Tyre Stint Strategies</h3>
          <p className="text-xs font-mono text-[#64748B]">Horizontal stint breakdown & pit stop transitions</p>
        </div>

        {/* Compound Badges Legend */}
        <div className="flex items-center gap-3 font-mono text-xs">
          {[
            { key: 'SOFT', label: 'Soft', color: '#EF4444' },
            { key: 'MEDIUM', label: 'Medium', color: '#F59E0B' },
            { key: 'HARD', label: 'Hard', color: '#F8FAFC' },
            { key: 'INTER', label: 'Inter', color: '#10B981' },
            { key: 'WET', label: 'Wet', color: '#3B82F6' },
          ].map((item) => (
            <div key={item.key} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-[#94A3B8]">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Gantt Timeline Container */}
      <div className="overflow-x-auto">
        <div className="min-w-[680px]">
          {/* Lap Scale Header */}
          <div className="flex items-center mb-2 pb-1 border-b border-[#2A3245]/60 text-[10px] font-mono text-[#64748B]">
            <div className="w-32 shrink-0 pr-3 font-bold">DRIVER</div>
            <div className="flex-1 relative h-4">
              {lapTicks.map((tick) => {
                const pct = (tick / totalLaps) * 100;
                return (
                  <span
                    key={tick}
                    className="absolute -translate-x-1/2"
                    style={{ left: `${pct}%` }}
                  >
                    L{tick}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Driver Rows */}
          <div className="space-y-2">
            {stintsData.map((driverRow) => {
              const teamColor = getTeamColor(driverRow.team);

              return (
                <div key={driverRow.driverCode} className="flex items-center group hover:bg-[#1C2230]/40 p-1 rounded transition-colors">
                  {/* Driver Label */}
                  <div className="w-32 shrink-0 flex items-center gap-2 pr-3">
                    <span className="w-1 h-4 rounded-full" style={{ backgroundColor: teamColor }} />
                    <span className="font-mono font-bold text-xs text-white">{driverRow.driverCode}</span>
                    <span className="font-mono text-[10px] text-[#64748B] truncate">{driverRow.driverName || `#${driverRow.driverNumber}`}</span>
                  </div>

                  {/* Stint Bars Track */}
                  <div className="flex-1 relative h-7 bg-[#1C2230] rounded overflow-hidden flex items-center border border-[#2A3245]/40">
                    {driverRow.stints.map((stint, idx) => {
                      const start = Math.max(0, stint.lapStart - 1);
                      const end = Math.min(totalLaps, stint.lapEnd);
                      const stintLaps = Math.max(1, end - start);
                      const widthPct = (stintLaps / totalLaps) * 100;
                      const leftPct = (start / totalLaps) * 100;

                      const tyre = getTyreInfo(stint.compound);

                      return (
                        <div
                          key={idx}
                          className="absolute h-full flex items-center justify-center font-mono font-bold text-[10px] transition-all cursor-pointer border-r border-[#0B0E14] group/stint"
                          style={{
                            left: `${leftPct}%`,
                            width: `${widthPct}%`,
                            backgroundColor: tyre.hex,
                            color: tyre.code === 'H' ? '#0B0E14' : '#FFFFFF',
                          }}
                          onMouseEnter={() =>
                            setHoveredStint({
                              driver: driverRow.driverCode,
                              compound: tyre.name,
                              laps: stintLaps,
                              startLap: stint.lapStart,
                              endLap: stint.lapEnd,
                              pitDuration: stint.pitDuration,
                            })
                          }
                          onMouseLeave={() => setHoveredStint(null)}
                        >
                          <span className="truncate px-1 drop-shadow-sm">
                            {tyre.code} ({stintLaps}L)
                          </span>

                          {/* Pit Stop Marker on Right Edge if not final stint */}
                          {idx < driverRow.stints.length - 1 && (
                            <span
                              className="absolute right-0 top-0 bottom-0 w-1 bg-black/60"
                              title={`Pit Stop: Lap ${stint.lapEnd}`}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Dynamic Hover Details Pill */}
      {hoveredStint ? (
        <div className="p-2.5 bg-[#1C2230] border border-[#2A3245] rounded-lg font-mono text-xs flex flex-wrap items-center justify-between gap-3 text-white">
          <div className="flex items-center gap-2">
            <span className="font-bold text-amber-400">{hoveredStint.driver}</span>
            <span className="text-[#64748B]">|</span>
            <span>{hoveredStint.compound} Compound</span>
            <span className="text-[#64748B]">|</span>
            <span>Lap {hoveredStint.startLap} → Lap {hoveredStint.endLap} ({hoveredStint.laps} laps on set)</span>
          </div>
          {hoveredStint.pitDuration && (
            <span className="text-emerald-400 font-bold">Pit Stop: {hoveredStint.pitDuration}s</span>
          )}
        </div>
      ) : (
        <div className="p-2 bg-[#1C2230]/40 border border-[#2A3245]/40 rounded-lg font-mono text-[11px] text-[#64748B] text-center">
          Hover over any tyre stint segment to inspect compound lifecycle and pit stop duration
        </div>
      )}
    </div>
  );
}
