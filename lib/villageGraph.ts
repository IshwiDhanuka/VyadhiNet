// Village Graph — adjacency model using Nominatim boundary data
// What: Finds neighboring villages/districts for spread prediction
// Why: Needed for Claude Call 2 — "which adjacent villages are at-risk?"

interface VillageNode {
  name: string
  district: string
  state: string
  lat: number
  lng: number
  distanceKm?: number
}

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export async function getAdjacentVillages(
  centerLat: number,
  centerLng: number,
  district: string,
  radiusKm: number = 30
): Promise<VillageNode[]> {
  // Use Overpass to find villages within radiusKm
  const radiusMeters = radiusKm * 1000
  const query = `
    [out:json];
    (
      node["place"~"village|town|hamlet"](around:${radiusMeters},${centerLat},${centerLng});
    );
    out body 20;
  `
  try {
    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query,
      signal: AbortSignal.timeout(8000),
    })
    const data = await res.json()
    interface OverpassElement {
      lat: number
      lon: number
      tags: {
        name: string
        'is_in:district'?: string
        'is_in:state'?: string
        [key: string]: any
      }
    }
    return (data.elements as OverpassElement[])
      .filter(el => el.lat && el.lon && el.tags?.name)
      .map(el => ({
        name:      el.tags.name,
        district:  el.tags['is_in:district'] || district,
        state:     el.tags['is_in:state'] || '',
        lat:       el.lat,
        lng:       el.lon,
        distanceKm: haversine(centerLat, centerLng, el.lat, el.lon),
      }))
      .sort((a: VillageNode, b: VillageNode) => (a.distanceKm || 99) - (b.distanceKm || 99))
  } catch {
    return []
  }
}
