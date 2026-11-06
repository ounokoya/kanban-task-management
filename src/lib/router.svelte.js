// Navigation par ancre (ADR-0006) : #/board/<slug>

const parse = () => (location.hash.match(/^#\/board\/([a-z0-9-]+)$/) || [])[1] ?? null

export const route = $state({ slug: parse() })

addEventListener('hashchange', () => { route.slug = parse() })

export const go = (slug) => { location.hash = `#/board/${slug}` }
// Adresse corrigée sans nouvelle entrée d'historique (adresse inconnue, tableau renommé ou supprimé)
export function replace(slug) {
  history.replaceState(null, '', slug ? `#/board/${slug}` : '#/')
  route.slug = slug
}
