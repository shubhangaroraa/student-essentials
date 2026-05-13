import Link from 'next/link'

export default function Home() {
  return (
    <main>
      {/* NAV */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '0 5%', height: '64px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(245,240,232,0.85)', backdropFilter: 'blur(12px)',
        borderBottom: '0.5px solid var(--border)'
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{ width: 32, height: 32, background: 'var(--forest)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
              <path d="M10 2L3 6V10C3 13.5 6.5 17 10 18C13.5 17 17 13.5 17 10V6L10 2Z" fill="white"/>
              <path d="M7 10L9 12L13 8" stroke="#2e7d52" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--bottle)' }}>
            Student<span style={{ color: 'var(--forest)' }}>Essentials</span>
          </span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link href="/auth/login" style={{ padding: '8px 18px', fontSize: 14, color: 'var(--bottle)', background: 'transparent', border: '0.5px solid rgba(26,58,42,.3)', borderRadius: 40, textDecoration: 'none' }}>
            Log in
          </Link>
          <Link href="/auth/signup" style={{ padding: '8px 20px', fontSize: 14, fontWeight: 500, color: '#fff', background: 'var(--forest)', borderRadius: 40, textDecoration: 'none' }}>
            Sign up free
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{
        minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr', paddingTop: 64
      }}>
        <div style={{ padding: '80px 5% 80px 8%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--mint)', border: '0.5px solid rgba(46,125,82,.3)', borderRadius: 40, padding: '5px 14px 5px 8px', fontSize: 12, fontWeight: 500, color: 'var(--forest)', marginBottom: 28, width: 'fit-content' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--sage)' }}></div>
            Start your UK journey today
          </div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(42px,5vw,62px)', fontWeight: 500, lineHeight: 1.1, color: 'var(--bottle)', marginBottom: 10 }}>
            Pack Smart.
          </h1>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(42px,5vw,62px)', fontWeight: 400, fontStyle: 'italic', color: 'var(--forest)', marginBottom: 0 }}>
            Land Ready.
          </h1>
          <p style={{ fontSize: 16, fontWeight: 300, lineHeight: 1.7, color: 'var(--muted)', maxWidth: 420, margin: '24px 0 40px' }}>
            Essential services for international students heading to the UK. Bedding, SIM cards, airport transfers and more — one cart, one checkout.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Link href="/services" style={{ padding: '14px 30px', fontSize: 15, fontWeight: 500, color: '#fff', background: 'var(--forest)', borderRadius: 40, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 20px rgba(46,125,82,0.3)' }}>
              Explore services →
            </Link>
            <Link href="/auth/signup" style={{ fontSize: 14, color: 'var(--muted)', textDecoration: 'none' }}>
              Create free account
            </Link>
          </div>
          <div style={{ display: 'flex', gap: 32, marginTop: 56, paddingTop: 32, borderTop: '0.5px solid var(--border)' }}>
            {[['7', 'Essential services'], ['£0', 'Sign-up fee'], ['48hr', 'Pre-arrival setup']].map(([num, label]) => (
              <div key={label}>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: 28, fontWeight: 500, color: 'var(--bottle)' }}>{num}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: 'var(--bottle)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 70% 30%, rgba(46,125,82,0.4) 0%, transparent 60%)' }}></div>
          <div style={{ position: 'relative', zIndex: 2, width: 300 }}>
            {[
              { icon: '🛏️', name: 'Bedding & Kitchen Pack', desc: 'Delivered to your accommodation', price: '£89' },
              { icon: '📱', name: 'UK SIM Card', desc: 'Unlimited data, 6 months', price: '£14' },
              { icon: '🚗', name: 'Airport Transfer', desc: 'Heathrow → Your university', price: '£45' },
              { icon: '🛡️', name: 'Travel Insurance', desc: 'Full year coverage', price: '£32' },
              { icon: '💸', name: 'Remittance', desc: '0.4% — lowest rate guaranteed', price: 'Free' },
            ].map((item) => (
              <div key={item.name} style={{ background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.12)', borderRadius: 16, padding: '16px 20px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(107,191,138,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{item.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#fff' }}>{item.name}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{item.desc}</div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--sage)' }}>{item.price}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <div style={{ background: 'var(--bottle)', padding: '18px 8%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 48, flexWrap: 'wrap' }}>
        {['Google & Apple sign-in', 'No hidden fees', 'Delivered before you land', 'UK-regulated partners'].map((item) => (
          <div key={item} style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: 'var(--sage)' }}>✓</span> {item}
          </div>
        ))}
      </div>

      {/* SERVICES SECTION */}
      <section style={{ padding: '96px 8%', background: 'var(--offwhite)' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--forest)', marginBottom: 14 }}>What we offer</div>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(28px,3.5vw,42px)', fontWeight: 500, color: 'var(--bottle)' }}>Everything. In one place.</h2>
          <p style={{ fontSize: 16, color: 'var(--muted)', marginTop: 14, maxWidth: 480, margin: '14px auto 0' }}>Build your personalised pre-departure pack. Add only what you need, check out once.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', gap: 16 }}>
          {[
            { icon: '🛏️', name: 'Bedding & Kitchen', desc: 'Duvets, pillows, pots, cutlery — waiting in your room on arrival day.' },
            { icon: '📱', name: 'SIM Cards', desc: 'UK number with generous data. Activated before you board.' },
            { icon: '✈️', name: 'Flight Tickets', desc: 'Best fares from India, Nigeria, Pakistan, China and beyond.' },
            { icon: '🛡️', name: 'Travel Insurance', desc: 'Comprehensive cover for your journey and first year in the UK.' },
            { icon: '🏥', name: 'Health Insurance', desc: 'Top-up cover for international students alongside the NHS.' },
            { icon: '💸', name: 'Foreign Remittance', desc: 'Send money to the UK at the lowest guaranteed exchange rate.' },
            { icon: '🚗', name: 'Airport Transfers', desc: 'Pre-booked ride from any UK airport directly to your accommodation.' },
          ].map((s) => (
            <div key={s.name} style={{ background: 'var(--cream)', border: '0.5px solid var(--border)', borderRadius: 16, padding: '28px 24px', cursor: 'pointer' }}>
              <span style={{ fontSize: 28, marginBottom: 16, display: 'block' }}>{s.icon}</span>
              <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--bottle)', marginBottom: 6 }}>{s.name}</div>
              <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>{s.desc}</div>
              <div style={{ marginTop: 20, fontSize: 12, fontWeight: 500, color: 'var(--forest)' }}>Add to pack →</div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: 'var(--bottle)', padding: '56px 8% 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 32, marginBottom: 48 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 500, color: '#fff', marginBottom: 14 }}>Student<span style={{ color: 'var(--sage)' }}>Essentials</span></div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', maxWidth: 260, lineHeight: 1.7 }}>Supporting international students with essential services for a smooth transition to life in the UK.</p>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: 15, fontStyle: 'italic', color: 'var(--sage)', marginTop: 16 }}>"Pack Smart. Land Ready."</div>
          </div>
          <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap' }}>
            {[
              { title: 'Services', links: ['Bedding & Kitchen', 'SIM Cards', 'Flights', 'Insurance', 'Remittance', 'Transfers'] },
              { title: 'Company', links: ['About', 'For Agents', 'Blog', 'Contact'] },
              { title: 'Legal', links: ['Privacy Policy', 'Terms', 'Cookies'] },
            ].map((col) => (
              <div key={col.title}>
                <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 16 }}>{col.title}</div>
                {col.links.map((l) => (
                  <div key={l} style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 10 }}>{l}</div>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div style={{ paddingTop: 24, borderTop: '0.5px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between' }}>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>© 2026 StudentEssentials. All rights reserved.</p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>student-essentials.com</p>
        </div>
      </footer>
    </main>
  )
}