import type { Config } from 'tailwindcss'

/**
 * Clarion Design Tokens
 * ─────────────────────────────────────────────────────────
 * Industrial Institutional design system.
 * All reusable tokens centralized here — no magic values in components.
 */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      /* ── Color Palette ──────────────────────────────────── */
      colors: {
        brand: {
          primary:  '#F97316',   // Orange accent — buttons, highlights
          dark:     '#0F172A',   // Sidebar, nav bg
          surface:  '#F8FAFC',   // Page background
          card:     '#FFFFFF',   // Card fill
          text:     '#1E293B',   // Primary text
          muted:    '#64748B',   // Secondary text / labels
          success:  '#22C55E',   // Positive actions, online states
          warning:  '#F59E0B',   // Due-soon, caution
          danger:   '#EF4444',   // Delete, error, expired
          info:     '#3B82F6',   // Information, links
          light:    '#FFF7ED',   // Orange-tinted light bg
          border:   '#E2E8F0',   // Default borders
        },
      },

      /* ── Typography ─────────────────────────────────────── */
      fontFamily: {
        sora:  ['Sora', 'sans-serif'],
        space: ['Space Grotesk', 'sans-serif'],
        mono:  ['Space Mono', 'monospace'],
      },
      fontSize: {
        'xxs': ['0.625rem', { lineHeight: '0.875rem' }],   // 10px — badges, labels
      },

      /* ── Brutalist Shadows ──────────────────────────────── */
      boxShadow: {
        'brutal-sm': '2px 2px 0 rgba(0,0,0,1)',
        'brutal':    '4px 4px 0 rgba(0,0,0,1)',
        'brutal-lg': '6px 6px 0 rgba(0,0,0,1)',
        'brutal-xl': '8px 8px 0 rgba(0,0,0,1)',
        'inner-glow': 'inset 0 0 20px rgba(249,115,22,0.05)',
      },

      /* ── Border ──────────────────────────────────────────── */
      borderWidth: {
        '3': '3px',
      },

      /* ── Spacing / Sizing ───────────────────────────────── */
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        'sidebar': '240px',
      },

      /* ── Animations ─────────────────────────────────────── */
      keyframes: {
        'fade-in': {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          '0%':   { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.4' },
        },
      },
      animation: {
        'fade-in':   'fade-in 0.3s ease-out',
        'slide-up':  'slide-up 0.3s ease-out',
        'pulse-dot': 'pulse-dot 2s ease-in-out infinite',
      },

      /* ── Transitions ────────────────────────────────────── */
      transitionDuration: {
        '250': '250ms',
      },
    },
  },
  plugins: [],
} satisfies Config
