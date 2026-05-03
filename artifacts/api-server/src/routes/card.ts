import { Router } from "express";
import { z } from "zod";
import { authMiddleware } from "../middleware/auth.js";
import { ok, fail } from "../lib/response.js";

const router = Router();

const ProfileSchema = z.object({
  username: z.string().min(1).max(32),
  avatar_url: z.string().url().optional(),
  level: z.number().int().min(0).default(1),
  xp: z.number().min(0).default(0),
  xpmax: z.number().min(1).default(1000),
  rank: z.number().int().min(1).default(1),
  badges: z.array(z.string()).default([]),
  theme: z.enum(["dark", "light", "blurple", "red", "green", "gold"]).default("dark"),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#7289da"),
});

const THEMES: Record<string, { bg: string; text: string; bar: string; card: string }> = {
  dark:    { bg: "#2c2f33", text: "#ffffff", bar: "#7289da", card: "#23272a" },
  light:   { bg: "#f2f3f5", text: "#2e3338", bar: "#5865f2", card: "#ffffff" },
  blurple: { bg: "#5865f2", text: "#ffffff", bar: "#ffffff", card: "#4752c4" },
  red:     { bg: "#ed4245", text: "#ffffff", bar: "#ffffff", card: "#c03537" },
  green:   { bg: "#57f287", text: "#23272a", bar: "#3ba55d", card: "#3ba55d" },
  gold:    { bg: "#faa61a", text: "#23272a", bar: "#ffffff", card: "#c27c16" },
};

router.post("/card/profile", authMiddleware, (req, res) => {
  const parsed = ProfileSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, parsed.error.errors[0]?.message ?? "Validation error");

  const d = parsed.data;
  const t = THEMES[d.theme] ?? THEMES["dark"]!;
  const pct = Math.min((d.xp / d.xpmax) * 100, 100);
  const barW = Math.floor(pct * 3.4);

  const badgeIcons: Record<string, string> = {
    "staff": "🛡️", "partner": "🤝", "verified": "✅", "boost": "💎", "bug": "🐛", "dev": "⚙️",
  };
  const badgeStr = d.badges.map(b => badgeIcons[b] ?? b).join(" ");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="120">
  <rect width="400" height="120" rx="12" fill="${t.bg}"/>
  <rect x="10" y="10" width="380" height="100" rx="8" fill="${t.card}" opacity="0.6"/>
  ${d.avatar_url ? `<image href="${d.avatar_url}" x="16" y="16" width="72" height="72" clip-path="circle(36px at 50% 50%)" preserveAspectRatio="xMidYMid slice"/>` : `<circle cx="52" cy="52" r="36" fill="${t.bar}"/><text x="52" y="60" text-anchor="middle" fill="${t.text}" font-size="28">${d.username[0]?.toUpperCase()}</text>`}
  <text x="102" y="38" fill="${t.text}" font-size="18" font-family="sans-serif" font-weight="bold">${d.username}</text>
  <text x="102" y="56" fill="${t.text}" font-size="12" font-family="sans-serif" opacity="0.7">Rank #${d.rank} • Level ${d.level}</text>
  <text x="102" y="72" fill="${t.text}" font-size="11" font-family="sans-serif" opacity="0.6">${badgeStr}</text>
  <rect x="102" y="82" width="340" height="10" rx="5" fill="${t.card}"/>
  <rect x="102" y="82" width="${barW}" height="10" rx="5" fill="${t.bar}"/>
  <text x="102" y="108" fill="${t.text}" font-size="10" font-family="sans-serif" opacity="0.7">${d.xp} / ${d.xpmax} XP (${pct.toFixed(1)}%)</text>
</svg>`;

  return ok(res, {
    username: d.username,
    level: d.level,
    rank: d.rank,
    xp: d.xp,
    xp_percent: pct,
    image_svg: svg,
    image_base64: `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`,
    bdscript: `$httpPost[https://your-api/api/card/profile;{"username":"$username[$authorID]","avatar_url":"$authorAvatar[$authorID;png]","level":$getVar[level;$authorID],"xp":$getVar[xp;$authorID],"xpmax":$getVar[xpmax;$authorID],"rank":1,"theme":"dark"}]`,
  });
});

export default router;
