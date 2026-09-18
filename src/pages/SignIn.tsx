import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { brand, TENANT_BASE_DOMAIN } from '../config'
import { isApiConfigured, portalLogin } from '../lib/api'
import {
  defaultMockSession,
  persistApiSession,
  saveDemoSession,
} from '../lib/portalSession'
import {
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

export function SignIn() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [subdomain, setSubdomain] = useState('')
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function enterDemo(persona?: DemoPersona, nextEmail?: string) {
    if (persona) {
      saveDemoSession(
        defaultMockSession(persona.email, {
          role: persona.role,
          planId: persona.planId,
          appIds: persona.appIds,
          subdomain: subdomain.trim() || 'acme',
        }),
      )
    } else {
      saveDemoSession(
        defaultMockSession(nextEmail || 'ada@acme.com', {
          subdomain: subdomain.trim() || 'acme',
        }),
      )
    }
    navigate('/home')
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    const trimmed = email.trim().toLowerCase()
    if (!trimmed || !trimmed.includes('@')) {
      setError('Enter a valid work email.')
      return
    }
    if (!password) {
      setError('Enter your password.')
      return
    }

    if (!isApiConfigured()) {
      enterDemo(undefined, trimmed)
      return
    }

    setLoading(true)
    try {
      const session = await portalLogin(trimmed, password)
      persistApiSession(session)
      navigate('/home')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="page page--narrow signin">
      <div className="signin__card">
        <div className="page__intro signin__intro">
          <p className="eyebrow">Sign in</p>
          <h1>Welcome back</h1>
          <p className="lede">
            Enter your work email and password to open {brand.name}. You don’t need a site name.
          </p>
        </div>

        {!isApiConfigured() && (
          <div className="signin__demos" aria-label="Demo personas">
            <p className="signin__demos-label">Quick demo (API not configured)</p>
            <div className="signin__demo-row">
              {PERSONAS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className="signin__demo"
                  onClick={() => enterDemo(p)}
                  title={p.blurb}
                >
                  <span className="signin__demo-title">{p.label}</span>
                  <span className="signin__demo-blurb">{p.blurb}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <form className="form signin__form" onSubmit={onSubmit} noValidate>
          <label>
            Work email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              autoComplete="username"
              required
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
                required={isApiConfigured()}
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

          {error && (
            <p className="form__error" role="alert">
              {error}
            </p>
          )}

          <button className="btn btn--primary signin__submit" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        {!isApiConfigured() && (
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
                <p className="form__hint">Optional mock subdomain for the design preview.</p>
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
        )}

        <p className="form__footer-note signin__footer">
          New team? <Link to="/signup">Create a workspace</Link>
        </p>
      </div>
    </section>
  )
}
