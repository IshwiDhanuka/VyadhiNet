import { supabase } from '@/lib/supabase'
import { callGroq } from '@/lib/gemini'
import { detectOutbreaks } from '@/lib/outbreak'
import { getWeather } from '@/lib/fetchers/openMeteo'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { village_name, lat, lng, district, state, patient_age, gender, symptoms, raw_text } = body

  if (!village_name || !lat || !lng || !patient_age || !symptoms?.length) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // 1. Store report in Supabase
  const { data: report, error: insertError } = await supabase
    .from('reports')
    .insert([{
      village_name,
      lat,
      lng,
      district,
      state,
      patient_age,
      gender: gender || null,
      symptoms,
      raw_text,
      submitted_at: new Date().toISOString(),
    }])
    .select()
    .single()

  if (insertError) {
    console.error('Supabase insert error:', insertError)
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  // 2. Fetch weather context for enriched AI prompt
  let weatherContext = ''
  try {
    const weather = await getWeather(lat, lng)
    const avgRain = weather.rainfall.reduce((a: number, b: number) => a + b, 0) / weather.rainfall.length
    const avgTemp = weather.temperature.reduce((a: number, b: number) => a + b, 0) / weather.temperature.length
    weatherContext = `Recent weather: avg rainfall ${avgRain.toFixed(1)}mm/day, avg max temp ${avgTemp.toFixed(1)}°C.`
  } catch { /* non-fatal */ }

  // 3. Claude/Groq Call 1 — Symptom NLP & Disease Classification
  const nlpPrompt = `You are a clinical epidemiology assistant specializing in rural India communicable diseases.
Given this ASHA worker symptom report, return ONLY valid JSON with no markdown, no prose:
{
  "disease_candidates": [{"name": string, "probability": number (0-1), "icd10_code": string}],
  "severity_score": number (1-5),
  "normalized_symptoms": [string],
  "red_flags": [string],
  "urgency": "immediate" | "same_day" | "monitor",
  "advice": string
}

Patient: ${gender || 'unknown gender'}, age ${patient_age}
Location: ${village_name}, ${district}, ${state}
Symptoms: ${raw_text}
${weatherContext}`

interface AIData {
  disease_candidates: Array<{ name: string; probability: number; icd10_code: string }>
  severity_score: number
  normalized_symptoms: string[]
  red_flags: string[]
  urgency: 'immediate' | 'same_day' | 'monitor'
  advice: string
}

  let aiData: AIData = {
    disease_candidates: [],
    severity_score: 1,
    normalized_symptoms: symptoms,
    red_flags: [],
    urgency: 'monitor',
    advice: 'Consult nearest PHC',
  }

  try {
    const aiResponse = await callGroq(nlpPrompt)
    const clean = aiResponse.replace(/```json|```/g, '').trim()
    aiData = JSON.parse(clean)
  } catch (e) {
    console.error('AI parse error:', e)
  }

  // 4. Update report with AI data
  const { error: updateError } = await supabase
    .from('reports')
    .update({
      disease_ai_guess: aiData.disease_candidates?.[0]?.name || 'unknown',
      severity_score: aiData.severity_score || 1,
      red_flags: aiData.red_flags || [],
      urgency: aiData.urgency || 'monitor',
      ai_full_response: aiData,
    })
    .eq('id', report.id)

  if (updateError) console.error('Supabase update error:', updateError)

  // 5. Run outbreak detection (non-blocking)
  try {
    await detectOutbreaks(district)
  } catch (e) {
    console.error('Outbreak detection error:', e)
  }

  return NextResponse.json({
    success: true,
    report: {
      ...report,
      ...aiData,
    },
  })
}
