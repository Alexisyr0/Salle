export const SEMAINE = [
  { jour: 'Lundi', seance: 'Muscu full body A', duree: '40 min' },
  { jour: 'Mardi', seance: 'Activation + course intense + mobilité', duree: '50 min' },
  { jour: 'Mercredi', seance: 'Muscu full body B', duree: '45 min' },
  { jour: 'Jeudi', seance: 'Activation + EF + mobilité', duree: '45 min' },
  { jour: 'Vendredi', seance: 'Renfo maison', duree: '25 min' },
  { jour: 'Samedi', seance: 'Activation + sortie longue + mobilité', duree: '60–70 min' },
  { jour: 'Dimanche', seance: 'Repos + mobilité', duree: '10 min' },
]

export interface Bloc {
  titre: string
  consigne: string
  exercices: string[]
}

export interface SeanceProg {
  id: string
  titre: string
  sousTitre: string
  blocs: Bloc[]
}

const SUPERSET = '1 série de chaque, puis 75 s de repos. 1 à 2 reps en réserve.'
const TROIS_SEPT =
  '3/7 : 3 reps, 15 s, 4, 15 s, 5, 15 s, 6, 15 s, 7. Repos 45 s, puis l\'autre exercice. 2 tours.'

export const SEANCES: SeanceProg[] = [
  {
    id: 'A',
    titre: 'Full body A',
    sousTitre: 'Lundi · salle · 40 min',
    blocs: [
      { titre: 'Échauffement', consigne: '3 min de rameur ou vélo, puis pont fessier 12, monster walk 10/côté, pompes 8.', exercices: ['pont-fessier', 'monster-walk'] },
      { titre: 'Bloc 1 · classique', consigne: SUPERSET, exercices: ['goblet-squat', 'gainage-planche'] },
      { titre: 'Bloc 2 · classique', consigne: SUPERSET, exercices: ['souleve-de-terre-roumain', 'mollets-debout'] },
      { titre: 'Bloc 3 · 3/7', consigne: TROIS_SEPT, exercices: ['developpe-couche-halteres', 'tirage-vertical'] },
      { titre: 'Bloc 4 · 3/7', consigne: TROIS_SEPT, exercices: ['elevations-laterales', 'curl-biceps'] },
    ],
  },
  {
    id: 'B',
    titre: 'Full body B',
    sousTitre: 'Mercredi · salle · 45 min',
    blocs: [
      { titre: 'Échauffement', consigne: '3 min de rameur ou vélo, puis pont fessier 12, monster walk 10/côté.', exercices: ['pont-fessier', 'monster-walk'] },
      { titre: 'Bloc 1 · classique', consigne: SUPERSET, exercices: ['hip-thrust', 'mollets-assis'] },
      { titre: 'Bloc 2 · classique', consigne: SUPERSET, exercices: ['squat-bulgare', 'gainage-lateral'] },
      { titre: 'Bloc 3 · 3/7', consigne: TROIS_SEPT, exercices: ['developpe-militaire', 'tirage-horizontal'] },
      { titre: 'Bloc 4 · 3/7', consigne: TROIS_SEPT, exercices: ['developpe-incline-halteres', 'face-pull'] },
    ],
  },
  {
    id: 'Maison',
    titre: 'Renfo maison',
    sousTitre: 'Vendredi · 25 min',
    blocs: [
      {
        titre: 'Circuit · 3 tours',
        consigne: 'Enchaîne les 6 exercices sans pause, 1 min 30 de repos entre les tours.',
        exercices: ['souleve-de-terre-1-jambe', 'elevation-soleaire', 'pont-fessier-1-jambe', 'squat-pointes', 'chaise-mur', 'monster-walk'],
      },
    ],
  },
  {
    id: 'Activation',
    titre: 'Activation genou',
    sousTitre: 'Avant chaque course · 5 min',
    blocs: [
      { titre: 'Enchaînement', consigne: 'Pont 2 × 12, monster walk 2 × 10/côté, chaise 2 × 30 s, pointes 15.', exercices: ['pont-fessier', 'monster-walk', 'chaise-mur', 'montees-pointes'] },
    ],
  },
  {
    id: 'Mobilité',
    titre: 'Mobilité',
    sousTitre: 'Après chaque course et le dimanche · 10 min',
    blocs: [
      {
        titre: 'Routine',
        consigne: 'Dans l\'ordre, sans forcer.',
        exercices: ['cheville-genou-mur', 'fente-basse', 'hanches-90-90', 'etirement-mollet', 'rouleau-quadriceps', 'thread-the-needle'],
      },
    ],
  },
]
