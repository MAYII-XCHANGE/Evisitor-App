import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "prompt",
      injectRegister: null,
      manifest: {
        name: "NOVA Visitor Management Portal",
        short_name: "NOVA Visitors",
        description: "Secure visitor registration, appointments, check-in, access control, and reporting for NOVA Bank.",
        theme_color: "#00b0f0",
        background_color: "#f8fafc",
        display: "standalone",
        start_url: "/",
        scope: "/",
        orientation: "any",
        categories: ["business", "productivity", "security"],
        icons: [
          { src: "/pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "/pwa-512x512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "/maskable-icon-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        navigateFallback: "index.html",
        navigateFallbackDenylist: [/^\/api(?:\/|$)/],
        globPatterns: ["**/*.{html,js,css,svg,png,jpg,jpeg,webp,ico,woff,woff2}"],
        globIgnores: ["**/pwa-192x192.png", "**/pwa-512x512.png", "**/maskable-icon-512x512.png"],
        runtimeCaching: ["GET", "POST", "PUT", "PATCH", "DELETE"].map((method) => ({
          urlPattern: /\/api(?:\/|$)/,
          handler: "NetworkOnly",
          method,
          options: { cacheName: `nova-api-${method.toLowerCase()}-network-only` },
        })),
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
          charts: ["recharts"],
          motion: ["framer-motion"],
          query: ["@tanstack/react-query", "axios"],
        },
      },
    },
  },
});
