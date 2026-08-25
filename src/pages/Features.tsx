import { Link } from 'react-router-dom'
import './Page.css'

const items = [
  {
    title: 'Channels that cut the noise',
    body: 'Organize projects, teams, and company-wide updates in one place — async by default.',
  },
  {
    title: 'Built-in video & voice',
    body: 'Jump from a thread into a call without switching apps. Screen share when text isn’t enough.',
  },
  {
    title: 'Files, to-dos, reminders',
    body: 'Keep decisions and follow-ups next to the conversation so work actually ships.',
  },
  {
    title: 'Admin controls that scale',
    body: 'Permissions, retention, and authentication options for growing teams and regulated orgs.',
  },
]

export function Features() {
  return (
    <section className="page">
      <div className="page__intro">
        <p className="eyebrow">Features</p>
        <h1>Everything your team needs to stay aligned</h1>
        <p className="lede">
          Communication and light productivity in one workspace — without the
          clutter of a dozen tools.
        </p>
      </div>

      <div className="feature-list">
        {items.map((item) => (
          <article key={item.title} className="feature-row">
            <h2>{item.title}</h2>
            <p>{item.body}</p>
          </article>
        ))}
      </div>

      <div className="page__cta-band">
        <p>Ready to try it with your team?</p>
        <Link to="/signup" className="btn btn--primary">
          Get started
        </Link>
      </div>
    </section>
  )
}
