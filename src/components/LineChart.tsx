import { dateCourte } from '../lib/stats'

interface Props {
  points: { date: string; v: number }[]
  unite?: string
}

export default function LineChart({ points, unite = 'kg' }: Props) {
  if (points.length < 2) return <p className="chart-empty">Note au moins 2 séances pour voir la courbe.</p>
  const W = 320
  const H = 150
  const P = { l: 34, r: 10, t: 12, b: 24 }
  const vs = points.map((p) => p.v)
  let min = Math.min(...vs)
  let max = Math.max(...vs)
  if (min === max) {
    min -= 1
    max += 1
  }
  const pad = (max - min) * 0.15
  min = Math.max(0, min - pad)
  max += pad
  const x = (i: number) => P.l + (i * (W - P.l - P.r)) / (points.length - 1)
  const y = (v: number) => P.t + (1 - (v - min) / (max - min)) * (H - P.t - P.b)
  const path = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.v).toFixed(1)}`).join('')
  const area = `${path}L${x(points.length - 1)},${H - P.b}L${x(0)},${H - P.b}Z`
  const ticks = [min, (min + max) / 2, max]
  const last = points[points.length - 1]
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart" role="img" aria-label="Courbe de progression">
      {ticks.map((t) => (
        <g key={t}>
          <line x1={P.l} x2={W - P.r} y1={y(t)} y2={y(t)} className="chart-grid" />
          <text x={P.l - 6} y={y(t) + 4} textAnchor="end" className="chart-label">
            {Math.round(t)}
          </text>
        </g>
      ))}
      <path d={area} className="chart-area" />
      <path d={path} className="chart-line" />
      {points.map((p, i) => (
        <circle key={p.date} cx={x(i)} cy={y(p.v)} r={i === points.length - 1 ? 4.5 : 3} className="chart-dot">
          <title>
            {dateCourte(p.date)} : {Math.round(p.v * 10) / 10} {unite}
          </title>
        </circle>
      ))}
      <text x={P.l} y={H - 6} className="chart-label">
        {dateCourte(points[0].date)}
      </text>
      <text x={W - P.r} y={H - 6} textAnchor="end" className="chart-label">
        {dateCourte(last.date)}
      </text>
    </svg>
  )
}
