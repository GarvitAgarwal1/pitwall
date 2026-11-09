import React, { useState } from 'react';
import {
  BookOpen,
  Flag,
  CircleDot,
  Wind,
  ShieldAlert,
  Calendar,
  ChevronRight,
  Info,
} from 'lucide-react';
import { FlagBadge, TyreBadge } from '../components/common/Badge';

export default function F1GuidePage() {
  const [activeGuideTab, setActiveGuideTab] = useState('tyres'); // 'tyres' | 'drs' | 'flags' | 'penalties' | 'sprint'

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="bg-[#12161F] border border-[#2A3245] rounded-xl p-5 space-y-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#E10600]/20 text-[#E10600] border border-[#E10600]/40 uppercase tracking-wider">
              Technical & Sporting Regulations
            </span>
            <span className="text-xs font-mono text-[#64748B]">FIA Official Rulebook Guide</span>
          </div>
          <h2 className="text-xl lg:text-2xl font-display font-black text-white tracking-wide uppercase">
            Formula 1 Technical & Strategic Regulations Guide
          </h2>
        </div>

        {/* Category Switcher Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[#2A3245]">
          {[
            { id: 'tyres', label: 'Tyre Compounds', icon: CircleDot },
            { id: 'drs', label: 'DRS Regulations', icon: Wind },
            { id: 'flags', label: 'FIA Race Flags', icon: Flag },
            { id: 'penalties', label: 'Penalties & Infringements', icon: ShieldAlert },
            { id: 'sprint', label: 'Sprint Weekend Format', icon: Calendar },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveGuideTab(tab.id)}
                className={`px-3.5 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition-colors ${
                  activeGuideTab === tab.id
                    ? 'bg-[#E10600] text-white shadow-md'
                    : 'bg-[#1C2230] text-[#94A3B8] hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. SECTION 1: Tyre Compounds Guide */}
      {activeGuideTab === 'tyres' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { code: 'S', name: 'Soft Compound', color: '#EF4444', window: '105°C – 135°C', grip: 'Maximum Grip', life: '15 – 25 Laps', desc: 'Highest chemical grip and cornering speed, but experiences high thermal degradation.' },
              { code: 'M', name: 'Medium Compound', color: '#F59E0B', window: '100°C – 130°C', grip: 'Balanced Grip', life: '22 – 35 Laps', desc: 'The universal race tyre offering consistent stint pace and resilience against blistering.' },
              { code: 'H', name: 'Hard Compound', color: '#F8FAFC', window: '110°C – 140°C', grip: 'Durable Grip', life: '30 – 50 Laps', desc: 'Slowest warm-up cycle, but virtually immune to thermal degradation. Ideal for 1-stop races.' },
              { code: 'I', name: 'Intermediate', color: '#10B981', window: 'Damp / Light Rain', grip: '30 L/sec dispersion', life: 'Crossover window', desc: 'Grooved tread pattern evacuating 30 litres of water per second at 300 km/h.' },
              { code: 'W', name: 'Full Wet', color: '#3B82F6', window: 'Heavy Standing Water', grip: '85 L/sec dispersion', life: 'Safety car rain', desc: 'Deep tread evacuating 85 litres of water per second, mitigating severe aquaplaning.' },
            ].map((tyre) => (
              <div key={tyre.code} className="bg-[#12161F] border border-[#2A3245] rounded-xl p-4 space-y-3 shadow-md hover:border-[#64748B] transition-all">
                <div className="flex items-center justify-between">
                  <span
                    className="w-8 h-8 rounded-full border-2 flex items-center justify-center font-mono font-black text-sm"
                    style={{ borderColor: tyre.color, color: tyre.color }}
                  >
                    {tyre.code}
                  </span>
                  <span className="text-[10px] font-mono text-[#64748B] font-bold">PIRELLI P ZERO</span>
                </div>
                <h4 className="font-bold text-sm text-white">{tyre.name}</h4>
                <div className="space-y-1 font-mono text-xs">
                  <div className="text-[11px] text-[#94A3B8]">
                    <span className="text-[#64748B]">Window:</span> {tyre.window}
                  </div>
                  <div className="text-[11px] text-[#94A3B8]">
                    <span className="text-[#64748B]">Expected Life:</span> {tyre.life}
                  </div>
                </div>
                <p className="text-[11px] text-[#64748B] font-mono leading-relaxed pt-2 border-t border-[#2A3245]/60">
                  {tyre.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="p-4 bg-[#1C2230] rounded-xl border border-[#2A3245] font-mono text-xs text-[#94A3B8] space-y-1">
            <span className="font-bold text-white uppercase text-sm block">Mandatory Sporting Compound Regulations:</span>
            <p>1. In dry races, every classified driver must use at least <strong className="text-white">two different dry-weather tyre compounds</strong> (e.g. Soft + Hard or Medium + Hard), requiring at least one mandatory pit stop.</p>
            <p>2. If Intermediate or Wet tyres are used at any point during a race declared wet, the two-compound rule is waived.</p>
          </div>
        </div>
      )}

      {/* 3. SECTION 2: DRS Regulations & Visual Diagram */}
      {activeGuideTab === 'drs' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-6 bg-[#12161F] border border-[#2A3245] rounded-xl p-5 space-y-4 shadow-lg">
            <div className="border-b border-[#2A3245] pb-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">DRS Rear Wing Mechanism Diagram</h3>
              <p className="text-xs font-mono text-[#64748B]">Drag Reduction System aerodynamic flap actuation</p>
            </div>

            {/* SVG Diagram showing DRS Open vs Closed */}
            <div className="bg-[#151922] p-6 rounded-xl border border-[#2A3245]/50 flex flex-col items-center justify-center">
              <svg viewBox="0 0 450 200" className="w-full max-w-md">
                {/* Main Rear Wing Profile */}
                <path d="M 50 150 C 100 150, 350 150, 400 150" stroke="#64748B" strokeWidth="8" strokeLinecap="round" />
                <path d="M 80 150 L 120 70 L 330 70 L 370 150" fill="none" stroke="#2A3245" strokeWidth="4" />

                {/* DRS Main Flap (Closed in Grey, Open in Purple) */}
                <rect x="140" y="70" width="170" height="14" rx="3" fill="#64748B" />
                <g className="animate-pulse">
                  <rect x="140" y="25" width="170" height="14" rx="3" fill="#7C4DFF" />
                  <line x1="225" y1="39" x2="225" y2="70" stroke="#7C4DFF" strokeWidth="3" strokeDasharray="3 3" />
                  <text x="235" y="55" fill="#7C4DFF" fontSize="12" fontFamily="monospace" fontWeight="bold">85mm Slot Gap</text>
                </g>

                <text x="50" y="180" fill="#94A3B8" fontSize="11" fontFamily="monospace">WING ENDPLATE</text>
                <text x="320" y="180" fill="#94A3B8" fontSize="11" fontFamily="monospace">DIFFUSER EXIT</text>
              </svg>
            </div>

            <p className="font-mono text-xs text-[#64748B]">
              When the hydraulic actuator opens the upper flap by up to 85mm, turbulent aerodynamic drag drops by ~20%, granting 10–12 km/h top-speed advantage on straights.
            </p>
          </div>

          <div className="lg:col-span-6 bg-[#12161F] border border-[#2A3245] rounded-xl p-5 space-y-4 shadow-lg font-mono text-xs">
            <div className="border-b border-[#2A3245] pb-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">DRS Sporting Rules & Activation Criteria</h3>
              <p className="text-xs text-[#64748B]">FIA Article 21.5 sporting regulations</p>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-[#1C2230] rounded-xl border border-[#2A3245]/60 space-y-1">
                <span className="font-bold text-amber-400 block">1. DETECTION POINT GAP &lt; 1.000s</span>
                <p className="text-[#94A3B8]">
                  The chasing car must be within 1.000 second of the leading car at the official timing loop detection point before entering the DRS activation straight.
                </p>
              </div>

              <div className="p-3 bg-[#1C2230] rounded-xl border border-[#2A3245]/60 space-y-1">
                <span className="font-bold text-white block">2. RACE START & RESTART ACTIVATION</span>
                <p className="text-[#94A3B8]">
                  DRS is enabled on <strong className="text-white">Lap 2</strong> following the race start or a Safety Car restart (updated for the 2024 regulations, reduced from 2 laps).
                </p>
              </div>

              <div className="p-3 bg-[#1C2230] rounded-xl border border-[#2A3245]/60 space-y-1">
                <span className="font-bold text-red-400 block">3. SAFETY CAR & WEATHER DEACTIVATION</span>
                <p className="text-[#94A3B8]">
                  DRS is instantly disabled race-wide during Safety Car, Virtual Safety Car, yellow flags in the sector, or when race control declares wet track conditions.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. SECTION 3: FIA Race Flags Gallery */}
      {activeGuideTab === 'flags' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[
            { flag: 'GREEN', title: 'Green Flag', hex: '#10B981', desc: 'Track is clear. Full racing speed and overtakes permitted.' },
            { flag: 'YELLOW', title: 'Single Yellow Flag', hex: '#F59E0B', desc: 'Hazard beside track. Reduce speed, no overtaking.' },
            { flag: 'DOUBLE YELLOW', title: 'Double Yellow Flag', hex: '#F59E0B', desc: 'Track partially or wholly blocked. Slow significantly, prepare to stop.' },
            { flag: 'SC', title: 'Safety Car (SC)', hex: '#F59E0B', desc: 'Field neutralized behind physical Mercedes AMG GT Black Series Safety Car.' },
            { flag: 'VSC', title: 'Virtual Safety Car (VSC)', hex: '#EAB308', desc: 'All cars must adhere to minimum delta time across all sectors. No overtakes.' },
            { flag: 'RED', title: 'Red Flag', hex: '#EF4444', desc: 'Session suspended immediately. Proceed cautiously to the pit lane.' },
            { flag: 'BLUE', title: 'Blue Flag', hex: '#3B82F6', desc: 'Lapped car must yield to faster car within 3 blue flag marshaling sectors.' },
            { flag: 'CHEQUERED', title: 'Chequered Flag', hex: '#FFFFFF', desc: 'Session or Grand Prix completed. Proceed to parc fermé.' },
          ].map((f) => (
            <div key={f.title} className="bg-[#12161F] border border-[#2A3245] rounded-xl p-4 space-y-3 shadow-md hover:border-[#64748B] transition-all">
              <div className="flex items-center justify-between">
                <span
                  className="w-4 h-4 rounded-full animate-ping"
                  style={{ backgroundColor: f.hex }}
                />
                <span className="text-[10px] font-mono text-[#64748B]">FIA CODE</span>
              </div>
              <h4 className="font-bold text-sm text-white font-mono">{f.title}</h4>
              <p className="text-xs text-[#94A3B8] font-mono leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      )}

      {/* 5. SECTION 4: Penalties & Infringements */}
      {activeGuideTab === 'penalties' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-mono text-xs">
          {[
            { type: '5-Second Time Penalty', served: 'Added to pit stop or final race time', trigger: 'Minor track limits (4th warning), causing a minor collision, false start.' },
            { type: '10-Second Time Penalty', served: 'Added to pit stop or final race time', trigger: 'Causing collision forcing driver off track, unsafe pit release.' },
            { type: 'Drive-Through Penalty', served: 'Enter and exit pit lane at pit speed limit without stopping', trigger: 'Speeding in pit lane (>80 km/h), ignoring yellow flags.' },
            { type: '10-Second Stop & Go', served: 'Stop stationary in pit box for 10 seconds without tire change', trigger: 'Severe sporting infringement, failure to take red flag pit lane entry.' },
            { type: 'Grid Drop Penalty', served: 'Demoted positions on next race starting grid', trigger: 'Impeding in qualifying, exceeding engine component allocation (ICE, MGU-K).' },
            { type: '12 Penalty Points Superlicence Ban', served: 'Automatic 1-race suspension upon reaching 12 penalty points', trigger: 'Accumulated over a rolling 12-month window for driving infractions.' },
          ].map((pen) => (
            <div key={pen.type} className="bg-[#12161F] border border-[#2A3245] rounded-xl p-4 space-y-2 shadow-md">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-red-400">{pen.type}</span>
                <ShieldAlert className="w-4 h-4 text-red-400" />
              </div>
              <div className="text-[11px] text-white">
                <strong className="text-[#64748B]">Execution:</strong> {pen.served}
              </div>
              <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                <strong className="text-[#64748B]">Typical Infringement:</strong> {pen.trigger}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* 6. SECTION 5: Sprint Format Schedule Comparison */}
      {activeGuideTab === 'sprint' && (
        <div className="bg-[#12161F] border border-[#2A3245] rounded-xl p-5 space-y-4 shadow-xl font-mono text-xs">
          <div className="border-b border-[#2A3245] pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">Standard vs Sprint Weekend Timetable</h3>
            <p className="text-xs text-[#64748B]">Comparison of track sessions and Parc Fermé rules (2024 Format)</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Standard Format */}
            <div className="p-4 bg-[#1C2230] rounded-xl border border-[#2A3245] space-y-3">
              <span className="font-bold text-white text-sm block border-b border-[#2A3245] pb-1">
                Standard Grand Prix Weekend
              </span>
              <ul className="space-y-2 text-[#94A3B8]">
                <li><strong className="text-white">Friday:</strong> Practice 1 (60m) & Practice 2 (60m)</li>
                <li><strong className="text-white">Saturday:</strong> Practice 3 (60m) & Grand Prix Qualifying (Q1, Q2, Q3)</li>
                <li><strong className="text-white">Sunday:</strong> Formula 1 Grand Prix (305 km race distance)</li>
                <li className="pt-2 text-[10px] text-[#64748B]">Parc Fermé takes effect at start of Saturday Qualifying.</li>
              </ul>
            </div>

            {/* Sprint Format */}
            <div className="p-4 bg-[#1C2230] rounded-xl border border-amber-500/40 space-y-3 shadow-lg shadow-amber-950/20">
              <span className="font-bold text-amber-400 text-sm block border-b border-amber-500/30 pb-1">
                2024 Sprint Weekend Format (6 Rounds)
              </span>
              <ul className="space-y-2 text-[#94A3B8]">
                <li><strong className="text-white">Friday:</strong> Practice 1 (60m) & Sprint Qualifying (SQ1, SQ2, SQ3)</li>
                <li><strong className="text-white">Saturday:</strong> Sprint Race (100 km, 8 to 1 points) & GP Qualifying</li>
                <li><strong className="text-white">Sunday:</strong> Formula 1 Grand Prix</li>
                <li className="pt-2 text-[10px] text-amber-300">
                  Dual Parc Fermé: Re-opens after Saturday Sprint to allow setup adjustments before GP Qualifying!
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
