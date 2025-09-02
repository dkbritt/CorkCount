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

// Store original fetch in case it gets overridden by analytics
const originalFetch = window.fetch;

export async function apiFetch(
  inputPath: string,
  init?: RequestInit,
): Promise<Response> {
  const url = getEndpointUrl(inputPath);

  try {
    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    console.log(`🔄 API Request: ${url}`);

    // Try with current fetch first, fallback to original if needed
    let fetchFunction = window.fetch;

    const response = await fetchFunction(url, {
      ...init,
      signal: controller.signal,
      // Add explicit headers to help with analytics interference
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...init?.headers,
      },
    });

    clearTimeout(timeoutId);
    console.log(`✅ API Response: ${response.status} ${response.statusText}`);
    return response;
  } catch (error) {
    console.error(`❌ API Error for ${url}:`, error);

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please try again.');
      }

      // Check if analytics might be interfering
      if (error.stack?.includes('fullstory') || error.stack?.includes('fs.js')) {
        console.warn('⚠️ Analytics interference detected, trying fallback...');

        // Try with original fetch as fallback
        try {
          const fallbackResponse = await originalFetch(url, {
            ...init,
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              ...init?.headers,
            },
          });
          console.log(`✅ Fallback API Response: ${fallbackResponse.status}`);
          return fallbackResponse;
        } catch (fallbackError) {
          console.error(`❌ Fallback also failed:`, fallbackError);
        }
      }

      if (error.message.includes('fetch')) {
        throw new Error('Network error connecting to database. Please check your internet connection and ensure the service is online.');
      }
    }
    throw error;
  }
}
