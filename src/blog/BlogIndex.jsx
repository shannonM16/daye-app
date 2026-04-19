import { articles } from './articles'
import ArticleCard from './ArticleCard'

export default function BlogIndex() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-linen)',
      fontFamily: 'var(--font-sans)',
    }}>
      <div style={{
        maxWidth: '860px',
        margin: '0 auto',
        padding: '60px 20px',
      }}>
        {/* Wordmark */}
        <div style={{ marginBottom: '48px' }}>
          <a
            href="https://withdaye.com"
            style={{
              fontFamily: 'var(--font-serif)',
              fontStyle: 'italic',
              fontSize: '22px',
              fontWeight: 300,
              color: 'var(--color-ink)',
              textDecoration: 'none',
            }}
          >
            daye
          </a>
        </div>

        {/* Header */}
        <h1 style={{
          fontFamily: 'var(--font-serif)',
          fontStyle: 'italic',
          fontSize: '48px',
          fontWeight: 400,
          color: 'var(--color-ink)',
          lineHeight: 1.15,
          margin: '0 0 16px 0',
        }}>
          Thoughts on focus, work, and getting things done.
        </h1>

        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '15px',
          color: 'var(--color-muted)',
          margin: '0 0 36px 0',
          lineHeight: 1.5,
        }}>
          Ideas for people who want to do their best work every day.
        </p>

        {/* Divider */}
        <div style={{
          height: '0.5px',
          background: 'var(--color-border)',
          marginBottom: '40px',
        }} />

        {/* Article grid */}
        <div className="blog-grid">
          {articles.map(article => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      </div>
    </div>
  )
}
