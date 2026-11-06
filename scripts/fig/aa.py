"""Teintes AA validées (G2 : Q-A1 à Q-A7) appliquées au rendu des écrans de référence (option --aa).
Chaque règle : thème (clair, sombre, les deux), rôle (texte, fond de bouton), couleur de la maquette → couleur AA.
Q-A8 (bordure des champs en gris plein) n'est pas rendue : un filet de 1 px, sans effet sur les comparaisons."""

LIGHT_TEXT = {'#828fa3': '#647288', '#ea5555': '#e42828'}  # Q-A1, Q-A3
DARK_TEXT = {'#828fa3': '#8894a7', '#ea5555': '#ed6a6a'}  # Q-A2, Q-A3 (texte rouge sur #2b2c37)
FILLS = {'#ea5555': '#e42828'}  # Q-A3 : fond de Delete, deux thèmes
BUTTON_HOVER = {'#a8a4ff': '#534ec1', '#ff9898': '#cc1a1a'}  # Q-A7 : survols plus foncés
SIDEBAR_HOVER = {'Hide Sidebar', 'Platform Launch', 'Marketing Plan', 'Roadmap'}  # survol en sombre : violet sur blanc, gardé


def opaque(node):
    """Textes que la maquette éclaircit par l'opacité du calque : exemples des champs (25 %), sous-tâches cochées (50 %)."""
    if node.get('type') != 'TEXT' or node.get('opacity', 1) >= 1: return False
    text = node.get('textData', {}).get('characters', '')
    return text.startswith('e.g.') or node.get('textDecoration') == 'STRIKETHROUGH'


def remap(hexc, node, dark, frame):
    """Couleur AA d'un remplissage, ou la couleur d'origine."""
    typ = node.get('type')
    if typ == 'TEXT':
        text = node.get('textData', {}).get('characters', '')
        if opaque(node):
            if text.startswith('e.g.'): return '#92939b' if dark else '#75757f'  # Q-A6
            return '#a5a6aa' if dark else '#5e5f69'  # Q-A5
        # Q-A4 : violet sur fond sombre (« + Create New Board », titre de carte survolée) ; les entrées survolées de la barre ont un fond blanc
        if dark and hexc == '#635fc7' and node.get('fontSize') == 15 and text not in SIDEBAR_HOVER: return '#a8a4ff'
        if not dark and 'Active' in frame and hexc == '#635fc7' and text in ('Cancel', '+ Add New Subtask', '+ Add New Column'):
            return '#5450c2'  # Q-A7 : bouton secondaire survolé (violet à 25 %)
        return (DARK_TEXT if dark else LIGHT_TEXT).get(hexc, hexc)
    radius = node.get('cornerRadius') or node.get('rectangleTopLeftCornerRadius') or 0
    if radius >= 20 and hexc in BUTTON_HOVER: return BUTTON_HOVER[hexc]
    return FILLS.get(hexc, hexc)
