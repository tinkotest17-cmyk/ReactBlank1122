
import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 8080,
    allowedHosts: [
      "all",
      "cbe10c9b-58eb-4f08-8f08-7a5b73302414-00-2vpamohlzrxwz.picard.replit.dev",
      "55e78793-d23b-4bfa-b440-1ebd629d03b7-00-38g1crmv9a7z9.picard.replit.dev"
    ],
    fs: {
      allow: ["./client", "./shared"],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "server/**"],
    },
  },
  build: {
    outDir: "dist/spa",
  },
  plugins: [react(), expressPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
}));

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve", // Only apply during development (serve mode)
    configureServer(server) {
      // Dynamically import server only when needed
      server.middlewares.use('/api', async (req, res, next) => {
        try {
          const { createServer } = await import('./server/index.js');
          const app = createServer();
          app(req, res, next);
        } catch (error) {
          console.error('Failed to load server:', error);
          next();
        }
      });
    },
  };
}
