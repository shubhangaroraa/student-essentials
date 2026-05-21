'use client'
import { useState } from 'react'
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

  const signInWithGoogle = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    })
  }

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setLoading(true)
    setError('')

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { first_name: firstName } }
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (data?.user?.identities?.length === 0) {
      setError('An account with this email already exists. Please sign in instead.')
      setLoading(false)
      return
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (signInError) {
      setError(signInError.message)
      setLoading(false)
      return
    }

    // Create CRM student record
    if (data?.user) {
      try {
        await fetch('/api/crm/create-student', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: data.user.id,
            first_name: firstName,
            email: email,
          }),
        })
      } catch (e) {
        console.error('CRM create error:', e)
      }
    }

    router.push('/dashboard')
  }

  return (
    <main style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '100vh' }}>
      <div style={{ background: 'var(--bottle)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '40px 48px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 340, height: 340, borderRadius: '50%', background: 'rgba(46,125,82,0.35)', top: -80, right: -80, filter: 'blur(80px)' }}></div>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', position: 'relative', zIndex: 2 }}>
          <div style={{ width: 32, height: 32, background: 'var(--forest)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
              <path d="M10 2L3 6V10C3 13.5 6.5 17 10 18C13.5 17 17 13.5 17 10V6L10 2Z" fill="white"/>
              <path d="M7 10L9 12L13 8" stroke="#2e7d52" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={{ fontSize: 15, fontWeight: 500, color: '#fff' }}>Student<span style={{ color: 'var(--sage)' }}>Essentials</span></span>
        </Link>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--sage)', marginBottom: 16 }}>Join 10,000+ students</div>
          <h1 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 38, fontWeight: 500, color: '#fff', lineHeight: 1.15, marginBottom: 16 }}>
            Your UK life<br/><em style={{ color: 'var(--sage)' }}>starts here.</em>
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, maxWidth: 340 }}>
            Join thousands of international students who sorted their UK life before they boarded the plane.
          </p>
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', position: 'relative', zIndex: 2 }}>© 2026 StudentEssentials</div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 64px', background: 'var(--offwhite)' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <h2 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 26, fontWeight: 500, color: 'var(--bottle)', marginBottom: 8 }}>Create account</h2>
          <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 28 }}>Free to join. No credit card needed.</p>

          <button onClick={signInWithGoogle} style={{ width: '100%', padding: '12px 20px', fontSize: 14, color: 'var(--bottle)', background: '#fff', border: '0.5px solid rgba(26,26,26,0.15)', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 20, fontFamily: 'DM Sans, sans-serif' }}>
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.96L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"/>
            </svg>
            Continue with Google
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: '0.5px', background: 'rgba(26,58,42,0.12)' }}></div>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>or sign up with email</span>
            <div style={{ flex: 1, height: '0.5px', background: 'rgba(26,58,42,0.12)' }}></div>
          </div>

          <form onSubmit={signUp} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--moss)', marginBottom: 6 }}>First name</label>
              <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Priya" required style={{ width: '100%', padding: '11px 14px', fontSize: 14, background: '#fff', border: '0.5px solid rgba(26,58,42,.2)', borderRadius: 10, outline: 'none', fontFamily: 'DM Sans, sans-serif' }}/>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--moss)', marginBottom: 6 }}>Email address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="priya@example.com" required style={{ width: '100%', padding: '11px 14px', fontSize: 14, background: '#fff', border: '0.5px solid rgba(26,58,42,.2)', borderRadius: 10, outline: 'none', fontFamily: 'DM Sans, sans-serif' }}/>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--moss)', marginBottom: 6 }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 8 characters" required minLength={8} style={{ width: '100%', padding: '11px 14px', fontSize: 14, background: '#fff', border: '0.5px solid rgba(26,58,42,.2)', borderRadius: 10, outline: 'none', fontFamily: 'DM Sans, sans-serif' }}/>
            </div>
            {error && <div style={{ fontSize: 13, color: '#e8413e', background: 'rgba(232,65,62,0.08)', padding: '10px 14px', borderRadius: 8 }}>{error}</div>}
            <button type="submit" disabled={loading} style={{ width: '100%', padding: 13, fontSize: 15, fontWeight: 500, color: '#fff', background: loading ? 'var(--muted)' : 'var(--forest)', border: 'none', borderRadius: 10, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
              {loading ? 'Creating account…' : 'Create free account →'}
            </button>
          </form>

          <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--muted)', marginTop: 24 }}>
            Already have an account?{' '}
            <Link href="/auth/login" style={{ color: 'var(--forest)', fontWeight: 500, textDecoration: 'none' }}>Sign in</Link>
          </div>
        </div>
      </div>
    </main>
  )
}