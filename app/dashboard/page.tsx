'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export const dynamic = 'force-dynamic'

const orders = [
  { id: 'SE-2026-48201', services: 'Bedding & Kitchen Pack', icon: '🛏️', amount: 89, status: 'Confirmed', date: '13 May 2026' },
  { id: 'SE-2026-48202', services: 'UK SIM Card', icon: '📱', amount: 14, status: 'Dispatched', date: '13 May 2026' },
  { id: 'SE-2026-48203', services: 'Airport Transfer', icon: '🚗', amount: 45, status: 'Booked', date: '13 May 2026' },
  { id: 'SE-2026-48204', services: 'Travel Insurance', icon: '🛡️', amount: 32, status: 'Active', date: '13 May 2026' },
]

const checklist = [
  { icon: '🛏️', name: 'Bedding & Kitchen Pack', sub: 'Delivery scheduled for 13 Sep', status: 'Confirmed', done: true },
  { icon: '📱', name: 'UK SIM Card', sub: 'Dispatched · arrives in 3 days', status: 'Dispatched', done: true },
  { icon: '🚗', name: 'Airport Transfer', sub: 'Heathrow → Manchester · 15 Sep', status: 'Booked', done: true },
  { icon: '🛡️', name: 'Travel Insurance', sub: 'Policy active from 14 Sep', status: 'Active', done: true },
  { icon: '💸', name: 'Remittance setup', sub: 'Account linked · ready to send', status: 'Ready', done: true },
  { icon: '✈️', name: 'Flight Ticket', sub: 'Not yet booked', status: 'Add →', done: false },
  { icon: '🏥', name: 'Health Insurance', sub: 'Recommended for your stay', status: 'Add →', done: false },
]

const pages = ['overview', 'orders', 'remittance', 'referrals', 'profile'] as const
type Page = typeof pages[number]

export default function Dashboard() {
  const router = useRouter()
  const [page, setPage] = useState<Page>('overview')
  const [user, setUser] = useState<{ email: string; firstName: string } | null>(null)
  const [daysLeft, setDaysLeft] = useState(0)
  const [remiAmount, setRemiAmount] = useState(50000)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/auth/login'); return }
      setUser({ email: user.email ?? '', firstName: user.user_metadata?.first_name ?? user.email?.split('@')[0] ?? 'there' })
    })
    const arrival = new Date('2026-09-15')
    setDaysLeft(Math.max(0, Math.ceil((arrival.getTime() - Date.now()) / 86400000)))
  }, [])

  const remiGbp = ((remiAmount / 106.4) * 0.996).toFixed(2)
  const remiFee = ((remiAmount / 106.4) * 0.004).toFixed(2)

  const signOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  const navItems: { id: Page; icon: string; label: string }[] = [
    { id: 'overview', icon: '🏠', label: 'Overview' },
    { id: 'orders', icon: '📦', label: 'My Orders' },
    { id: 'remittance', icon: '💸', label: 'Remittance' },
    { id: 'referrals', icon: '🎁', label: 'Refer & Earn' },
    { id: 'profile', icon: '👤', label: 'Profile' },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--cream)' }}>

      {/* SIDEBAR */}
      <aside style={{ width: 240, flexShrink: 0, background: 'var(--bottle)', position: 'fixed', top: 0, left: 0, bottom: 0, display: 'flex', flexDirection: 'column', zIndex: 50 }}>
        <Link href="/" style={{ padding: '26px 22px 18px', display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', borderBottom: '0.5px solid rgba(255,255,255,.07)', marginBottom: 8 }}>
          <div style={{ width: 30, height: 30, background: 'var(--forest)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg viewBox="0 0 20 20" fill="none" width="16" height="16"><path d="M10 2L3 6V10C3 13.5 6.5 17 10 18C13.5 17 17 13.5 17 10V6L10 2Z" fill="white"/><path d="M7 10L9 12L13 8" stroke="#2e7d52" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <span style={{ fontSize: 14, fontWeight: 500, color: '#fff' }}>Student<span style={{ color: 'var(--sage)' }}>Essentials</span></span>
        </Link>

        <div style={{ padding: '4px 12px', flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.2)', padding: '8px 10px 4px' }}>Menu</div>
          {navItems.map(item => (
            <button key={item.id} onClick={() => setPage(item.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 8, width: '100%', textAlign: 'left', fontSize: 13, color: page === item.id ? '#fff' : 'rgba(255,255,255,.55)', background: page === item.id ? 'rgba(107,191,138,.15)' : 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', marginBottom: 1 }}>
              <span style={{ fontSize: 15, width: 20, textAlign: 'center' }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
          <Link href="/services" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 8, fontSize: 13, color: 'rgba(255,255,255,.55)', textDecoration: 'none', marginTop: 8 }}>
            <span style={{ fontSize: 15, width: 20, textAlign: 'center' }}>✨</span> Browse Services
          </Link>
        </div>

        <div style={{ padding: '12px 12px 18px', borderTop: '0.5px solid rgba(255,255,255,.07)' }}>
          <button onClick={signOut} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 8, width: '100%', fontSize: 13, color: 'rgba(255,255,255,.45)', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
            <span>↩</span> Sign out
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', marginTop: 4 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(107,191,138,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 500, color: 'var(--sage)', flexShrink: 0 }}>
              {user?.firstName?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#fff' }}>{user?.firstName ?? 'Loading…'}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.3)' }}>Student</div>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ marginLeft: 240, flex: 1 }}>

        {/* TOPBAR */}
        <div style={{ position: 'sticky', top: 0, zIndex: 40, padding: '0 40px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(245,240,232,.93)', backdropFilter: 'blur(14px)', borderBottom: '0.5px solid var(--border)' }}>
          <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--bottle)' }}>
            {navItems.find(n => n.id === page)?.label ?? 'Dashboard'}
          </div>
          <Link href="/services" style={{ padding: '7px 16px', fontSize: 13, fontWeight: 500, background: 'var(--forest)', color: '#fff', borderRadius: 40, textDecoration: 'none' }}>+ Add services</Link>
        </div>

        <div style={{ padding: '36px 40px' }}>

          {/* OVERVIEW */}
          {page === 'overview' && (
            <div>
              <div style={{ background: 'var(--bottle)', borderRadius: 20, padding: '28px 36px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'rgba(46,125,82,.3)', top: -80, right: -60, filter: 'blur(60px)', pointerEvents: 'none' }}></div>
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', marginBottom: 6 }}>Good morning 👋</div>
                  <div style={{ fontFamily: 'Georgia, serif', fontSize: 26, color: '#fff', marginBottom: 6 }}>Welcome back, <em style={{ color: 'var(--sage)' }}>{user?.firstName ?? '…'}</em></div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,.45)' }}>University of Manchester · Arriving 15 Sep 2026</div>
                </div>
                <div style={{ position: 'relative', zIndex: 2, background: 'rgba(255,255,255,.06)', border: '0.5px solid rgba(255,255,255,.1)', borderRadius: 16, padding: '18px 28px', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Georgia, serif', fontSize: 42, color: '#fff', lineHeight: 1 }}>{daysLeft}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', marginTop: 4 }}>days until arrival</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
                {[['📦', '4', 'Services ordered'], ['✅', '3', 'Confirmed'], ['💷', '£180', 'Total spent'], ['🎯', '71%', 'Pack complete']].map(([icon, val, label]) => (
                  <div key={label} style={{ background: 'var(--offwhite)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '18px 20px' }}>
                    <div style={{ fontSize: 20, marginBottom: 10 }}>{icon}</div>
                    <div style={{ fontFamily: 'Georgia, serif', fontSize: 26, color: 'var(--bottle)', lineHeight: 1 }}>{val}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{label}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
                <div style={{ background: 'var(--offwhite)', border: '0.5px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
                  <div style={{ padding: '16px 22px', borderBottom: '0.5px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--bottle)' }}>Settling-in checklist</div>
                    <Link href="/services" style={{ fontSize: 12, color: 'var(--forest)', textDecoration: 'none' }}>Add missing →</Link>
                  </div>
                  <div style={{ padding: '8px 22px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--muted)', padding: '10px 0 8px', borderBottom: '0.5px solid var(--border)', marginBottom: 4 }}>
                      <span>Progress</span><span style={{ fontWeight: 500, color: 'var(--bottle)' }}>5 of 7</span>
                    </div>
                    <div style={{ height: 6, background: 'rgba(26,58,42,.08)', borderRadius: 4, overflow: 'hidden', marginBottom: 16 }}>
                      <div style={{ width: '71%', height: '100%', background: 'var(--forest)', borderRadius: 4 }}></div>
                    </div>
                    {checklist.map(item => (
                      <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '11px 0', borderBottom: '0.5px solid var(--border)' }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: item.done ? 'var(--mint)' : 'rgba(26,58,42,.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{item.icon}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--bottle)' }}>{item.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{item.sub}</div>
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 500, padding: '3px 10px', borderRadius: 20, background: item.done ? 'var(--mint)' : 'rgba(26,58,42,.06)', color: item.done ? 'var(--forest)' : 'var(--muted)' }}>{item.status}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ background: 'var(--offwhite)', border: '0.5px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
                    <div style={{ padding: '16px 22px', borderBottom: '0.5px solid var(--border)', fontSize: 14, fontWeight: 500, color: 'var(--bottle)' }}>Quick actions</div>
                    <div style={{ padding: '14px 22px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      {[['✨', 'Add service', 'Browse all 7', '/services'], ['💸', 'Send money', '0.4% fee', '#'], ['📦', 'Track orders', '4 active', '#'], ['🎁', 'Refer friend', 'Earn £10', '#']].map(([icon, label, sub, href]) => (
                        <div key={label} onClick={() => { if (label === 'Send money') setPage('remittance'); if (label === 'Track orders') setPage('orders'); if (label === 'Refer friend') setPage('referrals'); }} style={{ padding: '12px', borderRadius: 10, border: '0.5px solid var(--border)', background: 'var(--cream)', cursor: 'pointer' }}>
                          <span style={{ fontSize: 20, display: 'block', marginBottom: 6 }}>{icon}</span>
                          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--bottle)', display: 'block' }}>{label}</span>
                          <span style={{ fontSize: 11, color: 'var(--muted)' }}>{sub}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ background: 'var(--offwhite)', border: '0.5px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
                    <div style={{ padding: '16px 22px', borderBottom: '0.5px solid var(--border)', fontSize: 14, fontWeight: 500, color: 'var(--bottle)' }}>Notifications</div>
                    <div style={{ padding: '8px 22px' }}>
                      {[['SIM card dispatched. Expected in 3 days.', '2h ago', true], ['Bedding pack confirmed for 13 Sep.', 'Yesterday', true], ['You saved £48 with the bundle.', '3 days ago', false]].map(([text, time, unread]) => (
                        <div key={text as string} style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: '0.5px solid var(--border)' }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: unread ? 'var(--forest)' : 'var(--border)', flexShrink: 0, marginTop: 5 }}></div>
                          <div>
                            <div style={{ fontSize: 13, color: 'var(--bottle)', lineHeight: 1.5 }}>{text}</div>
                            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{time}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ORDERS */}
          {page === 'orders' && (
            <div>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: 22, color: 'var(--bottle)', marginBottom: 4 }}>My Orders</div>
              <div style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 24 }}>Track and manage all your services.</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {orders.map(order => (
                  <div key={order.id} style={{ background: 'var(--offwhite)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--mint)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{order.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--bottle)' }}>{order.services}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>Ordered {order.date} · <span style={{ fontFamily: 'monospace' }}>{order.id}</span></div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 500, padding: '3px 10px', borderRadius: 20, background: 'var(--mint)', color: 'var(--forest)' }}>{order.status}</span>
                    <div style={{ fontFamily: 'Georgia, serif', fontSize: 20, color: 'var(--bottle)' }}>£{order.amount}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* REMITTANCE */}
          {page === 'remittance' && (
            <div>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: 22, color: 'var(--bottle)', marginBottom: 4 }}>Foreign Remittance</div>
              <div style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 24 }}>Send money at 0.4% — the lowest guaranteed rate.</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div style={{ background: 'var(--offwhite)', border: '0.5px solid var(--border)', borderRadius: 16, padding: '24px' }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--bottle)', marginBottom: 20 }}>Send money</div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--moss)', marginBottom: 6 }}>You send (INR)</label>
                  <input type="number" value={remiAmount} onChange={e => setRemiAmount(Number(e.target.value))} style={{ width: '100%', padding: '11px 14px', fontSize: 14, background: '#fff', border: '0.5px solid rgba(26,58,42,.2)', borderRadius: 10, outline: 'none', fontFamily: 'DM Sans, sans-serif', marginBottom: 8 }} />
                  <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--muted)', marginBottom: 8 }}>↓ at 0.4% fee · 1 GBP = 106.4 INR</div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--moss)', marginBottom: 6 }}>They receive (GBP)</label>
                  <input readOnly value={`£${remiGbp}`} style={{ width: '100%', padding: '11px 14px', fontSize: 14, background: 'var(--cream)', border: '0.5px solid rgba(26,58,42,.2)', borderRadius: 10, outline: 'none', fontFamily: 'DM Sans, sans-serif', marginBottom: 12 }} />
                  <div style={{ background: 'var(--mint)', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: 'var(--moss)', marginBottom: 16 }}>
                    Fee: <strong>£{remiFee}</strong> · Bank would charge ~<strong>£{((remiAmount / 106.4) * 0.04).toFixed(2)}</strong>
                  </div>
                  <button style={{ width: '100%', padding: 13, fontSize: 14, fontWeight: 500, color: '#fff', background: 'var(--forest)', border: 'none', borderRadius: 10, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Send money securely →</button>
                </div>
                <div style={{ background: 'var(--offwhite)', border: '0.5px solid var(--border)', borderRadius: 16, padding: '24px' }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--bottle)', marginBottom: 16 }}>Rate comparison</div>
                  {[['StudentEssentials', '0.4%', 'var(--forest)', '4%'], ['Wise', '0.7%', 'var(--gold)', '7%'], ['HDFC / SBI', '3–4%', '#e8413e', '40%']].map(([name, rate, color, width]) => (
                    <div key={name} style={{ marginBottom: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                        <span style={{ color: 'var(--bottle)', fontWeight: name === 'StudentEssentials' ? 500 : 400 }}>{name}</span>
                        <span style={{ color: color as string, fontWeight: 500 }}>{rate}</span>
                      </div>
                      <div style={{ height: 4, background: 'rgba(26,58,42,.08)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ width, height: '100%', background: color as string, borderRadius: 2 }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* REFERRALS */}
          {page === 'referrals' && (
            <div>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: 22, color: 'var(--bottle)', marginBottom: 4 }}>Refer & Earn</div>
              <div style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 24 }}>Share StudentEssentials. You earn £10, they save £10.</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div style={{ background: 'var(--bottle)', borderRadius: 16, padding: '24px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', background: 'rgba(46,125,82,.25)', top: -60, right: -40, filter: 'blur(40px)' }}></div>
                  <div style={{ position: 'relative', zIndex: 2 }}>
                    <div style={{ fontFamily: 'Georgia, serif', fontSize: 18, color: '#fff', marginBottom: 6 }}>Your referral code</div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', marginBottom: 16, lineHeight: 1.6 }}>Share with friends heading to the UK. You both get £10 when they complete their first order.</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <div style={{ flex: 1, background: 'rgba(255,255,255,.08)', border: '0.5px solid rgba(255,255,255,.15)', borderRadius: 8, padding: '10px 14px', fontSize: 14, fontWeight: 500, color: '#fff', fontFamily: 'monospace' }}>
                        {user?.firstName?.toUpperCase().slice(0,6) ?? 'USER'}-UK26
                      </div>
                      <button onClick={() => { navigator.clipboard.writeText(`${user?.firstName?.toUpperCase().slice(0,6) ?? 'USER'}-UK26`); setCopied(true); setTimeout(() => setCopied(false), 2000) }} style={{ padding: '10px 16px', background: 'var(--gold)', color: 'var(--bottle)', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, alignContent: 'start' }}>
                  {[['👥', '0', 'Referred'], ['💷', '£0', 'Earned']].map(([icon, val, label]) => (
                    <div key={label} style={{ background: 'var(--offwhite)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '18px 20px' }}>
                      <div style={{ fontSize: 20, marginBottom: 8 }}>{icon}</div>
                      <div style={{ fontFamily: 'Georgia, serif', fontSize: 24, color: 'var(--bottle)' }}>{val}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{label}</div>
                    </div>
                  ))}
                  <div style={{ gridColumn: 'span 2', background: 'var(--offwhite)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '16px 18px' }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--bottle)', marginBottom: 12 }}>Share via</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {['💬 WhatsApp', '📧 Email', '🔗 Link'].map(ch => (
                        <button key={ch} onClick={() => alert(`Opens ${ch} share`)} style={{ flex: 1, padding: '9px 8px', fontSize: 12, fontWeight: 500, color: 'var(--bottle)', background: 'var(--cream)', border: '0.5px solid var(--border)', borderRadius: 8, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>{ch}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PROFILE */}
          {page === 'profile' && (
            <div>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: 22, color: 'var(--bottle)', marginBottom: 4 }}>My Profile</div>
              <div style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 24 }}>Manage your personal details.</div>
              <div style={{ background: 'var(--offwhite)', border: '0.5px solid var(--border)', borderRadius: 16, padding: '28px', maxWidth: 560 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28, paddingBottom: 24, borderBottom: '0.5px solid var(--border)' }}>
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--mint)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 500, color: 'var(--forest)' }}>
                    {user?.firstName?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 500, color: 'var(--bottle)' }}>{user?.firstName}</div>
                    <div style={{ fontSize: 13, color: 'var(--muted)' }}>{user?.email}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {[['First name', user?.firstName ?? ''], ['Email', user?.email ?? ''], ['University', 'University of Manchester'], ['Country', 'India'], ['Arrival date', '15 Sep 2026']].map(([label, val]) => (
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