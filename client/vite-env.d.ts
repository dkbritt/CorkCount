/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly DEV: boolean;
  readonly PROD: boolean;
  // Note: Sensitive environment variables (VITE_SUPABASE_*, VITE_*_EMAIL, etc.)
  // are no longer exposed to frontend to prevent bundling secrets
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
