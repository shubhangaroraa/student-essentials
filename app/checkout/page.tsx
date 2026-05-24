'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

type CartItem = { id: string; name: string; icon: string; price: number; variant: string }

export default function Checkout() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [step, setStep] = useState(1)
  const [delivery, setDelivery] = useState(0)
  const [promo, setPromo] = useState('')
  const [discount, setDiscount] = useState(0)
  const [promoMsg, setPromoMsg] = useState('')
  const [form, setForm] = useState({ fname: '', lname: '', email: '', phone: '', uni: '', room: '', street: '', city: '', postcode: '', arrival: '', notes: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('se_cart')
    if (saved) {
      const parsed = JSON.parse(saved)
      setCartItems(Object.values(parsed))
    }
  }, [])

  const subtotal = cartItems.reduce((s, i) => s + i.price, 0)
  const total = Math.max(0, subtotal - discount + delivery)

  const applyPromo = () => {
    const codes: Record<string, number> = { 'AGENT20': 20, 'STUDENT10': 10, 'WELCOME15': 15 }
    const code = promo.toUpperCase()
    if (codes[code]) { setDiscount(codes[code]); setPromoMsg(`✓ £${codes[code]} discount applied!`) }
    else setPromoMsg('Invalid code. Try STUDENT10')
  }

  const placeOrder = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems,
          customerEmail: form.email,
          deliveryDetails: form,
          userId: user?.id ?? null,
        }),
      })
      const data = await response.json()
      if (data.url) {
        localStorage.removeItem('se_cart')
        window.location.href = data.url
      } else {
        setLoading(false)
        alert('Payment failed — please try again.')
      }
    } catch (error) {
      setLoading(false)
      alert('Something went wrong — please try again.')
    }
  }

  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh' }}>

      {/* NAV */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, padding: '0 5%', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(245,240,232,.95)', backdropFilter: 'blur(12px)', borderBottom: '0.5px solid var(--border)' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 32, height: 32, background: 'var(--forest)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 20 20" fill="none" width="18" height="18"><path d="M10 2L3 6V10C3 13.5 6.5 17 10 18C13.5 17 17 13.5 17 10V6L10 2Z" fill="white"/><path d="M7 10L9 12L13 8" stroke="#2e7d52" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--bottle)' }}>Student<span style={{ color: 'var(--forest)' }}>Essentials</span></span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--muted)' }}>
          <span>🔒</span> Secure checkout
        </div>
        <Link href="/services" style={{ fontSize: 13, color: 'var(--muted)', textDecoration: 'none' }}>← Back to services</Link>
      </nav>

      {/* PROGRESS */}
      <div style={{ background: 'var(--offwhite)', borderBottom: '0.5px solid var(--border)', padding: '0 5%' }}>
        <div style={{ display: 'flex', gap: 0, maxWidth: 700, margin: '0 auto' }}>
          {['Your details', 'Review & pay'].map((label, i) => (
            <div key={label} style={{ padding: '14px 0', marginRight: 32, fontSize: 13, fontWeight: step === i + 1 ? 600 : 400, color: step === i + 1 ? 'var(--forest)' : 'var(--muted)', borderBottom: step === i + 1 ? '2px solid var(--forest)' : '2px solid transparent', cursor: 'pointer' }} onClick={() => i < step && setStep(i + 1)}>
              {i + 1}. {label}
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 5%', display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>

        {/* LEFT: FORM */}
        <div>
          {step === 1 && (
            <div style={{ background: 'var(--offwhite)', border: '0.5px solid var(--border)', borderRadius: 16, padding: '28px' }}>
              <div style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 20, color: 'var(--bottle)', marginBottom: 22 }}>Your details</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                {[['First name', 'fname'], ['Last name', 'lname'], ['Email address', 'email'], ['Phone number', 'phone'], ['University', 'uni'], ['Room number', 'room']].map(([label, key]) => (
                  <div key={key} style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--moss)', marginBottom: 6 }}>{label}</label>
                    <input value={form[key as keyof typeof form]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} style={{ width: '100%', padding: '10px 14px', fontSize: 14, background: '#fff', border: '0.5px solid rgba(26,58,42,.2)', borderRadius: 10, outline: 'none', fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box' }} />
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--moss)', marginBottom: 6 }}>Street address</label>
                <input value={form.street} onChange={e => setForm(f => ({ ...f, street: e.target.value }))} style={{ width: '100%', padding: '10px 14px', fontSize: 14, background: '#fff', border: '0.5px solid rgba(26,58,42,.2)', borderRadius: 10, outline: 'none', fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px', marginBottom: 16 }}>
                {[['City', 'city'], ['Postcode', 'postcode']].map(([label, key]) => (
                  <div key={key}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--moss)', marginBottom: 6 }}>{label}</label>
                    <input value={form[key as keyof typeof form]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} style={{ width: '100%', padding: '10px 14px', fontSize: 14, background: '#fff', border: '0.5px solid rgba(26,58,42,.2)', borderRadius: 10, outline: 'none', fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box' }} />
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--moss)', marginBottom: 6 }}>Arrival date</label>
                <input type="date" value={form.arrival} onChange={e => setForm(f => ({ ...f, arrival: e.target.value }))} style={{ width: '100%', padding: '10px 14px', fontSize: 14, background: '#fff', border: '0.5px solid rgba(26,58,42,.2)', borderRadius: 10, outline: 'none', fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--moss)', marginBottom: 6 }}>Notes (optional)</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3} style={{ width: '100%', padding: '10px 14px', fontSize: 14, background: '#fff', border: '0.5px solid rgba(26,58,42,.2)', borderRadius: 10, outline: 'none', fontFamily: 'DM Sans, sans-serif', resize: 'vertical', boxSizing: 'border-box' }} />
              </div>
              <button onClick={() => setStep(2)} style={{ width: '100%', padding: 14, fontSize: 15, fontWeight: 500, color: '#fff', background: 'var(--forest)', border: 'none', borderRadius: 12, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                Continue to payment →
              </button>
            </div>
          )}

          {step === 2 && (
            <div style={{ background: 'var(--offwhite)', border: '0.5px solid var(--border)', borderRadius: 16, padding: '28px' }}>
              <div style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 20, color: 'var(--bottle)', marginBottom: 22 }}>Review & pay</div>

              <div style={{ background: 'rgba(26,58,42,.04)', borderRadius: 12, padding: '16px 20px', marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--bottle)', marginBottom: 10 }}>Delivery to</div>
                <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7 }}>
                  {form.fname} {form.lname} · {form.email}<br />
                  {form.uni}{form.room ? `, Room ${form.room}` : ''}<br />
                  {form.street}{form.city ? `, ${form.city}` : ''}{form.postcode ? ` ${form.postcode}` : ''}
                </div>
                <button onClick={() => setStep(1)} style={{ fontSize: 12, color: 'var(--forest)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', padding: 0, marginTop: 8 }}>Edit details</button>
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--bottle)', marginBottom: 10 }}>Your order</div>
                {cartItems.map(item => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '0.5px solid var(--border)' }}>
                    <div style={{ fontSize: 22 }}>{item.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--bottle)' }}>{item.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>{item.variant}</div>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--bottle)' }}>£{item.price}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                <input value={promo} onChange={e => setPromo(e.target.value)} placeholder="Promo code" style={{ flex: 1, padding: '10px 14px', fontSize: 14, background: '#fff', border: '0.5px solid rgba(26,58,42,.2)', borderRadius: 10, outline: 'none', fontFamily: 'DM Sans, sans-serif' }} />
                <button onClick={applyPromo} style={{ padding: '10px 18px', fontSize: 13, fontWeight: 500, background: 'var(--forest)', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Apply</button>
              </div>
              {promoMsg && <div style={{ fontSize: 12, color: discount > 0 ? 'var(--forest)' : '#ef4444', marginBottom: 16 }}>{promoMsg}</div>}

              <button onClick={placeOrder} disabled={loading} style={{ width: '100%', padding: 14, fontSize: 15, fontWeight: 500, color: '#fff', background: loading ? 'var(--muted)' : 'var(--forest)', border: 'none', borderRadius: 12, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                {loading ? 'Redirecting to Stripe…' : `Pay £${total} securely`}
              </button>
            </div>
          )}
        </div>

        {/* RIGHT: ORDER SUMMARY */}
        <div style={{ background: 'var(--offwhite)', border: '0.5px solid var(--border)', borderRadius: 16, overflow: 'hidden', position: 'sticky', top: 80 }}>
          <div style={{ padding: '18px 24px', borderBottom: '0.5px solid var(--border)', fontFamily: 'Playfair Display, Georgia, serif', fontSize: 16, color: 'var(--bottle)' }}>Order summary</div>
          <div style={{ padding: '16px 24px' }}>
            {cartItems.length === 0 && <div style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center', padding: '12px 0' }}>No items in cart</div>}
            {cartItems.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ fontSize: 13, color: 'var(--bottle)' }}>{item.icon} {item.name}</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--bottle)' }}>£{item.price}</div>
              </div>
            ))}
            {discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--forest)', marginBottom: 12 }}>
                <span>Discount</span><span>−£{discount}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--muted)', marginBottom: 12 }}>
              <span>Delivery</span><span>{delivery === 0 ? 'Free' : `£${delivery}`}</span>
            </div>
            <div style={{ height: '0.5px', background: 'var(--border)', marginBottom: 12 }}></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--bottle)' }}>Total</span>
              <span style={{ fontFamily: 'Georgia, serif', fontSize: 28, fontWeight: 500, color: 'var(--bottle)' }}>£{total}</span>
            </div>
          </div>
          <div style={{ padding: '0 24px 20px' }}>
            {['✓ Free delivery to your accommodation', '✓ 14-day returns on physical items', '✓ Secure payment via Stripe', '🔒 Your data is never sold'].map(t => (
              <div key={t} style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>{t}</div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
