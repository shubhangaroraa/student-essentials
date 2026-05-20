'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const recentOrders = [
  { ref: 'SE-2026-57168', student: 'Priya Sharma', services: 'Full pack', amount: '£180', status: 'Confirmed', date: '21 May' },
  { ref: 'SE-2026-57102', student: 'Wei Zhang', services: 'Bedding + SIM', amount: '£103', status: 'Dispatched', date: '20 May' },
  { ref: 'SE-2026-56998', student: 'Arjun Mehta', services: 'SIM only', amount: '£14', status: 'Delivered', date: '19 May' },
  { ref: 'SE-2026-56901', student: 'Fatima Al-Hassan', services: 'Transfer + Insurance', amount: '£77', status: 'Confirmed', date: '18 May' },
  { ref: 'SE-2026-56845', student: 'Omar Siddiqui', services: 'Full pack', amount: '£232', status: 'Pending', date: '17 May' },
]

const agents = [
  { name: 'Ravi Kumar', agency: 'UK Study Hub', students: 28, commission: '£340', tier: 'Gold', status: 'Active' },
  { name: 'Sarah Chen', agency: 'Global Ed', students: 14, commission: '£180', tier: 'Silver', status: 'Active' },
  { name: 'Ahmed Hassan', agency: 'Study Abroad Co', students: 6, commission: '£72', tier: 'Bronze', status: 'Active' },
  { name: 'Priya Nair', agency: 'UK Dreams', students: 3, commission: '£28', tier: 'Bronze', status: 'Pending' },
]

const pages = ['overview', 'orders', 'students', 'agents', 'services', 'payouts', 'settings'] as const
type Page = typeof pages[number]

export default function AdminPanel() {
  const router = useRouter()
  const [page, setPage] = useState<Page>('overview')
  const [user, setUser] = useState<{ email: string; firstName: string } | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/auth/login'); return }
      setUser({ email: user.email ?? '', firstName: user.user_metadata?.first_name ?? user.email?.split('@')[0] ?? 'Admin' })
    })
  }, [])

  const signOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  const navItems: { id: Page; icon: string; label: string }[] = [
    { id: 'overview', icon: '📊', label: 'Overview' },
    { id: 'orders', icon: '📦', label: 'Orders' },
    { id: 'students', icon: '🎓', label: 'Students' },
    { id: 'agents', icon: '🏢', label: 'Agents' },
    { id: 'services', icon: '✨', label: 'Services' },
    { id: 'payouts', icon: '💷', label: 'Payouts' },
    { id: 'settings', icon: '⚙️', label: 'Settings' },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--cream)' }}>

      {/* SIDEBAR */}
      <aside style={{ width: 240, flexShrink: 0, background: '#0f1f17', position: 'fixed', top: 0, left: 0, bottom: 0, display: 'flex', flexDirection: 'column', zIndex: 50 }}>
        <Link href="/" style={{ padding: '26px 22px 18px', display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', borderBottom: '0.5px solid rgba(255,255,255,.07)', marginBottom: 8 }}>
          <div style={{ width: 30, height: 30, background: 'var(--forest)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg viewBox="0 0 20 20" fill="none" width="16" height="16"><path d="M10 2L3 6V10C3 13.5 6.5 17 10 18C13.5 17 17 13.5 17 10V6L10 2Z" fill="white"/><path d="M7 10L9 12L13 8" stroke="#2e7d52" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <div>
            <span style={{ fontSize: 14, fontWeight: 500, color: '#fff' }}>Student<span style={{ color: 'var(--sage)' }}>Essentials</span></span>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', marginTop: 1 }}>Admin Panel</div>
          </div>
        </Link>

        <div style={{ padding: '4px 12px', flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.2)', padding: '8px 10px 4px' }}>Management</div>
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
              <div style={{ fontSize: 13, fontWeight: 500, color: '#fff' }}>{user?.firstName ?? 'Admin'}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.3)' }}>Administrator</div>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ marginLeft: 240, flex: 1 }}>
        <div style={{ position: 'sticky', top: 0, zIndex: 40, padding: '0 40px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(245,240,232,.93)', backdropFilter: 'blur(14px)', borderBottom: '0.5px solid var(--border)' }}>
          <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--bottle)' }}>{navItems.find(n => n.id === page)?.label}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>StudentEssentials Admin · {user?.email}</div>
        </div>

        <div style={{ padding: '36px 40px' }}>

          {/* OVERVIEW */}
          {page === 'overview' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
                {[
                  ['📦', '£1,840', 'Revenue (May)', '+23% vs Apr'],
                  ['🎓', '47', 'Total students', '12 this week'],
                  ['🏢', '4', 'Active agents', '1 pending approval'],
                  ['✅', '23', 'Orders placed', '8 this week'],
                ].map(([icon, val, label, sub]) => (
                  <div key={label} style={{ background: 'var(--offwhite)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '18px 20px' }}>
                    <div style={{ fontSize: 20, marginBottom: 10 }}>{icon}</div>
                    <div style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 26, color: 'var(--bottle)', lineHeight: 1 }}>{val}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{label}</div>
                    <div style={{ fontSize: 11, color: 'var(--forest)', marginTop: 2 }}>{sub}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 20 }}>
                <div style={{ background: 'var(--offwhite)', border: '0.5px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
                  <div style={{ padding: '16px 22px', borderBottom: '0.5px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--bottle)' }}>Recent orders</div>
                    <button onClick={() => setPage('orders')} style={{ fontSize: 12, color: 'var(--forest)', background: 'none', border: 'none', cursor: 'pointer' }}>View all →</button>
                  </div>
                  {recentOrders.slice(0,4).map(o => (
                    <div key={o.ref} style={{ padding: '12px 22px', borderBottom: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--bottle)' }}>{o.student}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)' }}>{o.ref} · {o.services}</div>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 500, padding: '3px 10px', borderRadius: 20, background: o.status === 'Pending' ? 'rgba(26,58,42,.06)' : o.status === 'Delivered' ? 'var(--mint)' : 'rgba(200,169,110,.15)', color: o.status === 'Pending' ? 'var(--muted)' : o.status === 'Delivered' ? 'var(--forest)' : 'var(--gold)' }}>{o.status}</span>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--bottle)' }}>{o.amount}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ background: 'var(--offwhite)', border: '0.5px solid var(--border)', borderRadius: 16, padding: '20px' }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--bottle)', marginBottom: 14 }}>Revenue by service</div>
                    {[['Bedding packs', '42%', '42%'], ['SIM cards', '18%', '18%'], ['Insurance', '15%', '15%'], ['Transfers', '14%', '14%'], ['Other', '11%', '11%']].map(([name, pct, width]) => (
                      <div key={name} style={{ marginBottom: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                          <span style={{ color: 'var(--muted)' }}>{name}</span>
                          <span style={{ color: 'var(--bottle)', fontWeight: 500 }}>{pct}</span>
                        </div>
                        <div style={{ height: 4, background: 'rgba(26,58,42,.08)', borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{ width, height: '100%', background: 'var(--forest)', borderRadius: 2 }}></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ background: 'var(--offwhite)', border: '0.5px solid var(--border)', borderRadius: 16, padding: '20px' }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--bottle)', marginBottom: 14 }}>Pending actions</div>
                    {[['1 agent awaiting approval', 'var(--gold)'], ['3 payouts to process', 'var(--forest)'], ['2 orders need review', '#e8413e']].map(([text, color]) => (
                      <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '0.5px solid var(--border)' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }}></div>
                        <div style={{ fontSize: 13, color: 'var(--bottle)' }}>{text}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ORDERS */}
          {page === 'orders' && (
            <div>
              <div style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 22, color: 'var(--bottle)', marginBottom: 24 }}>All Orders</div>
              <div style={{ background: 'var(--offwhite)', border: '0.5px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
                <div style={{ padding: '14px 22px', borderBottom: '0.5px solid var(--border)', display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1.5fr 1fr 1fr 1fr', gap: 12 }}>
                  {['Reference', 'Student', 'Services', 'Amount', 'Status', 'Date'].map(h => (
                    <div key={h} style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--muted)' }}>{h}</div>
                  ))}
                </div>
                {recentOrders.map((o, i) => (
                  <div key={o.ref} style={{ padding: '14px 22px', borderBottom: '0.5px solid var(--border)', display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1.5fr 1fr 1fr 1fr', gap: 12, alignItems: 'center', background: i % 2 === 0 ? 'transparent' : 'rgba(26,58,42,.02)' }}>
                    <div style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--forest)' }}>{o.ref}</div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--bottle)' }}>{o.student}</div>
                    <div style={{ fontSize: 13, color: 'var(--muted)' }}>{o.services}</div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--bottle)' }}>{o.amount}</div>
                    <span style={{ fontSize: 11, fontWeight: 500, padding: '3px 10px', borderRadius: 20, background: o.status === 'Pending' ? 'rgba(26,58,42,.06)' : o.status === 'Delivered' ? 'var(--mint)' : 'rgba(200,169,110,.15)', color: o.status === 'Pending' ? 'var(--muted)' : o.status === 'Delivered' ? 'var(--forest)' : 'var(--gold)', display: 'inline-block' }}>{o.status}</span>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>{o.date}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AGENTS */}
          {page === 'agents' && (
            <div>
              <div style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 22, color: 'var(--bottle)', marginBottom: 24 }}>Agents</div>
              <div style={{ background: 'var(--offwhite)', border: '0.5px solid var(--border)', borderRadius: 16, overflow: 'hidden', marginBottom: 20 }}>
                <div style={{ padding: '14px 22px', borderBottom: '0.5px solid var(--border)', display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr 1fr', gap: 12 }}>
                  {['Agent', 'Agency', 'Students', 'Commission', 'Tier', 'Status'].map(h => (
                    <div key={h} style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--muted)' }}>{h}</div>
                  ))}
                </div>
                {agents.map((a, i) => (
                  <div key={a.name} style={{ padding: '14px 22px', borderBottom: '0.5px solid var(--border)', display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr 1fr', gap: 12, alignItems: 'center', background: i % 2 === 0 ? 'transparent' : 'rgba(26,58,42,.02)' }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--bottle)' }}>{a.name}</div>
                    <div style={{ fontSize: 13, color: 'var(--muted)' }}>{a.agency}</div>
                    <div style={{ fontSize: 13, color: 'var(--bottle)' }}>{a.students}</div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--forest)' }}>{a.commission}</div>
                    <span style={{ fontSize: 11, fontWeight: 500, padding: '3px 10px', borderRadius: 20, background: a.tier === 'Gold' ? 'rgba(200,169,110,.15)' : a.tier === 'Silver' ? 'rgba(26,58,42,.08)' : 'rgba(26,58,42,.04)', color: a.tier === 'Gold' ? 'var(--gold)' : 'var(--muted)', display: 'inline-block' }}>{a.tier}</span>
                    <span style={{ fontSize: 11, fontWeight: 500, padding: '3px 10px', borderRadius: 20, background: a.status === 'Active' ? 'var(--mint)' : 'rgba(200,169,110,.15)', color: a.status === 'Active' ? 'var(--forest)' : 'var(--gold)', display: 'inline-block' }}>{a.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STUDENTS */}
          {page === 'students' && (
            <div>
              <div style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 22, color: 'var(--bottle)', marginBottom: 24 }}>All Students</div>
              <div style={{ background: 'var(--offwhite)', border: '0.5px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
                <div style={{ padding: '14px 22px', borderBottom: '0.5px solid var(--border)', display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr', gap: 12 }}>
                  {['Student', 'University', 'Country', 'Orders', 'Total spent'].map(h => (
                    <div key={h} style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--muted)' }}>{h}</div>
                  ))}
                </div>
                {[
                  { name: 'Priya Sharma', uni: 'Univ. of Manchester', country: '🇮🇳 India', orders: 1, spent: '£180' },
                  { name: 'Wei Zhang', uni: 'Univ. of Edinburgh', country: '🇨🇳 China', orders: 1, spent: '£232' },
                  { name: 'Arjun Mehta', uni: 'UCL London', country: '🇮🇳 India', orders: 1, spent: '£14' },
                  { name: 'Fatima Al-Hassan', uni: 'Univ. of Birmingham', country: '🇳🇬 Nigeria', orders: 1, spent: '£77' },
                  { name: 'Omar Siddiqui', uni: 'Univ. of Leeds', country: '🇵🇰 Pakistan', orders: 1, spent: '£232' },
                ].map((s, i) => (
                  <div key={s.name} style={{ padding: '14px 22px', borderBottom: '0.5px solid var(--border)', display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr', gap: 12, alignItems: 'center', background: i % 2 === 0 ? 'transparent' : 'rgba(26,58,42,.02)' }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--bottle)' }}>{s.name}</div>
                    <div style={{ fontSize: 13, color: 'var(--muted)' }}>{s.uni}</div>
                    <div style={{ fontSize: 13, color: 'var(--muted)' }}>{s.country}</div>
                    <div style={{ fontSize: 13, color: 'var(--bottle)' }}>{s.orders}</div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--forest)' }}>{s.spent}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SERVICES */}
          {page === 'services' && (
            <div>
              <div style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 22, color: 'var(--bottle)', marginBottom: 24 }}>Services</div>
              <div style={{ background: 'var(--offwhite)', border: '0.5px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
                {[
                  { icon: '🛏️', name: 'Bedding & Kitchen Pack', variants: 3, price: 'From £89', orders: 12, status: true },
                  { icon: '📱', name: 'UK SIM Card', variants: 3, price: 'From £14', orders: 8, status: true },
                  { icon: '✈️', name: 'Flight Tickets', variants: 2, price: 'From £420', orders: 3, status: true },
                  { icon: '🛡️', name: 'Travel Insurance', variants: 2, price: 'From £32', orders: 5, status: true },
                  { icon: '🏥', name: 'Health Insurance', variants: 2, price: 'From £15/mo', orders: 2, status: true },
                  { icon: '💸', name: 'Foreign Remittance', variants: 1, price: '0.4% fee', orders: 0, status: true },
                  { icon: '🚗', name: 'Airport Transfers', variants: 4, price: 'From £28', orders: 4, status: true },
                ].map((s, i) => (
                  <div key={s.name} style={{ padding: '16px 22px', borderBottom: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', gap: 16, background: i % 2 === 0 ? 'transparent' : 'rgba(26,58,42,.02)' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--mint)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{s.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--bottle)' }}>{s.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>{s.variants} variants · {s.price} · {s.orders} orders</div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 500, padding: '3px 10px', borderRadius: 20, background: 'var(--mint)', color: 'var(--forest)' }}>Active</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PAYOUTS */}
          {page === 'payouts' && (
            <div>
              <div style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 22, color: 'var(--bottle)', marginBottom: 24 }}>Agent Payouts</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 24 }}>
                {[['💷', '£592', 'Total commissions'], ['⏳', '£340', 'Pending payout'], ['✅', '£252', 'Paid out']].map(([icon, val, label]) => (
                  <div key={label} style={{ background: 'var(--offwhite)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '20px' }}>
                    <div style={{ fontSize: 22, marginBottom: 10 }}>{icon}</div>
                    <div style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 28, color: 'var(--bottle)' }}>{val}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{label}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: 'var(--offwhite)', border: '0.5px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
                <div style={{ padding: '16px 22px', borderBottom: '0.5px solid var(--border)', fontSize: 14, fontWeight: 500, color: 'var(--bottle)' }}>Pending payouts</div>
                {agents.filter(a => a.status === 'Active').map((a, i) => (
                  <div key={a.name} style={{ padding: '14px 22px', borderBottom: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--bottle)' }}>{a.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>{a.agency} · {a.tier} tier</div>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--forest)' }}>{a.commission}</div>
                    <button style={{ padding: '7px 16px', fontSize: 12, fontWeight: 500, background: 'var(--forest)', color: '#fff', border: 'none', borderRadius: 20, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Mark paid</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SETTINGS */}
          {page === 'settings' && (
            <div>
              <div style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 22, color: 'var(--bottle)', marginBottom: 24 }}>Settings</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div style={{ background: 'var(--offwhite)', border: '0.5px solid var(--border)', borderRadius: 16, padding: '24px' }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--bottle)', marginBottom: 16 }}>Platform settings</div>
                  {[['Company name', 'Student Solutions Pvt Limited'], ['Contact email', 'care@student-essentials.com'], ['Support WhatsApp', '+44 7700 000000'], ['Registered address', '3 Fulham Park Gardens, London SW6 4JX']].map(([label, val]) => (
                    <div key={label} style={{ marginBottom: 14 }}>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--moss)', marginBottom: 5 }}>{label}</label>
                      <input defaultValue={val} style={{ width: '100%', padding: '10px 14px', fontSize: 14, background: '#fff', border: '0.5px solid rgba(26,58,42,.2)', borderRadius: 10, outline: 'none', fontFamily: 'DM Sans, sans-serif' }} />
                    </div>
                  ))}
                  <button style={{ padding: '11px 24px', fontSize: 13, fontWeight: 500, background: 'var(--forest)', color: '#fff', border: 'none', borderRadius: 40, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Save settings</button>
                </div>
                <div style={{ background: 'var(--offwhite)', border: '0.5px solid var(--border)', borderRadius: 16, padding: '24px' }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--bottle)', marginBottom: 16 }}>Commission tiers</div>
                  {[['Bronze', '0–10 students', '5%'], ['Silver', '11–25 students', '7%'], ['Gold', '26+ students', '10%']].map(([tier, range, rate]) => (
                    <div key={tier} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '0.5px solid var(--border)' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--bottle)' }}>{tier}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)' }}>{range}</div>
                      </div>
                      <input defaultValue={rate} style={{ width: 70, padding: '7px 12px', fontSize: 14, background: '#fff', border: '0.5px solid rgba(26,58,42,.2)', borderRadius: 8, outline: 'none', fontFamily: 'DM Sans, sans-serif', textAlign: 'center' }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}