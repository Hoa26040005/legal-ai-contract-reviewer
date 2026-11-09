/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        legal: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        risk: {
          critical: '#ef4444',
          high: '#f97316',
          medium: '#eab308',
          low: '#3b82f6',
          safe: '#10b981',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'bezel-outer': '0 0 0 1px rgba(255, 255, 255, 0.08), 0 8px 24px -4px rgba(0, 0, 0, 0.5)',
        'bezel-inner': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.1)',
        'glow-cyan': '0 0 24px -2px rgba(6, 182, 212, 0.35)',
        'glow-rose': '0 0 24px -2px rgba(239, 68, 68, 0.35)',
        'glow-amber': '0 0 24px -2px rgba(245, 158, 11, 0.35)',
        'glow-emerald': '0 0 24px -2px rgba(16, 185, 129, 0.35)',
      },
      transitionTimingFunction: {
        'spring-custom': 'cubic-bezier(0.16, 1, 0.3, 1)',
      }
    },
  },
  plugins: [],
}
