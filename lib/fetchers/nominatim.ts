// What: Fetches real lat/lng coordinates for any Indian village
// Why: ASHA workers type a village name, we get real coordinates to store in DB and show on map

export async function getVillageCoordinates(village: string, state: string) {
  const query = encodeURIComponent(`${village}, ${state}, India`)
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=5`,
    { headers: { 'User-Agent': 'VyadhiNet/1.0' } }
  )
  const data = await res.json()
  if (!data.length) return null
  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon),
    displayName: data[0].display_name
  }
}
