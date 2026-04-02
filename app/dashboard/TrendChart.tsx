'use client'
import { useEffect, useRef } from 'react'
import { Chart, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Filler, LineController } from 'chart.js'

Chart.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Filler, LineController)

interface Props { reports: any[] }

export default function TrendChart({ reports }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef  = useRef<Chart | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    // Build last-7-days buckets
    const days: Record<string, number> = {}
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000)
      days[d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })] = 0
    }
    reports.forEach(r => {
      const d = new Date(r.submitted_at)
      const key = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
      if (key in days) days[key]++
    })

    const labels = Object.keys(days)
    const values = Object.values(days)

    if (chartRef.current) chartRef.current.destroy()

    chartRef.current = new Chart(canvasRef.current, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Reports',
          data: values,
          borderColor: '#16a34a',
          backgroundColor: 'rgba(22,163,74,0.08)',
          fill: true,
          tension: 0.45,
          pointRadius: 4,
          pointBackgroundColor: '#16a34a',
          pointBorderColor: 'white',
          pointBorderWidth: 2,
          pointHoverRadius: 6,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0f172a',
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: ctx => ` ${ctx.parsed.y} reports`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { size: 10, family: 'Inter,sans-serif' }, color: '#94a3b8' },
          },
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1, font: { size: 10, family: 'Inter,sans-serif' }, color: '#94a3b8' },
            grid: { color: '#f1f5f9' },
          },
        },
      },
    })
    return () => { chartRef.current?.destroy() }
  }, [reports])

  return <div style={{ height: 160 }}><canvas ref={canvasRef} /></div>
}
