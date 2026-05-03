import { Router } from "express";
import { z } from "zod";
import { authMiddleware } from "../middleware/auth.js";
import { ok, fail } from "../lib/response.js";
import { economy } from "../lib/store.js";

const router = Router();

const EarnSchema = z.object({
  user_id: z.string().min(1),
  guild_id: z.string().min(1),
  amount: z.number().positive(),
  reason: z.string().optional(),
});

const SpendSchema = z.object({
  user_id: z.string().min(1),
  guild_id: z.string().min(1),
  amount: z.number().positive(),
  reason: z.string().optional(),
});

function key(user_id: string, guild_id: string) { return `${guild_id}:${user_id}`; }

router.post("/economy/earn", authMiddleware, (req, res) => {
  const parsed = EarnSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, parsed.error.errors[0]?.message ?? "Validation error");

  const { user_id, guild_id, amount, reason } = parsed.data;
  const k = key(user_id, guild_id);
  economy[k] = (economy[k] ?? 0) + amount;

  return ok(res, { user_id, guild_id, earned: amount, balance: economy[k], reason });
});

router.post("/economy/spend", authMiddleware, (req, res) => {
  const parsed = SpendSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, parsed.error.errors[0]?.message ?? "Validation error");

  const { user_id, guild_id, amount, reason } = parsed.data;
  const k = key(user_id, guild_id);
  const current = economy[k] ?? 0;

  if (current < amount) return fail(res, `Insufficient balance. Current: ${current}, Required: ${amount}`);

  economy[k] = current - amount;
  return ok(res, { user_id, guild_id, spent: amount, balance: economy[k], reason });
});

router.get("/economy/balance/:user_id", authMiddleware, (req, res) => {
  const user_id = req.params["user_id"] ?? "";
  const guild_id = (req.query["guild_id"] as string) ?? "";

  if (guild_id) {
    const k = key(user_id, guild_id);
    return ok(res, { user_id, guild_id, balance: economy[k] ?? 0 });
  }

  const entries = Object.entries(economy)
    .filter(([k]) => k.endsWith(`:${user_id}`))
    .map(([k, bal]) => ({ guild_id: k.split(":")[0], balance: bal }));

  return ok(res, { user_id, balances: entries });
});

export default router;
