import SeanceView from '../components/SeanceView'
import { SEANCES } from '../data/programme'

export default function SeancePage({ id }: { id: string }) {
  const s = SEANCES.find((x) => x.id === id)
  if (!s) return null
  return (
    <div className="page">
      <SeanceView s={s} />
      <section className="card section rules">
        <h2>Rappel</h2>
        <ul>
          <li>Blocs 1-2 : 1 série de chaque, 75 s de repos, 1 à 2 reps en réserve.</li>
          <li>Blocs 3-4 (3/7) : 3-4-5-6-7 reps avec 15 s de pause, 45 s puis l'autre exercice, 2 tours. Pas de 7 au dernier palier : baisse la charge.</li>
          <li>Genou : douleur au-dessus de 3/10, tu réduis l'amplitude ou la charge.</li>
        </ul>
      </section>
    </div>
  )
}
