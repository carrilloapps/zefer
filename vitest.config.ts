import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  test: {
    include: ["app/**/*.test.ts"],
    testTimeout: 30_000,
    coverage: {
      provider: "v8",
      include: [
        "app/lib/crypto.ts",
        "app/lib/zefer.ts",
        "app/lib/chunked-crypto.ts",
        "app/lib/compression.ts",
      ],
      thresholds: {
        lines: 100,
        functions: 100,
        statements: 100,
        branches: 99,
      },
      reporter: ["text", "text-summary"],
    },
  },
});
