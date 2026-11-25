import { Link } from 'react-router-dom'
import type { Exercice } from '../types'
import { MUSCLES } from '../data/muscles'
import GenouBadge from './GenouBadge'

export default function ExerciseCard({ e }: { e: Exercice }) {
  return (
    <Link to={`/exo/${e.id}`} className="card exo-card">
      <div className="exo-card-main">
        <div className="exo-card-title">{e.nom}</div>
        <div className="exo-card-sub">
          {e.principaux.map((m) => MUSCLES[m].nom).join(', ')} · {e.materiel}
        </div>
      </div>
      <div className="exo-card-tags">
        {e.seances
          .filter((s) => s !== 'Extra')
          .map((s) => (
            <span key={s} className="tag tag-prog">
              {s === 'A' || s === 'B' ? `Séance ${s}` : s}
            </span>
          ))}
        <GenouBadge g={e.genou} small />
      </div>
      <span className="chev" aria-hidden>
        ›
      </span>
    </Link>
  )
}
