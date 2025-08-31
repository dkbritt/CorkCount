import { createClient } from "@supabase/supabase-js";

// Configuration state
let supabaseConfig: {
  isConfigured: boolean;
  isInsecureUrl: boolean;
  url?: string;
  anonKey?: string;
} | null = null;

// Load configuration from server
async function loadSupabaseConfig() {
  if (supabaseConfig) return supabaseConfig;
  
  try {
    const response = await fetch("/api/config/supabase");
    if (!response.ok) {
      throw new Error(`Failed to load configuration: ${response.status}`);
    }
    supabaseConfig = await response.json();
    return supabaseConfig;
  } catch (error) {
    console.warn("Failed to load Supabase configuration:", error);
    supabaseConfig = { isConfigured: false, isInsecureUrl: false };
    return supabaseConfig;
  }
}

// Create a safe stub client when configuration is not available
function createStubClient() {
  const notConfiguredError = new Error(
    "Supabase is not configured. Contact administrator to configure database."
  );

  const makeQuery = () => {
    const p: any = Promise.resolve({ data: null, error: notConfiguredError });
    // Chainable query builder methods used in the app
    p.select = () => p;
    p.order = () => p;
    p.gte = () => p;
    p.eq = () => p;
    p.limit = () => p;
    p.range = () => p;
    p.single = () => p;
    p.insert = () => p;
    p.update = () => p;
    p.delete = () => p;
    // Promise compatibility
    p.then = Promise.prototype.then.bind(p);
    p.catch = Promise.prototype.catch.bind(p);
    p.finally = Promise.prototype.finally.bind(p);
    return p;
  };

  const client: any = {
    from: (_table: string) => makeQuery(),
    auth: {
      signInWithPassword: async () => ({
        data: { user: null },
        error: notConfiguredError,
      }),
    },
  };
  return client;
}

// Cached client instance
let supabaseClient: any = null;

// Get or create Supabase client
export async function getSupabaseClient() {
  if (supabaseClient) return supabaseClient;
  
  const config = await loadSupabaseConfig();
  
  if (config.isConfigured && config.url && config.anonKey) {
    if (config.isInsecureUrl) {
      console.warn(
        "Supabase URL uses http://. Browsers will block mixed content when your site is served over HTTPS; use an https:// Supabase URL."
      );
    }
    supabaseClient = createClient(config.url, config.anonKey);
  } else {
    console.warn("Supabase configuration not available. Running with stub client.");
    supabaseClient = createStubClient();
  }
  
  return supabaseClient;
}

// Compatibility export for existing code - returns a promise
export const supabase = getSupabaseClient();

// Check if Supabase is configured (async)
export async function checkSupabaseConfig() {
  const config = await loadSupabaseConfig();
  return {
    isConfigured: config.isConfigured,
    isInsecureUrl: config.isInsecureUrl
  };
}
