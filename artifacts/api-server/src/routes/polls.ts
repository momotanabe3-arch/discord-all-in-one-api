import { Router } from "express";
import { z } from "zod";
import { randomUUID } from "crypto";
import { authMiddleware } from "../middleware/auth.js";
import { ok, fail } from "../lib/response.js";
import { polls } from "../lib/store.js";

const router = Router();

const CreateSchema = z.object({
  question: z.string().min(1).max(256),
  options: z.array(z.string().min(1).max(64)).min(2).max(10),
  guild_id: z.string().min(1),
  duration_minutes: z.number().int().min(1).max(10080).default(60),
});

const VoteSchema = z.object({
  poll_id: z.string().min(1),
  option_index: z.number().int().min(0),
  user_id: z.string().min(1),
});

router.post("/poll/create", authMiddleware, (req, res) => {
  const parsed = CreateSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, parsed.error.errors[0]?.message ?? "Validation error");

  const { question, options, guild_id } = parsed.data;
  const id = randomUUID();
  const votes: Record<string, number> = {};
  options.forEach((_, i) => { votes[i.toString()] = 0; });

  polls[id] = { id, question, options, votes, createdAt: Date.now(), guildId: guild_id };

  return ok(res, {
    poll_id: id,
    question,
    options: options.map((o, i) => ({ index: i, text: o })),
    guild_id,
    bdscript: `$httpPost[https://your-api/api/poll/vote;{"poll_id":"${id}","option_index":$message[1],"user_id":"$authorID"}]`,
  });
});

router.post("/poll/vote", authMiddleware, (req, res) => {
  const parsed = VoteSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, parsed.error.errors[0]?.message ?? "Validation error");

  const { poll_id, option_index, user_id } = parsed.data;
  const poll = polls[poll_id];
  if (!poll) return fail(res, "Poll not found", 404);
  if (option_index >= poll.options.length) return fail(res, "Invalid option index");

  poll.votes[option_index.toString()] = (poll.votes[option_index.toString()] ?? 0) + 1;
  return ok(res, { poll_id, voted_for: poll.options[option_index], user_id });
});

router.get("/poll/results/:id", authMiddleware, (req, res) => {
  const poll = polls[req.params["id"] ?? ""];
  if (!poll) return fail(res, "Poll not found", 404);

  const total = Object.values(poll.votes).reduce((a, b) => a + b, 0);
  const results = poll.options.map((opt, i) => {
    const count = poll.votes[i.toString()] ?? 0;
    return { index: i, text: opt, votes: count, percentage: total > 0 ? ((count / total) * 100).toFixed(1) : "0.0" };
  });

  return ok(res, { poll_id: poll.id, question: poll.question, total_votes: total, results });
});

export default router;
