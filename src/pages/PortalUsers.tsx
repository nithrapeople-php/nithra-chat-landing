import { useMemo, useState, type FormEvent } from 'react'
import {
  ALL_APPS,
  MOCK_SEATS,
  MOCK_USERS,
  readMockSession,
  type PortalRole,
  type PortalUser,
} from '../data/portalMock'
import './Form.css'
import './Page.css'
import './PortalHome.css'
import './PortalUsers.css'

export function PortalUsers() {
  const session = readMockSession()!
  const canManage = session.role === 'owner' || session.role === 'admin'
  const [users, setUsers] = useState<PortalUser[]>(() => [...MOCK_USERS])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<PortalRole>('member')
  const [formError, setFormError] = useState('')

  const seats = useMemo(
    () => ({
      used: users.filter((u) => u.status !== 'disabled').length,
      limit: MOCK_SEATS.limit,
    }),
    [users],
  )

  if (!canManage) {
    return (
      <section className="page page--wide portal">
        <div className="portal__empty">
          <p>You don’t have permission to manage users.</p>
          <p className="portal__empty-hint">Ask an owner or admin, or use the Ada demo persona.</p>
        </div>
      </section>
    )
  }

  function addUser(e: FormEvent) {
    e.preventDefault()
    setFormError('')
    if (!name.trim() || !email.trim() || !email.includes('@')) {
      setFormError('Name and a valid email are required.')
      return
    }
    if (seats.used >= seats.limit) {
      setFormError(`Seat limit reached (${seats.limit}). Upgrade the plan to invite more.`)
      return
    }
    if (users.some((u) => u.email === email.trim().toLowerCase())) {
      setFormError('That email is already on the workspace.')
      return
    }

    setUsers((prev) => [
      {
        id: String(Date.now()),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role,
        apps: ['raven'],
        status: 'invited',
      },
      ...prev,
    ])
    setName('')
    setEmail('')
    setRole('member')
  }

  function setStatus(id: string, status: PortalUser['status']) {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status } : u)))
  }

  const atLimit = seats.used >= seats.limit

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
            {' · '}
            design mock (local state only)
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
              <option value="owner">Owner</option>
            </select>
          </label>
          <button className="btn btn--primary" type="submit" disabled={atLimit}>
            Add
          </button>
        </div>
        {formError && (
          <p className="form__error" role="alert">
            {formError}
          </p>
        )}
        {atLimit && !formError && (
          <p className="form__hint">Seat limit reached — disable someone or upgrade (mock).</p>
        )}
      </form>

      {users.length === 0 ? (
        <div className="portal__empty">
          <p>No users yet.</p>
          <p className="portal__empty-hint">Invite your first teammate above.</p>
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
                <th />
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
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
                      {u.status}
                    </span>
                  </td>
                  <td className="portal-users__row-actions" data-label="">
                    {u.status !== 'disabled' ? (
                      <button
                        type="button"
                        className="linkish"
                        onClick={() => setStatus(u.id, 'disabled')}
                      >
                        Disable
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="linkish"
                        onClick={() => setStatus(u.id, 'active')}
                      >
                        Enable
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
