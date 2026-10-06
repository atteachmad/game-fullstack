/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      colors: {
        void: {
          950: "#05060f",
          900: "#0a0c1a",
          800: "#10132a",
          700: "#181c3a",
          600: "#222750",
        },
        arcane: {
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
        },
        neon: {
          cyan: "#22d3ee",
          pink: "#f472b6",
          lime: "#a3e635",
          gold: "#fbbf24",
          red: "#fb7185",
        },
      },
      boxShadow: {
        neu: "8px 8px 20px rgba(0,0,0,0.55), -6px -6px 16px rgba(139,92,246,0.08)",
        "neu-sm": "4px 4px 10px rgba(0,0,0,0.5), -3px -3px 8px rgba(139,92,246,0.07)",
        "neu-inset": "inset 5px 5px 12px rgba(0,0,0,0.6), inset -4px -4px 10px rgba(139,92,246,0.07)",
        "glow-arcane": "0 0 24px rgba(139,92,246,0.55), 0 0 60px rgba(139,92,246,0.25)",
        "glow-cyan": "0 0 24px rgba(34,211,238,0.55), 0 0 60px rgba(34,211,238,0.2)",
        "glow-gold": "0 0 24px rgba(251,191,36,0.6), 0 0 60px rgba(251,191,36,0.25)",
        "glow-lime": "0 0 24px rgba(163,230,53,0.55), 0 0 60px rgba(163,230,53,0.2)",
        key: "0 6px 0 0 #3b1d8f, 0 12px 18px rgba(0,0,0,0.5)",
        "key-pressed": "0 1px 0 0 #3b1d8f, 0 3px 6px rgba(0,0,0,0.5)",
      },
      backgroundImage: {
        "arcane-gradient": "linear-gradient(135deg, #7c3aed 0%, #22d3ee 100%)",
        "gold-gradient": "linear-gradient(135deg, #fbbf24 0%, #f472b6 100%)",
        "void-gradient": "radial-gradient(ellipse at top, #181c3a 0%, #05060f 70%)",
        "card-sheen":
          "linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 40%, rgba(139,92,246,0.08) 100%)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0) rotateX(0deg)" },
          "50%": { transform: "translateY(-12px) rotateX(4deg)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.6", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.06)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "spin-slow": {
          to: { transform: "rotate(360deg)" },
        },
        "grid-drift": {
          "0%": { backgroundPosition: "0 0" },
          "100%": { backgroundPosition: "48px 48px" },
        },
        "shake-x": {
          "0%, 100%": { transform: "translateX(0)" },
          "20%, 60%": { transform: "translateX(-8px)" },
          "40%, 80%": { transform: "translateX(8px)" },
        },
      },
      animation: {
        float: "float 5s ease-in-out infinite",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        shimmer: "shimmer 3s linear infinite",
        "spin-slow": "spin-slow 20s linear infinite",
        "grid-drift": "grid-drift 6s linear infinite",
        "shake-x": "shake-x 0.5s ease-in-out",
      },
    },
  },
  plugins: [],
};