<script>
  import { tick } from 'svelte'
  import { columnColor, columnLabel, subtaskLabel } from '../lib/rules.js'
  import { move } from '../lib/store.svelte.js'
  import { announce } from '../lib/announce.svelte.js'

  // Tableau (§3.3) : une colonne par colonne, les cartes, « + New Column » ; messages sans colonne ou sans tableau.
  // Glisser-déposer par les pointer events (ADR-0009) et Alt + flèches au clavier (§6).
  let { board, index, onopen, oneditboard, oncreateboard } = $props()

  let main
  let sections = $state([])
  let drag = $state(null)
  let pending = null
  let dragged = false

  // D10 : classes écrites en entier pour que Tailwind les produise
  const DOTS = { todo: 'bg-todo', doing: 'bg-doing', done: 'bg-done' }
  const at = (column, task) => `${column}-${task}`
  const cardAt = (place) => main.querySelector(`[data-at="${at(place.column, place.index)}"]`)

  // Lignes d'une colonne : les cartes, la place de dépôt en plus pendant un glissement (la carte glissée reste, cachée)
  function rows(c) {
    const list = board.columns[c].tasks.map((task, t) => ({ task, t }))
    if (!drag || drag.to.column !== c) return list
    const others = list.filter(({ t }) => !(drag.from.column === c && drag.from.index === t))
    const before = others[drag.to.index]
    const slot = before ? list.indexOf(before) : list.length
    return [...list.slice(0, slot), { gap: true }, ...list.slice(slot)]
  }

  function open(event, place) {
    if (dragged) return
    onopen(place, event.currentTarget)
  }

  // Clavier (§6) : Alt + ↑ ↓ dans la colonne, Alt + ← → en bas de la colonne voisine ; le focus suit la carte
  async function onkeydown(event, place) {
    if (!event.altKey || !event.key.startsWith('Arrow')) return
    event.preventDefault()
    const { column, index: t } = place
    const target = {
      ArrowUp: t > 0 && { column, index: t - 1 },
      ArrowDown: t < board.columns[column].tasks.length - 1 && { column, index: t + 1 },
      ArrowLeft: column > 0 && { column: column - 1, index: board.columns[column - 1].tasks.length },
      ArrowRight: column < board.columns.length - 1 && { column: column + 1, index: board.columns[column + 1].tasks.length },
    }[event.key]
    if (!target) return
    await relocate(place, target)
    cardAt(target)?.focus()
  }

  async function relocate(from, to) {
    const title = board.columns[from.column].tasks[from.index].title
    move(index, from, to)
    await tick()
    const column = board.columns[to.column]
    const position = Math.min(to.index, column.tasks.length - 1) + 1
    announce(`${title} moved to ${column.name}, position ${position} of ${column.tasks.length}`)
  }

  // Glisser (ADR-0009) : souris après 4 px ; tactile après un appui de 300 ms, sinon le tableau défile
  function onpointerdown(event, place) {
    if (event.button !== 0 || drag || pending) return
    const touch = event.pointerType !== 'mouse'
    pending = { place, x: event.clientX, y: event.clientY, id: event.pointerId, card: event.currentTarget, touch }
    if (touch) pending.timer = setTimeout(() => start(pending.x, pending.y), 300)
    addEventListener('pointermove', onpointermove)
    addEventListener('pointerup', onpointerup)
    addEventListener('pointercancel', stop)
    addEventListener('touchmove', holdPage, { passive: false })
  }

  // Pendant un glissement au tactile, le doigt ne fait pas défiler la page
  function holdPage(event) {
    if (drag) event.preventDefault()
  }

  function start(x, y) {
    const box = pending.card.getBoundingClientRect()
    const task = board.columns[pending.place.column].tasks[pending.place.index]
    drag = { from: pending.place, to: pending.place, x, y, dx: x - box.left, dy: y - box.top, height: box.height, title: task.title, label: subtaskLabel(task) }
    dragged = true
  }

  function onpointermove(event) {
    if (!pending || event.pointerId !== pending.id) return
    if (!drag) {
      const distance = Math.hypot(event.clientX - pending.x, event.clientY - pending.y)
      if (pending.touch) { if (distance > 8) stop(); return }
      if (distance < 4) return
      start(pending.x, pending.y)
    }
    drag.x = event.clientX
    drag.y = event.clientY
    drag.to = dropPlace(event.clientX, event.clientY)
    scrollNear(event.clientX)
  }

  // Place de dépôt : la colonne la plus proche du pointeur ; dans la colonne, après chaque carte dont le milieu est au-dessus
  function dropPlace(x, y) {
    let column = 0
    let best = Infinity
    sections.forEach((section, c) => {
      if (!section) return
      const box = section.getBoundingClientRect()
      const distance = x < box.left ? box.left - x : x > box.right ? x - box.right : 0
      if (distance < best) { best = distance; column = c }
    })
    const from = at(drag.from.column, drag.from.index)
    const cards = [...sections[column].querySelectorAll('[data-at]')].filter((card) => card.dataset.at !== from)
    const index = cards.filter((card) => { const box = card.getBoundingClientRect(); return y > box.top + box.height / 2 }).length
    return { column, index }
  }

  // Près d'un bord du tableau, il défile pour atteindre les colonnes cachées
  function scrollNear(x) {
    const box = main.getBoundingClientRect()
    if (x < box.left + 48) main.scrollLeft -= 16
    else if (x > box.right - 48) main.scrollLeft += 16
  }

  async function onpointerup(event) {
    if (!pending || event.pointerId !== pending.id) return
    const done = drag && { from: drag.from, to: drag.to }
    stop()
    if (done && (done.from.column !== done.to.column || done.from.index !== done.to.index)) await relocate(done.from, done.to)
  }

  function stop() {
    clearTimeout(pending?.timer)
    pending = null
    drag = null
    removeEventListener('pointermove', onpointermove)
    removeEventListener('pointerup', onpointerup)
    removeEventListener('pointercancel', stop)
    removeEventListener('touchmove', holdPage)
    // le clic qui suit un dépôt n'ouvre pas la tâche
    setTimeout(() => { dragged = false })
  }
</script>

<main bind:this={main} class="flex-1 overflow-auto">
  {#if !board}
    <div class="grid min-block-full place-content-center gap-8 px-4 pb-16 text-center md:pb-[5.0625rem] lg:pb-[6.0625rem]">
      <p class="text-l font-bold text-muted">There are no boards. Create a new board to get started.</p>
      <button type="button" class="btn-primary-l mx-auto inline-[10.875rem]" onclick={(event) => oncreateboard(event.currentTarget)}>+ Create New Board</button>
    </div>
  {:else if !board.columns.length}
    <div class="grid min-block-full place-content-center gap-8 px-4 pb-16 text-center md:px-6 md:pb-[5.0625rem] lg:pb-[6.0625rem]">
      <p class="text-l font-bold text-muted">This board is empty. Create a new column to get started.</p>
      <button type="button" class="btn-primary-l mx-auto inline-[10.875rem]" onclick={(event) => oneditboard(event.currentTarget)}>+ Add New Column</button>
    </div>
  {:else}
    <div class="flex inline-max gap-6 ps-4 pe-6 pt-6 pb-12 md:ps-6 md:pt-[1.4375rem] lg:pt-6">
      {#each board.columns as column, c (c)}
        <section bind:this={sections[c]} aria-labelledby="column-{c}" class="inline-70 shrink-0">
          <div class="flex items-center gap-3">
            <span class="size-[0.9375rem] shrink-0 rounded-full {DOTS[columnColor(c)]}"></span>
            <h2 id="column-{c}" class="text-s font-bold text-muted uppercase">{columnLabel(column)}</h2>
          </div>
          <ul class="mt-6 flex flex-col gap-5">
            {#each rows(c) as row (row.gap ? 'gap' : row.task)}
              {#if row.gap}
                <li aria-hidden="true" class="rounded-card border-2 border-dashed border-grey/50" style:block-size="{drag.height}px"></li>
              {:else}
                {@const place = { column: c, index: row.t }}
                <li class:hidden={drag && drag.from.column === c && drag.from.index === row.t}>
                  <button
                    type="button"
                    data-at={at(c, row.t)}
                    class="group inline-full cursor-pointer touch-manipulation rounded-card bg-surface px-4 py-[1.4375rem] text-start shadow-card select-none"
                    onclick={(event) => open(event, place)}
                    onkeydown={(event) => onkeydown(event, place)}
                    onpointerdown={(event) => onpointerdown(event, place)}
                    oncontextmenu={(event) => { if (pending?.touch) event.preventDefault() }}
                  >
                    <span class="block text-m font-bold transition-colors group-hover:text-accent">{row.task.title}</span>
                    <span class="mt-2 block text-body-m font-bold text-muted">{subtaskLabel(row.task)}</span>
                  </button>
                </li>
              {/if}
            {/each}
          </ul>
        </section>
      {/each}
      <button
        type="button"
        class="mt-[2.4375rem] block-[50.875rem] inline-70 shrink-0 cursor-pointer rounded-box bg-linear-to-b from-new-column to-new-column/50 text-xl font-bold text-muted transition-colors hover:text-accent"
        onclick={(event) => oneditboard(event.currentTarget)}
      >
        + New Column
      </button>
    </div>
  {/if}
</main>

{#if drag}
  <div
    aria-hidden="true"
    class="pointer-events-none fixed start-0 top-0 z-20 inline-70 rounded-card bg-surface px-4 py-[1.4375rem] shadow-menu"
    style:transform="translate({drag.x - drag.dx}px, {drag.y - drag.dy}px)"
  >
    <span class="block text-m font-bold">{drag.title}</span>
    <span class="mt-2 block text-body-m font-bold text-muted">{drag.label}</span>
  </div>
{/if}
