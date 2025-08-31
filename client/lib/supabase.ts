import { createClient } from "@supabase/supabase-js";

// Environment variables - direct access as requested
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
export const isSupabaseInsecureUrl = Boolean(
  supabaseUrl && String(supabaseUrl).startsWith("http://"),
);

// Create a safe stub client when env vars are missing to avoid crashing the app
function createStubClient() {
  const notConfiguredError = new Error(
    "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.",
  );

  const makeQuery = () => {
    const p: any = Promise.resolve({ data: null, error: notConfiguredError });
    // Chainable query builder methods used in the app
    p.select = () => p;
    p.order = () => p;
    p.gte = () => p;
    p.eq = () => p;
    p.neq = () => p;
    p.gt = () => p;
    p.lt = () => p;
    p.lte = () => p;
    p.like = () => p;
    p.ilike = () => p;
    p.is = () => p;
    p.in = () => p;
    p.contains = () => p;
    p.containedBy = () => p;
    p.rangeGt = () => p;
    p.rangeGte = () => p;
    p.rangeLt = () => p;
    p.rangeLte = () => p;
    p.rangeAdjacent = () => p;
    p.overlaps = () => p;
    p.textSearch = () => p;
    p.match = () => p;
    p.not = () => p;
    p.or = () => p;
    p.filter = () => p;
    p.limit = () => p;
    p.range = () => p;
    p.single = () => p;
    p.maybeSingle = () => p;
    p.insert = () => p;
    p.update = () => p;
    p.delete = () => p;
    p.upsert = () => p;
    p.csv = () => p;
    p.geojson = () => p;
    p.explain = () => p;
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
      getUser: async () => ({
        data: { user: null },
        error: notConfiguredError,
      }),
      signOut: async () => ({
        error: notConfiguredError,
      }),
    },
  };
  return client;
}

// Create Supabase client (or stub if envs are missing)
export const supabase: any = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (() => {
      if (typeof console !== "undefined") {
        console.warn(
          "Supabase env vars missing. Running with a stub client. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable Supabase.",
        );
      }
      return createStubClient();
    })();

if (isSupabaseConfigured && isSupabaseInsecureUrl) {
  console.warn(
    "VITE_SUPABASE_URL uses http://. Browsers will block mixed content when your site is served over HTTPS; use an https:// Supabase URL.",
  );
}

// Check if Supabase is configured
export function checkSupabaseConfig() {
  return {
    isConfigured: isSupabaseConfigured,
    isInsecureUrl: isSupabaseInsecureUrl,
  };
}
