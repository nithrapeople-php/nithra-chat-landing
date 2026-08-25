import { useState, type FormEvent } from 'react'
import './Form.css'
import './Page.css'

export function Contact() {
  const [sent, setSent] = useState(false)

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    setSent(true)
  }

  return (
    <section className="page page--narrow">
      <div className="page__intro">
        <p className="eyebrow">Contact</p>
        <h1>Talk to us</h1>
        <p className="lede">
          Pricing questions, enterprise needs, or onboarding help — send a note.
          Hook this form to email or your Frappe lead DocType later.
        </p>
      </div>

      {sent ? (
        <p className="form__success">Thanks — we’ll get back to you shortly.</p>
      ) : (
        <form className="form" onSubmit={onSubmit}>
          <label>
            Name
            <input required name="name" autoComplete="name" />
          </label>
          <label>
            Work email
            <input required type="email" name="email" autoComplete="email" />
          </label>
          <label>
            Message
            <textarea required name="message" rows={5} />
          </label>
          <button className="btn btn--primary" type="submit">
            Send message
          </button>
        </form>
      )}
    </section>
  )
}
