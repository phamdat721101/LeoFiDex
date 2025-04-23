import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";
import path from "path";

// Derive __dirname for ESM
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientRoot = path.resolve(__dirname, "client");

export default defineConfig({
  root: clientRoot,
  base: "./",  // keep assets relative to index.html

  // point Vite’s static-public folder back to client/public
  // (you can also omit this line, since 'public' is Vite’s default)
  publicDir: path.resolve(clientRoot, "public"),

  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    // dev-only Cartographer
    ...(process.env.NODE_ENV !== "production" && process.env.REPL_ID
      ? [await import("@replit/vite-plugin-cartographer").then(m => m.cartographer())]
      : []),
  ],

  resolve: {
    alias: {
      "@": path.resolve(clientRoot, "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },

  build: {
    // ← output into dist/public so your server’s serveStatic() finds it
    outDir: path.resolve(__dirname, "dist", "public"),
    emptyOutDir: true,

    rollupOptions: {
      input: path.resolve(clientRoot, "index.html"),
    },
  },
});
