// What: Fetches real rainfall and temperature for any coordinates
// Why: Dengue/malaria risk spikes with high rainfall — we correlate weather with disease clusters

export async function getWeather(lat: number, lng: number) {
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=precipitation_sum,temperature_2m_max&timezone=Asia/Kolkata&forecast_days=7`
  )
  const data = await res.json()
  return {
    rainfall: data.daily.precipitation_sum,
    temperature: data.daily.temperature_2m_max,
    dates: data.daily.time
  }
}
