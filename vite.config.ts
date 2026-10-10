import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: null, // registration happens only in src/lib/registerSW.ts
      devOptions: { enabled: false },
      filename: "sw.js",
      manifest: false, // manifest handled separately
      workbox: {
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/~oauth/],
        runtimeCaching: [
          {
            // HTML navigations: always try the network first so updates land fast.
            urlPattern: ({ request }) => request.mode === "navigate",
            handler: "NetworkFirst",
            options: {
              cacheName: "kejasure-pages",
              networkTimeoutSeconds: 5,
            },
          },
          {
            // Same-origin hashed build assets are immutable — cache-first is safe.
            // Vite emits hashed, immutable files under /assets/.
            urlPattern: /\/assets\/.*\.(js|css|woff2?|ttf|otf|png|jpe?g|webp|svg|gif)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "kejasure-assets",
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
}));
