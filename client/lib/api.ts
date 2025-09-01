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
  "/.netlify/functions/api",
] as const;

async function tryPing(base: string): Promise<boolean> {
  try {
    const res = await withTimeout(
      fetch(`${base}/ping`, { method: "GET" }),
      3000,
    );
    // Consume the response body to prevent "body stream already read" errors
    if (res.ok) {
      try {
        await res.text(); // Consume the body
      } catch {
        // Ignore errors when consuming body
      }
    }
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

export async function apiFetch(
  inputPath: string,
  init?: RequestInit,
): Promise<Response> {
  // First attempt with current/auto-resolved base
  let base = await resolveApiBase();
  let url = `${base}${inputPath}`;

  try {
    const response = await fetch(url, init);
    // If response is successful, return it
    if (response.ok) {
      return response;
    }
    // If response failed, try to retry with different base
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  } catch (error) {
    // Retry after forcing base re-resolution across candidates
    try {
      base = await resolveApiBase(true);
      url = `${base}${inputPath}`;
      const retryResponse = await fetch(url, init);
      return retryResponse;
    } catch (retryError) {
      // If retry also fails, throw the original error
      throw error;
    }
  }
}
