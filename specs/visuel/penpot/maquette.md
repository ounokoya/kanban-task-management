# Maquette — Kanban task management (Phase 3, à valider : G3)

> SDL-FM 1.6.0 : avec Pro, les mesures sont lues dans le fichier Figma ; Penpot garde la bibliothèque, les composants, les écrans clés et la gate G3. Fichier Penpot **« kanban-task-management »** (créé par Koya), page « Kanban ». Analyse validée (G2) : `specs/visuel/kanban-analyse.md`.

## Contenu du fichier Penpot

| Élément | Contenu |
|---|---|
| Bibliothèque | 26 couleurs : les 12 de la maquette (dossier « Kanban »), les 3 points des colonnes (« Kanban / Colonnes »), les 11 **teintes AA** de G2 (« Kanban / AA ») ; 6 typographies Plus Jakarta Sans (Heading XL, L, M, S ; Body L, M), interlignes du Design System |
| Composants | Planche « Composants (états, teintes AA) », en clair et en sombre : boutons principal (L, S), secondaire et destructif en normal, survol (AA), focus, désactivé ; champ repos (texte d'exemple AA), actif, erreur ; sous-tâche repos, cochée (AA), survolée ; liste Status repos et active ; carte repos, survolée, focus, glissée, place de dépôt ; tableau de la barre ouvert, survolé, au repos ; interrupteur du thème ; menu (Edit Board, Delete Board). Export : `composants.png` (SVG de Penpot rendu dans Chromium avec la police) |
| Écrans clés | 10 calques « Écran clé · … (AA) » : tableau en clair et en sombre, voir une tâche, ajouter une tâche (erreur), modifier un tableau, supprimer un tableau, tableau vide, tablette barre masquée, mobile, mobile choix du tableau ; ce sont les rendus du `.fig` avec les teintes AA (`design/reference-aa/`, hors dépôt) |

Les écrans ne sont pas redessinés dans Penpot : le `.fig` donne déjà chaque mesure, et son rendu (contours de lettres compris) est plus fidèle qu'un redessin.

## Références visuelles des tests

`design/reference-aa/` (72 écrans et le Design System, hors dépôt) : rendu du `.fig` avec les teintes AA (`bash scripts/fig/references.sh --aa`, règles dans `scripts/fig/aa.py`). Le rendu dessine maintenant les dégradés (colonne « + New Column ») et les barrés (sous-tâches cochées). Audit après correction (`scripts/fig/audit.py --aa`) : **plus aucun texte réel sous AA** ; reste le bouton « + Add New Task » désactivé (25 %), exempté.

## Points à valider (G3)

| # | Point | Proposition |
|---|---|---|
| G3-1 | États sous AA trouvés en auditant aussi les écrans « Active » (survols) | Q-A4 étendu : en sombre, le violet de 15 px sur fond sombre (titre de carte survolée, « + Create New Board ») devient `#a8a4ff` ; les entrées survolées de la barre gardent `#635fc7` sur leur fond blanc. Q-A7 étendu : en clair, « + Add New Subtask » et « + Add New Column » survolés prennent `#5450c2`, comme Cancel |
| G3-2 | Incohérences de la maquette | Les écrans sombres écrivent « ALL BOARDS (8) » pour 3 tableaux : le compteur suit le nombre réel ; « substasks » des cartes → « subtasks » (Q-B12) |
| G3-3 | Focus (non dessiné) | Boutons, liens, cartes, cases : contour 2 px décalé de 2 px, `#635fc7` en clair, `#a8a4ff` en sombre (Q-B16) ; champs et liste Status : la bordure active de la maquette (`#635fc7`) |
| G3-4 | Glisser-déposer (non dessiné) | Carte glissée : ombre des menus, suit le pointeur ; place de dépôt : filet pointillé de 2 px (Lines), à la taille de la carte, là où elle tombera ; au clavier : Alt + flèches (Q-B9), annoncé |
| G3-5 | Coche des sous-tâches | Icône `icon-check.svg` du starter sur la case violette (la planche montre la case seule) |
| G3-6 | Écrans comparés aux références | 24 écrans. Desktop : tableau clair et sombre, tableau vide, barre masquée, voir une tâche clair et sombre, ajouter et modifier une tâche, ajouter et modifier un tableau, supprimer un tableau et une tâche. Tablette : tableau clair et sombre, barre masquée, voir une tâche, ajouter une tâche, supprimer une tâche. Mobile : tableau clair et sombre, choix du tableau, voir une tâche, ajouter une tâche, supprimer un tableau |
| G3-7 | Seuil visuel | 5 % par écran, recalibré en Phase 5 si le texte rendu par la police diffère des contours de lettres du `.fig` (méthode : écart mesuré + 1 point, avec ton accord) |
| G3-8 | Police | Plus Jakarta Sans 500 et 700 servies avec le site par Fontsource (téléchargement au verrou, avec ton accord), comme League Spartan pour l'Invoice |
