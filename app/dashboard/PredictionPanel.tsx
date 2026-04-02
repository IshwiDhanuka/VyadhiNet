interface Alert {
  disease: string
  district: string
  case_count: number
  risk_level: string
  predicted_spread?: {
    estimated_days_to_arrival?: number
    at_risk_villages?: number
    probability?: number
  }
}

interface Props { alerts: Alert[] }

export default function PredictionPanel({ alerts }: Props) {
  const predictions = alerts.filter(a => a.predicted_spread?.estimated_days_to_arrival)

  return (
    <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
      <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f1f5f9', background: 'linear-gradient(90deg, #f5f3ff, white)' }}>
        <h3 style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a', margin: 0 }}>🔮 AI Spread Predictions</h3>
      </div>
      <div style={{ padding: '0.875rem' }}>
        {predictions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '1rem', color: '#94a3b8', fontSize: '0.8125rem' }}>
            No spread predictions yet
          </div>
        ) : predictions.slice(0, 4).map((a, i) => {
          const days = a.predicted_spread?.estimated_days_to_arrival || 7
          const width = Math.max(10, 100 - (days / 14) * 100)
          const color = days <= 3 ? '#dc2626' : days <= 5 ? '#d97706' : '#16a34a'
          return (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f172a' }}>{a.disease} · {a.district}</span>
                <span style={{ fontSize: '0.7rem', color, fontWeight: 700 }}>{days}d spread</span>
              </div>
              <div style={{ height: 6, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ width: `${width}%`, height: '100%', background: `linear-gradient(90deg, ${color}, ${color}88)`, borderRadius: 99, transition: 'width 0.5s ease' }} />
              </div>
              <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: 3 }}>
                ~{a.predicted_spread?.at_risk_villages || a.case_count} villages at risk
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
