import { useState } from "react";
import { FileText } from "lucide-react";
import { ModuleLayout, Card, Field, Input, Select, Button } from "@/components/ModuleLayout";
import { ResponsePanel } from "@/components/ResponsePanel";
import { apiCall } from "@/lib/api";

export function TranscriptPage({ token }: { token: string }) {
  const [channelId, setChannelId] = useState("");
  const [limit, setLimit] = useState("100");
  const [format, setFormat] = useState("text");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Awaited<ReturnType<typeof apiCall>> | null>(null);

  const run = async () => {
    setLoading(true);
    const r = await apiCall("POST", "/transcript", token, { channel_id: channelId, limit: parseInt(limit), format });
    setResult(r); setLoading(false);
  };

  return (
    <ModuleLayout title="Transcript" description="Export channel messages as HTML, text, or PDF" icon={FileText} badge="POST /api/transcript">
      <Card>
        <div className="space-y-4">
          <Field label="Channel ID"><Input placeholder="1234567890" value={channelId} onChange={e => setChannelId(e.target.value)} data-testid="input-channel-id" /></Field>
          <Field label="Limit (max 500)"><Input type="number" placeholder="100" value={limit} onChange={e => setLimit(e.target.value)} /></Field>
          <Field label="Format">
            <Select value={format} onChange={e => setFormat(e.target.value)}>
              <option value="text">Text</option>
              <option value="html">HTML</option>
              <option value="pdf">PDF (info only)</option>
            </Select>
          </Field>
          <Button onClick={run} disabled={loading || !channelId || !token} data-testid="button-run-transcript">
            {loading ? "Fetching..." : "Fetch Transcript"}
          </Button>
        </div>
      </Card>
      <ResponsePanel result={result} loading={loading} />
    </ModuleLayout>
  );
}
