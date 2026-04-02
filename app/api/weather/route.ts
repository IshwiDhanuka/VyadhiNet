import { getWeather } from '@/lib/fetchers/openMeteo'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const lat = parseFloat(searchParams.get('lat') || '25.1')
  const lng = parseFloat(searchParams.get('lng') || '82.5')
  try {
    const weather = await getWeather(lat, lng)
    return NextResponse.json({ success: true, weather })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
