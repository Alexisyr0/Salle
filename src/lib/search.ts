import type { Exercice } from '../types'
import { MUSCLES } from '../data/muscles'

export const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9/ ]/g, ' ')
    .trim()

export function haystack(e: Exercice) {
  return norm(
    [
      e.nom,
      ...(e.alias ?? []),
      e.materiel,
      ...e.principaux.map((m) => MUSCLES[m].nom),
      ...e.secondaires.map((m) => MUSCLES[m].nom),
      ...e.seances,
    ].join(' '),
  )
}

export function matches(e: Exercice, q: string) {
  const words = norm(q).split(/\s+/).filter(Boolean)
  if (!words.length) return true
  const h = haystack(e)
  return words.every((w) => h.includes(w))
}

export const youtube = (nom: string) =>
  'https://www.youtube.com/results?search_query=' + encodeURIComponent(nom + ' exécution technique')
