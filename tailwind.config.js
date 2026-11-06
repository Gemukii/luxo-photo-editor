/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Named after traditional Japanese colours. See ADR-0011.
      colors: {
        sumi: {
          950: '#0F0E0D',
          900: '#161412',
          800: '#1E1B18',
          700: '#292521',
          600: '#3A352F',
          500: '#5A544B',
        },
        gofun: '#F4EFE6',
        kinari: '#CFC7B8',
        nezumi: '#A0988A',
        shu: {
          DEFAULT: '#BF4128',
          bright: '#E0694D',
        },
        kincha: '#CF9A3F',
        asagi: '#4F9FA6',
        ai: '#2E4A7A',
        wakatake: '#6D9C73',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
