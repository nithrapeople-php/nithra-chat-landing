import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { brand, TENANT_BASE_DOMAIN } from '../config'
import {
  defaultMockSession,
  saveMockSession,
  type PortalPlanId,
  type PortalRole,
} from '../data/portalMock'
import './Form.css'
import './Page.css'
import './SignIn.css'

type DemoPersona = {
  id: string
  label: string
  email: string
  role: PortalRole
  planId: PortalPlanId
  appIds: string[]
  blurb: string
}

const PERSONAS: DemoPersona[] = [
  {
    id: 'owner',
    label: 'Ada · Owner',
    email: 'ada@acme.com',
    role: 'owner',
    planId: 'suite',
    appIds: ['raven', 'crm'],
    blurb: 'Chat + CRM, can manage users',
  },
  {
    id: 'member',
    label: 'Sam · Member',
    email: 'sam@acme.com',
    role: 'member',
    planId: 'suite',
    appIds: ['raven'],
    blurb: 'Chat only, no user admin',
  },
  {
    id: 'chat-plan',
    label: 'Ada · Chat plan',
    email: 'ada@acme.com',
    role: 'owner',
    planId: 'chat',
    appIds: ['raven'],
    blurb: 'Only Chat on the plan',
  },
]

/** Design mock — no API. Continue → /home */
export function SignIn() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [subdomain, setSubdomain] = useState('')
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function enterAs(persona?: DemoPersona, nextEmail?: string) {
    if (persona) {
      saveMockSession(
        defaultMockSession(persona.email, {
          role: persona.role,
          planId: persona.planId,
          appIds: persona.appIds,
          subdomain: subdomain.trim() || 'acme',
        }),
      )
    } else {
      saveMockSession(
        defaultMockSession(nextEmail || 'ada@acme.com', {
          subdomain: subdomain.trim() || 'acme',
        }),
      )
    }
    navigate('/home')
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    window.setTimeout(() => {
      const trimmed = email.trim()
      if (trimmed && !trimmed.includes('@')) {
        setLoading(false)
        setError('Enter a valid work email, pick a demo persona, or leave blank for Ada.')
        return
      }
      setLoading(false)
      enterAs(undefined, trimmed || 'ada@acme.com')
    }, 280)
  }

  return (
    <section className="page page--narrow signin">
      <div className="signin__card">
        <div className="page__intro signin__intro">
          <p className="eyebrow">Sign in</p>
          <h1>Welcome back</h1>
          <p className="lede">
            Enter your work email to open {brand.name}. You don’t need to remember a site name.
          </p>
        </div>

        <div className="signin__demos" aria-label="Demo personas">
          <p className="signin__demos-label">Quick demo</p>
          <div className="signin__demo-row">
            {PERSONAS.map((p) => (
              <button
                key={p.id}
                type="button"
                className="signin__demo"
                onClick={() => enterAs(p)}
                title={p.blurb}
              >
                <span className="signin__demo-title">{p.label}</span>
                <span className="signin__demo-blurb">{p.blurb}</span>
              </button>
            ))}
          </div>
        </div>

        <form className="form signin__form" onSubmit={onSubmit} noValidate>
          <label>
            Work email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              autoComplete="username"
            />
          </label>

          <label>
            Password
            <div className="signin__password">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="signin__toggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </label>
          <p className="form__hint signin__hint">
            Design mock — no server. Continue or use a demo persona above.
          </p>

          {error && (
            <p className="form__error" role="alert">
              {error}
            </p>
          )}

          <button className="btn btn--primary signin__submit" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Continue'}
          </button>
        </form>

        <div className="signin__advanced">
          <button
            type="button"
            className="signin__advanced-toggle"
            aria-expanded={advancedOpen}
            onClick={() => setAdvancedOpen((o) => !o)}
          >
            {advancedOpen ? 'Hide advanced' : 'Advanced — use workspace subdomain'}
          </button>

          {advancedOpen && (
            <div className="signin__advanced-body">
              <p className="form__hint">Optional mock subdomain stored on the preview session.</p>
              <label>
                Workspace subdomain
                <div className="form__subdomain">
                  <input
                    value={subdomain}
                    onChange={(e) =>
                      setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))
                    }
                    placeholder="acme"
                    autoComplete="off"
                  />
                  <span>.{TENANT_BASE_DOMAIN}</span>
                </div>
              </label>
            </div>
          )}
        </div>

        <p className="form__footer-note signin__footer">
          New team? <Link to="/signup">Create a workspace</Link>
        </p>
      </div>
    </section>
  )
}
