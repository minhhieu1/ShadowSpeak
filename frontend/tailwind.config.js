/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  darkMode: "class",
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        bg: "#F7F5F0",
        surface: "#FFFFFF",
        "surface-alt": "#EEF2F5",
        primary: "#0E5A6A",
        "primary-pressed": "#0A4652",
        secondary: "#D97706",
        text: "#111827",
        "text-muted": "#6B7280",
        border: "#D6D9DE",
        focus: "#2563EB",
        success: "#1F8A70",
        warning: "#D97706",
        error: "#C2410C",
        info: "#2563EB",
        disabled: "#A8B0B8",
      },
      fontSize: {
        display: ["28px", { lineHeight: "34px", fontWeight: "600" }],
        h1: ["24px", { lineHeight: "30px", fontWeight: "600" }],
        h2: ["20px", { lineHeight: "26px", fontWeight: "600" }],
        h3: ["18px", { lineHeight: "24px", fontWeight: "600" }],
        "audio-label": ["13px", { lineHeight: "16px", fontWeight: "500" }],
      },
      borderRadius: {
        card: "8px",
        control: "12px",
      },
    },
  },
  plugins: [],
};
