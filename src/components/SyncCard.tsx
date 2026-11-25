import { useState } from 'react'
import { connexion, deconnexion, synchroniser, useSync } from '../lib/store'

const LIBELLE = {
  local: 'Mode local (Supabase non configuré)',
  deconnecte: 'Non connecté',
  attente: 'Modifications en attente…',
  synchro: 'Synchronisation…',
  ok: 'Synchronisé',
  erreur: 'Erreur de synchro',
} as const

export function SyncDot() {
  const s = useSync()
  if (s.etat === 'local') return null
  return <span className={`sync-dot sync-${s.etat}`} title={LIBELLE[s.etat]} aria-label={LIBELLE[s.etat]} />
}

export default function SyncCard() {
  const s = useSync()
  const [email, setEmail] = useState('')
  const [mdp, setMdp] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (s.etat === 'local')
    return (
      <section className="card section">
        <h3 className="h3-mb">Compte et synchro</h3>
        <p className="muted small-p">
          Supabase n'est pas encore configuré : tes données restent seulement sur ce téléphone. Remplis src/config.ts dans ton dépôt GitHub (voir le README) pour activer la synchro.
        </p>
      </section>
    )

  if (!s.email)
    return (
      <section className="card section">
        <h3 className="h3-mb">Connexion</h3>
        <p className="muted small-p">Connecte-toi pour sauvegarder ton journal en ligne et le retrouver sur tous tes appareils.</p>
        <form
          className="login"
          onSubmit={async (e) => {
            e.preventDefault()
            if (!email || !mdp) return setErr('Renseigne ton email et ton mot de passe.')
            setBusy(true)
            setErr(null)
            try {
              await connexion(email.trim(), mdp)
            } catch (x) {
              setErr(x instanceof Error ? x.message : 'Connexion impossible.')
            } finally {
              setBusy(false)
            }
          }}
        >
          <input type="email" autoComplete="email" placeholder="ton@email.fr" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" autoComplete="current-password" placeholder="Mot de passe" value={mdp} onChange={(e) => setMdp(e.target.value)} />
          {err && <p className="form-err">{err}</p>}
          <button className="btn btn-primary" disabled={busy}>
            {busy ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>
      </section>
    )

  return (
    <section className="card section">
      <div className="sum-head">
        <h3>Compte et synchro</h3>
        <span className={`sync-pill sync-${s.etat}`}>{LIBELLE[s.etat]}</span>
      </div>
      <p className="muted small-p">
        Connecté : <strong>{s.email}</strong>
        {s.derniereSync && <> · dernière synchro à {new Date(s.derniereSync).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</>}
      </p>
      {s.erreur && <p className="form-err">{s.erreur}</p>}
      <div className="actions">
        <button className="btn" onClick={() => void synchroniser()}>
          Synchroniser
        </button>
        <button className="btn" onClick={() => void deconnexion()}>
          Se déconnecter
        </button>
      </div>
    </section>
  )
}
