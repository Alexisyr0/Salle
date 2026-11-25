import type { MuscleId } from '../types'
import { MUSCLES } from '../data/muscles'

type Pt = [number, number]
type Shape = { muscle: MuscleId; pts: Pt[]; mirror?: boolean }

const mirror = (pts: Pt[]): Pt[] => pts.map(([x, y]) => [200 - x, y])
const d = (pts: Pt[]) => 'M' + pts.map((p) => p.join(',')).join('L') + 'Z'

const FACE: Shape[] = [
  { muscle: 'epaules', pts: [[64, 70], [79, 67], [81, 82], [71, 100], [57, 98], [56, 82]], mirror: true },
  { muscle: 'pectoraux', pts: [[82, 72], [98, 75], [98, 106], [87, 111], [74, 104], [72, 92]], mirror: true },
  { muscle: 'biceps', pts: [[57, 103], [70, 104], [68, 138], [61, 147], [53, 139], [53, 118]], mirror: true },
  { muscle: 'avant-bras', pts: [[51, 152], [64, 150], [60, 188], [53, 214], [45, 212], [45, 180]], mirror: true },
  { muscle: 'obliques', pts: [[74, 112], [86, 117], [86, 186], [79, 194], [72, 168], [72, 130]], mirror: true },
  { muscle: 'abdominaux', pts: [[89, 115], [98.5, 115], [98.5, 135], [89, 135]], mirror: true },
  { muscle: 'abdominaux', pts: [[89, 139], [98.5, 139], [98.5, 160], [89, 160]], mirror: true },
  { muscle: 'abdominaux', pts: [[89, 164], [98.5, 164], [98.5, 192], [92, 190], [89, 184]], mirror: true },
  { muscle: 'quadriceps', pts: [[73, 214], [89, 220], [91, 252], [92, 296], [85, 306], [76, 300], [70, 254]], mirror: true },
  { muscle: 'adducteurs', pts: [[92, 222], [99, 226], [99, 250], [94, 276], [92, 252]], mirror: true },
  { muscle: 'mollets', pts: [[75, 320], [88, 318], [90, 350], [86, 384], [80, 384], [74, 352]], mirror: true },
]

const DOS: Shape[] = [
  { muscle: 'trapezes', pts: [[86, 58], [99.5, 56], [99.5, 112], [92, 104], [82, 80], [68, 70]], mirror: true },
  { muscle: 'arriere-epaules', pts: [[64, 70], [77, 72], [79, 86], [68, 100], [57, 97], [56, 82]], mirror: true },
  { muscle: 'dorsaux', pts: [[81, 90], [92, 108], [99.5, 120], [99.5, 150], [89, 168], [79, 160], [73, 124], [73, 102]], mirror: true },
  { muscle: 'lombaires', pts: [[90, 172], [99.5, 156], [99.5, 202], [90, 202]], mirror: true },
  { muscle: 'triceps', pts: [[57, 101], [69, 103], [70, 138], [62, 148], [53, 140], [53, 116]], mirror: true },
  { muscle: 'avant-bras', pts: [[51, 152], [64, 150], [60, 188], [53, 214], [45, 212], [45, 180]], mirror: true },
  { muscle: 'fessiers', pts: [[73, 206], [99.5, 208], [99.5, 246], [87, 252], [73, 242], [69, 224]], mirror: true },
  { muscle: 'ischios', pts: [[71, 252], [87, 256], [96, 260], [94, 300], [86, 308], [77, 302], [71, 280]], mirror: true },
  { muscle: 'mollets', pts: [[74, 316], [90, 314], [92, 345], [86, 376], [80, 377], [72, 347]], mirror: true },
]

function Silhouette() {
  const limb = { fill: 'none', stroke: 'var(--body)', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  return (
    <g>
      <ellipse cx={100} cy={30} rx={17} ry={21} fill="var(--body)" />
      <rect x={91} y={46} width={18} height={18} rx={6} fill="var(--body)" />
      <path d="M62 66 L138 66 L132 118 L128 200 L134 216 L66 216 L72 200 L68 118 Z" fill="var(--body)" />
      {[false, true].map((m) => {
        const arm: Pt[] = [[62, 78], [56, 142], [48, 214]]
        const leg: Pt[] = [[84, 222], [82, 308], [83, 386]]
        const a = m ? mirror(arm) : arm
        const l = m ? mirror(leg) : leg
        const hx = m ? 154 : 46
        const fx = m ? 117 : 83
        return (
          <g key={String(m)}>
            <polyline points={a.map((p) => p.join(',')).join(' ')} strokeWidth={22} {...limb} />
            <circle cx={hx} cy={226} r={8} fill="var(--body)" />
            <polyline points={l.map((p) => p.join(',')).join(' ')} strokeWidth={30} {...limb} />
            <ellipse cx={fx} cy={400} rx={11} ry={6} fill="var(--body)" />
          </g>
        )
      })}
    </g>
  )
}

interface Props {
  vue: 'face' | 'dos'
  selected?: MuscleId | null
  principaux?: MuscleId[]
  secondaires?: MuscleId[]
  onSelect?: (m: MuscleId) => void
  compact?: boolean
  /** 0 à 1 par muscle, pour la carte de chaleur */
  intensite?: Partial<Record<MuscleId, number>>
}

export default function BodyMap({ vue, selected, principaux = [], secondaires = [], onSelect, compact, intensite }: Props) {
  const shapes = vue === 'face' ? FACE : DOS
  const fillFor = (m: MuscleId) => {
    if (intensite) {
      const v = intensite[m] ?? 0
      return v > 0 ? `color-mix(in srgb, var(--accent) ${Math.round(25 + v * 75)}%, var(--muscle))` : 'var(--muscle)'
    }
    if (selected === m || principaux.includes(m)) return 'var(--accent)'
    if (secondaires.includes(m)) return 'var(--accent-soft)'
    return 'var(--muscle)'
  }
  return (
    <svg
      viewBox="20 0 160 412"
      className={'bodymap' + (compact ? ' compact' : '')}
      role="img"
      aria-label={`Carte des muscles, vue de ${vue === 'face' ? 'face' : 'dos'}`}
    >
      <Silhouette />
      {shapes.flatMap((s, i) => {
        const list = s.mirror ? [s.pts, mirror(s.pts)] : [s.pts]
        return list.map((pts, j) => (
          <path
            key={`${i}-${j}`}
            d={d(pts)}
            fill={fillFor(s.muscle)}
            className={onSelect ? 'muscle clickable' : 'muscle'}
            onClick={onSelect ? () => onSelect(s.muscle) : undefined}
          >
            <title>{MUSCLES[s.muscle].nom}</title>
          </path>
        ))
      })}
    </svg>
  )
}
