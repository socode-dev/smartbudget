import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import dotenv from "dotenv";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

const isVitest = process.env.VITEST;

if (!isVitest) {
  dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
}

export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    VitePWA({
      registerType: "prompt",
      manifestFilename: "site.webmanifest",

      includeAssets: [
        "assets/favicon.ico",
        "assets/favicon-16x16.png",
        "assets/favicon-32x32.png",
        "assets/apple-touch-icon.png",
        "assets/android-chrome-192x192.png",
        "assets/android-chrome-512x512.png",
      ],

      manifest: {
        id: "/",
        name: "SmartBudget",
        short_name: "SmartBudget",
        description:
        "Track your spending, set budget, set goals, and get AI-powered financial insights with SmartBudget.",
        
        theme_color: "#2763EB",
        background_color: "#ffffff",
        
        display: "standalone",
        start_url: "/",
        scope: "/",

        icons: [
          { 
            "src": "assets/favicon-16x16.png", 
            "sizes": "16x16", 
            "type": "image/png",
            purpose: "any"
          },
          { 
            "src": "assets/favicon-32x32.png", 
            "sizes": "32x32", 
            "type": "image/png",
            purpose: "any", 
          },
          {
            "src": "assets/android-chrome-192x192.png",
            "sizes": "192x192",
            "type": "image/png",
            purpose: "any",
          },
          {
            "src": "assets/android-chrome-512x512.png",
            "sizes": "512x512",
            "type": "image/png",
            purpose: "any"
          },
        ],
      },

      workbox: {
        navigateFallback: "/index.html",
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
      }
    }),
  ],
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
