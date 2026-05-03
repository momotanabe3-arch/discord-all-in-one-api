import { useState } from "react";
import { PieChart } from "lucide-react";
import { ModuleLayout, Card, Field, Input, Button } from "@/components/ModuleLayout";
import { ResponsePanel } from "@/components/ResponsePanel";
import { apiCall } from "@/lib/api";

export function PollsPage({ token }: { token: string }) {
  const [question, setQuestion] = useState("What is your favorite game?");
  const [options, setOptions] = useState("Minecraft\nFortnite\nValorант");
  const [guildId, setGuildId] = useState("demo-guild");
  const [pollId, setPollId] = useState("");
  const [optionIdx, setOptionIdx] = useState("0");
  const [userId, setUserId] = useState("demo-user");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Awaited<ReturnType<typeof apiCall>> | null>(null);

  const call = async (path: string, method: string, body?: unknown) => {
    setLoading(true);
    const r = await apiCall(method, path, token, body);
    if (r.success && (r.data as { poll_id?: string })?.poll_id) {
      setPollId((r.data as { poll_id: string }).poll_id);
    }
    setResult(r); setLoading(false);
  };

  return (
    <ModuleLayout title="Polls" description="Create multi-option polls, collect votes, and view results" icon={PieChart} badge="CRUD /api/poll/*">
      <Card>
        <h3 className="text-sm font-semibold text-foreground mb-4">Create Poll</h3>
        <div className="space-y-4">
          <Field label="Question"><Input value={question} onChange={e => setQuestion(e.target.value)} /></Field>
          <Field label="Options (one per line)">
            <textarea value={options} onChange={e => setOptions(e.target.value)} rows={4}
              className="w-full px-3 py-2 rounded-lg bg-input border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
          </Field>
          <Field label="Guild ID"><Input value={guildId} onChange={e => setGuildId(e.target.value)} /></Field>
          <Button onClick={() => call("/poll/create", "POST", { question, options: options.split("\n").filter(Boolean), guild_id: guildId })} disabled={loading || !token} data-testid="button-create-poll">Create Poll</Button>
        </div>
      </Card>

      <Card>
        <h3 className="text-sm font-semibold text-foreground mb-4">Vote & Results</h3>
        <div className="space-y-4">
          <Field label="Poll ID"><Input value={pollId} onChange={e => setPollId(e.target.value)} placeholder="Auto-filled after create" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Option Index"><Input type="number" value={optionIdx} onChange={e => setOptionIdx(e.target.value)} /></Field>
            <Field label="User ID"><Input value={userId} onChange={e => setUserId(e.target.value)} /></Field>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => call("/poll/vote", "POST", { poll_id: pollId, option_index: parseInt(optionIdx), user_id: userId })} disabled={loading || !pollId || !token}>Vote</Button>
            <Button variant="secondary" onClick={() => call(`/poll/results/${pollId}`, "GET")} disabled={loading || !pollId || !token}>Get Results</Button>
          </div>
        </div>
      </Card>

      <ResponsePanel result={result} loading={loading} />
    </ModuleLayout>
  );
}
