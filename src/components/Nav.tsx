import { NavLink } from 'react-router-dom'
import { brand } from '../config'
import './Nav.css'

export function Nav() {
  return (
    <header className="nav">
      <div className="nav__inner">
        <NavLink to="/" className="nav__brand" end>
          <span className="nav__mark" aria-hidden />
          {brand.name}
        </NavLink>

        <nav className="nav__links" aria-label="Primary">
          <NavLink to="/features">Features</NavLink>
          <NavLink to="/pricing">Pricing</NavLink>
          <NavLink to="/contact">Contact</NavLink>
        </nav>

        <div className="nav__actions">
          <NavLink to="/signin" className="nav__ghost">
            Sign in
          </NavLink>
          <NavLink to="/signup" className="nav__cta">
            Get started
          </NavLink>
        </div>
      </div>
    </header>
  )
}
