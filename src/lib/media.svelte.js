// Largeur de la fenêtre : barre latérale et textes longs dès 768 px (spec §5).
// Le point de rupture vient du token --breakpoint-md de src/app.css, le même que les variantes md: du CSS.

const md = getComputedStyle(document.documentElement).getPropertyValue('--breakpoint-md').trim()
const query = matchMedia(`(min-width: ${md})`)
export const screen = $state({ wide: query.matches })
query.addEventListener('change', (event) => { screen.wide = event.matches })
