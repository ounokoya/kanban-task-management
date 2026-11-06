# ADR-0011 : Publication sur GitHub Pages sous /kanban-task-management/

## Statut
Accepté (2026-11-06) — Pré-dev 1 (P1).

## Contexte
FM demande un site en ligne et un dépôt public.

## Options
| Option | Pour | Contre |
|---|---|---|
| **Branche `gh-pages` publiée par `npm run deploy` (choisie)** | Comme les solutions précédentes ; pas de workflow Actions | Une étape manuelle |
| GitHub Actions | Automatique | Jeton sans droit `workflow` par défaut (M1) |

## Décision
- `base: '/kanban-task-management/'` dans Vite ; dépôt public `ounokoya/kanban-task-management`, avec l'accord de Koya.

## Conséquences
- Tests en ligne : `BASE_URL=https://ounokoya.github.io/kanban-task-management/ npx playwright test`.
