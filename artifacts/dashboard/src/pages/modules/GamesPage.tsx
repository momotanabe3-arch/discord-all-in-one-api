import { useState } from "react";
import { Gamepad2 } from "lucide-react";
import { ModuleLayout, Card, Field, Input, Button } from "@/components/ModuleLayout";
import { ResponsePanel } from "@/components/ResponsePanel";
import { apiCall } from "@/lib/api";

export function GamesPage({ token }: { token: string }) {
  const [bet, setBet] = useState("10");
  const [userId, setUserId] = useState("demo-user");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Awaited<ReturnType<typeof apiCall>> | null>(null);

  const call = async (method: string, path: string, body?: unknown) => {
    setLoading(true);
    const r = await apiCall("POST", path, token, body);
    setResult(r); setLoading(false);
  };

  return (
    <ModuleLayout title="Games" description="Blackjack and slot machine with real payout logic" icon={Gamepad2} badge="POST /api/game/*">
      <Card>
        <h3 className="text-sm font-semibold text-foreground mb-4">Slot Machine</h3>
        <div className="space-y-4">
          <Field label="Bet Amount"><Input type="number" value={bet} onChange={e => setBet(e.target.value)} /></Field>
          <Button onClick={() => call("POST", "/game/slots/spin", { bet: parseFloat(bet) })} disabled={loading || !token}>
            Spin Slots
          </Button>
        </div>
      </Card>

      <Card>
        <h3 className="text-sm font-semibold text-foreground mb-4">Blackjack</h3>
        <div className="space-y-4">
          <Field label="User ID"><Input value={userId} onChange={e => setUserId(e.target.value)} /></Field>
          <Field label="Bet"><Input type="number" value={bet} onChange={e => setBet(e.target.value)} /></Field>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => call("POST", "/game/blackjack/deal", { bet: parseFloat(bet), user_id: userId })} disabled={loading || !token} data-testid="button-deal">Deal</Button>
            {["hit","stand","double","surrender"].map(a => (
              <Button key={a} variant="secondary" onClick={() => call("POST", `/game/blackjack/${a}`, { user_id: userId })} disabled={loading || !token}>
                {a.charAt(0).toUpperCase() + a.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      <ResponsePanel result={result} loading={loading} />
    </ModuleLayout>
  );
}
