/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        om: {
          bg:             'var(--om-bg)',
          surface:        'var(--om-surface)',
          text:           'var(--om-text)',
          muted:          'var(--om-muted)',
          accent:         'var(--om-accent)',
          'accent-hover': 'var(--om-accent-hover)',
          'accent-light': 'var(--om-accent-light)',
          gold:           'var(--om-gold)',
          success:        'var(--om-success)',
          'success-bg':   'var(--om-success-bg)',
          error:          'var(--om-error)',
          'error-bg':     'var(--om-error-bg)',
          border:         'var(--om-border)',
          'slot-hover':   'var(--om-slot-hover)',
          'era-band':     'var(--om-era-band)',
          tag:            'var(--om-tag)',
          note:           'var(--om-note)',
          'note-border':  'var(--om-note-border)',
          'note-title':   'var(--om-note-title)',
          'accent-fg':    'var(--om-accent-fg)',
          'error-fg':     'var(--om-error-fg)',
        },
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans:  ['DM Sans', 'system-ui', 'sans-serif'],
        mono:  ['JetBrains Mono', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
}
