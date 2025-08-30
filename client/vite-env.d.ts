/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_FROM_EMAIL?: string
  readonly VITE_FIL_EMAIL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
