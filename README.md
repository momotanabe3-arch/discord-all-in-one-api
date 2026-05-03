# Discord Bot API Platform

A multi-language REST API platform for Discord bots. Supports **BDFD (BDScript)**, **JavaScript (Node.js / Discord.js v14)**, and **Python (discord.py / FastAPI)**.

## Quick Start

```bash
# 1. Copy env file
cp .env.example .env

# 2. Install dependencies
pnpm install

# 3. Start dev server
pnpm --filter @workspace/api-server run dev
```

The server starts on `PORT` (default `3000`). Visit `/api/docs` for interactive Swagger UI.

## Docker

```bash
# Build and run
docker compose up -d

# View logs
docker compose logs -f api
```

## Authentication

Every endpoint (except `/health`, `/api/docs`, `/api/sdk/*`) requires:

```
Authorization: Bot YOUR_DISCORD_BOT_TOKEN
```

The token is validated against the Discord API on every request (results cached for 60 seconds).

## Endpoints

| Module | Endpoint | Method |
|---|---|---|
| Transcript | `/api/transcript` | POST |
| Captcha | `/api/captcha/generate` | POST |
| Captcha | `/api/captcha/verify` | GET |
| Card | `/api/card/profile` | POST |
| Moderation | `/api/mod/scan` | POST |
| Backup | `/api/backup/create` | POST |
| Backup | `/api/backup/restore` | POST |
| Backup | `/api/backup/list` | GET |
| AI Chat | `/api/ai/chat` | POST |
| Analytics | `/api/analytics/guild/:id` | GET |
| Notifications | `/api/notify/send` | POST |
| Notifications | `/api/notify/schedule` | POST |
| Economy | `/api/economy/earn` | POST |
| Economy | `/api/economy/spend` | POST |
| Economy | `/api/economy/balance/:user_id` | GET |
| Scheduler | `/api/schedule/create` | POST |
| Scheduler | `/api/schedule/:id` | DELETE |
| Polls | `/api/poll/create` | POST |
| Polls | `/api/poll/vote` | POST |
| Polls | `/api/poll/results/:id` | GET |
| URL Shortener | `/api/shorten` | POST |
| URL Stats | `/api/stats/:alias` | GET |
| Blackjack | `/api/game/blackjack/deal` | POST |
| Blackjack | `/api/game/blackjack/:action` | POST |
| Slots | `/api/game/slots/spin` | POST |
| Auth Keys | `/api/auth/key/generate` | POST |
| Auth Keys | `/api/auth/key/validate` | POST |
| Anti-Raid | `/api/antiraid/check` | POST |
| Anti-Raid | `/api/antiraid/lockdown` | POST |
| Verification | `/api/verify/email/send` | POST |
| Verification | `/api/verify/email/check` | POST |
| Verification | `/api/verify/phone/send` | POST |
| Verification | `/api/verify/phone/check` | POST |

## SDKs

| SDK | Endpoint |
|---|---|
| BDFD / BDScript | `GET /api/sdk/bdfd` |
| JavaScript | `GET /api/sdk/javascript` |
| Python | `GET /api/sdk/python` |

### JavaScript Example

```js
const { BotAPI } = require('./sdk'); // or download from GET /api/sdk/javascript
const api = new BotAPI('YOUR_BOT_TOKEN', 'https://your-api.com');

// Spin slots
const result = await api.spinSlots(10);
console.log(result.data.display); // e.g. "🍒 | ⭐ | 💎"

// Economy
await api.earn('USER_ID', 'GUILD_ID', 100, 'Daily reward');
const { data } = await api.getBalance('USER_ID', 'GUILD_ID');
console.log(data.balance);
```

### Python Example

```python
import asyncio
from bot_api import BotAPI  # download from GET /api/sdk/python

api = BotAPI("YOUR_BOT_TOKEN", "https://your-api.com")

async def main():
    result = await api.spin_slots(10)
    print(result["data"]["display"])

asyncio.run(main())
```

### BDFD Example

```
$httpPost[https://your-api.com/api/economy/earn;
  {"user_id":"$authorID","guild_id":"$guildID","amount":100,"reason":"Daily"};
  Authorization: Bot $getVar[bot_token]]
```

## Response Format

All endpoints return:

```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

Errors return `success: false` with a descriptive `error` string.

## Rate Limiting

- Global: 120 requests/minute per bot token
- Strict endpoints: 20 requests/minute per bot token
- Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

## Environment Variables

See `.env.example` for all configuration options.

## License

MIT
