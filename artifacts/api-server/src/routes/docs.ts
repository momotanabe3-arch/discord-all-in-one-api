import { Router } from "express";
import swaggerUi from "swagger-ui-express";

const router = Router();

const spec = {
  openapi: "3.0.0",
  info: {
    title: "Discord Bot API Platform",
    version: "1.0.0",
    description: "Multi-language Discord bot API platform supporting BDFD, JavaScript, and Python. All endpoints require `Authorization: Bot <token>`.",
    contact: { name: "API Support" },
  },
  servers: [{ url: "/api", description: "API Server" }],
  components: {
    securitySchemes: {
      BotToken: { type: "http", scheme: "bearer", bearerFormat: "Bot TOKEN", description: "Discord bot token. Format: `Bot YOUR_TOKEN`" },
    },
    schemas: {
      ApiResponse: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          data: { type: "object" },
          error: { type: "string", nullable: true },
        },
      },
    },
  },
  security: [{ BotToken: [] }],
  tags: [
    { name: "Transcript", description: "Channel message transcript export" },
    { name: "Captcha", description: "CAPTCHA generation and verification" },
    { name: "Card", description: "Profile card image generation" },
    { name: "Moderation", description: "Content scanning and moderation" },
    { name: "Backup", description: "Guild backup and restore" },
    { name: "AI", description: "AI chat with personalities" },
    { name: "Analytics", description: "Guild analytics and statistics" },
    { name: "Notifications", description: "Send and schedule notifications" },
    { name: "Economy", description: "Virtual currency economy system" },
    { name: "Scheduler", description: "Scheduled task management" },
    { name: "Polls", description: "Create and manage polls" },
    { name: "URL Shortener", description: "Short URL creation and tracking" },
    { name: "Games", description: "Blackjack and slot machine games" },
    { name: "Auth", description: "API key management" },
    { name: "Anti-Raid", description: "Anti-raid detection and lockdown" },
    { name: "Verification", description: "Email and phone verification" },
    { name: "SDK", description: "SDK downloads for BDFD, JavaScript, Python" },
  ],
  paths: {
    "/transcript": { post: { tags: ["Transcript"], summary: "Export channel transcript", requestBody: { content: { "application/json": { schema: { type: "object", required: ["channel_id"], properties: { channel_id: { type: "string" }, limit: { type: "integer", default: 100 }, format: { type: "string", enum: ["html","pdf","text"], default: "text" } } } } } }, responses: { 200: { description: "Transcript data", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } } } } } } },
    "/captcha/generate": { post: { tags: ["Captcha"], summary: "Generate a CAPTCHA", responses: { 200: { description: "CAPTCHA SVG and token" } } } },
    "/captcha/verify": { get: { tags: ["Captcha"], summary: "Verify CAPTCHA code", parameters: [{ in: "query", name: "code", required: true, schema: { type: "string" } }, { in: "query", name: "token", required: true, schema: { type: "string" } }], responses: { 200: { description: "Verification result" } } } },
    "/card/profile": { post: { tags: ["Card"], summary: "Generate profile card SVG", requestBody: { content: { "application/json": { schema: { type: "object", required: ["username"], properties: { username: { type: "string" }, avatar_url: { type: "string" }, level: { type: "integer" }, xp: { type: "number" }, xpmax: { type: "number" }, rank: { type: "integer" }, badges: { type: "array", items: { type: "string" } }, theme: { type: "string", enum: ["dark","light","blurple","red","green","gold"] }, color: { type: "string" } } } } } }, responses: { 200: { description: "SVG card image" } } } },
    "/mod/scan": { post: { tags: ["Moderation"], summary: "Scan content for violations", requestBody: { content: { "application/json": { schema: { type: "object", required: ["content"], properties: { content: { type: "string" }, guild_id: { type: "string" }, checks: { type: "array", items: { type: "string", enum: ["profanity","spam","link","nsfw"] } } } } } } }, responses: { 200: { description: "Scan results" } } } },
    "/backup/create": { post: { tags: ["Backup"], summary: "Create guild backup", responses: { 200: { description: "Backup ID" } } } },
    "/backup/restore": { post: { tags: ["Backup"], summary: "Restore guild backup", responses: { 200: { description: "Restore result" } } } },
    "/backup/list": { get: { tags: ["Backup"], summary: "List guild backups", parameters: [{ in: "query", name: "guild_id", schema: { type: "string" } }], responses: { 200: { description: "Backup list" } } } },
    "/ai/chat": { post: { tags: ["AI"], summary: "Chat with AI bot", requestBody: { content: { "application/json": { schema: { type: "object", required: ["message"], properties: { message: { type: "string" }, personality: { type: "string", enum: ["assistant","friendly","sarcastic","professional","gamer"] }, history: { type: "array" }, language: { type: "string" } } } } } }, responses: { 200: { description: "AI reply" } } } },
    "/analytics/guild/{id}": { get: { tags: ["Analytics"], summary: "Get guild analytics", parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }, { in: "query", name: "period", schema: { type: "string", enum: ["daily","weekly","monthly"] } }], responses: { 200: { description: "Analytics data" } } } },
    "/notify/send": { post: { tags: ["Notifications"], summary: "Send notification", responses: { 200: { description: "Sent" } } } },
    "/notify/schedule": { post: { tags: ["Notifications"], summary: "Schedule notification", responses: { 200: { description: "Scheduled" } } } },
    "/economy/earn": { post: { tags: ["Economy"], summary: "Add coins to user", responses: { 200: { description: "New balance" } } } },
    "/economy/spend": { post: { tags: ["Economy"], summary: "Deduct coins from user", responses: { 200: { description: "New balance" } } } },
    "/economy/balance/{user_id}": { get: { tags: ["Economy"], summary: "Get user balance", parameters: [{ in: "path", name: "user_id", required: true, schema: { type: "string" } }, { in: "query", name: "guild_id", schema: { type: "string" } }], responses: { 200: { description: "Balance" } } } },
    "/schedule/create": { post: { tags: ["Scheduler"], summary: "Create scheduled task", responses: { 200: { description: "Schedule ID" } } } },
    "/schedule/{id}": { delete: { tags: ["Scheduler"], summary: "Delete scheduled task", parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }], responses: { 200: { description: "Deleted" } } } },
    "/poll/create": { post: { tags: ["Polls"], summary: "Create poll", responses: { 200: { description: "Poll ID" } } } },
    "/poll/vote": { post: { tags: ["Polls"], summary: "Cast vote", responses: { 200: { description: "Vote registered" } } } },
    "/poll/results/{id}": { get: { tags: ["Polls"], summary: "Get poll results", parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }], responses: { 200: { description: "Results" } } } },
    "/shorten": { post: { tags: ["URL Shortener"], summary: "Shorten a URL", responses: { 200: { description: "Short URL" } } } },
    "/stats/{alias}": { get: { tags: ["URL Shortener"], summary: "Get URL stats", parameters: [{ in: "path", name: "alias", required: true, schema: { type: "string" } }], responses: { 200: { description: "Click stats" } } } },
    "/game/blackjack/deal": { post: { tags: ["Games"], summary: "Deal blackjack hand", responses: { 200: { description: "Initial hand" } } } },
    "/game/blackjack/{action}": { post: { tags: ["Games"], summary: "Blackjack action (hit/stand/double/surrender)", parameters: [{ in: "path", name: "action", required: true, schema: { type: "string", enum: ["hit","stand","double","surrender"] } }], responses: { 200: { description: "Game state" } } } },
    "/game/slots/spin": { post: { tags: ["Games"], summary: "Spin slot machine", responses: { 200: { description: "Spin result" } } } },
    "/auth/key/generate": { post: { tags: ["Auth"], summary: "Generate API key", responses: { 200: { description: "New API key" } } } },
    "/auth/key/validate": { post: { tags: ["Auth"], summary: "Validate API key", responses: { 200: { description: "Validation result" } } } },
    "/antiraid/check": { post: { tags: ["Anti-Raid"], summary: "Check user for raid threat", responses: { 200: { description: "Risk assessment" } } } },
    "/antiraid/lockdown": { post: { tags: ["Anti-Raid"], summary: "Enable/disable lockdown", responses: { 200: { description: "Lockdown status" } } } },
    "/verify/email/send": { post: { tags: ["Verification"], summary: "Send email verification code", responses: { 200: { description: "Sent" } } } },
    "/verify/email/check": { post: { tags: ["Verification"], summary: "Check email verification code", responses: { 200: { description: "Verified" } } } },
    "/verify/phone/send": { post: { tags: ["Verification"], summary: "Send phone verification code", responses: { 200: { description: "Sent" } } } },
    "/verify/phone/check": { post: { tags: ["Verification"], summary: "Check phone verification code", responses: { 200: { description: "Verified" } } } },
    "/sdk/bdfd": { get: { tags: ["SDK"], summary: "BDFD/BDScript snippets", security: [], responses: { 200: { description: "BDScript templates" } } } },
    "/sdk/javascript": { get: { tags: ["SDK"], summary: "JavaScript SDK download", security: [], responses: { 200: { description: "JS package code" } } } },
    "/sdk/python": { get: { tags: ["SDK"], summary: "Python SDK download", security: [], responses: { 200: { description: "Python package code" } } } },
  },
};

router.use("/docs", swaggerUi.serve);
router.get("/docs", swaggerUi.setup(spec, {
  customSiteTitle: "Discord Bot API Platform — Docs",
  customCss: ".swagger-ui .topbar { background-color: #5865f2 } .swagger-ui .topbar-wrapper img { display: none }",
}));

router.get("/docs/openapi.json", (_req, res) => res.json(spec));

export default router;
