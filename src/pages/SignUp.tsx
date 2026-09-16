import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { TENANT_BASE_DOMAIN } from '../config'
import {
  APP_CATALOG,
  appNamesFromIds,
  catalogByCategory,
  defaultSelectedAppIds,
} from '../data/appCatalog'
import { isApiConfigured, type SignupPayload } from '../lib/api'
import './Form.css'
import './Page.css'
import './SignUp.css'

type Step = 'apps' | 'details'

const SIGNUP_STORAGE_PREFIX = 'nithra-signup:'

export function SignUp() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('apps')
  const [selectedIds, setSelectedIds] = useState<string[]>(() => defaultSelectedAppIds())
  const [company, setCompany] = useState('')
  const [subdomain, setSubdomain] = useState('')
  const [adminName, setAdminName] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [error, setError] = useState('')

  const groups = useMemo(() => catalogByCategory(), [])
  const selectedApps = useMemo(
    () => APP_CATALOG.filter((a) => selectedIds.includes(a.id)),
    [selectedIds],
  )

  function toggleApp(id: string, required?: boolean) {
    if (required) return
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  function continueToDetails() {
    setError('')
    if (selectedIds.length === 0) {
      setError('Select at least one app to continue.')
      return
    }
    setStep('details')
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    const payload: SignupPayload = {
      company: company.trim(),
      subdomain: subdomain.trim().toLowerCase(),
      adminName: adminName.trim(),
      adminEmail: adminEmail.trim().toLowerCase(),
      apps: appNamesFromIds(selectedIds),
    }

    if (!payload.company || !payload.subdomain || !payload.adminName || !payload.adminEmail) {
      setError('Please fill in all fields.')
      return
    }

    if (!isApiConfigured()) {
      const fakeJob = `local-${payload.subdomain}-${Date.now()}`
      navigate(
        `/provisioning?job=${encodeURIComponent(fakeJob)}&subdomain=${encodeURIComponent(payload.subdomain)}`,
      )
      return
    }

    // Redirect immediately; Provisioning page creates the tenant + polls.
    try {
      sessionStorage.setItem(`${SIGNUP_STORAGE_PREFIX}${payload.subdomain}`, JSON.stringify(payload))
    } catch {
      /* private mode — location.state still works for this navigation */
    }

    navigate(`/provisioning?subdomain=${encodeURIComponent(payload.subdomain)}`, {
      state: { signup: payload },
    })
  }

  if (step === 'apps') {
    return (
      <section className="page page--wide">
        <div className="page__intro">
          <p className="eyebrow">Get started</p>
          <h1>Choose your apps</h1>
          <p className="lede">
            Free trial — pick the apps your team needs. You can change this later.
          </p>
        </div>

        <div className="app-picker">
          {groups.map(({ category, apps }) => (
            <div key={category} className="app-picker__group">
              <h2 className="app-picker__category">{category}</h2>
              <div className="app-picker__grid">
                {apps.map((app) => {
                  const on = selectedIds.includes(app.id)
                  return (
                    <button
                      key={app.id}
                      type="button"
                      className={`app-card${on ? ' app-card--on' : ''}${app.required ? ' app-card--required' : ''}`}
                      onClick={() => toggleApp(app.id, app.required)}
                      aria-pressed={on}
                    >
                      <span className="app-card__check" aria-hidden>
                        {on ? '✓' : ''}
                      </span>
                      <span className="app-card__label">{app.label}</span>
                      <span className="app-card__desc">{app.description}</span>
                      {app.required && (
                        <span className="app-card__badge">Included</span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {error && <p className="form__error">{error}</p>}

        <div className="app-picker__footer">
          <p className="app-picker__count">
            {selectedApps.length} app{selectedApps.length === 1 ? '' : 's'} selected
          </p>
          <button className="btn btn--primary" type="button" onClick={continueToDetails}>
            Continue
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="page page--narrow">
      <div className="page__intro">
        <p className="eyebrow">Step 2 of 2</p>
        <h1>Create your workspace</h1>
        <p className="lede">
          Company + admin email. We’ll provision a site with your selected apps.
        </p>
        <ul className="selected-apps">
          {selectedApps.map((a) => (
            <li key={a.id}>{a.label}</li>
          ))}
        </ul>
        <button type="button" className="linkish" onClick={() => setStep('apps')}>
          Change apps
        </button>
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

        <button className="btn btn--primary" type="submit">
          Start now
        </button>

        <p className="form__footer-note">
          By creating a workspace you agree to our{' '}
          <Link to="/terms">Terms of Service</Link> and{' '}
          <Link to="/privacy">Privacy Policy</Link>.
        </p>
      </form>
    </section>
  )
}
