/** Portal session helpers — real API when configured, mock fallback for design demos. */

import {
  clearPortalSession,
  isApiConfigured,
  readPortalSession,
  savePortalSession,
  type PortalOrg,
  type PortalSessionPayload,
} from '../lib/api'
import {
  ALL_APPS,
  MOCK_SESSION_KEY,
  PLAN_APPS,
  clearMockSession,
  defaultMockSession,
  readMockSession,
  saveMockSession,
  type PortalPlanId,
  type PortalRole,
  type PortalSession,
} from '../data/portalMock'

export type UnifiedSession = {
  email: string
  name: string
  role: PortalRole
  orgName: string
  subdomain: string
  planId: PortalPlanId
  appIds: string[]
  tenantStatus: string
  siteUrl?: string
  chatUrl?: string
  jobId?: string
  tenant?: string
  token?: string
  isMock: boolean
}

function orgToSession(payload: PortalSessionPayload & { token?: string }): UnifiedSession | null {
  const org = payload.org || payload.orgs?.[0]
  if (!org) {
    return {
      email: payload.email,
      name: payload.name,
      role: 'member',
      orgName: 'No workspace',
      subdomain: '',
      planId: 'chat',
      appIds: [],
      tenantStatus: 'Pending',
      token: payload.token,
      isMock: false,
    }
  }
  const appIds = (org.apps || []).filter((a) => a && a !== 'frappe')
  const planId: PortalPlanId = appIds.includes('crm') ? 'suite' : 'chat'
  return {
    email: payload.email,
    name: payload.name,
    role: (org.role || 'member').toLowerCase() as PortalRole,
    orgName: org.company,
    subdomain: org.subdomain,
    planId,
    appIds: appIds.length ? appIds : ['raven'],
    tenantStatus: org.status,
    siteUrl: org.site_url,
    chatUrl: org.chat_url,
    jobId: org.job_id,
    tenant: org.tenant,
    token: payload.token,
    isMock: false,
  }
}

export function readUnifiedSession(): UnifiedSession | null {
  const real = readPortalSession()
  if (real) {
    return orgToSession(real)
  }
  if (!isApiConfigured()) {
    const mock = readMockSession()
    if (!mock) return null
    return {
      ...mock,
      tenantStatus: 'Active',
      siteUrl: `https://${mock.subdomain}.nithrateams.com`,
      chatUrl: `https://${mock.subdomain}.nithrateams.com/raven/login`,
      isMock: true,
    }
  }
  return null
}

export function persistApiSession(payload: PortalSessionPayload & { token: string }) {
  savePortalSession(payload)
  // Clear legacy mock so layout doesn't prefer it
  clearMockSession()
}

export function clearUnifiedSession() {
  clearPortalSession()
  clearMockSession()
  try {
    sessionStorage.removeItem(MOCK_SESSION_KEY)
  } catch {
    /* ignore */
  }
}

export function appsForUnified(session: UnifiedSession) {
  const entitled = new Set(session.appIds)
  const planSet = new Set(PLAN_APPS[session.planId] || session.appIds)
  return ALL_APPS.map((app) => ({
    ...app,
    entitled: entitled.has(app.id),
    onPlan: planSet.has(app.id) || entitled.has(app.id),
  }))
}

export function saveDemoSession(session: PortalSession) {
  saveMockSession(session)
}

export { defaultMockSession }
export type { PortalOrg, PortalSession }
