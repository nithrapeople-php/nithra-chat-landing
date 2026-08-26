import { Link } from 'react-router-dom'
import { brand } from '../config'
import './Legal.css'
import './Page.css'

const LAST_UPDATED = 'August 26, 2026'
const CONTACT_EMAIL = `legal@${brand.domain}`

export function Terms() {
  return (
    <section className="page page--narrow">
      <div className="page__intro">
        <p className="eyebrow">Legal</p>
        <h1>Terms of Service</h1>
        <p className="lede">
          The agreement between you and {brand.name} for use of our website and
          workspace. Last updated: {LAST_UPDATED}.
        </p>
      </div>

      <div className="legal">
        <p className="legal__note">
          By creating an account, starting a workspace, or using {brand.name},
          you agree to these Terms. If you are accepting on behalf of a company,
          you confirm you have authority to bind that company.
        </p>

        <section>
          <h2>1. The service</h2>
          <p>
            {brand.name} provides a team messaging and collaboration platform,
            including channels, direct messages, files, and related features
            (the “Service”). Features may change over time as we improve the
            product. Marketing materials describe typical capabilities and do
            not guarantee every feature for every plan.
          </p>
        </section>

        <section>
          <h2>2. Accounts &amp; workspaces</h2>
          <ul>
            <li>
              You must provide accurate registration information and keep your
              credentials confidential.
            </li>
            <li>
              You are responsible for activity under your account and for
              ensuring workspace members comply with these Terms.
            </li>
            <li>
              Workspace administrators control membership, roles, and content
              retention within their workspace.
            </li>
            <li>
              You must be at least 16 years old (or the age of digital consent
              in your country) to use the Service.
            </li>
          </ul>
        </section>

        <section>
          <h2>3. Acceptable use</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Violate any law or third-party rights</li>
            <li>
              Upload malware, spam, or content that is illegal, harassing, or
              exploitative
            </li>
            <li>
              Attempt to gain unauthorized access to the Service, other
              workspaces, or related systems
            </li>
            <li>
              Scrape, overload, or disrupt the Service, or reverse engineer it
              except where permitted by law
            </li>
            <li>
              Resell or misrepresent the Service without our written permission
            </li>
          </ul>
          <p>
            We may suspend or terminate access for violations, security risk, or
            non-payment.
          </p>
        </section>

        <section>
          <h2>4. Your content</h2>
          <p>
            You (and your organization) retain ownership of messages, files, and
            other content submitted to the Service (“Customer Content”). You
            grant us a limited license to host, process, transmit, and display
            Customer Content solely to operate and improve the Service and as
            directed by workspace administrators.
          </p>
          <p>
            You represent that you have the rights needed to submit Customer
            Content and that it does not infringe others’ rights.
          </p>
        </section>

        <section>
          <h2>5. Our intellectual property</h2>
          <p>
            The Service, including software, branding, and documentation, is
            owned by {brand.name} or its licensors. These Terms do not grant you
            any ownership rights in our IP. Feedback you provide may be used by
            us without obligation to you.
          </p>
        </section>

        <section>
          <h2>6. Plans, trials &amp; payment</h2>
          <p>
            Free or trial access may be limited in features, seats, or duration.
            Paid plans are billed according to the pricing shown at signup or in
            an order form. Fees are generally non-refundable except where
            required by law or expressly stated. Taxes may apply. Failure to pay
            may result in suspension.
          </p>
        </section>

        <section>
          <h2>7. Third-party services</h2>
          <p>
            The Service may integrate with third-party products (e.g. identity
            providers or video providers). Those services are governed by their
            own terms; we are not responsible for them.
          </p>
        </section>

        <section>
          <h2>8. Privacy</h2>
          <p>
            Our collection and use of personal data is described in our{' '}
            <Link to="/privacy">Privacy Policy</Link>. You agree to process any
            personal data of your users in compliance with applicable privacy
            laws when using the Service as a workspace operator.
          </p>
        </section>

        <section>
          <h2>9. Availability &amp; changes</h2>
          <p>
            We aim for high availability but do not guarantee uninterrupted or
            error-free service. We may modify, suspend, or discontinue features
            with reasonable notice when practical. Planned maintenance may
            temporarily affect access.
          </p>
        </section>

        <section>
          <h2>10. Disclaimer</h2>
          <p>
            THE SERVICE IS PROVIDED “AS IS” AND “AS AVAILABLE.” TO THE MAXIMUM
            EXTENT PERMITTED BY LAW, WE DISCLAIM WARRANTIES OF MERCHANTABILITY,
            FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT
            WARRANT THAT THE SERVICE WILL MEET YOUR REQUIREMENTS OR BE FREE OF
            ERRORS.
          </p>
        </section>

        <section>
          <h2>11. Limitation of liability</h2>
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, {brand.name.toUpperCase()}{' '}
            AND ITS AFFILIATES WILL NOT BE LIABLE FOR INDIRECT, INCIDENTAL,
            SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR FOR LOSS OF PROFITS,
            DATA, OR BUSINESS. OUR TOTAL LIABILITY ARISING OUT OF THESE TERMS OR
            THE SERVICE WILL NOT EXCEED THE AMOUNTS YOU PAID US FOR THE SERVICE
            IN THE TWELVE (12) MONTHS BEFORE THE CLAIM (OR USD $100 IF YOU ARE
            ON A FREE PLAN).
          </p>
          <p>
            Some jurisdictions do not allow certain limitations; in those cases,
            our liability is limited to the fullest extent allowed.
          </p>
        </section>

        <section>
          <h2>12. Indemnity</h2>
          <p>
            You will defend and indemnify us against claims arising from your
            Customer Content, your misuse of the Service, or your violation of
            these Terms or applicable law.
          </p>
        </section>

        <section>
          <h2>13. Termination</h2>
          <p>
            You may stop using the Service at any time and request workspace
            deletion subject to our retention practices. We may terminate or
            suspend access for breach, risk, or inactivity on free plans. Upon
            termination, your right to use the Service ends; provisions that by
            nature should survive (including IP, liability limits, and indemnity)
            will survive.
          </p>
        </section>

        <section>
          <h2>14. Governing law</h2>
          <p>
            These Terms are governed by the laws of India, without regard to
            conflict-of-law rules, unless a separate written agreement with you
            states otherwise. Courts in Chennai, Tamil Nadu, India shall have
            exclusive jurisdiction, except that we may seek injunctive relief in
            any jurisdiction.
          </p>
        </section>

        <section>
          <h2>15. Changes to these Terms</h2>
          <p>
            We may update these Terms by posting a revised version on this page
            and updating the “Last updated” date. Continued use after changes
            become effective constitutes acceptance. If you do not agree, stop
            using the Service and close your account.
          </p>
        </section>

        <section>
          <h2>16. Contact</h2>
          <p>
            Questions about these Terms:{' '}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. General
            inquiries: <Link to="/contact">Contact us</Link>. Privacy:{' '}
            <Link to="/privacy">Privacy Policy</Link>.
          </p>
        </section>
      </div>
    </section>
  )
}
