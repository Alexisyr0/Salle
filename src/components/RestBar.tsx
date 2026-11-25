import { ajouterRepos, stopRepos, useRepos } from '../lib/timer'

export default function RestBar() {
  const r = useRepos()
  if (!r) return null
  const pct = r.duree ? (r.restant / r.duree) * 100 : 0
  const mm = Math.floor(r.restant / 60)
  const ss = String(r.restant % 60).padStart(2, '0')
  return (
    <div className="restbar" role="timer" aria-live="polite">
      <div className="restbar-fill" style={{ width: `${pct}%` }} />
      <span className="restbar-label">Repos</span>
      <span className="restbar-time">
        {mm}:{ss}
      </span>
      <button onClick={() => ajouterRepos(15)} aria-label="Ajouter 15 secondes">
        +15 s
      </button>
      <button onClick={stopRepos}>Passer</button>
    </div>
  )
}
