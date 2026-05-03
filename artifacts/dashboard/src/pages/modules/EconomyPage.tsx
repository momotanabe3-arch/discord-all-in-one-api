import { useState } from "react";
import { Coins } from "lucide-react";
import { ModuleLayout, Card, Field, Input, Button } from "@/components/ModuleLayout";
import { ResponsePanel } from "@/components/ResponsePanel";
import { apiCall } from "@/lib/api";

export function EconomyPage({ token }: { token: string }) {
  const [userId, setUserId] = useState("demo-user");
  const [guildId, setGuildId] = useState("demo-guild");
  const [amount, setAmount] = useState("100");
  const [reason, setReason] = useState("Daily reward");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Awaited<ReturnType<typeof apiCall>> | null>(null);

  const call = async (path: string, method: string, body?: unknown, q?: Record<string,string>) => {
    setLoading(true);
    const r = await apiCall(method, path, token, body, q);
    setResult(r); setLoading(false);
  };

  return (
    <ModuleLayout title="Economy" description="Virtual currency system with earn, spend, and balance" icon={Coins} badge="CRUD /api/economy/*">
      <Card>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="User ID"><Input value={userId} onChange={e => setUserId(e.target.value)} /></Field>
            <Field label="Guild ID"><Input value={guildId} onChange={e => setGuildId(e.target.value)} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Amount"><Input type="number" value={amount} onChange={e => setAmount(e.target.value)} /></Field>
            <Field label="Reason"><Input value={reason} onChange={e => setReason(e.target.value)} /></Field>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button onClick={() => call("/economy/earn", "POST", { user_id: userId, guild_id: guildId, amount: parseFloat(amount), reason })} disabled={loading || !token} data-testid="button-earn">Earn</Button>
            <Button variant="secondary" onClick={() => call("/economy/spend", "POST", { user_id: userId, guild_id: guildId, amount: parseFloat(amount), reason })} disabled={loading || !token}>Spend</Button>
            <Button variant="secondary" onClick={() => call(`/economy/balance/${userId}`, "GET", undefined, { guild_id: guildId })} disabled={loading || !token}>Get Balance</Button>
          </div>
        </div>
      </Card>
      <ResponsePanel result={result} loading={loading} />
    </ModuleLayout>
  );
}
