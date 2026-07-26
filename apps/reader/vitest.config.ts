import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    coverage: {
      include: ["src/App.tsx"],
      provider: "v8",
      reporter: ["text"],
      thresholds: {
        branches: 85,
        functions: 95,
        lines: 95,
        statements: 95,
      },
    },
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
  },
});
