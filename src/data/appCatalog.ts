/** Apps shown on the Odoo-style trial / signup picker. */
export type CatalogApp = {
  id: string
  /** Frappe app name installed on tenant sites */
  appName: string
  label: string
  description: string
  category: string
  /** Always installed; cannot be unchecked */
  required?: boolean
}

export const APP_CATALOG: CatalogApp[] = [
  {
    id: 'chat',
    appName: 'raven',
    label: 'Nithra Chat',
    description: 'Channels, DMs, calls, and team collaboration.',
    category: 'Productivity',
    required: true,
  },
  {
    id: 'hr',
    appName: 'hrms',
    label: 'HR & Payroll',
    description: 'Employees, leave, attendance, and payroll basics.',
    category: 'Human Resources',
  },
  {
    id: 'crm',
    appName: 'crm',
    label: 'CRM',
    description: 'Leads, deals, and customer pipeline.',
    category: 'Sales',
  },
  {
    id: 'helpdesk',
    appName: 'helpdesk',
    label: 'Helpdesk',
    description: 'Support tickets and customer service queues.',
    category: 'Services',
  },
  {
    id: 'insights',
    appName: 'insights',
    label: 'Insights',
    description: 'Dashboards and business intelligence.',
    category: 'Productivity',
  },
]

export function defaultSelectedAppIds(): string[] {
  return APP_CATALOG.filter((a) => a.required).map((a) => a.id)
}

export function appNamesFromIds(ids: string[]): string[] {
  const set = new Set(ids)
  return APP_CATALOG.filter((a) => set.has(a.id)).map((a) => a.appName)
}

export function catalogByCategory(): { category: string; apps: CatalogApp[] }[] {
  const order: string[] = []
  const map = new Map<string, CatalogApp[]>()
  for (const app of APP_CATALOG) {
    if (!map.has(app.category)) {
      order.push(app.category)
      map.set(app.category, [])
    }
    map.get(app.category)!.push(app)
  }
  return order.map((category) => ({ category, apps: map.get(category)! }))
}
