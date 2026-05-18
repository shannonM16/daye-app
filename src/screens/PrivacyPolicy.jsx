import Footer from '../components/Footer'

const INK = '#1a1a1a'
const LINEN = '#f9f7f5'
const MUTED = '#8a8480'
const BORDER = '#e2ddd8'
const LAVENDER = '#c9b8d8'

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: '40px' }}>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 300, fontSize: '24px', color: INK, margin: '0 0 16px 0', lineHeight: 1.2 }}>
        {title}
      </h2>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', color: INK, lineHeight: 1.75 }}>
        {children}
      </div>
    </div>
  )
}

function P({ children }) {
  return <p style={{ margin: '0 0 14px 0' }}>{children}</p>
}

function Ul({ children }) {
  return <ul style={{ margin: '0 0 14px 0', paddingLeft: '20px', listStyle: 'disc' }}>{children}</ul>
}

function Li({ children }) {
  return <li style={{ marginBottom: '6px' }}>{children}</li>
}

export default function PrivacyPolicy() {
  return (
    <div style={{ minHeight: '100dvh', background: LINEN }}>

      {/* Nav */}
      <nav style={{ height: '56px', borderBottom: `0.5px solid ${BORDER}`, display: 'flex', alignItems: 'center', padding: '0 24px', background: LINEN }}>
        <a href="/" style={{ textDecoration: 'none', marginRight: 'auto' }}>
          <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '20px', color: INK, fontWeight: 300 }}>daye</span>
        </a>
        <a
          href="/"
          style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: MUTED, textDecoration: 'none' }}
        >
          ← Back
        </a>
      </nav>

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '64px 24px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: '56px' }}>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: MUTED, margin: '0 0 20px 0', fontWeight: 500 }}>
            Legal
          </p>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 300, fontSize: 'clamp(36px, 6vw, 52px)', color: INK, lineHeight: 1.1, margin: '0 0 16px 0' }}>
            Privacy Policy
          </h1>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: MUTED, margin: 0 }}>
            Last updated: 17 May 2026
          </p>
        </div>

        <Section title="Who we are">
          <P>Daye is a daily focus and productivity app operated by Shannon Macaulay, trading as Daye, based in the United Kingdom. You can reach us at <a href="mailto:hello@withdaye.com" style={{ color: INK }}>hello@withdaye.com</a>.</P>
          <P>This Privacy Policy explains how we collect, use, and protect your personal data when you use Daye at withdaye.com. We are committed to your privacy and to being transparent about how your data is handled.</P>
        </Section>

        <Section title="What data we collect">
          <P>We collect the following categories of data:</P>
          <Ul>
            <Li><strong>Account data:</strong> Your first name and email address when you sign up.</Li>
            <Li><strong>Profile data:</strong> Your work situation, goals, blockers, job function, and other details you provide during onboarding. This personalises your experience.</Li>
            <Li><strong>Daily check-in data:</strong> Your energy level, mood, sleep quality, day type, and pressure points — submitted each day you use the app.</Li>
            <Li><strong>Focus plan data:</strong> Tasks you plan, priorities generated for you, meetings you log, and end-of-day reflections.</Li>
            <Li><strong>Usage data:</strong> Pages visited, features used, and general interaction data collected for product improvement.</Li>
            <Li><strong>Payment data:</strong> If you subscribe to Daye Pro, payment details are handled directly by Stripe. We do not store your card details.</Li>
          </Ul>
        </Section>

        <Section title="How we use your data">
          <P>We use your data to:</P>
          <Ul>
            <Li>Generate your daily AI focus plan, personalised to your energy, mood, and goals</Li>
            <Li>Show you your history, patterns, and insights over time</Li>
            <Li>Send you product emails (welcome, weekly insight, account-related notifications)</Li>
            <Li>Process your subscription payment and manage your Pro account</Li>
            <Li>Monitor app performance and fix errors</Li>
            <Li>Improve our product based on how people use it</Li>
          </Ul>
          <P>We do not sell your personal data. We do not use your data for advertising.</P>
        </Section>

        <Section title="Services we use">
          <P>We use third-party services to operate Daye. Each handles data as described:</P>
          <Ul>
            <Li><strong>Supabase</strong> — our database provider. Stores your account, profile, and daily check-in data. Data is hosted in the EU. <a href="https://supabase.com/privacy" style={{ color: INK }} target="_blank" rel="noreferrer">Privacy policy</a>.</Li>
            <Li><strong>Stripe</strong> — processes subscription payments. Handles your payment card data securely. We only store your Stripe customer ID. <a href="https://stripe.com/gb/privacy" style={{ color: INK }} target="_blank" rel="noreferrer">Privacy policy</a>.</Li>
            <Li><strong>Loops</strong> — sends transactional and marketing emails on our behalf. We share your name and email for this purpose. <a href="https://loops.so/privacy" style={{ color: INK }} target="_blank" rel="noreferrer">Privacy policy</a>.</Li>
            <Li><strong>Anthropic Claude API</strong> — generates your AI focus plans and letters. Your check-in data and tasks are sent to the Claude API to produce personalised output. Data is not stored or used to train models. <a href="https://www.anthropic.com/privacy" style={{ color: INK }} target="_blank" rel="noreferrer">Privacy policy</a>.</Li>
            <Li><strong>Sentry</strong> — monitors errors and app crashes. May capture anonymised technical context about what caused an error. <a href="https://sentry.io/privacy/" style={{ color: INK }} target="_blank" rel="noreferrer">Privacy policy</a>.</Li>
            <Li><strong>PostHog</strong> — product analytics. Tracks anonymised usage events (plan generated, onboarding completed, etc.) to help us understand how the product is used. <a href="https://posthog.com/privacy" style={{ color: INK }} target="_blank" rel="noreferrer">Privacy policy</a>.</Li>
            <Li><strong>Vercel</strong> — our hosting provider. Processes request logs in order to serve the application. <a href="https://vercel.com/legal/privacy-policy" style={{ color: INK }} target="_blank" rel="noreferrer">Privacy policy</a>.</Li>
          </Ul>
        </Section>

        <Section title="Your rights">
          <P>Under UK GDPR and data protection law, you have the right to:</P>
          <Ul>
            <Li><strong>Access</strong> the personal data we hold about you</Li>
            <Li><strong>Correct</strong> inaccurate data — you can update your name and email in your profile settings</Li>
            <Li><strong>Delete</strong> your account and all associated data — use the "Clear all data" option in your settings, or email us at hello@withdaye.com</Li>
            <Li><strong>Object to processing</strong> — you can unsubscribe from marketing emails at any time using the link in any email we send</Li>
            <Li><strong>Data portability</strong> — contact us to request an export of your data</Li>
          </Ul>
          <P>If you have a complaint about how we handle your data, you can contact the Information Commissioner's Office (ICO) at ico.org.uk.</P>
        </Section>

        <Section title="Data retention">
          <P>We retain your personal data for as long as your account is active. If you delete your account, we will delete your personal data within 30 days, except where we are required by law to retain it for longer (for example, payment records for tax purposes).</P>
        </Section>

        <Section title="Cookies">
          <P>We use essential cookies and local storage to keep you logged in and remember your preferences. We do not use advertising cookies or third-party tracking cookies beyond those listed in the services above.</P>
        </Section>

        <Section title="Security">
          <P>We take reasonable technical and organisational measures to protect your data. All data is transmitted over HTTPS. Our database provider (Supabase) uses row-level security to ensure you can only access your own data.</P>
          <P>No method of transmission over the internet is 100% secure, and we cannot guarantee absolute security. If you become aware of any security issues, please contact us immediately at hello@withdaye.com.</P>
        </Section>

        <Section title="Children">
          <P>Daye is not intended for children under 13 years of age. We do not knowingly collect personal data from children. If you believe we have done so, please contact us so we can remove it.</P>
        </Section>

        <Section title="Changes to this policy">
          <P>We may update this Privacy Policy from time to time. When we make significant changes, we will notify you by email or through a notice in the app. The date at the top of this page will always reflect the most recent update.</P>
        </Section>

        <Section title="Contact">
          <P>If you have any questions about this Privacy Policy or how your data is handled, please get in touch:</P>
          <P><a href="mailto:hello@withdaye.com" style={{ color: INK, fontWeight: 500 }}>hello@withdaye.com</a></P>
        </Section>

      </div>
      <Footer />
    </div>
  )
}
