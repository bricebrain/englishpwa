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
- dictées par séries de cinq phrases : banque A1–B2, phrases des leçons, priorité aux inédites et historique local par profil ;
- construction de phrases et séance Live guidée ;
- lecture d’articles, scènes SRT et ajout de vocabulaire au SRS ;
- profil et préférences locales.

Les dictées proposent 48 phrases d’entraînement réparties entre A1 et B2, complétées dans chaque leçon par ses phrases clés, son dialogue et ses exercices de dictée. Une phrase validée est mémorisée dans ce navigateur pour le profil actif. Les séries privilégient les phrases inédites, puis réintroduisent les anciennes pour réviser. Le bouton « Nouvelle série » évite aussi la série précédente lorsque la banque le permet. Aucun endpoint de génération supplémentaire n’est nécessaire.

L’enregistrement/analyse de la voix et les notifications ne font volontairement pas partie de la PWA. La lecture audio et toutes les fonctions d’apprentissage compatibles avec le Web restent disponibles. La synthèse vocale utilise OpenAI via le Worker, Gemini en secours, puis la meilleure voix anglaise du navigateur en dernier recours.

## Évolution pédagogique

Le pilote **Sentence Lab**, accessible depuis l’accueil et Plus (`/sentence-lab`), relie une lecture courte, des transformations, la correction d’erreurs et une production personnelle autour de trois constructions. Le suivi par profil est local au navigateur. Les réponses non reconnues sont conservées « à vérifier », sans pénalité ; la maîtrise demande des réutilisations différées dans plusieurs contextes.

L’audit, l’architecture progressive et les limites du pilote sont décrits dans [docs/pedagogical-engine.md](docs/pedagogical-engine.md). Les modules existants sont conservés, y compris la construction de phrases à `/phrases`.

## Commandes

- `npm run dev` : serveur Vite local ;
- `npm run build` : vérification TypeScript et build de production ;
- `npm run preview` : prévisualisation du build ;
- `npm test` : tests unitaires ;
- `npm run lint` : contrôle ESLint.

## Hébergement

`vercel.json` configure le build Vite, le proxy `/api` et le fallback `index.html` nécessaire aux liens profonds React Router. Le manifeste rend l’application installable. Aucun service worker métier ni cache hors ligne n’est ajouté dans cette version online-first.
# englishpwa

## Première tranche du suivi commun

Le profil pédagogique local version 1 conserve ses preuves Sentence Lab et accepte désormais un journal `observations` optionnel. Les anciens profils restent lisibles. Lingvist, flashcards, triage, dictées et construction de phrases alimentent le même profil, sans convertir leurs résultats en maîtrise grammaticale ou en autonomie productive.

- Sentence Lab : six constructions A2–B1, deux contextes par construction, parcours guidé et production mélangée de trois objectifs. Les nouveaux contenus sont des propositions éditoriales à relire.
- Le mode mélangé privilégie les constructions dues puis déjà travaillées ; ses résultats comptent comme productions, jamais comme transferts différés certifiés.
- Le tri « Je reconnais » enregistre une déclaration locale, masquée au tri pendant sept jours. Il n’appelle plus le marquage serveur « connu ». Les anciens mots déjà retirés côté serveur ne sont pas restaurés automatiquement.
- Les flashcards distinguent reconnaissance et rappel en traduction ; Lingvist mesure un usage guidé. Les aides consultées restent prises en compte même après masquage.
- Les réponses ouvertes inconnues restent à vérifier dans Sentence Lab, la construction de phrases et les traductions Assimil. Aucun correcteur IA exhaustif n’est ajouté ; les exercices à réponse exacte conservent leur correction dédiée.
- La page Progression présente les compteurs API sans diagnostics, rétention ou graphiques de démonstration ajoutés artificiellement. Le mode démonstration est signalé. Les observations locales et les XP sont présentés séparément.

Le suivi est local au profil et au navigateur. Il n’est pas synchronisé entre appareils et ne reconstitue pas les anciennes activités. Les erreurs identifiées dans Sentence Lab orientent ses prochaines échéances. Les autres activités n’ont pas de liens explicites vers les constructions : aucune compétence grammaticale n’est déduite automatiquement du texte d’une réponse. L’intégration des lectures et des bilans Live, le catalogue de trente structures et la synchronisation serveur restent des étapes ultérieures.
