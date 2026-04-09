import { defineConfig } from "vite"
import { devtools } from "@tanstack/devtools-vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import viteTsConfigPaths from "vite-tsconfig-paths"
import tailwindcss from "@tailwindcss/vite"
import { nitro } from "nitro/vite"
import { VitePWA } from "vite-plugin-pwa"

const config = defineConfig({
  plugins: [
    devtools(),
    nitro(),
    viteTsConfigPaths({ projects: ["./tsconfig.json"] }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "TrackTime",
        short_name: "TrackTime",
        description: "Beautiful time tracking — works offline",
        theme_color: "#c26f6f",
        background_color: "#f8f3ee",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        globPatterns: [],  // Nitro bundles to .output/ — rely on runtime caching instead
        runtimeCaching: [
          {
            // Google Fonts — cache-first
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts",
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            // Server function calls — network-first, fall through on error
            urlPattern: ({ url }) => url.pathname.startsWith("/_server"),
            handler: "NetworkOnly",
          },
          {
            // Auth API — network only
            urlPattern: ({ url }) => url.pathname.startsWith("/api/auth"),
            handler: "NetworkOnly",
          },
        ],
      },
    }),
  ],
})

export default config
