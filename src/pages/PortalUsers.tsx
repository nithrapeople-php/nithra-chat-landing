import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { ALL_APPS, MOCK_SEATS, MOCK_USERS, type PortalRole, type PortalUser } from '../data/portalMock'
import {
  inviteOrgUser,
  isApiConfigured,
  listOrgUsers,
  setOrgUserStatus,
  syncOrgUser,
} from '../lib/api'
import { readUnifiedSession } from '../lib/portalSession'
import './Form.css'
import './Page.css'
import './PortalHome.css'
import './PortalUsers.css'

type StatusFilter = 'all' | 'active' | 'invited' | 'disabled'

type ApiUser = {
  id: string
  name: string
  email: string
  role: string
  apps: string[]
  status: string
  synced?: boolean
}

function mapApiUsers(rows: ApiUser[]): PortalUser[] {
  return (rows || []).map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role as PortalRole,
    apps: u.apps || ['raven'],
    status: u.status as PortalUser['status'],
    synced: Boolean(u.synced),
  }))
}

export function PortalUsers() {
  const session = readUnifiedSession()!
  const canManage = session.role === 'owner' || session.role === 'admin'
  const [users, setUsers] = useState<PortalUser[]>(() => (session.isMock ? [...MOCK_USERS] : []))
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<PortalRole>('member')
  const [password, setPassword] = useState('')
  const [sendWelcomeEmail, setSendWelcomeEmail] = useState(false)
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')
  const [inviteLink, setInviteLink] = useState('')
  const [loading, setLoading] = useState(false)
  const [rowBusy, setRowBusy] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [listError, setListError] = useState('')

  const seats = useMemo(
    () => ({
      used: users.filter((u) => u.status !== 'disabled').length,
      limit: MOCK_SEATS.limit,
    }),
    [users],
  )

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return users
    return users.filter((u) => u.status === statusFilter)
  }, [users, statusFilter])

  const refreshUsers = useCallback(async () => {
    if (session.isMock || !isApiConfigured() || !session.tenant) return
    const data = await listOrgUsers(session.tenant)
    setUsers(mapApiUsers(data.users || []))
  }, [session.isMock, session.tenant])

  useEffect(() => {
    if (session.isMock || !isApiConfigured() || !session.tenant) return
    let cancelled = false
    listOrgUsers(session.tenant)
      .then((data) => {
        if (cancelled) return
        setUsers(mapApiUsers(data.users || []))
        setListError('')
      })
      .catch((err) => {
        if (!cancelled) setListError(err instanceof Error ? err.message : 'Could not load users')
      })
    return () => {
      cancelled = true
    }
  }, [session.isMock, session.tenant])

  if (!canManage) {
    return (
      <section className="page page--wide portal">
        <div className="portal__empty">
          <p>You don’t have permission to manage users.</p>
        </div>
      </section>
    )
  }

  async function addUser(e: FormEvent) {
    e.preventDefault()
    setFormError('')
    setFormSuccess('')
    setInviteLink('')
    if (!name.trim() || !email.trim() || !email.includes('@')) {
      setFormError('Name and a valid email are required.')
      return
    }
    if (password && password.length < 8) {
      setFormError('Password must be at least 8 characters (or leave blank for accept-invite link).')
      return
    }
    if (seats.used >= seats.limit) {
      setFormError(`Seat limit reached (${seats.limit}).`)
      return
    }
    if (users.some((u) => u.email === email.trim().toLowerCase() && u.status !== 'disabled')) {
      setFormError('That email is already on the workspace.')
      return
    }

    if (session.isMock || !isApiConfigured() || !session.tenant) {
      setUsers((prev) => [
        {
          id: String(Date.now()),
          name: name.trim(),
          email: email.trim().toLowerCase(),
          role: role === 'owner' ? 'admin' : role,
          apps: ['raven'],
          status: password ? 'active' : 'invited',
          synced: false,
        },
        ...prev,
      ])
      setName('')
      setEmail('')
      setRole('member')
      setPassword('')
      setSendWelcomeEmail(false)
      setFormSuccess(
        password
          ? 'User added with password (demo — not synced to Frappe).'
          : 'Invite added (demo — not synced to Frappe).',
      )
      return
    }

    setLoading(true)
    try {
      const result = await inviteOrgUser({
        tenant: session.tenant,
        email: email.trim().toLowerCase(),
        full_name: name.trim(),
        role: role === 'owner' ? 'Admin' : role,
        apps: session.appIds,
        password: password || undefined,
        send_welcome_email: sendWelcomeEmail,
      })
      if (result.invite_token) {
        const link = `${window.location.origin}/accept-invite?token=${encodeURIComponent(result.invite_token)}`
        setInviteLink(link)
      }
      if (result.sync_error) {
        setFormSuccess(`Saved, but sync failed: ${result.sync_error}`)
      } else if (result.message) {
        setFormSuccess(result.message)
      } else if (result.synced) {
        setFormSuccess(
          result.activated
            ? 'User added with password and synced to the workspace.'
            : 'User invited and synced. Share the accept link so they can set a password.',
        )
      } else {
        setFormSuccess('Invite created.')
      }
      await refreshUsers()
      setName('')
      setEmail('')
      setRole('member')
      setPassword('')
      setSendWelcomeEmail(false)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Invite failed')
    } finally {
      setLoading(false)
    }
  }

  async function toggleStatus(u: PortalUser) {
    if (u.role === 'owner') return
    const next = u.status === 'disabled' ? 'Active' : 'Disabled'
    if (session.isMock || !isApiConfigured() || !session.tenant) {
      setUsers((prev) =>
        prev.map((row) =>
          row.id === u.id ? { ...row, status: next === 'Active' ? 'active' : 'disabled' } : row,
        ),
      )
      return
    }
    setRowBusy(u.id)
    setFormError('')
    try {
      await setOrgUserStatus({
        tenant: session.tenant,
        membership_id: u.id,
        status: next,
      })
      await refreshUsers()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not update status')
    } finally {
      setRowBusy(null)
    }
  }

  async function resync(u: PortalUser) {
    if (session.isMock || !isApiConfigured() || !session.tenant) return
    setRowBusy(u.id)
    setFormError('')
    setFormSuccess('')
    try {
      await syncOrgUser({ tenant: session.tenant, membership_id: u.id })
      setFormSuccess(`Synced ${u.email} to the workspace.`)
      await refreshUsers()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Sync failed')
    } finally {
      setRowBusy(null)
    }
  }

  const atLimit = seats.used >= seats.limit
  const filters: { id: StatusFilter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'active', label: 'Active' },
    { id: 'invited', label: 'Invited' },
    { id: 'disabled', label: 'Inactive' },
  ]

  return (
    <section className="page page--wide portal">
      <header className="portal__top">
        <div>
          <p className="eyebrow">Admin</p>
          <h1>Users</h1>
          <p className="lede portal__lede">
            <span className={atLimit ? 'portal-users__seats--full' : ''}>
              {seats.used} / {seats.limit} seats
            </span>
            {session.isMock ? ' · design mock' : ' · syncs to workspace on invite'}
          </p>
        </div>
      </header>

      <form className="form portal-users__invite" onSubmit={addUser}>
        <h2 className="portal__section-title">Invite user</h2>
        <div className="portal-users__invite-row">
          <label>
            Name
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Rivera" />
          </label>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@acme.com"
            />
          </label>
          <label>
            Role
            <select value={role} onChange={(e) => setRole(e.target.value as PortalRole)}>
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <button className="btn btn--primary" type="submit" disabled={atLimit || loading}>
            {loading ? 'Inviting…' : 'Invite'}
          </button>
        </div>
        <div className="portal-users__invite-extra">
          <label>
            Password <span className="form__optional">(optional — synced to workspace)</span>
            <input
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 8 characters"
              minLength={8}
            />
          </label>
          <label className="portal-users__check">
            <input
              type="checkbox"
              checked={sendWelcomeEmail}
              onChange={(e) => setSendWelcomeEmail(e.target.checked)}
            />
            <span>
              Welcome email <span className="form__optional">(saved for later — not sent yet)</span>
            </span>
          </label>
        </div>
        <p className="form__hint portal-users__invite-hint">
          Set a password to activate the user now and sync it to Frappe. Leave blank to send an
          accept-invite link instead.
        </p>
        {formError && (
          <p className="form__error" role="alert">
            {formError}
          </p>
        )}
        {formSuccess && (
          <p className="form__hint portal-users__success" role="status">
            {formSuccess}
          </p>
        )}
        {inviteLink && (
          <p className="form__hint">
            Accept link:{' '}
            <a href={inviteLink} target="_blank" rel="noreferrer">
              {inviteLink}
            </a>
          </p>
        )}
      </form>

      <div className="portal-users__toolbar">
        <div className="portal-users__filters" role="tablist" aria-label="Filter by status">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={statusFilter === f.id}
              className={`portal-users__filter${statusFilter === f.id ? ' portal-users__filter--on' : ''}`}
              onClick={() => setStatusFilter(f.id)}
            >
              {f.label}
              <span className="portal-users__filter-count">
                {f.id === 'all' ? users.length : users.filter((u) => u.status === f.id).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {listError && (
        <p className="form__error" role="alert">
          {listError}
        </p>
      )}

      {filtered.length === 0 ? (
        <div className="portal__empty">
          <p>No users in this filter.</p>
          <p className="portal__empty-hint">
            {users.length === 0 ? 'Invite your first teammate above.' : 'Try another status filter.'}
          </p>
        </div>
      ) : (
        <div className="portal-users__table-wrap">
          <table className="portal-users__table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Apps</th>
                <th>Status</th>
                <th>Sync</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id}>
                  <td data-label="Name">{u.name}</td>
                  <td data-label="Email">{u.email}</td>
                  <td data-label="Role">{u.role}</td>
                  <td data-label="Apps">
                    {u.apps
                      .map((id) => ALL_APPS.find((a) => a.id === id)?.label || id)
                      .join(', ')}
                  </td>
                  <td data-label="Status">
                    <span className={`portal-users__status portal-users__status--${u.status}`}>
                      {u.status === 'disabled' ? 'inactive' : u.status}
                    </span>
                  </td>
                  <td data-label="Sync">
                    <span
                      className={`portal-users__sync${u.synced ? ' portal-users__sync--ok' : ''}`}
                    >
                      {u.synced ? 'Synced' : 'Pending'}
                    </span>
                  </td>
                  <td className="portal-users__row-actions" data-label="">
                    {u.role !== 'owner' && (
                      <button
                        type="button"
                        className="linkish"
                        disabled={rowBusy === u.id}
                        onClick={() => toggleStatus(u)}
                      >
                        {u.status === 'disabled' ? 'Enable' : 'Disable'}
                      </button>
                    )}
                    {!session.isMock && u.status !== 'disabled' && (
                      <button
                        type="button"
                        className="linkish"
                        disabled={rowBusy === u.id}
                        onClick={() => resync(u)}
                      >
                        {rowBusy === u.id ? '…' : 'Sync'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
