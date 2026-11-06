# Analyse — Kanban task management (Phase 2, à valider : G2)

> SDL-FM 1.6.0, Phase 2. Sources : `design/kanban-task-management.fig` (hors dépôt) lu par `scripts/fig/` (mesures, couleurs, textes, contrastes), README du starter, `data.json`. Schéma sur le canevas partagé (zone x 120 200) et `kanban-analyse.png` : **sans image de la maquette** (maquettes premium).

## 1. Écrans (72)

| Vue | Desktop 1440 | Tablette 768 | Mobile 375 | Notes |
|---|---|---|---|---|
| Tableau | ✓ (et « active » : survols) | ✓ | ✓ | Platform Launch : Todo 4, Doing 6, Done 7 ; colonne « + New Column » |
| Tableau vide | ✓ | ✓ | ✓ | « This board is empty. Create a new column to get started. » et « + Add New Column » |
| Barre latérale masquée | ✓ | ✓ | — | bouton œil en bas à gauche pour la rouvrir |
| Choix du tableau | — | — | ✓ | menu sous l'en-tête : tableaux, « + Create New Board », thème |
| Voir une tâche | ✓ (et menu ouvert, liste Status ouverte) | ✓ | ✓ | titre, description, « Subtasks (2 of 3) », cases, « Current Status » |
| Ajouter, modifier une tâche | ✓ (et erreur « Can't be empty ») | ✓ | ✓ | Title, Description, Subtasks (+ Add New Subtask), Status, Create Task / Save Changes |
| Ajouter, modifier un tableau | ✓ | ✓ | ✓ | Name, Columns (+ Add New Column), Create New Board / Save Changes ; colonnes Todo et Doing proposées |
| Supprimer un tableau, une tâche | ✓ (et survol de Delete) | ✓ | ✓ | « Delete this board? » / « Delete this task? », Delete, Cancel |

Chaque vue en clair et en sombre ; Design System (couleurs, typographie, éléments interactifs clair et sombre).

## 2. Structure (repères et composants proposés)

| Zone | Proposition |
|---|---|
| En-tête (`header`) | logo ; `h1` = nom du tableau ; « + Add New Task » (« + » seul en mobile, désactivé sans colonne) ; menu « ⋮ » du tableau (Edit Board, Delete Board) ; en mobile, le nom du tableau ouvre le choix du tableau |
| Barre latérale (`nav`) | « All boards (3) », un lien par tableau (le tableau ouvert marqué), « + Create New Board », interrupteur du thème, « Hide Sidebar » |
| Tableau (`main`) | une liste par colonne (titre « TODO (4) » et point de couleur), une carte par tâche (titre, « 0 of 3 subtasks ») qui ouvre la tâche ; « + New Column » ouvre Edit Board ; défilement horizontal du tableau, jamais de la page |
| Fenêtres | voir une tâche, ajouter ou modifier une tâche, ajouter ou modifier un tableau : `dialog` modal ; suppression : dialogue d'alerte |
| Menu « ⋮ » (tableau, tâche) | bouton qui ouvre deux boutons (Edit, Delete), fermé par Échap ou un clic à côté |

## 3. Mesures clés (px, lues dans le `.fig`)

| Élément | Desktop | Tablette | Mobile |
|---|---|---|---|
| Barre latérale | 300 de large, filet 1 | 261 | remplacée par le choix du tableau |
| En-tête | 97 de haut | 81 | 64 |
| Début des colonnes | x 324, y 121 | x 285, y 104 | x 16, y 88 |
| Colonne | 280 de large, 24 entre deux ; titre de 15 de haut, cartes 39 plus bas | idem | idem |
| Fenêtre | 480 de large, centrée, marges intérieures 32 | 480 | 343 |
| Tableau ouvert dans la barre | 276 de large, 48 de haut, coins droits arrondis | idem | 240 de large (choix du tableau) |
| Choix du tableau | — | — | 264 × 322, en (54, 80) sous l'en-tête |
| « + Add New Task » | 164 × 48 | idem | « + » 48 × 32 |

Polices : Plus Jakarta Sans Bold et Medium ; styles et couleurs dans `specs/reference/tokens.md`. Ombres : cartes `0 4 6 rgba(54, 78, 126, 0.1)`, menus `0 10 20 rgba(54, 78, 126, 0.25)` ; voile des fenêtres noir à 50 %. Points des colonnes : `#49c4e5`, `#8471f2`, `#67e2ae`.

## 4. Comportement (README et données)

- Premier chargement : les 3 tableaux de `data.json` ; changer de tableau par la barre latérale (ou le choix du tableau en mobile).
- Tableaux : créer (« Create New Board »), modifier (nom, colonnes ajoutées ou retirées), supprimer après confirmation (colonnes et tâches comprises).
- Colonnes : il en faut une pour ajouter une tâche (« + Add New Task » désactivé sinon) ; « + Add New Column » et « + New Column » ouvrent Edit Board.
- Tâches : ajoutée en bas de sa colonne ; changer son statut (liste « Current Status » ou Status du formulaire) la déplace ; cocher une sous-tâche met à jour « 2 of 3 » ; modifier, supprimer après confirmation.
- Bonus retenus (Pré-dev 1) : glisser-déposer pour changer de colonne et réordonner ; changements gardés au rechargement (`localStorage`).
- Barre latérale masquable (desktop, tablette) ; thème clair ou sombre.

## 5. États interactifs (inventaire)

| Élément | États dessinés | À ajouter |
|---|---|---|
| Bouton principal (L, S) | repos, survol | focus, désactivé (« + Add New Task » sans colonne, dessiné à 25 %) |
| Bouton secondaire, destructif | repos, survol | focus |
| Tableau dans la barre | ouvert, survol (fond violet clair) | focus |
| Carte | survol (titre violet) | focus, en cours de glissement, place de dépôt |
| Case de sous-tâche | repos, cochée, survol | focus |
| Liste Status | repos, ouverte | focus |
| Champ | repos, actif, erreur « Can't be empty » | focus |
| Interrupteur du thème, « Hide Sidebar », bouton œil | repos ; survol de « Hide Sidebar » | focus |
| Menu « ⋮ » | ouvert | focus des deux actions |

## 6. Accessibilité

### Contrastes (audit des 72 écrans, `scripts/fig/audit.py`)

| # | Couple | Maquette | Proposition (même teinte) |
|---|---|---|---|
| Q-A1 | Medium Grey `#828fa3` en clair : titres des colonnes, « 0 of 3 subtasks », « All boards », tableaux non ouverts, étiquettes, description | 3,05 à 3,28:1 | `#647288` (4,55 à 4,88:1) |
| Q-A2 | Medium Grey en sombre sur `#2b2c37` (barre latérale, fenêtres) | 4,22:1 | `#8894a7` (4,51:1 ; 5,2:1 sur `#20212c`) |
| Q-A3 | Red `#ea5555` : texte blanc sur Delete, et texte rouge sur blanc (« Delete this task? », « Delete Task ») | 3,54:1 | `#e42828` (4,53:1) dans les deux thèmes ; texte rouge en sombre sur `#2b2c37` : `#ed6a6a` (4,53:1) |
| Q-A4 | Violet `#635fc7` en sombre sur `#2b2c37` (« + Create New Board ») | 2,63:1 | Main Purple (Hover) `#a8a4ff` (6,2:1), couleur déjà du fichier |
| Q-A5 | Sous-tâche cochée en clair (noir à 50 % sur `#f4f7fd`) | 3,87:1 | `#5e5f69` (5,9:1 ; 4,5:1 sur le survol) ; en sombre au survol : `#a5a6aa` |
| Q-A6 | Textes d'exemple des champs (`e.g. Web Design`) : `#bfbfc4` en clair, `#606169` en sombre | 1,82:1 et 2,24:1 | `#75757f` (4,56:1) et `#92939b` (4,52:1) |
| Q-A7 | Survols dessinés plus clairs : bouton principal `#a8a4ff` (texte blanc), Delete `#ff9898`, Cancel (violet sur violet à 25 %) | 2,23:1, 2,06:1, 3,73:1 | survols plus foncés : `#534ec1` (6,5:1), `#cc1a1a` (5,6:1) ; texte de Cancel survolé `#5450c2` (4,51:1) |
| Q-A8 | Bordure des champs (Medium Grey à 25 %) | ≈ 1,2:1 (3:1 demandé) | Medium Grey plein `#828fa3` (3,28:1 en clair, 4,22:1 en sombre) |

Hors seuil, sans changement : bouton désactivé (25 %) ; points des colonnes (décoratifs, le nom de la colonne porte l'information) ; « + New Column » (grand texte, 3,28:1).

### Autres contrats proposés

Un seul `h1` (le nom du tableau) ; `h2` pour les fenêtres ; fenêtres en `dialog` modal (focus piégé, Échap, focus rendu à l'élément d'origine) ; chaque champ a son `label` et son erreur liée ; cases à cocher et liste Status natives ; contour de focus visible ; pas de transition si `prefers-reduced-motion: reduce` ; chaque changement de vue ou de statut annoncé (leçons de l'Invoice).

## 7. Questions (propositions)

| # | Point | Proposition |
|---|---|---|
| Q-B1 | Navigation | Adresse par ancre : `#/board/platform-launch` ; le tableau ouvert est retrouvé au rechargement et au retour (GitHub Pages) |
| Q-B2 | Données | Identifiants créés au premier chargement (`data.json` n'en a pas) ; le statut d'une tâche reste le nom de sa colonne : renommer une colonne renomme le statut de ses tâches |
| Q-B3 | Fenêtres | `dialog` modal ; en mobile, fenêtres de 343 px centrées comme la maquette ; le choix du tableau est aussi un `dialog` |
| Q-B4 | Menus « ⋮ » | Bouton qui ouvre deux boutons natifs, sans rôle ARIA de menu (règle FM « prefer native element ») |
| Q-B5 | Liste Status | `select` natif stylé fermé comme la maquette ; liste ouverte native |
| Q-B6 | Validation | « Can't be empty » pour le titre, le nom du tableau, chaque colonne, chaque sous-tâche ; deux colonnes du même nom dans un tableau : « Used » |
| Q-B7 | Retirer une colonne | Permis dans Edit Board ; ses tâches partent avec elle à « Save Changes » ; Cancel ou Échap annulent tout |
| Q-B8 | Couleur d'une nouvelle colonne | Les trois couleurs de la maquette, dans l'ordre, selon la place de la colonne |
| Q-B9 | Glisser-déposer | Souris et tactile (appui long en tactile pour garder le défilement) ; une place de dépôt montre où va la carte ; au clavier, sur une carte : Alt + ↑ ↓ pour réordonner, Alt + ← → pour changer de colonne, annoncé |
| Q-B10 | Préférences | Thème de l'appareil au premier passage, puis le choix gardé ; barre latérale masquée gardée aussi |
| Q-B11 | Plus aucun tableau | Non dessiné : en-tête sans nom, « There are no boards. Create a new board to get started. » et « + Create New Board » |
| Q-B12 | Incohérence de la maquette | Les cartes écrivent « substasks » : on écrit « subtasks » ; la faute des données (« Add search enpoints ») est gardée |
| Q-B13 | Position d'une tâche | Ajoutée ou déplacée par son statut : en bas de la colonne (README) |
| Q-B14 | Défilement | Le tableau défile dans les deux sens ; la page ne défile jamais horizontalement (règle des tests de 320 à 1440 px) |
| Q-B15 | Données effacées | `localStorage` vidé : `data.json` relu (comme l'Invoice) ; données gardées vérifiées avant d'être lues |
| Q-B16 | Focus (non dessiné) | Contour 2 px `#635fc7` en clair, `#a8a4ff` en sombre, décalé de 2 px |
