import React, { useState } from 'react';
import {
  Sliders,
  Moon,
  Sun,
  Gauge,
  Thermometer,
  Trophy,
  Volume2,
  VolumeX,
  Sparkles,
  Check,
  RefreshCw,
  Cpu,
} from 'lucide-react';
import { CONSTRUCTOR_LIVERIES } from '../utils/drivers';
import DriverAvatar from '../components/common/DriverAvatar';

export default function SettingsPage({
  theme = 'dark',
  onToggleTheme,
  speedUnit = 'km/h',
  onChangeSpeedUnit,
  tempUnit = 'C',
  onChangeTempUnit,
  favoriteTeam = 'ferrari',
  onChangeFavoriteTeam,
}) {
  const [radioSound, setRadioSound] = useState(true);
  const [pollingRate, setPollingRate] = useState(5);
  const [saveToast, setSaveToast] = useState(false);

  const handleSave = () => {
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* 1. Header */}
      <div className="bg-[#12161F] border border-[#2A3245] rounded-xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#E10600]/20 text-[#E10600] border border-[#E10600]/40 uppercase tracking-wider">
                System Preferences
              </span>
              <span className="text-xs font-mono text-[#64748B]">Personalization & Metrics</span>
            </div>
            <h2 className="text-xl lg:text-2xl font-display font-black text-white tracking-wide uppercase">
              Dashboard Settings & Theme Options
            </h2>
          </div>

          {saveToast && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500 text-xs font-mono animate-in fade-in">
              <Check className="w-4 h-4" />
              <span>Settings Saved Successfully</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Theme & Visual Style Settings */}
      <div className="bg-[#12161F] border border-[#2A3245] rounded-xl p-6 shadow-xl space-y-6">
        <div className="flex items-center gap-2 pb-3 border-b border-[#2A3245]">
          <Sun className="w-5 h-5 text-amber-400" />
          <h3 className="font-bold text-white uppercase text-sm tracking-wider">
            Display Appearance & Theme Mode
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Dark Mode Card */}
          <button
            onClick={() => onToggleTheme && onToggleTheme('dark')}
            className={`p-5 rounded-xl border text-left transition-all relative overflow-hidden ${
              theme === 'dark'
                ? 'bg-[#151922] border-[#E10600] shadow-lg shadow-red-950/30'
                : 'bg-[#151922]/40 border-[#2A3245] hover:border-[#64748B]'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#0B0E14] border border-[#2A3245] text-white">
                  <Moon className="w-5 h-5 text-[#00F0FF]" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Dark Racing Theme</h4>
                  <p className="text-xs text-[#64748B] font-mono">High-contrast paddock cockpit</p>
                </div>
              </div>
              {theme === 'dark' && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#E10600] text-white">
                  ACTIVE
                </span>
              )}
            </div>

            <div className="h-10 rounded bg-[#0B0E14] border border-[#2A3245] p-2 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#E10600]" />
              <div className="w-16 h-2 rounded bg-[#2A3245]" />
              <div className="w-8 h-2 rounded bg-[#00F0FF]" />
            </div>
          </button>

          {/* Light Mode Card */}
          <button
            onClick={() => onToggleTheme && onToggleTheme('light')}
            className={`p-5 rounded-xl border text-left transition-all relative overflow-hidden ${
              theme === 'light'
                ? 'bg-[#1C2230] border-[#E10600] shadow-lg shadow-red-950/30'
                : 'bg-[#151922]/40 border-[#2A3245] hover:border-[#64748B]'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400">
                  <Sun className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Light PitWall Theme</h4>
                  <p className="text-xs text-[#64748B] font-mono">Clean daytime technical timing</p>
                </div>
              </div>
              {theme === 'light' && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#E10600] text-white">
                  ACTIVE
                </span>
              )}
            </div>

            <div className="h-10 rounded bg-[#F8FAFC] border border-slate-300 p-2 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#E10600]" />
              <div className="w-16 h-2 rounded bg-slate-300" />
              <div className="w-8 h-2 rounded bg-blue-500" />
            </div>
          </button>
        </div>
      </div>

      {/* 3. Measurement Units */}
      <div className="bg-[#12161F] border border-[#2A3245] rounded-xl p-6 shadow-xl space-y-6">
        <div className="flex items-center gap-2 pb-3 border-b border-[#2A3245]">
          <Gauge className="w-5 h-5 text-[#00F0FF]" />
          <h3 className="font-bold text-white uppercase text-sm tracking-wider">
            Units & Telemetry Measurements
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Speed Unit */}
          <div>
            <label className="block text-xs font-mono text-[#94A3B8] mb-2 uppercase tracking-wider">
              Speed Metric Unit
            </label>
            <div className="grid grid-cols-2 gap-3">
              {['km/h', 'mph'].map((unit) => (
                <button
                  key={unit}
                  onClick={() => onChangeSpeedUnit && onChangeSpeedUnit(unit)}
                  className={`p-3 rounded-lg border font-mono font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                    speedUnit === unit
                      ? 'bg-[#E10600]/20 border-[#E10600] text-white'
                      : 'bg-[#1C2230] border-[#2A3245] text-[#94A3B8] hover:text-white'
                  }`}
                >
                  <Gauge className="w-4 h-4 text-[#00F0FF]" />
                  <span>{unit.toUpperCase()}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Temperature Unit */}
          <div>
            <label className="block text-xs font-mono text-[#94A3B8] mb-2 uppercase tracking-wider">
              Track & Air Temperature Unit
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'C', label: 'Celsius (°C)' },
                { id: 'F', label: 'Fahrenheit (°F)' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => onChangeTempUnit && onChangeTempUnit(t.id)}
                  className={`p-3 rounded-lg border font-mono font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                    tempUnit === t.id
                      ? 'bg-[#E10600]/20 border-[#E10600] text-white'
                      : 'bg-[#1C2230] border-[#2A3245] text-[#94A3B8] hover:text-white'
                  }`}
                >
                  <Thermometer className="w-4 h-4 text-amber-400" />
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. 2026 Constructor Liveries & Favorite Team Selector */}
      <div className="bg-[#12161F] border border-[#2A3245] rounded-xl p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-[#2A3245]">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white uppercase text-sm tracking-wider">
              2026 Constructor Liveries & Primary Team Accent
            </h3>
          </div>
          <span className="text-xs font-mono text-[#64748B]">Click a team to set dashboard livery accent</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {Object.entries(CONSTRUCTOR_LIVERIES).map(([id, team]) => {
            const isSelected = favoriteTeam === id;
            return (
              <button
                key={id}
                onClick={() => {
                  onChangeFavoriteTeam && onChangeFavoriteTeam(id);
                  handleSave();
                }}
                className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden group ${
                  isSelected
                    ? 'bg-[#1C2230] border-[#E10600] shadow-lg'
                    : 'bg-[#151922] border-[#2A3245] hover:border-[#64748B]'
                }`}
              >
                {/* Livery Top Color Strip */}
                <div
                  className="h-2 rounded mb-2.5 transition-transform group-hover:scale-y-125"
                  style={{ backgroundColor: team.primary }}
                />

                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-xs text-white truncate">{team.name}</h4>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#E10600]" />}
                </div>

                <p className="text-[10px] font-mono text-[#64748B] mb-2">{team.engine}</p>

                {/* Driver pair avatars */}
                <div className="flex items-center gap-1.5 pt-2 border-t border-[#2A3245]/50">
                  {team.drivers.map((dCode) => (
                    <DriverAvatar key={dCode} code={dCode} size="sm" showNumber />
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Telemetry Polling & Live Stream Engine */}
      <div className="bg-[#12161F] border border-[#2A3245] rounded-xl p-6 shadow-xl space-y-6">
        <div className="flex items-center gap-2 pb-3 border-b border-[#2A3245]">
          <Cpu className="w-5 h-5 text-purple-400" />
          <h3 className="font-bold text-white uppercase text-sm tracking-wider">
            Live Stream Polling & Audio Radio
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Polling Interval */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono text-[#94A3B8] uppercase tracking-wider">
                Live Timing Polling Rate
              </label>
              <span className="text-xs font-mono font-bold text-[#E10600]">{pollingRate}s</span>
            </div>
            <input
              type="range"
              min="2"
              max="15"
              step="1"
              value={pollingRate}
              onChange={(e) => setPollingRate(Number(e.target.value))}
              className="w-full accent-[#E10600] bg-[#1C2230] h-2 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-[#64748B] mt-1">
              <span>2s (High Frequency)</span>
              <span>5s (Recommended)</span>
              <span>15s (Conserve Bandwidth)</span>
            </div>
          </div>

          {/* Team Radio Sound */}
          <div className="flex items-center justify-between p-4 bg-[#151922] border border-[#2A3245] rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#1C2230] text-[#00F0FF]">
                {radioSound ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 text-[#64748B]" />}
              </div>
              <div>
                <h4 className="font-bold text-xs text-white">Race Control Audio Beeps</h4>
                <p className="text-[11px] font-mono text-[#64748B]">Sound alert on Safety Car & Red Flags</p>
              </div>
            </div>

            <button
              onClick={() => setRadioSound(!radioSound)}
              className={`w-12 h-6 rounded-full p-1 transition-colors ${
                radioSound ? 'bg-[#E10600]' : 'bg-[#2A3245]'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  radioSound ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
