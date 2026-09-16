import { NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom'
import { brand } from '../config'
import { clearMockSession, readMockSession } from '../data/portalMock'
import './PortalShell.css'

export function PortalLayout() {
  const navigate = useNavigate()
  const session = readMockSession()

  if (!session) {
    return <Navigate to="/signin" replace />
  }

  const canManageUsers = session.role === 'owner' || session.role === 'admin'

  function signOut() {
    clearMockSession()
    navigate('/signin')
  }

  return (
    <div className="portal-shell">
      <aside className="portal-sidebar" aria-label="Portal">
        <div className="portal-sidebar__brand">
          <img src={brand.logoSrc} alt="" width={28} height={28} />
          <div>
            <p className="portal-sidebar__product">{brand.name}</p>
            <p className="portal-sidebar__org">{session.orgName}</p>
          </div>
        </div>

        <nav className="portal-sidebar__nav">
          <NavLink to="/home" className={({ isActive }) => navClass(isActive)} end>
            Apps
          </NavLink>
          {canManageUsers && (
            <NavLink to="/users" className={({ isActive }) => navClass(isActive)}>
              Manage users
            </NavLink>
          )}
          {canManageUsers && (
            <NavLink to="/billing" className={({ isActive }) => navClass(isActive)}>
              Billing
            </NavLink>
          )}
        </nav>

        <div className="portal-sidebar__footer">
          <p className="portal-sidebar__user">
            <span className="portal-sidebar__user-name">{session.name}</span>
            <span className="portal-sidebar__user-meta">
              {session.email} · {session.role}
            </span>
          </p>
          <button type="button" className="portal-sidebar__signout" onClick={signOut}>
            Sign out
          </button>
        </div>
      </aside>

      <div className="portal-shell__main">
        <Outlet />
      </div>
    </div>
  )
}

function navClass(isActive: boolean) {
  return `portal-sidebar__link${isActive ? ' is-active' : ''}`
}
