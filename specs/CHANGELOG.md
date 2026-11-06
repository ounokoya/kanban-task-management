# Changelog

Format : [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/) · Versions : [SemVer](https://semver.org/lang/fr/).

## [1.0.1] — 2026-11-06

Corrections après le rapport IA de Frontend Mentor (9,1 / 10 ; `specs/analyse/2026-11-06-rapport-ia.md`).

### Added
- S38 : chaque parcours au clavier seul (créer un tableau, ajouter une tâche refusée puis acceptée, cocher une sous-tâche, modifier, supprimer après confirmation, renommer le tableau), résultats vérifiés à l'écran et dans les données gardées.
- S39 et U8 ; les tests des menus vont jusqu'au résultat (tableau renommé, tâche supprimée).

### Changed
- Créer un tableau, modifier une tâche, cocher une sous-tâche et retirer une tâche passent par des règles pures (`newBoard`, `editTask`, `toggleSubtask`, `removeTask`) ; le store n'écrit plus l'état directement (ADR-0007).
- Le contrôleur du glisser-déposer vit dans `src/lib/drag.svelte.js` ; `Board.svelte` garde le rendu (ADR-0009).
- README : résumé de la réalisation en tête ; 121 tests.

### Fixed
- Champ au focus clavier : la bordure restait grise (règle de la couche base masquée par l'utilitaire `field`) ; elle est violette et épaissie d'un anneau de 1 px (A7).
- Chaque carte décrit le déplacement au clavier (Alt + flèches) aux lecteurs d'écran (A9).

## [1.0.0] — 2026-11-06

Première version (SDL-FM 1.6.0, deuxième challenge Guru avec le fichier Figma).

### Added
- Barre latérale (≥ 768 px) : logo, « All boards (n) », un lien par tableau (le tableau ouvert marqué), « + Create New Board », interrupteur du thème, « Hide Sidebar » ; « Show Sidebar » quand elle est masquée, choix gardé (spec §3.1).
- En-tête : nom du tableau, « + Add New Task » (désactivé sans colonne), menu du tableau ; sous 768 px, logo réduit et choix du tableau dans un dialogue qui laisse l'en-tête visible (spec §3.2, §3.8).
- Tableau : colonnes avec leur point de couleur et leur compteur, cartes « n of m subtasks », « + New Column » ; messages du tableau sans colonne et de l'app sans tableau ; le tableau défile dans les deux sens, jamais la page (spec §3.3).
- Voir une tâche : sous-tâches à cocher, statut dans une liste native, menu de la tâche qui déborde du dialogue comme dans la maquette (spec §3.4).
- Formulaires de tâche et de tableau en `dialog` modal : lignes ajoutées et retirées, validation sur mesure (« Can't be empty », « Used »), focus sur le premier champ en erreur ; renommer une colonne renomme le statut de ses tâches (spec §3.5, §3.6, ADR-0008).
- Suppression d'un tableau ou d'une tâche en `dialog` d'alerte, « Cancel » focalisé (spec §3.7).
- Glisser-déposer sans bibliothèque : souris après 4 px, tactile après un appui de 300 ms (sinon le tableau défile), carte qui suit le pointeur, place de dépôt pointillée ; Alt + flèches au clavier ; déplacements annoncés (ADR-0009).
- Thème clair et sombre : thème de l'appareil au premier passage, puis le choix gardé (ADR-0004).
- Persistance dans le `localStorage` ; `data.json` relu quand le navigateur est vidé ou que les données gardées n'ont pas la forme attendue (ADR-0007).
- Navigation par ancre : une adresse par tableau, retrouvée au rechargement et au retour (ADR-0006).
- Teintes AA dans les deux thèmes (G2 Q-A1 à Q-A8, G3) ; contour de focus de 2 px ; focus rendu à l'élément d'origine à la fermeture des dialogues et des menus.
- 116 tests écrits avant le code : 7 règles sans navigateur (U1 à U7) et 109 tests Playwright (37 critères de la spec, 24 écrans comparés aux références du `.fig` à 0,66–4,67 %, axe-core, W3C Nu, html-validate, ESLint, fitness functions des ADR-0004, 0005, 0009 et 0010).
- README avec une capture par état décrit ; rapport d'exécution `specs/analyse/2026-11-06-kanban-task-management.md`.
