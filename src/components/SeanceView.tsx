import { Link } from 'react-router-dom'
import { getExercice } from '../data/exercises'
import type { SeanceProg } from '../data/programme'

export default function SeanceView({ s }: { s: SeanceProg }) {
  return (
    <div>
      <div className="seance-head">
        <h2>{s.titre}</h2>
        <span>{s.sousTitre}</span>
      </div>
      {s.blocs.map((b) => (
        <section key={b.titre} className="card bloc">
          <h3>{b.titre}</h3>
          <p className="bloc-c">{b.consigne}</p>
          <div className="bloc-list">
            {b.exercices.map((id) => {
              const e = getExercice(id)
              if (!e) return null
              return (
                <div key={id} className="bloc-entry">
                  <Link to={`/exo/${id}`} className="bloc-item">
                    <span>{e.nom}</span>
                    <span className="bloc-f">{e.format}</span>
                    <span className="chev">›</span>
                  </Link>
                  {e.maison && getExercice(e.maison) && (
                    <Link to={`/exo/${e.maison}`} className="bloc-alt">
                      🏠 À la maison : {getExercice(e.maison)!.nom}
                    </Link>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
