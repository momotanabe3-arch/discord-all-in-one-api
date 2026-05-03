import { useState, useEffect } from "react";
import { Link } from "wouter";
import { checkHealth } from "@/lib/api";
import {
  FileText, Shield, Image, AlertTriangle, Database, Bot, BarChart2,
  Bell, Coins, Clock, PieChart, Link2, Gamepad2, Key, Lock, CheckCircle,
  Activity, Zap, ExternalLink
} from "lucide-react";

const MODULES = [
  { name: "Transcript", path: "/module/transcript", icon: FileText, desc: "Export channel history as HTML/text", color: "from-blue-500/20 to-blue-600/10" },
  { name: "Captcha", path: "/module/captcha", icon: Shield, desc: "Generate & verify CAPTCHA challenges", color: "from-purple-500/20 to-purple-600/10" },
  { name: "Card Generator", path: "/module/card", icon: Image, desc: "SVG profile cards with XP bars", color: "from-pink-500/20 to-pink-600/10" },
  { name: "Moderation", path: "/module/moderation", icon: AlertTriangle, desc: "Scan for profanity, spam, NSFW", color: "from-orange-500/20 to-orange-600/10" },
  { name: "Backup", path: "/module/backup", icon: Database, desc: "Create and restore guild backups", color: "from-teal-500/20 to-teal-600/10" },
  { name: "AI Chat", path: "/module/ai", icon: Bot, desc: "GPT-powered bot with personalities", color: "from-green-500/20 to-green-600/10" },
  { name: "Analytics", path: "/module/analytics", icon: BarChart2, desc: "Guild activity dashboards", color: "from-cyan-500/20 to-cyan-600/10" },
  { name: "Notifications", path: "/module/notifications", icon: Bell, desc: "Send & schedule messages", color: "from-yellow-500/20 to-yellow-600/10" },
  { name: "Economy", path: "/module/economy", icon: Coins, desc: "Virtual currency system", color: "from-amber-500/20 to-amber-600/10" },
  { name: "Scheduler", path: "/module/scheduler", icon: Clock, desc: "Create recurring tasks", color: "from-indigo-500/20 to-indigo-600/10" },
  { name: "Polls", path: "/module/polls", icon: PieChart, desc: "Multi-option voting polls", color: "from-violet-500/20 to-violet-600/10" },
  { name: "URL Shortener", path: "/module/urlshortener", icon: Link2, desc: "Shorten URLs with click stats", color: "from-rose-500/20 to-rose-600/10" },
  { name: "Games", path: "/module/games", icon: Gamepad2, desc: "Blackjack & slot machine", color: "from-fuchsia-500/20 to-fuchsia-600/10" },
  { name: "Auth Keys", path: "/module/auth", icon: Key, desc: "Generate & validate API keys", color: "from-lime-500/20 to-lime-600/10" },
  { name: "Anti-Raid", path: "/module/antiraid", icon: Lock, desc: "Threat detection & lockdown", color: "from-red-500/20 to-red-600/10" },
  { name: "Verification", path: "/module/verification", icon: CheckCircle, desc: "Email & phone verification", color: "from-emerald-500/20 to-emerald-600/10" },
];

export function Overview() {
  const [healthy, setHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    checkHealth().then(setHealthy);
    const interval = setInterval(() => checkHealth().then(setHealthy), 30_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl gradient-blurple flex items-center justify-center">
              <Zap size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Discord Bot API Platform</h1>
              <p className="text-sm text-muted-foreground">Multi-language · 16 modules · BDFD + JS + Python SDKs</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className={`status-dot ${healthy ? "online" : healthy === false ? "offline" : "offline"}`} />
            <span className="text-muted-foreground">{healthy === null ? "Checking..." : healthy ? "API Online" : "API Offline"}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Total Modules", value: "16", icon: Activity, color: "text-primary" },
            { label: "Endpoints", value: "38+", icon: Zap, color: "text-emerald-400" },
            { label: "SDK Languages", value: "3", icon: Key, color: "text-amber-400" },
          ].map(s => (
            <div key={s.label} className="bg-card border border-card-border rounded-xl p-4 flex items-center gap-3">
              <s.icon size={20} className={s.color} />
              <div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">All Modules</h2>
          <a href="/api/docs" target="_blank" rel="noopener noreferrer"
            className="text-xs text-primary flex items-center gap-1 hover:underline">
            Swagger Docs <ExternalLink size={11} />
          </a>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {MODULES.map(m => (
            <Link key={m.path} href={m.path}>
              <div className={`module-card bg-gradient-to-br ${m.color} border border-card-border rounded-xl p-4 cursor-pointer hover:border-primary/40`}>
                <div className="flex items-start gap-3">
                  <m.icon size={18} className="text-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{m.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{m.desc}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="bg-card border border-card-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3">Quick Start</h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1.5">1. Enter your bot token in the sidebar</p>
              <p className="text-xs text-muted-foreground mb-1.5">2. Click any module to test its endpoints</p>
              <p className="text-xs text-muted-foreground mb-1.5">3. Download SDKs for BDFD, JavaScript, or Python</p>
            </div>
            <div className="code-block text-xs">
              curl -X POST /api/game/slots/spin \{"\n"}
              {"  "}-H "Authorization: Bot YOUR_TOKEN" \{"\n"}
              {"  "}-H "Content-Type: application/json" \{"\n"}
              {"  "}-d '{"{"}"bet": 10{"}"}'
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
