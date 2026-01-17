import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: 'hsl(var(--bg))',
          muted: 'hsl(var(--bg-muted))',
        },
        panel: {
          DEFAULT: 'hsl(var(--panel))',
          soft: 'hsl(var(--panel-soft))',
        },
        text: {
          DEFAULT: 'hsl(var(--text))',
          muted: 'hsl(var(--text-muted))',
        },
        brand: {
          primary: 'hsl(var(--brand-primary))',
          secondary: 'hsl(var(--brand-secondary))',
          accent: 'hsl(var(--brand-accent))',
          hot: 'hsl(var(--brand-hot))',
        },
        ring: 'hsl(var(--ring))',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        soft: '0 10px 35px rgba(0,0,0,0.35)',
        glow: '0 0 0 1px rgba(255,255,255,0.06), 0 18px 55px rgba(0,0,0,0.55)',
      },
      backgroundImage: {
        'hero-gradient': 'radial-gradient(1200px 600px at 20% 10%, rgba(255, 70, 166, 0.40), transparent 55%), radial-gradient(900px 500px at 80% 20%, rgba(122, 84, 255, 0.35), transparent 55%), linear-gradient(135deg, rgba(14, 9, 33, 1) 0%, rgba(24, 13, 61, 1) 45%, rgba(10, 7, 28, 1) 100%)',
        'section-gradient': 'linear-gradient(180deg, rgba(14, 9, 33, 1) 0%, rgba(24, 13, 61, 1) 60%, rgba(10, 7, 28, 1) 100%)',
      },
      keyframes: {
        floaty: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        floaty: 'floaty 7s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
