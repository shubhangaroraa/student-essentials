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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()

    // 1. Create the Supabase auth user
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

    // 2. Create the student record in your existing CRM
    try {
      await fetch('/api/crm/create-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          first_name: firstName,
          user_id: data.user?.id,
        }),
      })
    } catch (err) {
      console.error('create-student failed', err)
    }

    // 3. Push the lead to the Lovable CRM (student-essentials.lovable.app)
    try {
      await fetch('/api/crm/push-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: firstName,
          email,
          source: 'website-signup',
        }),
      })
    } catch (err) {
      console.error('push-lead failed', err)
    }

    router.push('/dashboard')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cream, #faf8f3)', padding: 20, fontFamily: 'DM Sans, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 420, background: '#fff', padding: 40, borderRadius: 16, border: '0.5px solid rgba(26,58,42,.12)' }}>
        <h1 style={{ fontSize: 28, marginBottom: 8, color: 'var(--forest, #1a3a2a)' }}>Create your account</h1>
        <p style={{ fontSize: 14, color: 'var(--muted, #6b7280)', marginBottom: 28 }}>
          Get started with Student Essentials
        </p>

        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <input
            type="text"
            placeholder="First name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            style={{ width: '100%', padding: '11px 14px', fontSize: 14, background: '#fff', border: '0.5px solid rgba(26,58,42,.2)', borderRadius: 10, outline: 'none', fontFamily: 'DM Sans, sans-serif' }}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '11px 14px', fontSize: 14, background: '#fff', border: '0.5px solid rgba(26,58,42,.2)', borderRadius: 10, outline: 'none', fontFamily: 'DM Sans, sans-serif' }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            style={{ width: '100%', padding: '11px 14px', fontSize: 14, background: '#fff', border: '0.5px solid rgba(26,58,42,.2)', borderRadius: 10, outline: 'none', fontFamily: 'DM Sans, sans-serif' }}
          />

          {error && (
            <div style={{ fontSize: 13, color: '#c0392b', padding: '8px 12px', background: '#fdecea', borderRadius: 8 }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '12px 14px', fontSize: 14, fontWeight: 500, color: '#fff', background: 'var(--forest, #1a3a2a)', border: 'none', borderRadius: 10, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1, fontFamily: 'DM Sans, sans-serif' }}
          >
            {loading ? 'Creating account…' : 'Create free account →'}
          </button>
        </form>

        <p style={{ fontSize: 13, color: 'var(--muted, #6b7280)', marginTop: 20, textAlign: 'center' }}>
          Already have an account?{' '}
          <Link href="/auth/login" style={{ color: 'var(--forest, #1a3a2a)', fontWeight: 500 }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
