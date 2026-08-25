/**
 * Brand + backend settings.
 * Point FRAPPE_API_URL at your central Frappe control-plane site.
 */
export const brand = {
  name: 'Relay',
  tagline: 'One shared space for cross-functional work',
  domain: 'relay.app',
} as const

/** Central Frappe site that handles signup + tenant provisioning */
export const FRAPPE_API_URL =
  import.meta.env.VITE_FRAPPE_API_URL?.replace(/\/$/, '') ||
  'https://your-central-site.frappe.cloud'

/** Base URL pattern for tenant workspaces: https://{subdomain}.yourdomain.com */
export const TENANT_BASE_DOMAIN =
  import.meta.env.VITE_TENANT_BASE_DOMAIN || 'yourdomain.com'
