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

  const isLight = theme === 'light';

  const handleSave = () => {
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* 1. Header */}
      <div className={`border rounded-xl p-5 shadow-sm transition-colors ${
        isLight
          ? 'bg-white border-slate-200 text-slate-900 shadow-sm'
          : 'bg-[#12161F] border-[#2A3245] text-white shadow-xl'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#E10600]/15 text-[#E10600] border border-[#E10600]/30 uppercase tracking-wider">
                System Preferences
              </span>
              <span className={`text-xs font-mono ${isLight ? 'text-slate-500' : 'text-[#64748B]'}`}>
                Personalization & Metrics
              </span>
            </div>
            <h2 className={`text-xl lg:text-2xl font-black italic tracking-tight uppercase ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}>
              Dashboard Settings & Theme Options
            </h2>
          </div>

          {saveToast && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500 text-xs font-mono animate-in fade-in">
              <Check className="w-4 h-4" />
              <span>Settings Saved Successfully</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Theme & Visual Style Settings */}
      <div className={`border rounded-xl p-6 space-y-6 transition-colors ${
        isLight
          ? 'bg-white border-slate-200 text-slate-900 shadow-sm'
          : 'bg-[#12161F] border-[#2A3245] text-white shadow-xl'
      }`}>
        <div className={`flex items-center gap-2 pb-3 border-b ${isLight ? 'border-slate-200' : 'border-[#2A3245]'}`}>
          <Sun className="w-5 h-5 text-amber-500" />
          <h3 className={`font-bold uppercase text-sm tracking-wider ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Display Appearance & Theme Mode
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Dark Mode Card */}
          <button
            onClick={() => onToggleTheme && onToggleTheme('dark')}
            className={`p-5 rounded-xl border text-left transition-all relative overflow-hidden ${
              theme === 'dark'
                ? isLight
                  ? 'bg-slate-100 border-[#E10600] ring-2 ring-[#E10600]/30 shadow-md'
                  : 'bg-[#151922] border-[#E10600] shadow-lg shadow-red-950/40 ring-1 ring-[#E10600]'
                : isLight
                  ? 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  : 'bg-[#151922]/40 border-[#2A3245] hover:border-[#64748B]'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg border ${
                  isLight ? 'bg-slate-800 border-slate-700 text-white' : 'bg-[#0B0E14] border-[#2A3245] text-white'
                }`}>
                  <Moon className="w-5 h-5 text-[#00F0FF]" />
                </div>
                <div>
                  <h4 className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    Dark Racing Theme
                  </h4>
                  <p className={`text-xs font-mono ${isLight ? 'text-slate-500' : 'text-[#64748B]'}`}>
                    High-contrast paddock cockpit
                  </p>
                </div>
              </div>
              {theme === 'dark' && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#E10600] text-white">
                  ACTIVE
                </span>
              )}
            </div>

            <div className={`h-10 rounded p-2 flex items-center gap-2 border ${
              isLight ? 'bg-slate-900 border-slate-700' : 'bg-[#0B0E14] border-[#2A3245]'
            }`}>
              <div className="w-2 h-2 rounded-full bg-[#E10600]" />
              <div className="w-16 h-2 rounded bg-slate-700" />
              <div className="w-8 h-2 rounded bg-[#00F0FF]" />
            </div>
          </button>

          {/* Light Mode Card */}
          <button
            onClick={() => onToggleTheme && onToggleTheme('light')}
            className={`p-5 rounded-xl border text-left transition-all relative overflow-hidden ${
              theme === 'light'
                ? isLight
                  ? 'bg-amber-50/50 border-[#E10600] ring-2 ring-[#E10600]/30 shadow-md'
                  : 'bg-[#1C2230] border-[#E10600] shadow-lg ring-1 ring-[#E10600]'
                : isLight
                  ? 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  : 'bg-[#151922]/40 border-[#2A3245] hover:border-[#64748B]'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg border ${
                  isLight ? 'bg-amber-100 border-amber-300 text-amber-600' : 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                }`}>
                  <Sun className="w-5 h-5" />
                </div>
                <div>
                  <h4 className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    Light PitWall Theme
                  </h4>
                  <p className={`text-xs font-mono ${isLight ? 'text-slate-500' : 'text-[#64748B]'}`}>
                    Clean daytime technical timing
                  </p>
                </div>
              </div>
              {theme === 'light' && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#E10600] text-white">
                  ACTIVE
                </span>
              )}
            </div>

            <div className={`h-10 rounded p-2 flex items-center gap-2 border ${
              isLight ? 'bg-white border-slate-300' : 'bg-[#F8FAFC] border-slate-300'
            }`}>
              <div className="w-2 h-2 rounded-full bg-[#E10600]" />
              <div className="w-16 h-2 rounded bg-slate-300" />
              <div className="w-8 h-2 rounded bg-blue-500" />
            </div>
          </button>
        </div>
      </div>

      {/* 3. Measurement Units */}
      <div className={`border rounded-xl p-6 space-y-6 transition-colors ${
        isLight
          ? 'bg-white border-slate-200 text-slate-900 shadow-sm'
          : 'bg-[#12161F] border-[#2A3245] text-white shadow-xl'
      }`}>
        <div className={`flex items-center gap-2 pb-3 border-b ${isLight ? 'border-slate-200' : 'border-[#2A3245]'}`}>
          <Gauge className="w-5 h-5 text-[#00F0FF]" />
          <h3 className={`font-bold uppercase text-sm tracking-wider ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Units & Telemetry Measurements
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Speed Unit */}
          <div>
            <label className={`block text-xs font-mono mb-2 uppercase tracking-wider ${
              isLight ? 'text-slate-600' : 'text-[#94A3B8]'
            }`}>
              Speed Metric Unit
            </label>
            <div className="grid grid-cols-2 gap-3">
              {['km/h', 'mph'].map((unit) => (
                <button
                  key={unit}
                  onClick={() => onChangeSpeedUnit && onChangeSpeedUnit(unit)}
                  className={`p-3 rounded-lg border font-mono font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                    speedUnit === unit
                      ? 'bg-[#E10600]/15 border-[#E10600] text-[#E10600] ring-1 ring-[#E10600]'
                      : isLight
                        ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
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
            <label className={`block text-xs font-mono mb-2 uppercase tracking-wider ${
              isLight ? 'text-slate-600' : 'text-[#94A3B8]'
            }`}>
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
                      ? 'bg-[#E10600]/15 border-[#E10600] text-[#E10600] ring-1 ring-[#E10600]'
                      : isLight
                        ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                        : 'bg-[#1C2230] border-[#2A3245] text-[#94A3B8] hover:text-white'
                  }`}
                >
                  <Thermometer className="w-4 h-4 text-amber-500" />
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. 2026 Constructor Liveries & Favorite Team Selector */}
      <div className={`border rounded-xl p-6 space-y-6 transition-colors ${
        isLight
          ? 'bg-white border-slate-200 text-slate-900 shadow-sm'
          : 'bg-[#12161F] border-[#2A3245] text-white shadow-xl'
      }`}>
        <div className={`flex items-center justify-between pb-3 border-b ${isLight ? 'border-slate-200' : 'border-[#2A3245]'}`}>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h3 className={`font-bold uppercase text-sm tracking-wider ${isLight ? 'text-slate-900' : 'text-white'}`}>
              2026 Constructor Liveries & Primary Team Accent
            </h3>
          </div>
          <span className={`text-xs font-mono hidden sm:inline ${isLight ? 'text-slate-500' : 'text-[#64748B]'}`}>
            Click a team to set livery accent
          </span>
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
                    ? isLight
                      ? 'bg-slate-100 border-[#E10600] ring-1 ring-[#E10600] shadow-sm'
                      : 'bg-[#1C2230] border-[#E10600] shadow-lg ring-1 ring-[#E10600]'
                    : isLight
                      ? 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100/50'
                      : 'bg-[#151922] border-[#2A3245] hover:border-[#64748B]'
                }`}
              >
                {/* Livery Top Color Strip */}
                <div
                  className="h-2 rounded mb-2.5 transition-transform group-hover:scale-y-125"
                  style={{ backgroundColor: team.primary }}
                />

                <div className="flex items-center justify-between mb-1">
                  <h4 className={`font-bold text-xs truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {team.name}
                  </h4>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#E10600]" />}
                </div>

                <p className={`text-[10px] font-mono mb-2 ${isLight ? 'text-slate-500' : 'text-[#64748B]'}`}>
                  {team.engine}
                </p>

                {/* Driver pair avatars */}
                <div className={`flex items-center gap-1.5 pt-2 border-t ${isLight ? 'border-slate-200' : 'border-[#2A3245]/50'}`}>
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
      <div className={`border rounded-xl p-6 space-y-6 transition-colors ${
        isLight
          ? 'bg-white border-slate-200 text-slate-900 shadow-sm'
          : 'bg-[#12161F] border-[#2A3245] text-white shadow-xl'
      }`}>
        <div className={`flex items-center gap-2 pb-3 border-b ${isLight ? 'border-slate-200' : 'border-[#2A3245]'}`}>
          <Cpu className="w-5 h-5 text-purple-500" />
          <h3 className={`font-bold uppercase text-sm tracking-wider ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Live Stream Polling & Audio Radio
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Polling Interval */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={`text-xs font-mono uppercase tracking-wider ${isLight ? 'text-slate-600' : 'text-[#94A3B8]'}`}>
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
              className={`w-full accent-[#E10600] h-2 rounded-lg cursor-pointer ${
                isLight ? 'bg-slate-200' : 'bg-[#1C2230]'
              }`}
            />
            <div className={`flex justify-between text-[10px] font-mono mt-1 ${isLight ? 'text-slate-500' : 'text-[#64748B]'}`}>
              <span>2s (High Frequency)</span>
              <span>5s (Recommended)</span>
              <span>15s (Conserve Bandwidth)</span>
            </div>
          </div>

          {/* Team Radio Sound */}
          <div className={`flex items-center justify-between p-4 border rounded-xl ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#151922] border-[#2A3245]'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isLight ? 'bg-slate-200 text-slate-700' : 'bg-[#1C2230] text-[#00F0FF]'}`}>
                {radioSound ? <Volume2 className="w-5 h-5" /> : <VolumeX className={`w-5 h-5 ${isLight ? 'text-slate-400' : 'text-[#64748B]'}`} />}
              </div>
              <div>
                <h4 className={`font-bold text-xs ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Race Control Audio Beeps
                </h4>
                <p className={`text-[11px] font-mono ${isLight ? 'text-slate-500' : 'text-[#64748B]'}`}>
                  Sound alert on Safety Car & Red Flags
                </p>
              </div>
            </div>

            <button
              onClick={() => setRadioSound(!radioSound)}
              className={`w-12 h-6 rounded-full p-1 transition-colors ${
                radioSound ? 'bg-[#E10600]' : isLight ? 'bg-slate-300' : 'bg-[#2A3245]'
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
