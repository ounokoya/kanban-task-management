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

## v1.0.1 en local (2026-11-06, accord de Koya : « Oui, corrige »)

| # | Fait | Test |
|---|---|---|
| K1, K2 | Le test du menu de la tâche confirme la suppression (carte retirée, Doing (5), données gardées) ; celui du menu du tableau renomme le tableau au clavier (titre, lien marqué, adresse, focus, données) | verts d'emblée (gardes) |
| K3 | S38 en tête d'`interactions.spec.js` : créer un tableau refusé puis accepté, ajouter une tâche refusée puis acceptée, cocher une sous-tâche, modifier puis supprimer après confirmation, au clavier seul | 3 tests, verts d'emblée (gardes) |
| K4 | Règles pures `newBoard`, `editTask`, `toggleSubtask`, `removeTask` ; le store n'écrit plus l'état directement | U8 (rouge avant : règles absentes) |
| K5 | Contrôleur du glisser-déposer dans `src/lib/drag.svelte.js` | S24 à S26 inchangés, verts |
| K6 | Focus des champs dans l'utilitaire `field` : bordure violette et anneau de 1 px. **Défaut trouvé par le test** : la règle de la couche `base` perdait contre `field`, la bordure restait grise au clavier | S39 (rouge avant) |
| K7 | Consigne cachée « Alt + arrow keys… » liée à chaque carte (`aria-describedby`) | S39 (rouge avant) |
| K8 | README : résumé de la réalisation en tête, 121 tests, S38 et S39 dans la table | — |

**121 / 121** (8 unitaires, 113 Playwright) ; tag `v1.0.1` local ; en attente de l'accord de publication, puis de « Regenerate report ».

## Rapport regénéré sur la v1.0.1 (accord de Koya : « Oui, publie et regénère »)

v1.0.1 publiée (`main`, tag `v1.0.1`, `gh-pages`), **113 / 113 en ligne**. Rapport regénéré : **9,6 / 10**.

| Partie | Note |
|---|---|
| Code Quality | 9,5 : Best Practices 9,5 · File Organization 9,7 · Architecture 9,6 · Testing **8,7** (était 6,1) |
| Design & UX | 9,8 : Accessibility 9,8 (était 9,4) |
| Documentation | 9,8 : README 9,9 · Commits 9,7 |

Sous 9,0 : Testing seul. Les autres parties n'ont plus que des points forts.

| # | Partie | Remarque FM | Verdict | Proposition |
|---|---|---|---|---|
| L1 | Testing (« needs attention ») | Le survol en sombre ouvre la suppression d'un tableau sans la confirmer (`interactions.spec.js:270`) | **Faux positif sur le fond** : S14 et S16 (`boards.spec.js`) suppriment après confirmation ; absent d'`interactions.spec.js` (M52) | S38 : supprimer un tableau au clavier seul (Cancel, puis Delete : tableau, lien et données retirés, Marketing Plan ouvert, focus sur son titre) ; le survol en sombre confirme la suppression |
| L2 | Testing (« needs attention ») | Tous les scénarios ouvrent l'app à 1440 px | **Faux positif sur le fond** : S1 à S6 (`layout.spec.js`), S9, S26 et S35 testent 375 et 768 px ; mais `interactions.spec.js` reste à 1440 | S40 en tête d'`interactions.spec.js` : à 375 px, choisir un tableau, ajouter une tâche par « + », changer son statut, colonnes qui défilent ; à 768 px, barre masquée puis montrée, tâche ajoutée |

### Suite en local (tests seulement, l'app ne change pas)

| # | Fait | Test |
|---|---|---|
| L1 | S38 : supprimer un tableau au clavier seul (Cancel, puis Delete) ; le survol en sombre confirme la suppression | verts d'emblée (gardes) |
| L2 | S40 en tête d'`interactions.spec.js` : 375 px (choix du tableau, « + », statut, colonnes qui défilent, page non) et 768 px (barre masquée puis montrée, tâche ajoutée) | verts d'emblée (gardes) |

**124 / 124** (8 unitaires, 116 Playwright) ; README à 124 tests ; en attente de l'accord pour pousser `main` et regénérer.

