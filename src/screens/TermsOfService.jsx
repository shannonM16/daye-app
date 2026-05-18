const INK = '#1a1a1a'
const LINEN = '#f9f7f5'
const MUTED = '#8a8480'
const BORDER = '#e2ddd8'

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

export default function TermsOfService() {
  return (
    <div style={{ minHeight: '100dvh', background: LINEN }}>

      {/* Nav */}
      <nav style={{ height: '56px', borderBottom: `0.5px solid ${BORDER}`, display: 'flex', alignItems: 'center', padding: '0 24px', background: LINEN }}>
        <a href="/" style={{ textDecoration: 'none', marginRight: 'auto' }}>
          <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '20px', color: INK, fontWeight: 300 }}>daye</span>
        </a>
        <a href="/" style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: MUTED, textDecoration: 'none' }}>← Back</a>
      </nav>

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '64px 24px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: '56px' }}>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: MUTED, margin: '0 0 20px 0', fontWeight: 500 }}>
            Legal
          </p>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 300, fontSize: 'clamp(36px, 6vw, 52px)', color: INK, lineHeight: 1.1, margin: '0 0 16px 0' }}>
            Terms of Service
          </h1>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: MUTED, margin: 0 }}>
            Last updated: 17 May 2026
          </p>
        </div>

        <Section title="Acceptance of terms">
          <P>By creating an account and using Daye ("the Service") at withdaye.com, you agree to these Terms of Service. Please read them carefully.</P>
          <P>These terms are governed by English law. If you do not agree to these terms, please do not use the Service.</P>
        </Section>

        <Section title="The service">
          <P>Daye is a daily focus and productivity application that uses artificial intelligence to generate personalised focus plans based on information you provide about your energy, mood, goals, and tasks.</P>
          <P>The Service is provided by Shannon Macaulay, trading as Daye, based in the United Kingdom. You can contact us at <a href="mailto:hello@withdaye.com" style={{ color: INK }}>hello@withdaye.com</a>.</P>
        </Section>

        <Section title="Free plan and Daye Pro">
          <P><strong>Free plan:</strong> Daye offers a free plan that includes core features — daily AI focus planning, check-ins, 7 days of history, smart timer, and end-of-day reflections. The free plan is available indefinitely with no credit card required.</P>
          <P><strong>Daye Pro:</strong> Pro is a paid subscription that unlocks additional features including The Letter (quarterly AI letter), extended history (30 days), weekly insight emails, pattern nudges, and more.</P>
          <Ul>
            <Li>Monthly plan: £4.99 per month</Li>
            <Li>Annual plan: £39 per year (equivalent to £3.25/month)</Li>
            <Li>A 7-day free trial is available on all new Pro subscriptions. You will not be charged until the trial ends.</Li>
          </Ul>
        </Section>

        <Section title="Payment and billing">
          <P>Payments for Daye Pro are processed by Stripe. By subscribing, you authorise us to charge your payment method on a recurring monthly or annual basis, depending on the plan you select.</P>
          <P>You may cancel your subscription at any time through your account settings. Cancellation takes effect at the end of the current billing period — you will not receive a refund for unused time, except where required by UK consumer law.</P>
          <P>We reserve the right to change pricing with reasonable notice. We will notify you by email before any price changes affect your subscription.</P>
        </Section>

        <Section title="AI-generated content">
          <P>Daye uses the Anthropic Claude API to generate focus plans, reflective letters, and insights based on the information you provide. These AI-generated outputs are for personal productivity purposes only.</P>
          <P>We make no guarantee as to the accuracy, completeness, or suitability of AI-generated content. Plans and letters are generated dynamically and may not always reflect what would be best for your specific circumstances. You should use your own judgement when acting on any AI-generated suggestion.</P>
          <P>You should not rely on Daye for medical, mental health, legal, or financial advice.</P>
        </Section>

        <Section title="Your data">
          <P>You retain ownership of all data you submit to Daye — your check-ins, tasks, reflections, and profile information. We do not claim any rights over your personal data.</P>
          <P>By using the Service, you grant us a limited licence to process your data in order to provide and improve the Service, as described in our <a href="/privacy-policy" style={{ color: INK }}>Privacy Policy</a>.</P>
          <P>You may delete your account and all associated data at any time via your account settings or by emailing hello@withdaye.com.</P>
        </Section>

        <Section title="Acceptable use">
          <P>You agree not to:</P>
          <Ul>
            <Li>Use the Service for any unlawful purpose or in violation of these terms</Li>
            <Li>Attempt to reverse engineer, scrape, or extract data from the Service</Li>
            <Li>Share your account credentials with others or attempt to access other users' data</Li>
            <Li>Use the Service in a way that could damage, disable, or impair our infrastructure</Li>
            <Li>Use the Service to generate harmful, offensive, or inappropriate content</Li>
          </Ul>
        </Section>

        <Section title="Service availability">
          <P>We aim to keep Daye available at all times, but we do not guarantee uninterrupted access. The Service may be temporarily unavailable due to maintenance, updates, or circumstances beyond our control.</P>
          <P>We reserve the right to modify, suspend, or discontinue any part of the Service with reasonable notice. If we discontinue Daye Pro, we will refund any unused subscription period.</P>
        </Section>

        <Section title="Limitation of liability">
          <P>To the fullest extent permitted by English law, Daye and its operators shall not be liable for any indirect, incidental, or consequential losses arising from your use of the Service.</P>
          <P>Our total liability to you for any claim arising from your use of the Service shall not exceed the amount you paid us in the 12 months preceding the claim.</P>
          <P>Nothing in these terms limits our liability for death or personal injury caused by our negligence, fraud, or any other liability that cannot be excluded by law.</P>
        </Section>

        <Section title="Account termination">
          <P>We reserve the right to suspend or terminate accounts that violate these Terms of Service. We will give reasonable notice where possible, except in cases of serious or repeated violations.</P>
          <P>You may delete your account at any time from your settings. Deletion removes all your personal data from our systems within 30 days.</P>
        </Section>

        <Section title="Governing law">
          <P>These Terms of Service are governed by the laws of England and Wales. Any disputes arising from your use of the Service will be subject to the exclusive jurisdiction of the courts of England and Wales.</P>
        </Section>

        <Section title="Changes to these terms">
          <P>We may update these Terms of Service from time to time. When we make material changes, we will notify you by email or through a notice in the app. Continued use of the Service after changes take effect constitutes acceptance of the updated terms.</P>
        </Section>

        <Section title="Contact">
          <P>If you have any questions about these Terms of Service, please contact us:</P>
          <P><a href="mailto:hello@withdaye.com" style={{ color: INK, fontWeight: 500 }}>hello@withdaye.com</a></P>
        </Section>

        {/* Footer */}
        <div style={{ borderTop: `0.5px solid ${BORDER}`, paddingTop: '32px', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <a href="/privacy-policy" style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: MUTED, textDecoration: 'none' }}>Privacy Policy</a>
          <a href="/" style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: MUTED, textDecoration: 'none' }}>Back to Daye</a>
        </div>
      </div>
    </div>
  )
}
