// API client with automatic environment detection

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
function getEndpointUrl(inputPath: string): string {
  // Always use /api. In production, Netlify redirects map /api/* to functions.
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
