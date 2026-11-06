# Références visuelles — Kanban task management

> SDL-FM 1.6.0, Phase 1. Challenge premium : **les images de référence ne sont pas dans le dépôt** (règle FM : maquettes non publiées). Elles sont produites en local, dans `design/reference/` (ignoré par git), depuis `design/kanban-task-management.fig` téléchargé sur FM.

## Produire les références

```
bash scripts/fig/references.sh
```

| Étape | Outil |
|---|---|
| Copier le `.fig` (format brut fig-kiwi version 15, sans archive) et décompresser ses blocs deflate ; le dernier est une miniature PNG | `references.sh` |
| Décoder le schéma kiwi et le message (189 définitions, 9 684 nœuds) | `scripts/fig/kiwi_fig.py` |
| Écrire chaque écran en SVG : tracés précalculés par Figma (formes, contours, lettres), couleurs, **dégradés linéaires** (ajoutés pour ce challenge, M44), opacités, ombres portées, découpe des cadres | `scripts/fig/fig_render.py` |
| Rendre chaque SVG en PNG dans Chromium (lissage gris) | `scripts/fig/svg2png.js` |

Le texte est rendu avec les contours de lettres enregistrés par Figma : aucune police n'est nécessaire. Contrôle : `desktop-board-light` comparé à `preview.jpg` de FM (positions, couleurs, colonne « + New Column » en dégradé) : conforme.

## Écrans (72 et le Design System, à 1×)

design-system · desktop-add-board-dark · desktop-add-board-light · desktop-add-task-dark-active · desktop-add-task-dark · desktop-add-task-light-active · desktop-add-task-light · desktop-board-dark-active · desktop-board-dark-empty-active · desktop-board-dark-empty · desktop-board-dark · desktop-board-dark-sidebar-hidden-active · desktop-board-dark-sidebar-hidden · desktop-board-light-active · desktop-board-light-empty-active · desktop-board-light-empty · desktop-board-light · desktop-board-light-sidebar-hidden-active · desktop-board-light-sidebar-hidden · desktop-delete-board-dark-active · desktop-delete-board-dark · desktop-delete-board-light-active · desktop-delete-board-light · desktop-delete-task-dark · desktop-delete-task-light · desktop-edit-board-dark · desktop-edit-board-light · desktop-edit-task-dark · desktop-edit-task-light · desktop-view-task-dark-active · desktop-view-task-dark · desktop-view-task-light-active · desktop-view-task-light · mobile-add-board-dark · mobile-add-board-light · mobile-add-task-dark · mobile-add-task-light · mobile-board-dark-empty · mobile-board-dark-mobile-select-board · mobile-board-dark · mobile-board-light-empty · mobile-board-light · mobile-board-light-select-board · mobile-delete-board-dark · mobile-delete-board-light · mobile-delete-task-dark · mobile-delete-task-light · mobile-edit-board-dark · mobile-edit-board-light · mobile-edit-task-dark · mobile-edit-task-light · mobile-view-task-dark · mobile-view-task-light · tablet-add-board-dark · tablet-add-board-light · tablet-add-task-dark · tablet-add-task-light · tablet-board-dark-empty · tablet-board-dark · tablet-board-dark-sidebar-hidden · tablet-board-light-empty · tablet-board-light · tablet-board-light-sidebar-hidden · tablet-delete-board-dark · tablet-delete-board-light · tablet-delete-task-dark · tablet-delete-task-light · tablet-edit-board-dark · tablet-edit-board-light · tablet-edit-task-dark · tablet-edit-task-light · tablet-view-task-dark · tablet-view-task-light

Desktop 1440 × 1024 (32, dont les états « active »), tablette 768 × 1024 (20), mobile 375 × 667 ou 970 (20) ; chaque vue en clair et en sombre. Le `.fig` contient 7 dégradés : le fond de la colonne « + New Column ».
