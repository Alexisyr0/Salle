import { Link } from 'react-router-dom'
import type { Exercice } from '../types'
import { type Serie, type SessionLog, updateSession } from '../lib/store'
import { conseil, dernieresSeries, disques, e1rm, fmtKg, objectif, recordsAvant, travail, volumeSeries } from '../lib/stats'
import { lancerRepos } from '../lib/timer'

interface Props {
  exo: Exercice
  session: SessionLog
  journal: SessionLog[]
}

const num = (v: string) => {
  const n = parseFloat(v.replace(',', '.'))
  return Number.isFinite(n) ? n : 0
}

export default function ExoLogger({ exo, session, journal }: Props) {
  const entree = session.entrees.find((e) => e.exoId === exo.id)
  const series = entree?.series ?? []
  const avant = journal.filter((s) => s.date < session.date)
  const precedent = dernieresSeries(journal, exo.id, session.date)
  const obj = objectif(exo)
  const astuce = conseil(exo, avant)
  const rec = recordsAvant(journal, exo.id, session.date)
  const bestToday = Math.max(0, ...travail(series).map(e1rm))
  const maxToday = Math.max(0, ...travail(series).map((s) => s.kg))
  const record = rec.e1rm > 0 && bestToday > rec.e1rm + 0.01
  const repos = obj?.troisSept ? 45 : 75
  const sansCharge = exo.materiel === 'Poids du corps' && !!obj?.temps

  const setSeries = (fn: (s: Serie[]) => Serie[]) =>
    updateSession(session.id, (s) => {
      if (!s.debut) s.debut = new Date().toISOString()
      let e = s.entrees.find((x) => x.exoId === exo.id)
      if (!e) {
        e = { exoId: exo.id, series: [] }
        s.entrees.push(e)
      }
      e.series = fn(e.series)
      s.entrees = s.entrees.filter((x) => x.series.length)
      return s
    })

  const ajouter = () =>
    setSeries((s) => {
      const i = s.length
      const base = s[i - 1] ?? precedent?.[i] ?? precedent?.[precedent.length - 1]
      return [...s, { kg: base?.kg ?? 0, reps: base?.reps ?? obj?.reps ?? 10 }]
    })

  const maj = (i: number, patch: Partial<Serie>) => setSeries((s) => s.map((x, j) => (j === i ? { ...x, ...patch } : x)))
  const suppr = (i: number) => setSeries((s) => s.filter((_, j) => j !== i))
  const valider = (i: number) => {
    const fait = !series[i]?.fait
    maj(i, { fait })
    if (fait) lancerRepos(repos)
  }

  const plaques = exo.materiel === 'Barre' && maxToday > 20 ? disques(maxToday) : undefined

  return (
    <section className="card logger">
      <div className="logger-head">
        <Link to={`/exo/${exo.id}`} className="logger-title">
          {exo.nom} <span className="chev">›</span>
        </Link>
        {record && <span className="tag tag-pr">🏆 Record</span>}
      </div>
      <div className="logger-meta">
        {obj && (
          <span>
            Objectif : {obj.troisSept ? '3/7 · 2 tours de 25 reps' : `${obj.series} × ${obj.reps}${obj.temps ? ' s' : ''}`}
          </span>
        )}
        {precedent && (
          <span>
            Dernière fois : {travail(precedent).length} série{travail(precedent).length > 1 ? 's' : ''}, max {fmtKg(Math.max(0, ...travail(precedent).map((s) => s.kg)))}
          </span>
        )}
      </div>
      {astuce && <p className="logger-tip">💡 {astuce}</p>}

      {series.length > 0 && (
        <div className="sets">
          <div className="set-row set-head">
            <span>Série</span>
            <span>Préc.</span>
            <span>{sansCharge ? 'kg' : 'kg'}</span>
            <span>{obj?.temps ? 'sec' : 'reps'}</span>
            <span />
          </div>
          {series.map((s, i) => {
            const p = precedent?.[i]
            return (
              <div key={i} className={'set-row' + (s.fait ? ' done' : '') + (s.echauf ? ' warm' : '')}>
                <button className="set-n" onClick={() => maj(i, { echauf: !s.echauf })} title="Toucher pour marquer en échauffement">
                  {s.echauf ? 'É' : i + 1 - series.slice(0, i).filter((x) => x.echauf).length}
                </button>
                <span className="set-prev">{p ? `${p.kg}×${p.reps}` : '–'}</span>
                <input
                  inputMode="decimal"
                  value={s.kg || ''}
                  placeholder="0"
                  onChange={(e) => maj(i, { kg: num(e.target.value) })}
                  aria-label={`Charge série ${i + 1}`}
                />
                <input
                  inputMode="numeric"
                  value={s.reps || ''}
                  placeholder="0"
                  onChange={(e) => maj(i, { reps: Math.round(num(e.target.value)) })}
                  aria-label={`Répétitions série ${i + 1}`}
                />
                <span className="set-actions">
                  <button className="set-ok" onClick={() => valider(i)} aria-label="Valider la série">
                    ✓
                  </button>
                  <button className="set-del" onClick={() => suppr(i)} aria-label="Supprimer la série">
                    ×
                  </button>
                </span>
              </div>
            )
          })}
        </div>
      )}

      <div className="logger-foot">
        <button className="btn-add" onClick={ajouter}>
          + Série
        </button>
        {series.length > 0 && <span className="logger-vol">Volume : {fmtKg(volumeSeries(series))}</span>}
      </div>
      {plaques && plaques.length > 0 && (
        <p className="logger-plates">
          Barre 20 kg + par côté : <strong>{plaques.join(' + ')}</strong>
        </p>
      )}
    </section>
  )
}
