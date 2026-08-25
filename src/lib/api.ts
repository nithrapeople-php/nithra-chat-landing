import { brand, FRAPPE_API_URL, TENANT_BASE_DOMAIN } from '../config'

export type SignupPayload = {
  company: string
  subdomain: string
  adminEmail: string
  adminName: string
}

export type SignupResult = {
  ok: boolean
  jobId?: string
  siteUrl?: string
  message?: string
}

export type ProvisioningStatus = {
  status: 'pending' | 'creating' | 'ready' | 'failed'
  siteUrl?: string
  message?: string
}

/**
 * Calls your central Frappe site to create a tenant + provision a site.
 * Wire this to a whitelisted method, e.g. saas.api.signup.create_tenant
 */
export async function signupTenant(payload: SignupPayload): Promise<SignupResult> {
  const res = await fetch(`${FRAPPE_API_URL}/api/method/saas.api.signup.create_tenant`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `Signup failed (${res.status})`)
  }

  const data = await res.json()
  const message = data.message ?? data
  return {
    ok: true,
    jobId: message.job_id ?? message.jobId,
    siteUrl: message.site_url ?? message.siteUrl,
    message: message.message,
  }
}

/** Poll provisioning status by job id (or subdomain). */
export async function getProvisioningStatus(jobId: string): Promise<ProvisioningStatus> {
  const res = await fetch(
    `${FRAPPE_API_URL}/api/method/saas.api.signup.get_status?job_id=${encodeURIComponent(jobId)}`,
  )

  if (!res.ok) {
    throw new Error(`Status check failed (${res.status})`)
  }

  const data = await res.json()
  const message = data.message ?? data
  return {
    status: message.status ?? 'pending',
    siteUrl: message.site_url ?? message.siteUrl,
    message: message.message,
  }
}

/** Resolve where an existing customer should go (email → tenant site). */
export async function resolveWorkspace(email: string): Promise<{ siteUrl: string } | null> {
  const res = await fetch(
    `${FRAPPE_API_URL}/api/method/saas.api.signup.resolve_workspace?email=${encodeURIComponent(email)}`,
  )

  if (!res.ok) return null

  const data = await res.json()
  const message = data.message ?? data
  if (!message?.site_url && !message?.siteUrl) return null
  return { siteUrl: message.site_url ?? message.siteUrl }
}

export function tenantUrlFromSubdomain(subdomain: string): string {
  return `https://${subdomain}.${TENANT_BASE_DOMAIN}`
}

export function isApiConfigured(): boolean {
  return !FRAPPE_API_URL.includes('your-central-site')
}

export { brand }
