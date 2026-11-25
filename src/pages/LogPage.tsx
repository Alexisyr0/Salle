import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import ExoLogger from '../components/ExoLogger'
import { EXERCICES, getExercice } from '../data/exercises'
import { SEANCES } from '../data/programme'
import { ensureSession, findSession, today, updateSession, useJournal } from '../lib/store'
import { dateLongue, dureeTexte, fmtKg, volumeSession } from '../lib/stats'

export default function LogPage() {
  const { date = today() } = useParams()
  const [params] = useSearchParams()
  const seance = params.get('seance') ?? undefined
  const exoParam = params.get('exo')
  const journal = useJournal()
  const nav = useNavigate()
  const [, tick] = useState(0)

  useEffect(() => {
    ensureSession(date, seance)
  }, [date, seance])
  useEffect(() => {
    const t = setInterval(() => tick((n) => n + 1), 30000)
    return () => clearInterval(t)
  }, [])

  const session = journal.find((s) => s.date === date && (s.seance ?? '') === (seance ?? '')) ?? findSession(date, seance)
  const prog = SEANCES.find((s) => s.id === seance)
  const ids: string[] = []
  const push = (id: string) => !ids.includes(id) && getExercice(id) && ids.push(id)
  prog?.blocs.filter((b) => !b.titre.startsWith('Échauffement')).forEach((b) => b.exercices.forEach(push))
  session?.entrees.forEach((e) => push(e.exoId))
  if (exoParam) push(exoParam)
  const [extra, setExtra] = useState<string[]>([])
  extra.forEach(push)

  if (!session) return <div className="page" />

  const vol = volumeSession(session)
  const nbSeries = session.entrees.reduce((t, e) => t + e.series.filter((s) => !s.echauf).length, 0)
  const faites = session.entrees.reduce((t, e) => t + e.series.filter((s) => s.fait && !s.echauf).length, 0)

  return (
    <div className="page">
      <div className="log-head">
        <h1>{prog ? prog.titre : 'Séance libre'}</h1>
        <span className="log-date">{dateLongue(date)}</span>
      </div>
      <div className="stats-row">
        <div className="stat">
          <span className="stat-v">{fmtKg(vol)}</span>
          <span className="stat-l">soulevés</span>
        </div>
        <div className="stat">
          <span className="stat-v">
            {faites}/{nbSeries}
          </span>
          <span className="stat-l">séries validées</span>
        </div>
        <div className="stat">
          <span className="stat-v">{dureeTexte(session.debut, session.fin) ?? '–'}</span>
          <span className="stat-l">durée</span>
        </div>
      </div>

      {ids.map((id) => (
        <ExoLogger key={id} exo={getExercice(id)!} session={session} journal={journal} />
      ))}

      <label className="add-exo">
        <span>+ Ajouter un exercice</span>
        <select
          value=""
          onChange={(e) => {
            if (e.target.value) setExtra((x) => [...x, e.target.value])
          }}
        >
          <option value="">Choisir…</option>
          {EXERCICES.filter((e) => !ids.includes(e.id)).map((e) => (
            <option key={e.id} value={e.id}>
              {e.nom}
            </option>
          ))}
        </select>
      </label>

      <textarea
        className="note-input"
        placeholder="Note sur la séance (forme, genou, sensations…)"
        value={session.note ?? ''}
        onChange={(e) => updateSession(session.id, (s) => ({ ...s, note: e.target.value }))}
      />

      <button
        className="btn btn-primary btn-block"
        onClick={() => {
          updateSession(session.id, (s) => ({ ...s, fin: s.debut ? new Date().toISOString() : undefined }))
          nav(`/journal?d=${date}`)
        }}
      >
        Terminer la séance
      </button>
    </div>
  )
}
