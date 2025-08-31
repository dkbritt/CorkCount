// Helper to resolve API base path dynamically
// Tries local /api first, then falls back to Netlify functions path
let cachedBase: string | null = null;

function withTimeout<T>(p: Promise<T>, ms = 5000): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("timeout")), ms);
    p.then((v) => {
      clearTimeout(t);
      resolve(v);
    }).catch((e) => {
      clearTimeout(t);
      reject(e);
    });
  });
}

const CANDIDATE_BASES = [
  "/api",
  "/.netlify/functions/api/api",
  "/.netlify/functions/api",
] as const;

async function tryPing(base: string): Promise<boolean> {
  try {
    const res = await withTimeout(fetch(`${base}/ping`, { method: "GET" }), 3000);
    return res.ok;
  } catch {
    return false;
  }
}

export async function resolveApiBase(forceRefresh = false): Promise<string> {
  if (!forceRefresh && cachedBase) return cachedBase;

  for (const candidate of CANDIDATE_BASES) {
    const ok = await tryPing(candidate);
    if (ok) {
      cachedBase = candidate;
      return cachedBase;
    }
  }

  // As a last resort, assume /api
  cachedBase = "/api";
  return cachedBase;
}

export async function apiFetch(inputPath: string, init?: RequestInit): Promise<Response> {
  // First attempt with current/auto-resolved base
  let base = await resolveApiBase();
  let url = `${base}${inputPath}`;
  try {
    return await fetch(url, init);
  } catch {
    // Retry after forcing base re-resolution across candidates
    base = await resolveApiBase(true);
    url = `${base}${inputPath}`;
    return fetch(url, init);
  }
}
