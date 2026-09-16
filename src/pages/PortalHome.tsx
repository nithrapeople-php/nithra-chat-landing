import { TENANT_BASE_DOMAIN } from '../config'
import { brand } from '../config'
import { appsForSession, readMockSession } from '../data/portalMock'
import './Page.css'
import './PortalHome.css'

export function PortalHome() {
  const session = readMockSession()!
  const apps = appsForSession(session)
  const openable = apps.filter((a) => a.entitled)
  const locked = apps.filter((a) => !a.entitled)

  function openApp(path: string, label: string) {
    const url = `https://${session.subdomain}.${TENANT_BASE_DOMAIN}${path}`
    window.alert(`Design preview\n\n${label}\n${url}\n\n(Not wired yet.)`)
  }

  return (
    <section className="page page--wide portal">
      <header className="portal__top">
        <div>
          <p className="eyebrow">Your workspace</p>
          <h1>{session.orgName}</h1>
          <p className="lede portal__lede">
            {session.planId === 'chat' ? 'Chat plan' : 'Suite plan'} · pick an app to continue
          </p>
        </div>
      </header>

      <p className="portal__banner">
        Design mock — no API. Use the left menu for Apps, Manage users, and Sign out.
      </p>

      <h2 className="portal__section-title">Your apps</h2>

      {openable.length === 0 ? (
        <div className="portal__empty">
          <p>No apps assigned to your account yet.</p>
          <p className="portal__empty-hint">Ask an admin to grant access, or sign in as Ada (owner).</p>
        </div>
      ) : (
        <div className="portal__grid">
          {openable.map((app) => (
            <button
              key={app.id}
              type="button"
              className="portal-app"
              onClick={() => openApp(app.path, app.label)}
            >
              <span className="portal-app__label">{app.label}</span>
              <span className="portal-app__desc">{app.description}</span>
              <span className="portal-app__meta">Open {app.path}</span>
            </button>
          ))}
        </div>
      )}

      {locked.length > 0 && (
        <>
          <h2 className="portal__section-title portal__section-title--spaced">Unavailable</h2>
          <p className="portal__unavailable-lede">
            More Frappe apps you can add by upgrading your plan (design list).
          </p>
          <div className="portal__grid">
            {locked.map((app) => (
              <div key={app.id} className="portal-app portal-app--locked" aria-disabled>
                <span className="portal-app__label">{app.label}</span>
                <span className="portal-app__desc">{app.description}</span>
                <span className="portal-app__meta">
                  {app.onPlan ? 'Not assigned to you' : 'Not on your plan · Upgrade to unlock'}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      <p className="portal__footnote">
        {brand.name} portal design · SSO handoff to tenant apps comes later
      </p>
    </section>
  )
}
