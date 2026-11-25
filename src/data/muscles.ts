import type { MuscleId } from '../types'

export const MUSCLES: Record<MuscleId, { nom: string; vue: 'face' | 'dos' | 'les deux' }> = {
  pectoraux: { nom: 'Pectoraux', vue: 'face' },
  epaules: { nom: 'Épaules', vue: 'face' },
  'arriere-epaules': { nom: "Arrière d'épaules", vue: 'dos' },
  trapezes: { nom: 'Trapèzes', vue: 'dos' },
  dorsaux: { nom: 'Dorsaux', vue: 'dos' },
  lombaires: { nom: 'Lombaires', vue: 'dos' },
  biceps: { nom: 'Biceps', vue: 'face' },
  triceps: { nom: 'Triceps', vue: 'dos' },
  'avant-bras': { nom: 'Avant-bras', vue: 'les deux' },
  abdominaux: { nom: 'Abdominaux', vue: 'face' },
  obliques: { nom: 'Obliques', vue: 'face' },
  fessiers: { nom: 'Fessiers', vue: 'dos' },
  quadriceps: { nom: 'Quadriceps', vue: 'face' },
  ischios: { nom: 'Ischio-jambiers', vue: 'dos' },
  adducteurs: { nom: 'Adducteurs', vue: 'face' },
  mollets: { nom: 'Mollets', vue: 'les deux' },
}

export const MUSCLE_IDS = Object.keys(MUSCLES) as MuscleId[]
