import type { Exercice } from '../types'
import type { Entree, Serie, SessionLog } from './store'

export const travail = (series: Serie[]) => series.filter((s) => !s.echauf)
export const volumeSeries = (series: Serie[]) => travail(series).reduce((t, s) => t + (s.kg || 0) * (s.reps || 0), 0)
export const volumeEntree = (e: Entree) => volumeSeries(e.series)
export const volumeSession = (s: SessionLog) => s.entrees.reduce((t, e) => t + volumeEntree(e), 0)

/** Estimation du max sur 1 répétition (formule d'Epley) */
export const e1rm = (s: Serie) => (s.reps > 0 && s.kg > 0 ? s.kg * (1 + s.reps / 30) : 0)

export const fmtKg = (n: number) => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 }).format(n) + ' kg'

export interface PointExo {
  date: string
  maxKg: number
  e1rm: number
  volume: number
  series: Serie[]
}

/** Historique d'un exercice, une ligne par jour, du plus ancien au plus récent */
export function historique(journal: SessionLog[], exoId: string): PointExo[] {
  const byDate = new Map<string, Serie[]>()
  for (const s of journal)
    for (const e of s.entrees)
      if (e.exoId === exoId && e.series.length) byDate.set(s.date, [...(byDate.get(s.date) ?? []), ...e.series])
  return [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, series]) => ({
      date,
      series,
      maxKg: Math.max(0, ...travail(series).map((x) => x.kg || 0)),
      e1rm: Math.max(0, ...travail(series).map(e1rm)),
      volume: volumeSeries(series),
    }))
}

/** Dernières séries notées pour un exercice (avant une date donnée, exclue) */
export function dernieresSeries(journal: SessionLog[], exoId: string, avant?: string): Serie[] | undefined {
  const h = historique(journal, exoId).filter((p) => !avant || p.date < avant)
  return h.length ? h[h.length - 1].series : undefined
}

/** Objectif tiré du format du programme : "3 × 8" → 3 séries de 8 ; "3/7 × 2 tours" → 2 tours de 25 */
export function objectif(e: Exercice): { series: number; reps: number; temps: boolean; troisSept: boolean } | undefined {
  const f = e.format ?? ''
  if (f.startsWith('3/7')) return { series: 2, reps: 25, temps: false, troisSept: true }
  const m = f.match(/(\d+)\s*×\s*(\d+)\s*(s)?/)
  if (!m) return undefined
  return { series: +m[1], reps: +m[2], temps: !!m[3], troisSept: false }
}

const BAS = ['quadriceps', 'ischios', 'fessiers', 'mollets', 'adducteurs']

/** Conseil de progression basé sur la dernière séance */
export function conseil(e: Exercice, journal: SessionLog[]): string | undefined {
  const h = historique(journal, e.id)
  if (!h.length) return undefined
  const last = h[h.length - 1]
  const obj = objectif(e)
  if (!obj || obj.temps) return undefined
  const tw = travail(last.series)
  const lourdes = tw.filter((s) => s.kg === last.maxKg)
  const reussi = tw.length >= obj.series && tw.slice(0, obj.series).every((s) => s.reps >= obj.reps)
  const bas = e.principaux.some((m) => BAS.includes(m))
  const pas = bas ? '2,5 à 5 kg' : '1 à 2 kg'
  if (reussi) {
    const avant = h.length >= 2 ? h[h.length - 2] : undefined
    const deuxFois =
      avant &&
      avant.maxKg === last.maxKg &&
      travail(avant.series).length >= obj.series &&
      travail(avant.series).slice(0, obj.series).every((s) => s.reps >= obj.reps)
    if (obj.troisSept) return `Deux tours complets à ${fmtKg(last.maxKg)} : monte de 1 à 2 kg la prochaine fois.`
    return deuxFois
      ? `Objectif atteint 2 séances de suite à ${fmtKg(last.maxKg)} : monte de ${pas}.`
      : `Objectif atteint à ${fmtKg(last.maxKg)}. Encore une séance réussie à ce poids et tu montes de ${pas}.`
  }
  if (lourdes.length && lourdes.some((s) => s.reps < obj.reps * 0.6))
    return `Les reps ont beaucoup chuté à ${fmtKg(last.maxKg)} : reste à ce poids ou baisse un peu.`
  return `Garde ${fmtKg(last.maxKg)} jusqu'à faire ${obj.series} × ${obj.reps} proprement.`
}

/** Lundi de la semaine d'une date YYYY-MM-DD */
export function lundi(date: string) {
  const d = new Date(date + 'T12:00:00')
  const day = (d.getDay() + 6) % 7
  d.setDate(d.getDate() - day)
  return d.toISOString().slice(0, 10)
}

export function totalPeriode(journal: SessionLog[], debut: string, fin: string) {
  return journal.filter((s) => s.date >= debut && s.date <= fin).reduce((t, s) => t + volumeSession(s), 0)
}

export const ajouterJours = (date: string, n: number) => {
  const d = new Date(date + 'T12:00:00')
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

export const dateLongue = (date: string) =>
  new Date(date + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
export const dateCourte = (date: string) =>
  new Date(date + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })

/** Meilleur e1RM et charge max avant une date (exclue) : pour détecter les records */
export function recordsAvant(journal: SessionLog[], exoId: string, date: string) {
  const h = historique(journal, exoId).filter((p) => p.date < date)
  return { e1rm: Math.max(0, ...h.map((p) => p.e1rm)), maxKg: Math.max(0, ...h.map((p) => p.maxKg)) }
}

/** Disques par côté pour une barre de 20 kg */
export function disques(total: number, barre = 20): number[] | undefined {
  let reste = (total - barre) / 2
  if (reste < 0) return undefined
  const dispo = [25, 20, 15, 10, 5, 2.5, 1.25]
  const out: number[] = []
  for (const d of dispo)
    while (reste >= d - 1e-9) {
      out.push(d)
      reste -= d
    }
  return reste > 0.01 ? undefined : out
}

export function dureeTexte(debut?: string, fin?: string) {
  if (!debut) return undefined
  const ms = (fin ? new Date(fin) : new Date()).getTime() - new Date(debut).getTime()
  const min = Math.max(0, Math.round(ms / 60000))
  return min >= 60 ? `${Math.floor(min / 60)} h ${String(min % 60).padStart(2, '0')}` : `${min} min`
}
