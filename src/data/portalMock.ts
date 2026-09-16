/** Mock data for portal design (D0–D3). Replace with APIs later. */

export type PortalRole = 'owner' | 'admin' | 'member'

export type PortalApp = {
  id: string
  label: string
  description: string
  path: string
}

export type PortalUser = {
  id: string
  name: string
  email: string
  role: PortalRole
  apps: string[]
  status: 'active' | 'invited' | 'disabled'
}

export type PortalPlanId = 'chat' | 'suite'

export type PortalSession = {
  email: string
  name: string
  role: PortalRole
  orgName: string
  subdomain: string
  /** Which apps the org plan includes */
  planId: PortalPlanId
  /** Apps this user may open */
  appIds: string[]
}

export const MOCK_SESSION_KEY = 'nithra-portal-mock'

/** Frappe / Nithra apps that can appear on home (entitled or Unavailable). */
export const ALL_APPS: PortalApp[] = [
  {
    id: 'raven',
    label: 'Nithra Chat',
    description: 'Channels, DMs, calls, and team collaboration.',
    path: '/raven',
  },
  {
    id: 'crm',
    label: 'CRM',
    description: 'Leads, deals, and customer pipeline.',
    path: '/crm',
  },
  {
    id: 'hrms',
    label: 'HR & Payroll',
    description: 'Employees, leave, attendance, and payroll.',
    path: '/hrms',
  },
  {
    id: 'helpdesk',
    label: 'Helpdesk',
    description: 'Support tickets and customer service queues.',
    path: '/helpdesk',
  },
  {
    id: 'insights',
    label: 'Insights',
    description: 'Dashboards and business intelligence.',
    path: '/insights',
  },
  {
    id: 'erpnext',
    label: 'ERPNext',
    description: 'Accounting, inventory, buying, and selling.',
    path: '/app',
  },
  {
    id: 'wiki',
    label: 'Wiki',
    description: 'Team knowledge base and documentation.',
    path: '/wiki',
  },
  {
    id: 'lend',
    label: 'Lending',
    description: 'Loan products, applications, and repayments.',
    path: '/lending',
  },
  {
    id: 'education',
    label: 'Education',
    description: 'Students, courses, fees, and admissions.',
    path: '/education',
  },
  {
    id: 'healthcare',
    label: 'Healthcare',
    description: 'Patients, appointments, and clinical workflows.',
    path: '/healthcare',
  },
  {
    id: 'builder',
    label: 'Builder',
    description: 'No-code pages and website builder.',
    path: '/builder',
  },
  {
    id: 'gameplan',
    label: 'Gameplan',
    description: 'Projects, discussions, and team planning.',
    path: '/g',
  },
]

export const PLAN_APPS: Record<PortalPlanId, string[]> = {
  chat: ['raven'],
  suite: ['raven', 'crm'],
}

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

export const MOCK_SEATS = { limit: 10 }

export type PortalPlan = {
  id: PortalPlanId
  name: string
  priceLabel: string
  priceNote: string
  seats: number
  apps: string[]
  features: string[]
}

export const PORTAL_PLANS: PortalPlan[] = [
  {
    id: 'chat',
    name: 'Chat',
    priceLabel: '$8',
    priceNote: 'per user / month',
    seats: 10,
    apps: ['raven'],
    features: [
      'Nithra Chat for your team',
      '10 seats included',
      'Email support',
      'Workspace subdomain',
    ],
  },
  {
    id: 'suite',
    name: 'Suite',
    priceLabel: '$18',
    priceNote: 'per user / month',
    seats: 25,
    apps: ['raven', 'crm'],
    features: [
      'Chat + CRM',
      '25 seats included',
      'Priority support',
      'Custom domain ready',
      'Central portal user admin',
    ],
  },
]

export type MockInvoice = {
  id: string
  date: string
  amount: string
  status: 'paid' | 'open' | 'failed'
}

export const MOCK_INVOICES: MockInvoice[] = [
  { id: 'inv_1092', date: '1 Sep 2026', amount: '$180.00', status: 'paid' },
  { id: 'inv_1044', date: '1 Aug 2026', amount: '$180.00', status: 'paid' },
  { id: 'inv_0998', date: '1 Jul 2026', amount: '$144.00', status: 'paid' },
]

export const MOCK_BILLING = {
  seatsUsed: 2,
  nextRenewal: '1 Oct 2026',
  paymentMethod: 'Visa ···· 4242',
  billingEmail: 'billing@acme.com',
}

export function planById(id: PortalPlanId): PortalPlan {
  return PORTAL_PLANS.find((p) => p.id === id) || PORTAL_PLANS[0]
}

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

export function appsForSession(session: PortalSession) {
  const planSet = new Set(PLAN_APPS[session.planId] || [])
  return ALL_APPS.map((app) => ({
    ...app,
    entitled: planSet.has(app.id) && session.appIds.includes(app.id),
    onPlan: planSet.has(app.id),
  }))
}

export function defaultMockSession(
  email?: string,
  overrides?: Partial<PortalSession>,
): PortalSession {
  const e = (email || 'ada@acme.com').trim().toLowerCase() || 'ada@acme.com'
  const known = MOCK_USERS.find((u) => u.email === e)
  const planId: PortalPlanId = overrides?.planId || 'suite'
  const role = overrides?.role || known?.role || 'admin'
  const appIds =
    overrides?.appIds ||
    known?.apps ||
    (role === 'member' ? ['raven'] : PLAN_APPS[planId])

  return {
    email: e,
    name: overrides?.name || known?.name || e.split('@')[0] || 'You',
    role,
    orgName: overrides?.orgName || 'Acme',
    subdomain: overrides?.subdomain || 'acme',
    planId,
    appIds,
  }
}
