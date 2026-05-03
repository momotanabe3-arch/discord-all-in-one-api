import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { ok } from "../lib/response.js";
import { analytics } from "../lib/store.js";

const router = Router();

function seedAnalytics(guildId: string, period: string): void {
  if (analytics[guildId]) return;
  const days = period === "weekly" ? 7 : period === "monthly" ? 30 : 1;
  analytics[guildId] = Array.from({ length: days }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return {
      date: d.toISOString().slice(0, 10),
      messages: Math.floor(Math.random() * 2000 + 100),
      joins: Math.floor(Math.random() * 50),
      leaves: Math.floor(Math.random() * 20),
      commands: Math.floor(Math.random() * 500),
    };
  }).reverse();
}

router.get("/analytics/guild/:id", authMiddleware, (req, res) => {
  const guildId = req.params["id"] ?? "";
  const period = (req.query["period"] as string) || "daily";

  seedAnalytics(guildId, period);
  const data = analytics[guildId] ?? [];

  const totals = data.reduce((acc, d) => ({
    messages: acc.messages + d.messages,
    joins: acc.joins + d.joins,
    leaves: acc.leaves + d.leaves,
    commands: acc.commands + d.commands,
  }), { messages: 0, joins: 0, leaves: 0, commands: 0 });

  return ok(res, { guild_id: guildId, period, totals, daily: data });
});

export default router;
