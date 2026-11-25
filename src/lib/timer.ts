import { useEffect, useState, useSyncExternalStore } from 'react'

let fin: number | null = null
let duree = 0
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

export function lancerRepos(secondes: number) {
  duree = secondes
  fin = Date.now() + secondes * 1000
  emit()
}
export function stopRepos() {
  fin = null
  emit()
}
export function ajouterRepos(s: number) {
  if (fin) {
    fin += s * 1000
    duree += s
    emit()
  }
}

function useFin() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => fin,
  )
}

/** Secondes restantes (null si aucun repos en cours) */
export function useRepos() {
  const f = useFin()
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    if (!f) return
    const t = setInterval(() => setNow(Date.now()), 250)
    return () => clearInterval(t)
  }, [f])
  useEffect(() => {
    if (f && now >= f) {
      try {
        navigator.vibrate?.([200, 100, 200])
      } catch {
        /* vibration indisponible */
      }
      bip()
      stopRepos()
    }
  }, [f, now])
  if (!f) return null
  return { restant: Math.max(0, Math.ceil((f - now) / 1000)), duree }
}

function bip() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new Ctx()
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.frequency.value = 880
    g.gain.setValueAtTime(0.15, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6)
    o.connect(g).connect(ctx.destination)
    o.start()
    o.stop(ctx.currentTime + 0.6)
  } catch {
    /* son indisponible */
  }
}
