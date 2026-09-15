import { brand, FRAPPE_API_URL, TENANT_BASE_DOMAIN } from '../config'

const SIGNUP_API = 'nithra_saas.api.signup'

export type SignupPayload = {
  company: string
  subdomain: string
  adminEmail: string
  adminName: string
  saas_plan?: string
  /** Frappe app names selected on the trial picker */
  apps?: string[]
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

function methodUrl(method: string, query?: Record<string, string>) {
  const base = `${FRAPPE_API_URL}/api/method/${SIGNUP_API}.${method}`
  if (!query) return base
  const qs = new URLSearchParams(query).toString()
  return `${base}?${qs}`
}

/** Parse Frappe error JSON into a short user-facing message. */
async function errorFromResponse(res: Response): Promise<string> {
  const text = await res.text()
  try {
    const data = JSON.parse(text)
    if (typeof data.message === 'string' && data.message) return data.message
    if (data.exception) {
      const line = String(data.exception).split('\n')[0]
      return line.replace(/^[^:]*:\s*/, '') || line
    }
    if (data._server_messages) {
      const msgs = JSON.parse(data._server_messages)
      const first = typeof msgs[0] === 'string' ? JSON.parse(msgs[0]) : msgs[0]
      if (first?.message) return first.message
    }
  } catch {
    /* use raw text */
  }
  return text.slice(0, 280) || `Request failed (${res.status})`
}

/**
 * Calls central site to create a tenant + provision a site.
 * Method: nithra_saas.api.signup.create_tenant
 */
export async function signupTenant(payload: SignupPayload): Promise<SignupResult> {
  const res = await fetch(methodUrl('create_tenant'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    throw new Error(await errorFromResponse(res))
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

/** Poll provisioning status by public job_id. */
export async function getProvisioningStatus(jobId: string): Promise<ProvisioningStatus> {
  const res = await fetch(methodUrl('get_status', { job_id: jobId }), {
    headers: { Accept: 'application/json' },
  })

  if (!res.ok) {
    throw new Error(await errorFromResponse(res))
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
  const res = await fetch(methodUrl('resolve_workspace', { email }), {
    headers: { Accept: 'application/json' },
  })

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
