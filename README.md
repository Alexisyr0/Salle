# Muscu

App perso : bibliothèque d'exercices en français, carte du corps cliquable, recherche, et ton programme (full body A/B, renfo maison, activation genou, mobilité).

## Lancer en local

```bash
npm install
npm run dev
```

## Déployer sur Cloudflare Pages

1. Pousse ce dossier dans ton dépôt GitHub (`muscu`).
2. Cloudflare → Workers & Pages → Create → Pages → Connect to Git → choisis le dépôt.
3. Réglages de build :
   - Framework preset : **Vite** (ou React (Vite))
   - Build command : `npm run build`
   - Build output directory : `dist`
4. Deploy. Chaque push sur `main` redéploie automatiquement.

Sur ton téléphone : ouvre l'URL, puis « Ajouter à l'écran d'accueil » pour l'avoir comme une app.

## Suivi des séances

- **Body A / Body B** → « Commencer la séance du jour » : tu notes kg et reps pour chaque série, ✓ valide la série et lance le minuteur de repos (75 s, ou 45 s en 3/7).
- Colonne « Préc. » : ce que tu as fait la dernière fois sur la même série.
- Toucher le numéro de série la marque en **échauffement** (exclue du volume et des records).
- 🏆 Record quand ton max estimé dépasse ton meilleur précédent.
- **Journal** : calendrier, détail de chaque jour, volume de la semaine, carte des muscles travaillés sur 7 jours, records, sauvegarde.
- **Fiche exercice** : courbe de progression, total soulevé, conseil de charge automatique.

Les données sont stockées dans le navigateur du téléphone (localStorage). Pense à **Exporter** de temps en temps depuis le Journal.

## Supabase (synchro entre appareils)

1. Supabase → ton projet (celui de Loupe convient, ou un nouveau) → **SQL Editor** → colle le contenu de `supabase/schema.sql` → **Run**.
2. **Authentication → Users → Add user → Create new user** : ton email + un mot de passe, coche **Auto Confirm User**.
   (L'app n'a pas d'inscription : seul ce compte peut se connecter.)
3. **Project Settings → API** : copie la **Project URL** et la clé **anon public**.
4. Dans ton dépôt GitHub, ouvre `src/config.ts` et colle-les entre les guillemets :
   ```ts
   export const SUPABASE_URL = 'https://xxxx.supabase.co'
   export const SUPABASE_ANON_KEY = 'eyJ...'
   ```
   Commit → Cloudflare redéploie tout seul. (Jamais la clé `service_role`.)
5. Dans l'app : **Journal → Connexion**. Ton journal local est envoyé, puis tout reste synchronisé (pastille verte en haut à droite).

L'app fonctionne aussi hors ligne : les séances sont gardées sur le téléphone et envoyées au retour du réseau.

## Ajouter ou modifier un exercice

Tout est dans `src/data/exercises.ts` (fiches) et `src/data/programme.ts` (séances).

- `source: 'exrx'` : consignes reprises de la fiche ExRx (lien dans `exrx`), reformulées en français.
- `source: 'claude'` : pas de fiche ExRx, consignes générales à faire valider par un coach.
