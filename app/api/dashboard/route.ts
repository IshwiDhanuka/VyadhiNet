import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'
import { detectOutbreaks } from '@/lib/outbreak'

export async function GET() {
  try {
    // Fetch reports from last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const { data: reports, error: reportsError } = await supabase
      .from('reports')
      .select('*')
      .gte('submitted_at', thirtyDaysAgo)
      .order('submitted_at', { ascending: false })
      .limit(500)

    if (reportsError) throw reportsError

    // Fetch active alerts
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const { data: alerts, error: alertsError } = await supabase
      .from('alerts')
      .select('*')
      .gte('created_at', sevenDaysAgo)
      .order('created_at', { ascending: false })
      .limit(50)

    if (alertsError) throw alertsError

    // Stats
    const totalReports = reports?.length || 0
    const activeAlerts = alerts?.filter(a => a.risk_level === 'RED').length || 0
    const affectedVillages = new Set(alerts?.map(a => a.village_name).filter(Boolean)).size
    const diseaseCounts: Record<string, number> = {}
    reports?.forEach(r => {
      if (r.disease_ai_guess && r.disease_ai_guess !== 'unknown') {
        diseaseCounts[r.disease_ai_guess] = (diseaseCounts[r.disease_ai_guess] || 0) + 1
      }
    })

    // District breakdown
    const districtMap: Record<string, { reports: number; diseases: Set<string> }> = {}
    reports?.forEach(r => {
      if (!r.district) return
      if (!districtMap[r.district]) districtMap[r.district] = { reports: 0, diseases: new Set() }
      districtMap[r.district].reports++
      if (r.disease_ai_guess) districtMap[r.district].diseases.add(r.disease_ai_guess)
    })

    const districtStats = Object.entries(districtMap).map(([district, d]) => ({
      district,
      reports: d.reports,
      diseases: [...d.diseases],
    })).sort((a, b) => b.reports - a.reports).slice(0, 10)

    return NextResponse.json({
      success: true,
      reports: reports || [],
      alerts: alerts || [],
      stats: {
        totalReports,
        activeAlerts,
        affectedVillages,
        diseaseCounts,
        districtStats,
      },
    })
  } catch (error: any) {
    console.error('Dashboard API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST() {
  // Trigger outbreak detection manually
  try {
    // Get unique districts with reports in last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const { data: reports } = await supabase
      .from('reports')
      .select('district')
      .gte('submitted_at', sevenDaysAgo)

    const districts = [...new Set(reports?.map(r => r.district).filter(Boolean))]
    const allAlerts: any[] = []
    for (const d of districts) {
      const alerts = await detectOutbreaks(d)
      allAlerts.push(...alerts)
    }
    return NextResponse.json({ success: true, alertsGenerated: allAlerts.length, alerts: allAlerts })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
