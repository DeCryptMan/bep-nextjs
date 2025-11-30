import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    // Если у тебя папка src
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    
    // Если файлы в корне (без src)
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#253894',
          green: '#63A900',
          dark: '#0f172a',
          light: '#f8fafc'
        }
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Armenian', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 10px 40px -10px rgba(0,0,0,0.08)',
        'glow': '0 0 20px rgba(99, 169, 0, 0.3)',
        'neon': '0 0 20px rgba(99, 169, 0, 0.4)',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }
    },
  },
  plugins: [],
};
export default config;