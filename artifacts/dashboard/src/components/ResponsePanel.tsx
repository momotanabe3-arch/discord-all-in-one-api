import { CheckCircle, XCircle, Clock } from "lucide-react";

interface ResponsePanelProps {
  result: { success: boolean; data: unknown; error: string | null; status: number; duration: number } | null;
  loading?: boolean;
}

export function ResponsePanel({ result, loading }: ResponsePanelProps) {
  if (loading) {
    return (
      <div className="rounded-lg border border-border bg-card p-4 mt-4">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          Sending request...
        </div>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className={`rounded-lg border mt-4 overflow-hidden ${result.success ? "border-emerald-500/30" : "border-red-500/30"}`}>
      <div className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium ${result.success ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
        {result.success ? <CheckCircle size={14} /> : <XCircle size={14} />}
        {result.success ? "Success" : "Error"}
        <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground font-normal">
          <Clock size={11} /> {result.duration}ms
          <span className={`ml-2 px-1.5 py-0.5 rounded text-xs font-mono ${result.status < 300 ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
            HTTP {result.status}
          </span>
        </span>
      </div>
      <div className="p-4">
        {result.error && <p className="text-red-400 text-sm mb-3">{result.error}</p>}
        <pre className="code-block text-xs overflow-auto max-h-80">
          {JSON.stringify(result.data, null, 2)}
        </pre>
      </div>
    </div>
  );
}
