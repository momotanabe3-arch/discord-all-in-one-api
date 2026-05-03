import { Router } from "express";
import { z } from "zod";
import { randomUUID } from "crypto";
import { authMiddleware } from "../middleware/auth.js";
import { ok, fail } from "../lib/response.js";
import { notifications } from "../lib/store.js";

const router = Router();

const SendSchema = z.object({
  channel_id: z.string().min(1),
  message: z.string().min(1).max(2000),
  guild_id: z.string().optional(),
  embed: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    color: z.number().optional(),
  }).optional(),
});

const ScheduleSchema = SendSchema.extend({
  run_at: z.string().datetime(),
});

router.post("/notify/send", authMiddleware, (req, res) => {
  const parsed = SendSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, parsed.error.errors[0]?.message ?? "Validation error");

  const { channel_id, message } = parsed.data;
  const id = randomUUID();
  if (!notifications[channel_id]) notifications[channel_id] = [];
  notifications[channel_id]!.push({ id, channelId: channel_id, message, scheduledAt: null, sent: true });

  return ok(res, { notification_id: id, channel_id, sent: true, sent_at: new Date().toISOString() });
});

router.post("/notify/schedule", authMiddleware, (req, res) => {
  const parsed = ScheduleSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, parsed.error.errors[0]?.message ?? "Validation error");

  const { channel_id, message, run_at } = parsed.data;
  const id = randomUUID();
  const scheduledAt = new Date(run_at).getTime();
  if (!notifications[channel_id]) notifications[channel_id] = [];
  notifications[channel_id]!.push({ id, channelId: channel_id, message, scheduledAt, sent: false });

  return ok(res, { notification_id: id, channel_id, scheduled_at: run_at });
});

export default router;
