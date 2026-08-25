import { Link } from 'react-router-dom'
import './Page.css'

const plans = [
  {
    name: 'Starter',
    price: 'Free trial',
    detail: '30 days to evaluate with your core team.',
    cta: 'Start free',
    to: '/signup',
    highlight: false,
  },
  {
    name: 'Team',
    price: 'Contact us',
    detail: 'Channels, calls, and admin controls for growing orgs.',
    cta: 'Talk to sales',
    to: '/contact',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    detail: 'Dedicated support, retention policies, and SSO-ready paths.',
    cta: 'Contact us',
    to: '/contact',
    highlight: false,
  },
]

export function Pricing() {
  return (
    <section className="page">
      <div className="page__intro">
        <p className="eyebrow">Pricing</p>
        <h1>Simple plans. Start when you’re ready.</h1>
        <p className="lede">
          Begin with a trial workspace. Upgrade when your team is settled —
          we’ll confirm pricing on a short call for now.
        </p>
      </div>

      <div className="pricing-grid">
        {plans.map((plan) => (
          <article
            key={plan.name}
            className={`pricing-plan${plan.highlight ? ' pricing-plan--hot' : ''}`}
          >
            <h2>{plan.name}</h2>
            <p className="pricing-plan__price">{plan.price}</p>
            <p className="pricing-plan__detail">{plan.detail}</p>
            <Link
              to={plan.to}
              className={`btn ${plan.highlight ? 'btn--primary' : 'btn--ghost'}`}
            >
              {plan.cta}
            </Link>
          </article>
        ))}
      </div>
    </section>
  )
}
