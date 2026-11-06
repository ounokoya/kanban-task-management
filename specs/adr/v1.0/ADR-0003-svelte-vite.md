# ADR-0003 : Svelte 5 et Vite, une application d'une page sans SvelteKit

## Statut
Accepté (2026-11-06) — Pré-dev 1 (P2).

## Contexte
Trois tableaux de colonnes, de tâches et de sous-tâches, plusieurs dialogues, un glisser-déposer et des préférences : beaucoup d'état partagé entre la barre, l'en-tête, le tableau et les dialogues.

## Options
| Option | Pour | Contre |
|---|---|---|
| **Svelte 5 + Vite (choisie)** | Runes (`$state`, `$derived`) pour l'état partagé ; même pile que l'Invoice (outils, tests, leçons) | Un cadriciel de plus que le JavaScript seul |
| JavaScript sans cadriciel | Aucune dépendance | Mise à jour du DOM à écrire pour chaque changement |

## Décision
- Svelte 5 (runes), Vite, Tailwind CSS v4 ; un état central dans un module `.svelte.js` ; règles pures dans `src/lib/rules.js`.
- Build statique publié sous `/kanban-task-management/` (ADR-0011).

## Conséquences
- Tests unitaires des règles sans navigateur (U1 à U7, `node --test`) ; parcours dans Playwright.
