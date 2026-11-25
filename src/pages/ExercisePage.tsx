import { Link, useNavigate, useParams } from 'react-router-dom'
import BodyMap from '../components/BodyMap'
import ExerciseCard from '../components/ExerciseCard'
import GenouBadge from '../components/GenouBadge'
import { EXERCICES, getExercice } from '../data/exercises'
import { MUSCLES } from '../data/muscles'
import { youtube } from '../lib/search'

export default function ExercisePage() {
  const { id = '' } = useParams()
  const nav = useNavigate()
  const e = getExercice(id)
  if (!e) {
    return (
      <div className="page">
        <p className="empty">Exercice introuvable.</p>
        <Link to="/">Retour</Link>
      </div>
    )
  }
  const all = [...e.principaux, ...e.secondaires]
  const hasFace = all.some((m) => MUSCLES[m].vue !== 'dos')
  const hasDos = all.some((m) => MUSCLES[m].vue !== 'face')
  const variantes = EXERCICES.filter((x) => x.id !== e.id && x.principaux.some((m) => e.principaux.includes(m))).slice(0, 4)

  return (
    <div className="page">
      <button className="back" onClick={() => (history.length > 1 ? nav(-1) : nav('/'))}>
        ‹ Retour
      </button>
      <header className="exo-head">
        <h1>{e.nom}</h1>
        <div className="tags-row">
          {e.format && <span className="tag tag-format">{e.format}</span>}
          <span className="tag">{e.materiel}</span>
          <GenouBadge g={e.genou} />
        </div>
      </header>

      <div className="exo-maps card">
        {hasFace && <BodyMap vue="face" principaux={e.principaux} secondaires={e.secondaires} compact />}
        {hasDos && <BodyMap vue="dos" principaux={e.principaux} secondaires={e.secondaires} compact />}
        <div className="legend">
          <span>
            <i className="dot dot-main" /> {e.principaux.map((m) => MUSCLES[m].nom).join(', ')}
          </span>
          {e.secondaires.length > 0 && (
            <span>
              <i className="dot dot-sec" /> {e.secondaires.map((m) => MUSCLES[m].nom).join(', ')}
            </span>
          )}
        </div>
      </div>

      <div className="actions">
        {e.exrx && (
          <a className="btn btn-primary" href={e.exrx} target="_blank" rel="noreferrer">
            ▶ Voir l'animation ExRx
          </a>
        )}
        <a className={'btn' + (e.exrx ? '' : ' btn-primary')} href={youtube(e.nom)} target="_blank" rel="noreferrer">
          Vidéos YouTube
        </a>
      </div>

      {e.genouNote && (
        <div className="note">
          <strong>Ton genou :</strong> {e.genouNote}
        </div>
      )}

      <section className="card section">
        <h2>Comment faire</h2>
        <ol className="steps">
          {e.etapes.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>
      </section>

      <section className="card section">
        <h2>À éviter</h2>
        <ul className="avoid">
          {e.aEviter.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      </section>

      <p className="source">
        {e.source === 'exrx'
          ? 'Consignes reprises de la fiche ExRx, reformulées en français.'
          : "Pas de fiche ExRx pour cet exercice : consignes générales, à faire valider par un coach. Regarde les vidéos pour l'exécution."}
      </p>

      {variantes.length > 0 && (
        <section>
          <h2 className="h2-out">Même muscle</h2>
          <div className="list">
            {variantes.map((v) => (
              <ExerciseCard key={v.id} e={v} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
