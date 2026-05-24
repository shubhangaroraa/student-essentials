'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Signup() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Capture UTM on page load and persist in sessionStorage
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const utmPartner = params.get('utm_partner')
    const utmSource = params.get('utm_source')
    const utmCampaign = params.get('utm_campaign')
    if (utmPartner) sessionStorage.setItem('utm_partner', utmPartner)
    if (utmSource) sessionStorage.setItem('utm_source', utmSource)
    if (utmCampaign) sessionStorage.setItem('utm_campaign', utmCampaign)
  }, [])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()

    // 1. Create Supabase auth user
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { first_name: firstName } },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    // 2. Read UTM from sessionStorage (set when they landed via partner link)
    const utm_partner = sessionStorage.getItem('utm_partner') ?? undefined
    const utm_source = sessionStorage.getItem('utm_source') ?? undefined
    const utm_campaign = sessionStorage.getItem('utm_campaign') ?? undefined

    // 3. Create CRM lead + student record (attributed to partner if utm present)
    try {
      await fetch('/api/crm/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          first_name: firstName,
          user_id: data.user?.id,
          utm_partner,
          utm_source,
          utm_campaign,
        }),
      })
      // Clear UTM after use
      sessionStorage.removeItem('utm_partner')
      sessionStorage.removeItem('utm_source')
      sessionStorage.removeItem('utm_campaign')
    } catch (err) {
      console.error('CRM lead creation failed', err)
    }

    router.push('/dashboard')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cream, #faf8f3)', padding: 20, fontFamily: 'DM Sans, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 420, background: '#fff', padding: 40, borderRadius: 16, border: '0.5px solid rgba(26,58,42,.12)' }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--forest, #1a3a2a)', textDecoration: 'none', marginBottom: 28, opacity: 0.7 }}>
          ← Back
        </Link>
        <h1 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 28, marginBottom: 8, color: 'var(--bottle, #0f1f17)', fontWeight: 600 }}>Create your account</h1>
        <p style={{ fontSize: 14, color: 'var(--muted, #6b7280)', marginBottom: 28 }}>
          Get started with Student Essentials
        </p>

        {error && (
          <div style={{ padding: '10px 14px', background: '#fef2f2', border: '0.5px solid #fca5a5', borderRadius: 8, fontSize: 13, color: '#dc2626', marginBottom: 16 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--moss, #2d5a3d)', marginBottom: 5 }}>First name</label>
            <input
              type="text"
              placeholder="Arjun"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              required
              style={{ width: '100%', padding: '11px 14px', fontSize: 14, border: '0.5px solid rgba(26,58,42,.2)', borderRadius: 10, outline: 'none', fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--moss, #2d5a3d)', marginBottom: 5 }}>Email</label>
            <input
              type="email"
              placeholder="you@university.ac.uk"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '11px 14px', fontSize: 14, border: '0.5px solid rgba(26,58,42,.2)', borderRadius: 10, outline: 'none', fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--moss, #2d5a3d)', marginBottom: 5 }}>Password</label>
            <input
              type="password"
              placeholder="Min. 8 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={8}
              style={{ width: '100%', padding: '11px 14px', fontSize: 14, border: '0.5px solid rgba(26,58,42,.2)', borderRadius: 10, outline: 'none', fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ padding: '13px', fontSize: 14, fontWeight: 500, background: loading ? 'rgba(26,58,42,.4)' : 'var(--forest, #1a3a2a)', color: '#fff', border: 'none', borderRadius: 40, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans, sans-serif', marginTop: 4 }}
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--muted, #6b7280)', marginTop: 20 }}>
          Already have an account?{' '}
          <Link href="/auth/login" style={{ color: 'var(--forest, #1a3a2a)', fontWeight: 500 }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}