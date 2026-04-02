import { supabase } from './supabase'
import { getWeather } from './fetchers/openMeteo'
import { getDiseaseBaseline } from './fetchers/dataGovIn'

// WHO / IDSP / NVBDCP-grounded disease thresholds
export const THRESHOLDS: Record<string, { cases: number; villages: number; level: 'RED' | 'AMBER'; source: string }> = {
  'covid-19':                    { cases: 5,  villages: 1, level: 'RED',   source: 'WHO Epidemic Threshold' },
  'covid':                       { cases: 5,  villages: 1, level: 'RED',   source: 'WHO Epidemic Threshold' },
  'dengue':                      { cases: 10, villages: 1, level: 'AMBER', source: 'IDSP P-Form Trigger' },
  'dengue fever':                { cases: 10, villages: 1, level: 'AMBER', source: 'IDSP P-Form Trigger' }, // ← ADD
  'malaria':                     { cases: 3,  villages: 1, level: 'RED',   source: 'NVBDCP Alert Criteria' },
  'cholera':                     { cases: 2,  villages: 1, level: 'RED',   source: 'WHO — any cluster = alert' },
  'tuberculosis':                { cases: 3,  villages: 1, level: 'AMBER', source: 'RNTCP Cluster Definition' },
  'tb':                          { cases: 3,  villages: 1, level: 'AMBER', source: 'RNTCP Cluster Definition' },
  'typhoid':                     { cases: 8,  villages: 1, level: 'AMBER', source: 'IDSP S-Form Threshold' },
  'measles':                     { cases: 5,  villages: 1, level: 'RED',   source: 'WHO SEARO Alert Criteria' },
  'chikungunya':                 { cases: 15, villages: 1, level: 'AMBER', source: 'NVBDCP State Alert Level' },
  'hepatitis a':                 { cases: 6,  villages: 1, level: 'AMBER', source: 'IDSP Standard Definition' },
  'hepatitis e':                 { cases: 6,  villages: 1, level: 'AMBER', source: 'IDSP Standard Definition' },
  'acute diarrhea':              { cases: 15, villages: 1, level: 'AMBER', source: 'IDSP Standard Definition' },
  'acute respiratory infection': { cases: 10, villages: 1, level: 'AMBER', source: 'IDSP Standard Definition' }, // ← ADD
}

function normalizeDisease(name: string): string {
  const n = (name || '').toLowerCase().trim()
  if (n.includes('dengue')) return 'dengue'
  if (n.includes('covid') || n.includes('corona')) return 'covid-19'
  if (n.includes('malaria')) return 'malaria'
  if (n.includes('cholera')) return 'cholera'
  if (n.includes('typhoid')) return 'typhoid'
  if (n.includes('chikungunya')) return 'chikungunya'
  if (n.includes('tuberculosis') || n === 'tb') return 'tuberculosis'
  if (n.includes('measles')) return 'measles'
  if (n.includes('respiratory')) return 'acute diarrhea'
  if (n.includes('hepatitis')) return n.includes('e') ? 'hepatitis e' : 'hepatitis a'
  return n
}

export interface OutbreakAlert {
  disease: string
  district: string
  state: string
  village_name: string
  case_count: number
  risk_level: 'RED' | 'AMBER'
  threshold_source: string
  weather_risk: string
  historical_baseline: number
  center_lat: number
  center_lng: number
  predicted_spread: {
    estimated_days_to_arrival: number
    at_risk_villages: number
    transmission_vector: string
  }
  created_at: string
}

export async function detectOutbreaks(district?: string): Promise<OutbreakAlert[]> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  let query = supabase
    .from('reports')
    .select('*')
    .gte('submitted_at', sevenDaysAgo)

  if (district) query = query.eq('district', district)

  const { data: reports } = await query
  if (!reports || reports.length === 0) return []

  // Cluster reports by disease + district
  const clusters: Record<string, {
    disease: string
    district: string
    state: string
    villages: Set<string>
    cases: number
    latSum: number
    lngSum: number
    reports: any[]
  }> = {}

  for (const report of reports) {
    const disease = normalizeDisease(report.disease_ai_guess)
    if (!disease || disease === 'unknown') continue
    const key = `${disease}||${report.district}`
    if (!clusters[key]) {
      clusters[key] = {
        disease,
        district: report.district,
        state: report.state,
        villages: new Set(),
        cases: 0,
        latSum: 0,
        lngSum: 0,
        reports: [],
      }
    }
    clusters[key].villages.add(report.village_name)
    clusters[key].cases++
    clusters[key].latSum += report.lat || 0
    clusters[key].lngSum += report.lng || 0
    clusters[key].reports.push(report)
  }

  const newAlerts: any[] = []

  for (const cluster of Object.values(clusters)) {
    const threshold = THRESHOLDS[cluster.disease]
    if (!threshold) continue
    if (cluster.cases < threshold.cases || cluster.villages.size < threshold.villages) continue

    const centerLat = cluster.latSum / cluster.cases
    const centerLng = cluster.lngSum / cluster.cases

    // Enrich with weather
    let weatherRisk = 'low'
    try {
      const weather = await getWeather(centerLat, centerLng)
      const avgRain = weather.rainfall.reduce((a: number, b: number) => a + b, 0) / weather.rainfall.length
      if (avgRain > 10) weatherRisk = 'high'
      else if (avgRain > 3) weatherRisk = 'medium'
    } catch { /* non-fatal */ }

    // Historical baseline
    let baselineCases = 0
    try {
      const baseline = await getDiseaseBaseline(cluster.disease)
      const districtData = baseline.find((b: any) =>
        (b.district || '').toLowerCase() === cluster.district.toLowerCase()
      )
      baselineCases = parseInt(districtData?.cases || districtData?.total_cases || 0)
    } catch { /* non-fatal */ }

    const alertPayload = {
      disease: cluster.disease,
      district: cluster.district,
      state: cluster.state,
      village_name: [...cluster.villages].join(', '),
      case_count: cluster.cases,
      risk_level: threshold.level,
      threshold_source: threshold.source,
      weather_risk: weatherRisk,
      historical_baseline: baselineCases,
      center_lat: centerLat,
      center_lng: centerLng,
      predicted_spread: {
        estimated_days_to_arrival: cluster.cases > threshold.cases * 2 ? 3 : 7,
        at_risk_villages: cluster.cases,
        transmission_vector: ['dengue', 'malaria', 'chikungunya'].includes(cluster.disease) ? 'vector (mosquito)' : 'person-to-person',
      },
      created_at: new Date().toISOString(),
    }

    newAlerts.push(alertPayload)

    // Upsert to Supabase alerts table
    try {
      await supabase
        .from('alerts')
        .upsert([alertPayload], { onConflict: 'disease,village_name' })
    } catch (e) {
      console.error('Alert upsert error:', e)
    }
  }

  return newAlerts
}
