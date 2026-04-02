'use client'
import { useEffect, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import DiseasePieChart from './DiseasePieChart'
import AlertFeed from './AlertFeed'
import TrendChart from './TrendChart'
import PredictionPanel from './PredictionPanel'
import { 
  LayoutDashboard, 
  Map as MapIcon, 
  AlertCircle, 
  AlertTriangle, 
  Users, 
  FileText, 
  RefreshCw, 
  Plus,
  TrendingUp,
  BarChart3,
  Building2,
  History,
  Activity,
  MapPin
} from 'lucide-react'

// Dynamic import for Leaflet (SSR disabled)
const OutbreakMap = dynamic(() => import('./OutbreakMap'), { ssr: false, loading: () => (
  <div style={{ height: 480, background: '#f1f5f9', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '0.9rem' }}>
    🗺️ Loading map...
  </div>
) })

interface Stats {
  totalReports: number
  activeAlerts: number
  affectedVillages: number
  diseaseCounts: Record<string, number>
  districtStats: { district: string; reports: number; diseases: string[] }[]
}

interface Report {
  id: string
  village_name: string
  lat: number
  lng: number
  disease_ai_guess?: string
  patient_age: number
  gender: string
  severity_score: number
  submitted_at: string
}

interface Alert {
  risk_level: 'RED' | 'AMBER'
  disease: string
  district: string
  state?: string
  center_lat: number
  center_lng: number
  case_count: number
  village_name: string
  weather_risk?: string
  threshold_source?: string
}

export default function DashboardPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [alerts, setAlerts]   = useState<Alert[]>([])
  const [stats, setStats]     = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [triggering, setTriggering] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Fetch failed')
      setReports(data.reports || [])
      setAlerts(data.alerts || [])
      setStats(data.stats || null)
      setLastUpdated(new Date())
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000) // refresh every 30s
    return () => clearInterval(interval)
  }, [fetchData])

  async function triggerDetection() {
    setTriggering(true)
    try {
      const res = await fetch('/api/dashboard', { method: 'POST' })
      const data = await res.json()
      if (data.success) await fetchData()
    } catch { /* ignore */ }
    setTriggering(false)
  }

  const redAlerts  = alerts.filter(a => a.risk_level === 'RED')
  const amberAlerts = alerts.filter(a => a.risk_level === 'AMBER')

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* TOP NAV */}
      <nav style={{ background: 'linear-gradient(90deg, #064e3b, #15803d)', color: 'white', padding: '0 1.5rem', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/" style={{ textDecoration: 'none', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <LayoutDashboard size={20} />
              <span style={{ fontWeight: 800, fontSize: '1.0625rem' }}>VyadhiNet</span>
            </div>
          </Link>
          <span style={{ opacity: 0.5 }}>/</span>
          <span style={{ fontWeight: 600, opacity: 0.9 }}>District Officer Dashboard</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.15)', borderRadius: 99, padding: '3px 10px', fontSize: '0.75rem' }}>
            <span style={{ width: 7, height: 7, background: '#4ade80', borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 0 3px rgba(74,222,128,0.25)' }} />
            LIVE
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {lastUpdated && (
            <span style={{ opacity: 0.65, fontSize: '0.75rem' }}>Updated {lastUpdated.toLocaleTimeString()}</span>
          )}
          <button onClick={triggerDetection} disabled={triggering}
            style={{ background: 'rgba(255,255,255,0.18)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 8, padding: '6px 14px', fontWeight: 600, fontSize: '0.8125rem', cursor: triggering ? 'wait' : 'pointer' }}>
            {triggering ? '⏳' : '🔄'} Run Detection
          </button>
          <Link href="/report" style={{ textDecoration: 'none', background: 'white', color: '#15803d', borderRadius: 8, padding: '6px 14px', fontWeight: 700, fontSize: '0.8125rem' }}>+ Report</Link>
        </div>
      </nav>

      <div style={{ maxWidth: 1320, margin: '0 auto', padding: '1.5rem' }}>

        {/* ERROR */}
        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '0.875rem 1rem', marginBottom: '1rem', color: '#dc2626', fontSize: '0.875rem' }}>
            ⚠️ {error} — <button onClick={fetchData} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', textDecoration: 'underline' }}>Retry</button>
          </div>
        )}

        {/* STATS ROW */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'Reports (30d)', value: loading ? '—' : stats?.totalReports ?? 0, icon: <FileText size={22} />, color: '#1d4ed8', bg: '#eff6ff' },
            { label: 'Active RED Alerts', value: loading ? '—' : redAlerts.length, icon: <AlertCircle size={22} />, color: '#dc2626', bg: '#fef2f2' },
            { label: 'AMBER Warnings', value: loading ? '—' : amberAlerts.length, icon: <AlertTriangle size={22} />, color: '#d97706', bg: '#fffbeb' },
            { label: 'Villages at Risk', value: loading ? '—' : stats?.affectedVillages ?? 0, icon: <Users size={22} />, color: '#16a34a', bg: '#f0fdf4' },
          ].map(s => (
            <div key={s.label} style={{ background: 'white', borderRadius: 14, padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginBottom: 4 }}>{s.label.toUpperCase()}</div>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: s.color, lineHeight: 1 }}>
                    {loading ? <div style={{ width: 60, height: 32, background: '#f1f5f9', borderRadius: 6, animation: 'shimmer 1.4s infinite' }} /> : s.value}
                  </div>
                </div>
                <div style={{ width: 44, height: 44, background: s.bg, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{s.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* MAIN GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.25rem', alignItems: 'start' }}>

          {/* LEFT: MAP + CHARTS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* MAP */}
            <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MapIcon size={18} /> Live Outbreak Map
                </h2>
                <div style={{ display: 'flex', gap: 10, fontSize: '0.75rem', fontWeight: 600 }}>
                  <span style={{ color: '#dc2626' }}>● RED</span>
                  <span style={{ color: '#d97706' }}>● AMBER</span>
                  <span style={{ color: '#1d4ed8' }}>🏥 PHC</span>
                </div>
              </div>
              {!loading && <OutbreakMap reports={reports} alerts={alerts} />}
            </div>

            {/* CHARTS ROW */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a', marginBottom: '1rem' }}>📊 Disease Distribution (30d)</h3>
                {stats?.diseaseCounts && <DiseasePieChart data={stats.diseaseCounts} />}
              </div>
              <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a', marginBottom: '1rem' }}>📈 Reports Trend (7d)</h3>
                {!loading && <TrendChart reports={reports} />}
              </div>
            </div>

            {/* DISTRICT TABLE */}
            <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f1f5f9' }}>
                <h3 style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#0f172a', margin: 0 }}>🏙️ District Breakdown</h3>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      {['District', 'Reports', 'Active Diseases', 'Status'].map(h => (
                        <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 700, fontSize: '0.75rem', color: '#64748b', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(stats?.districtStats || []).slice(0, 8).map((d, i) => {
                      const hasAlert = alerts.some(a => a.district === d.district)
                      const isRed = alerts.some(a => a.district === d.district && a.risk_level === 'RED')
                      return (
                        <tr key={d.district} style={{ borderTop: '1px solid #f1f5f9', background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                          <td style={{ padding: '10px 16px', fontWeight: 600, color: '#0f172a' }}>{d.district}</td>
                          <td style={{ padding: '10px 16px', color: '#374151' }}>{d.reports}</td>
                          <td style={{ padding: '10px 16px' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                              {d.diseases.slice(0, 3).map(dis => (
                                <span key={dis} style={{ background: '#f1f5f9', color: '#475569', borderRadius: 99, padding: '1px 8px', fontSize: '0.7rem', fontWeight: 600 }}>{dis}</span>
                              ))}
                            </div>
                          </td>
                          <td style={{ padding: '10px 16px' }}>
                            {isRed ? (
                              <span style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 99, padding: '2px 10px', fontSize: '0.7rem', fontWeight: 700 }}>🔴 ALERT</span>
                            ) : hasAlert ? (
                              <span style={{ background: '#fffbeb', color: '#d97706', border: '1px solid #fde68a', borderRadius: 99, padding: '2px 10px', fontSize: '0.7rem', fontWeight: 700 }}>🟡 WARNING</span>
                            ) : (
                              <span style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: 99, padding: '2px 10px', fontSize: '0.7rem', fontWeight: 700 }}>🟢 NORMAL</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                    {(!stats?.districtStats || stats.districtStats.length === 0) && (
                      <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                        {loading ? '⏳ Loading district data...' : 'No district data yet — submit some reports!'}
                      </td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* ALERT FEED */}
            <AlertFeed alerts={alerts} loading={loading} />

            {/* AT-RISK PREDICTIONS */}
            <PredictionPanel alerts={alerts} />

            {/* RECENT REPORTS */}
            <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f1f5f9' }}>
                <h3 style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a', margin: 0 }}>📋 Recent Reports</h3>
              </div>
              <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                {loading ? (
                  [1,2,3].map(i => <div key={i} style={{ height: 64, margin: '8px 12px', borderRadius: 8, background: '#f1f5f9', animation: 'shimmer 1.4s infinite' }} />)
                ) : reports.slice(0, 10).map((r, i) => (
                  <div key={r.id || i} style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.8rem', color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.village_name}</div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 2 }}>{r.disease_ai_guess || 'Analyzing...'} · Age {r.patient_age}</div>
                    </div>
                    <div>
                      {r.severity_score >= 4 ? (
                        <span style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 99, padding: '1px 8px', fontSize: '0.65rem', fontWeight: 700, whiteSpace: 'nowrap' }}>Sev {r.severity_score}/5</span>
                      ) : r.severity_score >= 3 ? (
                        <span style={{ background: '#fffbeb', color: '#d97706', border: '1px solid #fde68a', borderRadius: 99, padding: '1px 8px', fontSize: '0.65rem', fontWeight: 700, whiteSpace: 'nowrap' }}>Sev {r.severity_score}/5</span>
                      ) : (
                        <span style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: 99, padding: '1px 8px', fontSize: '0.65rem', fontWeight: 700, whiteSpace: 'nowrap' }}>Sev {r.severity_score || 1}/5</span>
                      )}
                    </div>
                  </div>
                ))}
                {!loading && reports.length === 0 && (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.875rem' }}>No reports yet</div>
                )}
              </div>
            </div>
          </div>
        </div>

        <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.75rem', marginTop: '2rem' }}>
          Data from Supabase (live) · AI by Groq LLaMA 3.3 · Maps by OpenStreetMap · WHO/IDSP alert thresholds
        </p>
      </div>
      <style>{`@keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
      .shimmer{background:linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%);background-size:200% 100%;animation:shimmer 1.4s infinite}`}</style>
    </div>
  )
}
