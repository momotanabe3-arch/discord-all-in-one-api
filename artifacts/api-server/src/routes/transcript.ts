import { Router } from "express";
import { z } from "zod";
import { authMiddleware } from "../middleware/auth.js";
import { ok, fail } from "../lib/response.js";
import { getChannelMessages } from "../lib/discord.js";

const router = Router();

const Schema = z.object({
  channel_id: z.string().min(1),
  limit: z.number().int().min(1).max(500).default(100),
  format: z.enum(["html", "pdf", "text"]).default("text"),
});

router.post("/transcript", authMiddleware, async (req, res) => {
  const parsed = Schema.safeParse(req.body);
  if (!parsed.success) return fail(res, parsed.error.errors[0]?.message ?? "Validation error");

  const { channel_id, limit, format } = parsed.data;
  const token = res.locals["botToken"] as string;

  try {
    const messages = await getChannelMessages(token, channel_id, limit) as Array<{
      id: string; content: string; timestamp: string;
      author: { username: string; discriminator: string };
    }>;

    const sorted = [...messages].reverse();

    let content: string;
    if (format === "html") {
      const rows = sorted.map(m =>
        `<div class="msg"><span class="author">${m.author.username}</span><span class="time">${m.timestamp}</span><p>${m.content}</p></div>`
      ).join("\n");
      content = `<!DOCTYPE html><html><head><style>body{font-family:sans-serif;background:#36393f;color:#dcddde}
.msg{padding:8px 16px;}.author{color:#7289da;font-weight:bold;margin-right:8px}.time{color:#72767d;font-size:12px}</style></head>
<body><h2>Transcript</h2>${rows}</body></html>`;
    } else if (format === "pdf") {
      content = `PDF export not available in free tier. Use format: "html" or "text".`;
    } else {
      content = sorted.map(m => `[${m.timestamp}] ${m.author.username}: ${m.content}`).join("\n");
    }

    return ok(res, {
      channel_id,
      message_count: sorted.length,
      format,
      content,
      bdscript: `$httpGet[https://your-api/api/transcript;{"channel_id":"${channel_id}","limit":${limit},"format":"${format}"}]`,
    });
  } catch (err) {
    return fail(res, `Failed to fetch messages: ${(err as Error).message}`, 502);
  }
});

export default router;
