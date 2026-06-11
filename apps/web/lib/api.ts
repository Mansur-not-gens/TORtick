export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function apiFetch<T>(
  path: string,
  init: RequestInit & { json?: unknown } = {},
): Promise<T> {
  const { json, headers, ...rest } = init;
  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(headers ?? {}),
    },
    credentials: "include",
    body: json === undefined ? rest.body : JSON.stringify(json),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let message = text;
    try {
      const parsed = JSON.parse(text) as { error?: string };
      if (parsed.error) message = parsed.error;
    } catch {
      /* not JSON */
    }
    throw new Error(message || `Request failed (${res.status})`);
  }
  return (await res.json()) as T;
}

