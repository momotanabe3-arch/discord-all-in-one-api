import { Router } from "express";
import { z } from "zod";
import { randomBytes, createHmac } from "crypto";
import { authMiddleware } from "../middleware/auth.js";
import { ok, fail } from "../lib/response.js";
import { apiKeys } from "../lib/store.js";

const router = Router();

const GenerateSchema = z.object({
  guild_id: z.string().min(1),
  label: z.string().optional(),
  expires_in_days: z.number().int().min(1).max(365).optional(),
});

const ValidateSchema = z.object({ key: z.string().min(1) });

function generateApiKey(): string {
  return `bda_${randomBytes(24).toString("hex")}`;
}

router.post("/auth/key/generate", authMiddleware, (req, res) => {
  const parsed = GenerateSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, parsed.error.errors[0]?.message ?? "Validation error");

  const { guild_id, label } = parsed.data;
  const key = generateApiKey();
  apiKeys[key] = { key, guildId: guild_id, createdAt: Date.now(), active: true };

  return ok(res, { api_key: key, guild_id, label, created_at: new Date().toISOString(), active: true });
});

router.post("/auth/key/validate", (req, res) => {
  const parsed = ValidateSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, parsed.error.errors[0]?.message ?? "Validation error");

  const { key } = parsed.data;
  const entry = apiKeys[key];
  if (!entry || !entry.active) return ok(res, { valid: false });

  return ok(res, { valid: true, guild_id: entry.guildId, created_at: new Date(entry.createdAt).toISOString() });
});

export default router;
