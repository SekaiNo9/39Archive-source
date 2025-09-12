module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        // Primary Aqua/Cyan palette - Hatsune Miku signature colors
        aqua: {
          50: '#f0fdff',
          100: '#ccf7fe',
          200: '#9aedfe',
          300: '#5ddcfc',
          400: '#22c3f3',
          500: '#06a9d9',
          600: '#0987b7',
          700: '#0f6d94',
          800: '#155a78',
          900: '#164b66',
        },
        // Complementary teal for depth
        teal: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        // Cool blues for contrast
        blue: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // Gradient purples for magic feel
        purple: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7c2d12',
          800: '#6b21a8',
          900: '#581c87',
        },
        // Warm accents
        coral: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        // Neutral grays with cool undertones
        slate: {
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
        },
        // Special Miku colors
        miku: {
          cyan: '#39d0d8',
          lightCyan: '#7ee8ed',
          darkCyan: '#1a9da3',
          mint: '#a8f5f0',
          ice: '#e6fffe',
          deep: '#0d4f52',
          accent: '#ff6b9d',
          gold: '#ffd93d',
        }
      },
      // Gradient definitions for modern UI
      backgroundImage: {
        'gradient-aqua': 'linear-gradient(135deg, #39d0d8 0%, #1a9da3 100%)',
        'gradient-miku': 'linear-gradient(135deg, #7ee8ed 0%, #39d0d8 50%, #1a9da3 100%)',
        'gradient-ocean': 'linear-gradient(180deg, #a8f5f0 0%, #39d0d8 50%, #0d4f52 100%)',
        'gradient-aurora': 'linear-gradient(45deg, #39d0d8 0%, #a855f7 50%, #ff6b9d 100%)',
        'gradient-glass': 'linear-gradient(135deg, rgba(57, 208, 216, 0.1) 0%, rgba(26, 157, 163, 0.1) 100%)',
      },
      // Box shadow for depth
      boxShadow: {
        'aqua': '0 4px 20px rgba(57, 208, 216, 0.3)',
        'aqua-lg': '0 10px 40px rgba(57, 208, 216, 0.4)',
        'miku': '0 8px 32px rgba(126, 232, 237, 0.3)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        'glow': '0 0 20px rgba(57, 208, 216, 0.5)',
      },
      // Animation and transitions
      animation: {
        'pulse-soft': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(57, 208, 216, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(57, 208, 216, 0.8)' },
        },
      },
    },
  },
  plugins: [],
}