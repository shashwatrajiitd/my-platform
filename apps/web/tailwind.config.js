/** @type {import('tailwindcss').Config} */
module.exports = {
  // This app historically uses handcrafted CSS. We enable Tailwind utilities only
  // (disable preflight) to avoid unintended global style changes.
  corePlugins: {
    preflight: false,
  },
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
    '../../packages/ui/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

