import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { ModuleLayout, Card, Field, Input, Button } from "@/components/ModuleLayout";
import { ResponsePanel } from "@/components/ResponsePanel";
import { apiCall } from "@/lib/api";

const CHECKS = ["profanity", "spam", "link", "nsfw"];

export function ModerationPage({ token }: { token: string }) {
  const [content, setContent] = useState("");
  const [guildId, setGuildId] = useState("demo-guild");
  const [checks, setChecks] = useState(CHECKS);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Awaited<ReturnType<typeof apiCall>> | null>(null);

  const toggle = (c: string) => setChecks(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);

  const run = async () => {
    setLoading(true);
    const r = await apiCall("POST", "/mod/scan", token, { content, guild_id: guildId, checks });
    setResult(r); setLoading(false);
  };

  return (
    <ModuleLayout title="Moderation" description="Scan messages for profanity, spam, links, and NSFW content" icon={AlertTriangle} badge="POST /api/mod/scan">
      <Card>
        <div className="space-y-4">
          <Field label="Content to scan">
            <textarea value={content} onChange={e => setContent(e.target.value)} rows={4} data-testid="textarea-content"
              className="w-full px-3 py-2 rounded-lg bg-input border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              placeholder="Enter message content to scan..." />
          </Field>
          <Field label="Guild ID"><Input value={guildId} onChange={e => setGuildId(e.target.value)} /></Field>
          <Field label="Checks">
            <div className="flex gap-2 flex-wrap">
              {CHECKS.map(c => (
                <button key={c} onClick={() => toggle(c)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all ${checks.includes(c) ? "border-primary bg-primary/20 text-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}>
                  {c}
                </button>
              ))}
            </div>
          </Field>
          <Button onClick={run} disabled={loading || !content || !token} data-testid="button-scan">Scan Content</Button>
        </div>
      </Card>
      <ResponsePanel result={result} loading={loading} />
    </ModuleLayout>
  );
}
