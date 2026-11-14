import React, { useState } from 'react';
import { getDriverProfile } from '../../utils/drivers';
import { getTeamColor } from '../../utils/theme';

/**
 * DriverAvatar Component
 * Displays real high-resolution driver photo with team livery border,
 * automatically falling back to a sleek vector helmet badge on network or load error.
 */
export default function DriverAvatar({
  code,
  name,
  team,
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl'
  showNumber = false,
  className = '',
}) {
  const profile = getDriverProfile(code || name);
  const [hasError, setHasError] = useState(false);

  const teamColor = getTeamColor(profile?.teamId || profile?.team || team);

  const sizeClasses = {
    sm: 'w-8 h-8 text-[10px]',
    md: 'w-11 h-11 text-xs',
    lg: 'w-16 h-16 text-sm',
    xl: 'w-24 h-24 text-base',
  };

  const imageSrc = profile?.image;

  return (
    <div className={`relative shrink-0 ${sizeClasses[size] || sizeClasses.md} ${className}`}>
      <div
        className="w-full h-full rounded-full overflow-hidden bg-[#1C2230] border-2 shadow-md flex items-center justify-center transition-transform hover:scale-105"
        style={{ borderColor: teamColor }}
      >
        {!hasError && imageSrc ? (
          <img
            src={imageSrc}
            alt={profile?.name || name || code || 'F1 Driver'}
            className="w-full h-full object-cover object-top"
            loading="lazy"
            onError={() => setHasError(true)}
          />
        ) : (
          <div
            className="w-full h-full flex flex-col items-center justify-center font-mono font-black"
            style={{ backgroundColor: `${teamColor}25`, color: teamColor }}
          >
            <span className="leading-none">{profile?.code || code?.slice(0, 3) || 'F1'}</span>
          </div>
        )}
      </div>

      {/* Optional Car Number Badge */}
      {showNumber && profile?.number && (
        <span
          className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full text-[9px] font-mono font-black text-white shadow-sm border border-black/40"
          style={{ backgroundColor: teamColor }}
        >
          {profile.number}
        </span>
      )}
    </div>
  );
}
