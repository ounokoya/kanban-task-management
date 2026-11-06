"""Rend des écrans d'un .fig décodé (message.json de kiwi_fig.py) en SVG : tracés précalculés par Figma
(formes, contours, lettres), couleurs, dégradés linéaires, barrés et soulignements, opacités, ombres portées, découpe des cadres, images.
Usage : python3 -I fig_render.py <message.json> <dossier images> <dossier sortie> [motif de nom d'écran] [--aa]
--aa : teintes AA validées (scripts/fig/aa.py)."""
import base64, collections, json, os, re, struct, sys, html
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from aa import remap, opaque
AA = '--aa' in sys.argv
sys.argv = [a for a in sys.argv if a != '--aa']

msg = json.load(open(sys.argv[1])); IMG = sys.argv[2]; OUT = sys.argv[3]
pattern = re.compile(sys.argv[4] if len(sys.argv) > 4 else '.')
nodes = msg['nodeChanges']; blobs = msg['blobs']
gid = lambda g: f"{g['sessionID']}:{g['localID']}" if g else None
by = {gid(n.get('guid')): n for n in nodes}
kids = collections.defaultdict(list)
for n in nodes:
    p = n.get('parentIndex')
    if p: kids[gid(p['guid'])].append(n)
for k in kids: kids[k].sort(key=lambda n: n['parentIndex'].get('position', ''))

def path(blob_index, scale=1.0, flip=False, dx=0.0, dy=0.0):
    b = base64.b64decode(blobs[blob_index]['bytes']['b64']); i = 0; d = []
    def pt():
        nonlocal i
        x, y = struct.unpack_from('<ff', b, i); i += 8
        return f"{x * scale + dx:.3f} {(-y if flip else y) * scale + dy:.3f}"
    while i < len(b):
        c = b[i]; i += 1
        if c == 0:
            if d: d.append('Z')  # les tracés de lettres commencent par un octet 0 : un Z initial invaliderait le tracé SVG
        elif c == 1: d.append('M' + pt())
        elif c == 2: d.append('L' + pt())
        elif c == 3: d.append('Q' + pt() + ' ' + pt())
        elif c == 4: d.append('C' + pt() + ' ' + pt() + ' ' + pt())
        else: break
    return ' '.join(d)

CTX = {'node': {}, 'dark': False, 'frame': ''}
def rgba(c, op=1.0):
    r, g, b = round(c['r'] * 255), round(c['g'] * 255), round(c['b'] * 255)
    if AA:
        h = remap('#%02x%02x%02x' % (r, g, b), CTX['node'], CTX['dark'], CTX['frame'])
        r, g, b = int(h[1:3], 16), int(h[3:5], 16), int(h[5:7], 16)
    return f"rgba({r},{g},{b},{c.get('a',1)*op:.4f})"

defs = []; uid = [0]
def new_id(p): uid[0] += 1; return f"{p}{uid[0]}"

def paint(paints, size):
    """Premier remplissage visible : couleur SVG ou motif d'image."""
    for p in paints or []:
        if not p.get('visible', True): continue
        if p['type'] == 'SOLID': return rgba(p['color'], p.get('opacity', 1))
        if p['type'] == 'IMAGE':
            h = p.get('image', {}).get('hash')
            if isinstance(h, dict): h = base64.b64decode(h['b64']).hex()
            pid = new_id('img')
            defs.append(f'<pattern id="{pid}" patternUnits="userSpaceOnUse" width="{size["x"]}" height="{size["y"]}"><image href="{IMG}/{h}" width="{size["x"]}" height="{size["y"]}" preserveAspectRatio="xMidYMid slice"/></pattern>')
            return f'url(#{pid})'
        if p['type'] == 'GRADIENT_LINEAR' and p.get('stops'):
            # la transformation de Figma va du cadre (0..1) à l'espace du dégradé, axe de (0, 0,5) à (1, 0,5) : on l'inverse
            t = p.get('transform', {}); a, b, c = t.get('m00', 1), t.get('m01', 0), t.get('m02', 0); d, e, f = t.get('m10', 0), t.get('m11', 1), t.get('m12', 0)
            det = (a * e - b * d) or 1
            to_xy = lambda u, v: ((e * (u - c) - b * (v - f)) / det * size['x'], (a * (v - f) - d * (u - c)) / det * size['y'])
            (x1, y1), (x2, y2) = to_xy(0, 0.5), to_xy(1, 0.5)
            lid = new_id('lg'); op = p.get('opacity', 1)
            stops = ''.join(f'<stop offset="{s["position"]:.4f}" stop-color="{rgba(s["color"], op)}"/>' for s in p['stops'])
            defs.append(f'<linearGradient id="{lid}" gradientUnits="userSpaceOnUse" x1="{x1:.3f}" y1="{y1:.3f}" x2="{x2:.3f}" y2="{y2:.3f}">{stops}</linearGradient>')
            return f'url(#{lid})'
        if p['type'].startswith('GRADIENT') and p.get('stops'):
            return rgba(p['stops'][0]['color'], p.get('opacity', 1))  # radial, angulaire : première couleur (aucun dans les maquettes lues)
    return None

def style_fill(node, sid):
    """Couleur d'un caractère : surcharge de style, style de remplissage hérité, ou couleur du texte."""
    for s in node.get('textData', {}).get('styleOverrideTable', []):
        if s.get('styleID') != sid: continue
        if s.get('fillPaints'): return paint(s['fillPaints'], node['size'])
        ref = s.get('inheritFillStyleID')
        if ref and gid(ref) in by and by[gid(ref)].get('fillPaints'): return paint(by[gid(ref)]['fillPaints'], node['size'])
    ref = node.get('inheritFillStyleID')
    if ref and gid(ref) in by and by[gid(ref)].get('fillPaints'): return paint(by[gid(ref)]['fillPaints'], node['size'])
    return paint(node.get('fillPaints'), node['size'])

def shadow(effects):
    """Ombres portées de Figma : étalement (érosion ou dilatation), flou, décalage, couleur ; derrière la forme."""
    fx = [e for e in effects or [] if e.get('type') == 'DROP_SHADOW' and e.get('visible', True)]
    if not fx: return ''
    fid = new_id('sh'); parts = []; merge = []
    for k, e in enumerate(fx):
        c = e['color']; o = e.get('offset', {}); spread = e.get('spread', 0); src = 'SourceAlpha'
        if spread:
            parts.append(f'<feMorphology in="SourceAlpha" operator="{"erode" if spread < 0 else "dilate"}" radius="{abs(spread)}" result="m{k}"/>'); src = f'm{k}'
        parts.append(f'<feGaussianBlur in="{src}" stdDeviation="{e.get("radius", 0) / 2}" result="b{k}"/>')
        parts.append(f'<feOffset in="b{k}" dx="{o.get("x", 0)}" dy="{o.get("y", 0)}" result="o{k}"/>')
        parts.append(f'<feFlood flood-color="{rgba(c)}"/><feComposite operator="in" in2="o{k}" result="s{k}"/>')
        merge.append(f'<feMergeNode in="s{k}"/>')
    defs.append(f'<filter id="{fid}" x="-50%" y="-50%" width="200%" height="200%" color-interpolation-filters="sRGB">{"".join(parts)}<feMerge>{"".join(merge)}<feMergeNode in="SourceGraphic"/></feMerge></filter>')
    return f' filter="url(#{fid})"'

def render(node, top=False):
    if not node.get('visible', True): return ''
    CTX['node'] = node
    t = node.get('transform', {}); out = []
    m = (1, 0, 0, 1, 0, 0) if top else (t.get('m00', 1), t.get('m10', 0), t.get('m01', 0), t.get('m11', 1), t.get('m02', 0), t.get('m12', 0))
    op = 1 if AA and opaque(node) else node.get('opacity', 1)  # texte éclairci par opacité : couleur AA opaque
    attrs = f' transform="matrix({",".join(f"{v:.4f}" for v in m)})"' + (f' opacity="{op}"' if op < 1 else '')
    typ = node.get('type'); size = node.get('size', {'x': 0, 'y': 0})
    body = []
    sh = shadow(node.get('effects'))
    if typ == 'TEXT':
        td = node.get('textData', {}); glyphs = td.get('glyphs') or []
        ids = td.get('characterStyleIDs') or []
        for g in glyphs:
            if 'commandsBlob' not in g: continue
            sid = ids[g['firstCharacter']] if g.get('firstCharacter', 0) < len(ids) else 0
            fill = style_fill(node, sid) or 'black'
            fs = g.get('fontSize', node.get('fontSize', 16)); pos = g['position']
            body.append(f'<path d="{path(g["commandsBlob"], fs, True, pos["x"], pos["y"])}" fill="{fill}"/>')
        for dec in td.get('decorations') or []:  # barré et soulignement : rectangles précalculés par Figma
            fill = style_fill(node, dec.get('styleID', 0)) or 'black'
            for r in dec.get('rects', []): body.append(f'<rect x="{r["x"]:.3f}" y="{r["y"]:.3f}" width="{r["w"]:.3f}" height="{r["h"]:.3f}" fill="{fill}"/>')
    else:
        fill = paint(node.get('fillPaints'), size)
        for geo in node.get('fillGeometry') or []:
            if fill: body.append(f'<path d="{path(geo["commandsBlob"])}" fill="{fill}" fill-rule="{"evenodd" if geo.get("windingRule") == "ODD" else "nonzero"}"{sh}/>')
        stroke = paint(node.get('strokePaints'), size)
        if stroke and node.get('strokeWeight', 0) > 0:
            for geo in node.get('strokeGeometry') or []:
                body.append(f'<path d="{path(geo["commandsBlob"])}" fill="{stroke}"/>')
    children = []
    if typ not in ('BOOLEAN_OPERATION', 'TEXT'):
        src = kids[gid(node['guid'])]
        if typ == 'INSTANCE' and not src:
            sym = node.get('symbolData', {}).get('symbolID')
            src = kids[gid(sym)] if sym else []
        children = [render(c) for c in src]
    clip = ''
    if typ in ('FRAME', 'INSTANCE', 'SYMBOL') and not node.get('frameMaskDisabled', True) and children:
        cid = new_id('clip'); defs.append(f'<clipPath id="{cid}"><rect width="{size["x"]}" height="{size["y"]}"/></clipPath>')
        clip = f' clip-path="url(#{cid})"'
    out.append(f'<g{attrs}>{"".join(body)}<g{clip}>{"".join(children)}</g></g>')
    return ''.join(out)

frames = [n for n in nodes if n.get('type') == 'FRAME' and n.get('parentIndex') and by.get(gid(n['parentIndex']['guid']), {}).get('type') == 'CANVAS' and pattern.search(n.get('name', ''))]
for f in frames:
    defs.clear(); CTX['dark'] = bool(re.search(r'\bDark\b', f['name'])); CTX['frame'] = f['name']
    body = render(f, top=True)
    w, h = f['size']['x'], f['size']['y']
    svg = f'<svg xmlns="http://www.w3.org/2000/svg" width="{w:g}" height="{h:g}" viewBox="0 0 {w:g} {h:g}"><defs>{"".join(defs)}</defs>{body}</svg>'
    name = re.sub(r'[^a-z0-9]+', '-', f['name'].lower()).strip('-')
    open(f'{OUT}/{name}.svg', 'w').write(svg)
    print(name, f'{w:g}x{h:g}', len(svg)//1024, 'Ko')
