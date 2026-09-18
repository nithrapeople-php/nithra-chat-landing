import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  clearPortalSession,
  errorFromResponse,
  isApiConfigured,
  savePortalSession,
} from '../lib/api'
import { FRAPPE_API_URL } from '../config'
import './Form.css'
import './Page.css'

export function AcceptInvite() {
  const [params] = useSearchParams()
  const token = (params.get('token') || '').trim()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const ready = useMemo(() => Boolean(token), [token])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (!token) {
      setError('Missing invite token.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    if (!isApiConfigured()) {
      setError('API is not configured.')
      return
    }

    setLoading(true)
    try {
      const url = `${FRAPPE_API_URL.replace(/\/$/, '')}/api/method/nithra_saas.api.auth.accept_invite`
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          token,
          password,
          full_name: fullName.trim() || undefined,
        }),
      })
      if (!res.ok) throw new Error(await errorFromResponse(res))
      const data = await res.json()
      const message = data.message ?? data
      if (!message?.token) throw new Error('Accept did not return a session')
      clearPortalSession()
      savePortalSession(message)
      navigate('/home', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not accept invite')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="page page--narrow">
      <div className="page__intro">
        <p className="eyebrow">Invite</p>
        <h1>Join your workspace</h1>
        <p className="lede">
          Set a password to finish joining. You can open apps from the portal after this.
        </p>
      </div>

      {!ready ? (
        <p className="form__error" role="alert">
          This invite link is missing a token. Ask your admin to send a new invite.
        </p>
      ) : (
        <form className="form" onSubmit={onSubmit} noValidate>
          <label>
            Full name <span className="form__optional">(optional)</span>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Alex Rivera"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
          </label>
          <label>
            Confirm password
            <input
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              minLength={8}
              required
            />
          </label>
          {error && (
            <p className="form__error" role="alert">
              {error}
            </p>
          )}
          <button className="btn btn--primary" type="submit" disabled={loading}>
            {loading ? 'Joining…' : 'Accept invite'}
          </button>
        </form>
      )}

      <p className="form__footer-note">
        Already have an account? <Link to="/signin">Sign in</Link>
      </p>
    </section>
  )
}
