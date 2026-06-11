import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#05010a",
          900: "#0a0214",
          800: "#120323",
        },
        neon: {
          500: "#a855f7",
          400: "#c084fc",
          300: "#d8b4fe",
        },
      },
      boxShadow: {
        glass: "0 0 0 1px rgba(168,85,247,0.18), 0 20px 80px rgba(0,0,0,0.55)",
      },
      backgroundImage: {
        "grid-fade":
          "radial-gradient(1200px 500px at 50% -100px, rgba(168,85,247,0.28), transparent 60%), radial-gradient(800px 400px at 10% 20%, rgba(34,211,238,0.12), transparent 60%), radial-gradient(900px 500px at 90% 40%, rgba(168,85,247,0.10), transparent 55%)",
      },
    },
  },
  plugins: [],
} satisfies Config;

