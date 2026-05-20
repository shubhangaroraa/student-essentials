'use client'
import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

function SuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [orderRef] = useState('SE-' + new Date().getFullYear() + '-' + Math.floor(10000 + Math.random() * 90000))

  return (
    <main style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div style={{ textAlign: 'center', maxWidth: 540 }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--mint)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, margin: '0 auto 24px' }}>✅</div>
        <h1 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 36, fontWeight: 500, color: 'var(--bottle)', marginBottom: 12 }}>Payment confirmed!</h1>
        <p style={{ fontSize: 16, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 28 }}>
          Your pack is booked. We will send a confirmation to your email and keep you updated on WhatsApp.
        </p>
        <div style={{ background: 'var(--mint)', borderRadius: 14, padding: '16px 24px', display: 'inline-flex', alignItems: 'center', gap: 16, marginBottom: 36 }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>Order reference</div>
            <div style={{ fontSize: 18, fontWeight: 500, color: 'var(--bottle)', fontFamily: 'monospace' }}>{orderRef}</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 36 }}>
          {[
            ['📧', 'Check your email', 'Confirmation within 5 mins'],
            ['📱', 'WhatsApp updates', 'Track your pack live'],
            ['🚀', 'Land ready', 'Everything waiting for you'],
          ].map(([icon, title, desc]) => (
            <div key={title} style={{ background: 'var(--offwhite)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '18px 14px' }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{icon}</div>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--bottle)', marginBottom: 4 }}>{title}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>{desc}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/dashboard" style={{ padding: '13px 28px', fontSize: 15, fontWeight: 500, color: '#fff', background: 'var(--forest)', borderRadius: 40, textDecoration: 'none' }}>
            Go to dashboard →
          </Link>
          <Link href="/services" style={{ padding: '13px 28px', fontSize: 15, color: 'var(--bottle)', border: '0.5px solid rgba(26,58,42,0.3)', borderRadius: 40, textDecoration: 'none' }}>
            Add more services
          </Link>
        </div>
      </div>
    </main>
  )
}

export default function CheckoutSuccess() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>}>
      <SuccessContent />
    </Suspense>
  )
}