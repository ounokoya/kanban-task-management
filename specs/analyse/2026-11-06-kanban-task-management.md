# 2026-11-06 — Rapport d'exécution : Kanban task management

> SDL-FM 1.6.0, Phases 7 et 8. Tests sur le build de production (`vite build` + `vite preview`) ; parcours réel dans le navigateur intégré (`http://localhost:4270/kanban-task-management/`) et par script Playwright, à 320, 375, 768 et 1440 px, en clair et en sombre.

## 1. Tests automatiques (Phase 7)

`npm test` : **7 tests unitaires et 109 tests Playwright, tous réussis** (Playwright : 1,1 min).

| Groupe | Scénarios | Résultat |
|---|---|---|
| Règles sans navigateur | U1 à U7 : adresses, validations, ajout, statut, modification d'un tableau, déplacement, compteurs, données gardées | ✅ 7 / 7 |
| Mise en page | S1 à S6 : positions du `.fig` à 1 px près (2 px pour les textes) à 1440, 768 et 375 ; barre masquée ; dialogues centrés et voile ; choix du tableau ; 320 à 1440 sans défilement horizontal | ✅ 10 / 10 |
| Tableaux et barre | S7 à S16 (sauf S10) : premier chargement, changer de tableau, choix mobile, créer, valider, modifier, supprimer, tableau sans colonne, plus de tableau | ✅ 9 / 9 |
| Tâches | S17 à S23 : voir, cocher, changer le statut, ajouter (vide, complète), modifier, supprimer | ✅ 7 / 7 |
| Glisser-déposer | S24 à S26 : souris entre deux cartes et dans la colonne ; tactile après 300 ms, défilement sinon | ✅ 3 / 3 |
| Persistance et thème | S28, S29, S31 (clair, sombre) | ✅ 4 / 4 |
| Contrôles de bout en bout | S30 (thème souris et clavier), S27 (Alt + flèches), S10 (barre), menu du tableau au clavier, menu de la tâche hors du dialogue, S32 (survol clair et sombre), S33, S34 | ✅ 9 / 9 |
| Accessibilité | S35 : axe-core sur 5 vues × 3 largeurs × 2 thèmes et le choix du tableau ; A2 : repères, un `h1`, dialogues nommés | ✅ 33 / 33 |
| HTML, JS, règles FM | S36 : W3C Nu et html-validate (HTML servi et 5 vues rendues), ESLint, longueurs en `rem`, propriétés logiques, `aria-label` | ✅ 6 / 6 |
| Fitness | ADR-0004 (couleurs seulement dans les tokens), ADR-0005 (rien hors du domaine, Plus Jakarta Sans 500 et 700), ADR-0009 (une seule dépendance : la police), ADR-0010 (aucun fichier de maquette suivi) | ✅ 4 / 4 |
| Visuel | S37 : 24 écrans comparés aux références AA rendues depuis le `.fig` | ✅ 24 / 24 |

### Comparaison visuelle (seuil 5 %)

| Écran | Desktop | Tablette | Mobile |
|---|---|---|---|
| Tableau clair / sombre | 2,56 % / 2,35 % | 2,77 % / 2,54 % | 3,18 % / 2,79 % |
| Tableau vide · barre masquée | 0,66 % · 2,29 % | — · 3,55 % | — |
| Choix du tableau | — | — | 3,55 % |
| Voir une tâche clair / sombre | 2,46 % / 2,20 % | 3,63 % | 4,67 % |
| Ajouter · modifier une tâche | 1,77 % · 1,84 % | 2,60 % · — | 2,73 % · — |
| Ajouter · modifier un tableau | 1,81 % · 1,85 % | — | — |
| Supprimer un tableau · une tâche | 1,94 % · 1,91 % | — · 2,22 % | 2,61 % · — |

Le reste des écarts : lissage des lettres (contours de Figma contre rendu de Chromium), quelques retours à la ligne différents (Chromium dessine Plus Jakarta Sans un peu plus étroite), et les bordures de champ : les références gardent la bordure de la maquette (gris à 25 %), l'app la teinte AA de Q-A8 (`#828fa3` plein).

## 2. Premier passage des tests sur le code

Avant le code, un conflit entre deux tests : U6 attendait les couleurs des colonnes en hexadécimal dans `rules.js`, que la fitness function d'ADR-0004 interdit dans `src/`. La règle D10 rend désormais le token (`todo`, `doing`, `done`) ; S7 vérifie toujours les couleurs rendues.

13 échecs sur 108 au premier passage, tous corrigés :

| # | Échec | Cause | Correction |
|---|---|---|---|
| T1 | Titre de colonne 27 px trop à gauche (S1, S2) | le point de couleur était dans le `h2` ; la spec place le titre au début du texte | point à côté du `h2`, dans le même bloc (S7 le trouve toujours) |
| T2 | Suppression mobile 34 px trop courte (S4 ; S37 `mobile-delete-board`) | `flex-1` sur les boutons empilés : leur hauteur tombait à celle du texte | `flex-1` dès 768 px seulement |
| T3 | « Voir une tâche » mobile 30 px trop haute (S4) | la maquette mobile montre une 3ᵉ sous-tâche d'une ligne (« Surveying and testing ») ; celle de `data.json` en prend trois ; et 32 px sous la liste Status | spec §5 note ¹ et S4 : 595 px ; marge du bas de 32 px |
| T4 | html-validate : style en ligne (S36) | couleur du point des colonnes écrite dans l'attribut `style` | classes `bg-todo`, `bg-doing`, `bg-done` |
| T5 | ESLint : espace irrégulière (S36) | espace insécable écrite telle quelle dans `announce` | ` ` |
| T6 | Parcours au Tab du formulaire : 8 éléments sur 9 (S34) | `showModal()` focalisait le premier champ, que le parcours ne revoyait jamais | le dialogue prend le focus (§6), Tab mène au premier champ |
| T7 | Le tableau créé ne s'ouvrait pas (S11, S28) | `slugs()[createBoard(…)]` lisait les adresses avant l'ajout (ordre d'évaluation) ; colonnes passées en objets | création d'abord, adresse ensuite ; noms des colonnes |
| T8 | Compteurs de sous-tâches (S18, S28) | les tests attendaient ceux de la maquette (2 of 3) ; `data.json` donne 1 of 3 pour cette tâche | tests : compteurs calculés depuis `data.json`, comme S17 |
| T9 | Choix du tableau mobile à 12,7 % (S37) | la maquette garde l'en-tête au-dessus du voile | voile à partir de 64 px |
| T10 | « Voir une tâche » mobile à 12,1 % (S37) | contenu de la maquette différent (T3, 2 sous-tâches cochées) ; Playwright faisait défiler le tableau pour atteindre la carte | S37 : sous-tâches de la maquette pour ces écrans (spec §8), ouverture sans défilement → 4,67 % |

## 3. Parcours réel (Phase 8)

| Étape | 320 px | 375 px | 768 px | 1440 px |
|---|---|---|---|---|
| Premier chargement | ✅ sans débordement | ✅ | ✅ clair | ✅ thème de l'appareil (sombre) |
| Choix du tableau | ✅ | ✅ en-tête hors du voile, chevron vers le haut | — | — |
| Voir une tâche, menu de la tâche | ✅ | ✅ (tests) | ✅ (tests) | ✅ après correctif E1 |
| Menu du tableau | — | ✅ (tests) | ✅ (tests) | ✅ (1224, 90) 192 × 94, comme la maquette |
| Glisser à la souris | — | — | ✅ (tests) | ✅ carte qui suit avec l'ombre, place pointillée, dépôt |
| Tactile, clavier | ✅ (S26, S27, S34) | | | |

## 4. Écarts relevés et suites

| # | Écart | Suite |
|---|---|---|
| E1 | Le menu de la tâche était coupé par le dialogue (qui défile quand il est trop haut) : une barre de défilement horizontale apparaissait — **invisible aux tests**, dont les deux boutons restaient dans le dialogue | Corrigé : menu placé dans la fenêtre sous son bouton, fermé au défilement ; test ajouté (rouge avant, vert après) |
| — | Les références AA gardent la bordure des champs à 25 % (Q-A8 non appliqué par `aa.py`) | Sans effet sur les seuils ; l'app suit la spec |

## 5. Verdict

Les 37 critères de la spec, les 7 règles, les 24 écrans et les fitness functions passent ; le parcours réel a trouvé un écart, corrigé et couvert par un test. Prêt pour la Phase 9 (README, CHANGELOG) ; publication et soumission avec l'accord de Koya.

## 6. Publication (Phase 12)

Accord de Koya (« Oui, publie »). Dépôt public [`ounokoya/kanban-task-management`](https://github.com/ounokoya/kanban-task-management) : `main` et le tag `v1.0.0` ; `dist/` publié sur `gh-pages` (`npm run deploy`), Pages activé sur `gh-pages` par GitHub.

`BASE_URL=https://ounokoya.github.io/kanban-task-management/ npx playwright test` : **109 réussis sur 109** sur le site en ligne (les 24 écrans visuels compris, références présentes sur ce poste).
