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

## Ajouter ou modifier un exercice

Tout est dans `src/data/exercises.ts` (fiches) et `src/data/programme.ts` (séances).

- `source: 'exrx'` : consignes reprises de la fiche ExRx (lien dans `exrx`), reformulées en français.
- `source: 'claude'` : pas de fiche ExRx, consignes générales à faire valider par un coach.
