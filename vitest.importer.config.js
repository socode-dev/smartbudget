import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: [
      "backend/integrations/import/__tests__/**/*.test.js",
      "backend/integrations/invites/__tests__/**/*.test.js"
    ],
    setupFiles: ["./backend/integrations/import/__tests__/setup.js"],
    isolate: true,
    fileParallelism: false,
    clearMocks: true,
    restoreMocks: true,
    testTimeout: 15000,
    hookTimeout: 30000,
  },
});
