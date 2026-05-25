'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

// ── Types ──────────────────────────────────────────────────────────
type Lead = {
  id: string; first_name: string; last_name: string | null; email: string | null
  phone: string | null; university: string | null; country: string | null
  stage: string; source: string | null; utm_source: string | null
  utm_campaign: string | null; notes: string | null; created_at: string; ed_partner_id: string | null
}
type EdPartner = {
  id: string; name: string; contact_name: string | null; contact_email: string | null
  contact_phone: string | null; institution: string | null; utm_code: string
  commission_rate: number; status: string; created_at: string
}
type Student = {
  id: string; first_name: string | null; email: string | null; university: string | null
  country: string | null; status: string; source: string | null; created_at: string
}
type ProductVariant = {
  id: string; name: string; price: number; compare_at_price?: number | null
  description?: string | null; active?: boolean
}
type FaqItem = { question: string; answer: string }
type Product = {
  id: string; name: string; slug: string; icon: string; category: string
  description: string; includes: string[]; whats_not_included: string[]
  badge: string | null; badge_color: string; active: boolean
  images: string[]; gallery: string[]; sort_order: number
  terms_and_conditions: string | null; refund_policy: string | null
  delivery_timeline: string | null; is_hot_selling: boolean
  is_on_sale: boolean; is_new: boolean; is_featured: boolean
  sale_price: number | null; faq: FaqItem[]
  product_variants: ProductVariant[]
}

// ── Mock orders ────────────────────────────────────────────────────
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

const CATEGORIES = ['living', 'connectivity', 'travel', 'insurance', 'finance', 'general']

const pages = ['overview', 'crm', 'orders', 'customers', 'ed-partners', 'reports', 'catalogue', 'payouts', 'settings'] as const
type Page = typeof pages[number]

// ── Style helpers ──────────────────────────────────────────────────
const S = {
  card: { background: 'var(--offwhite)', border: '0.5px solid var(--border)', borderRadius: 16 } as React.CSSProperties,
  th: { fontSize: 11, fontWeight: 500, textTransform: 'uppercase' as const, letterSpacing: '.05em', color: 'var(--muted)' },
  badge: (color: string, bg: string) => ({ fontSize: 11, fontWeight: 500, padding: '3px 10px', borderRadius: 20, background: bg, color, display: 'inline-block' } as React.CSSProperties),
}

function statusBadge(status: string) {
  const map: Record<string, [string, string]> = {
    Pending: ['var(--muted)', 'rgba(26,58,42,.06)'], Confirmed: ['var(--forest)', 'var(--mint)'],
    Dispatched: ['var(--gold)', 'rgba(200,169,110,.15)'], Delivered: ['var(--forest)', 'var(--mint)'],
    new_lead: ['var(--muted)', 'rgba(26,58,42,.06)'], active: ['var(--forest)', 'var(--mint)'],
  }
  const [color, bg] = map[status] ?? ['var(--muted)', 'rgba(26,58,42,.06)']
  return <span style={S.badge(color, bg)}>{status.replace('_', ' ')}</span>
}

// ── Reusable components ────────────────────────────────────────────
function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 200, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', overflowY: 'auto', padding: '40px 20px' }}>
      <div style={{ background: 'var(--cream)', borderRadius: 20, padding: '36px', width: wide ? 860 : 580, boxShadow: '0 24px 60px rgba(0,0,0,.2)', flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <div style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 22, color: 'var(--bottle)' }}>{title}</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--muted)', lineHeight: 1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  )
}

function Field({ label, hint, ...props }: { label: string; hint?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--moss)', marginBottom: 5 }}>
        {label} {hint && <span style={{ fontWeight: 400, color: 'var(--muted)' }}>— {hint}</span>}
      </label>
      <input {...props} style={{ width: '100%', padding: '10px 14px', fontSize: 14, background: '#fff', border: '0.5px solid rgba(26,58,42,.2)', borderRadius: 10, outline: 'none', fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box' }} />
    </div>
  )
}

function TextArea({ label, hint, rows = 3, ...props }: { label: string; hint?: string; rows?: number } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--moss)', marginBottom: 5 }}>
        {label} {hint && <span style={{ fontWeight: 400, color: 'var(--muted)' }}>— {hint}</span>}
      </label>
      <textarea {...props} rows={rows} style={{ width: '100%', padding: '10px 14px', fontSize: 13, background: '#fff', border: '0.5px solid rgba(26,58,42,.2)', borderRadius: 10, outline: 'none', fontFamily: 'DM Sans, sans-serif', resize: 'vertical', boxSizing: 'border-box' }} />
    </div>
  )
}

function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13, color: 'var(--bottle)', padding: '8px 12px', background: checked ? 'var(--mint)' : 'rgba(26,58,42,.03)', borderRadius: 10, border: `0.5px solid ${checked ? 'rgba(46,125,82,.3)' : 'var(--border)'}`, transition: 'all .15s' }}>
      <div style={{ width: 18, height: 18, borderRadius: 5, background: checked ? 'var(--forest)' : '#fff', border: `1.5px solid ${checked ? 'var(--forest)' : 'rgba(26,58,42,.25)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all .15s' }}>
        {checked && <svg viewBox="0 0 10 8" fill="none" width="10" height="8"><path d="M1 4L3.5 6.5L9 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
      </div>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} style={{ display: 'none' }} />
      {label}
    </label>
  )
}

function Btn({ children, onClick, variant = 'primary', style, type = 'button' }: { children: React.ReactNode; onClick?: () => void; variant?: 'primary' | 'ghost' | 'danger'; style?: React.CSSProperties; type?: 'button' | 'submit' }) {
  const bg = variant === 'primary' ? 'var(--forest)' : variant === 'danger' ? '#ef4444' : 'transparent'
  const color = variant === 'ghost' ? 'var(--forest)' : '#fff'
  const border = variant === 'ghost' ? '0.5px solid var(--forest)' : 'none'
  return (
    <button type={type} onClick={onClick} style={{ padding: '10px 22px', fontSize: 13, fontWeight: 500, background: bg, color, border, borderRadius: 40, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', ...style }}>
      {children}
    </button>
  )
}

// ── Variants editor ────────────────────────────────────────────────
function VariantsEditor({ value, onChange }: { value: ProductVariant[]; onChange: (v: ProductVariant[]) => void }) {
  const add = () => onChange([...value, { id: '', name: '', price: 0, compare_at_price: null, description: '', active: true }])
  const remove = (i: number) => onChange(value.filter((_, j) => j !== i))
  const update = (i: number, field: string, val: string | number | boolean | null) =>
    onChange(value.map((v, j) => j === i ? { ...v, [field]: val } : v))

  return (
    <div>
      {value.map((v, i) => (
        <div key={i} style={{ background: '#fff', border: '0.5px solid var(--border)', borderRadius: 12, padding: '14px 16px', marginBottom: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 110px 32px', gap: 8, alignItems: 'end' }}>
            <Field label="Variant name" value={v.name} onChange={e => update(i, 'name', e.target.value)} placeholder="e.g. Standard" style={{ marginBottom: 0 }} />
            <Field label="Price (£)" type="number" value={v.price} onChange={e => update(i, 'price', parseFloat(e.target.value) || 0)} placeholder="89" style={{ marginBottom: 0 }} />
            <Field label="Compare at (£)" type="number" value={v.compare_at_price ?? ''} onChange={e => update(i, 'compare_at_price', e.target.value ? parseFloat(e.target.value) : null)} placeholder="Optional" style={{ marginBottom: 0 }} />
            <button onClick={() => remove(i)} style={{ width: 32, height: 38, borderRadius: 8, background: '#fef2f2', color: '#ef4444', border: 'none', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
          </div>
          <div style={{ marginTop: 8 }}>
            <Field label="Variant description" value={v.description ?? ''} onChange={e => update(i, 'description', e.target.value)} placeholder="Short description shown under this option" style={{ marginBottom: 0 }} />
          </div>
        </div>
      ))}
      <button type="button" onClick={add} style={{ fontSize: 13, color: 'var(--forest)', background: 'none', border: '0.5px dashed rgba(46,125,82,.4)', borderRadius: 10, padding: '8px 16px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', width: '100%' }}>
        + Add variant
      </button>
    </div>
  )
}

// ── FAQ editor ────────────────────────────────────────────────────
function FaqEditor({ value, onChange }: { value: FaqItem[]; onChange: (v: FaqItem[]) => void }) {
  const add = () => onChange([...value, { question: '', answer: '' }])
  const remove = (i: number) => onChange(value.filter((_, j) => j !== i))
  const update = (i: number, field: 'question' | 'answer', val: string) =>
    onChange(value.map((v, j) => j === i ? { ...v, [field]: val } : v))

  return (
    <div>
      {value.map((item, i) => (
        <div key={i} style={{ background: '#fff', border: '0.5px solid var(--border)', borderRadius: 12, padding: '14px 16px', marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--muted)' }}>FAQ #{i + 1}</span>
            <button onClick={() => remove(i)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>×</button>
          </div>
          <Field label="Question" value={item.question} onChange={e => update(i, 'question', e.target.value)} placeholder="e.g. Can I change the delivery address?" style={{ marginBottom: 8 }} />
          <TextArea label="Answer" value={item.answer} onChange={e => update(i, 'answer', e.target.value)} rows={2} placeholder="Answer shown to students" />
        </div>
      ))}
      <button type="button" onClick={add} style={{ fontSize: 13, color: 'var(--forest)', background: 'none', border: '0.5px dashed rgba(46,125,82,.4)', borderRadius: 10, padding: '8px 16px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', width: '100%' }}>
        + Add FAQ
      </button>
    </div>
  )
}

// ── Image gallery editor ───────────────────────────────────────────
function GalleryEditor({ images, onChange }: { images: string[]; onChange: (imgs: string[]) => void }) {
  const [newUrl, setNewUrl] = useState('')
  const dragIdx = useRef<number | null>(null)

  const add = () => {
    if (!newUrl.trim()) return
    onChange([...images, newUrl.trim()])
    setNewUrl('')
  }
  const remove = (i: number) => onChange(images.filter((_, j) => j !== i))
  const setMain = (i: number) => {
    const arr = [...images]
    const [item] = arr.splice(i, 1)
    arr.unshift(item)
    onChange(arr)
  }
  const onDrop = (toIdx: number) => {
    if (dragIdx.current === null || dragIdx.current === toIdx) return
    const arr = [...images]
    const [item] = arr.splice(dragIdx.current, 1)
    arr.splice(toIdx, 0, item)
    onChange(arr)
    dragIdx.current = null
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
        {images.map((url, i) => (
          <div key={i} draggable onDragStart={() => { dragIdx.current = i }} onDragOver={e => e.preventDefault()} onDrop={() => onDrop(i)}
            style={{ position: 'relative', width: 100, height: 80, borderRadius: 10, overflow: 'hidden', border: i === 0 ? '2px solid var(--forest)' : '1px solid var(--border)', cursor: 'grab', flexShrink: 0 }}>
            <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            {i === 0 && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'var(--forest)', color: '#fff', fontSize: 9, textAlign: 'center', padding: '2px 0', fontWeight: 600 }}>MAIN</div>}
            <div style={{ position: 'absolute', top: 4, right: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
              {i > 0 && (
                <button onClick={() => setMain(i)} style={{ width: 20, height: 20, borderRadius: 4, background: 'var(--forest)', border: 'none', color: '#fff', fontSize: 9, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Set as main">★</button>
              )}
              <button onClick={() => remove(i)} style={{ width: 20, height: 20, borderRadius: 4, background: '#ef4444', border: 'none', color: '#fff', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
            </div>
          </div>
        ))}
        {images.length === 0 && (
          <div style={{ width: '100%', padding: '20px', textAlign: 'center', fontSize: 12, color: 'var(--muted)', background: 'rgba(26,58,42,.03)', borderRadius: 10, border: '0.5px dashed var(--border)' }}>
            No images yet — paste a URL below
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input value={newUrl} onChange={e => setNewUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())}
          placeholder="Paste image URL (Supabase Storage, Cloudinary, etc.)"
          style={{ flex: 1, padding: '10px 14px', fontSize: 13, background: '#fff', border: '0.5px solid rgba(26,58,42,.2)', borderRadius: 10, outline: 'none', fontFamily: 'DM Sans, sans-serif' }} />
        <button type="button" onClick={add} style={{ padding: '10px 18px', fontSize: 13, fontWeight: 500, background: 'var(--forest)', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', flexShrink: 0 }}>Add</button>
      </div>
      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>Drag to reorder • First image is the main photo • Click ★ to promote to main</div>
    </div>
  )
}

// ── Catalogue Editor Modal ─────────────────────────────────────────
type CatalogueTab = 'basic' | 'media' | 'pricing' | 'policies' | 'faq' | 'settings'

function CatalogueEditor({
  product, isNew, onClose, onSave
}: {
  product: Product; isNew: boolean; onClose: () => void; onSave: (p: Product) => void
}) {
  const [tab, setTab] = useState<CatalogueTab>('basic')
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<Product>({ ...product })

  const set = (field: keyof Product, value: unknown) => setForm(f => ({ ...f, [field]: value }))

  const handleSave = async () => {
    setSaving(true)
    const payload = {
      name: form.name,
      slug: form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      icon: form.icon,
      category: form.category,
      description: form.description,
      includes: form.includes,
      whats_not_included: form.whats_not_included,
      badge: form.badge || null,
      badge_color: form.badge_color,
      active: form.active,
      sort_order: form.sort_order,
      images: form.gallery.length > 0 ? [form.gallery[0]] : form.images,
      gallery: form.gallery,
      terms_and_conditions: form.terms_and_conditions || null,
      refund_policy: form.refund_policy || null,
      delivery_timeline: form.delivery_timeline || null,
      is_hot_selling: form.is_hot_selling,
      is_on_sale: form.is_on_sale,
      is_new: form.is_new,
      is_featured: form.is_featured,
      sale_price: form.is_on_sale ? form.sale_price : null,
      faq: form.faq,
      variants: form.product_variants,
    }

    try {
      if (isNew) {
        const res = await fetch('/api/inventory', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        const { product: created } = await res.json()
        if (created) {
          const full = await fetch(`/api/inventory/${created.id}`).then(r => r.json())
          onSave(full)
        }
      } else {
        await fetch(`/api/inventory/${form.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        const updated = await fetch(`/api/inventory/${form.id}`).then(r => r.json())
        onSave(updated)
      }
    } catch (e) {
      console.error(e)
    }
    setSaving(false)
    onClose()
  }

  const TABS: { id: CatalogueTab; label: string; icon: string }[] = [
    { id: 'basic', label: 'Basic info', icon: '📝' },
    { id: 'media', label: 'Images', icon: '🖼️' },
    { id: 'pricing', label: 'Pricing', icon: '💷' },
    { id: 'policies', label: 'Policies', icon: '📋' },
    { id: 'faq', label: 'FAQs', icon: '❓' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ]

  const includesText = form.includes?.join('\n') ?? ''
  const notIncludedText = form.whats_not_included?.join('\n') ?? ''

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', zIndex: 200, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', overflowY: 'auto', padding: '32px 20px' }}>
      <div style={{ background: 'var(--cream)', borderRadius: 20, width: 900, boxShadow: '0 32px 80px rgba(0,0,0,.25)', flexShrink: 0 }}>

        {/* Header */}
        <div style={{ padding: '24px 32px 0', borderBottom: '0.5px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <div style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 22, color: 'var(--bottle)' }}>
                {isNew ? 'New service' : form.name || 'Edit service'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>
                {isNew ? 'Fill in details below — changes save to Supabase and go live immediately' : `Editing slug: ${form.slug}`}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              {/* Status badges */}
              <div style={{ display: 'flex', gap: 6 }}>
                {form.is_hot_selling && <span style={S.badge('#c2410c', '#fff7ed')}>🔥 Hot</span>}
                {form.is_on_sale && <span style={S.badge('#b45309', '#fef3c7')}>🏷️ Sale</span>}
                {form.is_new && <span style={S.badge('#1d4ed8', '#eff6ff')}>✨ New</span>}
                {form.is_featured && <span style={S.badge('#7c3aed', '#f5f3ff')}>⭐ Featured</span>}
              </div>
              <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--muted)', lineHeight: 1 }}>×</button>
            </div>
          </div>

          {/* Tab nav */}
          <div style={{ display: 'flex', gap: 0 }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{ padding: '10px 18px', fontSize: 13, fontWeight: tab === t.id ? 600 : 400, color: tab === t.id ? 'var(--forest)' : 'var(--muted)', background: 'none', border: 'none', borderBottom: tab === t.id ? '2px solid var(--forest)' : '2px solid transparent', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', gap: 6, display: 'flex', alignItems: 'center' }}>
                <span>{t.icon}</span> {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '28px 32px', maxHeight: '65vh', overflowY: 'auto' }}>

          {/* ── BASIC ── */}
          {tab === 'basic' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '0 16px' }}>
                <Field label="Icon" value={form.icon} onChange={e => set('icon', e.target.value)} placeholder="🛏️" />
                <Field label="Service name *" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Bedding & Kitchen Pack" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                <Field label="URL slug" hint="auto-generated if blank" value={form.slug} onChange={e => set('slug', e.target.value)} placeholder="bedding-pack" />
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--moss)', marginBottom: 5 }}>Category</label>
                  <select value={form.category} onChange={e => set('category', e.target.value)} style={{ width: '100%', padding: '10px 14px', fontSize: 14, background: '#fff', border: '0.5px solid rgba(26,58,42,.2)', borderRadius: 10, outline: 'none', fontFamily: 'DM Sans, sans-serif' }}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
              </div>
              <TextArea label="Short description" hint="shown on services page" rows={2} value={form.description} onChange={e => set('description', e.target.value)} placeholder="One-line description of what this service does for the student…" />
              <TextArea label="What's included" hint="one item per line" rows={5} value={includesText}
                onChange={e => set('includes', e.target.value.split('\n').map(s => s.trim()).filter(Boolean))}
                placeholder={'Duvet, pillow & pillowcases\nPlates, mugs & cutlery\nDelivered to your room\nFree returns within 14 days'} />
              <TextArea label="What's NOT included" hint="one item per line — shown as exclusions" rows={3} value={notIncludedText}
                onChange={e => set('whats_not_included', e.target.value.split('\n').map(s => s.trim()).filter(Boolean))}
                placeholder={'International shipping\nBed frame or mattress'} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: '0 16px' }}>
                <Field label="Badge text" hint="e.g. Most popular, New, Best rates" value={form.badge ?? ''} onChange={e => set('badge', e.target.value)} placeholder="Most popular" />
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--moss)', marginBottom: 5 }}>Badge colour</label>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input type="color" value={form.badge_color} onChange={e => set('badge_color', e.target.value)} style={{ width: 40, height: 38, border: 'none', borderRadius: 8, cursor: 'pointer', padding: 2 }} />
                    <input value={form.badge_color} onChange={e => set('badge_color', e.target.value)} style={{ flex: 1, padding: '10px 10px', fontSize: 13, background: '#fff', border: '0.5px solid rgba(26,58,42,.2)', borderRadius: 10, outline: 'none', fontFamily: 'DM Sans, sans-serif' }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── MEDIA ── */}
          {tab === 'media' && (
            <div>
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--bottle)', marginBottom: 4 }}>Product images</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 16 }}>The first image is the main photo shown on the services page. Drag to reorder. Upload to Supabase Storage (Storage → product-images bucket) and paste the public URL.</div>
              </div>
              <GalleryEditor
                images={form.gallery.length > 0 ? form.gallery : form.images}
                onChange={imgs => set('gallery', imgs)}
              />
              <div style={{ marginTop: 24, padding: '16px', background: 'rgba(26,58,42,.04)', borderRadius: 12, fontSize: 12, color: 'var(--muted)' }}>
                💡 <strong>How to upload:</strong> Go to Supabase → Storage → product-images → Upload file → copy the public URL and paste it above.
              </div>
            </div>
          )}

          {/* ── PRICING ── */}
          {tab === 'pricing' && (
            <div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--bottle)', marginBottom: 4 }}>Pricing variants</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 16 }}>Each variant is a purchasable option. Set a "Compare at" price to show a strikethrough on the website (e.g. was £149, now £119).</div>
                <VariantsEditor value={form.product_variants} onChange={v => set('product_variants', v)} />
              </div>

              <div style={{ borderTop: '0.5px solid var(--border)', paddingTop: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--bottle)', marginBottom: 4 }}>Sale settings</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 16 }}>When "On sale" is checked, a sale banner shows on the card and the sale price overrides the variant price on the website.</div>
                <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                  <Checkbox label="🏷️ Mark as On Sale" checked={form.is_on_sale} onChange={v => set('is_on_sale', v)} />
                </div>
                {form.is_on_sale && (
                  <Field label="Sale price (£)" type="number" hint="overrides all variant prices" value={form.sale_price ?? ''} onChange={e => set('sale_price', e.target.value ? parseFloat(e.target.value) : null)} placeholder="e.g. 79" />
                )}
              </div>
            </div>
          )}

          {/* ── POLICIES ── */}
          {tab === 'policies' && (
            <div>
              <TextArea label="Delivery timeline" hint="when students can expect to receive this" rows={4}
                value={form.delivery_timeline ?? ''}
                onChange={e => set('delivery_timeline', e.target.value)}
                placeholder={'Physical items: Delivered to your accommodation 2-3 days before your arrival date.\n\nDigital items (SIM, insurance): Sent to your email within 24 hours of order confirmation.'} />
              <TextArea label="Returns & refund policy" hint="shown on product page and at checkout" rows={5}
                value={form.refund_policy ?? ''}
                onChange={e => set('refund_policy', e.target.value)}
                placeholder={'Physical packs: Free returns within 14 days of delivery if items are unused and in original packaging.\n\nSIM cards: Non-refundable once activated.\n\nInsurance: 14-day cooling off period applies.'} />
              <TextArea label="Terms & conditions" hint="full T&Cs for this service" rows={8}
                value={form.terms_and_conditions ?? ''}
                onChange={e => set('terms_and_conditions', e.target.value)}
                placeholder={'1. This service is provided by Student Solutions Pvt Limited ("StudentEssentials").\n\n2. By placing an order you agree to our full terms at student-essentials.com/terms.\n\n3. ...'} />
            </div>
          )}

          {/* ── FAQ ── */}
          {tab === 'faq' && (
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--bottle)', marginBottom: 4 }}>Frequently asked questions</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 20 }}>FAQs are shown collapsed on the product page. Add questions students commonly ask about this service.</div>
              <FaqEditor value={form.faq ?? []} onChange={v => set('faq', v)} />
            </div>
          )}

          {/* ── SETTINGS ── */}
          {tab === 'settings' && (
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--bottle)', marginBottom: 16 }}>Visibility & labels</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
                <Checkbox label="✅ Live on website" checked={form.active} onChange={v => set('active', v)} />
                <Checkbox label="🔥 Hot selling" checked={form.is_hot_selling} onChange={v => set('is_hot_selling', v)} />
                <Checkbox label="✨ New" checked={form.is_new} onChange={v => set('is_new', v)} />
                <Checkbox label="⭐ Featured" checked={form.is_featured} onChange={v => set('is_featured', v)} />
              </div>

              <div style={{ borderTop: '0.5px solid var(--border)', paddingTop: 20, marginBottom: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--bottle)', marginBottom: 4 }}>Sort order</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>Lower number = appears first on the website. You can also drag to reorder from the catalogue list.</div>
                <Field label="Sort position" type="number" hint="1 = first" value={form.sort_order} onChange={e => set('sort_order', parseInt(e.target.value) || 0)} placeholder="1" />
              </div>

              <div style={{ borderTop: '0.5px solid var(--border)', paddingTop: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--bottle)', marginBottom: 4 }}>Danger zone</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>Hiding a service removes it from the website immediately but keeps all order history.</div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <Btn variant={form.active ? 'danger' : 'ghost'} onClick={() => set('active', !form.active)}>
                    {form.active ? 'Hide from website' : 'Make live'}
                  </Btn>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '20px 32px', borderTop: '0.5px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>Changes go live on student-essentials.com immediately after saving.</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
            <Btn type="button" onClick={handleSave} style={{ minWidth: 120 }}>
              {saving ? 'Saving…' : isNew ? 'Create service' : 'Save changes'}
            </Btn>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Sortable product row ───────────────────────────────────────────
function ProductRow({ product, index, onDragStart, onDrop, onEdit, onToggle }: {
  product: Product; index: number
  onDragStart: (i: number) => void; onDrop: (i: number) => void
  onEdit: () => void; onToggle: () => void
}) {
  const tags = []
  if (product.is_hot_selling) tags.push({ label: '🔥 Hot', bg: '#fff7ed', color: '#c2410c' })
  if (product.is_on_sale) tags.push({ label: '🏷️ Sale', bg: '#fef3c7', color: '#b45309' })
  if (product.is_new) tags.push({ label: '✨ New', bg: '#eff6ff', color: '#1d4ed8' })
  if (product.is_featured) tags.push({ label: '⭐ Featured', bg: '#f5f3ff', color: '#7c3aed' })

  const minPrice = product.product_variants?.length ? Math.min(...product.product_variants.map(v => v.price)) : 0

  return (
    <div draggable onDragStart={() => onDragStart(index)} onDragOver={e => e.preventDefault()} onDrop={() => onDrop(index)}
      style={{ background: '#fff', border: '0.5px solid var(--border)', borderRadius: 14, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 16, cursor: 'grab', opacity: product.active ? 1 : 0.55, transition: 'opacity .2s' }}>

      {/* Drag handle */}
      <div style={{ color: 'var(--muted)', fontSize: 18, cursor: 'grab', flexShrink: 0 }}>⠿</div>

      {/* Image / icon */}
      <div style={{ width: 56, height: 56, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: 'linear-gradient(135deg, rgba(46,125,82,.07), rgba(46,125,82,.03))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {(product.gallery?.[0] || product.images?.[0]) ? (
          <img src={product.gallery?.[0] || product.images?.[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontSize: 28 }}>{product.icon}</span>
        )}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--bottle)' }}>{product.name}</div>
          {tags.map((t, i) => (
            <span key={i} style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: t.bg, color: t.color }}>{t.label}</span>
          ))}
          {!product.active && <span style={S.badge('var(--muted)', 'rgba(26,58,42,.06)')}>Hidden</span>}
        </div>
        <div style={{ fontSize: 12, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 400 }}>{product.description}</div>
        <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
          {product.product_variants?.slice(0, 3).map(v => (
            <span key={v.id} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: 'rgba(26,58,42,.06)', color: 'var(--muted)' }}>
              {v.name} · £{v.price}
            </span>
          ))}
          {(product.product_variants?.length ?? 0) > 3 && <span style={{ fontSize: 11, color: 'var(--muted)' }}>+{product.product_variants.length - 3} more</span>}
        </div>
      </div>

      {/* Price */}
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        {product.is_on_sale && product.sale_price ? (
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#c2410c' }}>£{product.sale_price}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', textDecoration: 'line-through' }}>from £{minPrice}</div>
          </div>
        ) : (
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--bottle)' }}>{minPrice > 0 ? `from £${minPrice}` : 'Free'}</div>
        )}
        <div style={{ fontSize: 11, color: 'var(--muted)' }}>{product.product_variants?.length ?? 0} variant{product.product_variants?.length !== 1 ? 's' : ''}</div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <button onClick={onEdit}
          style={{ padding: '8px 16px', fontSize: 12, fontWeight: 500, background: 'var(--forest)', color: '#fff', border: 'none', borderRadius: 20, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
          Edit
        </button>
        <button onClick={onToggle}
          style={{ padding: '8px 14px', fontSize: 12, fontWeight: 500, background: 'transparent', color: product.active ? '#ef4444' : 'var(--forest)', border: `0.5px solid ${product.active ? '#fca5a5' : 'rgba(46,125,82,.3)'}`, borderRadius: 20, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
          {product.active ? 'Hide' : 'Show'}
        </button>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
export default function AdminPanel() {
  const router = useRouter()
  const [page, setPage] = useState<Page>('overview')
  const [user, setUser] = useState<{ email: string; firstName: string } | null>(null)

  // CRM data
  const [leads, setLeads] = useState<Lead[]>([])
  const [partners, setPartners] = useState<EdPartner[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(false)

  // Catalogue data
  const [products, setProducts] = useState<Product[]>([])
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showNewProduct, setShowNewProduct] = useState(false)
  const catalogueDragIdx = useRef<number | null>(null)

  // CRM modal state
  const [showNewLead, setShowNewLead] = useState(false)
  const [showNewPartner, setShowNewPartner] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)

  const dragId = useRef<string | null>(null)

  // ── Auth ──
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/auth/login'); return }
      setUser({ email: user.email ?? '', firstName: user.user_metadata?.first_name ?? user.email?.split('@')[0] ?? 'Admin' })
    })
  }, [])

  // ── Fetch on page change ──
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
    if (page === 'catalogue') {
      fetch('/api/inventory').then(r => r.json()).then(d => setProducts(d.items ?? []))
    }
  }, [page])

  const signOut = async () => { const supabase = createClient(); await supabase.auth.signOut(); router.push('/') }

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
      first_name: fd.get('first_name') as string, last_name: fd.get('last_name') as string || null,
      email: fd.get('email') as string || null, phone: fd.get('phone') as string || null,
      university: fd.get('university') as string || null, country: fd.get('country') as string || null,
      stage: 'new', source: 'manual', notes: fd.get('notes') as string || null,
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
      name: fd.get('name') as string, contact_name: fd.get('contact_name') as string || null,
      contact_email: fd.get('contact_email') as string || null,
      institution: fd.get('institution') as string || null,
      utm_code: fd.get('utm_code') as string,
      commission_rate: parseFloat(fd.get('commission_rate') as string) || 5, status: 'active',
    }).select().single()
    if (data) setPartners(prev => [data, ...prev])
    setShowNewPartner(false)
  }
  const handlePartnerAction = async (partner_id: string, action: 'approve' | 'reject') => {
    const res = await fetch('/api/partners/approve', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ partner_id, action }) })
    if (res.ok) {
      const newStatus = action === 'approve' ? 'active' : 'rejected'
      setPartners(prev => prev.map(p => p.id === partner_id ? { ...p, status: newStatus } : p))
    }
  }

  // ── Catalogue drag-to-reorder ──
  const handleCatalogueDrop = useCallback(async (toIdx: number) => {
    if (catalogueDragIdx.current === null || catalogueDragIdx.current === toIdx) return
    const arr = [...products]
    const [item] = arr.splice(catalogueDragIdx.current, 1)
    arr.splice(toIdx, 0, item)
    // update sort_order
    const updated = arr.map((p, i) => ({ ...p, sort_order: i + 1 }))
    setProducts(updated)
    catalogueDragIdx.current = null
    // persist to Supabase
    await Promise.all(updated.map(p =>
      fetch(`/api/inventory/${p.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sort_order: p.sort_order }) })
    ))
  }, [products])

  const handleProductSaved = (saved: Product) => {
    setProducts(prev => {
      const idx = prev.findIndex(p => p.id === saved.id)
      if (idx >= 0) return prev.map(p => p.id === saved.id ? saved : p)
      return [saved, ...prev]
    })
  }

  // ── New product blank template ──
  const blankProduct: Product = {
    id: '', name: '', slug: '', icon: '📦', category: 'general',
    description: '', includes: [], whats_not_included: [], badge: '', badge_color: '#2e7d52',
    active: true, images: [], gallery: [], sort_order: products.length + 1,
    terms_and_conditions: '', refund_policy: '', delivery_timeline: '',
    is_hot_selling: false, is_on_sale: false, is_new: false, is_featured: false,
    sale_price: null, faq: [], product_variants: [{ id: '', name: '', price: 0 }]
  }

  const stageCounts = STAGES.reduce((acc, s) => ({ ...acc, [s]: leads.filter(l => l.stage === s).length }), {} as Record<string, number>)
  const pendingPartners = partners.filter(p => p.status === 'pending')

  const navItems: { id: Page; icon: string; label: string; section?: string }[] = [
    { id: 'overview', icon: '📊', label: 'Overview', section: 'Management' },
    { id: 'crm', icon: '🎯', label: 'CRM · Leads' },
    { id: 'orders', icon: '📦', label: 'Orders' },
    { id: 'customers', icon: '🎓', label: 'Customers' },
    { id: 'ed-partners', icon: '🏫', label: 'Ed-Partners' },
    { id: 'reports', icon: '📈', label: 'Reports', section: 'Analytics' },
    { id: 'catalogue', icon: '🛍️', label: 'Catalogue', section: 'Website' },
    { id: 'payouts', icon: '💷', label: 'Payouts', section: 'Config' },
    { id: 'settings', icon: '⚙️', label: 'Settings' },
  ]

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
                {item.id === 'ed-partners' && pendingPartners.length > 0 && (
                  <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 600, background: 'rgba(200,169,110,.3)', color: 'var(--gold)', padding: '2px 7px', borderRadius: 10 }}>{pendingPartners.length}</span>
                )}
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
            {page === 'catalogue' && <Btn onClick={() => setShowNewProduct(true)}>+ New service</Btn>}
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

              {pendingPartners.length > 0 && (
                <div style={{ padding: '12px 18px', background: 'rgba(200,169,110,.1)', border: '0.5px solid rgba(200,169,110,.35)', borderRadius: 12, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--gold)', flexShrink: 0 }}></div>
                  <div style={{ fontSize: 13, color: 'var(--bottle)' }}><strong>{pendingPartners.length}</strong> Ed-Partner application{pendingPartners.length > 1 ? 's' : ''} awaiting approval</div>
                  <button onClick={() => setPage('ed-partners')} style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--gold)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}>Review →</button>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
                <div style={{ ...S.card, overflow: 'hidden' }}>
                  <div style={{ padding: '16px 22px', borderBottom: '0.5px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--bottle)' }}>Recent orders</div>
                    <button onClick={() => setPage('orders')} style={{ fontSize: 12, color: 'var(--forest)', background: 'none', border: 'none', cursor: 'pointer' }}>View all →</button>
                  </div>
                  {MOCK_ORDERS.slice(0, 4).map(o => (
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
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--bottle)', marginBottom: 14 }}>Lead pipeline</div>
                    {STAGES.map(s => (
                      <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: STAGE_COLORS[s], flexShrink: 0 }}></div>
                        <div style={{ fontSize: 12, color: 'var(--muted)', flex: 1 }}>{STAGE_LABELS[s]}</div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--bottle)' }}>{stageCounts[s] ?? 0}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══ CRM LEADS ══ */}
          {page === 'crm' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 10, marginBottom: 24 }}>
                {STAGES.map(s => (
                  <div key={s} style={{ ...S.card, padding: '14px 16px' }}>
                    <div style={{ fontSize: 20, fontWeight: 600, color: STAGE_COLORS[s] }}>{stageCounts[s] ?? 0}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{STAGE_LABELS[s]}</div>
                  </div>
                ))}
              </div>
              {loading && <div style={{ textAlign: 'center', color: 'var(--muted)', padding: 40 }}>Loading leads…</div>}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 12, alignItems: 'start' }}>
                {STAGES.map(stage => (
                  <div key={stage} onDragOver={e => e.preventDefault()} onDrop={() => { if (dragId.current) moveLead(dragId.current, stage) }}
                    style={{ background: 'rgba(26,58,42,.03)', border: '0.5px solid var(--border)', borderRadius: 14, minHeight: 200, padding: '12px 10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: STAGE_COLORS[stage], flexShrink: 0 }}></div>
                      <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--muted)' }}>{STAGE_LABELS[stage]}</div>
                      <div style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--muted)' }}>{stageCounts[stage] ?? 0}</div>
                    </div>
                    {leads.filter(l => l.stage === stage).map(lead => (
                      <div key={lead.id} draggable onDragStart={() => { dragId.current = lead.id }} onClick={() => setSelectedLead(lead)}
                        style={{ background: '#fff', border: '0.5px solid var(--border)', borderRadius: 10, padding: '12px', marginBottom: 8, cursor: 'grab', boxShadow: '0 1px 4px rgba(0,0,0,.05)' }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--bottle)', marginBottom: 4 }}>{lead.first_name} {lead.last_name ?? ''}</div>
                        {lead.university && <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>🎓 {lead.university}</div>}
                        {lead.email && <div style={{ fontSize: 11, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>✉ {lead.email}</div>}
                        {lead.utm_source && <div style={{ fontSize: 10, color: 'var(--forest)', marginTop: 6, fontFamily: 'monospace' }}>utm: {lead.utm_source}</div>}
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
              <div style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)' }}>💡 Real orders will appear once Stripe webhook is tested end-to-end.</div>
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
                {students.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>No customers yet.</div>}
              </div>
            </div>
          )}

          {/* ══ ED-PARTNERS ══ */}
          {page === 'ed-partners' && (
            <div>
              {pendingPartners.length > 0 && (
                <div style={{ padding: '14px 20px', background: 'rgba(200,169,110,.1)', border: '0.5px solid rgba(200,169,110,.35)', borderRadius: 12, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ fontSize: 16 }}>⏳</div>
                  <div style={{ fontSize: 13, color: 'var(--bottle)' }}><strong>{pendingPartners.length}</strong> application{pendingPartners.length > 1 ? 's' : ''} waiting for review.</div>
                </div>
              )}
              <div style={{ ...S.card, overflow: 'hidden', marginBottom: 20 }}>
                <div style={{ padding: '14px 22px', borderBottom: '0.5px solid var(--border)', display: 'grid', gridTemplateColumns: '2fr 2fr 2fr 1.5fr 1fr 1.5fr', gap: 12 }}>
                  {['Partner', 'Institution', 'Contact', 'UTM Link', 'Commission', 'Status'].map(h => <div key={h} style={S.th}>{h}</div>)}
                </div>
                {partners.map((p, i) => (
                  <div key={p.id} style={{ padding: '14px 22px', borderBottom: '0.5px solid var(--border)', display: 'grid', gridTemplateColumns: '2fr 2fr 2fr 1.5fr 1fr 1.5fr', gap: 12, alignItems: 'center', background: p.status === 'pending' ? 'rgba(200,169,110,.04)' : i % 2 ? 'rgba(26,58,42,.02)' : 'transparent' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--bottle)' }}>{p.name}</div>
                      {p.contact_name && <div style={{ fontSize: 11, color: 'var(--muted)' }}>{p.contact_name}</div>}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--muted)' }}>{p.institution ?? '—'}</div>
                    <div>
                      {p.contact_email && <div style={{ fontSize: 12, color: 'var(--muted)' }}>{p.contact_email}</div>}
                    </div>
                    <div style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--forest)', background: 'var(--mint)', padding: '4px 8px', borderRadius: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>?utm_partner={p.utm_code}</div>
                    <span style={S.badge('var(--forest)', 'rgba(26,58,42,.08)')}>{p.commission_rate}%</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <span style={S.badge(
                        p.status === 'active' ? 'var(--forest)' : p.status === 'rejected' ? '#ef4444' : 'var(--gold)',
                        p.status === 'active' ? 'var(--mint)' : p.status === 'rejected' ? '#fef2f2' : 'rgba(200,169,110,.15)'
                      )}>{p.status}</span>
                      {p.status === 'pending' && (
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button onClick={() => handlePartnerAction(p.id, 'approve')} style={{ padding: '3px 10px', fontSize: 11, fontWeight: 500, background: 'var(--forest)', color: '#fff', border: 'none', borderRadius: 20, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Approve</button>
                          <button onClick={() => handlePartnerAction(p.id, 'reject')} style={{ padding: '3px 10px', fontSize: 11, fontWeight: 500, background: '#fef2f2', color: '#ef4444', border: '0.5px solid #fca5a5', borderRadius: 20, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Reject</button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {partners.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>No partners yet.</div>}
              </div>
            </div>
          )}

          {/* ══ REPORTS ══ */}
          {page === 'reports' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
                {[['£1,840', 'Revenue (May)', '+23% vs Apr'], ['£14,200', 'Revenue (YTD)', ''], ['£38.90', 'Avg. order value', ''], ['68%', 'Lead→Customer rate', '']].map(([val, label, sub]) => (
                  <div key={label} style={{ ...S.card, padding: '20px' }}>
                    <div style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 28, color: 'var(--bottle)', lineHeight: 1 }}>{val}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>{label}</div>
                    {sub && <div style={{ fontSize: 11, color: 'var(--forest)', marginTop: 2 }}>{sub}</div>}
                  </div>
                ))}
              </div>
              <div style={{ ...S.card, padding: '24px' }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--bottle)', marginBottom: 18 }}>Pipeline funnel</div>
                {STAGES.map(s => {
                  const count = stageCounts[s] ?? 0
                  const max = Math.max(...Object.values(stageCounts), 1)
                  return (
                    <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
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
          )}

          {/* ══ CATALOGUE ══ */}
          {page === 'catalogue' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                    {products.length} services · {products.filter(p => p.active).length} live on website · drag rows to reorder
                  </div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)', background: 'rgba(26,58,42,.06)', padding: '6px 14px', borderRadius: 20 }}>
                  Changes reflect on student-essentials.com/services immediately
                </div>
              </div>

              {/* Legend */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
                {[
                  { label: '🔥 Hot selling', bg: '#fff7ed', color: '#c2410c' },
                  { label: '🏷️ On sale', bg: '#fef3c7', color: '#b45309' },
                  { label: '✨ New', bg: '#eff6ff', color: '#1d4ed8' },
                  { label: '⭐ Featured', bg: '#f5f3ff', color: '#7c3aed' },
                ].map(t => (
                  <span key={t.label} style={{ fontSize: 11, padding: '4px 12px', borderRadius: 20, background: t.bg, color: t.color, fontWeight: 500 }}>{t.label}</span>
                ))}
                <span style={{ fontSize: 11, color: 'var(--muted)', padding: '4px 0' }}>← click a tag to filter (coming soon)</span>
              </div>

              {/* Product list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {products.map((product, index) => (
                  <ProductRow
                    key={product.id}
                    product={product}
                    index={index}
                    onDragStart={i => { catalogueDragIdx.current = i }}
                    onDrop={handleCatalogueDrop}
                    onEdit={() => setEditingProduct(product)}
                    onToggle={async () => {
                      await fetch(`/api/inventory/${product.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ active: !product.active }) })
                      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, active: !p.active } : p))
                    }}
                  />
                ))}
              </div>

              {products.length === 0 && (
                <div style={{ textAlign: 'center', padding: 60, color: 'var(--muted)', fontSize: 14 }}>
                  No services yet — click "+ New service" to add one.
                </div>
              )}
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
                {partners.filter(p => p.status === 'active').length === 0 && <div style={{ padding: 32, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>No active partners yet.</div>}
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
            <TextArea label="Notes" name="notes" placeholder="Any notes…" />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <Btn variant="ghost" onClick={() => setShowNewLead(false)}>Cancel</Btn>
              <Btn type="submit">Create lead</Btn>
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
              <Field label="Institution type" name="institution" placeholder="University / Agency" />
              <Field label="Contact name" name="contact_name" placeholder="Ravi Kumar" />
              <Field label="Contact email" name="contact_email" type="email" placeholder="ravi@ukstudyhub.com" />
              <Field label="UTM code *" name="utm_code" required placeholder="ukstudyhub" />
              <Field label="Commission rate (%)" name="commission_rate" type="number" defaultValue="5" />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <Btn variant="ghost" onClick={() => setShowNewPartner(false)}>Cancel</Btn>
              <Btn type="submit">Create partner</Btn>
            </div>
          </form>
        </Modal>
      )}

      {/* ══ LEAD DETAIL MODAL ══ */}
      {selectedLead && (
        <Modal title={`${selectedLead.first_name} ${selectedLead.last_name ?? ''}`} onClose={() => setSelectedLead(null)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            {[['Email', selectedLead.email], ['Phone', selectedLead.phone], ['University', selectedLead.university], ['Country', selectedLead.country], ['Source', selectedLead.source], ['UTM', selectedLead.utm_source]].map(([label, val]) => val ? (
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
          <TextArea label="Notes" defaultValue={selectedLead.notes ?? ''} onBlur={e => updateLeadNotes(selectedLead.id, e.target.value)} placeholder="Add notes…" />
        </Modal>
      )}

      {/* ══ CATALOGUE EDITOR ══ */}
      {(editingProduct || showNewProduct) && (
        <CatalogueEditor
          product={editingProduct ?? blankProduct}
          isNew={!editingProduct}
          onClose={() => { setEditingProduct(null); setShowNewProduct(false) }}
          onSave={saved => { handleProductSaved(saved); setEditingProduct(null); setShowNewProduct(false) }}
        />
      )}

    </div>
  )
}