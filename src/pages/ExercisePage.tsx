import { Link, useNavigate, useParams } from 'react-router-dom'
import BodyMap from '../components/BodyMap'
import ExerciseCard from '../components/ExerciseCard'
import GenouBadge from '../components/GenouBadge'
import { EXERCICES, getExercice } from '../data/exercises'
import { MUSCLES } from '../data/muscles'
import { youtube } from '../lib/search'
import LineChart from '../components/LineChart'
import { today, useJournal } from '../lib/store'
import { conseil, dateCourte, fmtKg, historique, travail } from '../lib/stats'
import { useState } from 'react'

export default function ExercisePage() {
  const { id = '' } = useParams()
  const nav = useNavigate()
  const e = getExercice(id)
  const journal = useJournal()
  const [mesure, setMesure] = useState<'e1rm' | 'maxKg' | 'volume'>('e1rm')
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

      {e.maison && getExercice(e.maison) && (
        <Link to={`/exo/${e.maison}`} className="card alt-card">
          <span className="alt-ic">🏠</span>
          <span>
            <span className="alt-l">Sans matériel, à la maison</span>
            <span className="alt-n">{getExercice(e.maison)!.nom}</span>
          </span>
          <span className="chev">›</span>
        </Link>
      )}
      {(() => {
        const pour = EXERCICES.filter((x) => x.maison === e.id)
        return pour.length ? (
          <p className="muted small-p alt-for">Remplace à la maison : {pour.map((x) => x.nom).join(', ')}</p>
        ) : null
      })()}

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

      <section className="card section prog">
        <div className="sum-head">
          <h2>Ma progression</h2>
          <Link className="btn-add" to={`/log/${today()}?exo=${e.id}`}>
            + Noter
          </Link>
        </div>
        {(() => {
          const h = historique(journal, e.id)
          if (!h.length) return <p className="muted">Aucune série notée. Touche « + Noter » ou lance une séance depuis Body A / Body B.</p>
          const totalKg = h.reduce((t, p) => t + p.volume, 0)
          const best = h.reduce((b, p) => (p.e1rm > b.e1rm ? p : b), h[0])
          const last = h[h.length - 1]
          const astuce = conseil(e, journal)
          return (
            <>
              <div className="stats-row">
                <div className="stat">
                  <span className="stat-v">{fmtKg(totalKg)}</span>
                  <span className="stat-l">soulevés au total</span>
                </div>
                <div className="stat">
                  <span className="stat-v">{fmtKg(best.maxKg)}</span>
                  <span className="stat-l">charge max</span>
                </div>
                <div className="stat">
                  <span className="stat-v">~{Math.round(best.e1rm)} kg</span>
                  <span className="stat-l">max estimé sur 1 rep</span>
                </div>
              </div>
              {astuce && <p className="logger-tip">💡 {astuce}</p>}
              <div className="seg small seg-chart">
                <button className={mesure === 'e1rm' ? 'on' : ''} onClick={() => setMesure('e1rm')}>Max estimé</button>
                <button className={mesure === 'maxKg' ? 'on' : ''} onClick={() => setMesure('maxKg')}>Charge max</button>
                <button className={mesure === 'volume' ? 'on' : ''} onClick={() => setMesure('volume')}>Volume</button>
              </div>
              <LineChart points={h.map((p) => ({ date: p.date, v: p[mesure] }))} />
              <div className="hist">
                {[...h].reverse().slice(0, 8).map((p) => (
                  <div key={p.date} className="sum-row">
                    <span className="sum-name">{dateCourte(p.date)}</span>
                    <span className="sum-sets">{travail(p.series).map((x) => `${x.kg}×${x.reps}`).join(' · ')}</span>
                    <span className="sum-vol">{fmtKg(p.volume)}</span>
                  </div>
                ))}
              </div>
              <p className="muted small-p">Dernière séance : {dateCourte(last.date)}. Le max estimé (formule d'Epley) sert à comparer tes séances, ce n'est pas un test.</p>
            </>
          )
        })()}
      </section>

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
