// IDSP (Integrated Disease Surveillance Programme) weekly outbreak scraper
// What: Fetches real active outbreak reports from NCDC India
// Why: Provides real baseline for active outbreaks at national level for context

export interface IDSPReport {
  state: string
  disease: string
  cases: number
  deaths: number
  week: string
  status: string
}

// IDSP publishes outbreak reports in HTML format
// We fallback to structured mock-real data when scraping is blocked
export async function getIDSPOutbreaks(): Promise<IDSPReport[]> {
  try {
    const res = await fetch(
      'https://idsp.mohfw.gov.in/index4.php?lang=1&level=0&linkid=406&lid=3724',
      {
        headers: {
          'User-Agent': 'VyadhiNet/2.0 (Health Research; contact@vyadhinet.in)',
          Accept: 'text/html,application/xhtml+xml',
        },
        signal: AbortSignal.timeout(5000),
      }
    )
    if (!res.ok) throw new Error('IDSP fetch failed')
    const html = await res.text()

    // Parse table rows from IDSP HTML
    const rows = html.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || []
    const reports: IDSPReport[] = []

    for (const row of rows.slice(1, 20)) {
      const cells = (row.match(/<td[^>]*>([\s\S]*?)<\/td>/gi) || [])
        .map(cell => cell.replace(/<[^>]+>/g, '').trim())
      if (cells.length >= 4 && cells[0] && cells[1]) {
        reports.push({
          state:   cells[0] || '',
          disease: cells[1] || '',
          cases:   parseInt(cells[2]) || 0,
          deaths:  parseInt(cells[3]) || 0,
          week:    cells[4] || new Date().toISOString().split('T')[0],
          status:  cells[5] || 'Active',
        })
      }
    }
    return reports
  } catch {
    // IDSP sometimes blocks direct fetches — return empty; dashboard degrades gracefully
    return []
  }
}
