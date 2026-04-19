import { useNavigate } from 'react-router-dom'

export default function ArticleCard({ article }) {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate(`/blog/${article.slug}`)}
      style={{
        background: 'white',
        border: '0.5px solid var(--color-border)',
        borderRadius: '12px',
        padding: '24px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        transition: 'box-shadow 150ms ease',
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 16px rgba(0,0,0,0.06)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
    >
      <p style={{
        fontFamily: 'var(--font-sans)',
        fontSize: '10px',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        color: 'var(--color-muted)',
        fontWeight: 500,
        margin: 0,
      }}>
        {article.category}
      </p>

      <h2 style={{
        fontFamily: 'var(--font-serif)',
        fontStyle: 'italic',
        fontSize: '22px',
        fontWeight: 400,
        color: 'var(--color-ink)',
        lineHeight: 1.2,
        margin: 0,
      }}>
        {article.title}
      </h2>

      <p style={{
        fontFamily: 'var(--font-sans)',
        fontSize: '13px',
        color: 'var(--color-muted)',
        lineHeight: 1.6,
        margin: 0,
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitLineClamp: 3,
        WebkitBoxOrient: 'vertical',
      }}>
        {article.preview}
      </p>

      <p style={{
        fontFamily: 'var(--font-sans)',
        fontSize: '11px',
        color: 'var(--color-muted)',
        margin: 0,
      }}>
        {article.readTime}
      </p>

      <div style={{ marginTop: 'auto', paddingTop: '8px' }}>
        <span style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '13px',
          color: 'var(--color-ink)',
          textDecoration: 'none',
        }}>
          Read article →
        </span>
      </div>
    </div>
  )
}
