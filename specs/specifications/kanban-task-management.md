# Spec — Kanban task management (v1.0.1)

> SDL-FM 1.6.0 Phase 4. Sources : analyse validée (G2) `specs/visuel/kanban-analyse.md`, maquette validée (G3) `specs/visuel/penpot/maquette.md`, tokens `specs/reference/tokens.md`, README du starter (comportements attendus), décisions dans `specs/brainstorming/2026-11-06-kanban-task-management.md`.
> Cette spec dit **quoi** et **pourquoi**, jamais **comment**.

## 1. Objectif

Un tableau de tâches à la Kanban : plusieurs tableaux, chacun fait de colonnes, chaque colonne de tâches avec leurs sous-tâches. On les voit, les crée, les modifie, les supprime ; on coche des sous-tâches, on change une tâche de colonne par son statut ou en la glissant, on la réordonne ; on masque la barre latérale ; thème clair ou sombre ; à toutes les largeurs. Les données de `data.json` au premier passage, puis les changements gardés dans le navigateur.

## 2. Données et règles de gestion

| # | Règle | Origine |
|---|---|---|
| D1 | Un tableau : `name`, `columns` ; une colonne : `name`, `tasks` ; une tâche : `title`, `description`, `status`, `subtasks` ; une sous-tâche : `title`, `isCompleted` ; le statut d'une tâche est le nom de la colonne qui la contient : un statut vide ou différent (4 tâches de `data.json` ont un statut vide) est remplacé par ce nom au chargement | `data.json` |
| D2 | Premier chargement (rien dans le navigateur) : les 3 tableaux de `data.json`, dans leur ordre ; ensuite, les tableaux gardés (clé `kanban/boards` du `localStorage`) ; un tableau gardé illisible, ou qui n'a pas la forme de D1, est ignoré : `data.json` est relu | README, Q-B15 |
| D3 | Adresse d'un tableau : `#/board/<nom en minuscules, mots reliés par des tirets>` (`#/board/platform-launch`) ; deux tableaux du même nom : `-2`, `-3`… ; une adresse inconnue ouvre le premier tableau | Q-B1 |
| D4 | Nom d'un tableau et de chaque colonne obligatoires (« Can't be empty ») ; deux colonnes du même nom dans un tableau, sans tenir compte de la casse : « Used » | README, Q-B6 |
| D5 | Titre d'une tâche obligatoire ; chaque sous-tâche ajoutée aussi (« Can't be empty ») ; la description et les sous-tâches sont facultatives | README, Q-B6 |
| D6 | Une tâche ajoutée va en bas de la colonne de son statut ; changer son statut (vue de la tâche ou formulaire) la met en bas de sa nouvelle colonne | README, Q-B13 |
| D7 | Renommer une colonne renomme le statut de ses tâches ; retirer une colonne retire ses tâches, à l'enregistrement du tableau seulement | Q-B2, Q-B7 |
| D8 | Supprimer un tableau (colonnes et tâches) ou une tâche (et ses sous-tâches) : après confirmation seulement ; les autres tâches gardent leur ordre | README |
| D9 | « + Add New Task » désactivé tant que le tableau ouvert n'a pas de colonne | README |
| D10 | Couleur du point d'une colonne : `#49c4e5`, `#8471f2`, `#67e2ae`, dans cet ordre, selon la place de la colonne (4ᵉ : de nouveau `#49c4e5`) | Q-B8 |
| D11 | Compteur d'une carte : « 1 of 3 subtasks » (sous-tâches cochées sur sous-tâches) ; d'une colonne : « Todo (4) » ; de la barre : « All boards (3) » (nombre réel, G3-2) | maquette, G3-2, Q-B12 |
| D12 | Glisser une carte : dans une autre colonne, son statut devient le nom de cette colonne ; dans sa colonne, elle change de place ; elle tombe là où la place de dépôt est montrée | README (bonus), Q-B9 |

## 3. Écrans et contenu

### 3.1 Barre latérale (≥ 768 px)

Logo « kanban » (clair ou sombre selon le thème) ; « All boards (3) » ; un lien par tableau (icône, nom ; le tableau ouvert marqué) ; « + Create New Board » ; interrupteur du thème (soleil, interrupteur, lune) ; « Hide Sidebar ». Barre masquée : un bouton « Show Sidebar » (icône œil) en bas à gauche.

### 3.2 En-tête

Nom du tableau ouvert (`h1`) ; « + Add New Task » (« + » seul sous 768 px) ; menu du tableau (« Edit Board », « Delete Board »). Sous 768 px : logo réduit ; le nom du tableau ouvre le choix du tableau (chevron) ; pas de barre latérale.

### 3.3 Tableau

Une colonne par colonne du tableau : point de couleur, titre « TODO (4) » (capitales), puis les cartes (titre de la tâche, « 0 of 3 subtasks »). Les compteurs suivent les données : la maquette en montre parfois d'autres (« Design settings and search pages » : « 1 of 3 » dans la maquette, 2 sous-tâches sur 3 cochées dans `data.json`). À droite, « + New Column ». Tableau sans colonne : « This board is empty. Create a new column to get started. » et « + Add New Column ». Plus aucun tableau : « There are no boards. Create a new board to get started. » et « + Create New Board » (Q-B11). Le tableau défile dans les deux sens ; la page jamais horizontalement (Q-B14).

### 3.4 Voir une tâche (dialogue modal)

Titre de la tâche (`h2`), menu de la tâche (« Edit Task », « Delete Task ») ; description (si elle existe) ; « Subtasks (2 of 3) » et une case par sous-tâche (cochée : texte barré) ; « Current Status » (liste des colonnes du tableau).

### 3.5 Ajouter ou modifier une tâche (dialogue modal)

« Add New Task » ou « Edit Task » (`h2`) ; Title (aide « e.g. Take coffee break ») ; Description (aide « e.g. It's always good to take a break. This 15 minute break will recharge the batteries a little. ») ; Subtasks : une ligne par sous-tâche (aides « e.g. Make coffee », « e.g. Drink coffee & smile » pour les deux lignes proposées à l'ajout), bouton croix pour la retirer ; « + Add New Subtask » ; Status (liste des colonnes ; la première par défaut) ; « Create Task » ou « Save Changes ».

### 3.6 Ajouter ou modifier un tableau (dialogue modal)

« Add New Board » ou « Edit Board » (`h2`) ; Name (« Board Name » en modification ; aide « e.g. Web Design ») ; Columns (« Board Columns » en modification) : une ligne par colonne (« Todo » et « Doing » proposées à l'ajout), bouton croix ; « + Add New Column » ; « Create New Board » ou « Save Changes ». « + Add New Column » (tableau vide) et « + New Column » ouvrent « Edit Board ».

### 3.7 Suppression (dialogue modal d'alerte)

« Delete this board? » : « Are you sure you want to delete the 'Platform Launch' board? This action will remove all columns and tasks and cannot be reversed. » ; « Delete this task? » : « Are you sure you want to delete the 'Build settings UI' task and its subtasks? This action cannot be reversed. » ; « Delete », « Cancel ».

### 3.8 Choix du tableau (< 768 px, dialogue)

« All boards (3) », un bouton par tableau (le tableau ouvert marqué), « + Create New Board », interrupteur du thème.

La page a pour titre « Platform Launch | Kanban task management », la langue `en`, l'icône du starter.

## 4. Tokens

Couleurs, typographie et mesures : `specs/reference/tokens.md`, bibliothèque Penpot, teintes AA validées (G2 Q-A1 à Q-A8, G3-1 ; `scripts/fig/aa.py`). Principaux rôles :

| Rôle | Clair | Sombre |
|---|---|---|
| Fond du tableau | `#f4f7fd` | `#20212c` |
| Barre, en-tête, cartes, dialogues | `#ffffff` | `#2b2c37` |
| Filets | `#e4ebfa` | `#3e3f4e` |
| Texte principal | `#000112` | `#ffffff` |
| Texte secondaire (Q-A1, Q-A2) | `#647288` | `#8894a7` |
| Violet (bouton principal, tableau ouvert) · survol (Q-A7) | `#635fc7` · `#534ec1` | idem |
| Violet en texte (Q-A4) | `#635fc7` | `#a8a4ff` sur fond sombre ; `#635fc7` sur fond blanc |
| Bouton secondaire · survol | fond violet à 10 % · 25 %, texte `#635fc7` · `#5450c2` | fond blanc, texte `#635fc7` |
| Rouge (Delete) · survol (Q-A3, Q-A7) | `#e42828` · `#cc1a1a` ; texte rouge `#e42828` | idem ; texte rouge `#ed6a6a` |
| Sous-tâche cochée (Q-A5) | `#5e5f69` | `#a5a6aa` |
| Texte d'exemple des champs (Q-A6) | `#75757f` | `#92939b` |
| Bordure des champs (Q-A8) | `#828fa3` | `#828fa3` |
| Points des colonnes | `#49c4e5`, `#8471f2`, `#67e2ae` | idem |

Plus Jakarta Sans (Bold 700, Medium 500) : Heading XL 24/30, L 18/23, M 15/19, S 12/15 (espacement 2,4 px, capitales) ; Body L 13/23 Medium, Body M 12/15 Bold. Ombres : cartes `0 4px 6px rgb(54 78 126 / 0.1)`, menus `0 10px 20px rgb(54 78 126 / 0.25)` ; voile des dialogues noir à 50 %.

## 5. Mise en page

| Largeur | Disposition |
|---|---|
| < 768 px | en-tête de 64 px ; pas de barre latérale ; colonnes à 16 px du bord gauche ; dialogues de 343 px, centrés |
| 768 à 1023 px | barre latérale de 261 px (masquable) ; en-tête de 81 px ; colonnes à 24 px de la barre |
| ≥ 1024 px | barre latérale de 300 px (masquable) ; en-tête de 97 px |

Colonnes de 280 px, 24 px entre deux ; cartes de 280 px, 88 px de haut pour un titre d'une ligne, 20 px entre deux ; dialogues de 480 px (343 sous 768 px), centrés, marges intérieures 32 px (24 sous 768 px, 32 en bas de « Voir une tâche ») ; une ligne de sous-tâche : 40 px, 19 px de plus par ligne de texte (59 pour deux lignes, comme la maquette).

Positions de la maquette (px, coin haut gauche ; à 1 px près, 2 px pour les textes) :

| Élément | 1440 × 1024 | 768 × 1024 | 375 × 667 |
|---|---|---|---|
| Barre latérale | (0, 0) 300 × 1024 | (0, 0) 261 × 1024 | — |
| Titre du tableau | (324, 29) | (285, 28) | (56, 21) |
| « + Add New Task » | (1215, 20) 164 × 48 | (551, 16) 164 × 48 | « + » (291, 16) 48 × 32 |
| Titre « TODO (4) » · 1ʳᵉ carte | (351, 121) · (324, 160) 280 × 88 | (312, 104) · (285, 143) 280 × 88 | (43, 88) · (16, 127) 280 × 88 |
| « + New Column » | (1236, 160) 280 × 814 | (1197, 143) 280 × 814 | (928, 127) 280 × 814 |
| Tableau ouvert dans la barre | (0, 146) 276 × 48 | (0, 146) 240 × 48 | choix du tableau : (54, 130) 240 × 48 |
| Cadre du thème · interrupteur · « Hide Sidebar » | (24, 888) 251 × 48 · (130, 902) 40 × 20 · (0, 944) 276 × 48 | (13, 880) 235 × 48 · (112, 894) 40 × 20 · (0, 944) 240 × 48 | choix du tableau : cadre (70, 338) 235 × 48, interrupteur (169, 352) 40 × 20 |
| Barre masquée : « Show Sidebar » · 1ʳᵉ colonne | (0, 944) 56 × 48 · x 24 | (0, 944) 56 × 48 · x 24 | — |
| Voir une tâche | (480, 251) 480 × 523, centrée | (144, 251) 480 × 523 | (16, 188) 343 × 595 dans 375 × 970 ¹ |
| Suppression | (480, 398) 480 × 229, centrée | (144, 398) 480 × 229 | (16, 343) 343 × 284 dans 375 × 970 |
| Choix du tableau | — | — | (54, 80) 264 × 322 |
| Tableau vide : « + Add New Column » | (782, 516) 174 × 48 | (427, 480) 174 × 48 | centré |

¹ La maquette mobile montre (16, 207) 343 × 557 avec une 3ᵉ sous-tâche d'une ligne (« Surveying and testing ») ; celle de `data.json` (« Talk to potential customers about our proposed solution and ask for fair price expectancy ») prend trois lignes à cette largeur, soit 38 px de plus.

## 6. États et interactions

| Élément | Normal | Survol | Focus clavier |
|---|---|---|---|
| Bouton principal (L, S) | `#635fc7` | `#534ec1` | contour 2 px décalé de 2 px (`#635fc7` clair, `#a8a4ff` sombre) |
| Bouton secondaire | violet à 10 % (clair) · blanc (sombre) | violet à 25 %, texte `#5450c2` (clair) | idem |
| Bouton destructif | `#e42828` | `#cc1a1a` | idem |
| Bouton désactivé | opacité 25 % | — | non atteignable |
| Carte | blanche · `#2b2c37` | titre violet (`#635fc7` · `#a8a4ff`) | contour |
| Tableau de la barre | gris (Q-A1, Q-A2) | fond violet à 10 % (clair) · blanc (sombre), texte `#635fc7` | contour |
| Sous-tâche | fond `#f4f7fd` · `#20212c` | fond violet à 25 % | contour de la case |
| Champ, liste Status | bordure `#828fa3` | bordure `#635fc7` | bordure `#635fc7` épaissie d'un anneau de 1 px : un indice qui ne tient pas qu'à la couleur (v1.0.1, rapport IA K6) |
| Champ en erreur | bordure et « Can't be empty » (ou « Used ») en rouge | | |

| Événement | Effet |
|---|---|
| Ouvrir un dialogue | il prend le focus ; Tab reste dedans ; Échap ou un clic sur le voile ferme sans enregistrer ; le focus revient à l'élément d'origine |
| Ouvrir un menu (tableau, tâche) | deux boutons ; Échap ou un clic à côté ferme ; le focus revient au bouton du menu |
| Changer de tableau | adresse, titre et colonnes suivent ; le nom du tableau est annoncé ; retour du navigateur et rechargement retrouvent le tableau |
| Glisser une carte (souris ; tactile : appui de 300 ms puis glisser) | la carte suit le pointeur avec l'ombre des menus ; une place de dépôt pointillée montre où elle tombera ; dépôt : D12 ; le changement est annoncé |
| Clavier, sur une carte | Alt + ↑ ou ↓ : monte ou descend d'une place ; Alt + ← ou → : passe en bas de la colonne voisine ; le focus reste sur la carte ; annoncé |
| Interrupteur du thème | clair ↔ sombre ; au premier passage, le thème de l'appareil ; le choix est gardé (clé `kanban/theme`) |
| « Hide Sidebar » · « Show Sidebar » | masque ou montre la barre ; gardé (clé `kanban/sidebar`) |

Aucune transition si `prefers-reduced-motion: reduce`.

## 7. Accessibilité

### Contrats

| # | Contrat |
|---|---|
| A1 | Un seul `h1` (le nom du tableau) ; `h2` pour les colonnes et les dialogues |
| A2 | Repères : `header`, `nav` (barre), `main` (tableau) ; dialogues en `dialog` modal nommés par leur titre ; les suppressions sont des dialogues d'alerte |
| A3 | Chaque champ a son `label` ; son erreur lui est liée (`aria-invalid`, description) ; le premier champ en erreur reçoit le focus après un envoi refusé |
| A4 | Cases à cocher, liste Status et interrupteur natifs ; menus faits de boutons natifs, sans rôle ARIA de menu |
| A5 | Points des colonnes, icônes et logo décoratifs (le logo est le lien d'accueil nommé « kanban ») |
| A6 | Contraste AA (4,5:1 ; 3:1 pour les grands textes et les bordures de champ) dans les deux thèmes, survols compris |
| A7 | Focus visible sur chaque élément interactif, jamais par la seule couleur ; ordre clavier = ordre de lecture ; chaque parcours (créer, modifier, supprimer, cocher) se fait au clavier seul |
| A8 | Pas de transition si `prefers-reduced-motion: reduce` |
| A9 | Changement de tableau, déplacement d'une carte (glisser ou clavier), changement de statut, sous-tâche cochée : annoncés (région de statut) ; chaque carte décrit le déplacement au clavier (Alt + flèches) |
| A10 | Un dialogue ou un menu fermé rend le focus à l'élément qui l'a ouvert (ouvert depuis un menu : au bouton du menu ; suppression d'une tâche annulée : à sa carte) ; après une suppression, le focus va au titre du tableau |

### Noms accessibles utilisés par les tests

| Élément | Rôle | Nom |
|---|---|---|
| Barre | navigation | « Boards » ; links par tableau (« Platform Launch »… ; le tableau ouvert : `aria-current`) ; button « + Create New Board » ; switch « Dark theme » ; button « Hide Sidebar » |
| Barre masquée | button | « Show Sidebar » |
| En-tête | heading (1) | nom du tableau (sous 768 px : il contient le button du même nom, qui ouvre le choix du tableau) ; button « Add New Task » ; button « Board options » (menu : buttons « Edit Board », « Delete Board ») |
| Colonnes | heading (2) | « Todo (4) », « Doing (6) », « Done (7) » ; list ; button « + New Column » |
| Cartes | button | son texte : « Build UI for onboarding flow 0 of 3 subtasks » ; description : la consigne Alt + flèches |
| Voir une tâche | dialog | titre de la tâche ; button « Task options » (buttons « Edit Task », « Delete Task ») ; checkbox par sous-tâche (nom : son titre) ; combobox « Current Status » |
| Formulaire de tâche | dialog | « Add New Task » / « Edit Task » ; textbox « Title », « Description » ; group « Subtasks » : textbox « Subtask 1 »…, button « Remove subtask 1 »… ; button « + Add New Subtask » ; combobox « Status » ; button « Create Task » / « Save Changes » |
| Formulaire de tableau | dialog | « Add New Board » / « Edit Board » ; textbox « Name » / « Board Name » ; group « Columns » / « Board Columns » : textbox « Column 1 »…, button « Remove column 1 »… ; button « + Add New Column » ; button « Create New Board » / « Save Changes » |
| Suppression | alertdialog | « Delete this board? » / « Delete this task? » ; buttons « Delete », « Cancel » |
| Choix du tableau | dialog | « Select a board » ; buttons par tableau ; button « + Create New Board » ; switch « Dark theme » |

## 8. Critères d'acceptation

```
Mise en page (positions de la §5)
S1  Given 1440 × 1024, Platform Launch   Then barre, titre, Add New Task, titre de colonne, 1re carte, + New Column, tableau ouvert, thème, Hide Sidebar à leurs positions
S2  Given 768 × 1024 · 375 × 667   Then idem à leurs positions ; « + » seul et pas de barre sous 768
S3  Given la barre masquée à 1440 et 768   Then Show Sidebar à sa position, 1re colonne à x 24
S4  Given voir une tâche et la suppression à 1440, 768, 375   Then dialogue à sa position, centré ; voile à 50 %
S5  Given 375 × 667, le titre du tableau   When je l'ouvre   Then le choix du tableau à sa position
S6  Given 320, 375, 767, 768, 1023, 1024, 1440 px, chaque vue   Then pas de défilement horizontal de la page ; le tableau, lui, défile

Tableaux et barre latérale
S7  Given le premier chargement   Then « All boards (3) », Platform Launch ouvert, ses 3 colonnes avec titres, compteurs et couleurs, chaque carte (titre, « n of m subtasks ») dans l'ordre de data.json
S8  Given la barre   When j'ouvre chaque tableau   Then adresse, titre de la page, h1 et colonnes suivent, annoncé ; retour du navigateur et rechargement retrouvent le tableau ; adresse inconnue : le premier
S9  Given 375 px   When j'ouvre le choix du tableau et choisis Roadmap   Then il se ferme, Roadmap est ouvert ; Échap ferme sans changer
S10 Given « Hide Sidebar »   When je masque puis montre la barre   Then la barre disparaît puis revient, Show Sidebar entre les deux ; gardé au rechargement
S11 Given « + Create New Board »   When je crée « Web Design » avec Todo et Doing   Then 4 tableaux, Web Design ouvert (#/board/web-design), 2 colonnes vides
S12 Given le formulaire de tableau   When nom vide, colonne vide, deux colonnes « Todo »   Then « Can't be empty », « Used », focus sur le 1er champ en erreur, rien n'est créé
S13 Given Edit Board de Platform Launch   When je renomme Doing en « In Progress », ajoute « Review », retire Done   Then colonnes In Progress (6 tâches, statut renommé), Review vide, Done et ses 7 tâches retirés ; Cancel ou Échap : rien ne change
S14 Given Delete Board   When Cancel   Then rien ; When Delete   Then « All boards (2) », Marketing Plan ouvert, focus sur son titre
S15 Given un tableau sans colonne   Then le message vide, Add New Task désactivé ; « + Add New Column » ouvre Edit Board ; « + New Column » aussi
S16 Given tous les tableaux supprimés   Then le message sans tableau et « + Create New Board »

Tâches
S17 Given une carte   When je l'ouvre   Then titre, description, « Subtasks (n of m) », cases, statut ; Échap ferme, focus sur la carte
S18 Given une tâche ouverte   When je coche puis décoche une sous-tâche   Then compteurs du dialogue et de la carte suivent, barré, annoncé
S19 Given une tâche de Todo   When je choisis Doing dans Current Status   Then elle passe en bas de Doing, compteurs Todo (3) et Doing (7)
S20 Given Add New Task   Then Title vide, 2 sous-tâches proposées, Status = 1re colonne ; When Create Task vide   Then « Can't be empty » (titre et sous-tâches vides), focus sur Title, rien n'est créé
S21 Given Add New Task rempli (titre, description, 1 sous-tâche gardée, 1 retirée, 1 ajoutée, Status Done)   When Create Task   Then la tâche en bas de Done, « 0 of 2 subtasks », Done (8)
S22 Given Edit Task   Then champs remplis ; When je change titre, sous-tâches, statut   Then la carte suit à sa nouvelle place ; Cancel ou Échap : rien ne change
S23 Given Delete Task   When Cancel   Then rien, focus rendu ; When Delete   Then carte retirée, compteur de colonne, focus sur le titre du tableau

Glisser-déposer et clavier
S24 Given la souris   When je glisse une carte de Todo sur Doing, entre deux cartes   Then place de dépôt montrée pendant le glissement ; la carte tombe à cette place, statut Doing, compteurs suivent, annoncé
S25 Given la souris   When je glisse une carte vers le haut de sa colonne   Then elle change de place, statut inchangé
S26 Given le tactile   When appui de 300 ms puis glisser   Then la carte se déplace ; When glissement immédiat   Then le tableau défile, aucune carte ne bouge
S27 Given le focus sur une carte   When Alt + ↓, Alt + ↑, Alt + →, Alt + ←   Then elle descend, remonte, passe en bas de la colonne voisine et revient ; le focus la suit ; annoncé

Persistance et thème
S28 Given chaque changement (tableau, colonne, tâche, sous-tâche, déplacement, suppression)   When je recharge   Then retrouvé
S29 Given le navigateur vidé, ou des données gardées sans la forme de D1   When je recharge   Then les 3 tableaux de data.json
S30 Given l'appareil en sombre, premier passage   Then sombre ; When j'actionne l'interrupteur (souris puis clavier)   Then clair, puis sombre ; gardé au rechargement
S31 Given chaque thème   Then fonds, textes, points et boutons de la §4

Interactions et accessibilité
S32 Given chaque type de bouton, la carte, le tableau de la barre, la sous-tâche, le champ, en clair et en sombre (choisi par l'interrupteur)   When survol   Then l'état de la §6
S33 Given prefers-reduced-motion: reduce   Then aucune transition
S34 Given le tableau, voir une tâche, chaque formulaire, la suppression, le choix du tableau   When je parcours au Tab jusqu'au dernier élément   Then contour visible partout ; dans un dialogue, le focus reste dedans ; Échap le rend à l'élément d'origine
S35 Given le tableau, chaque dialogue, à 375, 768 et 1440, dans les deux thèmes   Then axe-core : aucune violation sérieuse ou critique
S38 Given le clavier seul   When je crée un tableau (refusé vide, puis accepté), j'ajoute une tâche (refusée vide, puis acceptée), je coche une sous-tâche, je modifie puis supprime une tâche après confirmation, je renomme le tableau   Then chaque résultat (titre, adresse, colonne, compteurs, données gardées) ; le focus suit
S39 Given une carte, un champ au focus   Then la carte décrit Alt + flèches ; le champ a une bordure violette épaissie
S36 Given le HTML servi et chaque vue rendue   Then validateur W3C Nu et html-validate (réglage FM) sans erreur ; eslint sans erreur ; gardes des règles FM (rem, aria-label, CSS logique)

Visuel (G3-6, G3-7 : 5 %, références corrigées hors dépôt ; tests sautés sans design/)
S37 Given les 24 écrans de G3-6 (« voir une tâche » avec les sous-tâches de la maquette : §3.3, §5 note ¹)   Then chaque capture vs design/reference-aa/<écran>.png ≤ 5,0 %
```

Règles sans navigateur (`node --test tests/unit/`)

```
U1 D3 : adresse d'un tableau (« Platform Launch » → platform-launch), doublons -2, -3
U2 D4, D5 : validation des tableaux et des tâches : chaque « Can't be empty », « Used » sans tenir compte de la casse, un formulaire complet est valide
U3 D6 : ajouter une tâche, changer son statut : en bas de la colonne
U4 D7 : renommer une colonne renomme le statut de ses tâches ; retirer une colonne retire ses tâches
U5 D12 : déplacer une tâche (même colonne, autre colonne, place donnée) ; ordre des autres gardé
U6 D11 : compteurs « 1 of 3 subtasks », « Todo (4) » ; D10 : couleur des colonnes selon leur place
U7 D1, D2 : forme des données gardées : data.json acceptée, chaque défaut refusé (tableau sans colonnes, tâche sans titre, statut qui n'est pas un texte, sous-tâche sans isCompleted) ; au chargement, le statut devient le nom de la colonne
U8 D4, D6, D8 : créer un tableau, modifier une tâche (à sa place, ou en bas de sa nouvelle colonne), cocher ou décocher une sous-tâche, retirer une tâche : un nouveau tableau, l'ancien intact, l'ordre des autres gardé
```
