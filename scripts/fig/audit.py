"""Audit des contrastes texte / fond dans les écrans du .fig décodé (WCAG 2.2).
Pour chaque texte : sa couleur, et le fond composé des formes peintes avant lui sous son centre.
Usage : python3 -I scripts/fig/audit.py design/fig/message.json '<motif des écrans>' [--aa]
--aa : avec les teintes AA validées (scripts/fig/aa.py)."""
import collections, json, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from aa import remap
AA = '--aa' in sys.argv
sys.argv = [a for a in sys.argv if a != '--aa']

msg = json.load(open(sys.argv[1])); pat = re.compile(sys.argv[2])
nodes = msg['nodeChanges']
gid = lambda g: f"{g['sessionID']}:{g['localID']}" if g else None
by = {gid(n.get('guid')): n for n in nodes}
kids = collections.defaultdict(list)
for n in nodes:
    p = n.get('parentIndex')
    if p: kids[gid(p['guid'])].append(n)
for k in kids: kids[k].sort(key=lambda n: n['parentIndex'].get('position', ''))

CTX = {'node': {}, 'dark': False, 'frame': ''}
def solid(paints):
    for p in paints or []:
        if p.get('visible', True) and p['type'] == 'SOLID':
            c = p['color']; rgb = (c['r'], c['g'], c['b'])
            if AA:
                h = remap('#%02x%02x%02x' % tuple(round(v * 255) for v in rgb), CTX['node'], CTX['dark'], CTX['frame'])
                rgb = tuple(int(h[i:i + 2], 16) / 255 for i in (1, 3, 5))
            return (*rgb, c.get('a', 1) * p.get('opacity', 1))
def text_color(n):
    ids = n.get('textData', {}).get('characterStyleIDs') or []
    for s in n.get('textData', {}).get('styleOverrideTable', []):
        ref = s.get('inheritFillStyleID')
        if s.get('fillPaints'): return solid(s['fillPaints'])
        if ref and gid(ref) in by and ids and s.get('styleID') == ids[-1]: return solid(by[gid(ref)].get('fillPaints'))
    return solid(n.get('fillPaints'))
def lum(c):
    f = lambda v: v / 12.92 if v <= 0.03928 else ((v + 0.055) / 1.055) ** 2.4
    return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2])
def over(top, bottom):
    a = top[3]; return (top[0] * a + bottom[0] * (1 - a), top[1] * a + bottom[1] * (1 - a), top[2] * a + bottom[2] * (1 - a), 1)
hexc = lambda c: '#%02x%02x%02x' % tuple(round(v * 255) for v in c[:3])

results = collections.defaultdict(list)
frames = [n for n in nodes if n.get('type') == 'FRAME' and by.get(gid((n.get('parentIndex') or {}).get('guid')), {}).get('type') == 'CANVAS' and pat.search(n.get('name', ''))]
for f in frames:
    painted = []  # (x0, y0, x1, y1, couleur avec opacité)
    CTX['dark'] = '[Dark]' in f['name']; CTX['frame'] = f['name']
    def walk(n, x, y, op):
        if not n.get('visible', True): return
        CTX['node'] = n
        t = n.get('transform', {}); x += t.get('m02', 0); y += t.get('m12', 0); op *= n.get('opacity', 1); s = n.get('size', {})
        if n['type'] == 'TEXT':
            c = text_color(n)
            if c:
                cx, cy = x + s.get('x', 0) / 2, y + s.get('y', 0) / 2; bg = (1, 1, 1, 1)
                for (x0, y0, x1, y1, col) in painted:
                    if x0 <= cx <= x1 and y0 <= cy <= y1: bg = over(col, bg)
                fg = over((c[0], c[1], c[2], c[3] * op), bg)
                l1, l2 = sorted([lum(fg), lum(bg)], reverse=True); ratio = (l1 + 0.05) / (l2 + 0.05)
                fs = n.get('fontSize', 16); bold = 'Bold' in n.get('fontName', {}).get('style', '')
                large = fs >= 24 or (bold and fs >= 18.66)
                results[(hexc(fg), hexc(bg), large)].append((ratio, f['name'], n['textData']['characters'][:24], fs))
            return
        c = solid(n.get('fillPaints'))
        if c and n['type'] in ('FRAME', 'ROUNDED_RECTANGLE', 'ELLIPSE', 'RECTANGLE') and s.get('x', 0) > 30 and s.get('y', 0) > 12:
            painted.append((x, y, x + s['x'], y + s['y'], (c[0], c[1], c[2], c[3] * op)))
        for k in kids[gid(n['guid'])]: walk(k, x, y, op)
    walk(f, -f['transform']['m02'], -f['transform']['m12'], 1)

rows = sorted(((min(r[0] for r in v), k, v) for k, v in results.items()), key=lambda r: r[0])
print('| Texte | Fond | Grand | Contraste | Seuil | Exemple (écran) |')
print('|---|---|---|---|---|---|')
for ratio, (fg, bg, large), v in rows:
    seuil = 3 if large else 4.5
    flag = '❌' if ratio < seuil else '✅'
    ex = v[0]
    print(f'| `{fg}` | `{bg}` | {"oui" if large else "non"} | {flag} {ratio:.2f}:1 | {seuil} | « {ex[2]} » {ex[3]:g} px ({ex[1]}) |')
