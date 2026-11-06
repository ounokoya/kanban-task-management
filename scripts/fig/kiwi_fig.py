"""Décodeur du format kiwi (schéma binaire + message) utilisé par canvas.fig de Figma.
Usage : python3 -I kiwi_fig.py <dossier contenant chunk0.bin et chunk1.bin> <sortie.json>"""
import json, struct, sys

class R:
    def __init__(s, b): s.b, s.i = b, 0
    def byte(s): v = s.b[s.i]; s.i += 1; return v
    def vu(s):
        v = sh = 0
        while True:
            c = s.byte(); v |= (c & 127) << sh; sh += 7
            if not c & 128: return v
    def vi(s): v = s.vu(); return (v >> 1) ^ -(v & 1)
    def string(s):
        j = s.b.index(0, s.i); v = s.b[s.i:j].decode('utf-8', 'replace'); s.i = j + 1; return v
    def f32(s):
        first = s.byte()
        if first == 0: return 0.0
        bits = first | (s.byte() << 8) | (s.byte() << 16) | (s.byte() << 24)
        bits = ((bits << 23) | (bits >> 9)) & 0xFFFFFFFF
        return struct.unpack('<f', struct.pack('<I', bits))[0]

def schema(b):
    r = R(b); defs = []
    for _ in range(r.vu()):
        name = r.string(); kind = r.byte(); fields = []
        for _ in range(r.vu()):
            fields.append({'name': r.string(), 'type': r.vi(), 'array': bool(r.byte()), 'value': r.vu()})
        defs.append({'name': name, 'kind': kind, 'fields': fields})
    return defs

def decode(defs, b, root='Message'):
    r = R(b); byname = {d['name']: d for d in defs}
    def val(t, arr):
        if arr:
            if t == -2:
                n = r.vu(); v = r.b[r.i:r.i + n]; r.i += n; return {'b64': __import__('base64').b64encode(v).decode()}
            return [val(t, False) for _ in range(r.vu())]
        if t == -1: return bool(r.byte())
        if t == -2: return r.byte()
        if t == -3: return r.vi()
        if t == -4: return r.vu()
        if t == -5: return round(r.f32(), 4)
        if t == -6: return r.string()
        if t in (-7, -8): return r.vu() if t == -8 else r.vi()
        d = defs[t]
        if d['kind'] == 0:
            v = r.vu(); return next((f['name'] for f in d['fields'] if f['value'] == v), v)
        if d['kind'] == 1:
            return {f['name']: val(f['type'], f['array']) for f in d['fields']}
        out = {}; byid = {f['value']: f for f in d['fields']}
        while True:
            fid = r.vu()
            if fid == 0: return out
            f = byid[fid]; out[f['name']] = val(f['type'], f['array'])
    return val(defs.index(byname[root]), False)

if __name__ == '__main__':
    d = sys.argv[1]
    defs = schema(open(f'{d}/chunk0.bin', 'rb').read())
    msg = decode(defs, open(f'{d}/chunk1.bin', 'rb').read())
    json.dump(msg, open(sys.argv[2], 'w'))
    print(len(defs), 'définitions ;', len(msg.get('nodeChanges', [])), 'nœuds')
