import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { TENANT_BASE_DOMAIN } from '../config'
import { isApiConfigured, signupTenant } from '../lib/api'
import './Form.css'
import './Page.css'

export function SignUp() {
  const navigate = useNavigate()
  const [company, setCompany] = useState('')
  const [subdomain, setSubdomain] = useState('')
  const [adminName, setAdminName] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const payload = {
      company: company.trim(),
      subdomain: subdomain.trim().toLowerCase(),
      adminName: adminName.trim(),
      adminEmail: adminEmail.trim().toLowerCase(),
    }

    try {
      if (!isApiConfigured()) {
        // Local / pre-API mode: still exercise the provisioning UX
        const fakeJob = `local-${payload.subdomain}-${Date.now()}`
        navigate(`/provisioning?job=${encodeURIComponent(fakeJob)}&subdomain=${encodeURIComponent(payload.subdomain)}`)
        return
      }

      const result = await signupTenant(payload)
      const job = result.jobId || payload.subdomain
      navigate(
        `/provisioning?job=${encodeURIComponent(job)}&subdomain=${encodeURIComponent(payload.subdomain)}`,
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="page page--narrow">
      <div className="page__intro">
        <p className="eyebrow">Sign up</p>
        <h1>Create your workspace</h1>
        <p className="lede">
          Company + admin email. We’ll provision a Frappe site for your team.
        </p>
      </div>

      <form className="form" onSubmit={onSubmit}>
        <label>
          Company name
          <input
            required
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Acme Inc"
            autoComplete="organization"
          />
        </label>

        <label>
          Workspace subdomain
          <div className="form__subdomain">
            <input
              required
              pattern="[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?"
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

        <label>
          Admin name
          <input
            required
            value={adminName}
            onChange={(e) => setAdminName(e.target.value)}
            placeholder="Alex Rivera"
            autoComplete="name"
          />
        </label>

        <label>
          Admin email
          <input
            required
            type="email"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            placeholder="alex@acme.com"
            autoComplete="email"
          />
        </label>

        {!isApiConfigured() && (
          <p className="form__hint">
            API not configured yet — submit will open the provisioning screen in
            demo mode. Set <code>VITE_FRAPPE_API_URL</code> when your central
            site is ready.
          </p>
        )}

        {error && <p className="form__error">{error}</p>}

        <button className="btn btn--primary" type="submit" disabled={loading}>
          {loading ? 'Creating…' : 'Create workspace'}
        </button>
      </form>
    </section>
  )
}
