import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes/index.js";
import { logger } from "./lib/logger.js";
import { globalRateLimit } from "./middleware/rateLimit.js";

const app: Express = express();

app.use(cors({ origin: "*", exposedHeaders: ["X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset"] }));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(pinoHttp({
  logger,
  serializers: {
    req(req) { return { id: req.id, method: req.method, url: req.url?.split("?")[0] }; },
    res(res) { return { statusCode: res.statusCode }; },
  },
}));

app.use(globalRateLimit);

app.use("/api", router);

app.get("/health", (_req, res) => {
  res.json({ success: true, data: { status: "ok", uptime: process.uptime(), timestamp: new Date().toISOString(), version: "1.0.0" }, error: null });
});

app.use((req, res) => {
  res.status(404).json({ success: false, data: {}, error: `Route ${req.method} ${req.path} not found. See /api/docs for available endpoints.` });
});

export default app;
