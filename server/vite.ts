
import fs from "fs";
import path from "path";
import express, { type Express } from "express";

export async function setupVite(app: Express, server: any) {
  const vite = await (await import("vite")).createServer({
    root: process.cwd(),
    server: {
      middlewareMode: true,
      hmr: {
        port: 24678,
      },
    },
    appType: "spa",
  });

  app.use(vite.ssrFixStacktrace);
  app.use(vite.middlewares);

  return server;
}

export function serveStatic(app: Express) {
  const distPath = path.resolve("dist");

  if (!fs.existsSync(distPath)) {
    throw new Error(`Could not find the build directory: ${distPath}`);
  }

  app.use(express.static(distPath));
  
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
