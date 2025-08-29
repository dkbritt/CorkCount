export function formatError(err: unknown): string {
  if (err == null) return "Unknown error";
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message || err.toString();
  // Supabase-style error objects may have message property
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const maybeMessage = (err as any).message;
  if (typeof maybeMessage === "string" && maybeMessage.trim().length > 0) {
    return maybeMessage;
  }
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}
