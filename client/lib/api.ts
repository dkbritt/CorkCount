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

export async function resolveApiBase(): Promise<string> {
  if (cachedBase) return cachedBase;

  try {
    const res = await withTimeout(fetch("/api/ping"), 3000);
    if (res.ok) {
      cachedBase = "/api";
      return cachedBase;
    }
  } catch {}

  // Fallback to Netlify functions path
  try {
    const res = await withTimeout(fetch("/.netlify/functions/api/api/ping"), 4000);
    if (res.ok) {
      cachedBase = "/.netlify/functions/api/api";
      return cachedBase;
    }
  } catch {}

  // Default to /api if all else fails
  cachedBase = "/api";
  return cachedBase;
}

export async function apiFetch(inputPath: string, init?: RequestInit): Promise<Response> {
  const base = await resolveApiBase();
  const url = `${base}${inputPath}`;
  return fetch(url, init);
}
