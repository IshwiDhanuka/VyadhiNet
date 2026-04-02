'use client'
import { useState } from 'react'

interface Village {
  displayName: string
  lat: number
  lng: number
}

interface Props {
  onSelect: (village: Village) => void
}

export default function VillageSearch({ onSelect }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Village[]>([])
  const [loading, setLoading] = useState(false)

  async function search(q: string) {
    setQuery(q)
    if (q.length < 3) return
    setLoading(true)
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q + ', India')}&format=json&limit=5`,
      { headers: { 'User-Agent': 'VyadhiNet/1.0' } }
    )
    const data = await res.json()
    interface NominatimResult {
      display_name: string
      lat: string
      lon: string
    }
    setResults((data as NominatimResult[]).map(r => ({
      displayName: r.display_name,
      lat: parseFloat(r.lat),
      lng: parseFloat(r.lon)
    })))
    setLoading(false)
  }

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={e => search(e.target.value)}
        placeholder="Village ka naam likho..."
        className="w-full border border-gray-300 rounded-lg p-3 text-base"
      />
      {loading && <p className="text-sm text-gray-400 mt-1">Searching...</p>}
      {results.length > 0 && (
        <ul className="absolute z-10 bg-white border border-gray-200 rounded-lg w-full mt-1 shadow-lg">
          {results.map((r, i) => (
            <li
              key={i}
              onClick={() => { onSelect(r); setResults([]); setQuery(r.displayName.split(',')[0]) }}
              className="p-3 hover:bg-green-50 cursor-pointer text-sm border-b last:border-0"
            >
              {r.displayName}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
