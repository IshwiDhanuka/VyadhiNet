import { supabase } from './supabase'

const THRESHOLDS: Record<string, { cases: number; villages: number; level: string }> = {
  covid:        { cases: 5,  villages: 2, level: 'RED' },
  dengue:       { cases: 10, villages: 1, level: 'AMBER' },
  malaria:      { cases: 3,  villages: 1, level: 'RED' },
  cholera:      { cases: 2,  villages: 1, level: 'RED' },
  tuberculosis: { cases: 3,  villages: 2, level: 'AMBER' },
  typhoid:      { cases: 8,  villages: 1, level: 'AMBER' },
  measles:      { cases: 5,  villages: 1, level: 'RED' },
}

export async function detectOutbreaks() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const { data: reports } = await supabase
    .from('reports')
    .select('*')
    .gte('submitted_at', sevenDaysAgo)

  if (!reports || reports.length === 0) return []

  const clusters: Record<string, any> = {}
  for (const report of reports) {
    const disease = report.disease_ai_guess?.toLowerCase()
    if (!disease) continue
    const key = `${disease}__${report.district}`
    if (!clusters[key]) {
      clusters[key] = { disease, district: report.district, villages: new Set(), cases: 0, reports: [] }
    }
    clusters[key].villages.add(report.village_name)
    clusters[key].cases++
    clusters[key].reports.push(report)
  }

  const alerts = []
  for (const key of Object.keys(clusters)) {
    const cluster = clusters[key]
    const threshold = THRESHOLDS[cluster.disease]
    if (!threshold) continue
    if (cluster.cases >= threshold.cases && cluster.villages.size >= threshold.villages) {
      alerts.push({
        disease: cluster.disease,
        district: cluster.district,
        case_count: cluster.cases,
        risk_level: threshold.level,
        village_name: [...cluster.villages].join(', '),
        predicted_spread: {},
      })
    }
  }

  return alerts
}
