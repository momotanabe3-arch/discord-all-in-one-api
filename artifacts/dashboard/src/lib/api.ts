const BASE = "/api";

export async function apiCall(
  method: string,
  path: string,
  token: string,
  body?: unknown,
  queryParams?: Record<string, string>
): Promise<{ success: boolean; data: unknown; error: string | null; status: number; duration: number }> {
  const start = Date.now();
  let url = `${BASE}${path}`;
  if (queryParams) {
    const q = new URLSearchParams(queryParams).toString();
    if (q) url += `?${q}`;
  }
  try {
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bot ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const json = await res.json() as { success: boolean; data: unknown; error: string | null };
    return { ...json, status: res.status, duration: Date.now() - start };
  } catch (err) {
    return { success: false, data: {}, error: (err as Error).message, status: 0, duration: Date.now() - start };
  }
}

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch("/health");
    return res.ok;
  } catch {
    return false;
  }
}
