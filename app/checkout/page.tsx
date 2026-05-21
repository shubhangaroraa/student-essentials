'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

type CartItem = { id: string; name: string; icon: string; price: number; variant: string }

export default function Checkout() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [step, setStep] = useState(1)
  const [delivery, setDelivery] = useState(0)
  const [promo, setPromo] = useState('')
  const [discount, setDiscount] = useState(0)
  const [promoMsg, setPromoMsg] = useState('')
  const [payMethod, setPayMethod] = useState('card')
  const [form, setForm] = useState({ fname: '', lname: '', email: '', phone: '', uni: '', room: '', street: '', city: '', postcode: '', arrival: '', notes: '' })
  const [card, setCard] = useState({ name: '', number: '', expiry: '', cvv: '', postcode: '' })
  const [loading, setLoading] = useState(false)
  const [orderRef] = useState('SE-2026-' + Math.floor(10000 + Math.random() * 90000))

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
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems,
          customerEmail: form.email,
          deliveryDetails: form,
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
        <div style={{ maxWidth: 860, margin: '0 auto', display: 'flex', alignItems: 'center', padding: '16px 0' }}>
          {['Your pack', 'Delivery', 'Payment'].map((label, i) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: i + 1 <= step ? 'pointer' : 'default' }} onClick={() => i + 1 < step && setStep(i + 1)}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', border: `1.5px solid ${i + 1 === step ? 'var(--bottle)' : i + 1 < step ? 'var(--forest)' : 'var(--border)'}`, background: i + 1 === step ? 'var(--bottle)' : i + 1 < step ? 'var(--forest)' : 'transparent', color: i + 1 <= step ? '#fff' : 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 500 }}>
                  {i + 1 < step ? '✓' : i + 1}
                </div>
                <span style={{ fontSize: 13, fontWeight: i + 1 === step ? 500 : 400, color: i + 1 === step ? 'var(--bottle)' : 'var(--muted)' }}>{label}</span>
              </div>
              {i < 2 && <div style={{ flex: 1, height: '0.5px', background: i + 1 < step ? 'var(--forest)' : 'var(--border)', margin: '0 12px', opacity: 0.4 }}></div>}
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 5%', display: 'grid', gridTemplateColumns: '1fr 360px', gap: 32, alignItems: 'start' }}>

        {/* LEFT */}
        <div>

          {/* STEP 1 */}
          {step === 1 && (
            <div style={{ background: 'var(--offwhite)', border: '0.5px solid var(--border)', borderRadius: 20, overflow: 'hidden', marginBottom: 20 }}>
              <div style={{ padding: '18px 28px', borderBottom: '0.5px solid var(--border)', fontSize: 15, fontWeight: 500, color: 'var(--bottle)' }}>🛒 Review your pack</div>
              <div style={{ padding: '8px 28px' }}>
                {cartItems.length === 0 ? (
                  <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>
                    <div style={{ fontSize: 36, marginBottom: 12 }}>🛒</div>
                    Your cart is empty. <Link href="/services" style={{ color: 'var(--forest)', textDecoration: 'none', fontWeight: 500 }}>Browse services →</Link>
                  </div>
                ) : cartItems.map(item => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: '0.5px solid var(--border)' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--mint)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{item.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--bottle)' }}>{item.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>{item.variant}</div>
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--bottle)' }}>£{item.price}</div>
                  </div>
                ))}
                <div style={{ padding: '16px 0' }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--moss)', marginBottom: 6 }}>Promo / referral code</label>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <input value={promo} onChange={e => setPromo(e.target.value)} placeholder="e.g. STUDENT10" style={{ flex: 1, padding: '10px 14px', fontSize: 14, background: '#fff', border: '0.5px solid rgba(26,58,42,.2)', borderRadius: 10, outline: 'none', fontFamily: 'DM Sans, sans-serif' }} />
                    <button onClick={applyPromo} style={{ padding: '10px 20px', fontSize: 13, fontWeight: 500, color: 'var(--forest)', background: 'transparent', border: '0.5px solid rgba(46,125,82,.4)', borderRadius: 10, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Apply</button>
                  </div>
                  {promoMsg && <div style={{ fontSize: 12, marginTop: 6, color: discount > 0 ? 'var(--forest)' : '#e8413e' }}>{promoMsg}</div>}
                </div>
              </div>
              <div style={{ padding: '16px 28px' }}>
                <button onClick={() => setStep(2)} disabled={cartItems.length === 0} style={{ width: '100%', padding: 14, fontSize: 15, fontWeight: 500, color: '#fff', background: cartItems.length === 0 ? 'var(--muted)' : 'var(--forest)', border: 'none', borderRadius: 12, cursor: cartItems.length === 0 ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Continue to delivery →</button>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div style={{ background: 'var(--offwhite)', border: '0.5px solid var(--border)', borderRadius: 20, overflow: 'hidden', marginBottom: 20 }}>
              <div style={{ padding: '18px 28px', borderBottom: '0.5px solid var(--border)', fontSize: 15, fontWeight: 500, color: 'var(--bottle)' }}>📦 Delivery details</div>
              <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  {[['First name', 'fname', 'Priya'], ['Last name', 'lname', 'Sharma']].map(([label, key, ph]) => (
                    <div key={key}>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--moss)', marginBottom: 6 }}>{label}</label>
                      <input value={form[key as keyof typeof form]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} placeholder={ph} style={{ width: '100%', padding: '10px 14px', fontSize: 14, background: '#fff', border: '0.5px solid rgba(26,58,42,.2)', borderRadius: 10, outline: 'none', fontFamily: 'DM Sans, sans-serif' }} />
                    </div>
                  ))}
                </div>
                {[['Email address', 'email', 'priya@example.com', 'email'], ['Phone (WhatsApp)', 'phone', '+44 7700 000000', 'tel'], ['University / accommodation name', 'uni', 'Liberty Living Manchester', 'text'], ['Room number', 'room', 'Room 214, Block B', 'text'], ['Street address', 'street', '12 Oxford Road', 'text']].map(([label, key, ph, type]) => (
                  <div key={key}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--moss)', marginBottom: 6 }}>{label}</label>
                    <input type={type} value={form[key as keyof typeof form]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} placeholder={ph} style={{ width: '100%', padding: '10px 14px', fontSize: 14, background: '#fff', border: '0.5px solid rgba(26,58,42,.2)', borderRadius: 10, outline: 'none', fontFamily: 'DM Sans, sans-serif' }} />
                  </div>
                ))}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  {[['City', 'city', 'Manchester'], ['Postcode', 'postcode', 'M1 3BB']].map(([label, key, ph]) => (
                    <div key={key}>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--moss)', marginBottom: 6 }}>{label}</label>
                      <input value={form[key as keyof typeof form]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} placeholder={ph} style={{ width: '100%', padding: '10px 14px', fontSize: 14, background: '#fff', border: '0.5px solid rgba(26,58,42,.2)', borderRadius: 10, outline: 'none', fontFamily: 'DM Sans, sans-serif' }} />
                    </div>
                  ))}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--moss)', marginBottom: 6 }}>Arrival date</label>
                  <input type="date" value={form.arrival} onChange={e => setForm(p => ({ ...p, arrival: e.target.value }))} style={{ width: '100%', padding: '10px 14px', fontSize: 14, background: '#fff', border: '0.5px solid rgba(26,58,42,.2)', borderRadius: 10, outline: 'none', fontFamily: 'DM Sans, sans-serif' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--moss)' }}>Delivery option</label>
                  {[['Standard — delivered by arrival day', 'Items arrive 1–2 days before your arrival', 'Free', 0], ['Express — next business day', 'Order before 12pm for next-day delivery', '£12', 12]].map(([name, desc, price, cost]) => (
                    <div key={name as string} onClick={() => setDelivery(cost as number)} style={{ padding: '14px 18px', borderRadius: 12, border: `0.5px solid ${delivery === cost ? 'var(--forest)' : 'var(--border)'}`, background: delivery === cost ? 'var(--mint)' : '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--bottle)' }}>{name}</div>
                        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{desc}</div>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--forest)' }}>{price}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ padding: '0 28px 24px' }}>
                <button onClick={() => setStep(3)} style={{ width: '100%', padding: 14, fontSize: 15, fontWeight: 500, color: '#fff', background: 'var(--forest)', border: 'none', borderRadius: 12, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Continue to payment →</button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div style={{ background: 'var(--offwhite)', border: '0.5px solid var(--border)', borderRadius: 20, overflow: 'hidden', marginBottom: 20 }}>
              <div style={{ padding: '18px 28px', borderBottom: '0.5px solid var(--border)', fontSize: 15, fontWeight: 500, color: 'var(--bottle)' }}>💳 Payment</div>
              <div style={{ padding: '24px 28px' }}>
                <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
                  {[['💳', 'Card', 'card'], ['G', 'Google Pay', 'gpay'], ['🇮🇳', 'UPI', 'upi']].map(([icon, label, id]) => (
                    <div key={id} onClick={() => setPayMethod(id as string)} style={{ flex: 1, padding: '12px', borderRadius: 10, border: `0.5px solid ${payMethod === id ? 'var(--forest)' : 'var(--border)'}`, background: payMethod === id ? 'var(--mint)' : '#fff', cursor: 'pointer', textAlign: 'center' }}>
                      <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
                      <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--bottle)' }}>{label}</div>
                    </div>
                  ))}
                </div>
                {payMethod === 'card' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {[['Name on card', 'name', 'PRIYA SHARMA', 'text'], ['Card number', 'number', '1234 5678 9012 3456', 'text']].map(([label, key, ph, type]) => (
                      <div key={key}>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--moss)', marginBottom: 6 }}>{label}</label>
                        <input type={type} value={card[key as keyof typeof card]} onChange={e => setCard(p => ({ ...p, [key]: e.target.value }))} placeholder={ph} style={{ width: '100%', padding: '10px 14px', fontSize: 14, background: '#fff', border: '0.5px solid rgba(26,58,42,.2)', borderRadius: 10, outline: 'none', fontFamily: 'DM Sans, sans-serif' }} />
                      </div>
                    ))}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                      {[['Expiry', 'expiry', 'MM/YY'], ['CVV', 'cvv', '123'], ['Postcode', 'postcode', 'M1 3BB']].map(([label, key, ph]) => (
                        <div key={key}>
                          <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--moss)', marginBottom: 6 }}>{label}</label>
                          <input value={card[key as keyof typeof card]} onChange={e => setCard(p => ({ ...p, [key]: e.target.value }))} placeholder={ph} style={{ width: '100%', padding: '10px 14px', fontSize: 14, background: '#fff', border: '0.5px solid rgba(26,58,42,.2)', borderRadius: 10, outline: 'none', fontFamily: 'DM Sans, sans-serif' }} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {payMethod === 'gpay' && <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--muted)', fontSize: 14 }}>Google Pay will open automatically at checkout.</div>}
                {payMethod === 'upi' && (
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--moss)', marginBottom: 6 }}>UPI ID</label>
                    <input placeholder="yourname@upi" style={{ width: '100%', padding: '10px 14px', fontSize: 14, background: '#fff', border: '0.5px solid rgba(26,58,42,.2)', borderRadius: 10, outline: 'none', fontFamily: 'DM Sans, sans-serif' }} />
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>Supports PhonePe, GPay, Paytm and all UPI apps</div>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 20, padding: '16px 0', marginTop: 8, borderTop: '0.5px solid var(--border)' }}>
                  {['🔒 256-bit SSL', '✓ PCI DSS', '🛡️ Stripe', '↩ 14-day returns'].map(b => (
                    <div key={b} style={{ fontSize: 11, color: 'var(--muted)' }}>{b}</div>
                  ))}
                </div>
              </div>
              <div style={{ padding: '0 28px 24px' }}>
                <button onClick={placeOrder} disabled={loading} style={{ width: '100%', padding: 14, fontSize: 15, fontWeight: 500, color: '#fff', background: loading ? 'var(--muted)' : 'var(--forest)', border: 'none', borderRadius: 12, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                  {loading ? '⏳ Redirecting to Stripe…' : `🔒 Pay £${total} securely`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ORDER SUMMARY */}
        <div style={{ background: 'var(--offwhite)', border: '0.5px solid var(--border)', borderRadius: 20, overflow: 'hidden', position: 'sticky', top: 80 }}>
          <div style={{ padding: '18px 24px', borderBottom: '0.5px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--bottle)' }}>Your pack</div>
            <Link href="/services" style={{ fontSize: 12, color: 'var(--forest)', textDecoration: 'none' }}>Edit</Link>
          </div>
          <div style={{ padding: '8px 24px' }}>
            {cartItems.map(item => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '0.5px solid var(--border)' }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--mint)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{item.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--bottle)' }}>{item.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>{item.variant}</div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--bottle)' }}>£{item.price}</div>
              </div>
            ))}
          </div>
          <div style={{ padding: '16px 24px', borderTop: '0.5px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--muted)', marginBottom: 8 }}>
              <span>Subtotal</span><span>£{subtotal}</span>
            </div>
            {discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--forest)', marginBottom: 8 }}>
                <span>Discount</span><span>-£{discount}</span>
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