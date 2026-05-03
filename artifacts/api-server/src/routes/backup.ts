import { Router } from "express";
import { z } from "zod";
import { randomUUID } from "crypto";
import { authMiddleware } from "../middleware/auth.js";
import { ok, fail } from "../lib/response.js";
import { backups } from "../lib/store.js";

const router = Router();

const CreateSchema = z.object({
  guild_id: z.string().min(1),
  include: z.array(z.enum(["roles", "channels", "emojis", "bans"])).default(["roles", "channels"]),
  data: z.record(z.unknown()).optional(),
});

const RestoreSchema = z.object({
  backup_id: z.string().min(1),
  guild_id: z.string().min(1),
  overwrite: z.boolean().default(false),
});

router.post("/backup/create", authMiddleware, (req, res) => {
  const parsed = CreateSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, parsed.error.errors[0]?.message ?? "Validation error");

  const { guild_id, include, data } = parsed.data;
  const id = randomUUID();
  backups[id] = {
    id,
    guildId: guild_id,
    createdAt: Date.now(),
    data: data ?? { guild_id, include, note: "Backup created via API" },
  };

  return ok(res, { backup_id: id, guild_id, created_at: new Date().toISOString(), include });
});

router.post("/backup/restore", authMiddleware, (req, res) => {
  const parsed = RestoreSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, parsed.error.errors[0]?.message ?? "Validation error");

  const { backup_id, guild_id } = parsed.data;
  const backup = backups[backup_id];
  if (!backup) return fail(res, "Backup not found", 404);

  return ok(res, {
    backup_id,
    guild_id,
    restored: true,
    restored_at: new Date().toISOString(),
    data: backup.data,
  });
});

router.get("/backup/list", authMiddleware, (req, res) => {
  const guild_id = req.query["guild_id"] as string | undefined;
  const list = Object.values(backups)
    .filter(b => !guild_id || b.guildId === guild_id)
    .map(b => ({ backup_id: b.id, guild_id: b.guildId, created_at: new Date(b.createdAt).toISOString() }));
  return ok(res, { backups: list, total: list.length });
});

export default router;
