export type MuscleId =
  | 'pectoraux'
  | 'epaules'
  | 'arriere-epaules'
  | 'trapezes'
  | 'dorsaux'
  | 'lombaires'
  | 'biceps'
  | 'triceps'
  | 'avant-bras'
  | 'abdominaux'
  | 'obliques'
  | 'fessiers'
  | 'quadriceps'
  | 'ischios'
  | 'adducteurs'
  | 'mollets'

export type Materiel =
  | 'Haltères'
  | 'Barre'
  | 'Machine'
  | 'Poulie'
  | 'Poids du corps'
  | 'Élastique'
  | 'Rouleau'

export type Genou = 'ok' | 'prudence' | 'eviter'

export type Seance = 'A' | 'B' | 'Maison' | 'Activation' | 'Mobilité' | 'Extra'

export interface Exercice {
  id: string
  nom: string
  alias?: string[]
  principaux: MuscleId[]
  secondaires: MuscleId[]
  materiel: Materiel
  /** Format dans le programme, ex. "3 × 8" ou "3/7 × 2 tours" */
  format?: string
  etapes: string[]
  aEviter: string[]
  genou: Genou
  genouNote?: string
  /** Lien vérifié vers la fiche ExRx (animation). Absent = pas de fiche ExRx. */
  exrx?: string
  /** 'exrx' = consignes reprises (reformulées) de la fiche ExRx ; 'claude' = pas de fiche ExRx */
  source: 'exrx' | 'claude'
  seances: Seance[]
}
