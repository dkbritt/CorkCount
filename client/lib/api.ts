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

// Simple environment detection
function isProduction(): boolean {
  return window.location.hostname !== 'localhost' &&
         window.location.hostname !== '127.0.0.1' &&
         !window.location.hostname.includes('preview');
}

// Map endpoint paths to their corresponding function names (for production)
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

function getEndpointUrl(inputPath: string): string {
  // In development, always use local API
  if (!isProduction()) {
    return `/api${inputPath}`;
  }

  // In production, use individual Netlify functions
  for (const [path, func] of Object.entries(ENDPOINT_FUNCTION_MAP)) {
    if (inputPath.startsWith(path)) {
      const remainingPath = inputPath.substring(path.length);
      return `/.netlify/functions/${func}${remainingPath}`;
    }
  }

  // Fallback for unmapped paths in production
  return `/api${inputPath}`;
}

export async function apiFetch(
  inputPath: string,
  init?: RequestInit,
): Promise<Response> {
  const url = getEndpointUrl(inputPath);

  try {
    const response = await fetch(url, init);
    return response;
  } catch (error) {
    throw error;
  }
}
