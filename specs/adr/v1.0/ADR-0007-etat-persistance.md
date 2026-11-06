# ADR-0007 : État des tableaux et persistance dans le navigateur

## Statut
Accepté (2026-11-06) — Pré-dev 1 (P1), G2 (Q-B2, Q-B15).

## Contexte
Les changements doivent rester après un rechargement (bonus), sans serveur ; `data.json` n'a pas d'identifiants et 4 tâches y ont un statut vide.

## Options
| Option | Pour | Contre |
|---|---|---|
| **`localStorage` (clés `kanban/boards`, `kanban/theme`, `kanban/sidebar`) (choisie)** | Simple, synchrone, assez grand | Lié au navigateur |
| IndexedDB | Grands volumes | Asynchrone, plus de code pour quelques kilo-octets |

## Décision
- Un état central ; chaque changement est enregistré.
- Au chargement : données gardées vérifiées (`isBoardsData`), sinon `data.json` ; statut de chaque tâche = nom de sa colonne (`normalizeBoards`).
- Règles pures : `addTask`, `setStatus`, `editBoard`, `moveTask`, validations.

## Conséquences
- Vérifié par U3 à U7, S28, S29.
