import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // shadcn/ui semantic aliases mapped onto the Horizon palette
        // Values kept in sync with design/HorizonPM_Design_System_v2.md (section 2)
        border: "#DDE1E8",
        input: "#DDE1E8",
        ring: "#0051D5",
        background: "#FBFCFD",
        foreground: "#0F172A",
        primary: {
          DEFAULT: "#0F172A",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#0051D5",
          foreground: "#FFFFFF",
          press: "#0044B4",
        },
        hover: "#F3F5F8",
        destructive: {
          DEFAULT: "#E11D48",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#F1F5F9",
          foreground: "#475569",
        },
        accent: {
          DEFAULT: "#F1F5F9",
          foreground: "#0F172A",
        },
        popover: {
          DEFAULT: "#FFFFFF",
          foreground: "#0F172A",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#0F172A",
        },

        // Horizon PM design tokens (guide section 2) — used directly in
        // screens built from the Stitch exports
        "on-primary": "#FFFFFF",
        "on-secondary": "#FFFFFF",
        surface: "#FFFFFF",
        "surface-container": "#F8FAFC",
        "surface-container-high": "#F1F5F9",
        "surface-container-highest": "#E2E8F0",
        "on-surface": "#0C1420",
        "on-surface-variant": "#5B6472",
        "on-background": "#0C1420",
        outline: "#8A93A3",
        "outline-variant": "#DDE1E8",
        success: {
          DEFAULT: "#16A34A",
          ink: "#3B6B4A",
        },
        warning: "#F59E0B",
        error: "#FF3B30",
        "on-error": "#FFFFFF",
      },
      borderRadius: {
        sm: "0.125rem",
        DEFAULT: "0.25rem",
        md: "0.375rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px",
      },
      spacing: {
        unit: "4px",
        "container-padding": "32px",
        gutter: "24px",
        "stack-sm": "8px",
        "stack-md": "16px",
        "stack-lg": "24px",
      },
      fontFamily: {
        display: ["var(--font-inter)", "system-ui", "sans-serif"],
        heading: ["var(--font-inter)", "system-ui", "sans-serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "monospace"],
      },
      fontSize: {
        display: ["32px", { lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: "600" }],
        h1: ["24px", { lineHeight: "1.3", letterSpacing: "-0.01em", fontWeight: "600" }],
        h2: ["20px", { lineHeight: "1.4", letterSpacing: "-0.01em", fontWeight: "500" }],
        "body-lg": ["16px", { lineHeight: "1.6", fontWeight: "400" }],
        "body-md": ["14px", { lineHeight: "1.5", fontWeight: "400" }],
        "label-sm": ["12px", { lineHeight: "1", letterSpacing: "0.02em", fontWeight: "600" }],
        "data-mono": ["14px", { lineHeight: "1", letterSpacing: "0", fontWeight: "500" }],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
