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

// Create a proxy that looks synchronous but handles async internally
function createSupabaseProxy() {
  let clientPromise: Promise<any> | null = null;
  
  const getClient = () => {
    if (!clientPromise) {
      clientPromise = getSupabaseClient();
    }
    return clientPromise;
  };

  // Create proxy object that intercepts method calls
  const proxy: any = {
    from: (table: string) => {
      // Return a query builder that handles the async client internally
      const makeAsyncQuery = () => {
        const queryPromise = getClient().then(client => client.from(table));
        
        // Chain methods that return the query promise
        const chainMethods = ['select', 'insert', 'update', 'delete', 'upsert'];
        const filterMethods = ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'like', 'ilike', 'is', 'in', 'contains', 'containedBy', 'rangelt', 'rangegte', 'rangegt', 'rangelte', 'textSearch', 'match', 'not', 'or', 'filter'];
        const modifierMethods = ['order', 'limit', 'range', 'single', 'maybeSingle', 'csv', 'geojson', 'explain'];
        
        const allMethods = [...chainMethods, ...filterMethods, ...modifierMethods];
        
        const queryProxy: any = {};
        
        // Add chainable methods
        allMethods.forEach(method => {
          queryProxy[method] = (...args: any[]) => {
            const newPromise = queryPromise.then(query => query[method](...args));
            return createQueryProxy(newPromise);
          };
        });
        
        // Make it thenable so it works with await
        queryProxy.then = (onfulfilled?: any, onrejected?: any) => {
          return queryPromise.then(onfulfilled, onrejected);
        };
        
        queryProxy.catch = (onrejected?: any) => {
          return queryPromise.catch(onrejected);
        };
        
        queryProxy.finally = (onfinally?: any) => {
          return queryPromise.finally(onfinally);
        };
        
        return queryProxy;
      };
      
      return makeAsyncQuery();
    },
    
    auth: {
      signInWithPassword: async (credentials: any) => {
        const client = await getClient();
        return client.auth.signInWithPassword(credentials);
      },
      
      getUser: async () => {
        const client = await getClient();
        return client.auth.getUser();
      },
      
      signOut: async () => {
        const client = await getClient();
        return client.auth.signOut();
      }
    }
  };
  
  return proxy;
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
      const newPromise = queryPromise.then(query => query[method](...args));
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
