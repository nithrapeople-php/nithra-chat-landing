import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { brand, TENANT_BASE_DOMAIN } from '../config'
import {
  chatLoginUrl,
  getAppHandoff,
  getProvisioningStatus,
  isApiConfigured,
  portalMe,
  tenantUrlFromSubdomain,
  type ProvisioningStatus,
} from '../lib/api'
import {
  appsForUnified,
  persistApiSession,
  readUnifiedSession,
} from '../lib/portalSession'
import './Page.css'
import './PortalHome.css'

function plainText(message: string): string {
  let m = message.trim()
  try {
    if (m.startsWith('[')) {
      const arr = JSON.parse(m)
      const first = typeof arr[0] === 'string' ? JSON.parse(arr[0]) : arr[0]
      if (first?.message) m = String(first.message)
    }
  } catch {
    /* keep */
  }
  return m.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() || message
}

export function PortalHome() {
  const [params] = useSearchParams()
  const jobFromUrl = params.get('job') || ''
  const subdomainFromUrl = params.get('subdomain') || ''

  const [session, setSession] = useState(() => readUnifiedSession()!)
  const [provision, setProvision] = useState<ProvisioningStatus | null>(null)
  const [openingApp, setOpeningApp] = useState<string | null>(null)
  const [openError, setOpenError] = useState<string | null>(null)

  const apps = useMemo(() => appsForUnified(session), [session])
  const openable = apps.filter((a) => a.entitled)
  const locked = apps.filter((a) => !a.entitled)

  const siteReady =
    session.tenantStatus === 'Active' ||
    provision?.status === 'ready' ||
    session.isMock

  const siteUrl =
    provision?.siteUrl ||
    session.siteUrl ||
    (session.subdomain ? tenantUrlFromSubdomain(session.subdomain) : undefined)

  // Refresh org status from API + poll job while provisioning
  useEffect(() => {
    if (!isApiConfigured() || session.isMock) {
      if (!isApiConfigured()) {
        const t = window.setTimeout(() => {
          setProvision({
            status: 'ready',
            siteUrl: tenantUrlFromSubdomain(session.subdomain || subdomainFromUrl || 'acme'),
            chatUrl: chatLoginUrl(
              tenantUrlFromSubdomain(session.subdomain || subdomainFromUrl || 'acme'),
            ),
            message: 'Demo workspace ready.',
          })
        }, 1600)
        return () => window.clearTimeout(t)
      }
      return
    }

    let cancelled = false
    let timer: number | undefined

    async function refreshMe() {
      try {
        const me = await portalMe()
        if (cancelled || !session.token) return
        persistApiSession({ ...me, token: session.token })
        const next = readUnifiedSession()
        if (next) setSession(next)
      } catch {
        /* keep cached session */
      }
    }

    async function tick(jobId: string) {
      try {
        const next = await getProvisioningStatus(jobId)
        if (cancelled) return
        setProvision({
          ...next,
          message: next.message ? plainText(next.message) : next.message,
        })
        if (next.status === 'ready') {
          await refreshMe()
          return
        }
        if (next.status !== 'failed') {
          timer = window.setTimeout(() => tick(jobId), 2500)
        }
      } catch {
        if (!cancelled) {
          setProvision({ status: 'failed', message: 'Could not check provisioning status.' })
        }
      }
    }

    refreshMe()

    const jobId =
      jobFromUrl ||
      session.jobId ||
      (subdomainFromUrl
        ? sessionStorage.getItem(`nithra-job:${subdomainFromUrl}`) || ''
        : '') ||
      (session.subdomain
        ? sessionStorage.getItem(`nithra-job:${session.subdomain}`) || ''
        : '')

    if (jobId && session.tenantStatus !== 'Active') {
      tick(jobId)
    }

    return () => {
      cancelled = true
      if (timer) window.clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- poll once per mount/job
  }, [jobFromUrl, subdomainFromUrl, session.isMock, session.token, session.jobId, session.subdomain, session.tenantStatus])

  async function openApp(appId: string, path: string) {
    if (!siteReady || !siteUrl) return
    setOpenError(null)

    // Demo / mock: open site path directly
    if (session.isMock || !isApiConfigured() || !session.tenant || !session.token) {
      const url =
        path === '/raven' || path.startsWith('/raven')
          ? chatLoginUrl(siteUrl)
          : `${siteUrl.replace(/\/$/, '')}${path}`
      window.open(url, '_blank', 'noopener,noreferrer')
      return
    }

    setOpeningApp(appId)
    try {
      const { handoffUrl } = await getAppHandoff({
        tenant: session.tenant,
        app: appId,
        path,
      })
      window.location.href = handoffUrl
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Could not open app'
      setOpenError(msg)
      // Fallback: tenant login page if SSO not ready on that site
      if (path === '/raven' || path.startsWith('/raven')) {
        window.open(chatLoginUrl(siteUrl), '_blank', 'noopener,noreferrer')
      } else {
        window.open(`${siteUrl.replace(/\/$/, '')}${path}`, '_blank', 'noopener,noreferrer')
      }
    } finally {
      setOpeningApp(null)
    }
  }

  const provisioning =
    !siteReady &&
    provision?.status !== 'failed' &&
    (provision?.status === 'pending' ||
      provision?.status === 'creating' ||
      session.tenantStatus === 'Pending' ||
      session.tenantStatus === 'Creating')

  return (
    <section className="page page--wide portal">
      <header className="portal__top">
        <div>
          <p className="eyebrow">Your workspace</p>
          <h1>{session.orgName}</h1>
          <p className="lede portal__lede">
            {session.subdomain
              ? `${session.subdomain}.${TENANT_BASE_DOMAIN}`
              : 'Your apps'}{' '}
            · signed in as {session.email}
          </p>
        </div>
      </header>

      {provisioning && (
        <p className="portal__banner portal__banner--info">
          Setting up your site… {provision?.message || 'This usually takes a few minutes.'}
        </p>
      )}

      {provision?.status === 'failed' && (
        <p className="portal__banner portal__banner--error">
          Provisioning failed: {provision.message || 'Please contact support.'}
        </p>
      )}

      {siteReady && (
        <p className="portal__banner">
          Workspace ready — open an app to continue (signed in via your portal session).
        </p>
      )}

      {openError && (
        <p className="portal__banner portal__banner--error">
          SSO handoff issue: {openError}. Opened the app login as a fallback.
        </p>
      )}

      <h2 className="portal__section-title">Your apps</h2>

      {openable.length === 0 ? (
        <div className="portal__empty">
          <p>No apps assigned to your account yet.</p>
        </div>
      ) : (
        <div className="portal__grid">
          {openable.map((app) => {
            const disabled = !siteReady || openingApp === app.id
            return (
              <button
                key={app.id}
                type="button"
                className={`portal-app${disabled ? ' portal-app--locked' : ''}`}
                onClick={() => openApp(app.id, app.path)}
                disabled={!siteReady || Boolean(openingApp)}
              >
                <span className="portal-app__label">{app.label}</span>
                <span className="portal-app__desc">{app.description}</span>
                <span className="portal-app__meta">
                  {!siteReady
                    ? 'Available when workspace is ready'
                    : openingApp === app.id
                      ? 'Opening…'
                      : `Open ${app.path}`}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {locked.length > 0 && (
        <>
          <h2 className="portal__section-title portal__section-title--spaced">Unavailable</h2>
          <div className="portal__grid">
            {locked.map((app) => (
              <div key={app.id} className="portal-app portal-app--locked" aria-disabled>
                <span className="portal-app__label">{app.label}</span>
                <span className="portal-app__desc">{app.description}</span>
                <span className="portal-app__meta">
                  {app.onPlan ? 'Not assigned to you' : 'Not on your plan'}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      <p className="portal__footnote">{brand.name} portal</p>
    </section>
  )
}
