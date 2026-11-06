# ADR-0008 : Dialogues natifs, menus de boutons natifs, contrôles natifs, validation sur mesure

## Statut
Accepté (2026-11-06) — G2 (Q-B3 à Q-B6), règle FM « prefer native element ».

## Contexte
Six dialogues, deux menus, des cases, une liste de statuts, un interrupteur ; le focus doit rester dans un dialogue et revenir à l'élément d'origine ; les messages sont ceux de la maquette.

## Options
| Option | Pour | Contre |
|---|---|---|
| **`dialog` + `showModal()`, `select`, `input type="checkbox"` (et `role="switch"`) natifs (choisie)** | Focus, Échap, clavier et lecteurs d'écran fournis par le navigateur | Listes ouvertes natives, pas celle de la maquette |
| Composants ARIA sur mesure (menu, listbox) | Fidèles à la maquette ouverte | Remarques FM « prefer native element » ; code d'accessibilité à refaire |

## Décision
- Dialogues : `dialog` ouvert par `showModal()`, voile par `::backdrop` ; suppressions en `role="alertdialog"` ; focus rendu à l'origine (A10).
- Menus : un bouton (`aria-expanded`) qui montre deux boutons ; Échap et clic à côté ferment.
- Validation : « Can't be empty », « Used », liées par `aria-describedby`, `aria-invalid` ; focus sur le premier champ en erreur.

## Conséquences
- Vérifié par S9, S11 à S23, S34, U2.
