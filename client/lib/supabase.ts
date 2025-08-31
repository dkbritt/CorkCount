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

  // Create a comprehensive query builder stub that maintains proper chaining
  const createQueryBuilder = (): any => {
    const errorResult = { data: null, error: notConfiguredError };
    
    const queryBuilder: any = {};
    
    // All Supabase query builder methods
    const queryMethods = [
      'select', 'insert', 'update', 'delete', 'upsert',
      'eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'like', 'ilike', 'is', 'in',
      'contains', 'containedBy', 'rangeGt', 'rangeGte', 'rangeLt', 'rangeLte',
      'rangeAdjacent', 'overlaps', 'textSearch', 'match', 'not', 'or', 'filter',
      'order', 'limit', 'range', 'single', 'maybeSingle', 'csv', 'geojson', 'explain'
    ];
    
    // Add all methods that return chainable query builders
    queryMethods.forEach(method => {
      queryBuilder[method] = (...args: any[]) => {
        console.warn(`🔴 Stub client: Method "${method}" called but database is not configured`);
        return createQueryBuilder(); // Return new chainable builder
      };
    });
    
    // Promise methods should return the actual error result
    queryBuilder.then = (onfulfilled?: any, onrejected?: any) => {
      return Promise.resolve(errorResult).then(onfulfilled, onrejected);
    };
    queryBuilder.catch = (onrejected?: any) => {
      return Promise.resolve(errorResult).catch(onrejected);
    };
    queryBuilder.finally = (onfinally?: any) => {
      return Promise.resolve(errorResult).finally(onfinally);
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

// Create a simpler, more direct proxy implementation
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

  const proxy: any = {
    from: (table: string) => {
      console.log(`🔍 Creating query for table: ${table}`);
      
      // Create a promise that resolves to the real query builder
      const queryBuilderPromise = getClient().then(client => {
        const queryBuilder = client.from(table);
        console.log(`✅ Got query builder for ${table}:`, {
          hasSelect: typeof queryBuilder.select === 'function',
          hasGte: typeof queryBuilder.gte === 'function',
          hasEq: typeof queryBuilder.eq === 'function',
          hasOrder: typeof queryBuilder.order === 'function'
        });
        return queryBuilder;
      }).catch(error => {
        console.error(`❌ Error getting query builder for ${table}:`, error);
        return createStubClient().from(table);
      });

      // Create a synchronous-looking object that forwards all method calls
      const proxyQuery: any = {};
      
      // All possible Supabase query methods
      const allMethods = [
        'select', 'insert', 'update', 'delete', 'upsert',
        'eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'like', 'ilike', 'is', 'in',
        'contains', 'containedBy', 'rangeGt', 'rangeGte', 'rangeLt', 'rangeLte',
        'rangeAdjacent', 'overlaps', 'textSearch', 'match', 'not', 'or', 'filter',
        'order', 'limit', 'range', 'single', 'maybeSingle', 'csv', 'geojson', 'explain'
      ];
      
      // Add all methods to the proxy
      allMethods.forEach(methodName => {
        proxyQuery[methodName] = (...args: any[]) => {
          console.log(`🔧 Calling ${methodName} with args:`, args);
          
          const nextQueryPromise = queryBuilderPromise.then(queryBuilder => {
            if (typeof queryBuilder[methodName] === 'function') {
              const result = queryBuilder[methodName](...args);
              console.log(`✅ ${methodName} successful, result type:`, typeof result);
              return result;
            } else {
              const availableMethods = Object.getOwnPropertyNames(queryBuilder).filter(name => typeof queryBuilder[name] === 'function');
              console.error(`❌ Method ${methodName} not found. Available methods:`, availableMethods);
              throw new Error(`Query method ${methodName} is not available`);
            }
          }).catch(error => {
            console.error(`❌ Error in ${methodName}:`, error);
            return { data: null, error };
          });
          
          // Create a new proxy for the next step in the chain
          return createChainedProxy(nextQueryPromise);
        };
      });
      
      // Add Promise methods for final execution
      proxyQuery.then = (onfulfilled?: any, onrejected?: any) => {
        return queryBuilderPromise.then(onfulfilled, onrejected);
      };
      proxyQuery.catch = (onrejected?: any) => {
        return queryBuilderPromise.catch(onrejected);
      };
      proxyQuery.finally = (onfinally?: any) => {
        return queryBuilderPromise.finally(onfinally);
      };
      
      return proxyQuery;
    },
    
    auth: {
      signInWithPassword: async (credentials: any) => {
        try {
          const client = await getClient();
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

// Helper to create chained proxy for continued method calls
function createChainedProxy(queryPromise: Promise<any>): any {
  const chainedProxy: any = {};
  
  const allMethods = [
    'select', 'insert', 'update', 'delete', 'upsert',
    'eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'like', 'ilike', 'is', 'in',
    'contains', 'containedBy', 'rangeGt', 'rangeGte', 'rangeLt', 'rangeLte',
    'rangeAdjacent', 'overlaps', 'textSearch', 'match', 'not', 'or', 'filter',
    'order', 'limit', 'range', 'single', 'maybeSingle', 'csv', 'geojson', 'explain'
  ];
  
  allMethods.forEach(methodName => {
    chainedProxy[methodName] = (...args: any[]) => {
      console.log(`🔗 Chaining ${methodName} with args:`, args);
      
      const nextQueryPromise = queryPromise.then(query => {
        if (query && typeof query[methodName] === 'function') {
          const result = query[methodName](...args);
          console.log(`✅ Chained ${methodName} successful`);
          return result;
        } else {
          console.error(`❌ Chained method ${methodName} not available on:`, query);
          throw new Error(`Query method ${methodName} is not available`);
        }
      }).catch(error => {
        console.error(`❌ Error in chained ${methodName}:`, error);
        return { data: null, error };
      });
      
      return createChainedProxy(nextQueryPromise);
    };
  });
  
  // Promise methods for final execution
  chainedProxy.then = (onfulfilled?: any, onrejected?: any) => {
    return queryPromise.then(onfulfilled, onrejected);
  };
  chainedProxy.catch = (onrejected?: any) => {
    return queryPromise.catch(onrejected);
  };
  chainedProxy.finally = (onfinally?: any) => {
    return queryPromise.finally(onfinally);
  };
  
  return chainedProxy;
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
