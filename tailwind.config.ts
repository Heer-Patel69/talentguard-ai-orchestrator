import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
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
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        danger: {
          DEFAULT: "hsl(var(--danger))",
          foreground: "hsl(var(--danger-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["Sora", "DM Sans", "system-ui", "sans-serif"],
        display: ["Sora", "system-ui", "sans-serif"],
        body: ["DM Sans", "system-ui", "sans-serif"],
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
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-out": {
          "0%": { opacity: "1", transform: "translateY(0)" },
          "100%": { opacity: "0", transform: "translateY(10px)" },
        },
        "fade-in-blur": {
          "0%": { opacity: "0", transform: "translateY(20px)", filter: "blur(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)", filter: "blur(0px)" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "scale-in-bounce": {
          "0%": { transform: "scale(0.85)", opacity: "0" },
          "50%": { transform: "scale(1.03)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "slide-up": {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "slide-down": {
          "0%": { transform: "translateY(-100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "slide-left": {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "slide-right": {
          "0%": { transform: "translateX(-100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 16px -4px hsla(172, 60%, 50%, 0.25)" },
          "50%": { boxShadow: "0 0 32px -4px hsla(172, 60%, 50%, 0.5)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        "mesh-move": {
          "0%, 100%": { backgroundPosition: "0% 0%" },
          "25%": { backgroundPosition: "100% 0%" },
          "50%": { backgroundPosition: "100% 100%" },
          "75%": { backgroundPosition: "0% 100%" },
        },
        "gradient-shift": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        "blur-in": {
          "0%": { opacity: "0", filter: "blur(10px)" },
          "100%": { opacity: "1", filter: "blur(0px)" },
        },
        "count-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        typewriter: {
          from: { width: "0" },
          to: { width: "100%" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        ripple: {
          "0%": { transform: "scale(0)", opacity: "0.5" },
          "100%": { transform: "scale(4)", opacity: "0" },
        },
        morph: {
          "0%, 100%": { borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%" },
          "50%": { borderRadius: "30% 60% 70% 40% / 50% 60% 30% 60%" },
        },
        spotlight: {
          "0%": { opacity: "0", transform: "scale(0.8)" },
          "50%": { opacity: "1" },
          "100%": { opacity: "0", transform: "scale(1.2)" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-8px)" },
          "75%": { transform: "translateX(8px)" },
        },
        "aurora-shift": {
          "0%": { backgroundPosition: "0% 50%" },
          "25%": { backgroundPosition: "50% 0%" },
          "50%": { backgroundPosition: "100% 50%" },
          "75%": { backgroundPosition: "50% 100%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        orbit: {
          "0%": { transform: "rotate(0deg) translateX(36px) rotate(0deg)" },
          "100%": { transform: "rotate(360deg) translateX(36px) rotate(-360deg)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "fade-in-blur": "fade-in-blur 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "fade-out": "fade-out 0.3s ease-out",
        "scale-in": "scale-in 0.3s ease-out",
        "scale-in-bounce": "scale-in-bounce 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "slide-in-right": "slide-in-right 0.4s ease-out",
        "slide-up": "slide-up 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "slide-down": "slide-down 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "slide-left": "slide-left 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "slide-right": "slide-right 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "glow-pulse": "glow-pulse 2.5s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 2.5s linear infinite",
        "mesh-move": "mesh-move 20s ease infinite",
        "gradient-shift": "gradient-shift 5s ease infinite",
        "blur-in": "blur-in 0.4s ease-out",
        "count-up": "count-up 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
        typewriter: "typewriter 2s steps(40) 1s forwards",
        blink: "blink 1s step-end infinite",
        ripple: "ripple 0.6s ease-out",
        morph: "morph 8s ease-in-out infinite",
        spotlight: "spotlight 6s ease infinite",
        shake: "shake 0.4s ease-in-out",
        "aurora-shift": "aurora-shift 12s ease infinite",
        orbit: "orbit 6s linear infinite",
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
        smooth: "cubic-bezier(0.25, 0.1, 0.25, 1)",
        bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
      },
      backdropBlur: {
        glass: "20px",
        "glass-heavy": "36px",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-primary":
          "linear-gradient(135deg, hsl(172, 60%, 50%) 0%, hsl(195, 75%, 50%) 50%, hsl(35, 92%, 58%) 100%)",
        "gradient-accent":
          "linear-gradient(135deg, hsl(172, 60%, 50%) 0%, hsl(195, 75%, 50%) 100%)",
        "gradient-surface":
          "linear-gradient(180deg, hsl(215, 28%, 8%) 0%, hsl(215, 28%, 5%) 100%)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
