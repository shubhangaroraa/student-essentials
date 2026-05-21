'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const mockStudents = [
  { id: '1', first_name: 'Priya', last_name: 'Sharma', email: 'priya@example.com', phone: '+91 98765 43210', country: 'India', university: 'Univ. of Manchester', arrival_date: '2026-09-15', status: 'pack_ordered', source: 'website', ltv_gbp: 180, notes: 'Very responsive, wants bedding + SIM', created_at: '2026-05-13' },
  { id: '2', first_name: 'Arjun', last_name: 'Mehta', email: 'arjun@example.com', phone: '+91 87654 32109', country: 'India', university: 'UCL London', arrival_date: '2026-09-20', status: 'interested', source: 'agent', ltv_gbp: 14, notes: 'Referred by Ravi Kumar agent', created_at: '2026-05-11' },
  { id: '3', first_name: 'Fatima', last_name: 'Al-Hassan', email: 'fatima@example.com', phone: '+234 801 234 5678', country: 'Nigeria', university: 'Univ. of Birmingham', arrival_date: '2026-09-18', status: 'contacted', source: 'website', ltv_gbp: 0, notes: 'Interested in full pack', created_at: '2026-05-10' },
  { id: '4', first_name: 'Wei', last_name: 'Zhang', email: 'wei@example.com', phone: '+86 138 0013 8000', country: 'China', university: 'Univ. of Edinburgh', arrival_date: '2026-09-22', status: 'pack_ordered', source: 'website', ltv_gbp: 232, notes: 'Bought full bundle', created_at: '2026-05-08' },
  { id: '5', first_name: 'Omar', last_name: 'Siddiqui', email: 'omar@example.com', phone: '+92 300 1234567', country: 'Pakistan', university: 'Univ. of Leeds', arrival_date: '2026-09-25', status: 'new_lead', source: 'website', ltv_gbp: 0, notes: '', created_at: '2026-05-06' },
  { id: '6', first_name: 'Aisha', last_name: 'Patel', email: 'aisha@example.com', phone: '+91 76543 21098', country: 'India', university: 'Univ. of Sheffield', arrival_date: '2026-09-19', status: 'new_lead', source: 'referral', ltv_gbp: 0, notes: '', created_at: '2026-05-05' },
]

const mockActivities: Record<string, {type: string; content: string; date: string}[]> = {
  '1': [
    { type: 'order', content: 'Placed order SE-2026-48201 — Bedding + SIM + Insurance · £180', date: '13 May' },
    { type: 'email', content: 'Sent welcome email with delivery tracking info', date: '13 May' },
    { type: 'note', content: 'Student confirmed arrival date as 15 Sep', date: '11 May' },
    { type: 'call', content: 'Intro call — very keen on full pack, asked about remittance', date: '10 May' },
  ],
  '2': [
    { type: 'email', content: 'Sent services brochure PDF', date: '12 May' },
    { type: 'note', content: 'Referred by agent Ravi Kumar (Gold tier)', date: '11 May' },
  ],
  '3': [
    { type: 'whatsapp', content: 'Sent WhatsApp intro message', date: '11 May' },
    { type: 'note', content: 'No response yet — follow up in 3 days', date: '10 May' },
  ],
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  new_lead: { label: 'New Lead', color: '#6b7a72', bg: 'rgba(26,58,42,.06)' },
  contacted: { label: 'Contacted', color: '#C8A96E', bg: 'rgba(200,169,110,.15)' },
  interested: { label: 'Interested', color: '#2E7D52', bg: 'rgba(46,125,82,.15)' },
  pack_ordered: { label: 'Pack Ordered', color: '#1A3A2A', bg: '#E0F0E8' },
  arrived: { label: 'Arrived', color: '#fff', bg: '#2E7D52' },
  churned: { label: 'Churned', color: '#fff', bg: '#e8413e' },
}

const activityIcons: Record<string, string> = {
  note: '📝', call: '📞', email: '📧', whatsapp: '💬', status_change: '🔄', order: '📦'
}

const pages = ['pipeline', 'students', 'tasks', 'analytics'] as const
type Page = typeof pages[number]

export default function CRM() {
  const router = useRouter()
  const [page, setPage] = useState<Page>('pipeline')
  const [selectedStudent, setSelectedStudent] = useState<typeof mockStudents[0] | null>(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCountry, setFilterCountry] = useState('all')
  const [newNote, setNewNote] = useState('')
  const [activities, setActivities] = useState(mockActivities)

  const filtered = mockStudents.filter(s => {
    const matchSearch = search === '' || `${s.first_name} ${s.last_name} ${s.email} ${s.university}`.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || s.status === filterStatus
    const matchCountry = filterCountry === 'all' || s.country === filterCountry
    return matchSearch && matchStatus && matchCountry
  })

  const byStatus = (status: string) => mockStudents.filter(s => s.status === status)
  const totalLTV = mockStudents.reduce((s, st) => s + st.ltv_gbp, 0)
  const avgLTV = (totalLTV / mockStudents.filter(s => s.ltv_gbp > 0).length).toFixed(0)

  const addNote = (studentId: string) => {
    if (!newNote.trim()) return
    setActivities(prev => ({
      ...prev,
      [studentId]: [{ type: 'note', content: newNote, date: 'Just now' }, ...(prev[studentId] || [])]
    }))
    setNewNote('')
  }

  const navItems: { id: Page; icon: string; label: string }[] = [
    { id: 'pipeline', icon: '📋', label: 'Pipeline' },
    { id: 'students', icon: '🎓', label: 'Students' },
    { id: 'tasks', icon: '✅', label: 'Tasks' },
    { id: 'analytics', icon: '📊', label: 'Analytics' },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--cream)' }}>

      {/* SIDEBAR */}
      <aside style={{ width: 240, flexShrink: 0, background: '#0f1f17', position: 'fixed', top: 0, left: 0, bottom: 0, display: 'flex', flexDirection: 'column', zIndex: 50 }}>
        <div style={{ padding: '26px 22px 18px', borderBottom: '0.5px solid rgba(255,255,255,.07)', marginBottom: 8 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 4 }}>
            <div style={{ width: 30, height: 30, background: 'var(--forest)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg viewBox="0 0 20 20" fill="none" width="16" height="16"><path d="M10 2L3 6V10C3 13.5 6.5 17 10 18C13.5 17 17 13.5 17 10V6L10 2Z" fill="white"/><path d="M7 10L9 12L13 8" stroke="#2e7d52" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div>
              <span style={{ fontSize: 14, fontWeight: 500, color: '#fff' }}>Student<span style={{ color: 'var(--sage)' }}>Essentials</span></span>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', marginTop: 1 }}>CRM</div>
            </div>
          </Link>
        </div>

        <div style={{ padding: '4px 12px', flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.2)', padding: '8px 10px 4px' }}>CRM</div>
          {navItems.map(item => (
            <button key={item.id} onClick={() => { setPage(item.id); setSelectedStudent(null) }} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 8, width: '100%', textAlign: 'left', fontSize: 13, color: page === item.id ? '#fff' : 'rgba(255,255,255,.55)', background: page === item.id ? 'rgba(107,191,138,.15)' : 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', marginBottom: 1 }}>
              <span style={{ fontSize: 15, width: 20, textAlign: 'center' }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
          <div style={{ marginTop: 16, borderTop: '0.5px solid rgba(255,255,255,.07)', paddingTop: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.2)', padding: '4px 10px 8px' }}>Back office</div>
            <Link href="/admin" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 8, fontSize: 13, color: 'rgba(255,255,255,.55)', textDecoration: 'none' }}>
              <span style={{ fontSize: 15, width: 20, textAlign: 'center' }}>⚙️</span> Admin Panel
            </Link>
            <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 8, fontSize: 13, color: 'rgba(255,255,255,.55)', textDecoration: 'none' }}>
              <span style={{ fontSize: 15, width: 20, textAlign: 'center' }}>🏠</span> Student View
            </Link>
          </div>
        </div>

        <div style={{ padding: '12px 12px 18px', borderTop: '0.5px solid rgba(255,255,255,.07)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(107,191,138,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 500, color: 'var(--sage)', flexShrink: 0 }}>S</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#fff' }}>Shubhang</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.3)' }}>Admin</div>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ marginLeft: 240, flex: 1 }}>
        <div style={{ position: 'sticky', top: 0, zIndex: 40, padding: '0 40px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(245,240,232,.93)', backdropFilter: 'blur(14px)', borderBottom: '0.5px solid var(--border)' }}>
          <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--bottle)' }}>
            {selectedStudent ? `${selectedStudent.first_name} ${selectedStudent.last_name}` : navItems.find(n => n.id === page)?.label}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {selectedStudent && (
              <button onClick={() => setSelectedStudent(null)} style={{ padding: '7px 16px', fontSize: 13, color: 'var(--muted)', background: 'none', border: '0.5px solid var(--border)', borderRadius: 40, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>← Back</button>
            )}
            <button style={{ padding: '7px 16px', fontSize: 13, fontWeight: 500, background: 'var(--forest)', color: '#fff', border: 'none', borderRadius: 40, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>+ Add student</button>
          </div>
        </div>

        <div style={{ padding: '36px 40px' }}>

          {/* STUDENT PROFILE */}
          {selectedStudent && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 24 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Profile card */}
                <div style={{ background: 'var(--offwhite)', border: '0.5px solid var(--border)', borderRadius: 16, padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, paddingBottom: 20, borderBottom: '0.5px solid var(--border)' }}>
                    <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--mint)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 500, color: 'var(--forest)', flexShrink: 0 }}>
                      {selectedStudent.first_name[0]}
                    </div>
                    <div>
                      <div style={{ fontSize: 17, fontWeight: 500, color: 'var(--bottle)' }}>{selectedStudent.first_name} {selectedStudent.last_name}</div>
                      <div style={{ fontSize: 13, color: 'var(--muted)' }}>{selectedStudent.university}</div>
                      <span style={{ fontSize: 11, fontWeight: 500, padding: '2px 10px', borderRadius: 20, background: statusConfig[selectedStudent.status].bg, color: statusConfig[selectedStudent.status].color, display: 'inline-block', marginTop: 4 }}>{statusConfig[selectedStudent.status].label}</span>
                    </div>
                  </div>
                  {[
                    ['📧', selectedStudent.email],
                    ['📱', selectedStudent.phone],
                    ['🌍', selectedStudent.country],
                    ['✈️', `Arriving ${selectedStudent.arrival_date}`],
                    ['🔗', `Source: ${selectedStudent.source}`],
                  ].map(([icon, val]) => (
                    <div key={val} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '0.5px solid var(--border)', fontSize: 13 }}>
                      <span style={{ fontSize: 16 }}>{icon}</span>
                      <span style={{ color: 'var(--bottle)' }}>{val}</span>
                    </div>
                  ))}
                </div>

                {/* LTV card */}
                <div style={{ background: 'var(--bottle)', borderRadius: 16, padding: '20px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', width: 150, height: 150, borderRadius: '50%', background: 'rgba(46,125,82,.25)', top: -40, right: -30, filter: 'blur(30px)' }}></div>
                  <div style={{ position: 'relative', zIndex: 2 }}>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,.45)', marginBottom: 4 }}>Lifetime Value</div>
                    <div style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 36, color: '#fff', marginBottom: 8 }}>£{selectedStudent.ltv_gbp}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,.45)', marginBottom: 12 }}>Projected LTV: £{(selectedStudent.ltv_gbp * 2.4).toFixed(0)}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      {[['Orders', '1'], ['Services', selectedStudent.ltv_gbp > 0 ? '3' : '0']].map(([label, val]) => (
                        <div key={label} style={{ background: 'rgba(255,255,255,.08)', borderRadius: 8, padding: '10px 12px' }}>
                          <div style={{ fontSize: 18, fontWeight: 500, color: '#fff' }}>{val}</div>
                          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.45)' }}>{label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Services purchased */}
                <div style={{ background: 'var(--offwhite)', border: '0.5px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
                  <div style={{ padding: '14px 20px', borderBottom: '0.5px solid var(--border)', fontSize: 13, fontWeight: 500, color: 'var(--bottle)' }}>Services purchased</div>
                  {selectedStudent.ltv_gbp > 0 ? (
                    <div style={{ padding: '8px 20px' }}>
                      {[
                        { icon: '🛏️', name: 'Bedding & Kitchen Pack', variant: 'Standard', price: '£89' },
                        { icon: '📱', name: 'UK SIM Card', variant: '5GB', price: '£14' },
                        { icon: '🛡️', name: 'Travel Insurance', variant: 'Single trip', price: '£32' },
                        { icon: '🚗', name: 'Airport Transfer', variant: 'Heathrow', price: '£45' },
                      ].map(s => (
                        <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '0.5px solid var(--border)' }}>
                          <span style={{ fontSize: 18 }}>{s.icon}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--bottle)' }}>{s.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--muted)' }}>{s.variant}</div>
                          </div>
                          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--forest)' }}>{s.price}</div>
                        </div>
                      ))}
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', fontWeight: 500 }}>
                        <span style={{ fontSize: 13, color: 'var(--bottle)' }}>Total LTV</span>
                        <span style={{ fontSize: 15, color: 'var(--forest)', fontFamily: 'Playfair Display, Georgia, serif' }}>£{selectedStudent.ltv_gbp}</span>
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>No services purchased yet</div>
                  )}
                </div>

                {/* Change status */}
                <div style={{ background: 'var(--offwhite)', border: '0.5px solid var(--border)', borderRadius: 16, padding: '16px 20px' }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--bottle)', marginBottom: 12 }}>Update status</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {Object.entries(statusConfig).map(([key, cfg]) => (
                      <button key={key} style={{ padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500, background: selectedStudent.status === key ? cfg.bg : 'var(--cream)', color: selectedStudent.status === key ? cfg.color : 'var(--muted)', border: `0.5px solid ${selectedStudent.status === key ? cfg.color : 'var(--border)'}`, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                        {cfg.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Activity feed */}
              <div style={{ background: 'var(--offwhite)', border: '0.5px solid var(--border)', borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '16px 22px', borderBottom: '0.5px solid var(--border)', fontSize: 14, fontWeight: 500, color: 'var(--bottle)' }}>Activity & Notes</div>

                {/* Add note */}
                <div style={{ padding: '16px 22px', borderBottom: '0.5px solid var(--border)', display: 'flex', gap: 10 }}>
                  <input value={newNote} onChange={e => setNewNote(e.target.value)} onKeyDown={e => e.key === 'Enter' && addNote(selectedStudent.id)} placeholder="Add a note, log a call or email..." style={{ flex: 1, padding: '9px 14px', fontSize: 13, background: '#fff', border: '0.5px solid rgba(26,58,42,.2)', borderRadius: 10, outline: 'none', fontFamily: 'DM Sans, sans-serif' }} />
                  <button onClick={() => addNote(selectedStudent.id)} style={{ padding: '9px 16px', background: 'var(--forest)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Add</button>
                </div>

                {/* Activity type buttons */}
                <div style={{ padding: '10px 22px', borderBottom: '0.5px solid var(--border)', display: 'flex', gap: 8 }}>
                  {[['📞', 'Log call'], ['📧', 'Log email'], ['💬', 'WhatsApp'], ['📝', 'Note']].map(([icon, label]) => (
                    <button key={label} style={{ padding: '5px 12px', fontSize: 12, color: 'var(--muted)', background: 'var(--cream)', border: '0.5px solid var(--border)', borderRadius: 20, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: 4 }}>
                      {icon} {label}
                    </button>
                  ))}
                </div>

                {/* Timeline */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '8px 22px' }}>
                  {(activities[selectedStudent.id] || []).length === 0 ? (
                    <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>No activity yet — add a note above</div>
                  ) : (activities[selectedStudent.id] || []).map((activity, i) => (
                    <div key={i} style={{ display: 'flex', gap: 14, padding: '14px 0', borderBottom: '0.5px solid var(--border)' }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--mint)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>{activityIcons[activity.type]}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, color: 'var(--bottle)', lineHeight: 1.5 }}>{activity.content}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{activity.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PIPELINE */}
          {!selectedStudent && page === 'pipeline' && (
            <div>
              <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 16 }}>
                {Object.entries(statusConfig).filter(([k]) => k !== 'churned').map(([status, cfg]) => (
                  <div key={status} style={{ minWidth: 240, flex: '0 0 240px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--bottle)' }}>{cfg.label}</div>
                      <div style={{ fontSize: 11, background: 'var(--cream)', border: '0.5px solid var(--border)', borderRadius: 20, padding: '2px 8px', color: 'var(--muted)' }}>{byStatus(status).length}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {byStatus(status).map(student => (
                        <div key={student.id} onClick={() => setSelectedStudent(student)} style={{ background: 'var(--offwhite)', border: '0.5px solid var(--border)', borderRadius: 12, padding: '14px 16px', cursor: 'pointer', transition: 'all .2s' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--mint)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 500, color: 'var(--forest)', flexShrink: 0 }}>{student.first_name[0]}</div>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--bottle)' }}>{student.first_name} {student.last_name}</div>
                              <div style={{ fontSize: 11, color: 'var(--muted)' }}>{student.country}</div>
                            </div>
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>{student.university}</div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontSize: 11, color: 'var(--muted)' }}>Arrives {student.arrival_date}</div>
                            {student.ltv_gbp > 0 && <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--forest)' }}>£{student.ltv_gbp}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STUDENTS LIST */}
          {!selectedStudent && page === 'students' && (
            <div>
              <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students..." style={{ flex: 1, minWidth: 200, padding: '9px 14px', fontSize: 14, background: '#fff', border: '0.5px solid rgba(26,58,42,.2)', borderRadius: 10, outline: 'none', fontFamily: 'DM Sans, sans-serif' }} />
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: '9px 14px', fontSize: 13, background: '#fff', border: '0.5px solid rgba(26,58,42,.2)', borderRadius: 10, outline: 'none', fontFamily: 'DM Sans, sans-serif', color: 'var(--bottle)' }}>
                  <option value="all">All statuses</option>
                  {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
                <select value={filterCountry} onChange={e => setFilterCountry(e.target.value)} style={{ padding: '9px 14px', fontSize: 13, background: '#fff', border: '0.5px solid rgba(26,58,42,.2)', borderRadius: 10, outline: 'none', fontFamily: 'DM Sans, sans-serif', color: 'var(--bottle)' }}>
                  <option value="all">All countries</option>
                  {['India', 'Nigeria', 'China', 'Pakistan'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ background: 'var(--offwhite)', border: '0.5px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
                <div style={{ padding: '12px 22px', borderBottom: '0.5px solid var(--border)', display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr 1fr', gap: 12 }}>
                  {['Student', 'University', 'Country', 'Status', 'LTV', 'Arrival'].map(h => (
                    <div key={h} style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--muted)' }}>{h}</div>
                  ))}
                </div>
                {filtered.map((student, i) => (
                  <div key={student.id} onClick={() => setSelectedStudent(student)} style={{ padding: '14px 22px', borderBottom: '0.5px solid var(--border)', display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr 1fr', gap: 12, alignItems: 'center', background: i % 2 === 0 ? 'transparent' : 'rgba(26,58,42,.02)', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--mint)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 500, color: 'var(--forest)', flexShrink: 0 }}>{student.first_name[0]}</div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--bottle)' }}>{student.first_name} {student.last_name}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)' }}>{student.email}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--muted)' }}>{student.university}</div>
                    <div style={{ fontSize: 13, color: 'var(--muted)' }}>{student.country}</div>
                    <span style={{ fontSize: 11, fontWeight: 500, padding: '3px 10px', borderRadius: 20, background: statusConfig[student.status].bg, color: statusConfig[student.status].color, display: 'inline-block' }}>{statusConfig[student.status].label}</span>
                    <div style={{ fontSize: 13, fontWeight: 500, color: student.ltv_gbp > 0 ? 'var(--forest)' : 'var(--muted)' }}>{student.ltv_gbp > 0 ? `£${student.ltv_gbp}` : '—'}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>{student.arrival_date}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TASKS */}
          {!selectedStudent && page === 'tasks' && (
            <div>
              <div style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 22, color: 'var(--bottle)', marginBottom: 24 }}>Follow-up Tasks</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { student: 'Fatima Al-Hassan', task: 'Follow up — no response to WhatsApp', due: 'Today', priority: 'high' },
                  { student: 'Omar Siddiqui', task: 'Send services brochure', due: 'Tomorrow', priority: 'medium' },
                  { student: 'Arjun Mehta', task: 'Check if ready to order', due: '23 May', priority: 'medium' },
                  { student: 'Aisha Patel', task: 'Intro call scheduled', due: '24 May', priority: 'low' },
                ].map((task, i) => (
                  <div key={i} style={{ background: 'var(--offwhite)', border: '0.5px solid var(--border)', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                    <input type="checkbox" style={{ width: 18, height: 18, accentColor: 'var(--forest)', cursor: 'pointer', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--bottle)' }}>{task.task}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{task.student}</div>
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 500, padding: '3px 10px', borderRadius: 20, background: task.priority === 'high' ? 'rgba(232,65,62,.1)' : task.priority === 'medium' ? 'rgba(200,169,110,.15)' : 'var(--mint)', color: task.priority === 'high' ? '#e8413e' : task.priority === 'medium' ? 'var(--gold)' : 'var(--forest)' }}>{task.due}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ANALYTICS */}
          {!selectedStudent && page === 'analytics' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
                {[
                  ['🎓', String(mockStudents.length), 'Total students'],
                  ['💷', `£${totalLTV}`, 'Total LTV'],
                  ['📈', `£${avgLTV}`, 'Avg LTV'],
                  ['✅', `${Math.round((mockStudents.filter(s => s.status === 'pack_ordered').length / mockStudents.length) * 100)}%`, 'Conversion rate'],
                ].map(([icon, val, label]) => (
                  <div key={label} style={{ background: 'var(--offwhite)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '18px 20px' }}>
                    <div style={{ fontSize: 20, marginBottom: 10 }}>{icon}</div>
                    <div style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 28, color: 'var(--bottle)', lineHeight: 1 }}>{val}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{label}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div style={{ background: 'var(--offwhite)', border: '0.5px solid var(--border)', borderRadius: 16, padding: '24px' }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--bottle)', marginBottom: 16 }}>Pipeline breakdown</div>
                  {Object.entries(statusConfig).map(([status, cfg]) => {
                    const count = byStatus(status).length
                    const pct = Math.round((count / mockStudents.length) * 100)
                    return (
                      <div key={status} style={{ marginBottom: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                          <span style={{ color: 'var(--bottle)' }}>{cfg.label}</span>
                          <span style={{ color: 'var(--muted)' }}>{count} students · {pct}%</span>
                        </div>
                        <div style={{ height: 6, background: 'rgba(26,58,42,.08)', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: 'var(--forest)', borderRadius: 3 }}></div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div style={{ background: 'var(--offwhite)', border: '0.5px solid var(--border)', borderRadius: 16, padding: '24px' }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--bottle)', marginBottom: 16 }}>LTV by country</div>
                  {[['🇮🇳', 'India', 3, 194], ['🇨🇳', 'China', 1, 232], ['🇳🇬', 'Nigeria', 1, 0], ['🇵🇰', 'Pakistan', 1, 0]].map(([flag, country, students, ltv]) => (
                    <div key={country as string} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '0.5px solid var(--border)' }}>
                      <span style={{ fontSize: 20 }}>{flag}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--bottle)' }}>{country as string}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)' }}>{students} students</div>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: Number(ltv) > 0 ? 'var(--forest)' : 'var(--muted)' }}>{Number(ltv) > 0 ? `£${ltv} avg` : '—'}</div>
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