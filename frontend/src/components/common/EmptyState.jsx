import React from 'react';
import { Radio, Gauge, RefreshCw, Compass } from 'lucide-react';

/**
 * EmptyState
 * Clean F1 racing placeholder when telemetry, session data, or search results are empty.
 */
export default function EmptyState({
  title = 'No Data Available',
  message = 'Telemetry stream is currently quiet or no data matches the current filters.',
  icon: CustomIcon,
  actionLabel,
  onAction,
  className = '',
}) {
  const IconComponent = CustomIcon || Radio;

  return (
    <div
      className={`min-h-[260px] w-full p-8 bg-[#151922] border border-[#2A3245] rounded-xl flex flex-col items-center justify-center text-center ${className}`}
    >
      {/* Visual Pit Garage Icon */}
      <div className="relative mb-4">
        <div className="w-16 h-16 rounded-2xl bg-[#1C2230] border border-[#2A3245] flex items-center justify-center text-[#64748B] shadow-inner">
          <IconComponent className="w-8 h-8 text-[#64748B]" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#E10600]/80 border-2 border-[#151922]" />
      </div>

      <h4 className="text-lg font-semibold text-[#F8FAFC] tracking-wide mb-1">
        {title}
      </h4>

      <p className="text-sm text-[#64748B] max-w-sm mb-5 leading-relaxed font-mono">
        {message}
      </p>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#1C2230] hover:bg-[#2A3245] border border-[#2A3245] hover:border-[#64748B] text-[#F8FAFC] text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#E10600]" />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
}

export { EmptyState };
