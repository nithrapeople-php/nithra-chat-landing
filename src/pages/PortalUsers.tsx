import { useMemo, useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import {
  MOCK_APPS,
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
  const session = readMockSession()
  const [users, setUsers] = useState<PortalUser[]>(() => [...MOCK_USERS])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<PortalRole>('member')

  const canManage = session && (session.role === 'owner' || session.role === 'admin')

  const seats = useMemo(
    () => ({
      used: users.filter((u) => u.status !== 'disabled').length,
      limit: MOCK_SEATS.limit,
    }),
    [users],
  )

  if (!session) {
    return <Navigate to="/signin" replace />
  }

  if (!canManage) {
    return <Navigate to="/home" replace />
  }

  function addUser(e: FormEvent) {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !email.includes('@')) return
    if (seats.used >= seats.limit) return

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

  return (
    <section className="page page--wide portal">
      <header className="portal__top">
        <div>
          <p className="eyebrow">Admin</p>
          <h1>Users</h1>
          <p className="lede portal__lede">
            {seats.used} / {seats.limit} seats · design mock (local state only)
          </p>
        </div>
        <Link to="/home" className="btn btn--ghost">
          Back to apps
        </Link>
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
          <button className="btn btn--primary" type="submit">
            Add
          </button>
        </div>
      </form>

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
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>
                  {u.apps
                    .map((id) => MOCK_APPS.find((a) => a.id === id)?.label || id)
                    .join(', ')}
                </td>
                <td>
                  <span className={`portal-users__status portal-users__status--${u.status}`}>
                    {u.status}
                  </span>
                </td>
                <td className="portal-users__row-actions">
                  {u.status !== 'disabled' ? (
                    <button type="button" className="linkish" onClick={() => setStatus(u.id, 'disabled')}>
                      Disable
                    </button>
                  ) : (
                    <button type="button" className="linkish" onClick={() => setStatus(u.id, 'active')}>
                      Enable
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
