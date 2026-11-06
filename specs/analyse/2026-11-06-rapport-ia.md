# 2026-11-06 — Rapport IA FM : Kanban task management (v1.0.0)

> Étape F (Pro). Soumission du 2026-11-06 avec l'accord de Koya (« Oui, soumets ») ; le rapport IA est généré dès la soumission. Solution : https://www.frontendmentor.io/solutions/kanban-board-with-svelte-5-tailwind-v4-pointer-event-drag-and-drop--muvWE8uyd — rapport à `/report`, seul l'auteur le voit. Tri fait en relisant les tests et le code avant chaque verdict (M41). Objectif de Koya : toutes les notes ≥ 9,0.

## Notes

| Partie | Note |
|---|---|
| **Global** | **9,1 / 10** (Exceptional) |
| Code Quality | **8,9** : Best Practices 9,3 · File Organization 9,7 · Architecture 9,2 · Testing **6,1** |
| Design & UX | 9,4 : Accessibility 9,4 |
| Documentation | 9,7 : README 9,7 · Commits 9,7 |

Sous 9,0 : Testing (6,1) et Code Quality (8,9, tirée par Testing).

## Remarques triées

| # | Partie | Remarque FM | Verdict | Proposition |
|---|---|---|---|---|
| K1 | Testing (« needs attention ») | Le test de suppression d'une tâche s'arrête au dialogue de confirmation (`interactions.spec.js:96`) | **Faux positif sur le fond** : S23 (`tasks.spec.js`) supprime et vérifie la carte retirée, le compteur et le focus ; mais le relecteur ne lit que `interactions.spec.js` (M46) | Le test du menu de la tâche confirme la suppression et vérifie la carte retirée |
| K2 | Testing (« needs attention ») | Le test du menu du tableau ouvre Edit Board sans enregistrer (`interactions.spec.js:77`) | **Faux positif sur le fond** : S13 (`boards.spec.js`) renomme, ajoute et retire des colonnes et enregistre | Le test du menu enregistre un nouveau nom et vérifie le titre et la barre |
| K3 | Testing (« needs attention ») | Ni création ou modification de tâche, ni création de tableau, ni validation, ni sous-tâche cochée | **Faux positif sur le fond** : S11, S12, S17 à S22 et S28 les mènent au bout ; le relecteur n'a vu que le début d'`interactions.spec.js` | En tête d'`interactions.spec.js` : les parcours complets au clavier seul (créer un tableau refusé puis accepté, ajouter une tâche refusée puis acceptée, cocher une sous-tâche, modifier, supprimer après confirmation), un apport réel : ces parcours ne sont aujourd'hui testés qu'à la souris |
| K4 | Best Practices (suggestion), Architecture (suggestion) | `toggleSubtask` et `deleteTask` modifient l'état directement, hors des règles pures | Juste | Règles pures `toggleSubtask` et `removeTask` dans `rules.js`, testées sans navigateur ; le store les applique comme les autres |
| K5 | Architecture (suggestion) | Le contrôleur du glisser-déposer (écouteurs, place de dépôt, défilement) est dans `Board.svelte` | Juste | Module `src/lib/drag.svelte.js` : état du glissement et calcul de la place ; `Board.svelte` ne garde que le rendu |
| K6 | Accessibility (« needs attention ») | Le focus d'un champ ne change que la couleur de la bordure | Juste (règle FM : pas d'indice par la seule couleur) | Bordure épaissie au focus (anneau de 1 px en plus, `box-shadow`) ; test |
| K7 | Accessibility (suggestion) | Alt + flèches n'est annoncé nulle part | Juste | Consigne cachée visuellement, liée aux cartes par `aria-describedby` ; test |
| K8 | README (suggestion) | Pas de résumé de la réalisation avant la liste du challenge | Juste | Deux phrases en tête de l'Overview : Svelte 5, `localStorage`, glisser-déposer, thèmes, tests |

Trois remarques de Testing sur trois viennent de la lecture partielle du relecteur (M46) ; je n'avais pas mis les parcours de création, modification et suppression en tête du fichier qu'il lit.
