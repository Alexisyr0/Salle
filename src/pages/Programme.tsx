import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getExercice } from '../data/exercises'
import { SEANCES, SEMAINE } from '../data/programme'

export default function Programme() {
  const [open, setOpen] = useState<string>('A')
  return (
    <div className="page">
      <h1 className="page-title">Mon programme</h1>

      <section className="card week">
        {SEMAINE.map((j) => (
          <div key={j.jour} className="week-row">
            <span className="week-day">{j.jour}</span>
            <span className="week-s">{j.seance}</span>
            <span className="week-d">{j.duree}</span>
          </div>
        ))}
      </section>

      <div className="seg seg-wide" role="tablist">
        {SEANCES.map((s) => (
          <button key={s.id} className={open === s.id ? 'on' : ''} onClick={() => setOpen(s.id)} role="tab" aria-selected={open === s.id}>
            {s.id === 'A' || s.id === 'B' ? s.id : s.id === 'Activation' ? 'Activ.' : s.id}
          </button>
        ))}
      </div>

      {SEANCES.filter((s) => s.id === open).map((s) => (
        <div key={s.id}>
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
                    <Link key={id} to={`/exo/${id}`} className="bloc-item">
                      <span>{e.nom}</span>
                      <span className="bloc-f">{e.format}</span>
                      <span className="chev">›</span>
                    </Link>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      ))}

      <section className="card section rules">
        <h2>Règles</h2>
        <ul>
          <li>Charges : quand tu fais toutes les reps proprement 2 séances de suite, monte de 1 à 2 kg (haut) ou 2,5 à 5 kg (bas).</li>
          <li>3/7 : si tu n'arrives pas à 7 reps au dernier palier, baisse la charge.</li>
          <li>Genou : douleur au-dessus de 3/10, tu réduis l'amplitude ou la charge.</li>
        </ul>
      </section>
    </div>
  )
}
