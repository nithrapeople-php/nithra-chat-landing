/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FRAPPE_API_URL?: string
  readonly VITE_TENANT_BASE_DOMAIN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
