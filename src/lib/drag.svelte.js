// Glisser-déposer d'une carte (ADR-0009) : souris après 4 px ; tactile après un appui de 300 ms, sinon le tableau défile.
// Le contrôleur suit le pointeur, calcule la place de dépôt et fait défiler le tableau près de ses bords ;
// le composant dessine la carte qui suit et la place pointillée, et applique le dépôt.
// scroller() : le tableau qui défile ; columns() : les éléments des colonnes, dont les cartes portent data-at ;
// card(place) : { title, label } de la carte glissée ; ondrop(from, to) : appelé quand la carte change de place

const key = (place) => `${place.column}-${place.index}`
const same = (a, b) => a.column === b.column && a.index === b.index

export function cardDrag({ scroller, columns, card, ondrop }) {
  let current = $state(null)
  let pending = null
  let dragged = false

  function begin(event, place) {
    if (event.button !== 0 || current || pending) return
    const touch = event.pointerType !== 'mouse'
    pending = { place, x: event.clientX, y: event.clientY, id: event.pointerId, card: event.currentTarget, touch }
    if (touch) pending.timer = setTimeout(() => start(pending.x, pending.y), 300)
    addEventListener('pointermove', follow)
    addEventListener('pointerup', drop)
    addEventListener('pointercancel', stop)
    addEventListener('touchmove', holdPage, { passive: false })
  }

  // Pendant un glissement au tactile, le doigt ne fait pas défiler la page
  function holdPage(event) {
    if (current) event.preventDefault()
  }

  function start(x, y) {
    const box = pending.card.getBoundingClientRect()
    current = { from: pending.place, to: pending.place, x, y, dx: x - box.left, dy: y - box.top, height: box.height, ...card(pending.place) }
    dragged = true
  }

  function follow(event) {
    if (!pending || event.pointerId !== pending.id) return
    if (!current) {
      const distance = Math.hypot(event.clientX - pending.x, event.clientY - pending.y)
      if (pending.touch) { if (distance > 8) stop(); return }
      if (distance < 4) return
      start(pending.x, pending.y)
    }
    current.x = event.clientX
    current.y = event.clientY
    current.to = dropPlace(event.clientX, event.clientY)
    scrollNear(event.clientX)
  }

  // Place de dépôt : la colonne la plus proche du pointeur ; dans la colonne, après chaque carte dont le milieu est au-dessus
  function dropPlace(x, y) {
    const sections = columns()
    let column = 0
    let best = Infinity
    sections.forEach((section, c) => {
      if (!section) return
      const box = section.getBoundingClientRect()
      const distance = x < box.left ? box.left - x : x > box.right ? x - box.right : 0
      if (distance < best) { best = distance; column = c }
    })
    const from = key(current.from)
    const cards = [...sections[column].querySelectorAll('[data-at]')].filter((el) => el.dataset.at !== from)
    const index = cards.filter((el) => { const box = el.getBoundingClientRect(); return y > box.top + box.height / 2 }).length
    return { column, index }
  }

  // Près d'un bord du tableau, il défile pour atteindre les colonnes cachées
  function scrollNear(x) {
    const board = scroller()
    const box = board.getBoundingClientRect()
    if (x < box.left + 48) board.scrollLeft -= 16
    else if (x > box.right - 48) board.scrollLeft += 16
  }

  function drop(event) {
    if (!pending || event.pointerId !== pending.id) return
    const moved = current && { from: current.from, to: current.to }
    stop()
    if (moved && !same(moved.from, moved.to)) ondrop(moved.from, moved.to)
  }

  function stop() {
    clearTimeout(pending?.timer)
    pending = null
    current = null
    removeEventListener('pointermove', follow)
    removeEventListener('pointerup', drop)
    removeEventListener('pointercancel', stop)
    removeEventListener('touchmove', holdPage)
    // le clic qui suit un dépôt n'ouvre pas la tâche
    setTimeout(() => { dragged = false })
  }

  return {
    get current() { return current },
    get dragged() { return dragged },
    begin,
    // un appui long au tactile n'ouvre pas le menu contextuel
    contextmenu(event) { if (pending?.touch) event.preventDefault() },
  }
}
