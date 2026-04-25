import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "text-summary", "html", "json-summary"],
      reportsDirectory: "./coverage",
      // Only the safety-critical caption validator is gated globally.
      // Unrelated low-coverage files won't fail CI — add more entries here as
      // additional modules earn their own regression suites.
      include: ["src/utils/captionSafety.ts"],
      thresholds: {
        // Per-file gates for caption safety — any regression gap fails the build.
        "src/utils/captionSafety.ts": {
          lines: 100,
          functions: 100,
          branches: 95,
          statements: 100,
        },
      },
    },
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
