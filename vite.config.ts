
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Split chunks for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          tanstack: ['@tanstack/react-query'],
          router: ['react-router-dom'],
          ui: [
            '@radix-ui/react-dialog',
            '@radix-ui/react-tabs',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-scroll-area',
          ],
        },
      },
    },
    // Use esbuild for minification instead of terser
    minify: 'esbuild',
    cssMinify: 'lightningcss',
    // Enable more aggressive optimizations
    target: 'es2015',
    assetsInlineLimit: 4096, // Inline assets smaller than 4kb
    chunkSizeWarningLimit: 1000, // Warn on chunks above 1MB
  },
}));
