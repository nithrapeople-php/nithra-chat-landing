/** Mock data for portal design (D0–D2). Replace with APIs later. */

export type PortalRole = 'owner' | 'admin' | 'member'

export type PortalApp = {
  id: string
  label: string
  description: string
  path: string
  /** On plan for this mock org */
  entitled: boolean
}

export type PortalUser = {
  id: string
  name: string
  email: string
  role: PortalRole
  apps: string[]
  status: 'active' | 'invited' | 'disabled'
}

export type PortalSession = {
  email: string
  name: string
  role: PortalRole
  orgName: string
  subdomain: string
}

export const MOCK_SESSION_KEY = 'nithra-portal-mock'

export const MOCK_APPS: PortalApp[] = [
  {
    id: 'raven',
    label: 'Nithra Chat',
    description: 'Channels, DMs, and team collaboration.',
    path: '/raven',
    entitled: true,
  },
  {
    id: 'crm',
    label: 'CRM',
    description: 'Leads, deals, and pipeline.',
    path: '/crm',
    entitled: true,
  },
  {
    id: 'hrms',
    label: 'HR & Payroll',
    description: 'Leave, attendance, and people basics.',
    path: '/hrms',
    entitled: false,
  },
]

export const MOCK_USERS: PortalUser[] = [
  {
    id: '1',
    name: 'Ada Admin',
    email: 'ada@acme.com',
    role: 'owner',
    apps: ['raven', 'crm'],
    status: 'active',
  },
  {
    id: '2',
    name: 'Sam Member',
    email: 'sam@acme.com',
    role: 'member',
    apps: ['raven'],
    status: 'active',
  },
  {
    id: '3',
    name: 'Jamie Invite',
    email: 'jamie@acme.com',
    role: 'member',
    apps: ['raven'],
    status: 'invited',
  },
]

export const MOCK_SEATS = { used: 2, limit: 10 }

export function saveMockSession(session: PortalSession) {
  sessionStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(session))
}

export function readMockSession(): PortalSession | null {
  try {
    const raw = sessionStorage.getItem(MOCK_SESSION_KEY)
    if (!raw) return null
    return JSON.parse(raw) as PortalSession
  } catch {
    return null
  }
}

export function clearMockSession() {
  sessionStorage.removeItem(MOCK_SESSION_KEY)
}

export function defaultMockSession(email?: string): PortalSession {
  const e = (email || 'ada@acme.com').trim().toLowerCase() || 'ada@acme.com'
  const known = MOCK_USERS.find((u) => u.email === e)
  return {
    email: e,
    name: known?.name || e.split('@')[0] || 'You',
    role: known?.role || 'admin',
    orgName: 'Acme',
    subdomain: 'acme',
  }
}
