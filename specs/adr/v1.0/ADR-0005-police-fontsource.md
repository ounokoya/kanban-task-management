# ADR-0005 : Plus Jakarta Sans par Fontsource

## Statut
Accepté (2026-11-06) — G3 (G3-8) ; téléchargement au verrou, avec l'accord de Koya.

## Contexte
La maquette utilise Plus Jakarta Sans (Bold 700, Medium 500) ; le site doit fonctionner sans service tiers.

## Options
| Option | Pour | Contre |
|---|---|---|
| **Fontsource, sous-ensemble latin, 500 et 700 (choisie)** | Servie avec le site, rien hors du domaine | Une dépendance npm |
| Google Fonts | Rien à installer | Requête vers un autre domaine |

## Décision
- `@fontsource/plus-jakarta-sans` (latin 500, 700) importé dans `src/app.css`.

## Conséquences
- Fitness function : rien n'est chargé hors du domaine ; Plus Jakarta Sans 500 et 700 se chargent.
