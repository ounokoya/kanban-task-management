# ADR-0009 : Glisser-déposer par les pointer events, équivalent au clavier

## Statut
Accepté (2026-11-06) — Pré-dev 1 (P3), G2 (Q-B9), G3 (G3-4).

## Contexte
Bonus du brief : glisser une tâche pour changer son statut et la réordonner ; souris et tactile ; utilisable au clavier et annoncé.

## Options
| Option | Pour | Contre |
|---|---|---|
| **Pointer events écrits à la main (choisie)** | Souris et tactile, aucune dépendance ; place de dépôt et ombre comme G3-4 | Code à écrire et à tester |
| API HTML Drag and Drop | Native | Ne marche pas au tactile |
| svelte-dnd-action | Clavier fourni | Une dépendance à télécharger |

## Décision
- `pointerdown` sur une carte : glissement après 4 px à la souris, après un appui de 300 ms au tactile (sinon le tableau défile) ; la carte suit le pointeur, une place de dépôt pointillée montre la destination ; `pointerup` dépose (`moveTask`).
- Clavier : Alt + ↑ ↓ ← → sur une carte ; annonce dans la région de statut.

## Conséquences
- Vérifié par S24 à S27 et U5 ; fitness function : aucune dépendance d'exécution autre que la police.
