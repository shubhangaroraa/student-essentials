import Link from 'next/link'

export const metadata = {
  title: 'About Us — StudentEssentials',
  description: 'We help international students settle into UK life before they even land. Learn about our mission, team and values.',
}

export default function About() {
  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh' }}>

      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '0 5%', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(245,240,232,0.92)', backdropFilter: 'blur(12px)', borderBottom: '0.5px solid var(--border)' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 32, height: 32, background: 'var(--forest)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
              <path d="M10 2L3 6V10C3 13.5 6.5 17 10 18C13.5 17 17 13.5 17 10V6L10 2Z" fill="white"/>
              <path d="M7 10L9 12L13 8" stroke="#2e7d52" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--bottle)' }}>Student<span style={{ color: 'var(--forest)' }}>Essentials</span></span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <Link href="/services" style={{ fontSize: 14, color: 'var(--muted)', textDecoration: 'none' }}>Services</Link>
          <Link href="/about" style={{ fontSize: 14, color: 'var(--bottle)', fontWeight: 500, textDecoration: 'none' }}>About</Link>
          <Link href="/auth/login" style={{ fontSize: 14, color: 'var(--muted)', textDecoration: 'none' }}>Log in</Link>
          <Link href="/auth/signup" style={{ padding: '8px 20px', fontSize: 14, fontWeight: 500, color: '#fff', background: 'var(--forest)', borderRadius: 40, textDecoration: 'none' }}>Sign up free</Link>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ background: 'var(--bottle)', padding: '120px 8% 80px', marginTop: 0, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'rgba(46,125,82,0.25)', top: -150, right: -100, filter: 'blur(80px)', pointerEvents: 'none' }}></div>
        <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'rgba(107,191,138,0.1)', bottom: -80, left: 100, filter: 'blur(60px)', pointerEvents: 'none' }}></div>
        <div style={{ maxWidth: 720, position: 'relative', zIndex: 2 }}>
          <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--sage)', marginBottom: 16 }}>Our story</div>
          <h1 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 'clamp(36px,5vw,58px)', fontWeight: 500, color: '#fff', lineHeight: 1.1, marginBottom: 24 }}>
            We believe no student should<br/><em style={{ color: 'var(--sage)' }}>land unprepared.</em>
          </h1>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.6)', lineHeight: 1.8, maxWidth: 580 }}>
            StudentEssentials was born from a simple frustration — arriving in a new country with nowhere to sleep, no SIM card, and no idea where to start. We built the platform we wish had existed.
          </p>
        </div>
      </div>

      {/* MISSION */}
      <div style={{ padding: '80px 8%', background: 'var(--offwhite)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center', maxWidth: 1100, margin: '0 auto' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--forest)', marginBottom: 14 }}>Our mission</div>
            <h2 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 'clamp(28px,3vw,40px)', fontWeight: 500, color: 'var(--bottle)', lineHeight: 1.2, marginBottom: 20 }}>
              Make the first day in the UK feel like coming home.
            </h2>
            <p style={{ fontSize: 15, color: 'var(--muted)', lineHeight: 1.8, marginBottom: 16 }}>
              Every year, hundreds of thousands of international students arrive in the UK carrying too many bags and too much anxiety. They scramble to buy bedding, queue for SIM cards, and overpay for everything.
            </p>
            <p style={{ fontSize: 15, color: 'var(--muted)', lineHeight: 1.8, marginBottom: 16 }}>
              We partner with trusted UK suppliers to deliver everything students need — before they board the plane. One cart, one checkout, everything sorted.
            </p>
            <p style={{ fontSize: 15, color: 'var(--muted)', lineHeight: 1.8 }}>
              We also work with education agents worldwide, giving them the tools to support their students end-to-end and earn fairly for it.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { num: '7', label: 'Essential services', sub: 'in one place' },
              { num: '£0', label: 'Sign-up fee', sub: 'always free to join' },
              { num: '0.4%', label: 'Remittance fee', sub: 'lowest guaranteed' },
              { num: '48h', label: 'Pre-arrival', sub: 'setup time' },
            ].map(stat => (
              <div key={stat.label} style={{ background: 'var(--cream)', border: '0.5px solid var(--border)', borderRadius: 16, padding: '24px 20px' }}>
                <div style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 32, fontWeight: 500, color: 'var(--forest)', lineHeight: 1 }}>{stat.num}</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--bottle)', marginTop: 8 }}>{stat.label}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* VALUES */}
      <div style={{ padding: '80px 8%', background: 'var(--cream)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--forest)', marginBottom: 14 }}>What we stand for</div>
            <h2 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 'clamp(26px,3vw,38px)', fontWeight: 500, color: 'var(--bottle)' }}>Our values</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {[
              { icon: '🛡️', title: 'Trustworthy', body: 'Every partner and service is verified. Students are far from home — they deserve providers they can rely on completely.' },
              { icon: '⚡', title: 'Frictionless', body: 'One cart. One checkout. We obsess over removing every unnecessary step between a student and a settled life.' },
              { icon: '🌍', title: 'Inclusive', body: 'Built for students from India, Nigeria, Pakistan, China and everywhere in between. Every currency, every journey.' },
              { icon: '🌱', title: 'Grounded', body: 'Bottle green for a reason. We\'re calm, reliable, and rooted — not flashy. Students need steady, not showy.' },
              { icon: '💷', title: 'Fair value', body: 'Best rates on remittance, insurance and SIMs. Students shouldn\'t be exploited just because they\'re new to a country.' },
              { icon: '🎓', title: 'Student-first', body: 'Every feature, every word, every design decision is made for a 19-year-old landing alone. We never forget who we serve.' },
            ].map(v => (
              <div key={v.title} style={{ background: 'var(--offwhite)', border: '0.5px solid var(--border)', borderRadius: 16, padding: '28px 24px' }}>
                <div style={{ fontSize: 28, marginBottom: 14 }}>{v.icon}</div>
                <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--bottle)', marginBottom: 8 }}>{v.title}</div>
                <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7 }}>{v.body}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* WHO WE SERVE */}
      <div style={{ padding: '80px 8%', background: 'var(--bottle)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--sage)', marginBottom: 14 }}>Who we serve</div>
            <h2 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 'clamp(26px,3vw,38px)', fontWeight: 500, color: '#fff' }}>Built for two audiences</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {[
              {
                icon: '🎓',
                title: 'International Students',
                desc: 'You\'re about to start the biggest adventure of your life. We make sure you arrive in the UK with your room ready, your phone connected, and your first day sorted — so you can focus on what matters: your studies.',
                cta: 'Start building your pack',
                href: '/services',
              },
              {
                icon: '🏢',
                title: 'Education Agents',
                desc: 'You work hard to place students at great universities. We give you the tools to support them beyond enrolment — and earn a commission on every service they use. A better experience for your students, and a new revenue stream for you.',
                cta: 'Join as an agent',
                href: '/auth/signup',
              },
            ].map(card => (
              <div key={card.title} style={{ background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.12)', borderRadius: 20, padding: '36px 32px' }}>
                <div style={{ fontSize: 36, marginBottom: 16 }}>{card.icon}</div>
                <div style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 22, fontWeight: 500, color: '#fff', marginBottom: 12 }}>{card.title}</div>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, marginBottom: 28 }}>{card.desc}</p>
                <Link href={card.href} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 24px', background: 'var(--forest)', color: '#fff', borderRadius: 40, textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>
                  {card.cta} →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SERVICES STRIP */}
      <div style={{ padding: '80px 8%', background: 'var(--offwhite)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--forest)', marginBottom: 14 }}>What we offer</div>
          <h2 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 'clamp(26px,3vw,38px)', fontWeight: 500, color: 'var(--bottle)', marginBottom: 48 }}>7 services. One checkout.</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginBottom: 40 }}>
            {['🛏️ Bedding & Kitchen', '📱 SIM Cards', '✈️ Flight Tickets', '🛡️ Travel Insurance', '🏥 Health Insurance', '💸 Remittance', '🚗 Airport Transfers'].map(s => (
              <div key={s} style={{ padding: '10px 20px', background: 'var(--cream)', border: '0.5px solid var(--border)', borderRadius: 40, fontSize: 14, color: 'var(--bottle)', fontWeight: 500 }}>{s}</div>
            ))}
          </div>
          <Link href="/services" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 32px', background: 'var(--forest)', color: '#fff', borderRadius: 40, textDecoration: 'none', fontSize: 15, fontWeight: 500, boxShadow: '0 4px 20px rgba(46,125,82,0.3)' }}>
            Browse all services →
          </Link>
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: '80px 8%', background: 'var(--cream)', textAlign: 'center' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 'clamp(26px,3vw,38px)', fontWeight: 500, color: 'var(--bottle)', marginBottom: 16 }}>
            Ready to land prepared?
          </h2>
          <p style={{ fontSize: 16, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 36 }}>
            Join thousands of international students who sorted their UK life before they boarded the plane.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/auth/signup" style={{ padding: '14px 32px', fontSize: 15, fontWeight: 500, color: '#fff', background: 'var(--forest)', borderRadius: 40, textDecoration: 'none', boxShadow: '0 4px 20px rgba(46,125,82,0.3)' }}>
              Create free account →
            </Link>
            <Link href="/services" style={{ padding: '14px 32px', fontSize: 15, color: 'var(--bottle)', border: '0.5px solid rgba(26,58,42,0.3)', borderRadius: 40, textDecoration: 'none' }}>
              View services
            </Link>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ background: 'var(--bottle)', padding: '48px 8% 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 32, marginBottom: 40 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 500, color: '#fff', marginBottom: 10 }}>Student<span style={{ color: 'var(--sage)' }}>Essentials</span></div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', maxWidth: 240, lineHeight: 1.7 }}>Supporting international students with essential services for a smooth transition to UK life.</p>
            <div style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 14, fontStyle: 'italic', color: 'var(--sage)', marginTop: 12 }}>"Pack Smart. Land Ready."</div>
          </div>
          <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap' }}>
            {[
              { title: 'Services', links: ['Bedding & Kitchen', 'SIM Cards', 'Flights', 'Insurance', 'Remittance', 'Transfers'] },
              { title: 'Company', links: ['About Us', 'For Agents', 'Contact'] },
              { title: 'Legal', links: ['Privacy Policy', 'Terms', 'Cookies'] },
            ].map(col => (
              <div key={col.title}>
                <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 14 }}>{col.title}</div>
                {col.links.map(l => <div key={l} style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginBottom: 8 }}>{l}</div>)}
              </div>
            ))}
          </div>
        </div>
        <div style={{ paddingTop: 20, borderTop: '0.5px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>© 2026 StudentEssentials. All rights reserved.</p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>student-essentials.com</p>
        </div>
      </footer>

    </div>
  )
}