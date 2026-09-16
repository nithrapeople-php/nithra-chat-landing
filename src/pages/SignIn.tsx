import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { brand, TENANT_BASE_DOMAIN } from '../config'
import { defaultMockSession, saveMockSession } from '../data/portalMock'
import './Form.css'
import './Page.css'
import './SignIn.css'

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

  function enterPortal(nextEmail?: string) {
    saveMockSession(defaultMockSession(nextEmail))
    navigate('/home')
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    window.setTimeout(() => {
      if (advancedOpen && subdomain.trim()) {
        const session = defaultMockSession(email || undefined)
        session.subdomain = subdomain.trim().toLowerCase()
        saveMockSession(session)
        setLoading(false)
        navigate('/home')
        return
      }

      const trimmed = email.trim()
      // Design: empty email → demo user so Continue always works for click-through
      if (trimmed && !trimmed.includes('@')) {
        setLoading(false)
        setError('Enter a valid work email, or leave blank to preview as ada@acme.com.')
        return
      }

      setLoading(false)
      enterPortal(trimmed || 'ada@acme.com')
    }, 350)
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

        <form className="form signin__form" onSubmit={onSubmit} noValidate>
          <label>
            Work email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              autoComplete="username"
              autoFocus
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
            Design mock — Continue opens the portal home preview. No server calls.
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
              <p className="form__hint">
                Optional mock subdomain for the org (still opens portal home only).
              </p>
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
