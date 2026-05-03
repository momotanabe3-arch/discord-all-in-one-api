# Discord Bot API Platform

## Overview

A multi-language REST API platform for Discord bots with a React dashboard. Supports BDFD (BDScript), JavaScript (Discord.js v14), and Python (discord.py / FastAPI).

## Architecture

- **API Server**: Express 5 + TypeScript at `/api/*`
- **Dashboard**: React + Vite at `/` — interactive testing UI for all 16 modules
- **SDKs**: BDFD, JavaScript, Python downloads at `/api/sdk/*`
- **Docs**: Swagger UI at `/api/docs`

## Stack

- **Monorepo**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: In-memory (PostgreSQL + Drizzle ORM ready)
- **Validation**: Zod
- **Rate limiting**: express-rate-limit (120 req/min global, 20 strict)
- **Docs**: swagger-ui-express + swagger-jsdoc
- **AI**: OpenAI SDK (requires OPENAI_API_KEY)
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui + wouter

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/dashboard run dev` — run dashboard locally

## Modules (16 total)

1. **Transcript** — `POST /api/transcript` — Export channel messages as HTML/text
2. **Captcha** — `POST /api/captcha/generate`, `GET /api/captcha/verify`
3. **Card Generator** — `POST /api/card/profile` — SVG profile cards with XP bars
4. **Moderation** — `POST /api/mod/scan` — Profanity/spam/NSFW scanning
5. **Backup** — `POST /api/backup/create|restore`, `GET /api/backup/list`
6. **AI Chat** — `POST /api/ai/chat` — GPT with personalities (requires OPENAI_API_KEY)
7. **Analytics** — `GET /api/analytics/guild/:id`
8. **Notifications** — `POST /api/notify/send|schedule`
9. **Economy** — `POST /api/economy/earn|spend`, `GET /api/economy/balance/:user_id`
10. **Scheduler** — `POST /api/schedule/create`, `DELETE /api/schedule/:id`
11. **Polls** — `POST /api/poll/create|vote`, `GET /api/poll/results/:id`
12. **URL Shortener** — `POST /api/shorten`, `GET /api/stats/:alias`
13. **Games** — Blackjack + Slots at `/api/game/*`
14. **Auth Keys** — `POST /api/auth/key/generate|validate`
15. **Anti-Raid** — `POST /api/antiraid/check|lockdown`
16. **Verification** — Email + Phone OTP at `/api/verify/*`

## Auth

All endpoints require `Authorization: Bot YOUR_DISCORD_BOT_TOKEN`. Token is validated against the Discord API (cached 60s).

## Deploy

- `Dockerfile` + `docker-compose.yml` included for self-hosting
- `.env.example` documents all configuration options

## GitHub

Repo: https://github.com/momotanabe3-arch/discord-all-in-one-api  
Push using a classic PAT (`ghp_*`) with `repo` scope via:  
`git push https://momotanabe3-arch:<TOKEN>@github.com/momotanabe3-arch/discord-all-in-one-api.git HEAD:main`

## Environment Variables

- `PORT` — Server port (auto-set by Replit)
- `OPENAI_API_KEY` — Required for real AI chat responses
- `BASE_URL` — Your deployed URL (for SDK snippets)
- `SESSION_SECRET` — Session signing secret

See `.env.example` for full list.
