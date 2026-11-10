# Évolution pédagogique d’English Fluency

## Audit du dépôt — 10 novembre 2026

- React 18, TypeScript strict, Vite, React Router et React Query v5 sont en place.
- MUI v5 est installé. L’interface actuelle utilise aussi Tailwind, Motion et des composants maison. Le pilote utilise MUI ; une migration visuelle globale serait un chantier distinct.
- `PageLayout` et `PageHeader` existent et sont conservés. `SelectorBar`, `DataGridCard`, `AgGridSense` et `useSSRMDatasource` sont absents de ce dépôt. Le parcours mobile ne nécessite pas de grille.
- `learningApi.ts` centralise le proxy vers un Worker externe. Son schéma de base de données et ses migrations ne sont pas présents ici : cet audit porte sur les contrats TypeScript, pas sur la base distante. Le volume d’environ 4 000 mots vient du cadrage produit, il n’a pas été vérifié en base.
- Lingvist (`useLingvistSession`), flashcards (`useFlashcardSession`), triage et Assimil sont réutilisables. `SrsWord` suit intervalle, facilité, répétitions, compteurs et statut new/learning/known, sans séparer reconnaissance, usage guidé et autonomie.
- `buildReviewedWord` implémente les intervalles SRS et un historique des 20 dernières révisions. `learningApi.reviewWord` et `submitLingvistAnswer` envoient les résultats au Worker. Ces mécanismes sont conservés.
- La construction actuelle (`SentenceBuilderPage`) propose traduction et tuiles, puis une égalité normalisée avec une réponse unique. Elle reste disponible à `/phrases`.
- La lecture expose niveau, nombre de mots, segments, vocabulaire et questions. Les liens vers les structures, leur ciblage et la difficulté restent à ajouter. La promotion de mots vers le SRS existe déjà.
- Le module Live analyse un bilan et propose des expressions ; ce n’est pas encore un dialogue écrit adaptatif. Les statistiques utilisent partiellement des valeurs de démonstration (`getStatistics`) : elles ne constituent pas une évaluation CECRL.
- La PWA est installable, mais ne possède pas de service worker métier. Le pilote conserve ses traces localement ; cela ne garantit pas le chargement de l’application hors ligne.

## Architecture incrémentale

1. **Référentiel versionné** : constructions indépendantes de l’IA, prérequis, objectifs, erreurs, types d’activités et critères de maîtrise (`constants/pedagogy`). Les niveaux sont indicatifs et nécessitent une validation pédagogique. Étendre ensuite à 100–150 constructions relues, sans générer artificiellement un catalogue non validé.
2. **Preuves d’apprentissage** : événements par profil, construction, contexte, aide, résultat, date et diagnostic (`types/pedagogy.ts`). Aucune conversion automatique de l’ancien statut « known » en maîtrise productive.
3. **Moteur déterministe** : agrégation des preuves, sélection d’une compétence due ou encore inédite, espacement et critères de transfert (`helpers/pedagogy*`). Les prérequis non évalués restent inconnus ; les trois unités pilotes ont été choisies sans dépendance bloquante entre elles.
4. **Persistance** : service local versionné et isolé par profil, exposé via React Query. Les erreurs de stockage sont visibles. Étape suivante : API Worker, événements idempotents, stockage serveur et synchronisation ; ne pas inventer des endpoints dans le frontend.
5. **Contenus** : unités éditoriales statiques séparées du référentiel. Plus tard, adaptateur IA avec schémas validés à l’exécution, objectifs imposés par le moteur, provenance, cache et statut brouillon/relu/validé. Aucun fournisseur n’entre dans les types métier.
6. **Interface** : hook de séance, composants MUI présentatifs et page dédiée. Les anciens modules restent accessibles. Étendre ensuite Reading Lab et Writing Lab sur les mêmes événements, puis Chat Practice.

Pour les mots, ajouter à terme trois axes indépendants `recognized`, `usable`, `autonomous`, chacun avec ses preuves et échéances. Les expressions référencent les constructions et les mots existants. Une bonne réponse de flashcard n’apporte qu’une preuve adaptée à son mode, jamais une preuve d’autonomie par défaut.

## Première tranche fonctionnelle

Accessible à `/sentence-lab` depuis l’accueil et Plus : trois constructions (want to, would like to, négation au présent simple), deux contextes par construction, lecture courte, compréhension, transformation, correction et production personnelle. Durée indicative : 8–10 minutes, pour valider la boucle avant le parcours quotidien de 15–20 minutes.

La compétence est choisie au démarrage : priorité aux révisions dues, puis aux constructions inédites. Si toutes attendent leur échéance, l’utilisateur peut pratiquer volontairement, sans transformer cette pratique anticipée en transfert différé. Les indices restent facultatifs ; le moteur les affiche d’emblée après une difficulté, les masque après une réussite sans aide, et enregistre leur consultation.

Lors d’une révision due, une production dans un autre contexte précède tout modèle. Une réussite à cette étape ne compte comme transfert que si elle intervient au moins 48 h après les dernières preuves validées, sans aide, dans un contexte différent du dernier transfert validé. La maîtrise demande deux transferts espacés de 48 h et deux contextes. Les réussites dans une seule séance ne suffisent jamais. L’espacement reste une règle de prototype à valider pédagogiquement.

La correction locale accepte des variantes explicitement relues et normalise ponctuation et contractions courantes. Seules des erreurs ciblées connues donnent un diagnostic certain (omission de to, accord, auxiliaire). Toute autre réponse reste **à vérifier**, y compris une formulation potentiellement correcte ; elle n’est ni sanctionnée ni utilisée pour certifier une maîtrise. Une réponse libre reconnue valide seulement le périmètre de l’activité, sans prétendre mesurer tout le niveau linguistique.

## Limites et étapes suivantes

- Ce pilote n’est ni le référentiel complet, ni un Reading/Writing Lab complet, ni un test CECRL. Il ne remplace pas le tableau de progression historique.
- Les textes et niveaux sont des propositions éditoriales à faire relire. Pas de génération IA ni d’appel réseau additionnel.
- Les traces sont locales au navigateur et au profil ; elles ne sont pas synchronisées entre appareils. Une séance interrompue reprend au début, mais les réponses déjà enregistrées restent dans le suivi.
- Avant la connexion des anciens modules, ajouter explicitement `constructionIds`, mode de réponse et aide réellement utilisée à leurs événements. Ne pas deviner une compétence à partir d’une simple chaîne de caractères.
- Prochaine tranche : correction ouverte structurée (grammaire, temps, syntaxe, omission, vocabulaire, naturalité, orthographe, variante), revue des contenus, puis API de preuves. La naturalité reste distincte de la correction grammaticale.
- Ensuite : lectures graduées avec métadonnées complètes et vocabulaire contrôlé, transfert lecture → manipulation → écriture, puis séance quotidienne liée par un objectif. Chat Practice vient après ces fondations.

## Validation attendue

Tests sur diagnostics, variantes et incertitude, absence de fausse maîtrise immédiate, aides et répétitions, espacement et changement de contexte, isolation par profil, données invalides et stockage indisponible. Vérifier TypeScript, build et lint. Une validation pédagogique et des essais sur téléphone restent nécessaires avant généralisation.

## Tranche suivante — suivi commun et six constructions

Le catalogue comporte maintenant six constructions : les trois initiales, prétérit, present perfect d’expérience et première conditionnelle. Chacune dispose de deux contextes ; niveaux et contenus sont à relire pédagogiquement. Le catalogue n’est pas une validation CECRL.

La production mélangée sélectionne trois objectifs (dus, puis déjà pratiqués, puis nouveaux), change leur ordre et masque les noms de constructions. Chaque réponse garde sa construction et son contexte propres. Ces exercices restent des productions guidées par une consigne ; ils ne sont pas utilisés comme transferts différés certifiés.

`PedagogyProfile.observations` ajoute les traces des modules existants au profil version 1 sans perdre `evidence`. Le service effectue chaque lecture-modification-écriture sans suspension dans le même onglet, déduplique les identifiants et refuse d’écraser des données invalides. Il ne garantit pas les écritures simultanées de plusieurs onglets : cette contrainte devra être traitée avec la synchronisation serveur ou un stockage transactionnel.

Les traces distinguent source, mode de compétence, cible, contexte, réponse, aide, résultat et date. Les mots déclarés reconnus restent dans les révisions serveur ; cette nouvelle sémantique ne restaure pas les anciens mots déjà classés connus. La reconnaissance est masquée sept jours dans le tri local, puis peut être vérifiée de nouveau.

La page Progression retire les indicateurs simulés injectés au-dessus des statistiques API. Elle montre les observations disponibles, les transferts différés et la motivation séparément. Les réponses non reconnues des traductions libres et du constructeur de phrases restent à vérifier sans casser les combos ou produire un taux de réussite trompeur.

Limites : pas de synchronisation ni de correction humaine/IA des réponses en attente, pas de récupération rétroactive, pas de promotion automatique des résultats historiques vers une autonomie productive, pas de liens supposés entre dictée et structure grammaticale. Les prochaines intégrations doivent fournir des identifiants de constructions explicites.
