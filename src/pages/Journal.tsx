import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import BodyMap from '../components/BodyMap'
import SyncCard from '../components/SyncCard'
import { getExercice } from '../data/exercises'
import { MUSCLES } from '../data/muscles'
import { SEANCES } from '../data/programme'
import { deleteSession, exportJson, importJson, pruneEmpty, today, useJournal } from '../lib/store'
import {
  ajouterJours,
  dateLongue,
  dureeTexte,
  e1rm,
  fmtKg,
  historique,
  lundi,
  totalPeriode,
  travail,
  volumeEntree,
  volumeSession,
} from '../lib/stats'
import type { MuscleId } from '../types'

const JOURS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

export default function Journal() {
  const journal = useJournal()
  const [params, setParams] = useSearchParams()
  const nav = useNavigate()
  const jour = params.get('d') ?? today()
  const [mois, setMois] = useState(jour.slice(0, 7))
  const [vue, setVue] = useState<'face' | 'dos'>('face')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    pruneEmpty()
  }, [])

  const actifs = journal.filter((s) => s.entrees.some((e) => e.series.length))
  const parJour = useMemo(() => {
    const m = new Map<string, typeof actifs>()
    actifs.forEach((s) => m.set(s.date, [...(m.get(s.date) ?? []), s]))
    return m
  }, [actifs])

  // Grille du mois
  const [y, mo] = mois.split('-').map(Number)
  const premier = new Date(y, mo - 1, 1)
  const decal = (premier.getDay() + 6) % 7
  const nbJours = new Date(y, mo, 0).getDate()
  const cases: (string | null)[] = [
    ...Array(decal).fill(null),
    ...Array.from({ length: nbJours }, (_, i) => `${mois}-${String(i + 1).padStart(2, '0')}`),
  ]
  const changeMois = (n: number) => {
    const d = new Date(y, mo - 1 + n, 1)
    setMois(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }

  // Semaine en cours vs précédente
  const l = lundi(today())
  const cetteSemaine = totalPeriode(actifs, l, ajouterJours(l, 6))
  // même période de la semaine précédente (lundi → même jour), pour comparer à égalité
  const semPrec = totalPeriode(actifs, ajouterJours(l, -7), ajouterJours(today(), -7))
  const evol = semPrec > 0 ? Math.round(((cetteSemaine - semPrec) / semPrec) * 100) : undefined
  const seancesMois = actifs.filter((s) => s.date.startsWith(today().slice(0, 7))).length
  const total = actifs.reduce((t, s) => t + volumeSession(s), 0)

  // Séries par muscle sur 7 jours (principal = 1, secondaire = 0,5)
  const seriesMuscle = useMemo(() => {
    const debut = ajouterJours(today(), -6)
    const out: Partial<Record<MuscleId, number>> = {}
    actifs
      .filter((s) => s.date >= debut)
      .forEach((s) =>
        s.entrees.forEach((en) => {
          const ex = getExercice(en.exoId)
          if (!ex) return
          const n = travail(en.series).length
          ex.principaux.forEach((m) => (out[m] = (out[m] ?? 0) + n))
          ex.secondaires.forEach((m) => (out[m] = (out[m] ?? 0) + n / 2))
        }),
      )
    return out
  }, [actifs])
  const maxSeries = Math.max(1, ...Object.values(seriesMuscle).map((v) => v ?? 0))
  const intensite = Object.fromEntries(Object.entries(seriesMuscle).map(([k, v]) => [k, (v ?? 0) / maxSeries]))

  // Records : meilleur e1RM par exercice
  const records = useMemo(() => {
    const ids = [...new Set(actifs.flatMap((s) => s.entrees.map((e) => e.exoId)))]
    return ids
      .map((id) => {
        const h = historique(actifs, id)
        const best = h.reduce((b, p) => (p.e1rm > b.e1rm ? p : b), h[0])
        return { id, best }
      })
      .filter((r) => r.best && r.best.e1rm > 0)
      .sort((a, b) => b.best.date.localeCompare(a.best.date))
      .slice(0, 6)
  }, [actifs])

  const duJour = parJour.get(jour) ?? []

  const exporter = () => {
    const blob = new Blob([exportJson()], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `muscu-sauvegarde-${today()}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <div className="page">
      <h1 className="page-title">Journal</h1>

      <div className="stats-row">
        <div className="stat">
          <span className="stat-v">{fmtKg(cetteSemaine)}</span>
          <span className="stat-l">
            cette sem.{evol !== undefined && <em className={evol >= 0 ? 'up' : 'down'}> {evol >= 0 ? '+' : ''}{evol} %</em>}
          </span>
        </div>
        <div className="stat">
          <span className="stat-v">{seancesMois}</span>
          <span className="stat-l">séances ce mois</span>
        </div>
        <div className="stat">
          <span className="stat-v">{fmtKg(total)}</span>
          <span className="stat-l">au total</span>
        </div>
      </div>

      <section className="card cal">
        <div className="cal-head">
          <button onClick={() => changeMois(-1)} aria-label="Mois précédent">
            ‹
          </button>
          <span>{premier.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</span>
          <button onClick={() => changeMois(1)} aria-label="Mois suivant">
            ›
          </button>
        </div>
        <div className="cal-grid">
          {JOURS.map((j, i) => (
            <span key={i} className="cal-dow">
              {j}
            </span>
          ))}
          {cases.map((d, i) =>
            d ? (
              <button
                key={d}
                className={'cal-day' + (d === jour ? ' sel' : '') + (d === today() ? ' today' : '')}
                onClick={() => setParams({ d }, { replace: true })}
              >
                {Number(d.slice(8))}
                <span className="cal-dots">
                  {(parJour.get(d) ?? []).map((s) => (
                    <i key={s.id} className={`cal-dot s-${s.seance ?? 'libre'}`} />
                  ))}
                </span>
              </button>
            ) : (
              <span key={'v' + i} />
            ),
          )}
        </div>
        <div className="cal-legend">
          <span><i className="cal-dot s-A" /> Body A</span>
          <span><i className="cal-dot s-B" /> Body B</span>
          <span><i className="cal-dot s-Maison" /> Maison</span>
          <span><i className="cal-dot s-libre" /> Autre</span>
        </div>
      </section>

      <div className="day-head">
        <h2>{dateLongue(jour)}</h2>
      </div>
      {duJour.length === 0 && (
        <div className="card section day-empty">
          <p>Rien de noté ce jour-là.</p>
          <div className="actions">
            {SEANCES.filter((s) => ['A', 'B', 'Maison'].includes(s.id)).map((s) => (
              <Link key={s.id} className="btn" to={`/log/${jour}?seance=${s.id}`}>
                {s.id === 'Maison' ? 'Maison' : `Body ${s.id}`}
              </Link>
            ))}
            <Link className="btn" to={`/log/${jour}`}>
              Libre
            </Link>
          </div>
        </div>
      )}
      {duJour.map((s) => {
        const prog = SEANCES.find((p) => p.id === s.seance)
        return (
          <section key={s.id} className="card section">
            <div className="sum-head">
              <h3>{prog?.titre ?? 'Séance libre'}</h3>
              <span>
                {fmtKg(volumeSession(s))}
                {dureeTexte(s.debut, s.fin) && s.fin ? ` · ${dureeTexte(s.debut, s.fin)}` : ''}
              </span>
            </div>
            {s.entrees.map((en) => {
              const ex = getExercice(en.exoId)
              const tw = travail(en.series)
              return (
                <div key={en.exoId} className="sum-row">
                  <Link to={`/exo/${en.exoId}`} className="sum-name">
                    {ex?.nom ?? en.exoId}
                  </Link>
                  <span className="sum-sets">{tw.map((x) => `${x.kg}×${x.reps}`).join(' · ')}</span>
                  <span className="sum-vol">{fmtKg(volumeEntree(en))}</span>
                </div>
              )
            })}
            {s.note && <p className="sum-note">« {s.note} »</p>}
            <div className="actions">
              <button className="btn" onClick={() => nav(`/log/${s.date}${s.seance ? `?seance=${s.seance}` : ''}`)}>
                Modifier
              </button>
              <button
                className="btn btn-danger"
                onClick={() => {
                  if (confirm('Supprimer cette séance ?')) deleteSession(s.id)
                }}
              >
                Supprimer
              </button>
            </div>
          </section>
        )
      })}

      <section className="card section">
        <div className="sum-head">
          <h3>Muscles travaillés · 7 jours</h3>
          <div className="seg small">
            <button className={vue === 'face' ? 'on' : ''} onClick={() => setVue('face')}>
              Face
            </button>
            <button className={vue === 'dos' ? 'on' : ''} onClick={() => setVue('dos')}>
              Dos
            </button>
          </div>
        </div>
        <div className="heat">
          <BodyMap vue={vue} intensite={intensite} compact />
          <ul className="heat-list">
            {Object.entries(seriesMuscle)
              .sort(([, a], [, b]) => (b ?? 0) - (a ?? 0))
              .map(([m, v]) => (
                <li key={m}>
                  <span>{MUSCLES[m as MuscleId].nom}</span>
                  <strong>{Math.round((v ?? 0) * 10) / 10}</strong>
                </li>
              ))}
            {!Object.keys(seriesMuscle).length && <li className="muted">Aucune série cette semaine.</li>}
          </ul>
        </div>
        <p className="muted small-p">Séries par muscle (secondaire = ½ série). Repère courant : 10 à 20 séries par muscle et par semaine.</p>
      </section>

      {records.length > 0 && (
        <section className="card section">
          <h3 className="h3-mb">Records récents</h3>
          {records.map(({ id, best }) => {
            const top = travail(best.series).reduce((a, b) => (e1rm(b) > e1rm(a) ? b : a))
            return (
              <Link key={id} to={`/exo/${id}`} className="sum-row">
                <span className="sum-name">🏆 {getExercice(id)?.nom}</span>
                <span className="sum-sets">
                  {top.kg} kg × {top.reps}
                </span>
                <span className="sum-vol">~{Math.round(best.e1rm)} kg max</span>
              </Link>
            )
          })}
        </section>
      )}

      <SyncCard />

      <section className="card section">
        <h3 className="h3-mb">Sauvegarde fichier</h3>
        <p className="muted small-p">
          Une copie de secours de tout ton journal, en plus de la synchro.
        </p>
        <div className="actions">
          <button className="btn" onClick={exporter}>
            Exporter
          </button>
          <button className="btn" onClick={() => fileRef.current?.click()}>
            Importer
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            hidden
            onChange={async (e) => {
              const f = e.target.files?.[0]
              if (!f) return
              try {
                if (confirm('Remplacer ton journal actuel par ce fichier ?')) importJson(await f.text())
              } catch {
                alert('Fichier invalide.')
              }
              e.target.value = ''
            }}
          />
        </div>
      </section>
    </div>
  )
}
