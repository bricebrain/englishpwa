# English Fluency PWA

Reconstruction Web de l’application English Fluency en React, TypeScript, Vite, Material UI v5 et React Query v5.

## Démarrage

```bash
npm install
npm run dev
```

La PWA utilise `/api` comme proxy même origine. En développement et en prévisualisation locale, Vite récupère la configuration du Worker côté serveur depuis `WORKER_URL` / `WORKER_SECRET`, avec un fallback local vers le fichier `.env` de l’application React Native sœur. Sur Vercel, `api/backend.ts` reproduit ce proxy. Le secret n’est jamais injecté dans le JavaScript livré au navigateur.

Les variables Vercel requises sont `VITE_API_BASE_URL=/api`, `WORKER_URL` et `WORKER_SECRET`. `WORKER_SECRET` doit rester exclusivement côté serveur : aucun secret ne doit être placé dans une variable `VITE_*`.

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

L’enregistrement/analyse de la voix et les notifications ne font volontairement pas partie de la PWA. La lecture audio et toutes les fonctions d’apprentissage compatibles avec le Web restent disponibles. La synthèse vocale utilise OpenAI via le Worker, Gemini en secours, puis la meilleure voix anglaise du navigateur en dernier recours.

## Commandes

- `npm run dev` : serveur Vite local ;
- `npm run build` : vérification TypeScript et build de production ;
- `npm run preview` : prévisualisation du build ;
- `npm test` : tests unitaires ;
- `npm run lint` : contrôle ESLint.

## Hébergement

`vercel.json` configure le build Vite, le proxy `/api` et le fallback `index.html` nécessaire aux liens profonds React Router. Le manifeste rend l’application installable. Aucun service worker métier ni cache hors ligne n’est ajouté dans cette version online-first.
# englishpwa
