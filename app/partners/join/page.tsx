'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function PartnersJoin() {
  const [step, setStep] = useState<'form' | 'success'>('form')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [utmCode, setUtmCode] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const fd = new FormData(e.currentTarget)

    try {
      const res = await fetch('/api/partners/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          org_name: fd.get('org_name'),
          contact_name: fd.get('contact_name'),
          contact_email: fd.get('contact_email'),
          contact_phone: fd.get('contact_phone'),
          institution_type: fd.get('institution_type'),
          student_count: fd.get('student_count'),
          message: fd.get('message'),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setUtmCode(data.utm_code)
      setStep('success')
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const inp: React.CSSProperties = {
    width: '100%', padding: '11px 14px', fontSize: 14,
    border: '0.5px solid rgba(26,58,42,.2)', borderRadius: 10,
    outline: 'none', fontFamily: 'DM Sans, sans-serif',
    background: '#fff', boxSizing: 'border-box',
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream, #faf8f3)', fontFamily: 'DM Sans, sans-serif' }}>

      {/* Nav */}
      <nav style={{ padding: '0 40px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '0.5px solid rgba(26,58,42,.1)', background: '#fff' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div style={{ width: 28, height: 28, background: '#1a3a2a', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg viewBox="0 0 20 20" fill="none" width="14" height="14"><path d="M10 2L3 6V10C3 13.5 6.5 17 10 18C13.5 17 17 13.5 17 10V6L10 2Z" fill="white"/><path d="M7 10L9 12L13 8" stroke="#2e7d52" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <span style={{ fontSize: 15, fontWeight: 500, color: '#0f1f17' }}>Student<span style={{ color: '#2e7d52' }}>Essentials</span></span>
        </Link>
        <Link href="/auth/signup" style={{ fontSize: 13, color: '#1a3a2a', textDecoration: 'none', padding: '8px 18px', border: '0.5px solid rgba(26,58,42,.3)', borderRadius: 40 }}>
          Student signup →
        </Link>
      </nav>

      {step === 'form' ? (
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'start' }}>

          {/* Left — pitch */}
          <div>
            <div style={{ display: 'inline-block', fontSize: 12, fontWeight: 500, color: '#2e7d52', background: 'rgba(46,125,82,.1)', padding: '5px 14px', borderRadius: 20, marginBottom: 20, letterSpacing: '.04em', textTransform: 'uppercase' }}>
              Ed-Partner Programme
            </div>
            <h1 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 40, lineHeight: 1.2, color: '#0f1f17', marginBottom: 20, fontWeight: 600 }}>
              Help your students<br />arrive ready.
            </h1>
            <p style={{ fontSize: 16, color: '#4b5563', lineHeight: 1.7, marginBottom: 32 }}>
              Partner with Student Essentials to give your students seamless access to bedding packs, SIM cards, airport transfers, insurance and more — before they even land in the UK.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 40 }}>
              {[
                ['🔗', 'Your own referral link', 'A unique UTM link tied to your institution. Share it with students and track every signup.'],
                ['💷', 'Commission on every order', 'Earn 5–10% commission on every order placed by your referred students.'],
                ['📊', 'Partner dashboard', 'See your referrals, orders, and earnings in real time.'],
                ['🎓', 'Co-branded materials', 'We provide branded flyers, email templates and onboarding guides for your students.'],
              ].map(([icon, title, desc]) => (
                <div key={title as string} style={{ display: 'flex', gap: 14, padding: '16px 20px', background: '#fff', borderRadius: 14, border: '0.5px solid rgba(26,58,42,.1)' }}>
                  <div style={{ fontSize: 22, flexShrink: 0, marginTop: 2 }}>{icon}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#0f1f17', marginBottom: 4 }}>{title as string}</div>
                    <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>{desc as string}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ padding: '18px 22px', background: 'rgba(46,125,82,.06)', borderRadius: 14, border: '0.5px solid rgba(46,125,82,.15)' }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#1a3a2a', marginBottom: 8 }}>Commission tiers</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                {[['Bronze', '1–10 students', '5%'], ['Silver', '11–25 students', '7%'], ['Gold', '26+ students', '10%']].map(([tier, range, rate]) => (
                  <div key={tier} style={{ textAlign: 'center', padding: '12px 8px', background: '#fff', borderRadius: 10 }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#1a3a2a' }}>{rate}</div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: '#374151', marginTop: 2 }}>{tier}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{range}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right — form */}
          <div style={{ background: '#fff', padding: '36px', borderRadius: 20, border: '0.5px solid rgba(26,58,42,.12)', boxShadow: '0 4px 24px rgba(0,0,0,.06)' }}>
            <h2 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 22, color: '#0f1f17', marginBottom: 6 }}>Apply to partner</h2>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 24 }}>We'll review and get back within 1 business day.</p>

            {error && (
              <div style={{ padding: '10px 14px', background: '#fef2f2', border: '0.5px solid #fca5a5', borderRadius: 8, fontSize: 13, color: '#dc2626', marginBottom: 16 }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 5 }}>Organisation name *</label>
                <input name="org_name" required placeholder="Greenfield College" style={inp} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 5 }}>Your name *</label>
                  <input name="contact_name" required placeholder="Ravi Kumar" style={inp} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 5 }}>Phone</label>
                  <input name="contact_phone" placeholder="+91 98765 43210" style={inp} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 5 }}>Work email *</label>
                <input name="contact_email" type="email" required placeholder="ravi@greenfield.edu" style={inp} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 5 }}>Institution type *</label>
                <select name="institution_type" required style={{ ...inp, appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: 16, paddingRight: 36 }}>
                  <option value="">Select…</option>
                  <option>University / College</option>
                  <option>Study Abroad Agency</option>
                  <option>Education Consultancy</option>
                  <option>Student Accommodation Provider</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 5 }}>How many students do you send to the UK per year?</label>
                <select name="student_count" style={{ ...inp, appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: 16, paddingRight: 36 }}>
                  <option>1–10</option>
                  <option>11–25</option>
                  <option>26–50</option>
                  <option>50–100</option>
                  <option>100+</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 5 }}>Anything else you'd like us to know?</label>
                <textarea name="message" rows={3} placeholder="Tell us about your students, intake dates, or any specific needs…" style={{ ...inp, resize: 'vertical', minHeight: 80 }} />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{ padding: '13px', fontSize: 14, fontWeight: 500, background: loading ? 'rgba(26,58,42,.4)' : '#1a3a2a', color: '#fff', border: 'none', borderRadius: 40, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans, sans-serif', marginTop: 4 }}
              >
                {loading ? 'Submitting…' : 'Submit application'}
              </button>

              <p style={{ fontSize: 11, color: '#9ca3af', textAlign: 'center', lineHeight: 1.6 }}>
                By submitting you agree to our partner terms. We don't share your data with third parties.
              </p>
            </form>
          </div>
        </div>
      ) : (
        /* Success state */
        <div style={{ maxWidth: 560, margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
          <div style={{ width: 72, height: 72, background: 'rgba(46,125,82,.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 24px' }}>✅</div>
          <h1 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 32, color: '#0f1f17', marginBottom: 12 }}>Application received!</h1>
          <p style={{ fontSize: 15, color: '#4b5563', lineHeight: 1.7, marginBottom: 32 }}>
            Thank you for applying to the Student Essentials Ed-Partner Programme. Our team will review your application and get back to you within 1 business day.
          </p>

          <div style={{ background: '#fff', border: '0.5px solid rgba(26,58,42,.12)', borderRadius: 16, padding: '24px', marginBottom: 32, textAlign: 'left' }}>
            <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>Your provisional referral link (active once approved):</div>
            <div style={{ fontSize: 14, fontFamily: 'monospace', color: '#1a3a2a', background: 'rgba(46,125,82,.06)', padding: '10px 14px', borderRadius: 8, wordBreak: 'break-all' }}>
              https://student-essentials.com/?utm_partner={utmCode}
            </div>
            <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 8 }}>Save this — we'll confirm it in our reply email.</div>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Link href="/" style={{ padding: '11px 24px', fontSize: 13, fontWeight: 500, color: '#1a3a2a', border: '0.5px solid rgba(26,58,42,.3)', borderRadius: 40, textDecoration: 'none' }}>
              Back to home
            </Link>
            <a href="mailto:care@student-essentials.com" style={{ padding: '11px 24px', fontSize: 13, fontWeight: 500, color: '#fff', background: '#1a3a2a', borderRadius: 40, textDecoration: 'none' }}>
              Email us directly
            </a>
          </div>
        </div>
      )}
    </div>
  )
}