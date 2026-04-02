import Link from 'next/link'

const stats = [
  { label: 'ASHA Workers', value: '6.4L+', icon: '👩‍⚕️' },
  { label: 'Villages Covered', value: '6L+', icon: '🏘️' },
  { label: 'Live APIs', value: '5', icon: '⚡' },
  { label: 'Hardcoded Data', value: 'Zero', icon: '✅' },
]

const features = [
  {
    icon: '🗺️',
    title: 'Real Village Search',
    desc: 'OpenStreetMap Nominatim locates any of 6 lakh+ Indian villages with exact lat/lng coordinates.',
    tag: 'Nominatim OSM',
  },
  {
    icon: '🤖',
    title: 'AI Disease Classification',
    desc: 'Groq (LLaMA 3.3 70B) converts Hinglish symptom text to ICD-10 coded diagnoses with severity scores.',
    tag: 'AI + NLP',
  },
  {
    icon: '📡',
    title: 'WHO/IDSP Outbreak Detection',
    desc: 'Cluster analysis over 7-day rolling window. Fires RED/AMBER alerts against WHO & IDSP threshold tables.',
    tag: 'Epidemiology',
  },
  {
    icon: '🌡️',
    title: 'Weather Correlation',
    desc: 'Open-Meteo rainfall & temperature overlays on dashboards — dengue/malaria risk rises in rain season.',
    tag: 'Open-Meteo',
  },
  {
    icon: '🏥',
    title: 'PHC Routing',
    desc: 'Overpass API delivers real hospital & clinic coordinates. Alerts routed to nearest Primary Health Centre.',
    tag: 'Overpass API',
  },
  {
    icon: '📊',
    title: 'Live Disease Baseline',
    desc: 'data.gov.in historical district-wise case counts give AI real epidemiological context for predictions.',
    tag: 'Govt of India',
  },
]

const workflow = [
  { step: '1', label: 'ASHA submits report', desc: 'Village + age + symptoms via mobile form' },
  { step: '2', label: 'AI classifies', desc: 'Groq returns disease candidates, ICD-10 codes, severity' },
  { step: '3', label: 'Outbreak check', desc: 'WHO/IDSP threshold scan over last 7 days' },
  { step: '4', label: 'Alert fires', desc: 'RED/AMBER alert saved; dashboard updates live' },
  { step: '5', label: 'PHC notified', desc: 'Nearest Primary Health Centre gets routing info' },
]

export default function HomePage() {
  return (
    <div style={{ fontFamily: 'var(--font-inter, Inter, system-ui, sans-serif)', background: '#f8fafc', minHeight: '100vh' }}>

      {/* NAV */}
      <nav style={{ background: 'white', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1140, margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #16a34a 0%, #0d9488 100%)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: 14 }}>V</div>
            <span style={{ fontWeight: 800, fontSize: '1.125rem', color: '#0f172a' }}>VyadhiNet</span>
            <span style={{ fontSize: '0.7rem', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: 99, padding: '2px 8px', fontWeight: 700 }}>v2.0</span>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <Link href="/report" style={{ textDecoration: 'none', background: '#f0fdf4', color: '#16a34a', border: '1.5px solid #bbf7d0', borderRadius: 8, padding: '7px 16px', fontWeight: 600, fontSize: '0.875rem', transition: 'all 0.2s' }}>
              📋 Report Bharo
            </Link>
            <Link href="/dashboard" style={{ textDecoration: 'none', background: '#16a34a', color: 'white', borderRadius: 8, padding: '7px 16px', fontWeight: 600, fontSize: '0.875rem', boxShadow: '0 2px 8px rgba(22,163,74,0.35)' }}>
              📡 Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ background: 'linear-gradient(135deg, #064e3b 0%, #15803d 45%, #0d9488 100%)', padding: '80px 1.5rem 100px', color: 'white', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* Background texture */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.04) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.06) 0%, transparent 40%)' }} />
        <div style={{ maxWidth: 760, margin: '0 auto', position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', borderRadius: 99, padding: '6px 16px', marginBottom: 24, fontSize: '0.8125rem', fontWeight: 600, border: '1px solid rgba(255,255,255,0.2)' }}>
            <span style={{ width: 8, height: 8, background: '#4ade80', borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 0 3px rgba(74,222,128,0.3)' }} />
            Real-Time AI Surveillance · 5 Live APIs · Zero Mock Data
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: 20, letterSpacing: '-0.02em' }}>
            VyadhiNet
          </h1>
          <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.375rem)', opacity: 0.9, marginBottom: 12, fontWeight: 500 }}>
            AI-Powered Communicable Disease Outbreak Detection
          </p>
          <p style={{ fontSize: '1.0625rem', opacity: 0.75, marginBottom: 40, maxWidth: 560, margin: '0 auto 40px' }}>
            Empowering 6.4 lakh+ ASHA workers to submit real-time reports — AI detects clusters, routes alerts to PHCs, predicts spread before it happens.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/report" style={{ textDecoration: 'none', background: 'white', color: '#15803d', borderRadius: 12, padding: '14px 32px', fontWeight: 700, fontSize: '1rem', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: 8 }}>
              📋 ASHA Report Bharo
            </Link>
            <Link href="/dashboard" style={{ textDecoration: 'none', background: 'rgba(255,255,255,0.15)', color: 'white', borderRadius: 12, padding: '14px 32px', fontWeight: 700, fontSize: '1rem', border: '1.5px solid rgba(255,255,255,0.35)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', gap: 8 }}>
              📡 District Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section style={{ background: 'white', borderBottom: '1px solid #e2e8f0', padding: '1.5rem' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
          {stats.map(s => (
            <div key={s.label} style={{ textAlign: 'center', padding: '1rem' }}>
              <div style={{ fontSize: 28, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#15803d', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 500, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: '80px 1.5rem', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#16a34a', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Complete Workflow</span>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 800, color: '#0f172a', marginTop: 8 }}>How VyadhiNet Works</h2>
          <p style={{ color: '#64748b', marginTop: 10, maxWidth: 520, margin: '10px auto 0' }}>From an ASHA worker's phone to a district officer's dashboard in seconds.</p>
        </div>
        <div style={{ display: 'flex', gap: '0', overflowX: 'auto', paddingBottom: 12 }}>
          {workflow.map((w, i) => (
            <div key={w.step} style={{ display: 'flex', alignItems: 'stretch', flex: 1, minWidth: 160 }}>
              <div style={{ flex: 1, background: 'white', border: '1px solid #e2e8f0', borderRadius: i === 0 ? '12px 0 0 12px' : i === workflow.length - 1 ? '0 12px 12px 0' : 0, padding: '1.5rem', borderLeft: i > 0 ? 'none' : undefined, position: 'relative' }}>
                <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #16a34a, #0d9488)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: 14, marginBottom: 12 }}>{w.step}</div>
                <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#0f172a', marginBottom: 4 }}>{w.label}</div>
                <div style={{ fontSize: '0.8125rem', color: '#64748b', lineHeight: 1.5 }}>{w.desc}</div>
                {i < workflow.length - 1 && (
                  <div style={{ position: 'absolute', right: -12, top: '50%', transform: 'translateY(-50%)', width: 24, height: 24, background: '#16a34a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, fontWeight: 700, zIndex: 2 }}>›</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES GRID */}
      <section style={{ background: 'white', padding: '80px 1.5rem', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#16a34a', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Real Data. Zero Mock.</span>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 800, color: '#0f172a', marginTop: 8 }}>5 Live Public APIs Power Every Feature</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
            {features.map(f => (
              <div key={f.title} style={{ border: '1px solid #e2e8f0', borderRadius: 14, padding: '1.5rem', background: '#fafafa', transition: 'all 0.2s', cursor: 'default' }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(22,163,74,0.12)'; (e.currentTarget as HTMLDivElement).style.borderColor = '#bbf7d0'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = ''; (e.currentTarget as HTMLDivElement).style.borderColor = '#e2e8f0'; }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{f.icon}</div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                  <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>{f.title}</h3>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: 99, padding: '2px 8px', whiteSpace: 'nowrap', flexShrink: 0 }}>{f.tag}</span>
                </div>
                <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* API TABLE */}
      <section style={{ padding: '80px 1.5rem', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 style={{ fontSize: 'clamp(1.4rem, 2.5vw, 2rem)', fontWeight: 800, color: '#0f172a' }}>Real-World Data Architecture</h2>
          <p style={{ color: '#64748b', marginTop: 8 }}>Every data point comes from a live API or real user submission.</p>
        </div>
        <div style={{ overflowX: 'auto', borderRadius: 14, border: '1px solid #e2e8f0', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(90deg, #064e3b, #15803d)', color: 'white' }}>
                {['API / Source', 'Provider', 'What It Returns', 'Used For'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, fontSize: '0.8125rem', letterSpacing: '0.04em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['data.gov.in', 'NIC / MoHFW', 'District-wise disease case counts (dengue, malaria, TB, cholera)', 'Baseline disease burden overlay on dashboard'],
                ['Nominatim (OSM)', 'OpenStreetMap Foundation', 'Lat/lng, district boundaries for any Indian village', 'Place villages on Leaflet map with real coordinates'],
                ['Overpass API', 'OpenStreetMap Foundation', 'Real PHC, hospital, clinic locations in any district', 'Nearest PHC routing for alerts'],
                ['Open-Meteo', 'Open-Meteo', 'Real-time rainfall, temperature, humidity', 'Weather overlay for vector disease risk (dengue/malaria)'],
                ['IDSP Scraper', 'NCDC India', 'Weekly P/L/S outbreak reports nationally', 'Active outbreak feed, alert baseline'],
              ].map((row, i) => (
                <tr key={i} style={{ borderTop: '1px solid #f1f5f9', background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                  {row.map((cell, j) => (
                    <td key={j} style={{ padding: '12px 16px', color: j === 0 ? '#15803d' : '#374151', fontWeight: j === 0 ? 700 : 400, lineHeight: 1.5 }}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'linear-gradient(135deg, #064e3b 0%, #15803d 100%)', padding: '80px 1.5rem', textAlign: 'center', color: 'white' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 900, marginBottom: 16 }}>Start Protecting Rural India Today</h2>
          <p style={{ opacity: 0.85, marginBottom: 40, fontSize: '1.0625rem', lineHeight: 1.7 }}>ASHA workers submit real symptom reports. AI classifies, detects outbreaks, and alerts district health officers — automatically.</p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/report" style={{ textDecoration: 'none', background: 'white', color: '#15803d', borderRadius: 12, padding: '14px 32px', fontWeight: 700, fontSize: '1rem' }}>
              📋 Submit a Report
            </Link>
            <Link href="/dashboard" style={{ textDecoration: 'none', background: 'rgba(255,255,255,0.18)', color: 'white', borderRadius: 12, padding: '14px 32px', fontWeight: 700, fontSize: '1rem', border: '1.5px solid rgba(255,255,255,0.35)' }}>
              📡 View Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#0f172a', color: '#94a3b8', padding: '24px 1.5rem', textAlign: 'center' }}>
        <p style={{ fontSize: '0.8125rem' }}>
          <strong style={{ color: '#f1f5f9' }}>VyadhiNet v2.0</strong> · CODECURE, SPIRIT 2026 · IIT (BHU) Varanasi ·
          Built with 5 live APIs &amp; zero mock data
        </p>
      </footer>
    </div>
  )
}
