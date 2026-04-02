interface Alert {
  disease: string
  district: string
  state?: string
  village_name?: string
  case_count: number
  risk_level: 'RED' | 'AMBER'
  threshold_source?: string
  weather_risk?: string
  created_at?: string
  predicted_spread?: {
    estimated_days_to_arrival?: number
    at_risk_villages?: number
    transmission_vector?: string
  }
}

interface Props {
  alerts: Alert[]
  loading: boolean
}

function AlertCard({ alert }: { alert: Alert }) {
  const isRed = alert.risk_level === 'RED'
  return (
    <div style={{
      border: `1px solid ${isRed ? '#fecaca' : '#fde68a'}`,
      borderLeft: `4px solid ${isRed ? '#dc2626' : '#d97706'}`,
      borderRadius: 10,
      padding: '0.875rem',
      background: isRed ? '#fef2f2' : '#fffbeb',
      marginBottom: 8,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
        <div>
          <span style={{
            background: isRed ? '#dc2626' : '#d97706',
            color: 'white', borderRadius: 99, padding: '1px 8px', fontSize: '0.65rem', fontWeight: 800,
            textTransform: 'uppercase', letterSpacing: '0.06em', marginRight: 6,
          }}>{alert.risk_level}</span>
          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>{alert.disease}</span>
        </div>
        <span style={{ fontSize: '0.7rem', color: '#64748b', whiteSpace: 'nowrap' }}>
          {alert.created_at ? new Date(alert.created_at).toLocaleDateString('en-IN') : ''}
        </span>
      </div>
      <div style={{ fontSize: '0.8rem', color: '#374151', marginBottom: 4 }}>
        📍 {alert.district}{alert.state ? `, ${alert.state}` : ''}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
          📊 <strong>{alert.case_count}</strong> cases
        </div>
        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
          🌡️ Weather: <strong>{alert.weather_risk || 'n/a'}</strong>
        </div>
      </div>
      {alert.predicted_spread?.transmission_vector && (
        <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 4 }}>
          🦟 {alert.predicted_spread.transmission_vector}
        </div>
      )}
      {alert.threshold_source && (
        <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: 4, fontStyle: 'italic' }}>
          Source: {alert.threshold_source}
        </div>
      )}
    </div>
  )
}

export default function AlertFeed({ alerts, loading }: Props) {
  const sorted = [...alerts].sort((a, b) => {
    if (a.risk_level === 'RED' && b.risk_level !== 'RED') return -1
    if (b.risk_level === 'RED' && a.risk_level !== 'RED') return 1
    return 0
  })

  return (
    <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
      <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#0f172a', margin: 0 }}>🚨 Live Alert Feed</h3>
        {alerts.length > 0 && (
          <span style={{ background: '#dc2626', color: 'white', borderRadius: 99, padding: '1px 8px', fontSize: '0.7rem', fontWeight: 700 }}>{alerts.length}</span>
        )}
      </div>
      <div style={{ padding: '0.875rem', maxHeight: 400, overflowY: 'auto' }}>
        {loading ? (
          [1, 2].map(i => (
            <div key={i} style={{ height: 90, borderRadius: 10, background: '#f1f5f9', marginBottom: 8, animation: 'shimmer 1.4s infinite' }} />
          ))
        ) : sorted.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '1.5rem', color: '#94a3b8', fontSize: '0.875rem' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
            No active outbreaks detected
          </div>
        ) : sorted.map((a, i) => <AlertCard key={i} alert={a} />)}
      </div>
    </div>
  )
}
