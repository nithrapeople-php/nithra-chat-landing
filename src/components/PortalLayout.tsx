import { useEffect, useState } from 'react'
import { NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { brand } from '../config'
import { isApiConfigured, portalLogout } from '../lib/api'
import { clearUnifiedSession, readUnifiedSession } from '../lib/portalSession'
import './PortalShell.css'

export function PortalLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const session = readUnifiedSession()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!menuOpen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  if (!session) {
    return <Navigate to="/signin" replace />
  }

  const canManageUsers = session.role === 'owner' || session.role === 'admin'

  async function signOut() {
    const current = readUnifiedSession()
    if (isApiConfigured() && current && !current.isMock) {
      await portalLogout()
    } else {
      clearUnifiedSession()
    }
    navigate('/signin')
  }

  return (
    <div className={`portal-shell${menuOpen ? ' portal-shell--menu-open' : ''}`}>
      <header className="portal-mobile-bar">
        <button
          type="button"
          className="portal-mobile-bar__menu"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="portal-sidebar"
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span className="portal-hamburger" aria-hidden>
            <span />
            <span />
            <span />
          </span>
        </button>
        <div className="portal-mobile-bar__title">
          <img src={brand.logoSrc} alt="" width={22} height={22} />
          <span>{session.orgName}</span>
        </div>
      </header>

      <button
        type="button"
        className="portal-sidebar__backdrop"
        aria-label="Close menu"
        tabIndex={menuOpen ? 0 : -1}
        onClick={() => setMenuOpen(false)}
      />

      <aside id="portal-sidebar" className="portal-sidebar" aria-label="Portal">
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
