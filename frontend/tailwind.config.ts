import type { Config } from 'tailwindcss'

/**
 * BeneTrack Design Tokens
 * ─────────────────────────────────────────────────────────
 * Civic Institutional design system.
 * Professional, trust-forward aesthetic for NGO management.
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
          primary:  '#0D9488',   // Teal — trust, institutional, calm
          'primary-light': '#CCFBF1',  // Teal 100
          'primary-hover': '#0F766E',  // Teal 700
          dark:     '#0F172A',   // Slate 900
          surface:  '#F8FAFC',   // Slate 50 — page background
          card:     '#FFFFFF',   // Card fill
          text:     '#1E293B',   // Slate 800 — primary text
          muted:    '#64748B',   // Slate 500 — secondary text
          success:  '#16A34A',   // Green 600
          warning:  '#F59E0B',   // Amber 500
          danger:   '#DC2626',   // Red 600
          info:     '#2563EB',   // Blue 600
          light:    '#F0FDFA',   // Teal 50 — tinted light bg
          border:   '#E2E8F0',   // Slate 200
        },
      },

      /* ── Typography ─────────────────────────────────────── */
      fontFamily: {
        sans:  ['DM Sans', 'system-ui', 'sans-serif'],
        mono:  ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        'xxs': ['0.625rem', { lineHeight: '0.875rem' }],   // 10px — badges
      },

      /* ── Shadows — soft elevation ──────────────────────── */
      boxShadow: {
        'xs':    '0 1px 2px rgba(0,0,0,0.05)',
        'sm':    '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
        'md':    '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
        'lg':    '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)',
        'xl':    '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
        'card':  '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)',
      },

      /* ── Border Radius ────────────────────────────────── */
      borderRadius: {
        'DEFAULT': '8px',
        'sm': '6px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
      },

      /* ── Spacing / Sizing ───────────────────────────────── */
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        'sidebar': '260px',
      },

      /* ── Animations ─────────────────────────────────────── */
      keyframes: {
        'fade-in': {
          '0%':   { opacity: '0', transform: 'translateY(6px)' },
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
        'spin-slow': {
          '0%':   { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'icon-bounce': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-2px)' },
        },
        'scale-in': {
          '0%':   { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(13, 148, 136, 0.4)' },
          '50%':      { boxShadow: '0 0 0 8px rgba(13, 148, 136, 0)' },
        },
        'slide-in-right': {
          '0%':   { opacity: '0', transform: 'translateX(-12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        'fade-in':       'fade-in 0.3s ease-out',
        'slide-up':      'slide-up 0.3s ease-out',
        'pulse-dot':     'pulse-dot 2s ease-in-out infinite',
        'spin-slow':     'spin-slow 1s linear infinite',
        'icon-bounce':   'icon-bounce 0.3s ease-in-out',
        'scale-in':      'scale-in 0.2s ease-out',
        'glow-pulse':    'glow-pulse 2s ease-in-out infinite',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
      },

      /* ── Transitions ────────────────────────────────────── */
      transitionDuration: {
        '200': '200ms',
        '250': '250ms',
        '300': '300ms',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
} satisfies Config
