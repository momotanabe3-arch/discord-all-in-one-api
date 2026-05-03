import { Code2, Download, ExternalLink } from "lucide-react";
import { Card } from "@/components/ModuleLayout";

const BDFD_SNIPPETS = [
  { name: "Economy Earn", code: `$httpPost[https://your-api/api/economy/earn;{"user_id":"$authorID","guild_id":"$guildID","amount":100,"reason":"Daily"}]` },
  { name: "Slots Spin", code: `$httpPost[https://your-api/api/game/slots/spin;{"bet":10}]` },
  { name: "AI Chat", code: `$httpPost[https://your-api/api/ai/chat;{"message":"$message[1-]","personality":"friendly"}]` },
  { name: "Moderation Scan", code: `$httpPost[https://your-api/api/mod/scan;{"content":"$message[1-]","guild_id":"$guildID","checks":["profanity","spam"]}]` },
  { name: "Poll Create", code: `$httpPost[https://your-api/api/poll/create;{"question":"$message[1-]","options":["Yes","No"],"guild_id":"$guildID"}]` },
  { name: "URL Shorten", code: `$httpPost[https://your-api/api/shorten;{"url":"$message[1]"}]` },
];

export function SdkPage() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-6">
        <div className="flex items-start gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl gradient-blurple flex items-center justify-center shrink-0">
            <Code2 size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">SDK Downloads</h1>
            <p className="text-sm text-muted-foreground">Pre-built packages for BDFD, JavaScript, and Python</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { lang: "BDFD", color: "from-orange-500/20", endpoint: "/api/sdk/bdfd", desc: "BDScript snippets & templates" },
            { lang: "JavaScript", color: "from-yellow-500/20", endpoint: "/api/sdk/javascript", desc: "Node.js + Discord.js v14 SDK" },
            { lang: "Python", color: "from-blue-500/20", endpoint: "/api/sdk/python", desc: "discord.py Cog + FastAPI middleware" },
          ].map(s => (
            <a key={s.lang} href={s.endpoint} target="_blank" rel="noopener noreferrer"
              className={`bg-gradient-to-br ${s.color} to-transparent border border-card-border rounded-xl p-4 hover:border-primary/40 transition-all module-card block`}>
              <div className="flex items-center gap-2 mb-2">
                <Download size={16} className="text-foreground" />
                <span className="text-sm font-semibold text-foreground">{s.lang}</span>
                <ExternalLink size={11} className="ml-auto text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">{s.desc}</p>
            </a>
          ))}
        </div>

        <Card>
          <h2 className="text-sm font-semibold text-foreground mb-4">BDFD Quick Snippets</h2>
          <div className="space-y-3">
            {BDFD_SNIPPETS.map(s => (
              <div key={s.name}>
                <p className="text-xs text-muted-foreground mb-1">{s.name}</p>
                <div className="code-block text-xs">{s.code}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="mt-4">
          <h2 className="text-sm font-semibold text-foreground mb-3">JavaScript Usage</h2>
          <div className="code-block text-xs">{`const { BotAPI } = require('./sdk');
const api = new BotAPI('YOUR_BOT_TOKEN', 'https://your-api.com');

// Spin slots
const result = await api.spinSlots(10);
console.log(result.data.display); // 🍒 | ⭐ | 💎

// Economy
await api.earn('USER_ID', 'GUILD_ID', 100, 'Daily reward');
const balance = await api.getBalance('USER_ID', 'GUILD_ID');
console.log(balance.data.balance);

// Discord.js v14 middleware
const { discordJsMiddleware } = require('./sdk');
discordJsMiddleware(client, 'YOUR_BOT_TOKEN', 'https://your-api.com');
// Now: client.botApi.spinSlots(10)`}</div>
        </Card>

        <Card className="mt-4">
          <h2 className="text-sm font-semibold text-foreground mb-3">Python Usage</h2>
          <div className="code-block text-xs">{`from bot_api import BotAPI, BotAPICog
import asyncio

api = BotAPI("YOUR_BOT_TOKEN", "https://your-api.com")

async def main():
    # Spin slots
    result = await api.spin_slots(10)
    print(result["data"]["display"])

    # Economy
    await api.earn("USER_ID", "GUILD_ID", 100, "Daily reward")
    balance = await api.get_balance("USER_ID", "GUILD_ID")
    print(balance["data"]["balance"])

asyncio.run(main())

# discord.py cog
bot.add_cog(BotAPICog(bot, "YOUR_BOT_TOKEN", "https://your-api.com"))`}</div>
        </Card>
      </div>
    </div>
  );
}
