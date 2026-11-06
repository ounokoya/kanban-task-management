// Préférences gardées (§6) : thème (posé avant le premier rendu par index.html) et barre latérale

const read = (key) => { try { return localStorage.getItem(key) } catch { return null } }
const write = (key, value) => { try { localStorage.setItem(key, value) } catch { /* stockage indisponible */ } }

export const prefs = $state({
  theme: document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light',
  sidebar: read('kanban/sidebar') === 'hidden' ? 'hidden' : 'shown',
})

export function setTheme(theme) {
  prefs.theme = theme
  document.documentElement.dataset.theme = theme
  write('kanban/theme', theme)
}

export function setSidebar(state) {
  prefs.sidebar = state
  write('kanban/sidebar', state)
}
