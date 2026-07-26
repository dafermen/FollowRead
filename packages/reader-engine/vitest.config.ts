import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    exclude: ["dist/**", "node_modules/**"],
    coverage: {
      include: ["src/engine.ts", "src/timeline.ts"],
      provider: "v8",
      reporter: ["text"],
      thresholds: {
        branches: 90,
        functions: 100,
        lines: 99,
        statements: 99,
      },
    },
  },
});
