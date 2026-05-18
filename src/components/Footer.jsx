export default function Footer() {
  return (
    <footer style={{
      background: '#f9f7f5',
      borderTop: '1px solid #e8e4e0',
      padding: '24px 20px',
      textAlign: 'center',
      fontFamily: 'var(--font-sans)',
      fontSize: '12px',
      color: '#888888',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '20px',
      flexWrap: 'wrap',
    }}>
      <span>© Daye 2026</span>
      <a
        href="/privacy-policy"
        style={{ color: '#888888', textDecoration: 'none' }}
        onMouseEnter={e => { e.currentTarget.style.color = '#1a1a1a' }}
        onMouseLeave={e => { e.currentTarget.style.color = '#888888' }}
      >
        Privacy Policy
      </a>
      <a
        href="/terms"
        style={{ color: '#888888', textDecoration: 'none' }}
        onMouseEnter={e => { e.currentTarget.style.color = '#1a1a1a' }}
        onMouseLeave={e => { e.currentTarget.style.color = '#888888' }}
      >
        Terms
      </a>
    </footer>
  )
}
