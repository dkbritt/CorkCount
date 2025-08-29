export function formatError(err: unknown): string {
  if (err == null) return "Unknown error";
  if (typeof err === "string") return mapCommonErrors(err);
  if (err instanceof Error) return mapCommonErrors(err.message || err.toString());
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const maybeMessage = (err as any).message;
  if (typeof maybeMessage === "string" && maybeMessage.trim().length > 0) {
    return mapCommonErrors(maybeMessage);
  }
  try {
    return mapCommonErrors(JSON.stringify(err));
  } catch {
    return mapCommonErrors(String(err));
  }
}

function mapCommonErrors(message: string): string {
  const msg = message || "Unknown error";
  const lower = msg.toLowerCase();
  if (lower.includes("failed to fetch") || lower.includes("fetch failed") || lower.includes("networkerror")) {
    return "Network error connecting to Supabase. Ensure VITE_SUPABASE_URL is correct and uses HTTPS, your project is online, and CORS/Adblock aren’t blocking requests.";
  }
  return msg;
}
