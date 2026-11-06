#!/usr/bin/env bash
# Rend les écrans de la maquette Figma en PNG de référence, dans design/ (hors dépôt : maquettes premium).
# Usage : bash scripts/fig/references.sh [--aa]   (il faut design/kanban-task-management.fig, téléchargé sur FM)
# Le .fig du Kanban est le format brut fig-kiwi (2022) : pas d'archive à ouvrir, pas d'images.
set -euo pipefail
cd "$(dirname "$0")/../.."
aa="${1:-}"; work=design/fig; out=design/reference${aa:+-aa}
mkdir -p "$work/images" "$out/svg"
cp design/kanban-task-management.fig "$work/canvas.fig"
python3 -I - "$work" <<'PY'
import struct, sys, zlib
d = sys.argv[1]; b = open(f'{d}/canvas.fig', 'rb').read(); off = 12; i = 0
while off + 4 <= len(b):
    n = struct.unpack('<I', b[off:off + 4])[0]; off += 4
    try: open(f'{d}/chunk{i}.bin', 'wb').write(zlib.decompress(b[off:off + n], -15))
    except zlib.error: pass  # dernier bloc : miniature PNG
    off += n; i += 1
PY
python3 -I scripts/fig/kiwi_fig.py "$work" "$work/message.json"
python3 -I scripts/fig/fig_render.py "$work/message.json" "$PWD/$work/images" "$out/svg" 'Desktop|Tablet|Mobile|Design System' $aa
jobs=(); for f in "$out"/svg/*.svg; do jobs+=("$PWD/$f:$PWD/$out/$(basename "$f" .svg).png"); done
node scripts/fig/svg2png.js "${jobs[@]}"
