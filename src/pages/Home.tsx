import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import BodyMap from '../components/BodyMap'
import ExerciseCard from '../components/ExerciseCard'
import { EXERCICES } from '../data/exercises'
import { MUSCLES, MUSCLE_IDS } from '../data/muscles'
import { matches } from '../lib/search'
import type { Materiel, MuscleId } from '../types'

const MATERIELS: Materiel[] = ['Haltères', 'Barre', 'Machine', 'Poulie', 'Poids du corps', 'Mini-élastique', 'Tapis']
const MAISON: Materiel[] = ['Poids du corps', 'Mini-élastique', 'Tapis']

export default function Home() {
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const muscle = (params.get('m') as MuscleId | null) ?? null
  const mat = (params.get('mat') as Materiel | null) ?? null
  const [vue, setVue] = useState<'face' | 'dos'>(muscle && MUSCLES[muscle]?.vue === 'dos' ? 'dos' : 'face')

  const set = (k: string, v: string | null) => {
    const p = new URLSearchParams(params)
    if (v) p.set(k, v)
    else p.delete(k)
    setParams(p, { replace: true })
  }

  const pickMuscle = (m: MuscleId) => set('m', muscle === m ? null : m)

  const list = useMemo(() => {
    const r = EXERCICES.filter(
      (e) =>
        matches(e, q) &&
        (!muscle || e.principaux.includes(muscle) || e.secondaires.includes(muscle)) &&
        (!mat || (mat === ('maison' as Materiel) ? MAISON.includes(e.materiel) : e.materiel === mat)),
    )
    if (muscle) r.sort((a, b) => Number(b.principaux.includes(muscle)) - Number(a.principaux.includes(muscle)))
    return r
  }, [q, muscle, mat])

  const filtersOn = q || muscle || mat

  return (
    <div className="page">
      <div className="search-wrap">
        <span className="search-ic" aria-hidden>
          ⌕
        </span>
        <input
          className="search"
          type="search"
          placeholder="Rechercher un exercice, un muscle…"
          value={q}
          onChange={(ev) => set('q', ev.target.value || null)}
          aria-label="Rechercher"
        />
      </div>

      <section className="map-section">
        <div className="seg" role="tablist" aria-label="Vue du corps">
          <button className={vue === 'face' ? 'on' : ''} onClick={() => setVue('face')} role="tab" aria-selected={vue === 'face'}>
            Face
          </button>
          <button className={vue === 'dos' ? 'on' : ''} onClick={() => setVue('dos')} role="tab" aria-selected={vue === 'dos'}>
            Dos
          </button>
        </div>
        <BodyMap vue={vue} selected={muscle} onSelect={pickMuscle} />
        <p className="hint">{muscle ? MUSCLES[muscle].nom : 'Touche un muscle pour voir ses exercices'}</p>
      </section>

      <div className="chips" aria-label="Muscles">
        {MUSCLE_IDS.filter((m) => EXERCICES.some((e) => e.principaux.includes(m) || e.secondaires.includes(m))).map((m) => (
          <button
            key={m}
            className={'chip' + (muscle === m ? ' on' : '')}
            onClick={() => {
              pickMuscle(m)
              if (MUSCLES[m].vue !== 'les deux') setVue(MUSCLES[m].vue as 'face' | 'dos')
            }}
          >
            {MUSCLES[m].nom}
          </button>
        ))}
      </div>
      <div className="chips" aria-label="Matériel">
        <button className={'chip chip-alt' + (mat === ('maison' as Materiel) ? ' on' : '')} onClick={() => set('mat', mat === ('maison' as Materiel) ? null : 'maison')}>
          🏠 À la maison
        </button>
        {MATERIELS.filter((x) => EXERCICES.some((e) => e.materiel === x)).map((x) => (
          <button key={x} className={'chip chip-alt' + (mat === x ? ' on' : '')} onClick={() => set('mat', mat === x ? null : x)}>
            {x}
          </button>
        ))}
      </div>

      <div className="list-head">
        <h2>
          {list.length} exercice{list.length > 1 ? 's' : ''}
        </h2>
        {filtersOn && (
          <button className="link-btn" onClick={() => setParams(new URLSearchParams(), { replace: true })}>
            Tout effacer
          </button>
        )}
      </div>
      <div className="list">
        {list.map((e) => (
          <ExerciseCard key={e.id} e={e} />
        ))}
        {!list.length && <p className="empty">Aucun exercice ne correspond. Essaie un autre mot.</p>}
      </div>
    </div>
  )
}
