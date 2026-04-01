'use client'
import { useState } from 'react'
import VillageSearch from '../components/VillageSearch'

const SYMPTOMS = [
  'Bukhaar (Fever)', 'Sar dard (Headache)', 'Ulti (Vomiting)',
  'Dast (Diarrhea)', 'Khansi (Cough)', 'Sans lene mein takleef (Breathing difficulty)',
  'Jodo mein dard (Joint pain)', 'Chakkar (Dizziness)', 'Pet dard (Stomach pain)',
  'Skin rash', 'Aankhon mein dard (Eye pain)', 'Thakaan (Fatigue)'
]

export default function ReportPage() {
  const [village, setVillage] = useState<any>(null)
  const [age, setAge] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string>('')

  function toggleSymptom(s: string) {
    setSelected(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  }

  async function submit() {
    if (!village || !age || selected.length === 0) {
      alert('Village, age aur kam se kam ek symptom bharein')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const raw_text = `Patient age ${age}. Symptoms: ${selected.join(', ')}`
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          village_name: village.displayName.split(',')[0],
          lat: village.lat,
          lng: village.lng,
          district: village.displayName.split(',')[1]?.trim() || '',
          state: village.displayName.split(',')[2]?.trim() || '',
          patient_age: parseInt(age),
          symptoms: selected,
          raw_text
        })
      })
      const text = await res.text()
      const data = JSON.parse(text)
      setResult(data.report)
    } catch(e: any) {
      setError(e.message)
    }
    setSubmitting(false)
  }

  if (result) return (
    <div style={{minHeight:'100vh',background:'#f0fdf4',display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem'}}>
      <div style={{background:'white',borderRadius:'1rem',padding:'1.5rem',maxWidth:'400px',width:'100%',boxShadow:'0 4px 20px rgba(0,0,0,0.1)'}}>
        <div style={{fontSize:'3rem',textAlign:'center',marginBottom:'1rem'}}>✅</div>
        <h2 style={{fontSize:'1.25rem',fontWeight:'700',textAlign:'center',color:'#15803d',marginBottom:'1rem'}}>Report Submit Ho Gayi!</h2>
        <div style={{background:'#f9fafb',borderRadius:'0.5rem',padding:'1rem',marginBottom:'1rem'}}>
          <p style={{color:'#111827',marginBottom:'6px'}}><strong>AI Diagnosis:</strong> {result.disease_candidates?.[0]?.name || 'Analyzing...'}</p>
          <p style={{color:'#111827',marginBottom:'6px'}}><strong>Confidence:</strong> {((result.disease_candidates?.[0]?.probability || 0) * 100).toFixed(0)}%</p>
          <p style={{color:'#111827',marginBottom:'6px'}}><strong>Severity:</strong> {result.severity_score}/5</p>
          <p style={{color:'#111827',marginBottom:'6px'}}><strong>Urgency:</strong> {result.urgency}</p>
          {result.red_flags?.length > 0 && (
            <p style={{color:'#dc2626',fontWeight:'600'}}>Red Flags: {result.red_flags.join(', ')}</p>
          )}
        </div>
        <button onClick={() => setResult(null)} style={{width:'100%',background:'#16a34a',color:'white',borderRadius:'0.5rem',padding:'0.75rem',fontWeight:'600',border:'none',cursor:'pointer',fontSize:'1rem'}}>
          Nayi Report Bharein
        </button>
      </div>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'#f3f4f6',padding:'1rem'}}>
      <div style={{maxWidth:'420px',margin:'0 auto'}}>
        <div style={{background:'#16a34a',color:'white',borderRadius:'1rem',padding:'1.25rem',marginBottom:'1.5rem'}}>
          <h1 style={{fontSize:'1.25rem',fontWeight:'700',margin:0}}>VyadhiNet</h1>
          <p style={{color:'#bbf7d0',fontSize:'0.875rem',margin:'4px 0 0'}}>ASHA Worker Report Form</p>
        </div>

        {error && (
          <div style={{background:'#fef2f2',border:'1px solid #fecaca',borderRadius:'0.75rem',padding:'0.75rem',marginBottom:'1rem',color:'#dc2626',fontSize:'0.875rem'}}>
            Error: {error}
          </div>
        )}

        <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
          <div style={{background:'white',borderRadius:'0.75rem',padding:'1rem',border:'1px solid #d1d5db'}}>
            <label style={{display:'block',fontSize:'0.875rem',fontWeight:'700',color:'#111827',marginBottom:'0.5rem'}}>Village / Gaon</label>
            <VillageSearch onSelect={setVillage} />
            {village && <p style={{fontSize:'0.75rem',color:'#16a34a',marginTop:'0.5rem',fontWeight:'600'}}>✓ {village.displayName.split(',')[0]}</p>}
          </div>

          <div style={{background:'white',borderRadius:'0.75rem',padding:'1rem',border:'1px solid #d1d5db'}}>
            <label style={{display:'block',fontSize:'0.875rem',fontWeight:'700',color:'#111827',marginBottom:'0.5rem'}}>Patient Ki Umar (Age)</label>
            <input
              type="number"
              value={age}
              onChange={e => setAge(e.target.value)}
              placeholder="Age in years"
              style={{width:'100%',border:'2px solid #d1d5db',borderRadius:'0.5rem',padding:'0.75rem',fontSize:'1rem',color:'#111827',outline:'none',boxSizing:'border-box'}}
            />
          </div>

          <div style={{background:'white',borderRadius:'0.75rem',padding:'1rem',border:'1px solid #d1d5db'}}>
            <label style={{display:'block',fontSize:'0.875rem',fontWeight:'700',color:'#111827',marginBottom:'0.75rem'}}>Symptoms (jo bhi ho select karein)</label>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.5rem'}}>
              {SYMPTOMS.map(s => (
                <button
                  key={s}
                  onClick={() => toggleSymptom(s)}
                  style={{
                    fontSize:'0.75rem',
                    padding:'0.5rem',
                    borderRadius:'0.5rem',
                    border: selected.includes(s) ? '2px solid #16a34a' : '2px solid #d1d5db',
                    background: selected.includes(s) ? '#16a34a' : 'white',
                    color: selected.includes(s) ? 'white' : '#111827',
                    textAlign:'left',
                    cursor:'pointer',
                    fontWeight:'500',
                    lineHeight:'1.3'
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={submit}
            disabled={submitting}
            style={{width:'100%',background:submitting?'#86efac':'#16a34a',color:'white',borderRadius:'0.75rem',padding:'1rem',fontWeight:'700',fontSize:'1.125rem',border:'none',cursor:submitting?'not-allowed':'pointer'}}
          >
            {submitting ? 'AI Analyze Kar Raha Hai...' : 'Report Submit Karein'}
          </button>
        </div>
      </div>
    </div>
  )
}
