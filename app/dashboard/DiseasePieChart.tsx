'use client'
import { useEffect, useRef } from 'react'
import { Chart, ArcElement, Tooltip, Legend, DoughnutController } from 'chart.js'

Chart.register(ArcElement, Tooltip, Legend, DoughnutController)

const PALETTE = [
  '#dc2626', '#d97706', '#16a34a', '#2563eb', '#7c3aed',
  '#db2777', '#0891b2', '#65a30d', '#ea580c', '#6366f1',
]

interface Props {
  data: Record<string, number>
}

export default function DiseasePieChart({ data }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<Chart | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return
    const labels = Object.keys(data)
    const values = Object.values(data)
    const total = values.reduce((a, b) => a + b, 0)

    if (chartRef.current) chartRef.current.destroy()

    chartRef.current = new Chart(canvasRef.current, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: PALETTE.slice(0, labels.length),
          borderWidth: 2,
          borderColor: 'white',
          hoverBorderWidth: 3,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '62%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              font: { size: 11, family: 'Inter, system-ui, sans-serif' },
              padding: 10,
              boxWidth: 12,
              color: '#374151',
            },
          },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.label}: ${ctx.parsed} cases (${((ctx.parsed / total) * 100).toFixed(0)}%)`,
            },
            backgroundColor: '#0f172a',
            titleFont: { size: 12 },
            bodyFont: { size: 11 },
            padding: 10,
            cornerRadius: 8,
          },
        },
      },
    })
    return () => { chartRef.current?.destroy() }
  }, [data])

  const total = Object.values(data).reduce((a, b) => a + b, 0)

  if (!total) {
    return (
      <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.875rem' }}>
        No disease data yet
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', height: 200 }}>
      <canvas ref={canvasRef} />
      <div style={{ position: 'absolute', top: '38%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>{total}</div>
        <div style={{ fontSize: '0.625rem', color: '#64748b', fontWeight: 600 }}>CASES</div>
      </div>
    </div>
  )
}
