/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // SLAM OG Brand Colors
        background: 'hsl(0, 0%, 2%)',      // #050505
        foreground: 'hsl(44, 33%, 95%)',   // #F8F6F0
        surface: 'hsl(0, 0%, 8%)',         // #151515
        'surface-elevated': 'hsl(0, 0%, 11%)', // #1C1C1C
        primary: 'hsl(42, 51%, 54%)',      // #C9A24A (Gold)
        'muted-foreground': 'hsl(0, 0%, 65%)', // #A7A7A7
        border: 'hsl(0, 0%, 15%)',         // #262626
        'border-strong': 'hsl(0, 0%, 22%)', // #383838

        // App Theme (Cyan accent)
        'app-accent': 'hsl(183, 56%, 60%)', // #5FD2D6

        // Track Colors
        'track-audio': '#3b82f6',
        'track-midi': '#a855f7',
        'track-drum': '#f97316',
      },
      fontFamily: {
        display: ['Cinzel', 'serif'],
        body: ['Inter', 'sans-serif'],
      },
      animation: {
        'border-sweep': 'border-sweep 6s linear infinite',
      },
      keyframes: {
        'border-sweep': {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' },
        },
      },
    },
  },
  plugins: [],
}
