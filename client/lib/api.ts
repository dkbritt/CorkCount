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

// XMLHttpRequest-based fetch implementation to bypass analytics interference
function xhrFetch(url: string, options: RequestInit = {}): Promise<Response> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const method = (options.method || 'GET').toUpperCase();

    xhr.open(method, url, true);

    // Set headers
    if (options.headers) {
      const headers = options.headers as Record<string, string>;
      Object.entries(headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });
    }

    // Handle timeout
    xhr.timeout = 10000; // 10 seconds

    xhr.onload = () => {
      // Create Response-like object
      const response = {
        ok: xhr.status >= 200 && xhr.status < 300,
        status: xhr.status,
        statusText: xhr.statusText,
        headers: new Headers(),
        text: () => Promise.resolve(xhr.responseText),
        json: () => Promise.resolve(JSON.parse(xhr.responseText)),
        clone: () => response,
      } as Response;

      resolve(response);
    };

    xhr.onerror = () => {
      reject(new Error(`XHR Network Error: ${xhr.status} ${xhr.statusText}`));
    };

    xhr.ontimeout = () => {
      reject(new Error('Request timed out'));
    };

    // Send request
    if (options.body) {
      xhr.send(options.body as string);
    } else {
      xhr.send();
    }
  });
}

// Check if FullStory is present and causing issues
function shouldUseXHROnly(): boolean {
  const hasFullStory = !!(window as any).FS;
  const fetchStr = window.fetch.toString();
  const isModifiedFetch = !fetchStr.includes('[native code]');

  // Force XHR if FullStory is detected
  return hasFullStory && isModifiedFetch;
}

export async function apiFetch(
  inputPath: string,
  init?: RequestInit,
): Promise<Response> {
  const url = getEndpointUrl(inputPath);

  console.log(`🔄 API Request: ${url}`);

  const requestOptions = {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Cache-Control': 'no-cache',
      ...init?.headers,
    },
  };

  // If FullStory is detected, skip fetch entirely and go straight to XHR
  if (shouldUseXHROnly()) {
    console.warn('🚨 FullStory detected - using XHR-only mode to avoid interference');

    try {
      const xhrResponse = await xhrFetch(url, requestOptions);
      console.log(`✅ XHR Direct Success: ${xhrResponse.status}`);
      return xhrResponse;
    } catch (xhrError) {
      console.error(`❌ XHR Direct failed:`, xhrError);
      throw new Error('Network error: XHR request failed. Please check your connection.');
    }
  }

  // Standard fetch path (only if no FullStory detected)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      ...requestOptions,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    console.log(`✅ API Response: ${response.status} ${response.statusText}`);
    return response;

  } catch (error) {
    console.error(`❌ Fetch failed, trying XHR fallback:`, error);

    // Any fetch error gets XHR fallback
    try {
      console.warn('🔄 Using XHR fallback due to fetch error...');
      const xhrResponse = await xhrFetch(url, requestOptions);
      console.log(`✅ XHR Fallback Success: ${xhrResponse.status}`);
      return xhrResponse;

    } catch (xhrError) {
      console.error(`❌ XHR Fallback also failed:`, xhrError);

      // Final error handling
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timed out. Please try again.');
        }
        if (error.message.includes('fetch') || error.stack?.includes('fullstory')) {
          throw new Error('Network error: Analytics interference detected. Please disable ad blockers or try refreshing the page.');
        }
      }

      throw new Error('Network error connecting to database. Please check your internet connection and ensure the service is online.');
    }
  }
}
