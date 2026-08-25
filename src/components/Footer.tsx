import { Link } from 'react-router-dom'
import { brand } from '../config'
import './Footer.css'

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <strong className="footer__brand-row">
            <img src={brand.logoSrc} alt="" width={28} height={28} />
            {brand.name}
          </strong>
          <p>{brand.tagline}</p>
        </div>
        <div className="footer__cols">
          <div>
            <h4>Product</h4>
            <Link to="/features">Features</Link>
            <Link to="/pricing">Pricing</Link>
            <Link to="/signup">Get started</Link>
          </div>
          <div>
            <h4>Account</h4>
            <Link to="/signin">Sign in</Link>
            <Link to="/contact">Contact</Link>
          </div>
        </div>
      </div>
      <div className="footer__legal">
        <span>© {new Date().getFullYear()} {brand.name}</span>
        <span>Team messenger & collaboration</span>
      </div>
    </footer>
  )
}
