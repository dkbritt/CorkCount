import { createClient } from "@supabase/supabase-js";

// Configuration state
let supabaseConfig: {
  isConfigured: boolean;
  isInsecureUrl: boolean;
  url?: string;
  anonKey?: string;
} | null = null;

// Cached client instance
let supabaseClient: any = null;
let configLoadAttempted = false;

// Load configuration from server with fallback
async function loadSupabaseConfig() {
  if (supabaseConfig) return supabaseConfig;
  if (configLoadAttempted) return supabaseConfig || { isConfigured: false, isInsecureUrl: false };
  
  configLoadAttempted = true;
  
  try {
    const response = await fetch("/api/config/supabase");
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }
    supabaseConfig = await response.json();
    console.log("✅ Loaded Supabase configuration from server");
    return supabaseConfig;
  } catch (error) {
    console.warn("⚠️ Failed to load Supabase configuration from server:", error);
    // Fallback to environment variables if server is not available (development mode)
    const fallbackUrl = (import.meta.env as any).VITE_SUPABASE_URL;
    const fallbackKey = (import.meta.env as any).VITE_SUPABASE_ANON_KEY;
    
    if (fallbackUrl && fallbackKey) {
      console.log("🔧 Using fallback environment variables");
      supabaseConfig = {
        isConfigured: true,
        isInsecureUrl: fallbackUrl.startsWith("http://"),
        url: fallbackUrl,
        anonKey: fallbackKey
      };
    } else {
      console.log("❌ No configuration available");
      supabaseConfig = { isConfigured: false, isInsecureUrl: false };
    }
    return supabaseConfig;
  }
}

// Create a safe stub client when configuration is not available
function createStubClient() {
  const notConfiguredError = new Error(
    "Database is not configured. Please contact administrator to configure the database connection."
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
    p.upsert = () => p;
    p.maybeSingle = () => p;
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

// Get or create Supabase client
export async function getSupabaseClient() {
  if (supabaseClient) return supabaseClient;
  
  const config = await loadSupabaseConfig();
  
  if (config.isConfigured && config.url && config.anonKey) {
    if (config.isInsecureUrl) {
      console.warn(
        "⚠️ Supabase URL uses http://. Browsers will block mixed content when your site is served over HTTPS; use an https:// Supabase URL."
      );
    }
    supabaseClient = createClient(config.url, config.anonKey);
    console.log("✅ Created Supabase client");
  } else {
    console.warn("❌ Supabase configuration not available. Running with stub client.");
    supabaseClient = createStubClient();
  }
  
  return supabaseClient;
}

// Helper function to create query proxy for chained methods
function createQueryProxy(queryPromise: Promise<any>): any {
  const chainMethods = ['select', 'insert', 'update', 'delete', 'upsert'];
  const filterMethods = ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'like', 'ilike', 'is', 'in', 'contains', 'containedBy', 'rangelt', 'rangegte', 'rangegt', 'rangelte', 'textSearch', 'match', 'not', 'or', 'filter'];
  const modifierMethods = ['order', 'limit', 'range', 'single', 'maybeSingle', 'csv', 'geojson', 'explain'];
  
  const allMethods = [...chainMethods, ...filterMethods, ...modifierMethods];
  
  const proxy: any = {};
  
  // Add chainable methods
  allMethods.forEach(method => {
    proxy[method] = (...args: any[]) => {
      const newPromise = queryPromise.then(query => {
        if (!query || typeof query[method] !== 'function') {
          console.error(`Method ${method} not available on query object:`, query);
          return Promise.resolve({ data: null, error: new Error(`Query method ${method} is not available`) });
        }
        return query[method](...args);
      }).catch(error => {
        console.error(`Error in query method ${method}:`, error);
        return { data: null, error };
      });
      return createQueryProxy(newPromise);
    };
  });
  
  // Make it thenable so it works with await
  proxy.then = (onfulfilled?: any, onrejected?: any) => {
    return queryPromise.then(onfulfilled, onrejected);
  };
  
  proxy.catch = (onrejected?: any) => {
    return queryPromise.catch(onrejected);
  };
  
  proxy.finally = (onfinally?: any) => {
    return queryPromise.finally(onfinally);
  };
  
  return proxy;
}

// Create a proxy that looks synchronous but handles async internally
function createSupabaseProxy() {
  let clientPromise: Promise<any> | null = null;
  
  const getClient = () => {
    if (!clientPromise) {
      clientPromise = getSupabaseClient().catch(error => {
        console.error("Failed to get Supabase client:", error);
        return createStubClient();
      });
    }
    return clientPromise;
  };

  // Create proxy object that intercepts method calls
  const proxy: any = {
    from: (table: string) => {
      // Return a query builder that handles the async client internally
      const queryPromise = getClient().then(client => {
        if (!client || typeof client.from !== 'function') {
          console.error("Invalid Supabase client:", client);
          const stubClient = createStubClient();
          return stubClient.from(table);
        }
        return client.from(table);
      }).catch(error => {
        console.error("Error getting client for table query:", error);
        const stubClient = createStubClient();
        return stubClient.from(table);
      });
      
      return createQueryProxy(queryPromise);
    },
    
    auth: {
      signInWithPassword: async (credentials: any) => {
        try {
          const client = await getClient();
          if (!client.auth || typeof client.auth.signInWithPassword !== 'function') {
            throw new Error("Auth not available");
          }
          return await client.auth.signInWithPassword(credentials);
        } catch (error) {
          console.error("Auth sign in error:", error);
          return {
            data: { user: null },
            error: error instanceof Error ? error : new Error("Authentication failed")
          };
        }
      },
      
      getUser: async () => {
        try {
          const client = await getClient();
          if (!client.auth || typeof client.auth.getUser !== 'function') {
            throw new Error("Auth not available");
          }
          return await client.auth.getUser();
        } catch (error) {
          console.error("Auth get user error:", error);
          return {
            data: { user: null },
            error: error instanceof Error ? error : new Error("Get user failed")
          };
        }
      },
      
      signOut: async () => {
        try {
          const client = await getClient();
          if (!client.auth || typeof client.auth.signOut !== 'function') {
            throw new Error("Auth not available");
          }
          return await client.auth.signOut();
        } catch (error) {
          console.error("Auth sign out error:", error);
          return {
            error: error instanceof Error ? error : new Error("Sign out failed")
          };
        }
      }
    }
  };
  
  return proxy;
}

// Export the proxy as the main supabase client
export const supabase = createSupabaseProxy();

// Check if Supabase is configured (async)
export async function checkSupabaseConfig() {
  const config = await loadSupabaseConfig();
  return {
    isConfigured: config.isConfigured,
    isInsecureUrl: config.isInsecureUrl
  };
}
