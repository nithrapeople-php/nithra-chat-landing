import { brand, FRAPPE_API_URL, TENANT_BASE_DOMAIN } from '../config'

const SIGNUP_API = 'nithra_saas.api.signup'
const AUTH_API = 'nithra_saas.api.auth'

export type SignupPayload = {
  company: string
  subdomain: string
  adminEmail: string
  adminName: string
  password: string
  saas_plan?: string
  /** Frappe app names selected on the trial picker */
  apps?: string[]
}

export type PortalOrg = {
  tenant: string
  company: string
  subdomain: string
  status: string
  site_url?: string
  chat_url?: string
  role: string
  apps: string[]
  job_id?: string
}

export type PortalSessionPayload = {
  email: string
  name: string
  status?: string
  token?: string
  orgs: PortalOrg[]
  org?: PortalOrg | null
}

export type SignupResult = {
  ok: boolean
  jobId?: string
  siteUrl?: string
  message?: string
  token?: string
  session?: PortalSessionPayload
}

export type ProvisioningStatus = {
  status: 'pending' | 'creating' | 'ready' | 'failed'
  siteUrl?: string
  chatUrl?: string
  message?: string
  tenant?: string
}

const SESSION_KEY = 'nithra-portal-session'

function signupMethodUrl(method: string, query?: Record<string, string>) {
  const base = `${FRAPPE_API_URL}/api/method/${SIGNUP_API}.${method}`
  if (!query) return base
  const qs = new URLSearchParams(query).toString()
  return `${base}?${qs}`
}

function authMethodUrl(method: string) {
  return `${FRAPPE_API_URL}/api/method/${AUTH_API}.${method}`
}

/** Parse Frappe error JSON into a short user-facing message. */
export async function errorFromResponse(res: Response): Promise<string> {
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

function authHeaders(token?: string | null): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }
  const t = token ?? readStoredToken()
  if (t) {
    // Do NOT send Authorization: Bearer — Frappe 16 treats Bearer as OAuth and
    // returns AuthenticationError before our portal session check runs.
    headers['X-Nithra-Portal-Token'] = t
  }
  return headers
}

export function savePortalSession(session: PortalSessionPayload & { token: string }) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function readPortalSession(): (PortalSessionPayload & { token: string }) | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as PortalSessionPayload & { token?: string }
    if (!parsed?.token || !parsed.email) return null
    return parsed as PortalSessionPayload & { token: string }
  } catch {
    return null
  }
}

export function readStoredToken(): string | null {
  return readPortalSession()?.token ?? null
}

export function clearPortalSession() {
  sessionStorage.removeItem(SESSION_KEY)
}

/**
 * Calls central site to create portal user + tenant + provision.
 * Method: nithra_saas.api.signup.create_tenant
 */
export async function signupTenant(payload: SignupPayload): Promise<SignupResult> {
  const res = await fetch(signupMethodUrl('create_tenant'), {
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
    token: message.token,
    session: message.session,
  }
}

/** Poll provisioning status by public job_id. */
export async function getProvisioningStatus(jobId: string): Promise<ProvisioningStatus> {
  const res = await fetch(signupMethodUrl('get_status', { job_id: jobId }), {
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
    chatUrl: message.chat_url ?? message.chatUrl,
    message: message.message,
    tenant: message.tenant,
  }
}

export async function portalLogin(email: string, password: string): Promise<PortalSessionPayload & { token: string }> {
  const res = await fetch(authMethodUrl('login'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) {
    throw new Error(await errorFromResponse(res))
  }
  const data = await res.json()
  const message = data.message ?? data
  if (!message?.token) {
    throw new Error('Login did not return a session token')
  }
  return message
}

export async function portalLogout(): Promise<void> {
  const token = readStoredToken()
  if (!token || !isApiConfigured()) {
    clearPortalSession()
    return
  }
  try {
    await fetch(authMethodUrl('logout'), {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({}),
    })
  } catch {
    /* ignore */
  }
  clearPortalSession()
}

export async function portalMe(): Promise<PortalSessionPayload> {
  const res = await fetch(authMethodUrl('me'), {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({}),
  })
  if (!res.ok) {
    throw new Error(await errorFromResponse(res))
  }
  const data = await res.json()
  return data.message ?? data
}

export async function listOrgUsers(tenant: string) {
  const res = await fetch(authMethodUrl('list_org_users'), {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ tenant }),
  })
  if (!res.ok) {
    throw new Error(await errorFromResponse(res))
  }
  const data = await res.json()
  return data.message ?? data
}

export async function inviteOrgUser(payload: {
  tenant: string
  email: string
  full_name: string
  role?: string
  apps?: string[]
  password: string
  send_welcome_email?: boolean
}) {
  const res = await fetch(authMethodUrl('invite_user'), {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    throw new Error(await errorFromResponse(res))
  }
  const data = await res.json()
  return data.message ?? data
}

export async function previewInviteRoles(payload: {
  role: string
  apps: string[]
}): Promise<{ frappe_roles: string[]; note?: string }> {
  const res = await fetch(authMethodUrl('preview_invite_roles'), {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    // Fallback local map if API not upgraded yet
    return { frappe_roles: localPreviewRoles(payload.role, payload.apps) }
  }
  const data = await res.json()
  return data.message ?? data
}

/** Mirrors nithra_saas.auth.sync APP_ROLE_MAP for offline / pre-upgrade UI */
export function localPreviewRoles(role: string, apps: string[]): string[] {
  const portalRole = role === 'admin' || role === 'Admin' ? 'Admin' : 'Member'
  const base = portalRole === 'Admin' ? ['System Manager'] : []
  const chat =
    portalRole === 'Admin'
      ? ['Raven User', 'Raven Admin']
      : ['Raven User']
  const out = [...base]
  const keys = new Set((apps || []).map((a) => a.toLowerCase()))
  if (keys.has('raven') || keys.has('chat') || keys.has('nithra-chat')) {
    out.push(...chat)
  }
  return [...new Set(out)]
}

export async function setOrgUserStatus(payload: {
  tenant: string
  membership_id: string
  status: 'Active' | 'Disabled' | 'active' | 'disabled'
}) {
  const res = await fetch(authMethodUrl('set_org_user_status'), {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    throw new Error(await errorFromResponse(res))
  }
  const data = await res.json()
  return data.message ?? data
}

export async function syncOrgUser(payload: { tenant: string; membership_id: string }) {
  const res = await fetch(authMethodUrl('sync_org_user'), {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    throw new Error(await errorFromResponse(res))
  }
  const data = await res.json()
  return data.message ?? data
}

/** Resolve where an existing customer should go (email → tenant site). */
export async function resolveWorkspace(email: string): Promise<{ siteUrl: string; chatUrl?: string } | null> {
  const res = await fetch(signupMethodUrl('resolve_workspace', { email }), {
    headers: { Accept: 'application/json' },
  })

  if (!res.ok) return null

  const data = await res.json()
  const message = data.message ?? data
  if (!message?.site_url && !message?.siteUrl) return null
  return {
    siteUrl: message.site_url ?? message.siteUrl,
    chatUrl: message.chat_url ?? message.chatUrl,
  }
}

export function tenantUrlFromSubdomain(subdomain: string): string {
  return `https://${subdomain}.${TENANT_BASE_DOMAIN}`
}

/** Fallback only (demo / SSO unavailable). Prefer getAppHandoff. */
export function chatLoginUrl(siteUrl: string): string {
  return `${siteUrl.replace(/\/$/, '')}/raven/login`
}

/**
 * Portal SSO: one-time URL that logs into the tenant site and opens Chat/CRM/Desk.
 * Method: nithra_saas.api.auth.get_app_handoff
 */
export async function getAppHandoff(opts: {
  tenant: string
  app?: string
  path?: string
}): Promise<{ handoffUrl: string; redirectPath?: string; siteUrl?: string }> {
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), 45000)
  try {
    const res = await fetch(authMethodUrl('get_app_handoff'), {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        tenant: opts.tenant,
        app: opts.app || 'raven',
        path: opts.path,
        portal_token: readStoredToken(),
      }),
      signal: controller.signal,
    })
    if (!res.ok) {
      throw new Error(await errorFromResponse(res))
    }
    const data = await res.json()
    const message = data.message ?? data
    const handoffUrl = message.handoff_url ?? message.handoffUrl
    if (!handoffUrl) {
      throw new Error('Handoff did not return a URL')
    }
    return {
      handoffUrl,
      redirectPath: message.redirect_path ?? message.redirectPath,
      siteUrl: message.site_url ?? message.siteUrl,
    }
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') {
      throw new Error(
        'Open app timed out — try again (or Sync the user on Manage users first).',
      )
    }
    throw e
  } finally {
    window.clearTimeout(timer)
  }
}

export function isApiConfigured(): boolean {
  return !FRAPPE_API_URL.includes('your-central-site')
}

export { brand }
