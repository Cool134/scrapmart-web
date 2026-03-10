import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: { center: true, padding: "2rem", screens: { "2xl": "1400px" } },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "#F8F9FA",
        foreground: "#111827",
        primary: { DEFAULT: "#1A1A2E", foreground: "#FFFFFF" },
        accent: { DEFAULT: "#4F46E5", foreground: "#FFFFFF" },
        success: "#10B981",
        warning: "#F59E0B",
      },
      borderRadius: { lg: "16px", md: "12px", sm: "8px" },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
export default config
