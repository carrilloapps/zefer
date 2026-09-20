import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "."),
    },
  },
  test: {
    include: ["app/**/*.test.{ts,tsx}"],
    testTimeout: 30_000,
    setupFiles: ["app/__tests__/setup.ts"],
    coverage: {
      provider: "v8",
      include: ["app/**/*.{ts,tsx}"],
      exclude: ["app/**/__tests__/**", "app/**/*.test.{ts,tsx}"],
      thresholds: {
        lines: 100,
        functions: 100,
        statements: 100,
        branches: 100,
      },
      reporter: ["text", "text-summary"],
    },
  },
});
