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

// Create comprehensive stub client with all Supabase methods
function createStubClient() {
  const notConfiguredError = new Error(
    "Database is not configured. Please contact administrator to configure the database connection."
  );

  // Create a comprehensive query builder stub
  const createQueryBuilder = () => {
    const errorResult = Promise.resolve({ data: null, error: notConfiguredError });
    
    const queryBuilder: any = {
      // Query methods
      select: (...args: any[]) => createQueryBuilder(),
      insert: (...args: any[]) => createQueryBuilder(),
      update: (...args: any[]) => createQueryBuilder(),
      delete: (...args: any[]) => createQueryBuilder(),
      upsert: (...args: any[]) => createQueryBuilder(),
      
      // Filter methods
      eq: (...args: any[]) => createQueryBuilder(),
      neq: (...args: any[]) => createQueryBuilder(),
      gt: (...args: any[]) => createQueryBuilder(),
      gte: (...args: any[]) => createQueryBuilder(),
      lt: (...args: any[]) => createQueryBuilder(),
      lte: (...args: any[]) => createQueryBuilder(),
      like: (...args: any[]) => createQueryBuilder(),
      ilike: (...args: any[]) => createQueryBuilder(),
      is: (...args: any[]) => createQueryBuilder(),
      in: (...args: any[]) => createQueryBuilder(),
      contains: (...args: any[]) => createQueryBuilder(),
      containedBy: (...args: any[]) => createQueryBuilder(),
      rangeGt: (...args: any[]) => createQueryBuilder(),
      rangeGte: (...args: any[]) => createQueryBuilder(),
      rangeLt: (...args: any[]) => createQueryBuilder(),
      rangeLte: (...args: any[]) => createQueryBuilder(),
      rangeAdjacent: (...args: any[]) => createQueryBuilder(),
      overlaps: (...args: any[]) => createQueryBuilder(),
      textSearch: (...args: any[]) => createQueryBuilder(),
      match: (...args: any[]) => createQueryBuilder(),
      not: (...args: any[]) => createQueryBuilder(),
      or: (...args: any[]) => createQueryBuilder(),
      filter: (...args: any[]) => createQueryBuilder(),
      
      // Modifier methods
      order: (...args: any[]) => createQueryBuilder(),
      limit: (...args: any[]) => createQueryBuilder(),
      range: (...args: any[]) => createQueryBuilder(),
      single: () => createQueryBuilder(),
      maybeSingle: () => createQueryBuilder(),
      csv: () => createQueryBuilder(),
      geojson: () => createQueryBuilder(),
      explain: (...args: any[]) => createQueryBuilder(),
      
      // Promise methods - these should return the actual error result
      then: (onfulfilled?: any, onrejected?: any) => errorResult.then(onfulfilled, onrejected),
      catch: (onrejected?: any) => errorResult.catch(onrejected),
      finally: (onfinally?: any) => errorResult.finally(onfinally),
    };
    
    return queryBuilder;
  };

  const client: any = {
    from: (tableName: string) => {
      console.warn(`🔴 Stub client: Attempted to query table "${tableName}" but database is not configured`);
      return createQueryBuilder();
    },
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
    try {
      supabaseClient = createClient(config.url, config.anonKey);
      console.log("✅ Created Supabase client");
    } catch (error) {
      console.error("❌ Failed to create Supabase client:", error);
      supabaseClient = createStubClient();
    }
  } else {
    console.warn("❌ Supabase configuration not available. Running with stub client.");
    supabaseClient = createStubClient();
  }
  
  return supabaseClient;
}

// Create a much simpler proxy that just forwards to the real client
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

  // Create a simple forwarding proxy
  const proxy: any = {
    from: (table: string) => {
      // Return a promise that resolves to the actual query builder
      const clientQuery = getClient().then(client => {
        try {
          const query = client.from(table);
          console.log(`🔍 Created query for table "${table}":`, {
            hasSelect: typeof query.select === 'function',
            hasGte: typeof query.gte === 'function',
            hasEq: typeof query.eq === 'function',
            hasOrder: typeof query.order === 'function',
            methods: Object.getOwnPropertyNames(query)
          });
          return query;
        } catch (error) {
          console.error(`❌ Error creating query for table "${table}":`, error);
          return createStubClient().from(table);
        }
      });

      // Create a proxy that forwards all method calls to the real query object
      const queryProxy: any = new Proxy({}, {
        get(target, prop, receiver) {
          if (prop === 'then' || prop === 'catch' || prop === 'finally') {
            // Handle Promise methods directly
            return (...args: any[]) => clientQuery.then(query => query)[prop as string](...args);
          }
          
          // Handle query builder methods
          return (...args: any[]) => {
            const nextQuery = clientQuery.then(query => {
              if (typeof query[prop as string] === 'function') {
                const result = query[prop as string](...args);
                console.log(`🔧 Called ${String(prop)} on query, result type:`, typeof result);
                return result;
              } else {
                console.error(`❌ Method ${String(prop)} not found on query object:`, Object.getOwnPropertyNames(query));
                throw new Error(`Query method ${String(prop)} is not available`);
              }
            }).catch(error => {
              console.error(`❌ Error calling ${String(prop)}:`, error);
              return { data: null, error };
            });
            
            // Return a new proxy for method chaining
            return createQueryProxy(nextQuery);
          };
        }
      });
      
      return queryProxy;
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

// Helper to create query proxy for chained promises
function createQueryProxy(queryPromise: Promise<any>): any {
  return new Proxy({}, {
    get(target, prop, receiver) {
      if (prop === 'then' || prop === 'catch' || prop === 'finally') {
        // Handle Promise methods
        return (...args: any[]) => queryPromise[prop as string](...args);
      }
      
      // Handle query builder methods
      return (...args: any[]) => {
        const nextQuery = queryPromise.then(query => {
          if (query && typeof query[prop as string] === 'function') {
            return query[prop as string](...args);
          } else {
            console.error(`❌ Method ${String(prop)} not available on query result:`, query);
            throw new Error(`Query method ${String(prop)} is not available`);
          }
        }).catch(error => {
          console.error(`❌ Error in query chain for ${String(prop)}:`, error);
          return { data: null, error };
        });
        
        // Return a new proxy for continued chaining
        return createQueryProxy(nextQuery);
      };
    }
  });
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
