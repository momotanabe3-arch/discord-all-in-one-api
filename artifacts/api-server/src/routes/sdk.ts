import { Router } from "express";
import { ok } from "../lib/response.js";

const router = Router();

const BDFD_TEMPLATES = {
  profile_card: `$httpPost[https://your-api/api/card/profile;{"username":"$username[$authorID]","avatar_url":"$authorAvatar[$authorID;png]","level":$getVar[level;$authorID],"xp":$getVar[xp;$authorID],"xpmax":$getVar[xpmax;$authorID],"rank":1,"theme":"dark"}]`,
  poll_create: `$httpPost[https://your-api/api/poll/create;{"question":"$message[1-]","options":["Yes","No","Maybe"],"guild_id":"$guildID","duration_minutes":60}]`,
  poll_vote: `$httpPost[https://your-api/api/poll/vote;{"poll_id":"$message[1]","option_index":$message[2],"user_id":"$authorID"}]`,
  economy_earn: `$httpPost[https://your-api/api/economy/earn;{"user_id":"$authorID","guild_id":"$guildID","amount":$message[1],"reason":"Command reward"}]`,
  economy_balance: `$httpGet[https://your-api/api/economy/balance/$authorID?guild_id=$guildID]`,
  mod_scan: `$httpPost[https://your-api/api/mod/scan;{"content":"$message[1-]","guild_id":"$guildID","checks":["profanity","spam","link","nsfw"]}]`,
  captcha_gen: `$httpPost[https://your-api/api/captcha/generate;{}]`,
  transcript: `$httpPost[https://your-api/api/transcript;{"channel_id":"$channelID","limit":100,"format":"text"}]`,
  slots_spin: `$httpPost[https://your-api/api/game/slots/spin;{"bet":$message[1]}]`,
  shorten_url: `$httpPost[https://your-api/api/shorten;{"url":"$message[1]","guild_id":"$guildID"}]`,
  ai_chat: `$httpPost[https://your-api/api/ai/chat;{"message":"$message[1-]","personality":"friendly","language":"English"}]`,
  antiraid_check: `$httpPost[https://your-api/api/antiraid/check;{"guild_id":"$guildID","user_id":"$message[1]","account_age_days":$message[2]}]`,
};

router.get("/sdk/bdfd", (_req, res) => {
  return ok(res, {
    description: "BDFD (BDScript) snippets for all endpoints. Replace https://your-api with your deployed URL.",
    usage: "Use these in $httpGet or $httpPost BDFD functions.",
    templates: BDFD_TEMPLATES,
    auth_header_example: "Set Authorization: Bot YOUR_TOKEN in all requests",
    bdscript_http_example: `$httpPost[https://your-api/api/endpoint;{...body...};Authorization: Bot YOUR_TOKEN]`,
  });
});

const JS_PACKAGE = `// discord-bot-api-platform - JavaScript SDK
// npm install axios

const axios = require('axios');

class BotAPI {
  constructor(token, baseUrl = 'https://your-api') {
    this.token = token;
    this.baseUrl = baseUrl;
    this.headers = { 'Authorization': \`Bot \${token}\`, 'Content-Type': 'application/json' };
  }

  async request(method, path, data = null) {
    const res = await axios({ method, url: \`\${this.baseUrl}/api\${path}\`, data, headers: this.headers });
    return res.data;
  }

  // Transcript
  async getTranscript(channelId, limit = 100, format = 'text') {
    return this.request('POST', '/transcript', { channel_id: channelId, limit, format });
  }

  // Captcha
  async generateCaptcha() { return this.request('POST', '/captcha/generate'); }
  async verifyCaptcha(code, token) { return this.request('GET', \`/captcha/verify?code=\${code}&token=\${token}\`); }

  // Profile Card
  async generateCard(opts) { return this.request('POST', '/card/profile', opts); }

  // Moderation
  async scanContent(content, guildId, checks = ['profanity','spam','link','nsfw']) {
    return this.request('POST', '/mod/scan', { content, guild_id: guildId, checks });
  }

  // Economy
  async earn(userId, guildId, amount, reason = '') { return this.request('POST', '/economy/earn', { user_id: userId, guild_id: guildId, amount, reason }); }
  async spend(userId, guildId, amount, reason = '') { return this.request('POST', '/economy/spend', { user_id: userId, guild_id: guildId, amount, reason }); }
  async getBalance(userId, guildId) { return this.request('GET', \`/economy/balance/\${userId}?guild_id=\${guildId}\`); }

  // Polls
  async createPoll(question, options, guildId) { return this.request('POST', '/poll/create', { question, options, guild_id: guildId }); }
  async vote(pollId, optionIndex, userId) { return this.request('POST', '/poll/vote', { poll_id: pollId, option_index: optionIndex, user_id: userId }); }
  async getPollResults(pollId) { return this.request('GET', \`/poll/results/\${pollId}\`); }

  // Games
  async dealBlackjack(bet, userId) { return this.request('POST', '/game/blackjack/deal', { bet, user_id: userId }); }
  async blackjackAction(action, userId) { return this.request('POST', \`/game/blackjack/\${action}\`, { user_id: userId }); }
  async spinSlots(bet) { return this.request('POST', '/game/slots/spin', { bet }); }

  // AI Chat
  async chat(message, personality = 'assistant', history = []) { return this.request('POST', '/ai/chat', { message, personality, history }); }

  // Analytics
  async getAnalytics(guildId, period = 'daily') { return this.request('GET', \`/analytics/guild/\${guildId}?period=\${period}\`); }
}

module.exports = { BotAPI };

// Discord.js v14 Middleware
const discordJsMiddleware = (client, apiToken, baseUrl) => {
  const api = new BotAPI(apiToken, baseUrl);
  client.botApi = api;
  return api;
};

module.exports.discordJsMiddleware = discordJsMiddleware;

// TypeScript definitions embedded:
/*
interface BotAPIOptions { token: string; baseUrl?: string; }
declare class BotAPI {
  constructor(token: string, baseUrl?: string);
  getTranscript(channelId: string, limit?: number, format?: 'html'|'pdf'|'text'): Promise<any>;
  generateCaptcha(): Promise<any>;
  verifyCaptcha(code: string, token: string): Promise<any>;
  generateCard(opts: ProfileCardOptions): Promise<any>;
  scanContent(content: string, guildId: string, checks?: string[]): Promise<any>;
  earn(userId: string, guildId: string, amount: number, reason?: string): Promise<any>;
  spend(userId: string, guildId: string, amount: number, reason?: string): Promise<any>;
  getBalance(userId: string, guildId: string): Promise<any>;
  createPoll(question: string, options: string[], guildId: string): Promise<any>;
  vote(pollId: string, optionIndex: number, userId: string): Promise<any>;
  getPollResults(pollId: string): Promise<any>;
  dealBlackjack(bet: number, userId: string): Promise<any>;
  blackjackAction(action: 'hit'|'stand'|'double'|'surrender', userId: string): Promise<any>;
  spinSlots(bet: number): Promise<any>;
  chat(message: string, personality?: string, history?: any[]): Promise<any>;
  getAnalytics(guildId: string, period?: string): Promise<any>;
}
*/`;

router.get("/sdk/javascript", (_req, res) => {
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  return res.send(JS_PACKAGE);
});

const PY_PACKAGE = `# discord-bot-api-platform - Python SDK
# pip install aiohttp discord.py

import aiohttp
from typing import Optional, List, Dict, Any

class BotAPI:
    def __init__(self, token: str, base_url: str = "https://your-api"):
        self.token = token
        self.base_url = base_url
        self.headers = {"Authorization": f"Bot {token}", "Content-Type": "application/json"}

    async def _request(self, method: str, path: str, data: Optional[dict] = None, params: Optional[dict] = None) -> dict:
        async with aiohttp.ClientSession() as session:
            async with session.request(method, f"{self.base_url}/api{path}", json=data, params=params, headers=self.headers) as r:
                return await r.json()

    async def get_transcript(self, channel_id: str, limit: int = 100, format: str = "text") -> dict:
        return await self._request("POST", "/transcript", {"channel_id": channel_id, "limit": limit, "format": format})

    async def generate_captcha(self) -> dict:
        return await self._request("POST", "/captcha/generate")

    async def verify_captcha(self, code: str, token: str) -> dict:
        return await self._request("GET", f"/captcha/verify", params={"code": code, "token": token})

    async def generate_card(self, **kwargs) -> dict:
        return await self._request("POST", "/card/profile", kwargs)

    async def scan_content(self, content: str, guild_id: str, checks: List[str] = None) -> dict:
        return await self._request("POST", "/mod/scan", {"content": content, "guild_id": guild_id, "checks": checks or ["profanity","spam","link","nsfw"]})

    async def earn(self, user_id: str, guild_id: str, amount: float, reason: str = "") -> dict:
        return await self._request("POST", "/economy/earn", {"user_id": user_id, "guild_id": guild_id, "amount": amount, "reason": reason})

    async def spend(self, user_id: str, guild_id: str, amount: float, reason: str = "") -> dict:
        return await self._request("POST", "/economy/spend", {"user_id": user_id, "guild_id": guild_id, "amount": amount, "reason": reason})

    async def get_balance(self, user_id: str, guild_id: str) -> dict:
        return await self._request("GET", f"/economy/balance/{user_id}", params={"guild_id": guild_id})

    async def create_poll(self, question: str, options: List[str], guild_id: str) -> dict:
        return await self._request("POST", "/poll/create", {"question": question, "options": options, "guild_id": guild_id})

    async def vote(self, poll_id: str, option_index: int, user_id: str) -> dict:
        return await self._request("POST", "/poll/vote", {"poll_id": poll_id, "option_index": option_index, "user_id": user_id})

    async def get_poll_results(self, poll_id: str) -> dict:
        return await self._request("GET", f"/poll/results/{poll_id}")

    async def deal_blackjack(self, bet: float, user_id: str) -> dict:
        return await self._request("POST", "/game/blackjack/deal", {"bet": bet, "user_id": user_id})

    async def blackjack_action(self, action: str, user_id: str) -> dict:
        return await self._request("POST", f"/game/blackjack/{action}", {"user_id": user_id})

    async def spin_slots(self, bet: float) -> dict:
        return await self._request("POST", "/game/slots/spin", {"bet": bet})

    async def chat(self, message: str, personality: str = "assistant", history: List[dict] = None) -> dict:
        return await self._request("POST", "/ai/chat", {"message": message, "personality": personality, "history": history or []})

    async def get_analytics(self, guild_id: str, period: str = "daily") -> dict:
        return await self._request("GET", f"/analytics/guild/{guild_id}", params={"period": period})


# discord.py Cog Extension
import discord
from discord.ext import commands

class BotAPICog(commands.Cog):
    """Discord.py Cog for Bot API Platform"""
    def __init__(self, bot: commands.Bot, token: str, base_url: str = "https://your-api"):
        self.bot = bot
        self.api = BotAPI(token, base_url)

    @commands.command()
    async def balance(self, ctx):
        result = await self.api.get_balance(str(ctx.author.id), str(ctx.guild.id))
        if result.get("success"):
            await ctx.send(f"Your balance: {result['data']['balance']} coins")
        else:
            await ctx.send(f"Error: {result.get('error')}")

    @commands.command()
    async def slots(self, ctx, bet: int = 10):
        result = await self.api.spin_slots(bet)
        if result.get("success"):
            d = result["data"]
            await ctx.send(f"{d['display']} | {'WIN' if d['win'] else 'PARTIAL' if d['partial'] else 'LOSE'} | Payout: {d['payout']}")

    @commands.command()
    async def scan(self, ctx, *, content: str):
        result = await self.api.scan_content(content, str(ctx.guild.id))
        if result.get("success"):
            d = result["data"]
            status = "FLAGGED" if d["flagged"] else "CLEAN"
            await ctx.send(f"Content {status}: {d['checks']}")


# FastAPI Middleware
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse

def add_bot_api_middleware(app: FastAPI, token: str, base_url: str = "https://your-api"):
    api = BotAPI(token, base_url)

    @app.middleware("http")
    async def inject_api(request: Request, call_next):
        request.state.bot_api = api
        return await call_next(request)

    return api
`;

router.get("/sdk/python", (_req, res) => {
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  return res.send(PY_PACKAGE);
});

export default router;
