# Tokens — Kanban task management (lus dans le fichier Figma)

> SDL-FM 1.6.0, Phase 1. Source : `design/kanban-task-management.fig` (hors dépôt), cadre « Design System » et styles du fichier, lus par le décodeur kiwi (`scripts/fig/kiwi_fig.py`). Les noms sont ceux des styles du fichier.

## Couleurs (12)

| Style du fichier | Valeur | RGB | HSL |
|---|---|---|---|
| Main Purple | `#635fc7` | 99, 95, 199 | 242°, 48 %, 58 % |
| Main Purple (Hover) | `#a8a4ff` | 168, 164, 255 | 243°, 100 %, 82 % |
| Black | `#000112` | 0, 1, 18 | 237°, 100 %, 4 % |
| Very Dark Grey (Dark BG) | `#20212c` | 32, 33, 44 | 235°, 16 %, 15 % |
| Dark Grey | `#2b2c37` | 43, 44, 55 | 235°, 12 %, 19 % |
| Lines (Dark) | `#3e3f4e` | 62, 63, 78 | 236°, 11 %, 27 % |
| Medium Grey | `#828fa3` | 130, 143, 163 | 216°, 15 %, 57 % |
| Lines (Light) | `#e4ebfa` | 228, 235, 250 | 221°, 69 %, 94 % |
| Light Grey (Light BG) | `#f4f7fd` | 244, 247, 253 | 220°, 69 %, 97 % |
| Red | `#ea5555` | 234, 85, 85 | 0°, 78 %, 63 % |
| Red (Hover) | `#ff9898` | 255, 152, 152 | 0°, 100 %, 80 % |
| White | `#ffffff` | 255, 255, 255 | 0°, 0 %, 100 % |

Les valeurs, le RGB et le HSL de la page « Design System » concordent avec les styles du fichier.

## Typographie

Une seule famille : **Plus Jakarta Sans**, graisses Bold (700) et Medium (500). Interlignes de la page « Design System » (les styles du fichier disent 100 % pour les titres).

| Style | Graisse | Taille | Interligne | Espacement des lettres |
|---|---|---|---|---|
| Heading (XL) | Bold | 24 px | 30 px | 0 |
| Heading (L) | Bold | 18 px | 23 px | 0 |
| Heading (M) | Bold | 15 px | 19 px | 0 |
| Heading (S) | Bold | 12 px | 15 px | 2,4 px (capitales des titres de colonnes et de « All boards ») |
| Body (L) | Medium | 13 px | 23 px | 0 |
| Body (M) | Bold | 12 px | 15 px | 0 |

## Éléments interactifs (page « Design System », 03)

Clair et sombre : Button Primary (L) et (S), Button Secondary, Button Destructive (repos, survol) ; Subtask Checkbox (repos, cochée, survolée) ; Dropdown (repos, ouvert : Todo, Doing, Done) ; Text Field (repos, actif, erreur « Can't be empty »).

## Écrans

72 écrans (`specs/reference/references.md`) et le Design System, rendus depuis le `.fig` en PNG de référence dans `design/reference/` (hors dépôt).
