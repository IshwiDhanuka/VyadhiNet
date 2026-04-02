'use client'
import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getPHCLocations } from '@/lib/fetchers/overpass'

// Fix Leaflet default icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const redIcon = L.divIcon({
  html: `<div style="width:16px;height:16px;background:#dc2626;border:3px solid white;border-radius:50%;box-shadow:0 0 0 4px rgba(220,38,38,0.3)"></div>`,
  className: '', iconAnchor: [8, 8],
})
const amberIcon = L.divIcon({
  html: `<div style="width:14px;height:14px;background:#d97706;border:3px solid white;border-radius:50%;box-shadow:0 0 0 4px rgba(217,119,6,0.3)"></div>`,
  className: '', iconAnchor: [7, 7],
})
const reportIcon = L.divIcon({
  html: `<div style="width:10px;height:10px;background:#3b82f6;border:2px solid white;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,0.3)"></div>`,
  className: '', iconAnchor: [5, 5],
})
const phcIcon = L.divIcon({
  html: `<div style="width:18px;height:18px;background:#7c3aed;border:3px solid white;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:9px;color:white;font-weight:700;box-shadow:0 1px 4px rgba(0,0,0,0.3)">H</div>`,
  className: '', iconAnchor: [9, 9],
})

interface Report {
  id: string
  village_name: string
  lat: number
  lng: number
  disease_ai_guess?: string
  patient_age: number
  gender: string
  severity_score: number
  submitted_at: string
}

interface Alert {
  risk_level: 'RED' | 'AMBER'
  disease: string
  district: string
  state?: string
  center_lat: number
  center_lng: number
  case_count: number
  village_name: string
  weather_risk?: string
  threshold_source?: string
}

interface Props {
  reports: Report[]
  alerts: Alert[]
}

export default function OutbreakMap({ reports, alerts }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return

    const map = L.map(mapRef.current, {
      center: [22.5, 80.5],
      zoom: 5,
      zoomControl: true,
    })
    mapInstance.current = map

    // Tile layer — CartoDB light for cleaner look
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap contributors, © CARTO',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map)

    // Legend
    const legend = new (L.Control.extend({
      onAdd: () => {
        const div = L.DomUtil.create('div')
        div.innerHTML = `
          <div style="background:white;border:1px solid #e2e8f0;border-radius:10px;padding:10px 12px;font-size:11px;font-family:Inter,sans-serif;box-shadow:0 2px 8px rgba(0,0,0,0.1)">
            <div style="font-weight:700;margin-bottom:6px;color:#0f172a">Legend</div>
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px"><div style="width:12px;height:12px;background:#dc2626;border-radius:50%;border:2px solid white;box-shadow:0 0 0 2px rgba(220,38,38,0.3)"></div><span style="color:#374151">RED Alert</span></div>
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px"><div style="width:12px;height:12px;background:#d97706;border-radius:50%;border:2px solid white"></div><span style="color:#374151">AMBER Warning</span></div>
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px"><div style="width:10px;height:10px;background:#3b82f6;border-radius:50%;border:2px solid white"></div><span style="color:#374151">Report</span></div>
            <div style="display:flex;align-items:center;gap:6px"><div style="width:14px;height:14px;background:#7c3aed;border-radius:3px;border:2px solid white;display:flex;align-items:center;justify-content:center;font-size:7px;color:white;font-weight:700">H</div><span style="color:#374151">PHC / Hospital</span></div>
          </div>`
        return div
      }
    }))({ position: 'bottomright' })
    legend.addTo(map)

    return () => { map.remove(); mapInstance.current = null }
  }, [])

  // Update markers when data changes
  useEffect(() => {
    const map = mapInstance.current
    if (!map) return

    // Remove existing layers (except tile)
    map.eachLayer(layer => {
      if (layer instanceof L.Marker || layer instanceof L.Circle) map.removeLayer(layer)
    })

    // Add report markers
    reports.forEach(r => {
      if (!r.lat || !r.lng) return
      L.marker([r.lat, r.lng], { icon: reportIcon })
        .bindPopup(`
          <div style="font-family:Inter,sans-serif;min-width:160px">
            <div style="font-weight:700;color:#0f172a;margin-bottom:4px">${r.village_name}</div>
            <div style="font-size:12px;color:#64748b">Disease: <strong>${r.disease_ai_guess || 'Analyzing...'}</strong></div>
            <div style="font-size:12px;color:#64748b">Age: ${r.patient_age} · ${r.gender || ''}</div>
            <div style="font-size:12px;color:#64748b">Severity: ${r.severity_score || '—'}/5</div>
            <div style="font-size:11px;color:#94a3b8;margin-top:4px">${new Date(r.submitted_at).toLocaleDateString()}</div>
          </div>
        `, { maxWidth: 220 })
        .addTo(map)
    })

    // Add alert markers with radius circles
    alerts.forEach(a => {
      if (!a.center_lat || !a.center_lng) return
      const icon = a.risk_level === 'RED' ? redIcon : amberIcon
      const color = a.risk_level === 'RED' ? '#dc2626' : '#d97706'

      L.circle([a.center_lat, a.center_lng], {
        radius: 20000,
        color,
        fillColor: color,
        fillOpacity: 0.08,
        weight: 2,
        dashArray: '6 4',
      }).addTo(map)

      L.marker([a.center_lat, a.center_lng], { icon })
        .bindPopup(`
          <div style="font-family:Inter,sans-serif;min-width:200px">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">
              <span style="background:${a.risk_level === 'RED' ? '#fef2f2' : '#fffbeb'};color:${color};border:1px solid ${a.risk_level === 'RED' ? '#fecaca' : '#fde68a'};border-radius:99px;padding:2px 10px;font-size:11px;font-weight:700">${a.risk_level}</span>
              <strong style="color:#0f172a;font-size:14px">${a.disease}</strong>
            </div>
            <div style="font-size:12px;color:#64748b;margin-bottom:2px">📍 ${a.district}, ${a.state || ''}</div>
            <div style="font-size:12px;color:#64748b;margin-bottom:2px">📊 ${a.case_count} cases · ${(a.village_name || '').split(',').length} villages</div>
            <div style="font-size:12px;color:#64748b;margin-bottom:4px">🌡️ Weather risk: ${a.weather_risk || 'unknown'}</div>
            <div style="font-size:11px;color:#94a3b8">${a.threshold_source || ''}</div>
          </div>
        `, { maxWidth: 260 })
        .addTo(map)

      // Fetch + add PHC markers for alerted districts
      ;(async () => {
        try {
          const phcs = await getPHCLocations(a.district)
          phcs.slice(0, 5).forEach((phc: any) => {
            if (!phc.lat || !phc.lng) return
            L.marker([phc.lat, phc.lng], { icon: phcIcon })
              .bindPopup(`<div style="font-family:Inter,sans-serif"><div style="font-weight:700;color:#7c3aed;margin-bottom:2px">🏥 ${phc.name}</div><div style="font-size:11px;color:#64748b">${a.district}</div>${phc.phone ? `<div style="font-size:11px;color:#16a34a">📞 ${phc.phone}</div>` : ''}</div>`)
              .addTo(map)
          })
        } catch { /* non-fatal */ }
      })()
    })

    // Fit bounds to visible data
    const allPoints = [
      ...reports.filter(r => r.lat && r.lng).map(r => [r.lat, r.lng] as [number, number]),
      ...alerts.filter(a => a.center_lat && a.center_lng).map(a => [a.center_lat, a.center_lng] as [number, number]),
    ]
    if (allPoints.length > 0) {
      try { map.fitBounds(L.latLngBounds(allPoints), { padding: [40, 40], maxZoom: 9 }) } catch { /* ignore */ }
    }
  }, [reports, alerts])

  return <div ref={mapRef} style={{ height: 480, width: '100%' }} />
}
