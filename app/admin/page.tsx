'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

// ── Types ──────────────────────────────────────────────────────────
type Lead = {
  id: string
  first_name: string
  last_name: string | null
  email: string | null
  phone: string | null
  university: string | null
  country: string | null
  stage: string
  source: string | null
  utm_source: string | null
  utm_campaign: string | null
  notes: string | null
  created_at: string
  ed_partner_id: string | null
}

type EdPartner = {
  id: string
  name: string
  contact_name: string | null
  contact_email: string | null
  contact_phone: string | null
  institution: string | null
  utm_code: string
  commission_rate: number
  status: string
  created_at: string
}

type Student = {
  id: string
  first_name: string | null
  email: string | null
  university: string | null
  country: string | null
  status: string
  source: string | null
  created_at: string
}

// ── Static mock data (orders until Stripe wired) ───────────────────
const MOCK_ORDERS = [
  { ref: 'SE-2026-57168', student: 'Priya Sharma', services: 'Full pack', amount: '£180', status: 'Confirmed', date: '21 May' },
  { ref: 'SE-2026-57102', student: 'Wei Zhang', services: 'Bedding + SIM', amount: '£103', status: 'Dispatched', date: '20 May' },
  { ref: 'SE-2026-56998', student: 'Arjun Mehta', services: 'SIM only', amount: '£14', status: 'Delivered', date: '19 May' },
  { ref: 'SE-2026-56901', student: 'Fatima Al-Hassan', services: 'Transfer + Insurance', amount: '£77', status: 'Confirmed', date: '18 May' },
  { ref: 'SE-2026-56845', student: 'Omar Siddiqui', services: 'Full pack', amount: '£232', status: 'Pending', date: '17 May' },
]

const STAGES = ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'] as const
const STAGE_LABELS: Record<string, string> = { new: 'New', contacted: 'Contacted', qualified: 'Qualified', proposal: 'Proposal', won: 'Won', lost: 'Lost' }
const STAGE_COLORS: Record<string, string> = { new: '#6366f1', contacted: '#f59e0b', qualified: '#3b82f6', proposal: '#8b5cf6', won: '#10b981', lost: '#ef4444' }

const pages = ['overview', 'crm', 'orders', 'customers', 'ed-partners', 'reports', 'services', 'payouts', 'settings'] as const
type Page = typeof pages[number]

// ── Helpers ────────────────────────────────────────────────────────
const S = {
  card: { background: 'var(--offwhite)', border: '0.5px solid var(--border)', borderRadius: 16 } as React.CSSProperties,
  th: { fontSize: 11, fontWeight: 500, textTransform: 'uppercase' as const, letterSpacing: '.05em', color: 'var(--muted)' },
  badge: (color: string, bg: string) => ({ fontSize: 11, fontWeight: 500, padding: '3px 10px', borderRadius: 20, background: bg, color, display: 'inline-block' } as React.CSSProperties),
}

function statusBadge(status: string) {
  const map: Record<string, [string, string]> = {
    Pending: ['var(--muted)', 'rgba(26,58,42,.06)'],
    Confirmed: ['var(--forest)', 'var(--mint)'],
    Dispatched: ['var(--gold)', 'rgba(200,169,110,.15)'],
    Delivered: ['var(--forest)', 'var(--mint)'],
    new_lead: ['var(--muted)', 'rgba(26,58,42,.06)'],
    active: ['var(--forest)', 'var(--mint)'],
  }
  const [color, bg] = map[status] ?? ['var(--muted)', 'rgba(26,58,42,.06)']
  return <span style={S.badge(color, bg)}>{status.replace('_', ' ')}</span>
}

// ── Modal ──────────────────────────────────────────────────────────
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'var(--cream)', borderRadius: 18, padding: '32px', width: 520, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 60px rgba(0,0,0,.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 20, color: 'var(--bottle)' }}>{title}</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--muted)' }}>×</button>
        </div>
        {children}
      </div>
    </div>
  )
}

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--moss)', marginBottom: 5 }}>{label}</label>
      <input {...props} style={{ width: '100%', padding: '10px 14px', fontSize: 14, background: '#fff', border: '0.5px solid rgba(26,58,42,.2)', borderRadius: 10, outline: 'none', fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box' }} />
    </div>
  )
}

function Btn({ children, onClick, variant = 'primary', style }: { children: React.ReactNode; onClick?: () => void; variant?: 'primary' | 'ghost'; style?: React.CSSProperties }) {
  return (
    <button onClick={onClick} style={{ padding: '10px 22px', fontSize: 13, fontWeight: 500, background: variant === 'primary' ? 'var(--forest)' : 'transparent', color: variant === 'primary' ? '#fff' : 'var(--forest)', border: variant === 'ghost' ? '0.5px solid var(--forest)' : 'none', borderRadius: 40, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', ...style }}>
      {children}
    </button>
  )
}

// ══════════════════════════════════════════════════════════════════
export default function AdminPanel() {
  const router = useRouter()
  const [page, setPage] = useState<Page>('overview')
  const [user, setUser] = useState<{ email: string; firstName: string } | null>(null)

  // Data state
  const [leads, setLeads] = useState<Lead[]>([])
  const [partners, setPartners] = useState<EdPartner[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(false)

  // Modal state
  const [showNewLead, setShowNewLead] = useState(false)
  const [showNewPartner, setShowNewPartner] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)

  // Drag state
  const dragId = useRef<string | null>(null)

  // ── Auth ──
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/auth/login'); return }
      setUser({ email: user.email ?? '', firstName: user.user_metadata?.first_name ?? user.email?.split('@')[0] ?? 'Admin' })
    })
  }, [])

  // ── Fetch data when page changes ──
  useEffect(() => {
    const supabase = createClient()
    if (page === 'crm' || page === 'overview') {
      setLoading(true)
      supabase.from('crm_leads').select('*').order('created_at', { ascending: false })
        .then(({ data }) => { setLeads(data ?? []); setLoading(false) })
    }
    if (page === 'ed-partners' || page === 'overview') {
      supabase.from('ed_partners').select('*').order('created_at', { ascending: false })
        .then(({ data }) => setPartners(data ?? []))
    }
    if (page === 'customers' || page === 'overview') {
      supabase.from('crm_students').select('*').order('created_at', { ascending: false })
        .then(({ data }) => setStudents(data ?? []))
    }
  }, [page])

  const signOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  // ── Lead actions ──
  const moveLead = async (id: string, stage: string) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, stage } : l))
    const supabase = createClient()
    await supabase.from('crm_leads').update({ stage, updated_at: new Date().toISOString() }).eq('id', id)
  }

  const createLead = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const supabase = createClient()
    const { data } = await supabase.from('crm_leads').insert({
      first_name: fd.get('first_name') as string,
      last_name: fd.get('last_name') as string || null,
      email: fd.get('email') as string || null,
      phone: fd.get('phone') as string || null,
      university: fd.get('university') as string || null,
      country: fd.get('country') as string || null,
      stage: 'new',
      source: 'manual',
      notes: fd.get('notes') as string || null,
    }).select().single()
    if (data) setLeads(prev => [data, ...prev])
    setShowNewLead(false)
  }

  const updateLeadNotes = async (id: string, notes: string) => {
    const supabase = createClient()
    await supabase.from('crm_leads').update({ notes }).eq('id', id)
    setLeads(prev => prev.map(l => l.id === id ? { ...l, notes } : l))
  }

  // ── Partner actions ──
  const createPartner = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const supabase = createClient()
    const { data } = await supabase.from('ed_partners').insert({
      name: fd.get('name') as string,
      contact_name: fd.get('contact_name') as string || null,
      contact_email: fd.get('contact_email') as string || null,
      contact_phone: fd.get('contact_phone') as string || null,
      institution: fd.get('institution') as string || null,
      utm_code: fd.get('utm_code') as string,
      commission_rate: parseFloat(fd.get('commission_rate') as string) || 5,
      status: 'active',
    }).select().single()
    if (data) setPartners(prev => [data, ...prev])
    setShowNewPartner(false)
  }

  // ── Nav ──
  const navItems: { id: Page; icon: string; label: string; section?: string }[] = [
    { id: 'overview', icon: '📊', label: 'Overview', section: 'Management' },
    { id: 'crm', icon: '🎯', label: 'CRM · Leads', section: '' },
    { id: 'orders', icon: '📦', label: 'Orders', section: '' },
    { id: 'customers', icon: '🎓', label: 'Customers', section: '' },
    { id: 'ed-partners', icon: '🏫', label: 'Ed-Partners', section: '' },
    { id: 'reports', icon: '📈', label: 'Reports', section: 'Analytics' },
    { id: 'services', icon: '✨', label: 'Services', section: 'Config' },
    { id: 'payouts', icon: '💷', label: 'Payouts', section: '' },
    { id: 'settings', icon: '⚙️', label: 'Settings', section: '' },
  ]

  // ── Pipeline counts ──
  const stageCounts = STAGES.reduce((acc, s) => ({ ...acc, [s]: leads.filter(l => l.stage === s).length }), {} as Record<string, number>)

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--cream)', fontFamily: 'DM Sans, sans-serif' }}>

      {/* ── SIDEBAR ── */}
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

        <div style={{ padding: '4px 12px', flex: 1, overflowY: 'auto' }}>
          {navItems.map((item, i) => (
            <div key={item.id}>
              {item.section && (
                <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.2)', padding: i === 0 ? '8px 10px 4px' : '16px 10px 4px' }}>{item.section}</div>
              )}
              <button onClick={() => setPage(item.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 8, width: '100%', textAlign: 'left', fontSize: 13, color: page === item.id ? '#fff' : 'rgba(255,255,255,.55)', background: page === item.id ? 'rgba(107,191,138,.15)' : 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', marginBottom: 1 }}>
                <span style={{ fontSize: 15, width: 20, textAlign: 'center' }}>{item.icon}</span>
                {item.label}
              </button>
            </div>
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

      {/* ── MAIN ── */}
      <main style={{ marginLeft: 240, flex: 1, minWidth: 0 }}>
        <div style={{ position: 'sticky', top: 0, zIndex: 40, padding: '0 40px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(245,240,232,.93)', backdropFilter: 'blur(14px)', borderBottom: '0.5px solid var(--border)' }}>
          <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--bottle)' }}>{navItems.find(n => n.id === page)?.label}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {page === 'crm' && <Btn onClick={() => setShowNewLead(true)}>+ New lead</Btn>}
            {page === 'ed-partners' && <Btn onClick={() => setShowNewPartner(true)}>+ New partner</Btn>}
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>StudentEssentials · {user?.email}</div>
          </div>
        </div>

        <div style={{ padding: '36px 40px' }}>

          {/* ══ OVERVIEW ══ */}
          {page === 'overview' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
                {[
                  ['📦', MOCK_ORDERS.length.toString(), 'Orders', 'this month'],
                  ['🎓', students.length.toString(), 'Customers', 'from website'],
                  ['🏫', partners.filter(p => p.status === 'active').length.toString(), 'Ed-Partners', 'active'],
                  ['🎯', leads.length.toString(), 'CRM Leads', `${stageCounts['won'] ?? 0} won`],
                ].map(([icon, val, label, sub]) => (
                  <div key={label} style={{ ...S.card, padding: '18px 20px' }}>
                    <div style={{ fontSize: 20, marginBottom: 10 }}>{icon}</div>
                    <div style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 26, color: 'var(--bottle)', lineHeight: 1 }}>{val}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{label}</div>
                    <div style={{ fontSize: 11, color: 'var(--forest)', marginTop: 2 }}>{sub}</div>
                  </div>
                ))}
              </div>

              {/* Pipeline mini */}
              <div style={{ ...S.card, padding: '20px 24px', marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--bottle)', marginBottom: 16 }}>Lead pipeline</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 10 }}>
                  {STAGES.map(s => (
                    <div key={s} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 22, fontWeight: 600, color: STAGE_COLORS[s] }}>{stageCounts[s] ?? 0}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{STAGE_LABELS[s]}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
                <div style={{ ...S.card, overflow: 'hidden' }}>
                  <div style={{ padding: '16px 22px', borderBottom: '0.5px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--bottle)' }}>Recent orders</div>
                    <button onClick={() => setPage('orders')} style={{ fontSize: 12, color: 'var(--forest)', background: 'none', border: 'none', cursor: 'pointer' }}>View all →</button>
                  </div>
                  {MOCK_ORDERS.slice(0,4).map(o => (
                    <div key={o.ref} style={{ padding: '12px 22px', borderBottom: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--bottle)' }}>{o.student}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)' }}>{o.ref} · {o.services}</div>
                      </div>
                      {statusBadge(o.status)}
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--bottle)' }}>{o.amount}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ ...S.card, padding: '20px' }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--bottle)', marginBottom: 14 }}>Recent customers</div>
                    {students.slice(0,4).map(s => (
                      <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: '0.5px solid var(--border)' }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--mint)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: 'var(--forest)', flexShrink: 0 }}>
                          {(s.first_name ?? s.email ?? '?')[0].toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--bottle)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.first_name ?? s.email}</div>
                          <div style={{ fontSize: 11, color: 'var(--muted)' }}>{s.source ?? 'website'}</div>
                        </div>
                        {statusBadge(s.status)}
                      </div>
                    ))}
                    {students.length === 0 && <div style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center', padding: '12px 0' }}>No customers yet</div>}
                  </div>

                  <div style={{ ...S.card, padding: '20px' }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--bottle)', marginBottom: 14 }}>Ed-Partners</div>
                    {partners.slice(0,3).map(p => (
                      <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: '0.5px solid var(--border)' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--bottle)' }}>{p.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'monospace' }}>?utm_partner={p.utm_code}</div>
                        </div>
                        <span style={S.badge('var(--forest)', 'var(--mint)')}>{p.commission_rate}%</span>
                      </div>
                    ))}
                    {partners.length === 0 && <div style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center', padding: '12px 0' }}>No partners yet</div>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══ CRM LEADS (KANBAN) ══ */}
          {page === 'crm' && (
            <div>
              {/* Stats row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 10, marginBottom: 24 }}>
                {STAGES.map(s => (
                  <div key={s} style={{ ...S.card, padding: '14px 16px' }}>
                    <div style={{ fontSize: 20, fontWeight: 600, color: STAGE_COLORS[s] }}>{stageCounts[s] ?? 0}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{STAGE_LABELS[s]}</div>
                  </div>
                ))}
              </div>

              {loading && <div style={{ textAlign: 'center', color: 'var(--muted)', padding: 40 }}>Loading leads…</div>}

              {/* Kanban board */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 12, alignItems: 'start' }}>
                {STAGES.map(stage => (
                  <div
                    key={stage}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => {
                      e.preventDefault()
                      if (dragId.current) moveLead(dragId.current, stage)
                    }}
                    style={{ background: 'rgba(26,58,42,.03)', border: '0.5px solid var(--border)', borderRadius: 14, minHeight: 200, padding: '12px 10px' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, padding: '0 2px' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: STAGE_COLORS[stage], flexShrink: 0 }}></div>
                      <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--muted)' }}>{STAGE_LABELS[stage]}</div>
                      <div style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--muted)' }}>{stageCounts[stage] ?? 0}</div>
                    </div>

                    {leads.filter(l => l.stage === stage).map(lead => (
                      <div
                        key={lead.id}
                        draggable
                        onDragStart={() => { dragId.current = lead.id }}
                        onClick={() => setSelectedLead(lead)}
                        style={{ background: '#fff', border: '0.5px solid var(--border)', borderRadius: 10, padding: '12px', marginBottom: 8, cursor: 'grab', boxShadow: '0 1px 4px rgba(0,0,0,.05)' }}
                      >
                        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--bottle)', marginBottom: 4 }}>
                          {lead.first_name} {lead.last_name ?? ''}
                        </div>
                        {lead.university && <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>🎓 {lead.university}</div>}
                        {lead.email && <div style={{ fontSize: 11, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>✉ {lead.email}</div>}
                        {lead.utm_source && <div style={{ fontSize: 10, color: 'var(--forest)', marginTop: 6, fontFamily: 'monospace' }}>utm: {lead.utm_source}</div>}
                        <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 6 }}>{new Date(lead.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</div>
                      </div>
                    ))}

                    {leads.filter(l => l.stage === stage).length === 0 && (
                      <div style={{ fontSize: 11, color: 'rgba(26,58,42,.25)', textAlign: 'center', padding: '20px 0' }}>Drop here</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══ ORDERS ══ */}
          {page === 'orders' && (
            <div>
              <div style={{ ...S.card, overflow: 'hidden' }}>
                <div style={{ padding: '14px 22px', borderBottom: '0.5px solid var(--border)', display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1.5fr 1fr 1fr 1fr', gap: 12 }}>
                  {['Reference', 'Student', 'Services', 'Amount', 'Status', 'Date'].map(h => <div key={h} style={S.th}>{h}</div>)}
                </div>
                {MOCK_ORDERS.map((o, i) => (
                  <div key={o.ref} style={{ padding: '14px 22px', borderBottom: '0.5px solid var(--border)', display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1.5fr 1fr 1fr 1fr', gap: 12, alignItems: 'center', background: i % 2 ? 'rgba(26,58,42,.02)' : 'transparent' }}>
                    <div style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--forest)' }}>{o.ref}</div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--bottle)' }}>{o.student}</div>
                    <div style={{ fontSize: 13, color: 'var(--muted)' }}>{o.services}</div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--bottle)' }}>{o.amount}</div>
                    {statusBadge(o.status)}
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>{o.date}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)' }}>💡 Orders will auto-populate once Stripe webhooks are wired.</div>
            </div>
          )}

          {/* ══ CUSTOMERS ══ */}
          {page === 'customers' && (
            <div>
              <div style={{ ...S.card, overflow: 'hidden' }}>
                <div style={{ padding: '14px 22px', borderBottom: '0.5px solid var(--border)', display: 'grid', gridTemplateColumns: '2fr 2fr 2fr 1fr 1fr', gap: 12 }}>
                  {['Name', 'Email', 'University', 'Source', 'Status'].map(h => <div key={h} style={S.th}>{h}</div>)}
                </div>
                {students.map((s, i) => (
                  <div key={s.id} style={{ padding: '14px 22px', borderBottom: '0.5px solid var(--border)', display: 'grid', gridTemplateColumns: '2fr 2fr 2fr 1fr 1fr', gap: 12, alignItems: 'center', background: i % 2 ? 'rgba(26,58,42,.02)' : 'transparent' }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--bottle)' }}>{s.first_name ?? '—'}</div>
                    <div style={{ fontSize: 13, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.email ?? '—'}</div>
                    <div style={{ fontSize: 13, color: 'var(--muted)' }}>{s.university ?? '—'}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>{s.source ?? 'website'}</div>
                    {statusBadge(s.status)}
                  </div>
                ))}
                {students.length === 0 && (
                  <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>No customers yet. Students who sign up on the website will appear here.</div>
                )}
              </div>
            </div>
          )}

          {/* ══ ED-PARTNERS ══ */}
          {page === 'ed-partners' && (
            <div>
              <div style={{ ...S.card, overflow: 'hidden', marginBottom: 20 }}>
                <div style={{ padding: '14px 22px', borderBottom: '0.5px solid var(--border)', display: 'grid', gridTemplateColumns: '2fr 2fr 2fr 1.5fr 1fr 1fr', gap: 12 }}>
                  {['Partner', 'Institution', 'Contact', 'UTM Link', 'Commission', 'Status'].map(h => <div key={h} style={S.th}>{h}</div>)}
                </div>
                {partners.map((p, i) => (
                  <div key={p.id} style={{ padding: '14px 22px', borderBottom: '0.5px solid var(--border)', display: 'grid', gridTemplateColumns: '2fr 2fr 2fr 1.5fr 1fr 1fr', gap: 12, alignItems: 'center', background: i % 2 ? 'rgba(26,58,42,.02)' : 'transparent' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--bottle)' }}>{p.name}</div>
                      {p.contact_name && <div style={{ fontSize: 11, color: 'var(--muted)' }}>{p.contact_name}</div>}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--muted)' }}>{p.institution ?? '—'}</div>
                    <div>
                      {p.contact_email && <div style={{ fontSize: 12, color: 'var(--muted)' }}>{p.contact_email}</div>}
                      {p.contact_phone && <div style={{ fontSize: 12, color: 'var(--muted)' }}>{p.contact_phone}</div>}
                    </div>
                    <div style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--forest)', background: 'var(--mint)', padding: '4px 8px', borderRadius: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      ?utm_partner={p.utm_code}
                    </div>
                    <span style={S.badge('var(--forest)', 'rgba(26,58,42,.08)')}>{p.commission_rate}%</span>
                    <span style={S.badge(p.status === 'active' ? 'var(--forest)' : 'var(--gold)', p.status === 'active' ? 'var(--mint)' : 'rgba(200,169,110,.15)')}>
                      {p.status}
                    </span>
                  </div>
                ))}
                {partners.length === 0 && (
                  <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>No partners yet. Add your first Ed-Partner above.</div>
                )}
              </div>

              {/* UTM info box */}
              <div style={{ ...S.card, padding: '20px 24px', background: 'rgba(26,58,42,.04)' }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--bottle)', marginBottom: 8 }}>How UTM tracking works</div>
                <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7 }}>
                  Each partner gets a unique UTM code. Share this link with them:<br />
                  <code style={{ fontSize: 12, background: '#fff', padding: '3px 8px', borderRadius: 6, border: '0.5px solid var(--border)', color: 'var(--forest)' }}>
                    https://student-essentials.com/?utm_partner=THEIR_CODE
                  </code>
                  <br />When a student signs up via this link, they're automatically attributed to that partner and a lead is created in CRM.
                </div>
              </div>
            </div>
          )}

          {/* ══ REPORTS ══ */}
          {page === 'reports' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
                {[
                  ['£1,840', 'Revenue (May)', '+23% vs Apr'],
                  ['£14,200', 'Revenue (YTD)', ''],
                  ['£38.90', 'Avg. order value', ''],
                  ['68%', 'Lead→Customer rate', ''],
                ].map(([val, label, sub]) => (
                  <div key={label} style={{ ...S.card, padding: '20px' }}>
                    <div style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 28, color: 'var(--bottle)', lineHeight: 1 }}>{val}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>{label}</div>
                    {sub && <div style={{ fontSize: 11, color: 'var(--forest)', marginTop: 2 }}>{sub}</div>}
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                {/* Revenue by service */}
                <div style={{ ...S.card, padding: '24px' }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--bottle)', marginBottom: 18 }}>Revenue by service</div>
                  {[['🛏️', 'Bedding packs', 42], ['📱', 'SIM cards', 18], ['🛡️', 'Insurance', 15], ['🚗', 'Transfers', 14], ['✈️', 'Flights', 11]].map(([icon, name, pct]) => (
                    <div key={name as string} style={{ marginBottom: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, marginBottom: 6 }}>
                        <span style={{ color: 'var(--bottle)' }}>{icon} {name}</span>
                        <span style={{ color: 'var(--forest)', fontWeight: 500 }}>{pct}%</span>
                      </div>
                      <div style={{ height: 6, background: 'rgba(26,58,42,.08)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: 'var(--forest)', borderRadius: 3, transition: 'width .4s' }}></div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Leads by source */}
                <div style={{ ...S.card, padding: '24px' }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--bottle)', marginBottom: 18 }}>Leads by source</div>
                  {[
                    ['Website signup', leads.filter(l => l.source === 'website' || l.source === null).length, '#6366f1'],
                    ['Ed-Partner referral', leads.filter(l => l.utm_source !== null).length, '#10b981'],
                    ['Manual entry', leads.filter(l => l.source === 'manual').length, '#f59e0b'],
                  ].map(([name, count, color]) => {
                    const total = leads.length || 1
                    const pct = Math.round(((count as number) / total) * 100)
                    return (
                      <div key={name as string} style={{ marginBottom: 14 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, marginBottom: 6 }}>
                          <span style={{ color: 'var(--bottle)' }}>{name}</span>
                          <span style={{ color: 'var(--muted)', fontWeight: 500 }}>{count as number} ({pct}%)</span>
                        </div>
                        <div style={{ height: 6, background: 'rgba(26,58,42,.08)', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: color as string, borderRadius: 3 }}></div>
                        </div>
                      </div>
                    )
                  })}

                  <div style={{ marginTop: 24, paddingTop: 18, borderTop: '0.5px solid var(--border)' }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--bottle)', marginBottom: 12 }}>Pipeline funnel</div>
                    {STAGES.map(s => {
                      const count = stageCounts[s] ?? 0
                      const max = Math.max(...Object.values(stageCounts), 1)
                      return (
                        <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                          <div style={{ width: 70, fontSize: 11, color: 'var(--muted)' }}>{STAGE_LABELS[s]}</div>
                          <div style={{ flex: 1, height: 6, background: 'rgba(26,58,42,.08)', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ width: `${(count / max) * 100}%`, height: '100%', background: STAGE_COLORS[s], borderRadius: 3 }}></div>
                          </div>
                          <div style={{ width: 20, fontSize: 12, color: 'var(--bottle)', textAlign: 'right' }}>{count}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Ed-Partner performance */}
              <div style={{ ...S.card, overflow: 'hidden' }}>
                <div style={{ padding: '16px 22px', borderBottom: '0.5px solid var(--border)', fontSize: 14, fontWeight: 500, color: 'var(--bottle)' }}>Ed-Partner performance</div>
                <div style={{ padding: '14px 22px', borderBottom: '0.5px solid var(--border)', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: 12 }}>
                  {['Partner', 'Leads', 'Customers', 'Revenue', 'Commission owed'].map(h => <div key={h} style={S.th}>{h}</div>)}
                </div>
                {partners.length === 0 && (
                  <div style={{ padding: 32, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>Add Ed-Partners to see their performance here.</div>
                )}
                {partners.map((p, i) => {
                  const partnerLeads = leads.filter(l => l.ed_partner_id === p.id)
                  return (
                    <div key={p.id} style={{ padding: '14px 22px', borderBottom: '0.5px solid var(--border)', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: 12, alignItems: 'center', background: i % 2 ? 'rgba(26,58,42,.02)' : 'transparent' }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--bottle)' }}>{p.name}</div>
                      <div style={{ fontSize: 13, color: 'var(--bottle)' }}>{partnerLeads.length}</div>
                      <div style={{ fontSize: 13, color: 'var(--bottle)' }}>—</div>
                      <div style={{ fontSize: 13, color: 'var(--bottle)' }}>—</div>
                      <div style={{ fontSize: 13, color: 'var(--forest)', fontWeight: 500 }}>—</div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ══ SERVICES ══ */}
          {page === 'services' && (
            <div>
              <div style={{ ...S.card, overflow: 'hidden' }}>
                {[
                  { icon: '🛏️', name: 'Bedding & Kitchen Pack', variants: 3, price: 'From £89', orders: 12 },
                  { icon: '📱', name: 'UK SIM Card', variants: 3, price: 'From £14', orders: 8 },
                  { icon: '✈️', name: 'Flight Tickets', variants: 2, price: 'From £420', orders: 3 },
                  { icon: '🛡️', name: 'Travel Insurance', variants: 2, price: 'From £32', orders: 5 },
                  { icon: '🏥', name: 'Health Insurance', variants: 2, price: 'From £15/mo', orders: 2 },
                  { icon: '💸', name: 'Foreign Remittance', variants: 1, price: '0.4% fee', orders: 0 },
                  { icon: '🚗', name: 'Airport Transfers', variants: 4, price: 'From £28', orders: 4 },
                ].map((s, i) => (
                  <div key={s.name} style={{ padding: '16px 22px', borderBottom: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', gap: 16, background: i % 2 ? 'rgba(26,58,42,.02)' : 'transparent' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--mint)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{s.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--bottle)' }}>{s.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>{s.variants} variants · {s.price} · {s.orders} orders</div>
                    </div>
                    <span style={S.badge('var(--forest)', 'var(--mint)')}>Active</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══ PAYOUTS ══ */}
          {page === 'payouts' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 24 }}>
                {[['💷', '£592', 'Total commissions'], ['⏳', '£340', 'Pending payout'], ['✅', '£252', 'Paid out']].map(([icon, val, label]) => (
                  <div key={label} style={{ ...S.card, padding: '20px' }}>
                    <div style={{ fontSize: 22, marginBottom: 10 }}>{icon}</div>
                    <div style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 28, color: 'var(--bottle)' }}>{val}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{label}</div>
                  </div>
                ))}
              </div>
              <div style={{ ...S.card, overflow: 'hidden' }}>
                <div style={{ padding: '16px 22px', borderBottom: '0.5px solid var(--border)', fontSize: 14, fontWeight: 500, color: 'var(--bottle)' }}>Ed-Partner payouts</div>
                {partners.filter(p => p.status === 'active').map(p => (
                  <div key={p.id} style={{ padding: '14px 22px', borderBottom: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--bottle)' }}>{p.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>{p.institution ?? ''} · {p.commission_rate}% commission</div>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--forest)' }}>£—</div>
                    <button style={{ padding: '7px 16px', fontSize: 12, fontWeight: 500, background: 'var(--forest)', color: '#fff', border: 'none', borderRadius: 20, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Mark paid</button>
                  </div>
                ))}
                {partners.filter(p => p.status === 'active').length === 0 && (
                  <div style={{ padding: 32, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>No active partners yet.</div>
                )}
              </div>
            </div>
          )}

          {/* ══ SETTINGS ══ */}
          {page === 'settings' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div style={{ ...S.card, padding: '24px' }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--bottle)', marginBottom: 16 }}>Platform settings</div>
                  {[['Company name', 'Student Solutions Pvt Limited'], ['Contact email', 'care@student-essentials.com'], ['Support WhatsApp', '+44 7700 000000'], ['Registered address', '3 Fulham Park Gardens, London SW6 4JX']].map(([label, val]) => (
                    <Field key={label} label={label} defaultValue={val} />
                  ))}
                  <Btn>Save settings</Btn>
                </div>
                <div style={{ ...S.card, padding: '24px' }}>
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

      {/* ══ NEW LEAD MODAL ══ */}
      {showNewLead && (
        <Modal title="New lead" onClose={() => setShowNewLead(false)}>
          <form onSubmit={createLead}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
              <Field label="First name *" name="first_name" required placeholder="Arjun" />
              <Field label="Last name" name="last_name" placeholder="Mehta" />
              <Field label="Email" name="email" type="email" placeholder="arjun@email.com" />
              <Field label="Phone" name="phone" placeholder="+91 98765 43210" />
              <Field label="University" name="university" placeholder="Univ. of Manchester" />
              <Field label="Country" name="country" placeholder="India" />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--moss)', marginBottom: 5 }}>Notes</label>
              <textarea name="notes" placeholder="Any notes about this lead…" style={{ width: '100%', padding: '10px 14px', fontSize: 14, background: '#fff', border: '0.5px solid rgba(26,58,42,.2)', borderRadius: 10, outline: 'none', fontFamily: 'DM Sans, sans-serif', resize: 'vertical', minHeight: 80, boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <Btn variant="ghost" onClick={() => setShowNewLead(false)}>Cancel</Btn>
              <Btn>Create lead</Btn>
            </div>
          </form>
        </Modal>
      )}

      {/* ══ NEW PARTNER MODAL ══ */}
      {showNewPartner && (
        <Modal title="New Ed-Partner" onClose={() => setShowNewPartner(false)}>
          <form onSubmit={createPartner}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
              <Field label="Organisation name *" name="name" required placeholder="UK Study Hub" />
              <Field label="Institution type" name="institution" placeholder="University / College / Agency" />
              <Field label="Contact name" name="contact_name" placeholder="Ravi Kumar" />
              <Field label="Contact email" name="contact_email" type="email" placeholder="ravi@ukstudyhub.com" />
              <Field label="Contact phone" name="contact_phone" placeholder="+44 7700 000000" />
              <Field label="UTM code *" name="utm_code" required placeholder="ukstudyhub" />
            </div>
            <Field label="Commission rate (%)" name="commission_rate" type="number" defaultValue="5" min="0" max="100" />
            <div style={{ padding: '12px 16px', background: 'var(--mint)', borderRadius: 10, marginBottom: 16, fontSize: 12, color: 'var(--forest)' }}>
              Partner referral link will be: <strong>student-essentials.com/?utm_partner=UTM_CODE</strong>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <Btn variant="ghost" onClick={() => setShowNewPartner(false)}>Cancel</Btn>
              <Btn>Create partner</Btn>
            </div>
          </form>
        </Modal>
      )}

      {/* ══ LEAD DETAIL MODAL ══ */}
      {selectedLead && (
        <Modal title={`${selectedLead.first_name} ${selectedLead.last_name ?? ''}`} onClose={() => setSelectedLead(null)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            {[
              ['Email', selectedLead.email],
              ['Phone', selectedLead.phone],
              ['University', selectedLead.university],
              ['Country', selectedLead.country],
              ['Source', selectedLead.source],
              ['UTM', selectedLead.utm_source],
            ].map(([label, val]) => val ? (
              <div key={label}>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 13, color: 'var(--bottle)' }}>{val}</div>
              </div>
            ) : null)}
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--moss)', marginBottom: 8 }}>Move stage</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {STAGES.map(s => (
                <button key={s} onClick={() => { moveLead(selectedLead.id, s); setSelectedLead({ ...selectedLead, stage: s }) }}
                  style={{ padding: '5px 14px', fontSize: 12, borderRadius: 20, border: `1.5px solid ${STAGE_COLORS[s]}`, background: selectedLead.stage === s ? STAGE_COLORS[s] : 'transparent', color: selectedLead.stage === s ? '#fff' : STAGE_COLORS[s], cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}>
                  {STAGE_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--moss)', marginBottom: 6 }}>Notes</div>
            <textarea
              defaultValue={selectedLead.notes ?? ''}
              onBlur={e => updateLeadNotes(selectedLead.id, e.target.value)}
              placeholder="Add notes about this lead…"
              style={{ width: '100%', padding: '10px 14px', fontSize: 13, background: '#fff', border: '0.5px solid rgba(26,58,42,.2)', borderRadius: 10, outline: 'none', fontFamily: 'DM Sans, sans-serif', resize: 'vertical', minHeight: 100, boxSizing: 'border-box' }}
            />
          </div>
        </Modal>
      )}

    </div>
  )
}