import { useMemo, useState } from 'react'
import {
  ALL_APPS,
  MOCK_BILLING,
  MOCK_INVOICES,
  PORTAL_PLANS,
  planById,
  saveMockSession,
  type PortalPlanId,
} from '../data/portalMock'
import { readUnifiedSession } from '../lib/portalSession'
import './Page.css'
import './PortalHome.css'
import './PortalBilling.css'

export function PortalBilling() {
  const session = readUnifiedSession()!
  const canManage = session.role === 'owner' || session.role === 'admin'
  const [planId, setPlanId] = useState<PortalPlanId>(session.planId)
  const [note, setNote] = useState('')

  const current = useMemo(() => planById(planId), [planId])
  const seatsUsed = MOCK_BILLING.seatsUsed
  const seatPct = Math.min(100, Math.round((seatsUsed / current.seats) * 100))

  if (!canManage) {
    return (
      <section className="page page--wide portal">
        <div className="portal__empty">
          <p>Billing is only available to owners and admins.</p>
          <p className="portal__empty-hint">Ask your workspace owner, or use the Ada demo persona.</p>
        </div>
      </section>
    )
  }

  function selectPlan(id: PortalPlanId) {
    setPlanId(id)
    if (session.isMock) {
      saveMockSession({
        email: session.email,
        name: session.name,
        role: session.role,
        orgName: session.orgName,
        subdomain: session.subdomain,
        planId: id,
        appIds:
          session.role === 'member'
            ? session.appIds.filter((a) => (id === 'chat' ? a === 'raven' : true))
            : id === 'chat'
              ? ['raven']
              : ['raven', 'crm'],
      })
    }
    setNote(
      id === session.planId
        ? ''
        : `Design preview — switched mock plan to ${planById(id).name}. Not billed.`,
    )
  }

  return (
    <section className="page page--wide portal">
      <header className="portal__top">
        <div>
          <p className="eyebrow">Billing</p>
          <h1>Plan & billing</h1>
          <p className="lede portal__lede">
            Design mock — change plans locally; no payment API yet.
          </p>
        </div>
      </header>

      {note && <p className="portal__banner">{note}</p>}

      <div className="billing__current">
        <div className="billing__current-main">
          <p className="billing__label">Current plan</p>
          <h2 className="billing__plan-name">{current.name}</h2>
          <p className="billing__price">
            <strong>{current.priceLabel}</strong>
            <span> {current.priceNote}</span>
          </p>
          <p className="billing__renew">Renews {MOCK_BILLING.nextRenewal}</p>
        </div>
        <div className="billing__usage">
          <div className="billing__usage-head">
            <span>Seats</span>
            <strong>
              {seatsUsed} / {current.seats}
            </strong>
          </div>
          <div className="billing__bar" aria-hidden>
            <span style={{ width: `${seatPct}%` }} />
          </div>
          <ul className="billing__meta">
            <li>
              <span>Payment</span>
              <strong>{MOCK_BILLING.paymentMethod}</strong>
            </li>
            <li>
              <span>Billing email</span>
              <strong>{MOCK_BILLING.billingEmail}</strong>
            </li>
            <li>
              <span>Apps included</span>
              <strong>
                {current.apps
                  .map((id) => ALL_APPS.find((a) => a.id === id)?.label || id)
                  .join(', ')}
              </strong>
            </li>
          </ul>
        </div>
      </div>

      <h2 className="portal__section-title">Plan details</h2>
      <div className="billing__plans">
        {PORTAL_PLANS.map((plan) => {
          const active = plan.id === planId
          return (
            <article
              key={plan.id}
              className={`billing-plan${active ? ' billing-plan--active' : ''}`}
            >
              <div className="billing-plan__head">
                <h3>{plan.name}</h3>
                {active && <span className="billing-plan__badge">Current</span>}
              </div>
              <p className="billing-plan__price">
                <strong>{plan.priceLabel}</strong>
                <span> {plan.priceNote}</span>
              </p>
              <p className="billing-plan__seats">{plan.seats} seats included</p>
              <ul className="billing-plan__features">
                {plan.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <button
                type="button"
                className={`btn ${active ? 'btn--ghost' : 'btn--primary'}`}
                disabled={active}
                onClick={() => selectPlan(plan.id)}
              >
                {active ? 'Selected' : plan.id === 'suite' ? 'Upgrade to Suite' : 'Switch to Chat'}
              </button>
            </article>
          )
        })}
      </div>

      <h2 className="portal__section-title portal__section-title--spaced">Invoices</h2>
      <div className="billing__invoices">
        <table className="billing__table">
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {MOCK_INVOICES.map((inv) => (
              <tr key={inv.id}>
                <td data-label="Invoice">{inv.id}</td>
                <td data-label="Date">{inv.date}</td>
                <td data-label="Amount">{inv.amount}</td>
                <td data-label="Status">
                  <span className={`billing__status billing__status--${inv.status}`}>
                    {inv.status}
                  </span>
                </td>
                <td data-label="">
                  <button
                    type="button"
                    className="linkish"
                    onClick={() =>
                      window.alert(`Design preview — download ${inv.id} (not wired).`)
                    }
                  >
                    Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
