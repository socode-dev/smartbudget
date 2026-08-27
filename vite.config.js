import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import dotenv from "dotenv";
import path from "path";

const isVitest = process.env.VITEST;

if (!isVitest) {
  dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    globals: true,
    environment: "node",
    include: [
      "src/tests/**/*.test.js", 
      "backend/tests/**/*.test.js",
    ],
    isolate: true,
    clearMocks: true,
    restoreMocks: true,
    testTimeout: 15000,
  },
});
