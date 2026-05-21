'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const mockTeam = [
  { id: 't1', name: 'Shubhang Arora', role: 'admin', email: 'shubhangaroraa@gmail.com', active: true, leads: 6 },
  { id: 't2', name: 'Ravi Kumar', role: 'agent', email: 'ravi@ukstudyhub.com', active: true, leads: 3 },
  { id: 't3', name: 'Sarah Chen', role: 'sales', email: 'sarah@student-essentials.com', active: false, leads: 0 },
]

const mockTemplates = [
  { id: 'e1', name: 'Welcome email', subject: 'Welcome to StudentEssentials — Your UK journey starts here 🎓', body: 'Hi {{first_name}},\n\nWelcome! We help international students like you arrive in the UK fully prepared...' },
  { id: 'e2', name: 'Services brochure', subject: 'Your personalised UK settling-in pack 📦', body: 'Hi {{first_name}},\n\nBased on your university and arrival date, here are the services we recommend...' },
  { id: 'e3', name: 'Follow-up (no response)', subject: 'Still thinking about your UK pack? 🇬🇧', body: 'Hi {{first_name}},\n\nJust checking in — we know moving to a new country is a big deal...' },
  { id: 'e4', name: 'Order confirmation', subject: 'Your pack is confirmed! Order {{order_ref}} ✅', body: 'Hi {{first_name}},\n\nGreat news — your StudentEssentials pack is confirmed and being prepared...' },
]

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  new_lead:     { label: 'New Lead',     color: '#6b7a72', bg: 'rgba(26,58,42,.06)' },
  contacted:    { label: 'Contacted',    color: '#C8A96E', bg: 'rgba(200,169,110,.15)' },
  interested:   { label: 'Interested',   color: '#2E7D52', bg: 'rgba(46,125,82,.15)' },
  pack_ordered: { label: 'Pack Ordered', color: '#1A3A2A', bg: '#E0F0E8' },
  arrived:      { label: 'Arrived',      color: '#fff',    bg: '#2E7D52' },
  churned:      { label: 'Churned',      color: '#fff',    bg: '#e8413e' },
}

const substatusOptions: Record<string, string[]> = {
  new_lead:     ['Not yet contacted', 'Callback requested'],
  contacted:    ['No response', 'Call scheduled', 'Whatsapp sent'],
  interested:   ['Brochure sent', 'Quote sent', 'Negotiating'],
  pack_ordered: ['Payment received', 'Processing', 'Dispatched', 'Delivered'],
  arrived:      ['Settled in', 'Needs support'],
  churned:      ['Price', 'Competitor', 'No longer going', 'Unresponsive'],
}

const announcementColors: Record<string, { bg: string; color: string }> = {
  info:   { bg: 'rgba(26,58,42,.06)',       color: 'var(--forest)' },
  deal:   { bg: 'rgba(46,125,82,.15)',       color: 'var(--forest)' },
  bonus:  { bg: 'rgba(200,169,110,.15)',     color: 'var(--gold)' },
  urgent: { bg: 'rgba(232,65,62,.1)',        color: '#e8413e' },
  update: { bg: 'rgba(26,58,42,.06)',        color: 'var(--bottle)' },
}

const roleColors: Record<string, { bg: string; color: string }> = {
  admin:   { bg: '#1A3A2A',               color: '#fff' },
  manager: { bg: 'rgba(46,125,82,.15)',   color: 'var(--forest)' },
  sales:   { bg: 'rgba(200,169,110,.15)', color: 'var(--gold)' },
  support: { bg: 'rgba(26,58,42,.06)',    color: 'var(--muted)' },
  agent:   { bg: '#E0F0E8',               color: 'var(--forest)' },
}

const activityIcons: Record<string, string> = {
  note: '📝', call: '📞', email: '📧', whatsapp: '💬', status_change: '🔄', order: '📦'
}

type Page = 'dashboard' | 'leads' | 'announcements' | 'templates' | 'team' | 'analytics'

export default function CRM() {
  const router = useRouter()
  const supabase = createClient()

  // ── STUDENTS (real Supabase) ──────────────────────────────────────
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // ── ACTIVITIES (real Supabase) ────────────────────────────────────
  const [activities, setActivities] = useState<Record<string, any[]>>({})

  // ── ANNOUNCEMENTS (real Supabase) ─────────────────────────────────
  const [announcements, setAnnouncements] = useState<any[]>([])

  // ── UI STATE ──────────────────────────────────────────────────────
  const [page, setPage] = useState<Page>('dashboard')
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCountry, setFilterCountry] = useState('all')
  const [filterAssigned, setFilterAssigned] = useState('all')
  const [filterDate, setFilterDate] = useState('')
  const [newNote, setNewNote] = useState('')
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [showNewAnnouncement, setShowNewAnnouncement] = useState(false)
  const [newAnn, setNewAnn] = useState({ title: '', content: '', type: 'info' })
  const [showAddModal, setShowAddModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [addForm, setAddForm] = useState({
    first_name: '', last_name: '', email: '', phone: '',
    country: '', university: '', status: 'new_lead', source: 'manual', notes: '',
  })

  // ── DATA FETCHING ─────────────────────────────────────────────────
  useEffect(() => { fetchStudents() }, [])

  async function fetchStudents() {
    setLoading(true)
    const { data, error } = await supabase
      .from('crm_students')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error && data) setStudents(data)
    setLoading(false)
  }

  async function fetchActivities(studentId: string) {
    const { data } = await supabase
      .from('crm_activities')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
    if (data) setActivities(prev => ({ ...prev, [studentId]: data }))
  }

  async function fetchAnnouncements() {
    const { data } = await supabase
      .from('crm_announcements')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setAnnouncements(data)
  }

  // Fetch announcements when on announcements page or dashboard
  useEffect(() => {
    if (page === 'announcements' || page === 'dashboard') fetchAnnouncements()
  }, [page])

  // Fetch activities when a student is selected
  useEffect(() => {
    if (selectedStudent) fetchActivities(selectedStudent.id)
  }, [selectedStudent?.id])

  // ── ACTIONS ───────────────────────────────────────────────────────
  async function addStudent() {
    if (!addForm.first_name.trim()) return
    setSaving(true)
    const { error } = await supabase.from('crm_students').insert([addForm])
    if (!error) {
      setShowAddModal(false)
      setAddForm({ first_name: '', last_name: '', email: '', phone: '', country: '', university: '', status: 'new_lead', source: 'manual', notes: '' })
      await fetchStudents()
    }
    setSaving(false)
  }

  async function updateStatus(studentId: string, status: string) {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, status } : s))
    if (selectedStudent?.id === studentId) setSelectedStudent((prev: any) => prev ? { ...prev, status } : null)
    await supabase.from('crm_students').update({ status, updated_at: new Date().toISOString() }).eq('id', studentId)
    // Log status change activity
    await supabase.from('crm_activities').insert([{
      student_id: studentId,
      type: 'status_change',
      content: `Status changed to ${statusConfig[status]?.label}`,
      created_by: 'Shubhang',
    }])
    if (selectedStudent?.id === studentId) fetchActivities(studentId)
  }

  async function addNote(studentId: string) {
    if (!newNote.trim()) return
    const { error } = await supabase.from('crm_activities').insert([{
      student_id: studentId,
      type: 'note',
      content: newNote,
      created_by: 'Shubhang',
    }])
    if (!error) {
      setNewNote('')
      fetchActivities(studentId)
    }
  }

  async function logActivity(studentId: string, type: string) {
    const labels: Record<string, string> = { call: 'Call logged', whatsapp: 'WhatsApp message logged', email: 'Email logged' }
    await supabase.from('crm_activities').insert([{
      student_id: studentId,
      type,
      content: labels[type] || type,
      created_by: 'Shubhang',
    }])
    fetchActivities(studentId)
  }

  async function postAnnouncement() {
    if (!newAnn.title || !newAnn.content) return
    const { error } = await supabase.from('crm_announcements').insert([{
      ...newAnn,
      created_by: null, // swap for real crm_users id when team is wired
    }])
    if (!error) {
      setNewAnn({ title: '', content: '', type: 'info' })
      setShowNewAnnouncement(false)
      fetchAnnouncements()
    }
  }

  // ── DERIVED ───────────────────────────────────────────────────────
  const today = new Date().toISOString().split('T')[0]
  const missedFollowUps = students.filter(s => s.follow_up_date && s.follow_up_date < today && s.status !== 'pack_ordered' && s.status !== 'arrived')
  const todayFollowUps = students.filter(s => s.follow_up_date === today)
  const totalLTV = students.reduce((s, st) => s + (st.ltv_gbp || 0), 0)
  const byStatus = (status: string) => students.filter(s => s.status === status)

  const filtered = students.filter(s => {
    const matchSearch = search === '' || `${s.first_name} ${s.last_name} ${s.email} ${s.university}`.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || s.status === filterStatus
    const matchCountry = filterCountry === 'all' || s.country === filterCountry
    const matchAssigned = filterAssigned === 'all' || s.assigned_to === filterAssigned
    return matchSearch && matchStatus && matchCountry && matchAssigned
  })

  const countries = [...new Set(students.map(s => s.country).filter(Boolean))]

  const navItems: { id: Page; icon: string; label: string; badge?: number }[] = [
    { id: 'dashboard',     icon: '📊', label: 'Dashboard',       badge: missedFollowUps.length > 0 ? missedFollowUps.length : undefined },
    { id: 'leads',         icon: '🎓', label: 'Leads & Pipeline' },
    { id: 'announcements', icon: '📢', label: 'Announcements',   badge: announcements.length || undefined },
    { id: 'templates',     icon: '📧', label: 'Email Templates' },
    { id: 'team',          icon: '👥', label: 'Team & Access' },
    { id: 'analytics',     icon: '📈', label: 'Analytics' },
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
            <button onClick={() => setShowAddModal(true)} style={{ padding: '7px 16px', fontSize: 13, fontWeight: 500, background: 'var(--forest)', color: '#fff', border: 'none', borderRadius: 40, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>+ Add lead</button>
          </div>
        </div>

        <div style={{ padding: '32px 40px' }}>

          {/* ── LOADING ── */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--muted)', fontSize: 14 }}>
              Loading CRM data...
            </div>
          )}

          {/* ── DASHBOARD ── */}
          {!loading && !selectedStudent && page === 'dashboard' && (
            <div>
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

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 14, marginBottom: 24 }}>
                {[
                  ['🎓', String(students.length), 'Total leads'],
                  ['🔥', String(students.filter(s => s.status === 'interested' || s.status === 'contacted').length), 'Active pipeline'],
                  ['✅', String(students.filter(s => s.status === 'pack_ordered').length), 'Packs ordered'],
                  ['💷', `£${totalLTV}`, 'Total LTV'],
                  ['📅', String(todayFollowUps.length), 'Follow-ups today'],
                ].map(([icon, val, label]) => (
                  <div key={label} style={{ background: 'var(--offwhite)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '16px 18px' }}>
                    <div style={{ fontSize: 20, marginBottom: 8 }}>{icon}</div>
                    <div style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 26, color: 'var(--bottle)', lineHeight: 1 }}>{val}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{label}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20 }}>
                <div style={{ background: 'var(--offwhite)', border: '0.5px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
                  <div style={{ padding: '14px 20px', borderBottom: '0.5px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--bottle)' }}>Recent leads</div>
                    <button onClick={() => setPage('leads')} style={{ fontSize: 12, color: 'var(--forest)', background: 'none', border: 'none', cursor: 'pointer' }}>View all →</button>
                  </div>
                  {students.length === 0 ? (
                    <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
                      No leads yet. <button onClick={() => setShowAddModal(true)} style={{ color: 'var(--forest)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, textDecoration: 'underline' }}>Add your first lead →</button>
                    </div>
                  ) : students.slice(0, 5).map((s, i) => (
                    <div key={s.id} onClick={() => { setSelectedStudent(s); setPage('leads') }} style={{ padding: '12px 20px', borderBottom: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', background: i % 2 === 0 ? 'transparent' : 'rgba(26,58,42,.02)' }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--mint)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 500, color: 'var(--forest)', flexShrink: 0 }}>{s.first_name[0]}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--bottle)' }}>{s.first_name} {s.last_name}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)' }}>{s.university} · {s.country}</div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                        <span style={{ fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 20, background: statusConfig[s.status]?.bg, color: statusConfig[s.status]?.color }}>{statusConfig[s.status]?.label}</span>
                        {s.follow_up_date && s.follow_up_date < today && <span style={{ fontSize: 10, color: '#e8413e' }}>⚠️ Overdue</span>}
                        {s.follow_up_date === today && <span style={{ fontSize: 10, color: 'var(--forest)' }}>📅 Today</span>}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ background: 'var(--offwhite)', border: '0.5px solid var(--border)', borderRadius: 16, padding: '18px 20px' }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--bottle)', marginBottom: 14 }}>Pipeline snapshot</div>
                    {Object.entries(statusConfig).slice(0, 5).map(([status, cfg]) => {
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

                  <div style={{ background: 'var(--offwhite)', border: '0.5px solid var(--border)', borderRadius: 16, padding: '18px 20px' }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--bottle)', marginBottom: 12 }}>Latest announcement</div>
                    {announcements[0] ? (
                      <>
                        <div style={{ background: announcementColors[announcements[0].type]?.bg, borderRadius: 10, padding: '12px 14px' }}>
                          <div style={{ fontSize: 13, fontWeight: 500, color: announcementColors[announcements[0].type]?.color, marginBottom: 4 }}>{announcements[0].title}</div>
                          <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>{announcements[0].content?.slice(0, 100)}...</div>
                        </div>
                        <button onClick={() => setPage('announcements')} style={{ fontSize: 12, color: 'var(--forest)', background: 'none', border: 'none', cursor: 'pointer', marginTop: 10, padding: 0 }}>View all announcements →</button>
                      </>
                    ) : (
                      <div style={{ fontSize: 13, color: 'var(--muted)' }}>No announcements yet.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── STUDENT PROFILE ── */}
          {!loading && selectedStudent && (
            <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 24 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Profile card */}
                <div style={{ background: 'var(--offwhite)', border: '0.5px solid var(--border)', borderRadius: 16, padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, paddingBottom: 16, borderBottom: '0.5px solid var(--border)' }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--mint)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 500, color: 'var(--forest)', flexShrink: 0 }}>{selectedStudent.first_name[0]}</div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--bottle)' }}>{selectedStudent.first_name} {selectedStudent.last_name}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>{selectedStudent.university}</div>
                    </div>
                  </div>
                  {[
                    ['📧', selectedStudent.email],
                    ['📱', selectedStudent.phone],
                    ['🌍', selectedStudent.country],
                    ['✈️', selectedStudent.arrival_date ? `Arriving ${selectedStudent.arrival_date}` : 'Arrival TBC'],
                    ['👤', `Assigned: ${selectedStudent.assigned_to || 'Unassigned'}`],
                    ['🔗', `Source: ${selectedStudent.source || '—'}`],
                  ].map(([icon, val]) => val && (
                    <div key={String(val)} style={{ display: 'flex', gap: 10, padding: '7px 0', borderBottom: '0.5px solid var(--border)', fontSize: 13 }}>
                      <span>{icon}</span><span style={{ color: 'var(--bottle)' }}>{val}</span>
                    </div>
                  ))}
                </div>

                {/* Status */}
                <div style={{ background: 'var(--offwhite)', border: '0.5px solid var(--border)', borderRadius: 16, padding: '16px 20px' }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--bottle)', marginBottom: 10 }}>Status</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                    {Object.entries(statusConfig).map(([key, cfg]) => (
                      <button key={key} onClick={() => updateStatus(selectedStudent.id, key)} style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 500, background: selectedStudent.status === key ? cfg.bg : 'var(--cream)', color: selectedStudent.status === key ? cfg.color : 'var(--muted)', border: `0.5px solid ${selectedStudent.status === key ? cfg.color : 'var(--border)'}`, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                        {cfg.label}
                      </button>
                    ))}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--muted)', marginBottom: 6 }}>Sub-status</div>
                  <select style={{ width: '100%', padding: '8px 12px', fontSize: 13, background: '#fff', border: '0.5px solid rgba(26,58,42,.2)', borderRadius: 8, outline: 'none', fontFamily: 'DM Sans, sans-serif', color: 'var(--bottle)' }}>
                    <option value="">Select sub-status...</option>
                    {(substatusOptions[selectedStudent.status] || []).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                {/* Follow-up date */}
                <div style={{ background: 'var(--offwhite)', border: '0.5px solid var(--border)', borderRadius: 16, padding: '16px 20px' }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--bottle)', marginBottom: 10 }}>Follow-up date</div>
                  <input
                    type="date"
                    defaultValue={selectedStudent.follow_up_date || ''}
                    onChange={async e => {
                      const val = e.target.value
                      await supabase.from('crm_students').update({ follow_up_date: val || null }).eq('id', selectedStudent.id)
                      setStudents(prev => prev.map(s => s.id === selectedStudent.id ? { ...s, follow_up_date: val } : s))
                      setSelectedStudent((prev: any) => ({ ...prev, follow_up_date: val }))
                    }}
                    style={{ width: '100%', padding: '8px 12px', fontSize: 13, background: '#fff', border: '0.5px solid rgba(26,58,42,.2)', borderRadius: 8, outline: 'none', fontFamily: 'DM Sans, sans-serif' }}
                  />
                  {selectedStudent.follow_up_date && selectedStudent.follow_up_date < today && (
                    <div style={{ fontSize: 12, color: '#e8413e', marginTop: 8 }}>⚠️ This follow-up is overdue!</div>
                  )}
                </div>

                {/* LTV */}
                <div style={{ background: 'var(--bottle)', borderRadius: 16, padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', width: 120, height: 120, borderRadius: '50%', background: 'rgba(46,125,82,.25)', top: -30, right: -20, filter: 'blur(25px)' }}></div>
                  <div style={{ position: 'relative', zIndex: 2 }}>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginBottom: 2 }}>Lifetime Value</div>
                    <div style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 32, color: '#fff' }}>£{selectedStudent.ltv_gbp || 0}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginTop: 4 }}>Projected: £{((selectedStudent.ltv_gbp || 0) * 2.4).toFixed(0)}</div>
                  </div>
                </div>

                {/* Tags */}
                <div style={{ background: 'var(--offwhite)', border: '0.5px solid var(--border)', borderRadius: 16, padding: '14px 16px' }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--bottle)', marginBottom: 8 }}>Tags</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {(selectedStudent.tags || []).map((tag: string) => (
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

                <div style={{ padding: '10px 20px', borderBottom: '0.5px solid var(--border)', display: 'flex', gap: 8 }}>
                  {[['📞', 'call', 'Log call'], ['💬', 'whatsapp', 'Log WhatsApp'], ['📧', 'email', 'Log email']].map(([icon, type, label]) => (
                    <button key={type} onClick={() => logActivity(selectedStudent.id, type)} style={{ padding: '5px 12px', fontSize: 12, color: 'var(--muted)', background: 'var(--cream)', border: '0.5px solid var(--border)', borderRadius: 20, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>{icon} {label}</button>
                  ))}
                </div>

                <div style={{ padding: '12px 20px', borderBottom: '0.5px solid var(--border)', display: 'flex', gap: 10 }}>
                  <input
                    value={newNote}
                    onChange={e => setNewNote(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addNote(selectedStudent.id)}
                    placeholder="Add a note, log a call, or paste a WhatsApp message..."
                    style={{ flex: 1, padding: '8px 14px', fontSize: 13, background: '#fff', border: '0.5px solid rgba(26,58,42,.2)', borderRadius: 10, outline: 'none', fontFamily: 'DM Sans, sans-serif' }}
                  />
                  <button onClick={() => addNote(selectedStudent.id)} style={{ padding: '8px 16px', background: 'var(--forest)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Save</button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '8px 20px' }}>
                  {(activities[selectedStudent.id] || []).length === 0 ? (
                    <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>No activity yet — add a note or log a call above</div>
                  ) : (activities[selectedStudent.id] || []).map((activity: any, i: number) => (
                    <div key={activity.id || i} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '0.5px solid var(--border)' }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--mint)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>{activityIcons[activity.type] || '📝'}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, color: 'var(--bottle)', lineHeight: 1.5 }}>{activity.content}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
                          {new Date(activity.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} · {activity.created_by || 'Team'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── LEADS & PIPELINE ── */}
          {!loading && !selectedStudent && page === 'leads' && (
            <div>
              <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search leads..." style={{ flex: 1, minWidth: 200, padding: '8px 14px', fontSize: 13, background: '#fff', border: '0.5px solid rgba(26,58,42,.2)', borderRadius: 10, outline: 'none', fontFamily: 'DM Sans, sans-serif' }} />
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: '8px 12px', fontSize: 13, background: '#fff', border: '0.5px solid rgba(26,58,42,.2)', borderRadius: 10, outline: 'none', fontFamily: 'DM Sans, sans-serif', color: 'var(--bottle)' }}>
                  <option value="all">All statuses</option>
                  {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
                <select value={filterCountry} onChange={e => setFilterCountry(e.target.value)} style={{ padding: '8px 12px', fontSize: 13, background: '#fff', border: '0.5px solid rgba(26,58,42,.2)', borderRadius: 10, outline: 'none', fontFamily: 'DM Sans, sans-serif', color: 'var(--bottle)' }}>
                  <option value="all">All countries</option>
                  {countries.map(c => <option key={c} value={c}>{c}</option>)}
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
                      {byStatus(status).length === 0 && (
                        <div style={{ background: 'rgba(26,58,42,.03)', border: '0.5px dashed var(--border)', borderRadius: 10, padding: '16px', textAlign: 'center', fontSize: 12, color: 'var(--muted)' }}>Empty</div>
                      )}
                      {byStatus(status).map(student => (
                        <div key={student.id} onClick={() => setSelectedStudent(student)} style={{ background: 'var(--offwhite)', border: `0.5px solid ${student.follow_up_date && student.follow_up_date < today ? 'rgba(232,65,62,.4)' : 'var(--border)'}`, borderRadius: 10, padding: '12px 14px', cursor: 'pointer' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--mint)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 500, color: 'var(--forest)', flexShrink: 0 }}>{student.first_name[0]}</div>
                            <div>
                              <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--bottle)' }}>{student.first_name} {student.last_name}</div>
                              <div style={{ fontSize: 10, color: 'var(--muted)' }}>{student.country}</div>
                            </div>
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>{(student.university || '').slice(0, 25)}</div>
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
                  {filtered.length === 0 ? (
                    <div style={{ padding: '32px', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>No leads match your filters.</div>
                  ) : filtered.map((s, i) => (
                    <div key={s.id} onClick={() => setSelectedStudent(s)} style={{ padding: '12px 18px', borderBottom: '0.5px solid var(--border)', display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr 1fr 1fr', gap: 10, alignItems: 'center', background: s.follow_up_date && s.follow_up_date < today ? 'rgba(232,65,62,.03)' : i % 2 === 0 ? 'transparent' : 'rgba(26,58,42,.02)', cursor: 'pointer' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--mint)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 500, color: 'var(--forest)', flexShrink: 0 }}>{s.first_name[0]}</div>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--bottle)' }}>{s.first_name} {s.last_name}</div>
                          <div style={{ fontSize: 10, color: 'var(--muted)' }}>{s.email}</div>
                        </div>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>{s.university || '—'}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>{s.country || '—'}</div>
                      <span style={{ fontSize: 10, fontWeight: 500, padding: '2px 8px', borderRadius: 20, background: statusConfig[s.status]?.bg, color: statusConfig[s.status]?.color, display: 'inline-block' }}>{statusConfig[s.status]?.label}</span>
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
          {!loading && !selectedStudent && page === 'announcements' && (
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
                      <button onClick={postAnnouncement} style={{ padding: '8px 20px', background: 'var(--forest)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Post</button>
                      <button onClick={() => setShowNewAnnouncement(false)} style={{ padding: '8px 16px', background: 'none', color: 'var(--muted)', border: '0.5px solid var(--border)', borderRadius: 10, fontSize: 13, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Cancel</button>
                    </div>
                  </div>
                </div>
              )}

              {announcements.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)', fontSize: 13 }}>No announcements yet. Post one above!</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {announcements.map((ann: any) => (
                    <div key={ann.id} style={{ background: 'var(--offwhite)', border: '0.5px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
                      <div style={{ padding: '6px 16px', background: announcementColors[ann.type]?.bg, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 11, fontWeight: 500, color: announcementColors[ann.type]?.color, textTransform: 'uppercase', letterSpacing: '.05em' }}>{ann.type}</span>
                        <span style={{ fontSize: 11, color: 'var(--muted)' }}>{new Date(ann.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                      <div style={{ padding: '16px 20px' }}>
                        <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--bottle)', marginBottom: 8 }}>{ann.title}</div>
                        <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7 }}>{ann.content}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── EMAIL TEMPLATES ── */}
          {!loading && !selectedStudent && page === 'templates' && (
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
          {!loading && !selectedStudent && page === 'team' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 22, color: 'var(--bottle)' }}>Team & Access Control</div>
                <button style={{ padding: '8px 18px', fontSize: 13, fontWeight: 500, background: 'var(--forest)', color: '#fff', border: 'none', borderRadius: 40, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>+ Invite member</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div style={{ background: 'var(--offwhite)', border: '0.5px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
                  <div style={{ padding: '14px 18px', borderBottom: '0.5px solid var(--border)', fontSize: 14, fontWeight: 500, color: 'var(--bottle)' }}>Role permissions</div>
                  <div style={{ padding: '8px 18px' }}>
                    {[
                      { role: 'admin',   perms: ['All access', 'User management', 'Settings', 'Financial data'] },
                      { role: 'manager', perms: ['All leads', 'Team reports', 'Announcements', 'Templates'] },
                      { role: 'sales',   perms: ['Own leads', 'Pipeline', 'Email templates', 'Tasks'] },
                      { role: 'support', perms: ['Student profiles', 'Orders', 'Activity log'] },
                      { role: 'agent',   perms: ['Own students only', 'Commission data', 'Referral tools'] },
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
          {!loading && !selectedStudent && page === 'analytics' && (
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
                  {countries.length === 0 ? (
                    <div style={{ fontSize: 13, color: 'var(--muted)' }}>No data yet.</div>
                  ) : countries.map(country => {
                    const countryStudents = students.filter(s => s.country === country)
                    const ltv = countryStudents.reduce((a, s) => a + (s.ltv_gbp || 0), 0)
                    return (
                      <div key={country} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '0.5px solid var(--border)' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--bottle)' }}>{country}</div>
                          <div style={{ fontSize: 11, color: 'var(--muted)' }}>{countryStudents.length} students</div>
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: ltv > 0 ? 'var(--forest)' : 'var(--muted)' }}>{ltv > 0 ? `£${ltv}` : '—'}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ADD STUDENT MODAL */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={() => setShowAddModal(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.4)' }}></div>
          <div style={{ position: 'relative', background: 'var(--offwhite)', borderRadius: 16, padding: '28px', width: 520, zIndex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--bottle)', marginBottom: 20 }}>Add new lead</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              {([['First name *', 'first_name'], ['Last name', 'last_name'], ['Email', 'email'], ['Phone', 'phone'], ['Country', 'country'], ['University', 'university']] as [string, string][]).map(([label, key]) => (
                <div key={key}>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 5 }}>{label}</div>
                  <input value={(addForm as any)[key]} onChange={e => setAddForm(f => ({ ...f, [key]: e.target.value }))}
                    style={{ width: '100%', padding: '8px 12px', fontSize: 13, background: '#fff', border: '0.5px solid rgba(26,58,42,.2)', borderRadius: 8, outline: 'none', fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box' as const }} />
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 5 }}>Status</div>
                <select value={addForm.status} onChange={e => setAddForm(f => ({ ...f, status: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', fontSize: 13, background: '#fff', border: '0.5px solid rgba(26,58,42,.2)', borderRadius: 8, outline: 'none', fontFamily: 'DM Sans, sans-serif' }}>
                  {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 5 }}>Source</div>
                <select value={addForm.source} onChange={e => setAddForm(f => ({ ...f, source: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', fontSize: 13, background: '#fff', border: '0.5px solid rgba(26,58,42,.2)', borderRadius: 8, outline: 'none', fontFamily: 'DM Sans, sans-serif' }}>
                  {['manual', 'website', 'agent', 'whatsapp', 'instagram'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 5 }}>Notes</div>
              <textarea value={addForm.notes} onChange={e => setAddForm(f => ({ ...f, notes: e.target.value }))} rows={2}
                style={{ width: '100%', padding: '8px 12px', fontSize: 13, background: '#fff', border: '0.5px solid rgba(26,58,42,.2)', borderRadius: 8, outline: 'none', fontFamily: 'DM Sans, sans-serif', resize: 'none', boxSizing: 'border-box' as const }} />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowAddModal(false)} style={{ padding: '9px 20px', fontSize: 13, color: 'var(--muted)', border: '0.5px solid var(--border)', borderRadius: 10, background: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Cancel</button>
              <button onClick={addStudent} disabled={saving || !addForm.first_name.trim()} style={{ padding: '9px 24px', fontSize: 13, fontWeight: 500, background: 'var(--forest)', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', opacity: saving || !addForm.first_name.trim() ? 0.5 : 1, fontFamily: 'DM Sans, sans-serif' }}>
                {saving ? 'Saving...' : 'Add lead →'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EMAIL MODAL */}
      {showEmailModal && selectedStudent && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={() => setShowEmailModal(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.4)' }}></div>
          <div style={{ position: 'relative', background: 'var(--offwhite)', borderRadius: 16, padding: '28px', width: 540, maxHeight: '80vh', overflowY: 'auto', zIndex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--bottle)', marginBottom: 16 }}>Send email to {selectedStudent.first_name}</div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Template</label>
              <select value={selectedTemplate} onChange={e => setSelectedTemplate(e.target.value)} style={{ width: '100%', padding: '9px 12px', fontSize: 13, background: '#fff', border: '0.5px solid rgba(26,58,42,.2)', borderRadius: 10, outline: 'none', fontFamily: 'DM Sans, sans-serif' }}>
                <option value="">Select a template...</option>
                {mockTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>To</label>
              <input defaultValue={selectedStudent.email} style={{ width: '100%', padding: '9px 12px', fontSize: 13, background: '#fff', border: '0.5px solid rgba(26,58,42,.2)', borderRadius: 10, outline: 'none', fontFamily: 'DM Sans, sans-serif' }} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Subject</label>
              <input defaultValue={selectedTemplate ? mockTemplates.find(t => t.id === selectedTemplate)?.subject.replace('{{first_name}}', selectedStudent.first_name) : ''} style={{ width: '100%', padding: '9px 12px', fontSize: 13, background: '#fff', border: '0.5px solid rgba(26,58,42,.2)', borderRadius: 10, outline: 'none', fontFamily: 'DM Sans, sans-serif' }} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Message</label>
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