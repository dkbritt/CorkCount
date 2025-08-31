// Secure Supabase client that makes API calls to serverless functions
// This prevents environment variables from being bundled into the client

// API endpoint helpers
const getApiEndpoint = (path: string) => {
  return import.meta.env.DEV
    ? `/api${path}`
    : `/.netlify/functions/api/api${path}`;
};

// Check if Supabase is configured by testing the API
async function checkSupabaseConfig(): Promise<{ isConfigured: boolean; isInsecureUrl: boolean }> {
  try {
    const response = await fetch(getApiEndpoint("/config/supabase"));
    if (!response.ok) {
      return { isConfigured: false, isInsecureUrl: false };
    }
    const config = await response.json();
    return {
      isConfigured: config.isConfigured || false,
      isInsecureUrl: config.isInsecureUrl || false
    };
  } catch (error) {
    console.warn("Could not check Supabase configuration:", error);
    return { isConfigured: false, isInsecureUrl: false };
  }
}

// Authentication functions
export const auth = {
  async signInWithPassword({ email, password }: { email: string; password: string }) {
    try {
      const response = await fetch(getApiEndpoint("/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        return {
          data: { user: null },
          error: { message: result.error || "Authentication failed" }
        };
      }

      return {
        data: { 
          user: result.user,
          session: result.session
        },
        error: null
      };
    } catch (error) {
      return {
        data: { user: null },
        error: { message: "Network error during authentication" }
      };
    }
  },

  async getUser() {
    // For now, return null as we're not implementing full session management
    return {
      data: { user: null },
      error: null
    };
  },

  async signOut() {
    // For now, just return success
    return {
      error: null
    };
  }
};

// Database query builder functions
function createQueryBuilder(tableName: string) {
  const queryBuilder: any = {
    // SELECT operations
    select: (columns = "*") => {
      queryBuilder._select = columns;
      return queryBuilder;
    },

    // WHERE conditions
    gte: (column: string, value: any) => {
      queryBuilder._filters = queryBuilder._filters || [];
      queryBuilder._filters.push({ type: "gte", column, value });
      return queryBuilder;
    },

    eq: (column: string, value: any) => {
      queryBuilder._filters = queryBuilder._filters || [];
      queryBuilder._filters.push({ type: "eq", column, value });
      return queryBuilder;
    },

    // ORDER BY
    order: (column: string, options?: { ascending?: boolean }) => {
      queryBuilder._order = { column, ascending: options?.ascending !== false };
      return queryBuilder;
    },

    // LIMIT
    limit: (count: number) => {
      queryBuilder._limit = count;
      return queryBuilder;
    },

    // Execute the query
    async then(resolve: any, reject: any) {
      try {
        let result;
        
        if (tableName === "Inventory" && queryBuilder._select) {
          // Handle inventory fetching
          const response = await fetch(getApiEndpoint("/inventory"));
          const apiResult = await response.json();
          
          if (!response.ok || !apiResult.success) {
            result = {
              data: null,
              error: { message: apiResult.error || "Failed to fetch inventory" }
            };
          } else {
            result = {
              data: apiResult.wines,
              error: null
            };
          }
        } else if (tableName === "Orders" && queryBuilder._select) {
          // Handle orders fetching
          const response = await fetch(getApiEndpoint("/orders"));
          const apiResult = await response.json();
          
          if (!response.ok || !apiResult.success) {
            result = {
              data: null,
              error: { message: apiResult.error || "Failed to fetch orders" }
            };
          } else {
            result = {
              data: apiResult.orders,
              error: null
            };
          }
        } else {
          result = {
            data: null,
            error: { message: `Unsupported operation on ${tableName}` }
          };
        }

        resolve(result);
      } catch (error) {
        reject({
          data: null,
          error: { message: "Network error" }
        });
      }
    },

    // INSERT operations
    insert: (data: any) => {
      queryBuilder._insert = data;
      return queryBuilder;
    },

    // UPDATE operations
    update: (data: any) => {
      queryBuilder._update = data;
      return queryBuilder;
    },

    // SELECT single result
    single: () => {
      queryBuilder._single = true;
      return queryBuilder;
    }
  };

  return queryBuilder;
}

// Database operations
function from(tableName: string) {
  return createQueryBuilder(tableName);
}

// Main client object
export const secureSupabase = {
  auth,
  from,
  checkSupabaseConfig
};

// Export configuration helpers
export async function isSupabaseConfigured(): Promise<boolean> {
  const config = await checkSupabaseConfig();
  return config.isConfigured;
}

export async function isSupabaseInsecureUrl(): Promise<boolean> {
  const config = await checkSupabaseConfig();
  return config.isInsecureUrl;
}

// Default export
export default secureSupabase;
