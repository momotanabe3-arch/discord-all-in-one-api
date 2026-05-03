import { Router } from "express";
import { z } from "zod";
import { authMiddleware } from "../middleware/auth.js";
import { ok, fail } from "../lib/response.js";
import { shortUrls } from "../lib/store.js";

const router = Router();

const ShortenSchema = z.object({
  url: z.string().url(),
  alias: z.string().min(2).max(32).regex(/^[a-zA-Z0-9_-]+$/).optional(),
  guild_id: z.string().optional(),
});

function randomAlias(): string {
  return Math.random().toString(36).slice(2, 8);
}

router.post("/shorten", authMiddleware, (req, res) => {
  const parsed = ShortenSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, parsed.error.errors[0]?.message ?? "Validation error");

  const { url, alias } = parsed.data;
  const finalAlias = alias ?? randomAlias();

  if (shortUrls[finalAlias] && shortUrls[finalAlias]!.url !== url) {
    return fail(res, "Alias already taken");
  }

  shortUrls[finalAlias] = { url, alias: finalAlias, clicks: 0, createdAt: Date.now() };

  const baseUrl = process.env["BASE_URL"] ?? "https://your-api";
  return ok(res, {
    alias: finalAlias,
    short_url: `${baseUrl}/r/${finalAlias}`,
    original_url: url,
    created_at: new Date().toISOString(),
  });
});

router.get("/stats/:alias", authMiddleware, (req, res) => {
  const alias = req.params["alias"] ?? "";
  const entry = shortUrls[alias];
  if (!entry) return fail(res, "Alias not found", 404);

  return ok(res, {
    alias,
    original_url: entry.url,
    clicks: entry.clicks,
    created_at: new Date(entry.createdAt).toISOString(),
  });
});

router.get("/r/:alias", (req, res) => {
  const alias = req.params["alias"] ?? "";
  const entry = shortUrls[alias];
  if (!entry) return res.status(404).json({ success: false, data: {}, error: "Not found" });
  entry.clicks += 1;
  res.redirect(302, entry.url);
});

export default router;
