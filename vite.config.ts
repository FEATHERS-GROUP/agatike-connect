import { defineConfig, createLogger } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tsConfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";

const logger = createLogger();
const originalWarn = logger.warn;
logger.warn = (msg, options) => {
  if (typeof msg === "string" && msg.includes("Module level directives cause errors when bundled"))
    return;
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
    minify: process.env.VERCEL ? false : "esbuild", // Turn off minification on Vercel to prevent memory/time limit crashes
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
      "lucide-react",
      "jspdf",
      "xlsx",
      "leaflet",
      "react-leaflet",
      "html-to-image",
      "html2canvas",
      "firebase/app",
      "firebase/firestore",
      "firebase/auth",
      "firebase/storage",
    ],
  },
  ssr: {
    external: [
      "react-big-calendar",
      "@blocknote/react",
      "@blocknote/mantine",
      "@blocknote/core",
      "recharts",
      "html2canvas",
      "lucide-react",
      "jspdf",
      "xlsx",
      "firebase-admin",
      "firebase-admin/app",
      "firebase-admin/messaging",
      "firebase-admin/firestore",
      "firebase",
      "google-auth-library",
      "leaflet",
      "react-leaflet",
      "html-to-image",
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

// Trigger restart 2
