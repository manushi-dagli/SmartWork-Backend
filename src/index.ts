import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import { apiRouter } from "./routes/index.js";
import { authRoutes } from "./routes/auth.routes.js";
import { env } from "./config/env.js";
import { logger, morganMiddleware } from "./lib/logger.js";
import { requestIdMiddleware } from "./middleware/requestId.middleware.js";

const app = express();

app.use(requestIdMiddleware);
app.use(morganMiddleware);

app.use(
  cors({
    origin: env.frontendUrl,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);

app.use(cookieParser());
// Allow larger JSON payloads for profile picture (base64) and similar
app.use(express.json({ limit: "10mb" }));

// Auth: login, logout, me (then Better Auth handles the rest of /api/auth/*)
app.use("/api/auth", authRoutes);
app.all("/api/auth/*", toNodeHandler(auth));

app.use("/api", apiRouter);

app.get("/health", (_req, res) => {
  logger.info("Controller: GET /health");
  res.json({ ok: true, service: "smartwork-backend" });
});

app.listen(env.port, () => {
  logger.info(`Smart Work API listening on http://localhost:${env.port}`);
});
