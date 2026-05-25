'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

type Variant = { id: string; name: string; price: number; compare_at_price?: number | null; description?: string | null }
type Product = {
  id: string; name: string; slug: string; icon: string; category: string
  description: string; includes: string[]; whats_not_included: string[]
  badge: string | null; badge_color: string; active: boolean
  images: string[]; gallery: string[]
  is_hot_selling: boolean; is_on_sale: boolean; is_new: boolean; is_featured: boolean
  sale_price: number | null; delivery_timeline: string | null
  refund_policy: string | null; terms_and_conditions: string | null
  faq: { question: string; answer: string }[]
  product_variants: Variant[]
}

const CATEGORIES = [
  { id: 'all', label: 'All services' },
  { id: 'living', label: 'Living' },
  { id: 'connectivity', label: 'Connectivity' },
  { id: 'travel', label: 'Travel' },
  { id: 'insurance', label: 'Insurance' },
  { id: 'finance', label: 'Finance' },
]

export default function ServicesPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('all')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({})

  useEffect(() => {
    fetch('/api/inventory')
      .then(r => r.json())
      .then(d => {
        const active = (d.items ?? []).filter((p: Product) => p.active)
        setProducts(active)
        const defaults: Record<string, string> = {}
        active.forEach((p: Product) => { if (p.product_variants?.[0]) defaults[p.id] = p.product_variants[0].id })
        setSelectedVariants(defaults)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filtered = category === 'all' ? products : products.filter(p => p.category === category)

  const getMainImage = (p: Product) => p.gallery?.[0] || p.images?.[0] || null

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream, #faf8f3)', fontFamily: 'DM Sans, sans-serif' }}>

      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 40, background: 'rgba(250,248,243,.95)', backdropFilter: 'blur(12px)', borderBottom: '0.5px solid rgba(26,58,42,.1)', padding: '0 40px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div style={{ width: 28, height: 28, background: '#1a3a2a', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 20 20" fill="none" width="14" height="14"><path d="M10 2L3 6V10C3 13.5 6.5 17 10 18C13.5 17 17 13.5 17 10V6L10 2Z" fill="white"/><path d="M7 10L9 12L13 8" stroke="#2e7d52" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <span style={{ fontSize: 15, fontWeight: 500, color: '#0f1f17' }}>Student<span style={{ color: '#2e7d52' }}>Essentials</span></span>
        </Link>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link href="/auth/login" style={{ fontSize: 13, color: '#1a3a2a', textDecoration: 'none', opacity: 0.7 }}>Sign in</Link>
          <Link href="/auth/signup" style={{ fontSize: 13, fontWeight: 500, color: '#fff', background: '#1a3a2a', padding: '8px 18px', borderRadius: 40, textDecoration: 'none' }}>Get started</Link>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '64px 40px 40px' }}>
        <h1 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 42, color: '#0f1f17', marginBottom: 14, fontWeight: 600 }}>
          Everything you need,<br />before you land.
        </h1>
        <p style={{ fontSize: 16, color: '#4b5563', maxWidth: 520, margin: '0 auto 32px', lineHeight: 1.7 }}>
          We sort the essentials — bedding, SIM, flights, insurance — so you arrive as a student, not a tourist.
        </p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
          {CATEGORIES.map(c => (
            <button key={c.id} onClick={() => setCategory(c.id)}
              style={{ padding: '8px 18px', fontSize: 13, fontWeight: 500, borderRadius: 40, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', border: category === c.id ? 'none' : '0.5px solid rgba(26,58,42,.2)', background: category === c.id ? '#1a3a2a' : 'transparent', color: category === c.id ? '#fff' : '#374151' }}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 40px 80px' }}>
        {loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
            {[1,2,3,4,5,6].map(i => <div key={i} style={{ background: '#fff', borderRadius: 18, height: 280, border: '0.5px solid rgba(26,58,42,.08)', opacity: 0.4 }} />)}
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: 80, color: '#9ca3af', fontSize: 14 }}>No services in this category yet.</div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
          {filtered.map(product => {
            const selectedVariantId = selectedVariants[product.id]
            const selectedVariant = product.product_variants?.find(v => v.id === selectedVariantId) ?? product.product_variants?.[0]
            const isExpanded = expanded === product.id
            const mainImage = getMainImage(product)
            const displayPrice = product.is_on_sale && product.sale_price ? product.sale_price : selectedVariant?.price
            const comparePrice = product.is_on_sale && product.sale_price ? selectedVariant?.price : selectedVariant?.compare_at_price

            return (
              <div key={product.id} style={{ background: '#fff', borderRadius: 18, border: '0.5px solid rgba(26,58,42,.08)', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 2px 12px rgba(0,0,0,.04)' }}>

                {/* Image */}
                <div style={{ position: 'relative', height: 150, background: 'linear-gradient(135deg, #f0faf4, #e8f5ec)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                  {mainImage ? (
                    <img src={mainImage} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ fontSize: 52 }}>{product.icon}</div>
                  )}
                  {/* Tags */}
                  <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {product.is_hot_selling && <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 20, background: '#fff7ed', color: '#c2410c' }}>🔥 Hot selling</span>}
                    {product.is_on_sale && <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 20, background: '#fef3c7', color: '#b45309' }}>🏷️ Sale</span>}
                    {product.is_new && <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 20, background: '#eff6ff', color: '#1d4ed8' }}>✨ New</span>}
                  </div>
                  {product.badge && (
                    <span style={{ position: 'absolute', top: 10, right: 10, fontSize: 11, fontWeight: 500, padding: '4px 10px', borderRadius: 20, background: product.badge_color, color: '#fff' }}>
                      {product.badge}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div style={{ padding: '18px 18px 14px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: 15, fontWeight: 500, color: '#0f1f17', marginBottom: 6 }}>{product.name}</div>
                  <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6, marginBottom: 12, flex: 1 }}>{product.description}</div>

                  {/* Variants */}
                  {(product.product_variants?.length ?? 0) > 1 && (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                      {product.product_variants.map(v => (
                        <button key={v.id} onClick={() => setSelectedVariants(prev => ({ ...prev, [product.id]: v.id }))}
                          style={{ padding: '5px 12px', fontSize: 12, borderRadius: 20, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', border: selectedVariantId === v.id ? 'none' : '0.5px solid rgba(26,58,42,.2)', background: selectedVariantId === v.id ? '#1a3a2a' : 'transparent', color: selectedVariantId === v.id ? '#fff' : '#374151' }}>
                          {v.name}{v.price > 0 ? ` · £${v.price}` : ''}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Includes toggle */}
                  {(product.includes?.length ?? 0) > 0 && (
                    <button onClick={() => setExpanded(isExpanded ? null : product.id)}
                      style={{ fontSize: 12, color: '#2e7d52', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0, fontFamily: 'DM Sans, sans-serif', marginBottom: isExpanded ? 10 : 0 }}>
                      {isExpanded ? '▲ Hide details' : "▼ What's included"}
                    </button>
                  )}

                  {isExpanded && (
                    <ul style={{ margin: '0 0 10px', padding: 0, listStyle: 'none' }}>
                      {product.includes?.map((item, i) => (
                        <li key={i} style={{ fontSize: 12, color: '#374151', padding: '4px 0', borderBottom: '0.5px solid rgba(26,58,42,.06)', display: 'flex', gap: 8 }}>
                          <span style={{ color: '#2e7d52', flexShrink: 0 }}>✓</span> {item}
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Price + CTA */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 12, borderTop: '0.5px solid rgba(26,58,42,.06)' }}>
                    <div>
                      <span style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 22, fontWeight: 600, color: product.is_on_sale ? '#c2410c' : '#0f1f17' }}>
                        {displayPrice === 0 ? '0.4% fee' : `£${displayPrice}`}
                      </span>
                      {comparePrice && comparePrice > (displayPrice ?? 0) && (
                        <span style={{ fontSize: 13, color: '#9ca3af', textDecoration: 'line-through', marginLeft: 6 }}>£{comparePrice}</span>
                      )}
                      {(product.product_variants?.length ?? 0) > 1 && <span style={{ fontSize: 11, color: '#9ca3af', marginLeft: 4 }}>from</span>}
                    </div>
                    <Link href="/auth/signup" style={{ fontSize: 13, fontWeight: 500, color: '#fff', background: '#1a3a2a', padding: '9px 18px', borderRadius: 40, textDecoration: 'none' }}>
                      Order now
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
