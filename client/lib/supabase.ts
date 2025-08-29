import { createClient } from '@supabase/supabase-js'

// Environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Create a safe stub client when env vars are missing to avoid crashing the app
function createStubClient() {
  const notConfiguredError = new Error(
    'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
  )

  const makeQuery = () => {
    const p: any = Promise.resolve({ data: null, error: notConfiguredError })
    // Chainable query builder methods used in the app
    p.select = () => p
    p.order = () => p
    p.gte = () => p
    p.eq = () => p
    p.limit = () => p
    p.range = () => p
    p.single = () => p
    p.insert = () => p
    p.update = () => p
    p.delete = () => p
    // Promise compatibility
    p.then = Promise.prototype.then.bind(p)
    p.catch = Promise.prototype.catch.bind(p)
    p.finally = Promise.prototype.finally.bind(p)
    return p
  }

  const client: any = {
    from: (_table: string) => makeQuery(),
    auth: {
      signInWithPassword: async () => ({ data: { user: null }, error: notConfiguredError }),
    },
  }
  return client
}

// Create Supabase client (or stub if envs are missing)
export const supabase: any = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (() => {
      if (typeof console !== 'undefined') {
        console.warn(
          'Supabase env vars missing. Running with a stub client. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable Supabase.'
        )
      }
      return createStubClient()
    })()

// Declare global window interface for TypeScript
declare global {
  interface Window {
    supabase: typeof supabase
  }
}

// Make Supabase client globally available
if (typeof window !== 'undefined') {
  window.supabase = supabase
}
