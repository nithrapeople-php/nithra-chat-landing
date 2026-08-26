import { Link } from 'react-router-dom'
import { brand } from '../config'
import './Legal.css'
import './Page.css'

const LAST_UPDATED = 'August 26, 2026'
const CONTACT_EMAIL = `privacy@${brand.domain}`

export function Privacy() {
  return (
    <section className="page page--narrow">
      <div className="page__intro">
        <p className="eyebrow">Legal</p>
        <h1>Privacy Policy</h1>
        <p className="lede">
          How {brand.name} collects, uses, and protects personal information.
          Last updated: {LAST_UPDATED}.
        </p>
      </div>

      <div className="legal">
        <p className="legal__note">
          This policy applies to the {brand.name} marketing site, sign-up flow,
          and workspace product. It is written for transparency; it is not legal
          advice. Contact us if you need a signed DPA or enterprise terms.
        </p>

        <section>
          <h2>1. Who we are</h2>
          <p>
            {brand.name} (“we”, “us”) provides a team messaging and collaboration
            workspace. Our marketing site is available at{' '}
            <a href={`https://${brand.domain}`}>https://{brand.domain}</a>. For
            privacy questions, email{' '}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
          </p>
        </section>

        <section>
          <h2>2. Information we collect</h2>
          <p>Depending on how you use {brand.name}, we may collect:</p>
          <ul>
            <li>
              <strong>Account data</strong> — name, work email, company name,
              workspace subdomain, and password or SSO identifiers.
            </li>
            <li>
              <strong>Workspace content</strong> — messages, files, channels,
              and related metadata you or your teammates create in the product.
            </li>
            <li>
              <strong>Usage &amp; device data</strong> — IP address, browser
              type, approximate location, pages viewed, and product feature
              usage to operate and improve the service.
            </li>
            <li>
              <strong>Support &amp; contact data</strong> — information you send
              via contact forms, email, or support tickets.
            </li>
            <li>
              <strong>Billing data</strong> — if you subscribe to a paid plan,
              payment details are processed by our payment provider; we do not
              store full card numbers on our servers.
            </li>
          </ul>
        </section>

        <section>
          <h2>3. How we use information</h2>
          <p>We use personal data to:</p>
          <ul>
            <li>Create and administer workspaces and user accounts</li>
            <li>Provide messaging, calls, file sharing, and related features</li>
            <li>Authenticate users and keep the service secure</li>
            <li>Send service notices (e.g. provisioning status, security alerts)</li>
            <li>Respond to support requests and improve the product</li>
            <li>Comply with law and enforce our Terms of Service</li>
          </ul>
          <p>
            We do not sell personal information. We may send product updates if
            you opt in or where allowed by law; you can unsubscribe from
            marketing emails at any time.
          </p>
        </section>

        <section>
          <h2>4. Legal bases (where applicable)</h2>
          <p>
            Where GDPR or similar laws apply, we process data based on contract
            performance (providing the service), legitimate interests (security,
            product improvement), consent (where required), and legal
            obligations.
          </p>
        </section>

        <section>
          <h2>5. Sharing &amp; processors</h2>
          <p>
            We share data only with service providers who help us run{' '}
            {brand.name} (for example hosting, email delivery, analytics, or
            payment processing), under agreements that limit use to our
            instructions. We may disclose information if required by law, to
            protect rights and safety, or in connection with a merger or sale of
            assets (with notice where required).
          </p>
          <p>
            Workspace content is visible to members of that workspace according
            to permissions set by your organization. Workspace admins control
            membership and access.
          </p>
        </section>

        <section>
          <h2>6. International transfers</h2>
          <p>
            Your data may be stored or processed in countries other than where
            you live. Where required, we use appropriate safeguards (such as
            standard contractual clauses) for cross-border transfers.
          </p>
        </section>

        <section>
          <h2>7. Retention</h2>
          <p>
            We keep account and workspace data for as long as your workspace is
            active and as needed to provide the service. After deletion or
            account closure, we may retain limited records for legal, security,
            or backup purposes for a reasonable period, then delete or anonymize
            them.
          </p>
        </section>

        <section>
          <h2>8. Security</h2>
          <p>
            We use industry-standard measures to protect data in transit and at
            rest, including access controls and encryption where appropriate. No
            method of transmission or storage is 100% secure; please use strong
            passwords and protect your credentials.
          </p>
        </section>

        <section>
          <h2>9. Your rights</h2>
          <p>
            Depending on your location, you may have rights to access, correct,
            delete, or export your personal data, or to object to or restrict
            certain processing. To exercise these rights, contact{' '}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. If you use{' '}
            {brand.name} through your employer, some requests may need to go
            through your workspace administrator first.
          </p>
        </section>

        <section>
          <h2>10. Children</h2>
          <p>
            {brand.name} is intended for business and professional use. We do
            not knowingly collect personal information from children under 16
            (or the minimum age required in your jurisdiction).
          </p>
        </section>

        <section>
          <h2>11. Cookies</h2>
          <p>
            We use cookies and similar technologies that are necessary for
            authentication, preferences, and security. We may use analytics
            cookies to understand how the marketing site is used. You can
            control cookies through your browser settings.
          </p>
        </section>

        <section>
          <h2>12. Changes</h2>
          <p>
            We may update this Privacy Policy from time to time. We will post
            the revised version on this page and update the “Last updated” date.
            Material changes may also be communicated by email or in-product
            notice.
          </p>
        </section>

        <section>
          <h2>13. Contact</h2>
          <p>
            Privacy inquiries: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            . General contact: <Link to="/contact">Contact us</Link>. See also
            our <Link to="/terms">Terms of Service</Link>.
          </p>
        </section>
      </div>
    </section>
  )
}
