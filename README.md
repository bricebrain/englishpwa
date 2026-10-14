# English Fluency PWA

Reconstruction Web de l’application English Fluency en React, TypeScript, Vite, Material UI v5 et React Query v5.

## Démarrage

```bash
npm install
npm run dev
```

La PWA utilise `/api` comme proxy même origine. En développement et en prévisualisation locale, Vite récupère la configuration du Worker côté serveur depuis `WORKER_URL` / `WORKER_SECRET`, avec un fallback local vers le fichier `.env` de l’application React Native sœur. Le secret n’est jamais injecté dans le JavaScript livré au navigateur.

Pour un déploiement, l’hébergeur doit reproduire ce proxy `/api` et conserver `WORKER_SECRET` exclusivement côté serveur. Aucun secret ne doit être placé dans une variable `VITE_*`.

## Fonctionnalités portées

- tableau de bord et progression ;
- entraînement Lingvist avec correction et marquage « déjà connu » ;
- tri massif des mots faciles (« je connais » / « à apprendre ») ;
- flashcards SRS dues, nouvelles ou mixtes, dans les deux sens ;
- scripts, audios et contenus préparés ;
- parcours Assimil avec écoute, fiche, phrases et exercices ;
- construction de phrases et séance Live guidée ;
- lecture d’articles, scènes SRT et ajout de vocabulaire au SRS ;
- profil et préférences locales.

L’enregistrement/analyse de la voix et les notifications ne font volontairement pas partie de la PWA. La lecture audio, la synthèse vocale du navigateur et toutes les fonctions d’apprentissage compatibles avec le Web restent disponibles.

## Commandes

- `npm run dev` : serveur Vite local ;
- `npm run build` : vérification TypeScript et build de production ;
- `npm run preview` : prévisualisation du build ;
- `npm test` : tests unitaires ;
- `npm run lint` : contrôle ESLint.

## Hébergement

L’hébergement doit servir `index.html` pour les routes inconnues afin que les liens profonds React Router fonctionnent. Le manifeste rend l’application installable. Aucun service worker métier ni cache hors ligne n’est ajouté dans cette version online-first.
# englishpwa
