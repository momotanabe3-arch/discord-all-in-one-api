import { Router } from "express";
import { z } from "zod";
import { authMiddleware } from "../middleware/auth.js";
import { ok, fail } from "../lib/response.js";
import { Filter } from "bad-words";

const router = Router();
const filter = new Filter();

const SPAM_PATTERNS = [/(.)\1{9,}/, /(discord\.gg|discord\.com\/invite)\//i];
const LINK_PATTERN = /https?:\/\/[^\s]+/gi;
const NSFW_KEYWORDS = ["nsfw", "porn", "xxx", "nude", "explicit", "18+"];

const ScanSchema = z.object({
  content: z.string().min(1).max(4000),
  guild_id: z.string().optional(),
  checks: z.array(z.enum(["profanity", "spam", "link", "nsfw"])).default(["profanity", "spam", "link", "nsfw"]),
});

router.post("/mod/scan", authMiddleware, (req, res) => {
  const parsed = ScanSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, parsed.error.errors[0]?.message ?? "Validation error");

  const { content, checks } = parsed.data;
  const results: Record<string, { flagged: boolean; reason?: string; matches?: string[] }> = {};
  let flagged = false;

  if (checks.includes("profanity")) {
    const hasProfanity = filter.isProfane(content);
    results["profanity"] = { flagged: hasProfanity, reason: hasProfanity ? "Profanity detected" : undefined };
    if (hasProfanity) flagged = true;
  }

  if (checks.includes("spam")) {
    const isSpam = SPAM_PATTERNS.some(p => p.test(content));
    results["spam"] = { flagged: isSpam, reason: isSpam ? "Spam pattern detected" : undefined };
    if (isSpam) flagged = true;
  }

  if (checks.includes("link")) {
    const links = content.match(LINK_PATTERN) ?? [];
    const hasLinks = links.length > 0;
    results["link"] = { flagged: hasLinks, matches: links, reason: hasLinks ? `${links.length} link(s) found` : undefined };
    if (hasLinks) flagged = true;
  }

  if (checks.includes("nsfw")) {
    const lower = content.toLowerCase();
    const found = NSFW_KEYWORDS.filter(k => lower.includes(k));
    const isNsfw = found.length > 0;
    results["nsfw"] = { flagged: isNsfw, matches: found, reason: isNsfw ? "NSFW content detected" : undefined };
    if (isNsfw) flagged = true;
  }

  return ok(res, { flagged, checks: results, content_length: content.length });
});

export default router;
