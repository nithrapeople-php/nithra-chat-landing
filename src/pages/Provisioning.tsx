import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import {
  getAppHandoff,
  getProvisioningStatus,
  isApiConfigured,
  readPortalSession,
  signupTenant,
  tenantUrlFromSubdomain,
  type ProvisioningStatus,
  type SignupPayload,
} from '../lib/api'
import './Page.css'
import './Provisioning.css'

const SIGNUP_STORAGE_PREFIX = 'nithra-signup:'
const JOB_STORAGE_PREFIX = 'nithra-job:'

/** Dedupe create_tenant across React Strict Mode remounts. */
const createInFlight = new Map<string, Promise<string>>()

type LocationState = { signup?: SignupPayload }

function readStoredSignup(subdomain: string): SignupPayload | null {
  try {
    const raw = sessionStorage.getItem(`${SIGNUP_STORAGE_PREFIX}${subdomain}`)
    if (!raw) return null
    return JSON.parse(raw) as SignupPayload
  } catch {
    return null
  }
}

function readStoredJob(subdomain: string): string | null {
  try {
    return sessionStorage.getItem(`${JOB_STORAGE_PREFIX}${subdomain}`)
  } catch {
    return null
  }
}

function storeJob(subdomain: string, jobId: string) {
  try {
    sessionStorage.setItem(`${JOB_STORAGE_PREFIX}${subdomain}`, jobId)
    sessionStorage.removeItem(`${SIGNUP_STORAGE_PREFIX}${subdomain}`)
  } catch {
    /* ignore */
  }
}

function plainText(message: string): string {
  let m = message.trim()
  try {
    if (m.startsWith('[')) {
      const arr = JSON.parse(m)
      const first = typeof arr[0] === 'string' ? JSON.parse(arr[0]) : arr[0]
      if (first?.message) m = String(first.message)
    }
  } catch {
    /* keep original */
  }
  const stripped = m.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  return stripped || message
}

async function ensureJobId(
  subdomain: string,
  signup: SignupPayload | null | undefined,
): Promise<string> {
  const existing = readStoredJob(subdomain)
  if (existing) return existing

  let pending = createInFlight.get(subdomain)
  if (!pending) {
    const payload = signup ?? readStoredSignup(subdomain)
    if (!payload) {
      throw new Error('Missing signup details. Go back and start again.')
    }
    pending = signupTenant(payload).then((result) => {
      const job = result.jobId
      if (!job) throw new Error('No job id returned from signup.')
      storeJob(subdomain, job)
      return job
    })
    createInFlight.set(subdomain, pending)
  }

  try {
    return await pending
  } finally {
    // Keep resolved promise briefly so remounts reuse the same job id
    window.setTimeout(() => createInFlight.delete(subdomain), 30_000)
  }
}

export function Provisioning() {
  const [params, setParams] = useSearchParams()
  const location = useLocation()
  const jobFromUrl = params.get('job') || ''
  const subdomain = params.get('subdomain') || ''
  const signupFromNav = (location.state as LocationState | null)?.signup

  const demoUrl = useMemo(
    () => (subdomain ? tenantUrlFromSubdomain(subdomain) : undefined),
    [subdomain],
  )

  const [status, setStatus] = useState<ProvisioningStatus>({
    status: isApiConfigured() ? 'pending' : 'creating',
    siteUrl: isApiConfigured() ? undefined : demoUrl,
    message: isApiConfigured()
      ? 'Queuing your workspace…'
      : 'Demo mode — your control-plane API is not connected yet.',
  })

  useEffect(() => {
    if (!isApiConfigured()) {
      const t = window.setTimeout(() => {
        setStatus({
          status: 'ready',
          siteUrl: demoUrl,
          message: 'Demo complete. Connect VITE_FRAPPE_API_URL for real provisioning.',
        })
      }, 2800)
      return () => window.clearTimeout(t)
    }

    if (!subdomain && !jobFromUrl) {
      setStatus({ status: 'failed', message: 'Missing workspace details.' })
      return
    }

    let cancelled = false
    let timer: number | undefined

    async function tick(jobId: string) {
      try {
        const next = await getProvisioningStatus(jobId)
        if (cancelled) return
        setStatus({
          ...next,
          message: next.message ? plainText(next.message) : next.message,
        })
        if (next.status !== 'ready' && next.status !== 'failed') {
          timer = window.setTimeout(() => tick(jobId), 2500)
        }
      } catch {
        if (!cancelled) {
          setStatus({ status: 'failed', message: 'Could not check provisioning status.' })
        }
      }
    }

    async function start() {
      try {
        let jobId = jobFromUrl || (subdomain ? readStoredJob(subdomain) : null) || ''
        if (!jobId) {
          setStatus({ status: 'pending', message: 'Queuing your workspace…' })
          jobId = await ensureJobId(subdomain, signupFromNav)
          if (cancelled) return
          setParams(
            { job: jobId, subdomain },
            { replace: true },
          )
        } else if (!jobFromUrl && subdomain) {
          setParams({ job: jobId, subdomain }, { replace: true })
        }

        if (cancelled) return
        setStatus({ status: 'pending', message: 'Queued site creation…' })
        await tick(jobId)
      } catch (err) {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : 'Signup failed.'
          setStatus({ status: 'failed', message: plainText(msg) })
        }
      }
    }

    start()
    return () => {
      cancelled = true
      if (timer) window.clearTimeout(timer)
    }
  }, [jobFromUrl, subdomain, demoUrl, signupFromNav, setParams])

  const label =
    status.status === 'ready'
      ? 'Your workspace is ready'
      : status.status === 'failed'
        ? 'Something went wrong'
        : 'We’re setting up your site…'

  return (
    <section className="page page--narrow">
      <div className="page__intro">
        <p className="eyebrow">Provisioning</p>
        <h1>{label}</h1>
        <p className="lede">{status.message}</p>
      </div>

      <div className={`provision provision--${status.status}`}>
        <div className="provision__bar" aria-hidden>
          <span />
        </div>
        <ul className="provision__steps">
          <li className={status.status !== 'failed' ? 'is-done' : ''}>Signup received</li>
          <li
            className={
              status.status === 'creating' || status.status === 'ready' ? 'is-done' : ''
            }
          >
            Creating Frappe site
          </li>
          <li className={status.status === 'ready' ? 'is-done' : ''}>Workspace ready</li>
        </ul>

        {status.status === 'ready' && (
          <div className="provision__actions">
            <Link to="/home" className="btn btn--primary">
              Open portal
            </Link>
            {(status.siteUrl || status.chatUrl) && (
              <button
                type="button"
                className="btn btn--ghost"
                onClick={async () => {
                  const session = readPortalSession()
                  const tenant = status.tenant || session?.org?.tenant || session?.orgs?.[0]?.tenant
                  if (!(session?.token && tenant && isApiConfigured())) {
                    window.alert(
                      'Sign in to the portal first, then open Chat from Home (SSO).',
                    )
                    return
                  }
                  const tab = window.open('about:blank', '_blank')
                  if (tab) {
                    try {
                      tab.document.write(
                        '<!doctype html><title>Signing in…</title>' +
                          '<p style="font:15px system-ui;padding:2rem">Signing you in…</p>',
                      )
                      tab.document.close()
                    } catch {
                      /* ignore */
                    }
                  }
                  try {
                    const { handoffUrl } = await getAppHandoff({
                      tenant,
                      app: 'raven',
                      path: '/raven',
                    })
                    if (tab && !tab.closed) tab.location.href = handoffUrl
                    else window.location.assign(handoffUrl)
                  } catch (e) {
                    const msg =
                      e instanceof Error
                        ? e.message
                        : 'SSO failed. Sync your user on Manage users, then retry.'
                    if (tab && !tab.closed) {
                      try {
                        tab.document.open()
                        tab.document.write(
                          `<!doctype html><title>SSO failed</title>` +
                            `<p style="font:15px system-ui;padding:2rem;color:#b91c1c">${msg.replace(/</g, '&lt;')}</p>`,
                        )
                        tab.document.close()
                      } catch {
                        tab.close()
                      }
                    }
                    window.alert(msg)
                  }
                }}
              >
                Open Chat
              </button>
            )}
          </div>
        )}

        {status.status === 'failed' && (
          <Link to="/signup" className="btn btn--ghost">
            Try again
          </Link>
        )}
      </div>
    </section>
  )
}
