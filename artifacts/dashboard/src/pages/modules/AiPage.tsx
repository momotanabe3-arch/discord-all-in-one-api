import { useState } from "react";
import { Bot } from "lucide-react";
import { ModuleLayout, Card, Field, Input, Select, Button } from "@/components/ModuleLayout";
import { ResponsePanel } from "@/components/ResponsePanel";
import { apiCall } from "@/lib/api";

export function AiPage({ token }: { token: string }) {
  const [message, setMessage] = useState("Hello! What can you do?");
  const [personality, setPersonality] = useState("friendly");
  const [language, setLanguage] = useState("English");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Awaited<ReturnType<typeof apiCall>> | null>(null);

  const run = async () => {
    setLoading(true);
    const r = await apiCall("POST", "/ai/chat", token, { message, personality, language, history: [] });
    setResult(r); setLoading(false);
  };

  return (
    <ModuleLayout title="AI Chat" description="GPT-powered responses with selectable personality profiles" icon={Bot} badge="POST /api/ai/chat">
      <Card>
        <div className="space-y-4">
          <Field label="Message">
            <textarea value={message} onChange={e => setMessage(e.target.value)} rows={3}
              className="w-full px-3 py-2 rounded-lg bg-input border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Personality">
              <Select value={personality} onChange={e => setPersonality(e.target.value)}>
                <option value="assistant">Assistant</option>
                <option value="friendly">Friendly</option>
                <option value="sarcastic">Sarcastic</option>
                <option value="professional">Professional</option>
                <option value="gamer">Gamer</option>
              </Select>
            </Field>
            <Field label="Language"><Input value={language} onChange={e => setLanguage(e.target.value)} /></Field>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
            Set <code className="text-primary">OPENAI_API_KEY</code> in environment for real AI responses. Without it, a demo message is returned.
          </div>
          <Button onClick={run} disabled={loading || !message || !token} data-testid="button-send-ai">Send Message</Button>
        </div>
      </Card>
      {result?.success && (result.data as { reply?: string })?.reply && (
        <Card>
          <p className="text-xs text-muted-foreground mb-2">AI Reply</p>
          <p className="text-sm text-foreground">{(result.data as { reply: string }).reply}</p>
        </Card>
      )}
      <ResponsePanel result={result} loading={loading} />
    </ModuleLayout>
  );
}
