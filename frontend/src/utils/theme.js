/**
 * PitWall Formula 1 Theme & Color Utilities
 * Authentic dark racing aesthetic, constructor livery colors, Pirelli tyre codes, and telemetry trace palettes.
 */

export const TEAM_COLORS = {
  // Official 2024 / 2025 Constructor Hex Codes
  redbull: '#3671C6',
  ferrari: '#E80020',
  mercedes: '#27F4D2',
  mclaren: '#FF8000',
  astonmartin: '#229971',
  alpine: '#0093CC',
  williams: '#64C4FF',
  rb: '#6692FF',
  sauber: '#52E252',
  haas: '#B6BABD',

  // Fallbacks
  default: '#64748B',
};

// Aliases and slug mappings for team identifiers
const TEAM_ALIASES = {
  'red bull': TEAM_COLORS.redbull,
  'red bull racing': TEAM_COLORS.redbull,
  'red_bull': TEAM_COLORS.redbull,
  'redbull': TEAM_COLORS.redbull,
  'rbr': TEAM_COLORS.redbull,

  'ferrari': TEAM_COLORS.ferrari,
  'scuderia ferrari': TEAM_COLORS.ferrari,

  'mercedes': TEAM_COLORS.mercedes,
  'mercedes-amg': TEAM_COLORS.mercedes,
  'mercedes amg': TEAM_COLORS.mercedes,

  'mclaren': TEAM_COLORS.mclaren,
  'mclaren f1 team': TEAM_COLORS.mclaren,

  'aston martin': TEAM_COLORS.astonmartin,
  'aston_martin': TEAM_COLORS.astonmartin,
  'astonmartin': TEAM_COLORS.astonmartin,

  'alpine': TEAM_COLORS.alpine,
  'alpine f1 team': TEAM_COLORS.alpine,

  'williams': TEAM_COLORS.williams,
  'williams racing': TEAM_COLORS.williams,

  'rb': TEAM_COLORS.rb,
  'racing bulls': TEAM_COLORS.rb,
  'alphatauri': TEAM_COLORS.rb,
  'visa cash app rb': TEAM_COLORS.rb,

  'sauber': TEAM_COLORS.sauber,
  'kick sauber': TEAM_COLORS.sauber,
  'stake f1 team kick sauber': TEAM_COLORS.sauber,
  'alfa romeo': TEAM_COLORS.sauber,

  'haas': TEAM_COLORS.haas,
  'haas f1 team': TEAM_COLORS.haas,
  'moneygram haas f1 team': TEAM_COLORS.haas,
};

/**
 * Returns hex color string for a given constructor or team name
 * @param {string} identifier - Team name, slug, or constructor ID
 * @returns {string} Hex color code
 */
export function getTeamColor(identifier) {
  if (!identifier) return TEAM_COLORS.default;
  const key = String(identifier).trim().toLowerCase();
  return TEAM_ALIASES[key] || TEAM_COLORS[key] || TEAM_COLORS.default;
}

export const TYRE_COMPOUNDS = {
  SOFT: {
    code: 'S',
    name: 'Soft',
    hex: '#EF4444',
    bgClass: 'bg-red-500/20',
    borderClass: 'border-red-500',
    textClass: 'text-red-400',
  },
  MEDIUM: {
    code: 'M',
    name: 'Medium',
    hex: '#F59E0B',
    bgClass: 'bg-amber-500/20',
    borderClass: 'border-amber-500',
    textClass: 'text-amber-400',
  },
  HARD: {
    code: 'H',
    name: 'Hard',
    hex: '#F8FAFC',
    bgClass: 'bg-slate-200/20',
    borderClass: 'border-slate-200',
    textClass: 'text-slate-100',
  },
  INTERMEDIATE: {
    code: 'I',
    name: 'Intermediate',
    hex: '#10B981',
    bgClass: 'bg-emerald-500/20',
    borderClass: 'border-emerald-500',
    textClass: 'text-emerald-400',
  },
  WET: {
    code: 'W',
    name: 'Wet',
    hex: '#3B82F6',
    bgClass: 'bg-blue-500/20',
    borderClass: 'border-blue-500',
    textClass: 'text-blue-400',
  },
  UNKNOWN: {
    code: '?',
    name: 'Unknown',
    hex: '#64748B',
    bgClass: 'bg-slate-500/20',
    borderClass: 'border-slate-500',
    textClass: 'text-slate-400',
  },
};

/**
 * Returns compound styling metadata
 * @param {string} compoundStr - 'SOFT', 'MEDIUM', 'HARD', 'INTERMEDIATE', 'WET' or shorthand 'S', 'M', 'H', 'I', 'W'
 */
export function getTyreInfo(compoundStr) {
  if (!compoundStr) return TYRE_COMPOUNDS.UNKNOWN;
  const c = String(compoundStr).trim().toUpperCase();

  if (c === 'S' || c.includes('SOFT')) return TYRE_COMPOUNDS.SOFT;
  if (c === 'M' || c.includes('MED')) return TYRE_COMPOUNDS.MEDIUM;
  if (c === 'H' || c.includes('HARD')) return TYRE_COMPOUNDS.HARD;
  if (c === 'I' || c.includes('INTER')) return TYRE_COMPOUNDS.INTERMEDIATE;
  if (c === 'W' || c.includes('WET')) return TYRE_COMPOUNDS.WET;

  return TYRE_COMPOUNDS.UNKNOWN;
}

export const TELEMETRY_COLORS = {
  speed: '#00F0FF',    // Cyan neon
  throttle: '#00E676', // Neon green
  brake: '#FF1744',    // Neon red
  gear: '#FFD600',     // Yellow
  drs: '#7C4DFF',      // Purple
  delta: '#F59E0B',    // Amber
  rpm: '#EC4899',      // Pink
  driver1: '#00F0FF',  // Blue / Cyan
  driver2: '#FF8000',  // Orange Papaya
};

export const FLAG_COLORS = {
  GREEN: {
    label: 'GREEN FLAG',
    hex: '#10B981',
    bgClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500',
  },
  YELLOW: {
    label: 'YELLOW FLAG',
    hex: '#F59E0B',
    bgClass: 'bg-amber-500/20 text-amber-400 border-amber-500',
  },
  SC: {
    label: 'SAFETY CAR',
    hex: '#F59E0B',
    bgClass: 'bg-amber-500 text-black font-bold border-amber-400 animate-pulse',
  },
  VSC: {
    label: 'VIRTUAL SAFETY CAR',
    hex: '#EAB308',
    bgClass: 'bg-yellow-400 text-black font-bold border-yellow-300 animate-pulse',
  },
  RED: {
    label: 'RED FLAG',
    hex: '#EF4444',
    bgClass: 'bg-red-600 text-white font-bold border-red-500 animate-pulse',
  },
  CHEQUERED: {
    label: 'CHEQUERED FLAG',
    hex: '#FFFFFF',
    bgClass: 'bg-neutral-800 text-white border-white',
  },
  BLUE: {
    label: 'BLUE FLAG',
    hex: '#3B82F6',
    bgClass: 'bg-blue-500/20 text-blue-400 border-blue-500',
  },
  PURPLE: {
    label: 'FASTEST LAP',
    hex: '#B537F2',
    bgClass: 'bg-purple-500/20 text-purple-300 border-purple-500',
  },
};

/**
 * Returns flag styling metadata
 * @param {string} flag - Flag type
 */
export function getFlagInfo(flag) {
  if (!flag) return FLAG_COLORS.GREEN;
  const f = String(flag).trim().toUpperCase();

  if (f.includes('SC') && !f.includes('VSC')) return FLAG_COLORS.SC;
  if (f.includes('VSC') || f.includes('VIRTUAL')) return FLAG_COLORS.VSC;
  if (f.includes('RED')) return FLAG_COLORS.RED;
  if (f.includes('YELLOW')) return FLAG_COLORS.YELLOW;
  if (f.includes('CHEQUER')) return FLAG_COLORS.CHEQUERED;
  if (f.includes('BLUE')) return FLAG_COLORS.BLUE;
  if (f.includes('PURPLE') || f.includes('FASTEST')) return FLAG_COLORS.PURPLE;
  return FLAG_COLORS.GREEN;
}
