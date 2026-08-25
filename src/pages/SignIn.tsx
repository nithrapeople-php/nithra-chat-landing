import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { TENANT_BASE_DOMAIN } from '../config'
import { isApiConfigured, resolveWorkspace, tenantUrlFromSubdomain } from '../lib/api'
import './Form.css'
import './Page.css'

export function SignIn() {
  const [mode, setMode] = useState<'subdomain' | 'email'>('subdomain')
  const [subdomain, setSubdomain] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'subdomain') {
        const url = tenantUrlFromSubdomain(subdomain.trim().toLowerCase())
        window.location.href = url
        return
      }

      if (!isApiConfigured()) {
        setError('Email lookup needs VITE_FRAPPE_API_URL. Use subdomain for now.')
        return
      }

      const result = await resolveWorkspace(email.trim().toLowerCase())
      if (!result?.siteUrl) {
        setError('No workspace found for that email.')
        return
      }
      window.location.href = result.siteUrl
    } catch {
      setError('Could not find your workspace. Try subdomain instead.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="page page--narrow">
      <div className="page__intro">
        <p className="eyebrow">Sign in</p>
        <h1>Go to your workspace</h1>
        <p className="lede">
          Jump straight to your tenant site. Login happens on your Frappe
          workspace.
        </p>
      </div>

      <div className="form__tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'subdomain'}
          className={mode === 'subdomain' ? 'is-active' : ''}
          onClick={() => setMode('subdomain')}
        >
          Subdomain
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'email'}
          className={mode === 'email' ? 'is-active' : ''}
          onClick={() => setMode('email')}
        >
          Email lookup
        </button>
      </div>

      <form className="form" onSubmit={onSubmit}>
        {mode === 'subdomain' ? (
          <label>
            Workspace subdomain
            <div className="form__subdomain">
              <input
                required
                value={subdomain}
                onChange={(e) =>
                  setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))
                }
                placeholder="acme"
              />
              <span>.{TENANT_BASE_DOMAIN}</span>
            </div>
          </label>
        ) : (
          <label>
            Work email
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              autoComplete="email"
            />
          </label>
        )}

        {error && <p className="form__error">{error}</p>}

        <button className="btn btn--primary" type="submit" disabled={loading}>
          {loading ? 'Looking up…' : 'Continue'}
        </button>
      </form>

      <p className="form__footer-note">
        New team? <Link to="/signup">Create a workspace</Link>
      </p>
    </section>
  )
}
