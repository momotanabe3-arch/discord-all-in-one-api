import rateLimit, { ipKeyGenerator } from "express-rate-limit";

export const globalRateLimit = rateLimit({
  windowMs: 60_000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const auth = req.headers.authorization ?? "";
    return auth.startsWith("Bot ") ? auth.slice(4) : auth || ipKeyGenerator(req);
  },
  handler: (_req, res) => {
    res.status(429).json({ success: false, data: {}, error: "Rate limit exceeded. Try again later." });
  },
});

export const strictRateLimit = rateLimit({
  windowMs: 60_000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const auth = req.headers.authorization ?? "";
    return auth.startsWith("Bot ") ? auth.slice(4) : auth || ipKeyGenerator(req);
  },
  handler: (_req, res) => {
    res.status(429).json({ success: false, data: {}, error: "Rate limit exceeded. Try again later." });
  },
});
