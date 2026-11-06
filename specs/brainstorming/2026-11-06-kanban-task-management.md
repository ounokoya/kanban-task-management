# 2026-11-06 — Brainstorming : Kanban task management (Guru, premium)

> SDL-FM 1.6.0, Pré-dev 1 et 2. Étape F de la remise à niveau (Pro) : second des 2 challenges Guru. Challenge : https://www.frontendmentor.io/challenges/kanban-task-management-web-app-wgQLt-HlbB

## Démarrage et téléchargements (2026-11-06, accord de Koya : « Oui, lance le Kanban »)

- Challenge démarré : dernier crédit premium du mois (0 restant, recharge le 2026-12-06).
- `kanban-task-management-web-app.zip` (95 Ko) et `kanban-task-management-web-app-figma.zip` (870 Ko) téléchargés ; pas de fenêtre « Accept and download » cette fois.

## Ce que contient le challenge

- **Starter** : `starter-code/index.html`, `data.json`, `assets/` (logos clair, sombre et mobile ; icônes du tableau, de la barre latérale, du thème, des menus, de la croix, de la coche ; favicon), README, modèle de README, `preview.jpg` (maquette premium, hors dépôt), `AGENTS.md` et `CLAUDE.md` (consignes de tuteur, données à ranger en Phase 0).
- **Fichier Figma** : `kanban-task-management-web-app.fig` est cette fois le format brut « fig-kiwi » version 15 (2022), pas une archive : 3 blocs (schéma et message en deflate, une miniature PNG), lus par le décodeur de l'Invoice (`invoice-app/scripts/fig/kiwi_fig.py`) : 189 définitions, 9 684 nœuds. Page « Designs » : **72 écrans** (mobile 375, tablette 768, desktop 1440 ; clair et sombre ; tableau, tableau vide, barre latérale masquée, choix du tableau en mobile, voir, ajouter et modifier une tâche ou un tableau, supprimer une tâche ou un tableau ; états « Active » en desktop) et le **Design System** (1440 × 2850). Page « Internal Only Canvas » : colonnes de cartes clair et sombre.
- **Données** : `data.json`, 3 tableaux : Platform Launch (Todo 4, Doing 6, Done 7 tâches), Marketing Plan (Todo 3), Roadmap (Now 2) ; une tâche : `title`, `description`, `status` (nom de colonne), `subtasks` (`title`, `isCompleted`).
- **Comportements attendus** (README) : changer de tableau par la barre latérale ; « Create New Board » ; « Edit Board » et « Delete Board » (confirmation, colonnes et tâches supprimées) ; colonnes ajoutées et retirées dans les fenêtres ; « Add New Task » désactivé sans colonne ; « Add New Column » ouvre « Edit Board » ; une tâche ajoutée va en bas de sa colonne ; changer le statut déplace la tâche ; glisser-déposer (bonus) change le statut et l'ordre.

## Pré-dev 1 : choix de Koya (2026-11-06)

| # | Question | Options | Décision |
|---|---|---|---|
| P1 | Périmètre | Front + localStorage + glisser ; front + localStorage ; full-stack | **Front + localStorage + glisser-déposer** : tout le brief et deux bonus (glisser pour changer de colonne et réordonner ; changements gardés au rechargement) ; GitHub Pages |
| P2 | Pile | Svelte 5 + Vite ; JavaScript sans cadriciel | **Svelte 5 + Vite** : même pile que l'Invoice (Tailwind v4, Playwright, tests unitaires `node --test`) |
| P3 | Glisser-déposer | Écrit à la main ; bibliothèque svelte-dnd-action | **Écrit à la main** (pointer events, souris et tactile, sans dépendance) ; le menu Status reste l'équivalent au clavier |
| P4 | Penpot | Nouveau fichier ; une page dans « invoice-app » | **Nouveau fichier « kanban-task-management »**, créé par Koya, plugin connecté |

## Leçons appliquées dès le départ (Invoice app)

- Toutes les notes du rapport IA à 9,0 au moins, Testing compris (mémoire Koya).
- Tests unitaires des règles pures dès la Phase 4 ; tests de bout en bout de chaque contrôle (souris et clavier, dans les deux sens) en tête du fichier des interactions ; chaque test commence par l'action qu'il vérifie (M46).
- Messages de commit : ce qui change pour le produit ou les tests, jamais pour le relecteur IA (M47).
- Rendu des références : vérifier les dégradés et les écrans d'états du `.fig` (M44) ; `position: relative` sur toute zone qui défile (M45).

## Pré-dev 2 : plan validé (G1, 2026-11-06)

Koya : « Je valide (G1) » (schéma sur le canevas partagé, zone x 118 000). **Qui fait quoi :** Claude écrit tout le code ; Koya valide l'analyse (G2) et la maquette (G3), donne son accord au verrou, à la publication et à la soumission ; Koya crée le fichier Penpot.

| Phase | Contenu |
|---|---|
| 0-1 | Starter importé, git, Vite + Svelte 5 + Tailwind v4, outils de test ; tokens et écrans de référence rendus depuis le `.fig` (hors dépôt) |
| 2 | Analyse Excalidraw : écrans, flux, règles, contrastes, questions ; G2 |
| 3 | Maquette Penpot : bibliothèque, composants, écrans clés, états ; G3 |
| 4-5 | Spec, tests au rouge (unitaires et parcours), ADR ; verrou (accord) |
| 6-10 | Code par parties, tests, parcours réel (320 à 1440 px, clavier, tactile), README (une capture par état) |
| 11-13 | Dépôt public `kanban-task-management`, `gh-pages`, soumission FM (accord) ; rapport IA corrigé jusqu'à 9,0 au moins sur chaque note |

## Analyse validée (G2, 2026-11-06)

Koya : « Je valide (G2) ». Analyse : `specs/visuel/kanban-analyse.md` et `.png` (canevas x 120 200). **Toutes les propositions sont retenues** : Q-A1 à Q-A8 (gris `#647288` en clair et `#8894a7` en sombre ; rouge `#e42828`, texte rouge `#ed6a6a` en sombre ; violet `#a8a4ff` en sombre ; sous-tâche cochée `#5e5f69` (`#a5a6aa` au survol en sombre) ; textes d'exemple `#75757f` et `#92939b` ; survols plus foncés `#534ec1` et `#cc1a1a`, texte de Cancel survolé `#5450c2` ; bordures des champs `#828fa3`) et Q-B1 à Q-B16 (adresse par ancre, identifiants et statut lié au nom de colonne, `dialog` modal, menus et liste Status natifs, validation « Can't be empty » et « Used », colonne retirée à l'enregistrement, couleurs des colonnes, glisser-déposer souris, tactile et clavier, préférences gardées, écran sans tableau, « subtasks », tâche en bas de colonne, défilement du tableau seul, données vérifiées, focus 2 px).
