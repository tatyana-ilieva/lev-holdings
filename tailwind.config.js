/** @type {import("tailwindcss").Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      animation: {
        "spin-slow": "spin 3s linear infinite",
        "pulse-slow": "pulse 3s ease-in-out infinite",
        "bounce-slow": "bounce 3s ease-in-out infinite",
        "gradient": "gradient 15s ease infinite",
      },
      keyframes: {
        gradient: {
          "0%, 100%": {
            "background-size": "200% 200%",
            "background-position": "left center"
          },
          "50%": {
            "background-size": "200% 200%",
            "background-position": "right center"
          },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
      colors: {
        "neon-purple": "#bf00ff",
        "neon-pink": "#ff0080",
        "neon-blue": "#0080ff",
        "cyber-green": "#00ff80",
      },
    },
  },
  plugins: [],
}
