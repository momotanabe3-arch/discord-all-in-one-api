import { Router } from "express";
import { z } from "zod";
import { randomUUID } from "crypto";
import { authMiddleware } from "../middleware/auth.js";
import { ok, fail } from "../lib/response.js";
import { captchas } from "../lib/store.js";

const router = Router();

function generateCode(length = 6): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

router.post("/captcha/generate", authMiddleware, (_req, res) => {
  const code = generateCode();
  const token = randomUUID();
  captchas[token] = { code, token, expiresAt: Date.now() + 5 * 60_000 };

  const svgWidth = 200, svgHeight = 60;
  const noise = Array.from({ length: 20 }, () =>
    `<line x1="${Math.random() * svgWidth}" y1="${Math.random() * svgHeight}" x2="${Math.random() * svgWidth}" y2="${Math.random() * svgHeight}" stroke="#aaa" stroke-width="1" opacity="0.4"/>`
  ).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}" style="background:#f5f5f5">
${noise}
<text x="30" y="42" font-size="30" font-family="monospace" fill="#333" letter-spacing="8">${code}</text></svg>`;

  return ok(res, {
    token,
    expires_in: 300,
    image_svg: svg,
    image_base64: `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`,
    bdscript: `$httpGet[https://your-api/api/captcha/verify?code=$message[1]&token=${token}]`,
  });
});

const VerifySchema = z.object({
  code: z.string().min(1),
  token: z.string().min(1),
});

router.get("/captcha/verify", authMiddleware, (req, res) => {
  const parsed = VerifySchema.safeParse(req.query);
  if (!parsed.success) return fail(res, "Missing code or token query params");

  const { code, token } = parsed.data;
  const captcha = captchas[token];

  if (!captcha) return fail(res, "Invalid or expired captcha token", 404);
  if (Date.now() > captcha.expiresAt) {
    delete captchas[token];
    return fail(res, "Captcha expired");
  }
  if (captcha.code !== code.toUpperCase()) return fail(res, "Incorrect captcha code");

  delete captchas[token];
  return ok(res, { verified: true, token });
});

export default router;
