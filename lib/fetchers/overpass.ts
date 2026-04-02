// What: Fetches real PHC and hospital locations in any district
// Why: Dashboard shows nearest PHC to each outbreak village for routing alerts

export async function getPHCLocations(district: string) {
  const query = `
    [out:json];
    area["name"="${district}"]->.searchArea;
    node["amenity"~"hospital|clinic|health_post"](area.searchArea);
    out body;
  `
  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: query
  })
  const data = await res.json()
  interface PHCElement {
    lat: number
    lon: number
    tags?: {
      name?: string
      phone?: string
      [key: string]: any
    }
  }
  return (data.elements as PHCElement[]).map(el => ({
    name: el.tags?.name || 'Unknown PHC',
    lat: el.lat,
    lng: el.lon,
    phone: el.tags?.phone || null
  }))
}
