# Sprint: Amélioration de la traduction arabe

**Objectif**: S'assurer que l'application est entièrement fonctionnelle et cohérente en arabe, y compris le contenu dynamique et les rapports générés par l'IA.

## Tâches

### 1. Internationalisation du contenu statique

-   [x] **Identifier les chaînes de caractères non traduites**: Parcourir l'application en arabe pour trouver les éléments d'interface (boutons, titres, libellés) qui restent en français.
-   [x] **Ajouter les traductions manquantes**: Compléter le fichier `messages/ar.json` avec les traductions des chaînes identifiées.
-   [x] **Vérifier l'affichage RTL**: S'assurer que tous les éléments de l'interface s'affichent correctement en mode droite-à-gauche (RTL).

### 2. Traduction des rapports de l'IA

-   [x] **Adapter l'API de génération de rapports**: Modifier la route `src/app/api/generate-report/route.ts` pour détecter la langue de la requête.
-   [x] **Modifier le prompt de l'IA**: Mettre à jour le prompt envoyé au service d'IA pour inclure une instruction demandant une réponse en arabe (`"Réponds en arabe."`).
-   [ ] **Tester la génération de rapports en arabe**: Générer plusieurs rapports pour différentes parcelles et vérifier que le contenu (analyse, recommandations) est entièrement en arabe et pertinent.

### 3. Traduction des données des parcelles

-   [x] **Mapper les données de la base de données**: Pour les données comme les types de cultures (ex: "Blé", "Orge"), créer un système de mappage dans le code pour les faire correspondre à leurs équivalents en arabe dans `messages/ar.json`.
-   [x] **Mettre à jour les composants d'affichage**: Modifier les composants comme `src/app/dashboard/parcelles/[id]/page.tsx` et la liste des parcelles pour qu'ils utilisent les traductions.
-   [ ] **Vérifier les détails des parcelles**: S'assurer que toutes les informations dans la vue détaillée d'une parcelle sont en arabe.

### 4. Validation et finalisation

-   [ ] **Revue complète en arabe**: Effectuer une passe de validation complète de l'application en arabe.
-   [ ] **Tester le changement de langue**: Vérifier que le passage du français à l'arabe (et vice-versa) fonctionne correctement et met à jour tout le contenu de manière dynamique.
