# ADR-0010 : Maquettes premium hors dépôt ; références produites depuis le `.fig`

## Statut
Accepté (2026-11-06) — Règle FM (fichiers premium non publiés) ; SDL-FM 1.6.0.

## Contexte
Le `.fig`, l'aperçu et tout rendu de la maquette ne doivent jamais être publiés ; les tests visuels en ont pourtant besoin en local.

## Options
| Option | Pour | Contre |
|---|---|---|
| **`design/` ignoré par git ; références rendues par `scripts/fig/` (choisie)** | Rien de premium publié ; références exactes, teintes AA comprises | Tests visuels sautés ailleurs que sur ce poste |
| Captures de la maquette dans le dépôt | Tests partout | Interdit par FM |

## Décision
- `design/` (`.fig`, `preview.jpg`, `reference/`, `reference-aa/`) ignoré ; `bash scripts/fig/references.sh --aa` produit les références.

## Conséquences
- Fitness function : aucun fichier de maquette suivi par git.
