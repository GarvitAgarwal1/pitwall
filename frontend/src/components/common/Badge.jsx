import React from 'react';
import { getFlagInfo, getTyreInfo } from '../../utils/theme';

/**
 * FlagBadge
 * Displays race control status flags: Green, Yellow, SC, VSC, Red, Chequered
 */
export function FlagBadge({ flag = 'GREEN', size = 'sm', className = '' }) {
  const flagInfo = getFlagInfo(flag);
  const isLarge = size === 'lg';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-bold uppercase rounded tracking-wider border transition-all ${
        flagInfo.bgClass
      } ${
        isLarge
          ? 'px-3.5 py-1.5 text-sm tracking-widest shadow-md'
          : 'px-2.5 py-0.5 text-xs'
      } ${className}`}
    >
      <span
        className={`w-2 h-2 rounded-full ${
          flag.toUpperCase().includes('SC') || flag.toUpperCase().includes('RED')
            ? 'animate-ping'
            : ''
        }`}
        style={{ backgroundColor: flagInfo.hex }}
      />
      <span>{flagInfo.label}</span>
    </span>
  );
}

/**
 * TyreBadge
 * Displays Pirelli tyre compound (Soft, Medium, Hard, Inter, Wet) and optional tyre lap age
 */
export function TyreBadge({ compound = 'M', age, size = 'sm', className = '' }) {
  const tyre = getTyreInfo(compound);
  const isLarge = size === 'lg';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-bold rounded border ${
        tyre.bgClass
      } ${tyre.borderClass} ${tyre.textClass} ${
        isLarge ? 'px-2.5 py-1 text-sm' : 'px-1.5 py-0.5 text-xs'
      } ${className}`}
      title={`${tyre.name} Compound ${age ? `(${age} laps)` : ''}`}
    >
      {/* Circle Compound Letter */}
      <span
        className={`inline-flex items-center justify-center rounded-full font-black border ${
          tyre.borderClass
        } ${isLarge ? 'w-5 h-5 text-xs' : 'w-4 h-4 text-[10px]'}`}
        style={{ color: tyre.hex, borderColor: tyre.hex }}
      >
        {tyre.code}
      </span>
      {age !== undefined && age !== null && (
        <span className="tabular-nums opacity-90 text-[11px]">
          L{age}
        </span>
      )}
    </span>
  );
}

/**
 * StatusBadge
 * Displays session connection or driver status (LIVE, SIMULATED, REPLAY, ON TRACK, IN PIT)
 */
export function StatusBadge({ status = 'LIVE', variant, className = '' }) {
  const s = String(status).toUpperCase();

  let colorClasses = 'bg-[#1C2230] text-[#64748B] border-[#2A3245]';
  let dotColor = '#64748B';
  let pulse = false;

  if (s === 'LIVE') {
    colorClasses = 'bg-red-500/10 text-red-400 border-red-500/30';
    dotColor = '#E10600';
    pulse = true;
  } else if (s === 'SIMULATED' || s === 'REPLAY') {
    colorClasses = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    dotColor = '#F59E0B';
  } else if (s === 'ON TRACK' || s === 'ACTIVE') {
    colorClasses = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    dotColor = '#10B981';
  } else if (s === 'IN PIT' || s === 'PIT') {
    colorClasses = 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    dotColor = '#3B82F6';
  } else if (s === 'STOPPED' || s === 'RETIRED' || s === 'DNF') {
    colorClasses = 'bg-slate-700/30 text-slate-400 border-slate-600/30';
    dotColor = '#64748B';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-mono font-medium uppercase tracking-wider rounded-full border ${colorClasses} ${className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${pulse ? 'animate-pulse' : ''}`}
        style={{ backgroundColor: dotColor }}
      />
      <span>{status}</span>
    </span>
  );
}

export default function Badge({
  type = 'status',
  children,
  className = '',
  ...props
}) {
  if (type === 'flag') return <FlagBadge {...props} className={className} />;
  if (type === 'tyre') return <TyreBadge {...props} className={className} />;
  if (type === 'status') return <StatusBadge {...props} className={className} />;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium border border-[#2A3245] bg-[#1C2230] text-[#F8FAFC] ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
