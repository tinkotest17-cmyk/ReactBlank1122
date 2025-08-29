
import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic } from "./vite";
import { getDatabase } from '../shared/supabase';

export function createServer() {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // Initialize database connection
  try {
    const database = getDatabase();
    if (database) {
      console.log('✅ Database connection initialized successfully');
      app.locals.db = database;
    } else {
      console.log('⚠️ Database connection not available (will use localStorage fallback)');
    }
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
  }

  // Add CORS headers for API routes
  app.use('/api', (req: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  });

  app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, any> | undefined = undefined;

    const originalResJson = res.json;
    res.json = function (bodyObj, ...args) {
      capturedJsonResponse = bodyObj;
      return originalResJson.apply(res, [bodyObj, ...args]);
    };

    res.on("finish", () => {
      const duration = Date.now() - start;
      if (path.startsWith("/api")) {
        let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
        if (capturedJsonResponse) {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        }

        if (logLine.length > 80) {
          logLine = logLine.slice(0, 79) + "…";
        }

        console.log(logLine);
      }
    });

    next();
  });

  registerRoutes(app);
  return app;
}

// Only start server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const app = createServer();
  const server = setupVite(app, serveStatic);

  const PORT = process.env.PORT || 8080;
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}
