import { useNavigate } from 'react-router-dom'
import { articles } from './articles'
import ArticleCard from './ArticleCard'

function BodyBlock({ block }) {
  if (block.type === 'subheading') {
    return (
      <p style={{
        fontFamily: 'var(--font-sans)',
        fontSize: '16px',
        fontWeight: 500,
        color: 'var(--color-ink)',
        lineHeight: 1.8,
        margin: '2rem 0 0 0',
      }}>
        {block.text}
      </p>
    )
  }

  if (block.type === 'pullquote') {
    return (
      <p style={{
        fontFamily: 'var(--font-serif)',
        fontStyle: 'italic',
        fontSize: '20px',
        color: 'var(--color-muted)',
        lineHeight: 1.6,
        margin: '1.5rem 0',
        borderLeft: '3px solid var(--color-lavender)',
        paddingLeft: '20px',
      }}>
        {block.text}
      </p>
    )
  }

  return (
    <p style={{
      fontFamily: 'var(--font-sans)',
      fontSize: '16px',
      color: 'var(--color-ink)',
      lineHeight: 1.8,
      margin: '1.5rem 0 0 0',
    }}>
      {block.text}
    </p>
  )
}

export default function ArticlePage({ slug }) {
  const navigate = useNavigate()
  const article = articles.find(a => a.slug === slug)
  const otherArticles = articles.filter(a => a.slug !== slug)

  if (!article) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-linen)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--color-muted)', marginBottom: '16px' }}>Article not found.</p>
          <button
            onClick={() => navigate('/blog')}
            style={{ background: 'none', border: 'none', fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--color-ink)', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
          >
            ← Back to blog
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-linen)',
      fontFamily: 'var(--font-sans)',
    }}>
      <div style={{
        maxWidth: '680px',
        margin: '0 auto',
        padding: '60px 20px',
      }}>
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '36px' }}>
          <a
            href="/"
            style={{
              fontFamily: 'var(--font-serif)',
              fontStyle: 'italic',
              fontSize: '18px',
              fontWeight: 300,
              color: 'var(--color-ink)',
              textDecoration: 'none',
              cursor: 'pointer',
              transition: 'opacity 0.15s',
            }}
            className="hover:opacity-70"
          >
            daye
          </a>
          <button
            onClick={() => navigate('/blog')}
            style={{
              background: 'none',
              border: 'none',
              fontFamily: 'var(--font-sans)',
              fontSize: '13px',
              color: 'var(--color-muted)',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            ← Back to blog
          </button>
        </div>

        {/* Category */}
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '10px',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: 'var(--color-muted)',
          fontWeight: 500,
          margin: '0 0 14px 0',
        }}>
          {article.category}
        </p>

        {/* Title */}
        <h1 className="blog-article-title" style={{
          fontFamily: 'var(--font-serif)',
          fontStyle: 'italic',
          fontWeight: 400,
          color: 'var(--color-ink)',
          lineHeight: 1.15,
          margin: '0 0 20px 0',
        }}>
          {article.title}
        </h1>

        {/* Author + read time */}
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '12px',
          color: 'var(--color-muted)',
          margin: '0 0 24px 0',
        }}>
          {article.author} · {article.readTime}
        </p>

        {/* Divider */}
        <div style={{ height: '0.5px', background: 'var(--color-border)', marginBottom: '8px' }} />

        {/* Article body */}
        <article>
          {article.body.map((block, i) => (
            <BodyBlock key={i} block={block} />
          ))}
        </article>

        {/* Bottom divider */}
        <div style={{ height: '0.5px', background: 'var(--color-border)', margin: '52px 0 40px' }} />

        {/* CTA card */}
        <div style={{
          background: 'white',
          border: '0.5px solid var(--color-border)',
          borderRadius: '12px',
          padding: '24px',
        }}>
          <h3 style={{
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            fontSize: '22px',
            fontWeight: 400,
            color: 'var(--color-ink)',
            margin: '0 0 8px 0',
            lineHeight: 1.2,
          }}>
            Ready to put this into practice?
          </h3>
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            color: 'var(--color-muted)',
            margin: '0 0 20px 0',
            lineHeight: 1.6,
          }}>
            Build your focus plan for today in 60 seconds.
          </p>
          <a
            href="https://withdaye.com"
            style={{
              display: 'block',
              width: '100%',
              background: 'var(--color-ink)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 20px',
              fontFamily: 'var(--font-sans)',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              textAlign: 'center',
              textDecoration: 'none',
              boxSizing: 'border-box',
            }}
          >
            Start with Daye
          </a>
        </div>

        {/* More from the blog */}
        <div style={{ marginTop: '52px' }}>
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '10px',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'var(--color-muted)',
            fontWeight: 500,
            margin: '0 0 20px 0',
          }}>
            More from the blog
          </p>
          <div className="blog-grid">
            {otherArticles.map(a => (
              <ArticleCard key={a.slug} article={a} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
