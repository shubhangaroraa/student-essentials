'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

// ── MOCK DATA ──────────────────────────────────────────────────────
const mockStudents = [
  { id: '1', first_name: 'Priya', last_name: 'Sharma', email: 'priya@example.com', phone: '+91 98765 43210', country: 'India', university: 'Univ. of Manchester', arrival_date: '2026-09-15', status: 'pack_ordered', substatus: 'payment_received', source: 'website', ltv_gbp: 180, notes: 'Very responsive', assigned_to: 'Shubhang', follow_up_date: '2026-05-25', tags: ['hot', 'full-pack'] },
  { id: '2', first_name: 'Arjun', last_name: 'Mehta', email: 'arjun@example.com', phone: '+91 87654 32109', country: 'India', university: 'UCL London', arrival_date: '2026-09-20', status: 'interested', substatus: 'brochure_sent', source: 'agent', ltv_gbp: 14, notes: 'Referred by Ravi Kumar', assigned_to: 'Shubhang', follow_up_date: '2026-05-22', tags: ['agent-referral'] },
  { id: '3', first_name: 'Fatima', last_name: 'Al-Hassan', email: 'fatima@example.com', phone: '+234 801 234 5678', country: 'Nigeria', university: 'Univ. of Birmingham', arrival_date: '2026-09-18', status: 'contacted', substatus: 'no_response', source: 'website', ltv_gbp: 0, notes: 'No response to WA', assigned_to: 'Shubhang', follow_up_date: '2026-05-21', tags: ['follow-up-needed'] },
  { id: '4', first_name: 'Wei', last_name: 'Zhang', email: 'wei@example.com', phone: '+86 138 0013 8000', country: 'China', university: 'Univ. of Edinburgh', arrival_date: '2026-09-22', status: 'pack_ordered', substatus: 'dispatched', source: 'website', ltv_gbp: 232, notes: 'Bought full bundle', assigned_to: 'Shubhang', follow_up_date: null, tags: ['vip'] },
  { id: '5', first_name: 'Omar', last_name: 'Siddiqui', email: 'omar@example.com', phone: '+92 300 1234567', country: 'Pakistan', university: 'Univ. of Leeds', arrival_date: '2026-09-25', status: 'new_lead', substatus: null, source: 'website', ltv_gbp: 0, notes: '', assigned_to: null, follow_up_date: '2026-05-23', tags: [] },
  { id: '6', first_name: 'Aisha', last_name: 'Patel', email: 'aisha@example.com', phone: '+91 76543 21098', country: 'India', university: 'Univ. of Sheffield', arrival_date: '2026-09-19', status: 'new_lead', substatus: null, source: 'referral', ltv_gbp: 0, notes: '', assigned_to: null, follow_up_date: '2026-05-24', tags: [] },
]

const mockTeam = [
  { id: 't1', name: 'Shubhang Arora', role: 'admin', email: 'shubhangaroraa@gmail.com', active: true, leads: 6 },
  { id: 't2', name: 'Ravi Kumar', role: 'agent', email: 'ravi@ukstudyhub.com', active: true, leads: 3 },
  { id: 't3', name: 'Sarah Chen', role: 'sales', email: 'sarah@student-essentials.com', active: false, leads: 0 },
]

const mockAnnouncements = [
  { id: 'a1', title: '🎉 Commission increase for Gold agents', content: 'Effective 1 June 2026, Gold tier agents will earn 12% commission (up from 10%). Share this with your top agents!', type: 'bonus', date: '21 May 2026', author: 'Shubhang' },
  { id: 'a2', title: '🛏️ New bedding pack launched — Deluxe tier', content: 'We have added a Deluxe bedding pack at £149. Update your pitches. Students who arrived last year rated bedding as #1 most important service.', type: 'deal', date: '20 May 2026', author: 'Shubhang' },
  { id: 'a3', title: '📋 New follow-up process for no-response leads', content: 'If a lead has not responded in 48hrs, move them to "No Response" substatus and schedule a WhatsApp follow-up for day 5.', type: 'update', date: '18 May 2026', author: 'Shubhang' },
]

const mockTemplates = [
  { id: 'e1', name: 'Welcome email', subject: 'Welcome to StudentEssentials — Your UK journey starts here 🎓', body: 'Hi {{first_name}},\n\nWelcome! We help international students like you arrive in the UK fully prepared...' },
  { id: 'e2', name: 'Services brochure', subject: 'Your personalised UK settling-in pack 📦', body: 'Hi {{first_name}},\n\nBased on your university and arrival date, here are the services we recommend...' },
  { id: 'e3', name: 'Follow-up (no response)', subject: 'Still thinking about your UK pack? 🇬🇧', body: 'Hi {{first_name}},\n\nJust checking in — we know moving to a new country is a big deal...' },
  { id: 'e4', name: 'Order confirmation', subject: 'Your pack is confirmed! Order {{order_ref}} ✅', body: 'Hi {{first_name}},\n\nGreat news — your StudentEssentials pack is confirmed and being prepared...' },
]

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  new_lead: { label: 'New Lead', color: '#6b7a72', bg: 'rgba(26,58,42,.06)' },
  contacted: { label: 'Contacted', color: '#C8A96E', bg: 'rgba(200,169,110,.15)' },
  interested: { label: 'Interested', color: '#2E7D52', bg: 'rgba(46,125,82,.15)' },
  pack_ordered: { label: 'Pack Ordered', color: '#1A3A2A', bg: '#E0F0E8' },
  arrived: { label: 'Arrived', color: '#fff', bg: '#2E7D52' },
  churned: { label: 'Churned', color: '#fff', bg: '#e8413e' },
}

const substatusOptions: Record<string, string[]> = {
  new_lead: ['Not yet contacted', 'Callback requested'],
  contacted: ['No response', 'Call scheduled', 'Whatsapp sent'],
  interested: ['Brochure sent', 'Quote sent', 'Negotiating'],
  pack_ordered: ['Payment received', 'Processing', 'Dispatched', 'Delivered'],
  arrived: ['Settled in', 'Needs support'],
  churned: ['Price', 'Competitor', 'No longer going', 'Unresponsive'],
}

const announcementColors: Record<string, { bg: string; color: string }> = {
  info: { bg: 'rgba(26,58,42,.06)', color: 'var(--forest)' },
  deal: { bg: 'rgba(46,125,82,.15)', color: 'var(--forest)' },
  bonus: { bg: 'rgba(200,169,110,.15)', color: 'var(--gold)' },
  urgent: { bg: 'rgba(232,65,62,.1)', color: '#e8413e' },
  update: { bg: 'rgba(26,58,42,.06)', color: 'var(--bottle)' },
}

const roleColors: Record<string, { bg: string; color: string }> = {
  admin: { bg: '#1A3A2A', color: '#fff' },
  manager: { bg: 'rgba(46,125,82,.15)', color: 'var(--forest)' },
  sales: { bg: 'rgba(200,169,110,.15)', color: 'var(--gold)' },
  support: { bg: 'rgba(26,58,42,.06)', color: 'var(--muted)' },
  agent: { bg: '#E0F0E8', color: 'var(--forest)' },
}

const activityIcons: Record<string, string> = {
  note: '📝', call: '📞', email: '📧', whatsapp: '💬', status_change: '🔄', order: '📦'
}

const mockActivities: Record<string, { type: string; content: string; date: string }[]> = {
  '1': [
    { type: 'order', content: 'Placed order SE-2026-48201 — Bedding + SIM + Insurance · £180', date: '13 May' },
    { type: 'email', content: 'Sent welcome email with delivery tracking', date: '13 May' },
    { type: 'call', content: 'Intro call — keen on full pack, asked about remittance', date: '10 May' },
  ],
  '2': [
    { type: 'email', content: 'Sent services brochure PDF', date: '12 May' },
    { type: 'note', content: 'Referred by agent Ravi Kumar (Gold tier)', date: '11 May' },
  ],
  '3': [
    { type: 'whatsapp', content: 'Sent WhatsApp intro message — no response', date: '11 May' },
    { type: 'note', content: 'Follow up needed — 48hrs no response', date: '10 May' },
  ],
}

type Page = 'dashboard' | 'leads' | 'announcements' | 'templates' | 'team' | 'analytics'

export default function CRM() {
  const router = useRouter()
  const [page, setPage] = useState<Page>('dashboard')
  const [selectedStudent, setSelectedStudent] = useState<typeof mockStudents[0] | null>(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCountry, setFilterCountry] = useState('all')
  const [filterAssigned, setFilterAssigned] = useState('all')
  const [filterDate, setFilterDate] = useState('')
  const [newNote, setNewNote] = useState('')
  const [activities, setActivities] = useState(mockActivities)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [announcements, setAnnouncements] = useState(mockAnnouncements)
  const [showNewAnnouncement, setShowNewAnnouncement] = useState(false)
  const [newAnn, setNewAnn] = useState({ title: '', content: '', type: 'info' })
  const [students, setStudents] = useState(mockStudents)

  const today = new Date().toISOString().split('T')[0]
  const missedFollowUps = students.filter(s => s.follow_up_date && s.follow_up_date < today && s.status !== 'pack_ordered' && s.status !== 'arrived')
  const todayFollowUps = students.filter(s => s.follow_up_date === today)

  const filtered = students.filter(s => {
    const matchSearch = search === '' || `${s.first_name} ${s.last_name} ${s.email} ${s.university}`.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || s.status === filterStatus
    const matchCountry = filterCountry === 'all' || s.country === filterCountry
    const matchAssigned = filterAssigned === 'all' || s.assigned_to === filterAssigned
    return matchSearch && matchStatus && matchCountry && matchAssigned
  })

  const byStatus = (status: string) => students.filter(s => s.status === status)
  const totalLTV = students.reduce((s, st) => s + st.ltv_gbp, 0)

  const addNote = (studentId: string) => {
    if (!newNote.trim()) return
    setActivities(prev => ({
      ...prev,
      [studentId]: [{ type: 'note', content: newNote, date: 'Just now' }, ...(prev[studentId] || [])]
    }))
    setNewNote('')
  }

  const updateStatus = (studentId: string, status: string) => {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, status } : s))
    if (selectedStudent?.id === studentId) setSelectedStudent(prev => prev ? { ...prev, status } : null)
  }

  const navItems: { id: Page; icon: string; label: string; badge?: number }[] = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard', badge: missedFollowUps.length > 0 ? missedFollowUps.length : undefined },
    { id: 'leads', icon: '🎓', label: 'Leads & Pipeline' },
    { id: 'announcements', icon: '📢', label: 'Announcements', badge: announcements.length },
    { id: 'templates', icon: '📧', label: 'Email Templates' },
    { id: 'team', icon: '👥', label: 'Team & Access' },
    { id: 'analytics', icon: '📈', label: 'Analytics' },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--cream)' }}>

      {/* SIDEBAR */}
      <aside style={{ width: 240, flexShrink: 0, background: '#0f1f17', position: 'fixed', top: 0, left: 0, bottom: 0, display: 'flex', flexDirection: 'column', zIndex: 50 }}>
        <div style={{ padding: '20px 22px 16px', borderBottom: '0.5px solid rgba(255,255,255,.07)', marginBottom: 8 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 8 }}>
            <div style={{ width: 30, height: 30, background: 'var(--forest)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg viewBox="0 0 20 20" fill="none" width="16" height="16"><path d="M10 2L3 6V10C3 13.5 6.5 17 10 18C13.5 17 17 13.5 17 10V6L10 2Z" fill="white"/><path d="M7 10L9 12L13 8" stroke="#2e7d52" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div>
              <span style={{ fontSize: 14, fontWeight: 500, color: '#fff' }}>SE <span style={{ color: 'var(--sage)' }}>CRM</span></span>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)' }}>Admin account</div>
            </div>
          </Link>
          {missedFollowUps.length > 0 && (
            <div style={{ background: 'rgba(232,65,62,.15)', border: '0.5px solid rgba(232,65,62,.3)', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#e8413e' }}>
              ⚠️ {missedFollowUps.length} missed follow-up{missedFollowUps.length > 1 ? 's' : ''}
            </div>
          )}
        </div>

        <div style={{ padding: '4px 12px', flex: 1, overflowY: 'auto' }}>
          {navItems.map(item => (
            <button key={item.id} onClick={() => { setPage(item.id); setSelectedStudent(null) }} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 8, width: '100%', textAlign: 'left', fontSize: 13, color: page === item.id ? '#fff' : 'rgba(255,255,255,.55)', background: page === item.id ? 'rgba(107,191,138,.15)' : 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', marginBottom: 1, position: 'relative' }}>
              <span style={{ fontSize: 15, width: 20, textAlign: 'center' }}>{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && <span style={{ background: '#e8413e', color: '#fff', fontSize: 10, fontWeight: 500, borderRadius: 10, padding: '1px 6px', minWidth: 18, textAlign: 'center' }}>{item.badge}</span>}
            </button>
          ))}

          <div style={{ marginTop: 16, borderTop: '0.5px solid rgba(255,255,255,.07)', paddingTop: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.2)', padding: '4px 10px 8px' }}>Quick links</div>
            <Link href="/admin" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, fontSize: 13, color: 'rgba(255,255,255,.45)', textDecoration: 'none' }}>
              <span>⚙️</span> Admin Panel
            </Link>
            <Link href="/portal" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, fontSize: 13, color: 'rgba(255,255,255,.45)', textDecoration: 'none' }}>
              <span>🏢</span> Agent Portal
            </Link>
          </div>
        </div>

        <div style={{ padding: '12px 12px 18px', borderTop: '0.5px solid rgba(255,255,255,.07)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#1A3A2A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 500, color: 'var(--sage)', flexShrink: 0 }}>S</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#fff' }}>Shubhang Arora</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.3)' }}>Admin · Full access</div>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ marginLeft: 240, flex: 1 }}>
        <div style={{ position: 'sticky', top: 0, zIndex: 40, padding: '0 40px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(245,240,232,.93)', backdropFilter: 'blur(14px)', borderBottom: '0.5px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {selectedStudent && <button onClick={() => setSelectedStudent(null)} style={{ fontSize: 13, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px' }}>← Back</button>}
            <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--bottle)' }}>
              {selectedStudent ? `${selectedStudent.first_name} ${selectedStudent.last_name}` : navItems.find(n => n.id === page)?.label}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {todayFollowUps.length > 0 && (
              <div style={{ fontSize: 12, color: 'var(--forest)', background: 'var(--mint)', padding: '5px 12px', borderRadius: 20, fontWeight: 500 }}>
                📅 {todayFollowUps.length} follow-up{todayFollowUps.length > 1 ? 's' : ''} today
              </div>
            )}
            <button onClick={() => { setPage('leads'); setSelectedStudent(null) }} style={{ padding: '7px 16px', fontSize: 13, fontWeight: 500, background: 'var(--forest)', color: '#fff', border: 'none', borderRadius: 40, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>+ Add lead</button>
          </div>
        </div>

        <div style={{ padding: '32px 40px' }}>

          {/* ── DASHBOARD ── */}
          {!selectedStudent && page === 'dashboard' && (
            <div>
              {/* Missed follow-ups alert */}
              {missedFollowUps.length > 0 && (
                <div style={{ background: 'rgba(232,65,62,.08)', border: '0.5px solid rgba(232,65,62,.3)', borderRadius: 14, padding: '16px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span style={{ fontSize: 24 }}>⚠️</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#e8413e' }}>{missedFollowUps.length} missed follow-up{missedFollowUps.length > 1 ? 's' : ''}</div>
                    <div style={{ fontSize: 13, color: 'var(--muted)' }}>{missedFollowUps.map(s => `${s.first_name} ${s.last_name}`).join(', ')}</div>
                  </div>
                  <button onClick={() => setPage('leads')} style={{ padding: '7px 16px', fontSize: 13, color: '#e8413e', border: '0.5px solid rgba(232,65,62,.4)', borderRadius: 20, background: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>View leads →</button>
                </div>
              )}

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 14, marginBottom: 24 }}>
                {[
                  ['🎓', String(students.length), 'Total leads', ''],
                  ['🔥', String(students.filter(s => s.status === 'interested' || s.status === 'contacted').length), 'Active pipeline', ''],
                  ['✅', String(students.filter(s => s.status === 'pack_ordered').length), 'Packs ordered', ''],
                  ['💷', `£${totalLTV}`, 'Total LTV', ''],
                  ['📅', String(todayFollowUps.length), 'Follow-ups today', ''],
                ].map(([icon, val, label]) => (
                  <div key={label} style={{ background: 'var(--offwhite)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '16px 18px' }}>
                    <div style={{ fontSize: 20, marginBottom: 8 }}>{icon}</div>
                    <div style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 26, color: 'var(--bottle)', lineHeight: 1 }}>{val}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{label}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20 }}>
                {/* Recent leads */}
                <div style={{ background: 'var(--offwhite)', border: '0.5px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
                  <div style={{ padding: '14px 20px', borderBottom: '0.5px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--bottle)' }}>Recent leads</div>
                    <button onClick={() => setPage('leads')} style={{ fontSize: 12, color: 'var(--forest)', background: 'none', border: 'none', cursor: 'pointer' }}>View all →</button>
                  </div>
                  {students.slice(0,5).map((s, i) => (
                    <div key={s.id} onClick={() => { setSelectedStudent(s); setPage('leads') }} style={{ padding: '12px 20px', borderBottom: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', background: i % 2 === 0 ? 'transparent' : 'rgba(26,58,42,.02)' }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--mint)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 500, color: 'var(--forest)', flexShrink: 0 }}>{s.first_name[0]}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--bottle)' }}>{s.first_name} {s.last_name}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)' }}>{s.university} · {s.country}</div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                        <span style={{ fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 20, background: statusConfig[s.status].bg, color: statusConfig[s.status].color }}>{statusConfig[s.status].label}</span>
                        {s.follow_up_date && s.follow_up_date < today && <span style={{ fontSize: 10, color: '#e8413e' }}>⚠️ Overdue</span>}
                        {s.follow_up_date === today && <span style={{ fontSize: 10, color: 'var(--forest)' }}>📅 Today</span>}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Pipeline snapshot */}
                  <div style={{ background: 'var(--offwhite)', border: '0.5px solid var(--border)', borderRadius: 16, padding: '18px 20px' }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--bottle)', marginBottom: 14 }}>Pipeline snapshot</div>
                    {Object.entries(statusConfig).slice(0,5).map(([status, cfg]) => {
                      const count = byStatus(status).length
                      const pct = students.length > 0 ? Math.round((count / students.length) * 100) : 0
                      return (
                        <div key={status} style={{ marginBottom: 10 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
                            <span style={{ color: 'var(--bottle)' }}>{cfg.label}</span>
                            <span style={{ color: 'var(--muted)' }}>{count}</span>
                          </div>
                          <div style={{ height: 4, background: 'rgba(26,58,42,.08)', borderRadius: 2, overflow: 'hidden' }}>
                            <div style={{ width: `${pct}%`, height: '100%', background: 'var(--forest)', borderRadius: 2 }}></div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Latest announcement */}
                  <div style={{ background: 'var(--offwhite)', border: '0.5px solid var(--border)', borderRadius: 16, padding: '18px 20px' }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--bottle)', marginBottom: 12 }}>Latest announcement</div>
                    {announcements[0] && (
                      <div style={{ background: announcementColors[announcements[0].type].bg, borderRadius: 10, padding: '12px 14px' }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: announcementColors[announcements[0].type].color, marginBottom: 4 }}>{announcements[0].title}</div>
                        <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>{announcements[0].content.slice(0,100)}...</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8 }}>{announcements[0].date} · {announcements[0].author}</div>
                      </div>
                    )}
                    <button onClick={() => setPage('announcements')} style={{ fontSize: 12, color: 'var(--forest)', background: 'none', border: 'none', cursor: 'pointer', marginTop: 10, padding: 0 }}>View all announcements →</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── STUDENT PROFILE ── */}
          {selectedStudent && (
            <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 24 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Profile */}
                <div style={{ background: 'var(--offwhite)', border: '0.5px solid var(--border)', borderRadius: 16, padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, paddingBottom: 16, borderBottom: '0.5px solid var(--border)' }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--mint)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 500, color: 'var(--forest)', flexShrink: 0 }}>{selectedStudent.first_name[0]}</div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--bottle)' }}>{selectedStudent.first_name} {selectedStudent.last_name}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>{selectedStudent.university}</div>
                    </div>
                  </div>
                  {[['📧', selectedStudent.email], ['📱', selectedStudent.phone], ['🌍', selectedStudent.country], ['✈️', `Arriving ${selectedStudent.arrival_date}`], ['👤', `Assigned: ${selectedStudent.assigned_to || 'Unassigned'}`], ['🔗', `Source: ${selectedStudent.source}`]].map(([icon, val]) => (
                    <div key={val} style={{ display: 'flex', gap: 10, padding: '7px 0', borderBottom: '0.5px solid var(--border)', fontSize: 13 }}>
                      <span>{icon}</span><span style={{ color: 'var(--bottle)' }}>{val}</span>
                    </div>
                  ))}
                </div>

                {/* Status & substatus */}
                <div style={{ background: 'var(--offwhite)', border: '0.5px solid var(--border)', borderRadius: 16, padding: '16px 20px' }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--bottle)', marginBottom: 10 }}>Status</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                    {Object.entries(statusConfig).map(([key, cfg]) => (
                      <button key={key} onClick={() => updateStatus(selectedStudent.id, key)} style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 500, background: selectedStudent.status === key ? cfg.bg : 'var(--cream)', color: selectedStudent.status === key ? cfg.color : 'var(--muted)', border: `0.5px solid ${selectedStudent.status === key ? cfg.color : 'var(--border)'}`, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                        {cfg.label}
                      </button>
                    ))}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--moss)', marginBottom: 6 }}>Sub-status</div>
                  <select style={{ width: '100%', padding: '8px 12px', fontSize: 13, background: '#fff', border: '0.5px solid rgba(26,58,42,.2)', borderRadius: 8, outline: 'none', fontFamily: 'DM Sans, sans-serif', color: 'var(--bottle)' }}>
                    <option value="">Select sub-status...</option>
                    {(substatusOptions[selectedStudent.status] || []).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                {/* Follow-up date */}
                <div style={{ background: 'var(--offwhite)', border: '0.5px solid var(--border)', borderRadius: 16, padding: '16px 20px' }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--bottle)', marginBottom: 10 }}>Follow-up date</div>
                  <input type="date" defaultValue={selectedStudent.follow_up_date || ''} style={{ width: '100%', padding: '8px 12px', fontSize: 13, background: '#fff', border: '0.5px solid rgba(26,58,42,.2)', borderRadius: 8, outline: 'none', fontFamily: 'DM Sans, sans-serif' }} />
                  {selectedStudent.follow_up_date && selectedStudent.follow_up_date < today && (
                    <div style={{ fontSize: 12, color: '#e8413e', marginTop: 8 }}>⚠️ This follow-up is overdue!</div>
                  )}
                </div>

                {/* LTV */}
                <div style={{ background: 'var(--bottle)', borderRadius: 16, padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', width: 120, height: 120, borderRadius: '50%', background: 'rgba(46,125,82,.25)', top: -30, right: -20, filter: 'blur(25px)' }}></div>
                  <div style={{ position: 'relative', zIndex: 2 }}>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginBottom: 2 }}>Lifetime Value</div>
                    <div style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 32, color: '#fff' }}>£{selectedStudent.ltv_gbp}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginTop: 4 }}>Projected: £{(selectedStudent.ltv_gbp * 2.4).toFixed(0)}</div>
                  </div>
                </div>

                {/* Services purchased */}
                <div style={{ background: 'var(--offwhite)', border: '0.5px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
                  <div style={{ padding: '12px 16px', borderBottom: '0.5px solid var(--border)', fontSize: 13, fontWeight: 500, color: 'var(--bottle)' }}>Services purchased</div>
                  {selectedStudent.ltv_gbp > 0 ? (
                    <div style={{ padding: '4px 16px' }}>
                      {[{ icon: '🛏️', name: 'Bedding Pack', variant: 'Standard', price: '£89' }, { icon: '📱', name: 'UK SIM Card', variant: '5GB', price: '£14' }, { icon: '🛡️', name: 'Travel Insurance', variant: 'Single', price: '£32' }, { icon: '🚗', name: 'Airport Transfer', variant: 'Heathrow', price: '£45' }].map(s => (
                        <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '0.5px solid var(--border)' }}>
                          <span style={{ fontSize: 16 }}>{s.icon}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--bottle)' }}>{s.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--muted)' }}>{s.variant}</div>
                          </div>
                          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--forest)' }}>{s.price}</div>
                        </div>
                      ))}
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontWeight: 500, fontSize: 13 }}>
                        <span style={{ color: 'var(--bottle)' }}>Total</span>
                        <span style={{ color: 'var(--forest)', fontFamily: 'Playfair Display, Georgia, serif', fontSize: 16 }}>£{selectedStudent.ltv_gbp}</span>
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: '16px', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>No purchases yet</div>
                  )}
                </div>

                {/* Tags */}
                <div style={{ background: 'var(--offwhite)', border: '0.5px solid var(--border)', borderRadius: 16, padding: '14px 16px' }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--bottle)', marginBottom: 8 }}>Tags</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {selectedStudent.tags.map(tag => (
                      <span key={tag} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: 'var(--mint)', color: 'var(--forest)', fontWeight: 500 }}>{tag}</span>
                    ))}
                    <button style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: 'var(--cream)', color: 'var(--muted)', border: '0.5px dashed var(--border)', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>+ Add tag</button>
                  </div>
                </div>
              </div>

              {/* Activity feed */}
              <div style={{ background: 'var(--offwhite)', border: '0.5px solid var(--border)', borderRadius: 16, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ padding: '14px 20px', borderBottom: '0.5px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--bottle)' }}>Activity & Communications</div>
                  <button onClick={() => setShowEmailModal(true)} style={{ padding: '6px 14px', fontSize: 12, fontWeight: 500, background: 'var(--forest)', color: '#fff', border: 'none', borderRadius: 20, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>📧 Send email</button>
                </div>

                {/* Quick log buttons */}
                <div style={{ padding: '10px 20px', borderBottom: '0.5px solid var(--border)', display: 'flex', gap: 8 }}>
                  {[['📞', 'Log call'], ['💬', 'Log WhatsApp'], ['📧', 'Log email'], ['📝', 'Note']].map(([icon, label]) => (
                    <button key={label} style={{ padding: '5px 12px', fontSize: 12, color: 'var(--muted)', background: 'var(--cream)', border: '0.5px solid var(--border)', borderRadius: 20, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>{icon} {label}</button>
                  ))}
                </div>

                {/* Add note */}
                <div style={{ padding: '12px 20px', borderBottom: '0.5px solid var(--border)', display: 'flex', gap: 10 }}>
                  <input value={newNote} onChange={e => setNewNote(e.target.value)} onKeyDown={e => e.key === 'Enter' && addNote(selectedStudent.id)} placeholder="Add a note, log a call, or paste a WhatsApp message..." style={{ flex: 1, padding: '8px 14px', fontSize: 13, background: '#fff', border: '0.5px solid rgba(26,58,42,.2)', borderRadius: 10, outline: 'none', fontFamily: 'DM Sans, sans-serif' }} />
                  <button onClick={() => addNote(selectedStudent.id)} style={{ padding: '8px 16px', background: 'var(--forest)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Save</button>
                </div>

                {/* Timeline */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '8px 20px' }}>
                  {(activities[selectedStudent.id] || []).length === 0 ? (
                    <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>No activity yet</div>
                  ) : (activities[selectedStudent.id] || []).map((activity, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '0.5px solid var(--border)' }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--mint)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>{activityIcons[activity.type]}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, color: 'var(--bottle)', lineHeight: 1.5 }}>{activity.content}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{activity.date} · Shubhang</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── LEADS & PIPELINE ── */}
          {!selectedStudent && page === 'leads' && (
            <div>
              {/* Filters */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search leads..." style={{ flex: 1, minWidth: 200, padding: '8px 14px', fontSize: 13, background: '#fff', border: '0.5px solid rgba(26,58,42,.2)', borderRadius: 10, outline: 'none', fontFamily: 'DM Sans, sans-serif' }} />
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: '8px 12px', fontSize: 13, background: '#fff', border: '0.5px solid rgba(26,58,42,.2)', borderRadius: 10, outline: 'none', fontFamily: 'DM Sans, sans-serif', color: 'var(--bottle)' }}>
                  <option value="all">All statuses</option>
                  {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
                <select value={filterCountry} onChange={e => setFilterCountry(e.target.value)} style={{ padding: '8px 12px', fontSize: 13, background: '#fff', border: '0.5px solid rgba(26,58,42,.2)', borderRadius: 10, outline: 'none', fontFamily: 'DM Sans, sans-serif', color: 'var(--bottle)' }}>
                  <option value="all">All countries</option>
                  {['India', 'Nigeria', 'China', 'Pakistan'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={filterAssigned} onChange={e => setFilterAssigned(e.target.value)} style={{ padding: '8px 12px', fontSize: 13, background: '#fff', border: '0.5px solid rgba(26,58,42,.2)', borderRadius: 10, outline: 'none', fontFamily: 'DM Sans, sans-serif', color: 'var(--bottle)' }}>
                  <option value="all">All staff</option>
                  {mockTeam.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                </select>
                <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} style={{ padding: '8px 12px', fontSize: 13, background: '#fff', border: '0.5px solid rgba(26,58,42,.2)', borderRadius: 10, outline: 'none', fontFamily: 'DM Sans, sans-serif' }} />
              </div>

              {/* Kanban */}
              <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 16 }}>
                {Object.entries(statusConfig).filter(([k]) => k !== 'churned').map(([status, cfg]) => (
                  <div key={status} style={{ minWidth: 220, flex: '0 0 220px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--bottle)' }}>{cfg.label}</div>
                      <div style={{ fontSize: 11, background: 'var(--cream)', border: '0.5px solid var(--border)', borderRadius: 20, padding: '2px 8px', color: 'var(--muted)' }}>{byStatus(status).length}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {byStatus(status).map(student => (
                        <div key={student.id} onClick={() => setSelectedStudent(student)} style={{ background: 'var(--offwhite)', border: `0.5px solid ${student.follow_up_date && student.follow_up_date < today ? 'rgba(232,65,62,.4)' : 'var(--border)'}`, borderRadius: 10, padding: '12px 14px', cursor: 'pointer' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--mint)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 500, color: 'var(--forest)', flexShrink: 0 }}>{student.first_name[0]}</div>
                            <div>
                              <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--bottle)' }}>{student.first_name} {student.last_name}</div>
                              <div style={{ fontSize: 10, color: 'var(--muted)' }}>{student.country}</div>
                            </div>
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>{student.university.slice(0,25)}</div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontSize: 10, color: student.follow_up_date && student.follow_up_date < today ? '#e8413e' : 'var(--muted)' }}>
                              {student.follow_up_date ? (student.follow_up_date < today ? '⚠️ Overdue' : `📅 ${student.follow_up_date}`) : 'No follow-up set'}
                            </div>
                            {student.ltv_gbp > 0 && <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--forest)' }}>£{student.ltv_gbp}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Table view */}
              <div style={{ marginTop: 32 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--bottle)', marginBottom: 14 }}>All leads — {filtered.length} results</div>
                <div style={{ background: 'var(--offwhite)', border: '0.5px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
                  <div style={{ padding: '10px 18px', borderBottom: '0.5px solid var(--border)', display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr 1fr 1fr', gap: 10 }}>
                    {['Student', 'University', 'Country', 'Status', 'LTV', 'Follow-up', 'Assigned'].map(h => (
                      <div key={h} style={{ fontSize: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--muted)' }}>{h}</div>
                    ))}
                  </div>
                  {filtered.map((s, i) => (
                    <div key={s.id} onClick={() => setSelectedStudent(s)} style={{ padding: '12px 18px', borderBottom: '0.5px solid var(--border)', display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr 1fr 1fr', gap: 10, alignItems: 'center', background: s.follow_up_date && s.follow_up_date < today ? 'rgba(232,65,62,.03)' : i % 2 === 0 ? 'transparent' : 'rgba(26,58,42,.02)', cursor: 'pointer' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--mint)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 500, color: 'var(--forest)', flexShrink: 0 }}>{s.first_name[0]}</div>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--bottle)' }}>{s.first_name} {s.last_name}</div>
                          <div style={{ fontSize: 10, color: 'var(--muted)' }}>{s.email}</div>
                        </div>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>{s.university}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>{s.country}</div>
                      <span style={{ fontSize: 10, fontWeight: 500, padding: '2px 8px', borderRadius: 20, background: statusConfig[s.status].bg, color: statusConfig[s.status].color, display: 'inline-block' }}>{statusConfig[s.status].label}</span>
                      <div style={{ fontSize: 12, fontWeight: 500, color: s.ltv_gbp > 0 ? 'var(--forest)' : 'var(--muted)' }}>{s.ltv_gbp > 0 ? `£${s.ltv_gbp}` : '—'}</div>
                      <div style={{ fontSize: 11, color: s.follow_up_date && s.follow_up_date < today ? '#e8413e' : 'var(--muted)' }}>{s.follow_up_date || '—'}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>{s.assigned_to || '—'}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── ANNOUNCEMENTS ── */}
          {!selectedStudent && page === 'announcements' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 22, color: 'var(--bottle)' }}>Team Announcements</div>
                <button onClick={() => setShowNewAnnouncement(!showNewAnnouncement)} style={{ padding: '8px 18px', fontSize: 13, fontWeight: 500, background: 'var(--forest)', color: '#fff', border: 'none', borderRadius: 40, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>+ New announcement</button>
              </div>

              {showNewAnnouncement && (
                <div style={{ background: 'var(--offwhite)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '20px', marginBottom: 20 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--bottle)', marginBottom: 14 }}>New announcement</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <input value={newAnn.title} onChange={e => setNewAnn(p => ({ ...p, title: e.target.value }))} placeholder="Announcement title..." style={{ padding: '9px 14px', fontSize: 14, background: '#fff', border: '0.5px solid rgba(26,58,42,.2)', borderRadius: 10, outline: 'none', fontFamily: 'DM Sans, sans-serif' }} />
                    <textarea value={newAnn.content} onChange={e => setNewAnn(p => ({ ...p, content: e.target.value }))} placeholder="Announcement content..." rows={3} style={{ padding: '9px 14px', fontSize: 13, background: '#fff', border: '0.5px solid rgba(26,58,42,.2)', borderRadius: 10, outline: 'none', fontFamily: 'DM Sans, sans-serif', resize: 'vertical' }} />
                    <div style={{ display: 'flex', gap: 10 }}>
                      <select value={newAnn.type} onChange={e => setNewAnn(p => ({ ...p, type: e.target.value }))} style={{ padding: '8px 12px', fontSize: 13, background: '#fff', border: '0.5px solid rgba(26,58,42,.2)', borderRadius: 10, outline: 'none', fontFamily: 'DM Sans, sans-serif' }}>
                        {['info', 'deal', 'bonus', 'urgent', 'update'].map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                      </select>
                      <button onClick={() => {
                        if (!newAnn.title || !newAnn.content) return
                        setAnnouncements(prev => [{ id: `a${Date.now()}`, ...newAnn, date: 'Just now', author: 'Shubhang' }, ...prev])
                        setNewAnn({ title: '', content: '', type: 'info' })
                        setShowNewAnnouncement(false)
                      }} style={{ padding: '8px 20px', background: 'var(--forest)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Post</button>
                      <button onClick={() => setShowNewAnnouncement(false)} style={{ padding: '8px 16px', background: 'none', color: 'var(--muted)', border: '0.5px solid var(--border)', borderRadius: 10, fontSize: 13, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Cancel</button>
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {announcements.map(ann => (
                  <div key={ann.id} style={{ background: 'var(--offwhite)', border: '0.5px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
                    <div style={{ padding: '6px 16px', background: announcementColors[ann.type].bg, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 11, fontWeight: 500, color: announcementColors[ann.type].color, textTransform: 'uppercase', letterSpacing: '.05em' }}>{ann.type}</span>
                      <span style={{ fontSize: 11, color: 'var(--muted)' }}>{ann.date} · {ann.author}</span>
                    </div>
                    <div style={{ padding: '16px 20px' }}>
                      <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--bottle)', marginBottom: 8 }}>{ann.title}</div>
                      <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7 }}>{ann.content}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── EMAIL TEMPLATES ── */}
          {!selectedStudent && page === 'templates' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 22, color: 'var(--bottle)' }}>Email Templates</div>
                <button style={{ padding: '8px 18px', fontSize: 13, fontWeight: 500, background: 'var(--forest)', color: '#fff', border: 'none', borderRadius: 40, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>+ New template</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {mockTemplates.map(t => (
                  <div key={t.id} style={{ background: 'var(--offwhite)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '18px 20px' }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--bottle)', marginBottom: 4 }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--forest)', marginBottom: 8 }}>Subject: {t.subject}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 14 }}>{t.body.slice(0, 100)}...</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button style={{ padding: '6px 14px', fontSize: 12, color: 'var(--forest)', border: '0.5px solid rgba(46,125,82,.3)', borderRadius: 8, background: 'transparent', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Edit</button>
                      <button style={{ padding: '6px 14px', fontSize: 12, color: '#fff', background: 'var(--forest)', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Use template</button>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 24, background: 'var(--offwhite)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '20px' }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--bottle)', marginBottom: 12 }}>Available variables</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {['{{first_name}}', '{{last_name}}', '{{university}}', '{{arrival_date}}', '{{order_ref}}', '{{agent_name}}', '{{dashboard_link}}'].map(v => (
                    <code key={v} style={{ fontSize: 12, padding: '3px 10px', background: 'var(--cream)', border: '0.5px solid var(--border)', borderRadius: 6, color: 'var(--forest)', fontFamily: 'Courier New' }}>{v}</code>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── TEAM & ACCESS ── */}
          {!selectedStudent && page === 'team' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 22, color: 'var(--bottle)' }}>Team & Access Control</div>
                <button style={{ padding: '8px 18px', fontSize: 13, fontWeight: 500, background: 'var(--forest)', color: '#fff', border: 'none', borderRadius: 40, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>+ Invite member</button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
                {/* Role permissions */}
                <div style={{ background: 'var(--offwhite)', border: '0.5px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
                  <div style={{ padding: '14px 18px', borderBottom: '0.5px solid var(--border)', fontSize: 14, fontWeight: 500, color: 'var(--bottle)' }}>Role permissions</div>
                  <div style={{ padding: '8px 18px' }}>
                    {[
                      { role: 'admin', perms: ['All access', 'User management', 'Settings', 'Financial data'] },
                      { role: 'manager', perms: ['All leads', 'Team reports', 'Announcements', 'Templates'] },
                      { role: 'sales', perms: ['Own leads', 'Pipeline', 'Email templates', 'Tasks'] },
                      { role: 'support', perms: ['Student profiles', 'Orders', 'Activity log'] },
                      { role: 'agent', perms: ['Own students only', 'Commission data', 'Referral tools'] },
                    ].map(r => (
                      <div key={r.role} style={{ padding: '12px 0', borderBottom: '0.5px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                          <span style={{ fontSize: 11, fontWeight: 500, padding: '2px 10px', borderRadius: 20, background: roleColors[r.role].bg, color: roleColors[r.role].color }}>{r.role.charAt(0).toUpperCase() + r.role.slice(1)}</span>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {r.perms.map(p => <span key={p} style={{ fontSize: 11, color: 'var(--muted)', background: 'var(--cream)', padding: '2px 8px', borderRadius: 4 }}>{p}</span>)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Team members */}
                <div style={{ background: 'var(--offwhite)', border: '0.5px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
                  <div style={{ padding: '14px 18px', borderBottom: '0.5px solid var(--border)', fontSize: 14, fontWeight: 500, color: 'var(--bottle)' }}>Team members</div>
                  {mockTeam.map((member, i) => (
                    <div key={member.id} style={{ padding: '14px 18px', borderBottom: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, background: i % 2 === 0 ? 'transparent' : 'rgba(26,58,42,.02)' }}>
                      <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--mint)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 500, color: 'var(--forest)', flexShrink: 0 }}>{member.name[0]}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--bottle)' }}>{member.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)' }}>{member.email}</div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                        <span style={{ fontSize: 11, fontWeight: 500, padding: '2px 10px', borderRadius: 20, background: roleColors[member.role].bg, color: roleColors[member.role].color }}>{member.role}</span>
                        <span style={{ fontSize: 10, color: member.active ? 'var(--forest)' : '#e8413e' }}>{member.active ? '● Active' : '● Inactive'}</span>
                      </div>
                    </div>
                  ))}
                  <div style={{ padding: '14px 18px' }}>
                    <button style={{ width: '100%', padding: '10px', fontSize: 13, color: 'var(--forest)', border: '0.5px dashed rgba(46,125,82,.4)', borderRadius: 10, background: 'transparent', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>+ Invite new team member</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── ANALYTICS ── */}
          {!selectedStudent && page === 'analytics' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
                {[
                  ['🎓', String(students.length), 'Total leads'],
                  ['💷', `£${totalLTV}`, 'Total LTV'],
                  ['📈', `£${students.filter(s => s.ltv_gbp > 0).length > 0 ? (totalLTV / students.filter(s => s.ltv_gbp > 0).length).toFixed(0) : 0}`, 'Avg LTV'],
                  ['✅', `${students.length > 0 ? Math.round((students.filter(s => s.status === 'pack_ordered').length / students.length) * 100) : 0}%`, 'Conversion'],
                ].map(([icon, val, label]) => (
                  <div key={label} style={{ background: 'var(--offwhite)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '18px 20px' }}>
                    <div style={{ fontSize: 20, marginBottom: 8 }}>{icon}</div>
                    <div style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 28, color: 'var(--bottle)' }}>{val}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{label}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div style={{ background: 'var(--offwhite)', border: '0.5px solid var(--border)', borderRadius: 16, padding: '20px' }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--bottle)', marginBottom: 14 }}>Pipeline funnel</div>
                  {Object.entries(statusConfig).map(([status, cfg]) => {
                    const count = byStatus(status).length
                    const pct = students.length > 0 ? Math.round((count / students.length) * 100) : 0
                    return (
                      <div key={status} style={{ marginBottom: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                          <span style={{ color: 'var(--bottle)' }}>{cfg.label}</span>
                          <span style={{ color: 'var(--muted)' }}>{count} · {pct}%</span>
                        </div>
                        <div style={{ height: 6, background: 'rgba(26,58,42,.08)', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: 'var(--forest)', borderRadius: 3 }}></div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div style={{ background: 'var(--offwhite)', border: '0.5px solid var(--border)', borderRadius: 16, padding: '20px' }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--bottle)', marginBottom: 14 }}>LTV by country</div>
                  {[['🇮🇳', 'India', students.filter(s => s.country === 'India').length, students.filter(s => s.country === 'India').reduce((a, s) => a + s.ltv_gbp, 0)],
                    ['🇨🇳', 'China', students.filter(s => s.country === 'China').length, students.filter(s => s.country === 'China').reduce((a, s) => a + s.ltv_gbp, 0)],
                    ['🇳🇬', 'Nigeria', students.filter(s => s.country === 'Nigeria').length, students.filter(s => s.country === 'Nigeria').reduce((a, s) => a + s.ltv_gbp, 0)],
                    ['🇵🇰', 'Pakistan', students.filter(s => s.country === 'Pakistan').length, students.filter(s => s.country === 'Pakistan').reduce((a, s) => a + s.ltv_gbp, 0)],
                  ].map(([flag, country, count, ltv]) => (
                    <div key={country as string} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '0.5px solid var(--border)' }}>
                      <span style={{ fontSize: 20 }}>{flag}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--bottle)' }}>{country as string}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)' }}>{count as number} students</div>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: Number(ltv) > 0 ? 'var(--forest)' : 'var(--muted)' }}>{Number(ltv) > 0 ? `£${ltv}` : '—'}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* EMAIL MODAL */}
      {showEmailModal && selectedStudent && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={() => setShowEmailModal(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.4)' }}></div>
          <div style={{ position: 'relative', background: 'var(--offwhite)', borderRadius: 16, padding: '28px', width: 540, maxHeight: '80vh', overflowY: 'auto', zIndex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--bottle)', marginBottom: 16 }}>Send email to {selectedStudent.first_name}</div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--moss)', display: 'block', marginBottom: 6 }}>Template</label>
              <select value={selectedTemplate} onChange={e => setSelectedTemplate(e.target.value)} style={{ width: '100%', padding: '9px 12px', fontSize: 13, background: '#fff', border: '0.5px solid rgba(26,58,42,.2)', borderRadius: 10, outline: 'none', fontFamily: 'DM Sans, sans-serif' }}>
                <option value="">Select a template...</option>
                {mockTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--moss)', display: 'block', marginBottom: 6 }}>To</label>
              <input defaultValue={selectedStudent.email} style={{ width: '100%', padding: '9px 12px', fontSize: 13, background: '#fff', border: '0.5px solid rgba(26,58,42,.2)', borderRadius: 10, outline: 'none', fontFamily: 'DM Sans, sans-serif' }} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--moss)', display: 'block', marginBottom: 6 }}>Subject</label>
              <input defaultValue={selectedTemplate ? mockTemplates.find(t => t.id === selectedTemplate)?.subject.replace('{{first_name}}', selectedStudent.first_name) : ''} style={{ width: '100%', padding: '9px 12px', fontSize: 13, background: '#fff', border: '0.5px solid rgba(26,58,42,.2)', borderRadius: 10, outline: 'none', fontFamily: 'DM Sans, sans-serif' }} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--moss)', display: 'block', marginBottom: 6 }}>Message</label>
              <textarea rows={6} defaultValue={selectedTemplate ? mockTemplates.find(t => t.id === selectedTemplate)?.body.replace('{{first_name}}', selectedStudent.first_name) : ''} style={{ width: '100%', padding: '9px 12px', fontSize: 13, background: '#fff', border: '0.5px solid rgba(26,58,42,.2)', borderRadius: 10, outline: 'none', fontFamily: 'DM Sans, sans-serif', resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowEmailModal(false)} style={{ padding: '9px 20px', fontSize: 13, color: 'var(--muted)', border: '0.5px solid var(--border)', borderRadius: 10, background: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Cancel</button>
              <button onClick={() => { setShowEmailModal(false); alert(`Email sent to ${selectedStudent.email}!`) }} style={{ padding: '9px 24px', fontSize: 13, fontWeight: 500, background: 'var(--forest)', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Send email →</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}