import { useSyncExternalStore } from 'react'
import { supabase, TABLE } from './supabase'

export interface Serie {
  kg: number
  reps: number
  /** série validée */
  fait?: boolean
  /** série d'échauffement : exclue du volume et des records */
  echauf?: boolean
}
export interface Entree {
  exoId: string
  series: Serie[]
}
export interface SessionLog {
  id: string
  date: string // YYYY-MM-DD (heure locale)
  seance?: string // 'A' | 'B' | 'Maison' | …
  entrees: Entree[]
  note?: string
  /** heure de début / fin (ISO) pour le chrono de séance */
  debut?: string
  fin?: string
  /** dernière modification (ISO), pour la synchro */
  maj?: string
}

const KEY = 'muscu-journal-v1'
const DIRTY = 'muscu-sync-dirty'
const DELETED = 'muscu-sync-deleted'
const ONCE = 'muscu-sync-once'

const ls = {
  get<T>(k: string, def: T): T {
    try {
      const raw = localStorage.getItem(k)
      return raw ? (JSON.parse(raw) as T) : def
    } catch {
      return def
    }
  },
  set(k: string, v: unknown) {
    try {
      localStorage.setItem(k, JSON.stringify(v))
    } catch {
      /* stockage indisponible */
    }
  },
}

let cache: SessionLog[] = ls.get<SessionLog[]>(KEY, [])
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

function write(next: SessionLog[]) {
  cache = next
  ls.set(KEY, next)
  emit()
}

export function useJournal() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => cache,
  )
}

export const today = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const uid = () => (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36))

export function findSession(date: string, seance?: string) {
  return cache.find((s) => s.date === date && (s.seance ?? '') === (seance ?? ''))
}

/** Récupère ou crée la séance du jour */
export function ensureSession(date: string, seance?: string): SessionLog {
  const found = findSession(date, seance)
  if (found) return found
  const s: SessionLog = { id: uid(), date, seance, entrees: [], maj: new Date().toISOString() }
  write([...cache, s])
  return s
}

export function updateSession(id: string, fn: (s: SessionLog) => SessionLog) {
  write(cache.map((s) => (s.id === id ? { ...fn(structuredClone(s)), maj: new Date().toISOString() } : s)))
  marquer(id)
}

export function deleteSession(id: string) {
  write(cache.filter((s) => s.id !== id))
  ls.set(DIRTY, ls.get<string[]>(DIRTY, []).filter((x) => x !== id))
  ls.set(DELETED, [...new Set([...ls.get<string[]>(DELETED, []), id])])
  planifier()
}

/** Nettoie les séances vides (aucune série) */
export function pruneEmpty() {
  const vides = cache.filter((s) => !s.entrees.some((e) => e.series.length))
  if (!vides.length) return
  write(cache.filter((s) => s.entrees.some((e) => e.series.length)))
  ls.set(DIRTY, ls.get<string[]>(DIRTY, []).filter((x) => !vides.some((v) => v.id === x)))
  ls.set(DELETED, [...new Set([...ls.get<string[]>(DELETED, []), ...vides.map((v) => v.id)])])
  planifier()
}

export function exportJson() {
  return JSON.stringify({ version: 1, exporte: new Date().toISOString(), sessions: cache }, null, 2)
}

export function importJson(text: string) {
  const data = JSON.parse(text)
  const sessions: SessionLog[] = Array.isArray(data) ? data : data.sessions
  if (!Array.isArray(sessions)) throw new Error('Fichier invalide')
  const maj = new Date().toISOString()
  write(sessions.map((s) => ({ ...s, maj: s.maj ?? maj })))
  ls.set(DIRTY, sessions.map((s) => s.id))
  planifier()
}

/* ───────────────────────── Synchro Supabase ───────────────────────── */

export type EtatSync = 'local' | 'deconnecte' | 'attente' | 'synchro' | 'ok' | 'erreur'
interface Snap {
  etat: EtatSync
  derniereSync: string | null
  erreur: string | null
  email: string | null
}
let snap: Snap = { etat: supabase ? 'deconnecte' : 'local', derniereSync: null, erreur: null, email: null }
const syncListeners = new Set<() => void>()
const setSnap = (patch: Partial<Snap>) => {
  snap = { ...snap, ...patch }
  if (patch.etat === 'ok') snap.derniereSync = new Date().toISOString()
  syncListeners.forEach((l) => l())
}

export function useSync() {
  return useSyncExternalStore(
    (cb) => {
      syncListeners.add(cb)
      return () => syncListeners.delete(cb)
    },
    () => snap,
  )
}

function marquer(id: string) {
  ls.set(DIRTY, [...new Set([...ls.get<string[]>(DIRTY, []), id])])
  planifier()
}

let timer: ReturnType<typeof setTimeout> | undefined
function planifier() {
  if (!supabase || !snap.email) return
  setSnap({ etat: 'attente', erreur: null })
  clearTimeout(timer)
  timer = setTimeout(() => void synchroniser(), 1500)
}

let enCours = false
/** Envoie les modifications locales puis récupère celles des autres appareils */
export async function synchroniser() {
  if (!supabase || enCours) return
  const { data: auth } = await supabase.auth.getSession()
  const user = auth.session?.user
  if (!user) return setSnap({ etat: 'deconnecte', email: null })
  if (!navigator.onLine) return setSnap({ etat: 'attente', erreur: 'Hors ligne : la synchro reprendra au retour du réseau.' })
  enCours = true
  setSnap({ etat: 'synchro', erreur: null })
  try {
    // 1. Première synchro sur cet appareil : on envoie tout ce qui existe en local
    if (!ls.get<boolean>(ONCE, false)) ls.set(DIRTY, [...new Set([...ls.get<string[]>(DIRTY, []), ...cache.map((s) => s.id)])])

    // 2. Suppressions
    const deleted = ls.get<string[]>(DELETED, [])
    if (deleted.length) {
      const { error } = await supabase.from(TABLE).delete().eq('user_id', user.id).in('id', deleted)
      if (error) throw error
      ls.set(DELETED, ls.get<string[]>(DELETED, []).filter((x) => !deleted.includes(x)))
    }

    // 3. Modifications locales
    const dirty = ls.get<string[]>(DIRTY, [])
    const rows = cache
      .filter((s) => dirty.includes(s.id) && s.entrees.some((e) => e.series.length))
      .map((s) => ({
        id: s.id,
        user_id: user.id,
        date: s.date,
        seance: s.seance ?? null,
        data: s,
        updated_at: s.maj ?? new Date().toISOString(),
      }))
    if (rows.length) {
      const { error } = await supabase.from(TABLE).upsert(rows, { onConflict: 'user_id,id' })
      if (error) throw error
    }
    ls.set(DIRTY, ls.get<string[]>(DIRTY, []).filter((x) => !dirty.includes(x)))
    ls.set(ONCE, true)

    // 4. Récupération et fusion (la version la plus récente gagne)
    const { data, error } = await supabase.from(TABLE).select('id,data,updated_at').eq('user_id', user.id)
    if (error) throw error
    const distant = new Map((data ?? []).map((r) => [r.id as string, { ...(r.data as SessionLog), maj: r.updated_at as string }]))
    const encoreSale = new Set(ls.get<string[]>(DIRTY, []))
    const fusion: SessionLog[] = []
    for (const s of cache) {
      const d = distant.get(s.id)
      if (d) {
        const dt = new Date(d.maj ?? 0).getTime()
        const lt = new Date(s.maj ?? 0).getTime()
        fusion.push(!encoreSale.has(s.id) && dt > lt ? d : s)
        distant.delete(s.id)
      } else if (encoreSale.has(s.id) || !s.entrees.some((e) => e.series.length)) {
        fusion.push(s) // pas encore envoyée, ou séance en cours encore vide
      }
      // sinon : supprimée depuis un autre appareil
    }
    distant.forEach((d) => fusion.push(d))
    write(fusion)
    setSnap({ etat: ls.get<string[]>(DIRTY, []).length ? 'attente' : 'ok', email: user.email ?? null })
  } catch (e) {
    setSnap({ etat: 'erreur', erreur: traduire((e as { message?: string })?.message ?? String(e)) })
  } finally {
    enCours = false
  }
}

function traduire(m: string) {
  if (/invalid login credentials/i.test(m)) return 'Email ou mot de passe incorrect.'
  if (/failed to fetch|network|load failed/i.test(m)) return 'Impossible de joindre Supabase : vérifie ta connexion internet et les variables VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY.'
  if (/relation .* does not exist|could not find the table/i.test(m)) return "La table n'existe pas encore : lance le fichier supabase/schema.sql dans le SQL Editor."
  if (/email not confirmed/i.test(m)) return "Email non confirmé : dans Supabase, confirme l'utilisateur (Auto Confirm User)."
  return m
}

export async function connexion(email: string, motDePasse: string) {
  if (!supabase) throw new Error('Supabase non configuré')
  const { data, error } = await supabase.auth.signInWithPassword({ email, password: motDePasse })
  if (error) throw new Error(traduire(error.message))
  setSnap({ email: data.user?.email ?? email })
  await synchroniser()
}

export async function deconnexion() {
  if (!supabase) return
  await synchroniser()
  await supabase.auth.signOut()
  ls.set(ONCE, false)
  setSnap({ etat: 'deconnecte', email: null })
}

// Démarrage : session existante, retour du réseau, retour sur l'app
if (supabase) {
  supabase.auth.getSession().then(({ data }) => {
    const email = data.session?.user.email ?? null
    setSnap({ email })
    if (email) void synchroniser()
  })
  supabase.auth.onAuthStateChange((_e, session) => setSnap({ email: session?.user.email ?? null }))
  window.addEventListener('online', () => void synchroniser())
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') void synchroniser()
  })
}
