import { Router } from "express";
import { z } from "zod";
import { authMiddleware } from "../middleware/auth.js";
import { ok, fail } from "../lib/response.js";

const router = Router();

const joinLog: Record<string, number[]> = {};
const lockdowns: Set<string> = new Set();

const CheckSchema = z.object({
  guild_id: z.string().min(1),
  user_id: z.string().min(1),
  account_age_days: z.number().min(0).optional(),
  has_avatar: z.boolean().optional(),
  joins_last_minute: z.number().int().min(0).optional(),
});

const LockdownSchema = z.object({
  guild_id: z.string().min(1),
  action: z.enum(["enable", "disable"]),
  reason: z.string().optional(),
});

router.post("/antiraid/check", authMiddleware, (req, res) => {
  const parsed = CheckSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, parsed.error.errors[0]?.message ?? "Validation error");

  const { guild_id, user_id, account_age_days = 30, has_avatar = true, joins_last_minute = 0 } = parsed.data;

  const flags: string[] = [];
  let risk_score = 0;

  if (account_age_days < 7) { flags.push("new_account"); risk_score += 40; }
  else if (account_age_days < 30) { flags.push("young_account"); risk_score += 15; }
  if (!has_avatar) { flags.push("no_avatar"); risk_score += 20; }
  if (joins_last_minute > 10) { flags.push("mass_join"); risk_score += 50; }
  else if (joins_last_minute > 5) { flags.push("suspicious_join_rate"); risk_score += 25; }
  if (lockdowns.has(guild_id)) { flags.push("lockdown_active"); risk_score += 30; }

  const threat_level = risk_score >= 70 ? "high" : risk_score >= 40 ? "medium" : "low";
  const action = risk_score >= 70 ? "ban" : risk_score >= 40 ? "kick" : "allow";

  return ok(res, { guild_id, user_id, risk_score, threat_level, flags, action, lockdown_active: lockdowns.has(guild_id) });
});

router.post("/antiraid/lockdown", authMiddleware, (req, res) => {
  const parsed = LockdownSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, parsed.error.errors[0]?.message ?? "Validation error");

  const { guild_id, action, reason } = parsed.data;
  if (action === "enable") lockdowns.add(guild_id);
  else lockdowns.delete(guild_id);

  return ok(res, { guild_id, lockdown_active: action === "enable", reason, updated_at: new Date().toISOString() });
});

export default router;
