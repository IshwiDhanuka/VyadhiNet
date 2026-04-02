// app/api/analyse/route.ts
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const THRESHOLDS: Record<string, { cases: number; alert: string }> = {
  'Dengue Fever':                { cases: 10, alert: 'AMBER' },
  'Malaria':                     { cases: 3,  alert: 'RED'   },
  'Cholera':                     { cases: 2,  alert: 'RED'   },
  'COVID-19':                    { cases: 5,  alert: 'RED'   },
  'Typhoid':                     { cases: 8,  alert: 'AMBER' },
  'Tuberculosis':                { cases: 3,  alert: 'AMBER' },
  'Measles':                     { cases: 5,  alert: 'RED'   },
  'Chikungunya':                 { cases: 15, alert: 'AMBER' },
  'Acute Respiratory Infection': { cases: 10, alert: 'AMBER' },
}

export async function GET() {
  try {
    // ── Step 1: Reports from last 7 days ──────────────────────────
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

    const { data: reports, error } = await supabase
      .from('reports')
      .select('*')
      .gte('submitted_at', since)

    if (error) throw new Error('Supabase fetch failed: ' + error.message)
    if (!reports || reports.length === 0) {
      return NextResponse.json({ message: 'No reports in last 7 days' })
    }

    // ── Step 2: Group by village + disease ────────────────────────
    const clusters: Record<string, any> = {}

    for (const r of reports) {
      const disease = r.disease_ai_guess
      if (!disease) continue
      const key = `${r.village_name}__${disease}`
      if (!clusters[key]) {
        clusters[key] = {
          village: r.village_name,
          district: r.district,
          state: r.state,
          lat: r.lat,
          lng: r.lng,
          disease,
          cases: [],
        }
      }
      clusters[key].cases.push(r)
    }

    // ── Step 3: Apply WHO/IDSP thresholds ─────────────────────────
    const outbreaks: any[] = []

    for (const cluster of Object.values(clusters)) {
      const threshold = THRESHOLDS[cluster.disease]
      if (!threshold) continue
      if (cluster.cases.length >= threshold.cases) {
        outbreaks.push({
          village:      cluster.village,
          district:     cluster.district,
          state:        cluster.state,
          lat:          cluster.lat,
          lng:          cluster.lng,
          disease:      cluster.disease,
          case_count:   cluster.cases.length,
          risk_level:   threshold.alert,
          avg_severity: (
            cluster.cases.reduce((s: number, r: any) => s + (r.severity_score || 0), 0) /
            cluster.cases.length
          ).toFixed(1),
          red_flags: [...new Set(cluster.cases.flatMap((r: any) => r.red_flags || []))],
        })
      }
    }

    if (outbreaks.length === 0) {
      return NextResponse.json({ message: 'No outbreaks above threshold yet' })
    }

    // ── Step 4: Groq spread prediction ────────────────────────────
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama3-70b-8192',
        temperature: 0.3,
        max_tokens: 1000,
        messages: [
          {
            role: 'system',
            content: `You are an expert epidemiological spread modeler for rural India.
Return ONLY valid JSON, no markdown, no explanation. Format:
{
  "predictions": [
    {
      "village": "string",
      "district": "string",
      "risk_level": "HIGH|MEDIUM|LOW",
      "probability": 0.0,
      "estimated_days_to_arrival": 0,
      "estimated_case_range": "X-Y cases",
      "reason": "one sentence"
    }
  ],
  "transmission_vector": "string",
  "containment_priority": ["action1", "action2", "action3"],
  "summary": "2 sentence summary"
}`,
          },
          {
            role: 'user',
            content: `Active outbreaks in last 7 days:
${JSON.stringify(outbreaks, null, 2)}

District neighbors of Mirzapur, Uttar Pradesh:
- Varanasi (SW, 60km) — dense urban population
- Prayagraj (W, 90km)
- Chandauli (SE, 45km)  
- Sonbhadra (S, 80km)
- Lalganj (nearby town, 30km)

Dengue spreads via Aedes aegypti mosquito, 5-15km radius per generation, 7-14 day incubation.
Current season: April — pre-monsoon, moderate mosquito activity.

Predict next 4 villages most at risk. Return only JSON.`,
          },
        ],
      }),
    })

    const groqData = await groqRes.json()
    const rawText = groqData.choices?.[0]?.message?.content || '{}'

    let prediction: any = { predictions: [], summary: '' }
    try {
      prediction = JSON.parse(rawText.replace(/```json|```/g, '').trim())
    } catch {
      console.error('Groq JSON parse failed:', rawText)
    }

    // ── Step 5: Write alerts to Supabase ─────────────────────────
    const alertRows = outbreaks.map((o) => ({
      village_name:          o.village,
      district:              o.district,
      disease:               o.disease,
      risk_level:            o.risk_level,
      case_count:            o.case_count,
      predicted_spread:      prediction.predictions ?? [],
      transmission_vector:   prediction.transmission_vector ?? '',
      containment_priority:  prediction.containment_priority ?? [],
      summary:               prediction.summary ?? '',
      generated_at:          new Date().toISOString(),
      resolved:              false,
    }))

    const { error: insertError } = await supabase
      .from('alerts')
      .upsert(alertRows, { onConflict: 'village_name,disease' })

    if (insertError) throw new Error('Alert insert failed: ' + insertError.message)

    return NextResponse.json({
      success: true,
      outbreaks_detected: outbreaks.length,
      alerts_written: alertRows.length,
      prediction,
    })

  } catch (err: any) {
    console.error('analyze route error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}