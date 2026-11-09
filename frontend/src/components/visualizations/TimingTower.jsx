import React from 'react';
import { getTeamColor } from '../../utils/theme';
import { TyreBadge } from '../common/Badge';
import { formatLapTime, formatDelta } from '../../utils/formatters';

/**
 * TimingTower Component
 * High-density 20-car live timing leaderboard mirroring Formula 1 pitwall monitors.
 */
export default function TimingTower({
  timingData = [],
  selectedDriverNumber = null,
  onSelectDriver,
  sessionBestLap = null,
}) {
  if (!timingData || !timingData.length) {
    return (
      <div className="h-64 flex flex-col items-center justify-center p-6 bg-[#12161F] border border-[#2A3245] rounded-xl text-center">
        <p className="font-mono text-sm text-[#64748B]">No live timing leaderboard data available.</p>
      </div>
    );
  }

  // Sort by position ascending
  const sortedDrivers = timingData
    .slice()
    .sort((a, b) => (Number(a.position) || 99) - (Number(b.position) || 99));

  // Determine overall session best lap if not explicitly passed
  const overallBestLap =
    sessionBestLap ||
    Math.min(
      ...sortedDrivers
        .map((d) => d.best_lap_time)
        .filter((t) => typeof t === 'number' && t > 0)
    );

  return (
    <div className="bg-[#12161F] border border-[#2A3245] rounded-xl overflow-hidden shadow-2xl">
      {/* Table Header */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse font-mono text-xs">
          <thead>
            <tr className="bg-[#151922] text-[#64748B] border-b border-[#2A3245] text-[11px] uppercase tracking-wider select-none">
              <th className="py-2.5 px-3 w-12 text-center">POS</th>
              <th className="py-2.5 px-2 w-10 text-center">NO</th>
              <th className="py-2.5 px-3 min-w-[130px]">DRIVER</th>
              <th className="py-2.5 px-3 text-right">GAP</th>
              <th className="py-2.5 px-3 text-right">INT</th>
              <th className="py-2.5 px-3 text-center">TYRE</th>
              <th className="py-2.5 px-3 text-right">LAST LAP</th>
              <th className="py-2.5 px-3 text-right hidden sm:table-cell">BEST LAP</th>
              <th className="py-2.5 px-3 text-center hidden md:table-cell">SECTORS</th>
              <th className="py-2.5 px-3 text-center w-14">PIT</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2A3245]/50">
            {sortedDrivers.map((driver) => {
              const teamColor = getTeamColor(driver.team_colour ? `#${driver.team_colour}` : driver.team_name);
              const isSelected = selectedDriverNumber === driver.driver_number;
              const isLeader = driver.position === 1;

              // Check if driver has overall fastest lap
              const isFastestInSession =
                driver.best_lap_time &&
                overallBestLap &&
                Math.abs(driver.best_lap_time - overallBestLap) < 0.005;

              // Parse interval for DRS eligibility
              let isDrsViable = false;
              if (typeof driver.interval === 'number') {
                isDrsViable = driver.interval > 0 && driver.interval <= 1.0;
              } else if (typeof driver.interval === 'string') {
                const num = parseFloat(driver.interval.replace('+', ''));
                if (!isNaN(num) && num > 0 && num <= 1.0) isDrsViable = true;
              }

              return (
                <tr
                  key={driver.driver_number || driver.driver_code}
                  onClick={() => onSelectDriver && onSelectDriver(driver)}
                  className={`group cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-[#E10600]/15 hover:bg-[#E10600]/25'
                      : 'hover:bg-[#1C2230]/70'
                  } ${driver.in_pit ? 'opacity-65' : ''}`}
                >
                  {/* Position */}
                  <td className="py-2.5 px-3 text-center font-bold">
                    <span
                      className={`inline-block w-6 text-center tabular-nums rounded py-0.5 ${
                        isLeader
                          ? 'bg-amber-500/20 text-amber-400 font-black'
                          : driver.position <= 3
                          ? 'text-white'
                          : 'text-[#94A3B8]'
                      }`}
                    >
                      {driver.position}
                    </span>
                  </td>

                  {/* Car Number */}
                  <td className="py-2.5 px-2 text-center">
                    <span className="font-bold text-[#64748B] text-[11px] tabular-nums">
                      {driver.driver_number}
                    </span>
                  </td>

                  {/* Driver Code & Name */}
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-1 h-4 rounded-full shrink-0"
                        style={{ backgroundColor: teamColor }}
                      />
                      <span className="font-bold text-white tracking-wide">
                        {driver.driver_code}
                      </span>
                      <span className="text-[11px] text-[#64748B] truncate hidden xl:inline">
                        {driver.driver_name}
                      </span>
                      {driver.in_pit && (
                        <span className="px-1 text-[9px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/40 rounded">
                          PIT
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Gap to Leader */}
                  <td className="py-2.5 px-3 text-right font-medium text-white tabular-nums">
                    {isLeader ? (
                      <span className="text-amber-400 font-bold">LEADER</span>
                    ) : (
                      formatDelta(driver.gap_to_leader)
                    )}
                  </td>

                  {/* Interval Ahead */}
                  <td className="py-2.5 px-3 text-right tabular-nums">
                    {isLeader ? (
                      <span className="text-[#64748B]">-</span>
                    ) : (
                      <div className="flex items-center justify-end gap-1.5">
                        <span
                          className={`font-medium ${
                            isDrsViable ? 'text-emerald-400 font-bold' : 'text-[#94A3B8]'
                          }`}
                        >
                          {formatDelta(driver.interval)}
                        </span>
                        {isDrsViable && (
                          <span
                            className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"
                            title="Within 1.000s DRS activation range"
                          />
                        )}
                      </div>
                    )}
                  </td>

                  {/* Tyre Badge & Age */}
                  <td className="py-2.5 px-3 text-center">
                    <TyreBadge
                      compound={driver.tyre_compound || 'M'}
                      age={driver.tyre_age}
                      size="sm"
                    />
                  </td>

                  {/* Last Lap Time */}
                  <td className="py-2.5 px-3 text-right font-bold tabular-nums">
                    <span
                      className={
                        isFastestInSession
                          ? 'text-purple-400 font-black'
                          : 'text-white'
                      }
                    >
                      {formatLapTime(driver.last_lap_time)}
                    </span>
                  </td>

                  {/* Best Lap Time */}
                  <td className="py-2.5 px-3 text-right font-medium text-[#94A3B8] tabular-nums hidden sm:table-cell">
                    <span className={isFastestInSession ? 'text-purple-400 font-bold' : ''}>
                      {formatLapTime(driver.best_lap_time)}
                    </span>
                  </td>

                  {/* Mini Sectors S1, S2, S3 */}
                  <td className="py-2.5 px-3 text-center hidden md:table-cell">
                    <div className="inline-flex items-center gap-1">
                      <span
                        className="w-2 h-2 rounded-full bg-emerald-500"
                        title={driver.sector_1 ? `S1: ${driver.sector_1}s` : 'S1'}
                      />
                      <span
                        className="w-2 h-2 rounded-full bg-emerald-500"
                        title={driver.sector_2 ? `S2: ${driver.sector_2}s` : 'S2'}
                      />
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isFastestInSession ? 'bg-purple-500 animate-pulse' : 'bg-emerald-500'
                        }`}
                        title={driver.sector_3 ? `S3: ${driver.sector_3}s` : 'S3'}
                      />
                    </div>
                  </td>

                  {/* Pit Stop Count */}
                  <td className="py-2.5 px-3 text-center font-bold text-[#94A3B8] tabular-nums">
                    {driver.pit_stop_count !== undefined && driver.pit_stop_count !== null
                      ? driver.pit_stop_count
                      : '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Leaderboard Legend Footer */}
      <div className="p-2.5 bg-[#151922] border-t border-[#2A3245] flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-[#64748B]">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            <span className="text-purple-300">Fastest Lap</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-emerald-400">DRS Range (&lt; 1.0s)</span>
          </span>
        </div>
        <span>Click any row to select driver</span>
      </div>
    </div>
  );
}
