'use client'
import { useState, useRef } from 'react'
import Link from 'next/link'
import {
  Thermometer,
  Settings,
  Waves,
  Droplets,
  Wind,
  Activity,
  Bone,
  RotateCw,
  Ambulance,
  AlertTriangle,
  CheckCircle,
  Search,
  User,
  Calendar,
  FileText,
  ArrowRight,
  ShieldAlert,
  Flame,
  Dna,
  Eye,
  Clock
} from 'lucide-react'

const SYMPTOMS = [
  { en: 'Fever', hi: 'बुखार', icon: <Thermometer size={18} /> },
  { en: 'Headache', hi: 'सिरदर्द', icon: <Settings size={18} /> },
  { en: 'Vomiting', hi: 'उल्टी', icon: <Waves size={18} /> },
  { en: 'Diarrhea', hi: 'दस्त', icon: <Droplets size={18} /> },
  { en: 'Cough', hi: 'खांसी', icon: <Wind size={18} /> },
  { en: 'Breathing difficulty', hi: 'सांस लेने में तकलीफ', icon: <Activity size={18} /> },
  { en: 'Joint pain', hi: 'जोड़ों में दर्द', icon: <Bone size={18} /> },
  { en: 'Dizziness', hi: 'चक्कर आना', icon: <RotateCw size={18} /> },
  { en: 'Stomach pain', hi: 'पेट दर्द', icon: <Activity size={18} /> },
  { en: 'Skin rash', hi: 'चकत्ते / दाने', icon: <ShieldAlert size={18} /> },
  { en: 'Eye pain', hi: 'आंख में दर्द', icon: <Eye size={18} /> },
  { en: 'Fatigue', hi: 'बहुत थकान', icon: <Clock size={18} /> },
  { en: 'High fever 104°F+', hi: 'तेज बुखार 104°F+', icon: <Flame size={18} /> },
  { en: 'Body ache', hi: 'बदन दर्द', icon: <Dna size={18} /> },
  { en: 'Chills / Shivering', hi: 'कांपना / ठंड लगना', icon: <Wind size={18} /> },
  { en: 'Yellow eyes', hi: 'पीली आंखें', icon: <AlertTriangle size={18} color="#eab308" /> },
]

type Village = { displayName: string; lat: number; lng: number }

function UrgencyBadge({ urgency }: { urgency: string }) {
  const map: Record<string, { bg: string; color: string; border: string; label: string }> = {
    immediate: { bg: '#fef2f2', color: '#dc2626', border: '#fecaca', label: '🚨 Immediate' },
    same_day: { bg: '#fffbeb', color: '#d97706', border: '#fde68a', label: '⚠️ Same Day' },
    monitor: { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0', label: '✅ Monitor' },
  }
  const s = map[urgency] || map.monitor
  return (
    <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, borderRadius: 99, padding: '3px 12px', fontSize: '0.8rem', fontWeight: 700 }}>{s.label}</span>
  )
}

export default function ReportPage() {
  const [village, setVillage] = useState<Village | null>(null)
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Village[]>([])
  const [loadingSearch, setLoadingSearch] = useState(false)
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const debounce = useRef<any>(null)

  async function searchVillage(q: string) {
    setQuery(q)
    setSuggestions([])
    if (q.length < 3) return
    clearTimeout(debounce.current)
    debounce.current = setTimeout(async () => {
      setLoadingSearch(true)
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q + ', India')}&format=json&limit=6`,
          { headers: { 'User-Agent': 'VyadhiNet/2.0' } }
        )
        const data = await res.json()
        setSuggestions(data.map((r: any) => ({ displayName: r.display_name, lat: parseFloat(r.lat), lng: parseFloat(r.lon) })))
      } catch { /* ignore */ }
      setLoadingSearch(false)
    }, 350)
  }

  function selectVillage(v: Village) {
    setVillage(v)
    setQuery(v.displayName.split(',')[0])
    setSuggestions([])
  }

  function toggle(label: string) {
    setSelected(p => p.includes(label) ? p.filter(x => x !== label) : [...p, label])
  }

  async function submit() {
    if (!village || !age || selected.length === 0) {
      setError('Please fill in the village, age, and at least one symptom / कृपया गाँव, उम्र और कम से कम एक लक्षण अवश्य भरें ✋')
      return
    }
    setSubmitting(true); setError('')
    try {
      const parts = village.displayName.split(',')
      const raw_text = `Patient ${gender || 'unknown gender'}, age ${age}. Symptoms: ${selected.join(', ')}. ${notes ? 'ASHA notes: ' + notes : ''}`
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          village_name: parts[0]?.trim(),
          lat: village.lat,
          lng: village.lng,
          district: parts[1]?.trim() || '',
          state: parts[2]?.trim() || '',
          patient_age: parseInt(age),
          gender,
          symptoms: selected,
          raw_text,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Server error')
      setResult(data.report)
    } catch (e: any) { setError(e.message) }
    setSubmitting(false)
  }

  if (result) {
    const top = result.disease_candidates?.[0]
    return (
      <div style={{ minHeight: '100vh', background: '#f0fdf4', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem', fontFamily: 'Inter, system-ui, sans-serif' }}>
        <div style={{ background: 'white', borderRadius: 20, padding: '2rem', maxWidth: 440, width: '100%', boxShadow: '0 12px 48px rgba(22,163,74,0.15)', border: '1px solid #bbf7d0' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: 56, marginBottom: 8 }}>✅</div>
            <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: '#15803d' }}>Report Submitted! / रिपोर्ट सबमिट हो गई!</h2>
            <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: 4 }}>AI has analyzed the data — see below / AI ने विश्लेषण कर लिया है — नीचे देखें</p>
          </div>

          {top && (
            <div style={{ background: '#f0fdf4', borderRadius: 12, padding: '1.25rem', marginBottom: '1rem', border: '1px solid #bbf7d0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginBottom: 2 }}>AI DIAGNOSIS</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0f172a' }}>{top.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>ICD-10: {top.icd10_code}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: 2 }}>Confidence</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#15803d' }}>{((top.probability || 0) * 100).toFixed(0)}%</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div style={{ background: 'white', borderRadius: 8, padding: '0.625rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>SEVERITY</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: result.severity_score >= 4 ? '#dc2626' : result.severity_score >= 3 ? '#d97706' : '#16a34a' }}>{result.severity_score}/5</div>
                </div>
                <div style={{ background: 'white', borderRadius: 8, padding: '0.625rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>URGENCY</div>
                  <div style={{ marginTop: 4 }}><UrgencyBadge urgency={result.urgency} /></div>
                </div>
              </div>
            </div>
          )}

          {result.disease_candidates?.length > 1 && (
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: 6 }}>OTHER POSSIBILITIES</div>
              {result.disease_candidates.slice(1, 3).map((d: any) => (
                <div key={d.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: '#f8fafc', borderRadius: 8, marginBottom: 4, fontSize: '0.875rem' }}>
                  <span style={{ color: '#374151' }}>{d.name}</span>
                  <span style={{ color: '#64748b', fontWeight: 600 }}>{((d.probability || 0) * 100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          )}

          {result.red_flags?.length > 0 && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '0.875rem', marginBottom: '1rem' }}>
              <div style={{ fontWeight: 700, color: '#dc2626', fontSize: '0.875rem', marginBottom: 4 }}>🚨 Red Flags</div>
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                {result.red_flags.map((f: string) => <li key={f} style={{ color: '#dc2626', fontSize: '0.8125rem' }}>{f}</li>)}
              </ul>
            </div>
          )}

          {result.normalized_symptoms?.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: 6 }}>NORMALIZED SYMPTOMS</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {result.normalized_symptoms.map((s: string) => (
                  <span key={s} style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: 99, padding: '2px 10px', fontSize: '0.75rem', fontWeight: 600 }}>{s}</span>
                ))}
              </div>
            </div>
          )}

          <button onClick={() => { setResult(null); setSelected([]); setAge(''); setGender(''); setNotes(''); setVillage(null); setQuery('') }}
            style={{ width: '100%', background: '#16a34a', color: 'white', border: 'none', borderRadius: 10, padding: '0.875rem', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }}>
            + Fill New Report / नई रिपोर्ट भरें
          </button>
          <div style={{ textAlign: 'center', marginTop: 12 }}>
            <Link href="/dashboard" style={{ color: '#16a34a', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}>📡 View Dashboard / डैशबोर्ड देखें →</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #064e3b, #16a34a)', color: 'white', padding: '1.25rem 1rem' }}>
        <div style={{ maxWidth: 480, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontWeight: 900, fontSize: '1.375rem', margin: 0 }}>VyadhiNet</h1>
            <p style={{ color: '#bbf7d0', fontSize: '0.8125rem', marginTop: 2 }}>ASHA Worker Report Form / आशा वर्कर रिपोर्ट फॉर्म</p>
          </div>
          <Link href="/dashboard" style={{ textDecoration: 'none', background: 'rgba(255,255,255,0.18)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 8, padding: '7px 14px', fontSize: '0.8125rem', fontWeight: 600 }}>📡 Dashboard / डैशबोर्ड</Link>
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '1.25rem 1rem' }}>
        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '0.875rem', marginBottom: '1rem', color: '#dc2626', fontSize: '0.875rem', fontWeight: 500 }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Village Search */}
          <div style={{ background: 'white', borderRadius: 14, padding: '1.125rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>📍 Village / गाँव</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={query}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => searchVillage(e.target.value)}
                placeholder="Enter village name... / गाँव का नाम लिखें..."
                style={{ width: '100%', border: '2px solid #e2e8f0', borderRadius: 10, padding: '0.75rem 1rem', fontSize: '1rem', color: '#0f172a', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                onFocus={(e: React.FocusEvent<HTMLInputElement>) => (e.target.style.borderColor = '#16a34a')}
                onBlur={(e: React.FocusEvent<HTMLInputElement>) => (e.target.style.borderColor = '#e2e8f0')}
              />
              {loadingSearch && <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, border: '2px solid #e2e8f0', borderTopColor: '#16a34a', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />}
            </div>
            {suggestions.length > 0 && (
              <ul style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 10, marginTop: 4, boxShadow: '0 4px 16px rgba(0,0,0,0.1)', listStyle: 'none', padding: 0, maxHeight: 220, overflowY: 'auto' }}>
                {suggestions.map((s, i) => (
                  <li key={i} onClick={() => selectVillage(s)}
                    style={{ padding: '0.625rem 1rem', cursor: 'pointer', fontSize: '0.875rem', color: '#374151', borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f0fdf4')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'white')}>
                    📍 {s.displayName}
                  </li>
                ))}
              </ul>
            )}
            {village && <p style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: 6, fontWeight: 600 }}>✓ {village.displayName.split(',').slice(0, 3).join(',')}</p>}
          </div>

          {/* Age + Gender */}
          <div style={{ background: 'white', borderRadius: 14, padding: '1.125rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>🎂 Age / उम्र</label>
              <input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="Years / वर्ष"
                style={{ width: '100%', border: '2px solid #e2e8f0', borderRadius: 10, padding: '0.75rem 1rem', fontSize: '1rem', color: '#0f172a', outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => (e.target.style.borderColor = '#16a34a')}
                onBlur={e => (e.target.style.borderColor = '#e2e8f0')} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>👤 Gender / लिंग</label>
              <select value={gender} onChange={e => setGender(e.target.value)}
                style={{ width: '100%', border: '2px solid #e2e8f0', borderRadius: 10, padding: '0.75rem 1rem', fontSize: '1rem', color: '#0f172a', outline: 'none', boxSizing: 'border-box', background: 'white' }}
                onFocus={e => (e.target.style.borderColor = '#16a34a')}
                onBlur={e => (e.target.style.borderColor = '#e2e8f0')}>
                <option value="">Select / चुनें</option>
                <option value="male">Male / पुरुष</option>
                <option value="female">Female / महिला</option>
                <option value="other">Other / अन्य</option>
              </select>
            </div>
          </div>

          {/* Symptoms */}
          <div style={{ background: 'white', borderRadius: 14, padding: '1.125rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>🤒 Symptoms / लक्षण (Select all that apply / जो भी हों, सब चुनें)</label>
            <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.75rem' }}>{selected.length} selected</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              {SYMPTOMS.map(s => {
                const label = `${s.en}`
                const active = selected.includes(label)
                return (
                  <button key={label} type="button" onClick={() => toggle(label)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '0.75rem', borderRadius: 12, border: '1.5px solid',
                      borderColor: active ? '#16a34a' : '#e2e8f0',
                      background: active ? '#f0fdf4' : 'white',
                      color: active ? '#15803d' : '#475569',
                      textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s', outline: 'none'
                    }}>
                    <div style={{ color: active ? '#16a34a' : '#94a3b8' }}>{s.icon}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.8rem' }}>{s.hi}</div>
                      <div style={{ fontSize: '0.65rem', opacity: 0.7 }}>{s.en}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* ASHA Notes */}
          <div style={{ background: 'white', borderRadius: 14, padding: '1.125rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>📝 Notes / विवरण (optional/वैकल्पिक)</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any extra info... (since how many days, etc.) / कोई अतिरिक्त जानकारी... (कितने दिनों से है, आदि)" rows={3}
              style={{ width: '100%', border: '2px solid #e2e8f0', borderRadius: 10, padding: '0.75rem 1rem', fontSize: '0.9375rem', color: '#0f172a', outline: 'none', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit' }}
              onFocus={e => (e.target.style.borderColor = '#16a34a')}
              onBlur={e => (e.target.style.borderColor = '#e2e8f0')} />
          </div>

          {/* Submit */}
          <button onClick={submit} disabled={submitting}
            style={{ width: '100%', background: submitting ? '#86efac' : 'linear-gradient(135deg, #16a34a, #15803d)', color: 'white', borderRadius: 12, padding: '1rem', fontWeight: 800, fontSize: '1.0625rem', border: 'none', cursor: submitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: submitting ? 'none' : '0 4px 16px rgba(22,163,74,0.4)' }}>
            {submitting ? (
              <><div style={{ width: 18, height: 18, border: '3px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> AI is Analyzing... / AI विश्लेषण कर रहा है...</>
            ) : '🚀 Submit Report / रिपोर्ट सबमिट करें'}
          </button>

          <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8' }}>Reports securely stored in Supabase · AI powered by Groq LLaMA 3.3</p>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
