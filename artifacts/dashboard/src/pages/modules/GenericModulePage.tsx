import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { ModuleLayout, Card, Button } from "@/components/ModuleLayout";
import { ResponsePanel } from "@/components/ResponsePanel";
import { apiCall } from "@/lib/api";

interface Endpoint {
  label: string;
  method: string;
  path: string;
  body?: Record<string, unknown>;
  query?: Record<string, string>;
}

interface Props {
  title: string;
  description: string;
  icon: LucideIcon;
  badge: string;
  endpoints: Endpoint[];
  token: string;
}

export function GenericModulePage({ title, description, icon, badge, endpoints, token }: Props) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Awaited<ReturnType<typeof apiCall>> | null>(null);

  const run = async (ep: Endpoint) => {
    setLoading(true);
    const r = await apiCall(ep.method, ep.path, token, ep.body, ep.query);
    setResult(r); setLoading(false);
  };

  return (
    <ModuleLayout title={title} description={description} icon={icon} badge={badge}>
      <Card>
        <div className="space-y-3">
          {endpoints.map(ep => (
            <div key={ep.label} className="flex items-center justify-between py-3 border-b border-border last:border-0">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${ep.method === "GET" ? "bg-emerald-500/20 text-emerald-400" : ep.method === "DELETE" ? "bg-red-500/20 text-red-400" : "bg-blue-500/20 text-blue-400"}`}>{ep.method}</span>
                  <span className="text-xs font-mono text-muted-foreground">/api{ep.path}</span>
                </div>
                <p className="text-sm text-foreground">{ep.label}</p>
                {ep.body && <pre className="text-[10px] text-muted-foreground mt-1 font-mono">{JSON.stringify(ep.body, null, 1).slice(0, 80)}...</pre>}
              </div>
              <Button variant="secondary" onClick={() => run(ep)} disabled={loading || !token} className="shrink-0 ml-4">
                {loading ? "..." : "Run"}
              </Button>
            </div>
          ))}
        </div>
      </Card>
      <ResponsePanel result={result} loading={loading} />
    </ModuleLayout>
  );
}
