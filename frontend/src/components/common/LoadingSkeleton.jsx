import React from 'react';

/**
 * LoadingSkeleton
 * Geometric pulse skeleton loaders for cards, tables, charts, and text lines.
 * Designed to eliminate Cumulative Layout Shift (CLS = 0) while data streams in.
 */

export function SkeletonLine({ className = 'h-4 w-full', rounded = 'rounded' }) {
  return (
    <div
      className={`animate-pulse bg-[#1C2230] border border-[#2A3245]/50 ${rounded} ${className}`}
    />
  );
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`p-5 bg-[#151922] border border-[#2A3245] rounded-xl space-y-4 animate-pulse ${className}`}>
      <div className="flex items-center justify-between">
        <div className="h-4 w-28 bg-[#1C2230] rounded" />
        <div className="h-4 w-12 bg-[#1C2230] rounded-full" />
      </div>
      <div className="h-8 w-3/4 bg-[#1C2230] rounded" />
      <div className="space-y-2 pt-2">
        <div className="h-3 w-full bg-[#1C2230] rounded" />
        <div className="h-3 w-5/6 bg-[#1C2230] rounded" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 6, cols = 5, className = '' }) {
  return (
    <div className={`w-full bg-[#151922] border border-[#2A3245] rounded-xl overflow-hidden ${className}`}>
      {/* Table Header Skeleton */}
      <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-[#1C2230]/60 border-b border-[#2A3245]">
        {Array.from({ length: cols }).map((_, i) => (
          <div
            key={i}
            className="h-3.5 bg-[#2A3245] rounded col-span-2 first:col-span-1 last:col-span-3 animate-pulse"
          />
        ))}
      </div>

      {/* Table Rows Skeleton */}
      <div className="divide-y divide-[#2A3245]/40">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div key={rIdx} className="grid grid-cols-12 gap-4 px-4 py-3.5 items-center animate-pulse">
            <div className="h-4 w-6 bg-[#1C2230] rounded col-span-1" />
            <div className="h-4 w-16 bg-[#1C2230] rounded col-span-2" />
            <div className="h-4 w-24 bg-[#1C2230] rounded col-span-3" />
            <div className="h-4 w-16 bg-[#1C2230] rounded col-span-2 font-mono" />
            <div className="h-4 w-20 bg-[#1C2230] rounded col-span-4" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonChart({ height = 'h-72', className = '' }) {
  return (
    <div className={`p-5 bg-[#151922] border border-[#2A3245] rounded-xl flex flex-col justify-between ${height} ${className} animate-pulse`}>
      <div className="flex items-center justify-between mb-4">
        <div className="h-4 w-36 bg-[#1C2230] rounded" />
        <div className="flex gap-2">
          <div className="h-5 w-12 bg-[#1C2230] rounded-full" />
          <div className="h-5 w-12 bg-[#1C2230] rounded-full" />
        </div>
      </div>
      
      {/* Simulated chart grid and waves */}
      <div className="flex-1 w-full flex items-end gap-2 pb-4 pt-2 border-b border-l border-[#2A3245]/70">
        {Array.from({ length: 16 }).map((_, i) => {
          const heightPercent = 25 + ((i * 19) % 65);
          return (
            <div
              key={i}
              style={{ height: `${heightPercent}%` }}
              className="flex-1 bg-[#1C2230] rounded-t opacity-70"
            />
          );
        })}
      </div>

      <div className="flex justify-between pt-2">
        <div className="h-3 w-8 bg-[#1C2230] rounded" />
        <div className="h-3 w-8 bg-[#1C2230] rounded" />
        <div className="h-3 w-8 bg-[#1C2230] rounded" />
        <div className="h-3 w-8 bg-[#1C2230] rounded" />
      </div>
    </div>
  );
}

export default function LoadingSkeleton({ variant = 'card', ...props }) {
  switch (variant) {
    case 'table':
      return <SkeletonTable {...props} />;
    case 'chart':
      return <SkeletonChart {...props} />;
    case 'line':
      return <SkeletonLine {...props} />;
    case 'card':
    default:
      return <SkeletonCard {...props} />;
  }
}
