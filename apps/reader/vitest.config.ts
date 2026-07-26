import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    coverage: {
      include: ["src/App.tsx", "src/browserNarrator.ts", "src/pwa.ts", "src/readerStorage.ts"],
      provider: "v8",
      reporter: ["text"],
      thresholds: {
        branches: 80,
        functions: 90,
        lines: 90,
        statements: 90,
      },
    },
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
  },
});
