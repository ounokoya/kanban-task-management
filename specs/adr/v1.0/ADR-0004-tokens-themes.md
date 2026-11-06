# ADR-0004 : Tokens de la maquette et deux thèmes, teintes AA comprises

## Statut
Accepté (2026-11-06) — G2 (Q-A1 à Q-A8), G3 (G3-1).

## Contexte
12 couleurs du fichier Figma, 3 couleurs de colonnes, 11 teintes AA ; deux thèmes ; aucun texte sous AA.

## Options
| Option | Pour | Contre |
|---|---|---|
| **Tokens dans `src/app.css` (`@theme`), rôles redéfinis en sombre (choisie)** | Une seule source ; les composants n'écrivent que des rôles | — |
| Couleurs dans chaque composant | Rien à nommer | Thème sombre et teintes AA dispersés |

## Décision
- Couleurs, typographies, ombres et le point de rupture dans `src/app.css` ; le thème suit `data-theme` sur `<html>`, posé avant le premier rendu.
- Teintes AA de G2 et G3 (tableau de la §4 de la spec).

## Conséquences
- Fitness function : aucune couleur écrite en dur dans `src/` hors des valeurs de tokens de `src/app.css`.
