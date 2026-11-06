# ADR-0006 : Navigation par ancre, une adresse par tableau

## Statut
Accepté (2026-11-06) — G2 (Q-B1).

## Contexte
Le tableau ouvert doit survivre au rechargement et au retour du navigateur, sur GitHub Pages (pas de réécriture d'adresses côté serveur).

## Options
| Option | Pour | Contre |
|---|---|---|
| **Ancre `#/board/<slug>` (choisie)** | Marche sur un hébergement statique ; retour du navigateur gratuit | Adresses avec `#` |
| History API (`/board/…`) | Adresses propres | Il faut un 404 de secours sur GitHub Pages |

## Décision
- `#/board/platform-launch` ; slug en minuscules et tirets, doublons `-2` (D3) ; adresse inconnue : le premier tableau.
- Les dialogues ne changent pas l'adresse.

## Conséquences
- Vérifié par S8 et U1.
