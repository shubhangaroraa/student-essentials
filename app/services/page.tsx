'use client'
import { useState } from 'react'
import Link from 'next/link'

const services = [
  {
    id: 'bedding',
    icon: '🛏️',
    name: 'Bedding & Kitchen Pack',
    category: 'living',
    desc: 'Duvets, pillows, pots, cutlery — waiting in your room on arrival day.',
    includes: ['Duvet, pillow & pillowcases', 'Plates, mugs, pots & cutlery', 'Delivered to your room', 'Free returns within 14 days'],
    variants: [{ name: 'Standard', price: 89 }, { name: 'Premium', price: 119 }, { name: 'Deluxe', price: 149 }],
    badge: 'Most popular',
    badgeColor: '#c8a96e',
  },
  {
    id: 'sim',
    icon: '📱',
    name: 'UK SIM Card',
    category: 'connectivity',
    desc: 'UK number with generous data. Activated before you board.',
    includes: ['UK phone number included', 'Delivered to your home address', 'Works in 180+ countries', 'Top-up easily via app'],
    variants: [{ name: '5GB', price: 14 }, { name: '15GB', price: 22 }, { name: 'Unlimited', price: 35 }],
    badge: 'New plans',
    badgeColor: '#2e7d52',
  },
  {
    id: 'flight',
    icon: '✈️',
    name: 'Flight Tickets',
    category: 'travel',
    desc: 'Best fares from India, Nigeria, Pakistan, China and beyond.',
    includes: ['Student discount applied', 'Flexible date change (free once)', 'Extra baggage available', 'UK visa letter support'],
    variants: [{ name: 'Economy', price: 420 }, { name: 'Flexible', price: 580 }],
    badge: 'Best rates',
    badgeColor: '#c8a96e',
  },
  {
    id: 'travel-insurance',
    icon: '🛡️',
    name: 'Travel Insurance',
    category: 'insurance',
    desc: 'Comprehensive cover for your journey and first year in the UK.',
    includes: ['Medical cover up to £5m', 'Trip cancellation cover', 'Lost baggage up to £2,000', '24/7 emergency helpline'],
    variants: [{ name: 'Single trip', price: 32 }, { name: 'Multi-trip', price: 58 }],
    badge: 'UK regulated',
    badgeColor: '#2e7d52',
  },
  {
    id: 'health-insurance',
    icon: '🏥',
    name: 'Health Insurance',
    category: 'insurance',
    desc: 'Top-up cover for international students alongside the NHS.',
    includes: ['GP & specialist consultations', 'Mental health support', 'Dental & optical top-up', 'Prescription coverage'],
    variants: [{ name: 'Monthly', price: 15 }, { name: 'Annual', price: 150 }],
    badge: 'Recommended',
    badgeColor: '#e8413e',
  },
  {
    id: 'remittance',
    icon: '💸',
    name: 'Foreign Remittance',
    category: 'finance',
    desc: 'Send money to the UK at the lowest guaranteed exchange rate.',
    includes: ['0.4% fee — market-beating', 'Transfers in 1–2 business days', 'Send from India, Nigeria, Pakistan+', 'No minimum transfer amount'],
    variants: [{ name: 'Standard', price: 0 }],
    badge: 'Lowest rate',
    badgeColor: '#e8413e',
  },
  {
    id: 'transfer',
    icon: '🚗',
    name: 'Airport Transfer',
    category: 'travel',
    desc: 'Pre-booked ride from any UK airport directly to your accommodation.',
    includes: ['Meet & greet at arrivals', 'Flight delay monitoring', 'Luggage assistance', 'WhatsApp driver communication'],
    variants: [{ name: 'Heathrow', price: 45 }, { name: 'Gatwick', price: 38 }, { name: 'Manchester', price: 32 }, { name: 'Edinburgh', price: 28 }],
    badge: 'Pre-book',
    badgeColor: '#c8a96e',
  },
]

const categories = [
  { id: 'all', label: 'All services' },
  { id: 'living', label: '🏠 Living' },
  { id: 'connectivity', label: '📱 Connectivity' },
  { id: 'travel', label: '✈️ Travel' },
  { id: 'finance', label: '💸 Finance' },
  { id: 'insurance', label: '🛡️ Insurance' },
]

export default function Services() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [cart, setCart] = useState<Record<string, { name: string; icon: string; price: number; variant: string }>>({})
  const [selectedVariants, setSelectedVariants] = useState<Record<string, number>>({})
  const [cartOpen, setCartOpen] = useState(false)

  const getVariantIndex = (id: string) => selectedVariants[id] ?? 0
  const getPrice = (service: typeof services[0]) => service.variants[getVariantIndex(service.id)].price
  const getVariantName = (service: typeof services[0]) => service.variants[getVariantIndex(service.id)].name

  const addToCart = (service: typeof services[0]) => {
    const newCart = {
      ...cart,
      [service.id]: { name: service.name, icon: service.icon, price: getPrice(service), variant: getVariantName(service) }
    }
    setCart(newCart)
    localStorage.setItem('se_cart', JSON.stringify(newCart))
  }

  const removeFromCart = (id: string) => {
    setCart(prev => {
      const next = { ...prev }
      delete next[id]
      localStorage.setItem('se_cart', JSON.stringify(next))
      return next
    })
  }

  const cartItems = Object.entries(cart)
  const cartTotal = cartItems.reduce((sum, [, item]) => sum + item.price, 0)
  const filtered = activeCategory === 'all' ? services : services.filter(s => s.category === activeCategory)

  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh' }}>

      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '0 5%', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(245,240,232,0.92)', backdropFilter: 'blur(12px)', borderBottom: '0.5px solid var(--border)' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 32, height: 32, background: 'var(--forest)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 20 20" fill="none" width="18" height="18"><path d="M10 2L3 6V10C3 13.5 6.5 17 10 18C13.5 17 17 13.5 17 10V6L10 2Z" fill="white"/><path d="M7 10L9 12L13 8" stroke="#2e7d52" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--bottle)' }}>Student<span style={{ color: 'var(--forest)' }}>Essentials</span></span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => setCartOpen(true)} style={{ position: 'relative', width: 38, height: 38, borderRadius: '50%', background: 'var(--mint)', border: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 17 }}>
            🛒
            {cartItems.length > 0 && (
              <span style={{ position: 'absolute', top: -4, right: -4, width: 18, height: 18, borderRadius: '50%', background: 'var(--forest)', color: '#fff', fontSize: 10, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{cartItems.length}</span>
            )}
          </button>
          <Link href="/auth/login" style={{ padding: '8px 18px', fontSize: 14, color: 'var(--bottle)', border: '0.5px solid rgba(26,58,42,.3)', borderRadius: 40, textDecoration: 'none' }}>Log in</Link>
          <Link href="/auth/signup" style={{ padding: '8px 20px', fontSize: 14, fontWeight: 500, color: '#fff', background: 'var(--forest)', borderRadius: 40, textDecoration: 'none' }}>Sign up free</Link>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ background: 'var(--bottle)', padding: '96px 8% 48px', marginTop: 64 }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--sage)', marginBottom: 14 }}>All services</div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(28px,4vw,44px)', fontWeight: 500, color: '#fff', lineHeight: 1.15, marginBottom: 14 }}>
            Everything before <em style={{ color: 'var(--sage)' }}>you land.</em>
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', maxWidth: 480, lineHeight: 1.7 }}>Browse our full range of pre-departure services. Add what you need and check out in one go.</p>
        </div>
      </div>

      {/* FILTER BAR */}
      <div style={{ background: 'var(--offwhite)', borderBottom: '0.5px solid var(--border)', padding: '0 8%', position: 'sticky', top: 64, zIndex: 90 }}>
        <div style={{ display: 'flex', gap: 0, overflowX: 'auto' }}>
          {categories.map(cat => (
            <button key={cat.id} onClick={() => setActiveCategory(cat.id)} style={{ padding: '14px 20px', fontSize: 13, fontWeight: activeCategory === cat.id ? 500 : 400, color: activeCategory === cat.id ? 'var(--forest)' : 'var(--muted)', background: 'transparent', border: 'none', borderBottom: activeCategory === cat.id ? '2px solid var(--forest)' : '2px solid transparent', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'DM Sans, sans-serif', transition: 'all .2s' }}>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* BUNDLE BANNER */}
      <div style={{ margin: '40px 8% 0', background: 'var(--bottle)', borderRadius: 20, padding: '28px 36px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 500, background: 'rgba(200,169,110,.2)', color: 'var(--gold)', borderRadius: 40, padding: '3px 12px', display: 'inline-block', marginBottom: 10 }}>⭐ Most popular · Saves £48</div>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: 20, color: '#fff', marginBottom: 6 }}>The Complete Settling-In Pack</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', marginBottom: 12 }}>Bedding + SIM + Transfer + Insurance + Remittance</div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,.35)', textDecoration: 'line-through' }}>£232 separately</div>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: 36, color: '#fff' }}>£184</div>
          <div style={{ fontSize: 12, color: 'var(--sage)', marginBottom: 12 }}>You save £48</div>
          <button onClick={() => {
            ['bedding','sim','transfer','travel-insurance','remittance'].forEach(id => {
              const s = services.find(x => x.id === id)!
              setCart(prev => ({ ...prev, [id]: { name: s.name, icon: s.icon, price: s.variants[0].price, variant: s.variants[0].name } }))
            })
            setCartOpen(true)
          }} style={{ padding: '11px 24px', background: 'var(--gold)', color: 'var(--bottle)', border: 'none', borderRadius: 40, fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
            Add bundle to cart →
          </button>
        </div>
      </div>

      {/* SERVICES GRID */}
      <div style={{ padding: '32px 8% 80px' }}>
        <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 20 }}>Individual services</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {filtered.map(service => (
            <div key={service.id} style={{ background: 'var(--offwhite)', border: '0.5px solid var(--border)', borderRadius: 20, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '24px 24px 16px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ width: 50, height: 50, borderRadius: 14, background: 'var(--mint)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{service.icon}</div>
                <span style={{ fontSize: 11, fontWeight: 500, padding: '3px 10px', borderRadius: 40, background: `${service.badgeColor}20`, color: service.badgeColor, border: `0.5px solid ${service.badgeColor}40` }}>{service.badge}</span>
              </div>
              <div style={{ padding: '0 24px 16px', flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--bottle)', marginBottom: 6 }}>{service.name}</div>
                <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 14 }}>{service.desc}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {service.includes.map(item => (
                    <div key={item} style={{ fontSize: 12, color: 'var(--moss)', display: 'flex', alignItems: 'center', gap: 7 }}>
                      <span style={{ color: 'var(--forest)', fontWeight: 500 }}>✓</span> {item}
                    </div>
                  ))}
                </div>
              </div>
              {/* VARIANTS */}
              {service.variants.length > 1 && (
                <div style={{ padding: '0 24px 14px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {service.variants.map((v, i) => (
                    <button key={v.name} onClick={() => setSelectedVariants(prev => ({ ...prev, [service.id]: i }))} style={{ padding: '4px 12px', borderRadius: 40, fontSize: 12, border: '0.5px solid', borderColor: getVariantIndex(service.id) === i ? 'var(--forest)' : 'var(--border)', background: getVariantIndex(service.id) === i ? 'var(--mint)' : 'var(--cream)', color: getVariantIndex(service.id) === i ? 'var(--forest)' : 'var(--muted)', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontWeight: getVariantIndex(service.id) === i ? 500 : 400 }}>
                      {v.name} · £{v.price}
                    </button>
                  ))}
                </div>
              )}
              <div style={{ padding: '14px 24px 22px', borderTop: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>from</div>
                  <div style={{ fontFamily: 'Georgia, serif', fontSize: 26, fontWeight: 500, color: 'var(--bottle)' }}>
                    {getPrice(service) === 0 ? 'Free' : `£${getPrice(service)}`}
                  </div>
                </div>
                <button onClick={() => addToCart(service)} style={{ padding: '10px 20px', fontSize: 13, fontWeight: 500, background: cart[service.id] ? 'var(--mint)' : 'var(--forest)', color: cart[service.id] ? 'var(--forest)' : '#fff', border: cart[service.id] ? '0.5px solid rgba(46,125,82,.3)' : 'none', borderRadius: 40, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', transition: 'all .2s' }}>
                  {cart[service.id] ? '✓ Added' : '+ Add to cart'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CART DRAWER */}
      {cartOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200 }}>
          <div onClick={() => setCartOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.4)' }}></div>
          <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: 380, background: 'var(--offwhite)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '22px 28px 18px', borderBottom: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: 20, color: 'var(--bottle)' }}>Your pack</div>
              <button onClick={() => setCartOpen(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--muted)' }}>✕</button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 28px' }}>
              {cartItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--muted)', fontSize: 14 }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🛒</div>
                  Your cart is empty. Add services above!
                </div>
              ) : cartItems.map(([id, item]) => (
                <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '0.5px solid var(--border)' }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--mint)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>{item.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--bottle)' }}>{item.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{item.variant}</div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--bottle)' }}>{item.price === 0 ? 'Free' : `£${item.price}`}</div>
                  <button onClick={() => removeFromCart(id)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 14 }}>✕</button>
                </div>
              ))}
            </div>
            <div style={{ padding: '18px 28px 28px', borderTop: '0.5px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
                <span style={{ fontSize: 14, color: 'var(--muted)' }}>Total</span>
                <span style={{ fontFamily: 'Georgia, serif', fontSize: 28, color: 'var(--bottle)' }}>£{cartTotal}</span>
              </div>
              <Link href="/checkout" style={{ display: 'block', width: '100%', padding: 14, fontSize: 15, fontWeight: 500, color: '#fff', background: 'var(--forest)', border: 'none', borderRadius: 12, cursor: 'pointer', textAlign: 'center', textDecoration: 'none', fontFamily: 'DM Sans, sans-serif' }}>
                Proceed to checkout →
              </Link>
              <div style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', marginTop: 10 }}>Secure checkout · No hidden fees</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}