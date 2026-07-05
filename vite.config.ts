import { defineConfig, createLogger } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tsConfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";

const logger = createLogger();
const originalWarn = logger.warn;
logger.warn = (msg, options) => {
  if (typeof msg === "string" && msg.includes("Module level directives cause errors when bundled")) return;
  originalWarn(msg, options);
};
export default defineConfig({
  customLogger: logger,
  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
    },
  },
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        if (warning.code === "MODULE_LEVEL_DIRECTIVE") {
          return;
        }
        warn(warning);
      },
    },
  },
  envPrefix: ["FIREBASE_", "GIPHY_", "GOOGLE_", "SUPABASE_"],
  optimizeDeps: {
    include: [
      "react-hook-form",
      "@hookform/resolvers/zod",
      "@radix-ui/react-dropdown-menu",
      "react-big-calendar",
      "date-fns",
      "date-fns/locale",
      "recharts",
      "react-day-picker",
      "react-quill-new",
    ],
  },
  plugins: [
    tanstackStart({
      server: { entry: "server" },
      serverFns: {
        disableCsrfMiddlewareWarning: true,
      },
    }),
    nitro({
      preset: process.env.VERCEL ? "vercel" : "node-server",
    }),
    viteReact(),
    tsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tailwindcss(),
  ],
});

// Trigger restart
