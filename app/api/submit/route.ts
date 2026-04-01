import { supabase } from '@/lib/supabase'
import { callGemini } from '@/lib/gemini'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { village_name, lat, lng, district, state, patient_age, symptoms, raw_text } = body

  const { data: report, error } = await supabase
    .from('reports')
    .insert([{ village_name, lat, lng, district, state, patient_age, symptoms, raw_text }])
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const prompt = `
You are a clinical epidemiology assistant for rural India.
Given this symptom report from an ASHA worker, return ONLY valid JSON with no markdown:
{
  "disease_candidates": [{"name": string, "probability": number, "icd10_code": string}],
  "severity_score": number between 1-5,
  "normalized_symptoms": [string],
  "red_flags": [string],
  "urgency": "immediate" | "same_day" | "monitor"
}

Symptoms reported: ${raw_text}
Patient age: ${patient_age}
Location: ${village_name}, ${district}, ${state}
`

  const aiResponse = await callGemini(prompt)

  let aiData
  try {
    const clean = aiResponse.replace(/```json|```/g, '').trim()
    aiData = JSON.parse(clean)
  } catch {
    aiData = { disease_candidates: [], severity_score: 1, red_flags: [], urgency: 'monitor' }
  }

  await supabase
    .from('reports')
    .update({
      disease_ai_guess: aiData.disease_candidates?.[0]?.name || 'unknown',
      severity_score: aiData.severity_score,
      red_flags: aiData.red_flags,
    })
    .eq('id', report.id)

  return NextResponse.json({ success: true, report: { ...report, ...aiData } })
}
