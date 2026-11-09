/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // F1 dark racing aesthetic color tokens
        'f1-red': '#E10600',
        'f1-dark': '#0B0E14',
        'f1-panel': '#151922',
        'f1-card': '#1C2230',
        'f1-border': '#2A3245',
        'f1-muted': '#64748B',
        'f1-text': '#F8FAFC',
        
        // Tyre compounds
        tyre: {
          soft: '#EF4444',
          medium: '#F59E0B',
          hard: '#F8FAFC',
          intermediate: '#10B981',
          wet: '#3B82F6',
          // Aliases
          s: '#EF4444',
          m: '#F59E0B',
          h: '#F8FAFC',
          i: '#10B981',
          w: '#3B82F6',
        },

        // Team colors
        team: {
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
        },

        // Telemetry traces
        telemetry: {
          speed: '#00F0FF',
          throttle: '#00E676',
          brake: '#FF1744',
          gear: '#FFD600',
          drs: '#7C4DFF',
          delta: '#F59E0B',
        },

        // FIA status / flag colors
        flag: {
          green: '#10B981',
          yellow: '#F59E0B',
          red: '#EF4444',
          blue: '#3B82F6',
          purple: '#B537F2',
          sc: '#F59E0B',
          vsc: '#EAB308',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Titillium Web', 'Orbitron', 'sans-serif'],
        mono: [
          'JetBrains Mono',
          'Roboto Mono',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'flash-amber': 'flashAmber 1.2s infinite',
      },
      keyframes: {
        flashAmber: {
          '0%, 100%': { backgroundColor: 'rgba(245, 158, 11, 0.2)', borderColor: '#F59E0B' },
          '50%': { backgroundColor: 'rgba(245, 158, 11, 0.8)', borderColor: '#F59E0B' },
        },
      },
    },
  },
  plugins: [],
};
