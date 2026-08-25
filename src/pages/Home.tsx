import { Link } from 'react-router-dom'
import { brand } from '../config'
import './Home.css'

export function Home() {
  return (
    <section className="home">
      <div className="home__hero">
        <div className="home__copy">
          <p className="home__brand">
            <img
              className="home__logo"
              src={brand.logoSrc}
              alt=""
              width={56}
              height={56}
            />
            {brand.name}
          </p>
          <h1>Your new home for collaboration.</h1>
          <p className="home__lede">
            One shared space for channels, calls, and follow-through — so teams
            stay aligned without the email maze.
          </p>
          <div className="home__ctas">
            <Link to="/signup" className="btn btn--primary">
              Get started
            </Link>
            <Link to="/features" className="btn btn--ghost">
              See features
            </Link>
          </div>
        </div>

        <div className="home__visual" aria-hidden>
          <div className="home__stage">
            <div className="home__panel home__panel--a">
              <span># product</span>
              <p>Ship notes locked. Design sync at 4?</p>
            </div>
            <div className="home__panel home__panel--b">
              <span># launch</span>
              <p>Campaign brief shared — feedback by EOD.</p>
            </div>
            <div className="home__panel home__panel--c">
              <span>Video</span>
              <p>Standup · 12 online</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
