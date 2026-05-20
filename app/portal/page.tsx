'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const students = [
  { name: 'Priya Sharma', university: 'Univ. of Manchester', country: '🇮🇳', status: 'Pack ordered', value: '£180', date: '13 May 2026' },
  { name: 'Arjun Mehta', university: 'UCL London', country: '🇮🇳', status: 'SIM only', value: '£14', date: '11 May 2026' },
  { name: 'Fatima Al-Hassan', university: 'Univ. of Birmingham', country: '🇳🇬', status: 'Pending', value: '—', date: '10 May 2026' },
  { name: 'Wei Zhang', university: 'Univ. of Edinburgh', country: '🇨🇳', status: 'Full pack', value: '£232', date: '8 May 2026' },
  { name: 'Omar Siddiqui', university: 'Univ. of Leeds', country: '🇵🇰', status: 'Pending', value: '—', date: '6 May 2026' },
]

const pages = ['overview', 'students', 'referrals', 'commissions', 'profile'] as const
type Page = typeof pages[number]

export default function AgentPortal() {
  const router = useRouter()
  const [page, setPage] = useState<Page>('overview')
  const [user, setUser] = useState<{ email: string; firstName: string } | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/auth/login'); return }
      setUser({ email: user.email ?? '', firstName: user.user_metadata?.first_name ?? user.email?.split('@')[0] ?? 'Agent' })
    })
  }, [])

  const signOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  const navItems: { id: Page; icon: string; label: string }[] = [
    { id: 'overview', icon: '🏠', label: 'Overview' },
    { id: 'students', icon: '🎓', label: 'My Students' },
    { id: 'referrals', icon: '🔗', label: 'Referral Tools' },
    { id: 'commissions', icon: '💷', label: 'Commissions' },
    { id: 'profile', icon: '👤', label: 'My Profile' },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--cream)' }}>

      {/* SIDEBAR */}
      <aside style={{ width: 240, flexShrink: 0, background: 'var(--bottle)', position: 'fixed', top: 0, left: 0, bottom: 0, display: 'flex', flexDirection: 'column', zIndex: 50 }}>
        <Link href="/" style={{ padding: '26px 22px 18px', display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', borderBottom: '0.5px solid rgba(255,255,255,.07)', marginBottom: 8 }}>
          <div style={{ width: 30, height: 30, background: 'var(--forest)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg viewBox="0 0 20 20" fill="none" width="16" height="16"><path d="M10 2L3 6V10C3 13.5 6.5 17 10 18C13.5 17 17 13.5 17 10V6L10 2Z" fill="white"/><path d="M7 10L9 12L13 8" stroke="#2e7d52" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <div>
            <span style={{ fontSize: 14, fontWeight: 500, color: '#fff' }}>Student<span style={{ color: 'var(--sage)' }}>Essentials</span></span>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', marginTop: 1 }}>Agent Portal</div>
          </div>
        </Link>

        <div style={{ padding: '4px 12px', flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.2)', padding: '8px 10px 4px' }}>Menu</div>
          {navItems.map(item => (
            <button key={item.id} onClick={() => setPage(item.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 8, width: '100%', textAlign: 'left', fontSize: 13, color: page === item.id ? '#fff' : 'rgba(255,255,255,.55)', background: page === item.id ? 'rgba(107,191,138,.15)' : 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', marginBottom: 1 }}>
              <span style={{ fontSize: 15, width: 20, textAlign: 'center' }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>

        <div style={{ padding: '12px 12px 18px', borderTop: '0.5px solid rgba(255,255,255,.07)' }}>
          <button onClick={signOut} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 8, width: '100%', fontSize: 13, color: 'rgba(255,255,255,.45)', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
            <span>↩</span> Sign out
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', marginTop: 4 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(107,191,138,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 500, color: 'var(--sage)', flexShrink: 0 }}>
              {user?.firstName?.[0]?.toUpperCase() ?? 'A'}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#fff' }}>{user?.firstName ?? 'Loading…'}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.3)' }}>Agent</div>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ marginLeft: 240, flex: 1 }}>
        <div style={{ position: 'sticky', top: 0, zIndex: 40, padding: '0 40px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(245,240,232,.93)', backdropFilter: 'blur(14px)', borderBottom: '0.5px solid var(--border)' }}>
          <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--bottle)' }}>{navItems.find(n => n.id === page)?.label}</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link href="/services" style={{ padding: '7px 16px', fontSize: 13, color: 'var(--forest)', border: '0.5px solid rgba(46,125,82,.3)', borderRadius: 40, textDecoration: 'none' }}>Browse services</Link>
          </div>
        </div>

        <div style={{ padding: '36px 40px' }}>

          {/* OVERVIEW */}
          {page === 'overview' && (
            <div>
              <div style={{ background: 'var(--bottle)', borderRadius: 20, padding: '28px 36px', marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'rgba(46,125,82,.3)', top: -80, right: -60, filter: 'blur(60px)', pointerEvents: 'none' }}></div>
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', marginBottom: 6 }}>Welcome back 👋</div>
                  <div style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 26, color: '#fff', marginBottom: 6 }}>Good to see you, <em style={{ color: 'var(--sage)' }}>{user?.firstName ?? '…'}</em></div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,.45)' }}>Agent Dashboard · StudentEssentials Partner</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
                {[['🎓', '5', 'Students referred'], ['✅', '3', 'Packs ordered'], ['💷', '£42', 'Commission earned'], ['⭐', 'Silver', 'Agent tier']].map(([icon, val, label]) => (
                  <div key={label} style={{ background: 'var(--offwhite)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '18px 20px' }}>
                    <div style={{ fontSize: 20, marginBottom: 10 }}>{icon}</div>
                    <div style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 26, color: 'var(--bottle)', lineHeight: 1 }}>{val}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{label}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
                <div style={{ background: 'var(--offwhite)', border: '0.5px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
                  <div style={{ padding: '16px 22px', borderBottom: '0.5px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--bottle)' }}>Recent students</div>
                    <button onClick={() => setPage('students')} style={{ fontSize: 12, color: 'var(--forest)', background: 'none', border: 'none', cursor: 'pointer' }}>View all →</button>
                  </div>
                  <div style={{ padding: '8px 22px' }}>
                    {students.slice(0,4).map(s => (
                      <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: '0.5px solid var(--border)' }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--mint)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{s.country}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--bottle)' }}>{s.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--muted)' }}>{s.university}</div>
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 500, padding: '3px 10px', borderRadius: 20, background: s.status === 'Pending' ? 'rgba(26,58,42,.06)' : 'var(--mint)', color: s.status === 'Pending' ? 'var(--muted)' : 'var(--forest)' }}>{s.status}</span>
                        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--bottle)', minWidth: 40, textAlign: 'right' }}>{s.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ background: 'var(--bottle)', borderRadius: 16, padding: '24px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', width: 150, height: 150, borderRadius: '50%', background: 'rgba(46,125,82,.25)', top: -40, right: -30, filter: 'blur(30px)' }}></div>
                    <div style={{ position: 'relative', zIndex: 2 }}>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', marginBottom: 6 }}>Your referral link</div>
                      <div style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--sage)', background: 'rgba(255,255,255,.08)', padding: '8px 12px', borderRadius: 8, marginBottom: 12, wordBreak: 'break-all' }}>
                        student-essentials.com?ref={user?.firstName?.toLowerCase() ?? 'agent'}
                      </div>
                      <button onClick={() => navigator.clipboard.writeText(`https://student-essentials.com?ref=${user?.firstName?.toLowerCase() ?? 'agent'}`)} style={{ width: '100%', padding: '9px', background: 'var(--forest)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                        Copy link
                      </button>
                    </div>
                  </div>

                  <div style={{ background: 'var(--offwhite)', border: '0.5px solid var(--border)', borderRadius: 16, padding: '20px' }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--bottle)', marginBottom: 14 }}>Commission tiers</div>
                    {[['Bronze', '5%', '0–10 students'], ['Silver', '7%', '11–25 students'], ['Gold', '10%', '26+ students']].map(([tier, rate, range]) => (
                      <div key={tier} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '0.5px solid var(--border)' }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: tier === 'Silver' ? 500 : 400, color: tier === 'Silver' ? 'var(--bottle)' : 'var(--muted)' }}>{tier} {tier === 'Silver' ? '← you' : ''}</div>
                          <div style={{ fontSize: 11, color: 'var(--muted)' }}>{range}</div>
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 500, color: tier === 'Silver' ? 'var(--forest)' : 'var(--muted)' }}>{rate}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STUDENTS */}
          {page === 'students' && (
            <div>
              <div style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 22, color: 'var(--bottle)', marginBottom: 4 }}>My Students</div>
              <div style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 24 }}>All students referred through your link.</div>
              <div style={{ background: 'var(--offwhite)', border: '0.5px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
                <div style={{ padding: '14px 22px', borderBottom: '0.5px solid var(--border)', display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr', gap: 12 }}>
                  {['Student', 'University', 'Status', 'Value', 'Date'].map(h => (
                    <div key={h} style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--muted)' }}>{h}</div>
                  ))}
                </div>
                {students.map((s, i) => (
                  <div key={s.name} style={{ padding: '14px 22px', borderBottom: '0.5px solid var(--border)', display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr', gap: 12, alignItems: 'center', background: i % 2 === 0 ? 'transparent' : 'rgba(26,58,42,.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 16 }}>{s.country}</span>
                      <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--bottle)' }}>{s.name}</span>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--muted)' }}>{s.university}</div>
                    <span style={{ fontSize: 11, fontWeight: 500, padding: '3px 10px', borderRadius: 20, background: s.status === 'Pending' ? 'rgba(26,58,42,.06)' : 'var(--mint)', color: s.status === 'Pending' ? 'var(--muted)' : 'var(--forest)', display: 'inline-block' }}>{s.status}</span>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--bottle)' }}>{s.value}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>{s.date}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* REFERRALS */}
          {page === 'referrals' && (
            <div>
              <div style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 22, color: 'var(--bottle)', marginBottom: 4 }}>Referral Tools</div>
              <div style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 24 }}>Share these with your students to track conversions.</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div style={{ background: 'var(--offwhite)', border: '0.5px solid var(--border)', borderRadius: 16, padding: '24px' }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--bottle)', marginBottom: 16 }}>Your referral link</div>
                  <div style={{ background: 'var(--cream)', border: '0.5px solid var(--border)', borderRadius: 10, padding: '12px 16px', fontSize: 13, fontFamily: 'monospace', color: 'var(--forest)', marginBottom: 12, wordBreak: 'break-all' }}>
                    https://student-essentials.com?ref={user?.firstName?.toLowerCase() ?? 'agent'}
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => navigator.clipboard.writeText(`https://student-essentials.com?ref=${user?.firstName?.toLowerCase() ?? 'agent'}`)} style={{ flex: 1, padding: '10px', background: 'var(--forest)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Copy link</button>
                    <button onClick={() => window.open(`https://wa.me/?text=Hey! Use my link to sort your UK essentials before you arrive: https://student-essentials.com?ref=${user?.firstName?.toLowerCase() ?? 'agent'}`)} style={{ flex: 1, padding: '10px', background: '#25D366', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Share on WhatsApp</button>
                  </div>
                </div>
                <div style={{ background: 'var(--offwhite)', border: '0.5px solid var(--border)', borderRadius: 16, padding: '24px' }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--bottle)', marginBottom: 16 }}>Referral stats</div>
                  {[['Links clicked', '23'], ['Sign ups', '8'], ['Orders placed', '3'], ['Conversion rate', '37.5%']].map(([label, val]) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '0.5px solid var(--border)' }}>
                      <span style={{ fontSize: 13, color: 'var(--muted)' }}>{label}</span>
                      <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--bottle)' }}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* COMMISSIONS */}
          {page === 'commissions' && (
            <div>
              <div style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 22, color: 'var(--bottle)', marginBottom: 4 }}>Commissions</div>
              <div style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 24 }}>Your earnings from student orders.</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 24 }}>
                {[['💷', '£42', 'Total earned'], ['⏳', '£28', 'Pending payout'], ['✅', '£14', 'Paid out']].map(([icon, val, label]) => (
                  <div key={label} style={{ background: 'var(--offwhite)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '20px' }}>
                    <div style={{ fontSize: 22, marginBottom: 10 }}>{icon}</div>
                    <div style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 28, color: 'var(--bottle)' }}>{val}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{label}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: 'var(--offwhite)', border: '0.5px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
                <div style={{ padding: '16px 22px', borderBottom: '0.5px solid var(--border)', fontSize: 14, fontWeight: 500, color: 'var(--bottle)' }}>Commission history</div>
                {[
                  { student: 'Priya Sharma', order: '£180', rate: '7%', commission: '£12.60', status: 'Pending', date: '13 May' },
                  { student: 'Arjun Mehta', order: '£14', rate: '7%', commission: '£0.98', status: 'Pending', date: '11 May' },
                  { student: 'Wei Zhang', order: '£232', rate: '7%', commission: '£16.24', status: 'Pending', date: '8 May' },
                  { student: 'Past student', order: '£180', rate: '5%', commission: '£9.00', status: 'Paid', date: '2 Apr' },
                  { student: 'Past student 2', order: '£89', rate: '5%', commission: '£4.45', status: 'Paid', date: '28 Mar' },
                ].map((c, i) => (
                  <div key={i} style={{ padding: '14px 22px', borderBottom: '0.5px solid var(--border)', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr', gap: 12, alignItems: 'center' }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--bottle)' }}>{c.student}</div>
                    <div style={{ fontSize: 13, color: 'var(--muted)' }}>{c.order}</div>
                    <div style={{ fontSize: 13, color: 'var(--muted)' }}>{c.rate}</div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--forest)' }}>{c.commission}</div>
                    <span style={{ fontSize: 11, fontWeight: 500, padding: '3px 10px', borderRadius: 20, background: c.status === 'Paid' ? 'var(--mint)' : 'rgba(200,169,110,.15)', color: c.status === 'Paid' ? 'var(--forest)' : 'var(--gold)', display: 'inline-block' }}>{c.status}</span>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>{c.date}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PROFILE */}
          {page === 'profile' && (
            <div>
              <div style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 22, color: 'var(--bottle)', marginBottom: 4 }}>My Profile</div>
              <div style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 24 }}>Your agent account details.</div>
              <div style={{ background: 'var(--offwhite)', border: '0.5px solid var(--border)', borderRadius: 16, padding: '28px', maxWidth: 560 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28, paddingBottom: 24, borderBottom: '0.5px solid var(--border)' }}>
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--mint)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 500, color: 'var(--forest)' }}>
                    {user?.firstName?.[0]?.toUpperCase() ?? 'A'}
                  </div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 500, color: 'var(--bottle)' }}>{user?.firstName}</div>
                    <div style={{ fontSize: 13, color: 'var(--muted)' }}>{user?.email}</div>
                    <div style={{ fontSize: 12, color: 'var(--forest)', marginTop: 4, fontWeight: 500 }}>Silver Agent · 7% commission</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {[['Full name', user?.firstName ?? ''], ['Email', user?.email ?? ''], ['Agency name', 'My Education Agency'], ['Country', 'India'], ['Phone / WhatsApp', '+91 00000 00000']].map(([label, val]) => (
                    <div key={label}>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--moss)', marginBottom: 5 }}>{label}</label>
                      <input defaultValue={val} style={{ width: '100%', padding: '10px 14px', fontSize: 14, background: '#fff', border: '0.5px solid rgba(26,58,42,.2)', borderRadius: 10, outline: 'none', fontFamily: 'DM Sans, sans-serif' }} />
                    </div>
                  ))}
                  <button style={{ padding: '11px 24px', fontSize: 13, fontWeight: 500, background: 'var(--forest)', color: '#fff', border: 'none', borderRadius: 40, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', alignSelf: 'flex-start', marginTop: 4 }}>Save changes</button>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}