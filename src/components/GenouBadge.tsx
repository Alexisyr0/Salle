import type { Genou } from '../types'

const LABEL: Record<Genou, string> = {
  ok: 'Genou OK',
  prudence: 'Genou : prudence',
  eviter: 'Genou : à éviter',
}

export default function GenouBadge({ g, small }: { g: Genou; small?: boolean }) {
  return <span className={`tag genou genou-${g}${small ? ' small' : ''}`}>{small && g === 'ok' ? 'Genou OK' : LABEL[g]}</span>
}
