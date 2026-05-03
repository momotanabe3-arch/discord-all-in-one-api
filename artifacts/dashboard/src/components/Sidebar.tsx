import { Link, useLocation } from "wouter";
import {
  FileText, Shield, Image, AlertTriangle, Database, Bot, BarChart2,
  Bell, Coins, Clock, PieChart, Link2, Gamepad2, Key, Lock,
  CheckCircle, Code2, Zap, Activity, ExternalLink
} from "lucide-react";

const NAV = [
  { label: "Overview", path: "/", icon: Activity },
  { label: "Divider", path: "", icon: null },
  { label: "Transcript", path: "/module/transcript", icon: FileText },
  { label: "Captcha", path: "/module/captcha", icon: Shield },
  { label: "Card Generator", path: "/module/card", icon: Image },
  { label: "Moderation", path: "/module/moderation", icon: AlertTriangle },
  { label: "Backup", path: "/module/backup", icon: Database },
  { label: "AI Chat", path: "/module/ai", icon: Bot },
  { label: "Analytics", path: "/module/analytics", icon: BarChart2 },
  { label: "Notifications", path: "/module/notifications", icon: Bell },
  { label: "Economy", path: "/module/economy", icon: Coins },
  { label: "Scheduler", path: "/module/scheduler", icon: Clock },
  { label: "Polls", path: "/module/polls", icon: PieChart },
  { label: "URL Shortener", path: "/module/urlshortener", icon: Link2 },
  { label: "Games", path: "/module/games", icon: Gamepad2 },
  { label: "Auth Keys", path: "/module/auth", icon: Key },
  { label: "Anti-Raid", path: "/module/antiraid", icon: Lock },
  { label: "Verification", path: "/module/verification", icon: CheckCircle },
  { label: "Divider", path: "", icon: null },
  { label: "SDK Downloads", path: "/sdk", icon: Code2 },
  { label: "API Docs", path: "/docs", icon: ExternalLink },
];

export function Sidebar({ token, setToken }: { token: string; setToken: (t: string) => void }) {
  const [location] = useLocation();

  return (
    <aside className="w-60 shrink-0 flex flex-col h-screen bg-sidebar border-r border-sidebar-border overflow-hidden">
      <div className="px-4 py-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg gradient-blurple flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-sidebar-foreground">Bot API Platform</p>
            <p className="text-[10px] text-muted-foreground">Multi-language SDK</p>
          </div>
        </div>
        <input
          type="password"
          placeholder="Bot token..."
          value={token}
          onChange={e => setToken(e.target.value)}
          data-testid="input-bot-token"
          className="w-full text-xs px-2 py-1.5 rounded-md bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <nav className="flex-1 overflow-y-auto py-2 px-2">
        {NAV.map((item, i) => {
          if (item.label === "Divider") return <div key={i} className="h-px bg-sidebar-border my-2 mx-2" />;
          const Icon = item.icon!;
          const active = location === item.path;
          if (item.path === "/docs") {
            return (
              <a key={item.path} href="/api/docs" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sidebar-foreground hover:bg-sidebar-accent text-sm transition-colors">
                <Icon size={15} className="shrink-0 opacity-70" />
                <span>{item.label}</span>
                <ExternalLink size={11} className="ml-auto opacity-40" />
              </a>
            );
          }
          return (
            <Link key={item.path} href={item.path}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
                active ? "bg-primary text-primary-foreground font-medium" : "text-sidebar-foreground hover:bg-sidebar-accent"
              }`}
              data-testid={`nav-${item.label.toLowerCase().replace(/\s/g, "-")}`}>
              <Icon size={15} className="shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-3 border-t border-sidebar-border">
        <p className="text-[10px] text-muted-foreground">
          {token ? <><span className="status-dot online" />Token set</> : <><span className="status-dot offline" />No token</>}
        </p>
      </div>
    </aside>
  );
}
