/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        bg: '#0a0a0b',
        surface: '#121214',
        elevated: '#1a1a1e',
        fg: '#f4f4f5',
        muted: '#a1a1aa',
        subtle: '#71717a',
        line: 'rgba(244,244,245,0.12)',
        'line-strong': 'rgba(244,244,245,0.22)',
        accent: '#d4d4d8',
        ink: '#0a0a0b',
        success: '#4ade80',
        warn: '#fbbf24',
        danger: '#f87171',
        info: '#7dd3fc',
      },
      fontFamily: {
        sans: [
          'IBM Plex Sans',
          'Segoe UI',
          'system-ui',
          '-apple-system',
          'sans-serif',
        ],
        mono: ['IBM Plex Mono', 'ui-monospace', 'SF Mono', 'Menlo', 'monospace'],
      },
      boxShadow: {
        panel: '0 1px 0 rgba(255,255,255,0.04), 0 12px 40px rgba(0,0,0,0.35)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
};
