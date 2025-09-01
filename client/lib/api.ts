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

// Map endpoint paths to their corresponding function names
const ENDPOINT_FUNCTION_MAP = {
  '/ping': 'ping',
  '/config/supabase': 'config/supabase',
  '/config/email': 'config/email',
  '/inventory': 'inventory',
  '/orders': 'orders',
  '/batches': 'batches',
  '/metrics': 'metrics',
  '/auth/login': 'auth/login',
  '/email': 'email',
} as const;

async function tryPing(isNetlify: boolean): Promise<boolean> {
  try {
    const url = isNetlify ? '/.netlify/functions/ping' : '/api/ping';
    const res = await withTimeout(
      fetch(url, { method: "GET" }),
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

// Determine whether to use local API or Netlify functions
let isNetlifyMode: boolean | null = null;

export async function resolveApiMode(forceRefresh = false): Promise<boolean> {
  if (!forceRefresh && isNetlifyMode !== null) return isNetlifyMode;

  // Try local API first
  const localWorks = await tryPing(false);
  if (localWorks) {
    isNetlifyMode = false;
    return false;
  }

  // Fall back to Netlify functions
  const netlifyWorks = await tryPing(true);
  if (netlifyWorks) {
    isNetlifyMode = true;
    return true;
  }

  // Default to local API mode
  isNetlifyMode = false;
  return false;
}

function getEndpointUrl(inputPath: string, useNetlify: boolean): string {
  if (useNetlify) {
    // For Netlify functions, map paths to individual functions
    for (const [path, func] of Object.entries(ENDPOINT_FUNCTION_MAP)) {
      if (inputPath.startsWith(path)) {
        const remainingPath = inputPath.substring(path.length);
        return `/.netlify/functions/${func}${remainingPath}`;
      }
    }
    // Fallback for unmapped paths
    return `/.netlify/functions/api${inputPath}`;
  } else {
    // For local development, use the API prefix
    return `/api${inputPath}`;
  }
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
