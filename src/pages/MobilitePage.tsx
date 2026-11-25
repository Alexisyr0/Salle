import { Link } from 'react-router-dom'
import SeanceView from '../components/SeanceView'
import { SEANCES } from '../data/programme'
import { today } from '../lib/store'

export default function MobilitePage() {
  const act = SEANCES.find((s) => s.id === 'Activation')!
  const mob = SEANCES.find((s) => s.id === 'Mobilité')!
  return (
    <div className="page">
      <Link className="btn btn-primary btn-block start" to={`/log/${today()}?seance=Mobilité`}>
        ▶ Noter la mobilité du jour
      </Link>
      <SeanceView s={mob} />
      <SeanceView s={act} />
    </div>
  )
}
