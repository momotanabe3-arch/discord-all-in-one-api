import { Router } from "express";
import { z } from "zod";
import { randomUUID } from "crypto";
import { authMiddleware } from "../middleware/auth.js";
import { ok, fail } from "../lib/response.js";
import { schedules } from "../lib/store.js";

const router = Router();

const CreateSchema = z.object({
  action: z.string().min(1),
  payload: z.unknown().default({}),
  run_at: z.string().datetime(),
  guild_id: z.string().min(1),
  repeat: z.enum(["none", "hourly", "daily", "weekly"]).default("none"),
});

router.post("/schedule/create", authMiddleware, (req, res) => {
  const parsed = CreateSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, parsed.error.errors[0]?.message ?? "Validation error");

  const { action, payload, run_at, guild_id, repeat } = parsed.data;
  const id = randomUUID();
  schedules[id] = { id, action, payload, runAt: new Date(run_at).getTime(), guildId: guild_id, active: true };

  return ok(res, { schedule_id: id, action, run_at, repeat, guild_id, active: true });
});

router.delete("/schedule/:id", authMiddleware, (req, res) => {
  const id = req.params["id"] ?? "";
  if (!schedules[id]) return fail(res, "Schedule not found", 404);
  delete schedules[id];
  return ok(res, { schedule_id: id, deleted: true });
});

router.get("/schedule/list", authMiddleware, (req, res) => {
  const guild_id = req.query["guild_id"] as string | undefined;
  const list = Object.values(schedules)
    .filter(s => !guild_id || s.guildId === guild_id)
    .map(s => ({ ...s, run_at: new Date(s.runAt).toISOString() }));
  return ok(res, { schedules: list, total: list.length });
});

export default router;
