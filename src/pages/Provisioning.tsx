import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  getProvisioningStatus,
  isApiConfigured,
  tenantUrlFromSubdomain,
  type ProvisioningStatus,
} from '../lib/api'
import './Page.css'
import './Provisioning.css'

export function Provisioning() {
  const [params] = useSearchParams()
  const jobId = params.get('job') || ''
  const subdomain = params.get('subdomain') || ''

  const demoUrl = useMemo(
    () => (subdomain ? tenantUrlFromSubdomain(subdomain) : undefined),
    [subdomain],
  )

  const [status, setStatus] = useState<ProvisioningStatus>({
    status: isApiConfigured() ? 'pending' : 'creating',
    siteUrl: isApiConfigured() ? undefined : demoUrl,
    message: isApiConfigured()
      ? 'Queued site creation…'
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

    if (!jobId) {
      setStatus({ status: 'failed', message: 'Missing job id.' })
      return
    }

    let cancelled = false
    let timer: number | undefined

    async function tick() {
      try {
        const next = await getProvisioningStatus(jobId)
        if (cancelled) return
        setStatus(next)
        if (next.status !== 'ready' && next.status !== 'failed') {
          timer = window.setTimeout(tick, 2500)
        }
      } catch {
        if (!cancelled) {
          setStatus({ status: 'failed', message: 'Could not check provisioning status.' })
        }
      }
    }

    tick()
    return () => {
      cancelled = true
      if (timer) window.clearTimeout(timer)
    }
  }, [jobId, demoUrl])

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

        {status.status === 'ready' && status.siteUrl && (
          <a className="btn btn--primary" href={status.siteUrl}>
            Open workspace
          </a>
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
