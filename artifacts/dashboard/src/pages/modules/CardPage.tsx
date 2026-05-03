import { useState } from "react";
import { Image } from "lucide-react";
import { ModuleLayout, Card, Field, Input, Select, Button } from "@/components/ModuleLayout";
import { ResponsePanel } from "@/components/ResponsePanel";
import { apiCall } from "@/lib/api";

export function CardPage({ token }: { token: string }) {
  const [username, setUsername] = useState("DiscordUser");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [level, setLevel] = useState("12");
  const [xp, setXp] = useState("3500");
  const [xpmax, setXpmax] = useState("5000");
  const [rank, setRank] = useState("4");
  const [theme, setTheme] = useState("dark");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Awaited<ReturnType<typeof apiCall>> | null>(null);
  const [svgPreview, setSvgPreview] = useState("");

  const run = async () => {
    setLoading(true);
    const r = await apiCall("POST", "/card/profile", token, {
      username, avatar_url: avatarUrl || undefined, level: parseInt(level),
      xp: parseFloat(xp), xpmax: parseFloat(xpmax), rank: parseInt(rank), theme,
    });
    if (r.success) setSvgPreview((r.data as { image_svg?: string })?.image_svg ?? "");
    setResult(r); setLoading(false);
  };

  return (
    <ModuleLayout title="Card Generator" description="Generate SVG profile cards with XP bars and themes" icon={Image} badge="POST /api/card/profile">
      <Card>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Username"><Input value={username} onChange={e => setUsername(e.target.value)} /></Field>
            <Field label="Avatar URL (optional)"><Input value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} placeholder="https://..." /></Field>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Level"><Input type="number" value={level} onChange={e => setLevel(e.target.value)} /></Field>
            <Field label="XP"><Input type="number" value={xp} onChange={e => setXp(e.target.value)} /></Field>
            <Field label="XP Max"><Input type="number" value={xpmax} onChange={e => setXpmax(e.target.value)} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Rank"><Input type="number" value={rank} onChange={e => setRank(e.target.value)} /></Field>
            <Field label="Theme">
              <Select value={theme} onChange={e => setTheme(e.target.value)}>
                {["dark","light","blurple","red","green","gold"].map(t => <option key={t} value={t}>{t}</option>)}
              </Select>
            </Field>
          </div>
          <Button onClick={run} disabled={loading || !username || !token} data-testid="button-generate-card">Generate Card</Button>
        </div>
      </Card>

      {svgPreview && (
        <Card>
          <p className="text-xs text-muted-foreground mb-3">Preview</p>
          <div dangerouslySetInnerHTML={{ __html: svgPreview }} className="w-full" />
        </Card>
      )}
      <ResponsePanel result={result} loading={loading} />
    </ModuleLayout>
  );
}
