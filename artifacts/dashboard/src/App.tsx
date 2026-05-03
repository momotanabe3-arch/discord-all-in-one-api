import { useState } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Sidebar } from "@/components/Sidebar";
import { Overview } from "@/pages/Overview";
import { SdkPage } from "@/pages/SdkPage";
import { TranscriptPage } from "@/pages/modules/TranscriptPage";
import { GamesPage } from "@/pages/modules/GamesPage";
import { EconomyPage } from "@/pages/modules/EconomyPage";
import { ModerationPage } from "@/pages/modules/ModerationPage";
import { PollsPage } from "@/pages/modules/PollsPage";
import { AiPage } from "@/pages/modules/AiPage";
import { CardPage } from "@/pages/modules/CardPage";
import { GenericModulePage } from "@/pages/modules/GenericModulePage";
import {
  Shield, Database, BarChart2, Bell, Clock, Link2, Key, Lock, CheckCircle
} from "lucide-react";

const queryClient = new QueryClient();

function AppRoutes({ token }: { token: string }) {
  return (
    <Switch>
      <Route path="/" component={Overview} />
      <Route path="/sdk" component={SdkPage} />
      <Route path="/module/transcript">{() => <TranscriptPage token={token} />}</Route>
      <Route path="/module/games">{() => <GamesPage token={token} />}</Route>
      <Route path="/module/economy">{() => <EconomyPage token={token} />}</Route>
      <Route path="/module/moderation">{() => <ModerationPage token={token} />}</Route>
      <Route path="/module/polls">{() => <PollsPage token={token} />}</Route>
      <Route path="/module/ai">{() => <AiPage token={token} />}</Route>
      <Route path="/module/card">{() => <CardPage token={token} />}</Route>
      <Route path="/module/captcha">{() => <GenericModulePage token={token} title="Captcha" description="Generate CAPTCHA challenges and verify responses" icon={Shield} badge="POST /api/captcha/*"
        endpoints={[
          { label: "Generate CAPTCHA", method: "POST", path: "/captcha/generate", body: {} },
          { label: "Verify CAPTCHA (demo)", method: "GET", path: "/captcha/verify", query: { code: "DEMO", token: "invalid" } },
        ]} />}</Route>
      <Route path="/module/backup">{() => <GenericModulePage token={token} title="Backup" description="Create and restore guild backups" icon={Database} badge="CRUD /api/backup/*"
        endpoints={[
          { label: "Create Backup", method: "POST", path: "/backup/create", body: { guild_id: "demo-guild", include: ["roles","channels"] } },
          { label: "List Backups", method: "GET", path: "/backup/list", query: { guild_id: "demo-guild" } },
          { label: "Restore Backup", method: "POST", path: "/backup/restore", body: { backup_id: "replace-me", guild_id: "demo-guild" } },
        ]} />}</Route>
      <Route path="/module/analytics">{() => <GenericModulePage token={token} title="Analytics" description="Guild activity stats — messages, joins, commands" icon={BarChart2} badge="GET /api/analytics/*"
        endpoints={[
          { label: "Daily Analytics", method: "GET", path: "/analytics/guild/demo-guild", query: { period: "daily" } },
          { label: "Weekly Analytics", method: "GET", path: "/analytics/guild/demo-guild", query: { period: "weekly" } },
          { label: "Monthly Analytics", method: "GET", path: "/analytics/guild/demo-guild", query: { period: "monthly" } },
        ]} />}</Route>
      <Route path="/module/notifications">{() => <GenericModulePage token={token} title="Notifications" description="Send and schedule channel notifications" icon={Bell} badge="POST /api/notify/*"
        endpoints={[
          { label: "Send Now", method: "POST", path: "/notify/send", body: { channel_id: "123456789", message: "Hello from the API!", guild_id: "demo-guild" } },
          { label: "Schedule", method: "POST", path: "/notify/schedule", body: { channel_id: "123456789", message: "Scheduled message!", guild_id: "demo-guild", run_at: new Date(Date.now() + 3600000).toISOString() } },
        ]} />}</Route>
      <Route path="/module/scheduler">{() => <GenericModulePage token={token} title="Scheduler" description="Create and manage scheduled tasks" icon={Clock} badge="CRUD /api/schedule/*"
        endpoints={[
          { label: "Create Schedule", method: "POST", path: "/schedule/create", body: { action: "announce", payload: { message: "Hello!" }, run_at: new Date(Date.now() + 3600000).toISOString(), guild_id: "demo-guild", repeat: "none" } },
          { label: "List Schedules", method: "GET", path: "/schedule/list", query: { guild_id: "demo-guild" } },
        ]} />}</Route>
      <Route path="/module/urlshortener">{() => <GenericModulePage token={token} title="URL Shortener" description="Shorten URLs and track click statistics" icon={Link2} badge="POST /api/shorten"
        endpoints={[
          { label: "Shorten URL", method: "POST", path: "/shorten", body: { url: "https://discord.com", alias: "discord" } },
          { label: "Get Stats", method: "GET", path: "/stats/discord" },
        ]} />}</Route>
      <Route path="/module/auth">{() => <GenericModulePage token={token} title="Auth Keys" description="Generate and validate scoped API keys" icon={Key} badge="POST /api/auth/key/*"
        endpoints={[
          { label: "Generate API Key", method: "POST", path: "/auth/key/generate", body: { guild_id: "demo-guild", label: "my-bot" } },
          { label: "Validate API Key", method: "POST", path: "/auth/key/validate", body: { key: "bda_replace_with_real_key" } },
        ]} />}</Route>
      <Route path="/module/antiraid">{() => <GenericModulePage token={token} title="Anti-Raid" description="Threat detection, risk scoring, and guild lockdown" icon={Lock} badge="POST /api/antiraid/*"
        endpoints={[
          { label: "Check User Threat", method: "POST", path: "/antiraid/check", body: { guild_id: "demo-guild", user_id: "demo-user", account_age_days: 2, has_avatar: false, joins_last_minute: 15 } },
          { label: "Enable Lockdown", method: "POST", path: "/antiraid/lockdown", body: { guild_id: "demo-guild", action: "enable", reason: "Raid detected" } },
          { label: "Disable Lockdown", method: "POST", path: "/antiraid/lockdown", body: { guild_id: "demo-guild", action: "disable" } },
        ]} />}</Route>
      <Route path="/module/verification">{() => <GenericModulePage token={token} title="Verification" description="Email and phone number verification via OTP codes" icon={CheckCircle} badge="POST /api/verify/*"
        endpoints={[
          { label: "Send Email Code", method: "POST", path: "/verify/email/send", body: { email: "user@example.com", user_id: "demo-user" } },
          { label: "Check Email Code", method: "POST", path: "/verify/email/check", body: { user_id: "demo-user", code: "123456" } },
          { label: "Send Phone Code", method: "POST", path: "/verify/phone/send", body: { phone: "+1234567890", user_id: "demo-user" } },
          { label: "Check Phone Code", method: "POST", path: "/verify/phone/check", body: { user_id: "demo-user", code: "123456" } },
        ]} />}</Route>
      <Route>{() => <div className="flex items-center justify-center h-full text-muted-foreground">Page not found</div>}</Route>
    </Switch>
  );
}

function App() {
  const [token, setToken] = useState("");

  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <div className="flex h-screen overflow-hidden bg-background">
          <Sidebar token={token} setToken={setToken} />
          <main className="flex-1 overflow-hidden">
            <AppRoutes token={token} />
          </main>
        </div>
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;
