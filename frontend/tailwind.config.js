/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      /* ─────────────────────────────────────
         APPLE-STYLE TYPOGRAPHY
      ───────────────────────────────────── */
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Display",
          "SF Pro Text",
          "Inter",
          "Segoe UI",
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],

        mono: [
          "SF Mono",
          "JetBrains Mono",
          "Fira Code",
          "Consolas",
          "monospace",
        ],
      },

      /* ─────────────────────────────────────
         ANIMATIONS
      ───────────────────────────────────── */
      keyframes: {
        zoom: {
          "0%": {
            transform: "scale(1.05)",
          },

          "100%": {
            transform: "scale(1.2)",
          },
        },
      },

      animation: {
        zoom: "zoom 20s linear infinite",
      },
    },
  },
};