import { Link, Navigate, useNavigate } from 'react-router-dom'
import { brand, TENANT_BASE_DOMAIN } from '../config'
import {
  MOCK_APPS,
  clearMockSession,
  readMockSession,
  type PortalApp,
} from '../data/portalMock'
import './Page.css'
import './PortalHome.css'

export function PortalHome() {
  const navigate = useNavigate()
  const session = readMockSession()

  if (!session) {
    return <Navigate to="/signin" replace />
  }

  const canManageUsers = session.role === 'owner' || session.role === 'admin'

  function openApp(app: PortalApp) {
    if (!app.entitled) return
    // Design mock — real handoff later
    const url = `https://${session!.subdomain}.${TENANT_BASE_DOMAIN}${app.path}`
    window.alert(
      `Design preview\n\nWould open:\n${url}\n\n(Not wired — no redirect yet.)`,
    )
  }

  function signOut() {
    clearMockSession()
    navigate('/signin')
  }

  return (
    <section className="page page--wide portal">
      <header className="portal__top">
        <div>
          <p className="eyebrow">Your workspace</p>
          <h1>{session.orgName}</h1>
          <p className="lede portal__lede">
            Signed in as {session.name} ({session.email}) · {session.role}
          </p>
        </div>
        <div className="portal__actions">
          {canManageUsers && (
            <Link to="/users" className="btn btn--ghost">
              Manage users
            </Link>
          )}
          <button type="button" className="btn btn--ghost" onClick={signOut}>
            Sign out
          </button>
        </div>
      </header>

      <p className="portal__banner">Design mock — no API. App clicks show a preview only.</p>

      <h2 className="portal__section-title">Your apps</h2>
      <div className="portal__grid">
        {MOCK_APPS.map((app) => (
          <button
            key={app.id}
            type="button"
            className={`portal-app${app.entitled ? '' : ' portal-app--locked'}`}
            onClick={() => openApp(app)}
            disabled={!app.entitled}
          >
            <span className="portal-app__label">{app.label}</span>
            <span className="portal-app__desc">{app.description}</span>
            <span className="portal-app__meta">
              {app.entitled ? `Open ${app.path}` : 'Not on your plan'}
            </span>
          </button>
        ))}
      </div>

      <p className="portal__footnote">
        {brand.name} portal design · tenant apps open on your site later via SSO
      </p>
    </section>
  )
}
