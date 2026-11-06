<script>
  import { tick } from 'svelte'
  import { columnColor, columnLabel, subtaskLabel } from '../lib/rules.js'
  import { move } from '../lib/store.svelte.js'
  import { announce } from '../lib/announce.svelte.js'
  import { cardDrag } from '../lib/drag.svelte.js'

  // Tableau (§3.3) : une colonne par colonne, les cartes, « + New Column » ; messages sans colonne ou sans tableau.
  // Glisser-déposer (contrôleur : src/lib/drag.svelte.js, ADR-0009) et Alt + flèches au clavier (§6).
  let { board, index, onopen, oneditboard, oncreateboard } = $props()

  let main
  let sections = $state([])
  const drag = cardDrag({
    scroller: () => main,
    columns: () => sections,
    card: ({ column, index: t }) => { const task = board.columns[column].tasks[t]; return { title: task.title, label: subtaskLabel(task) } },
    ondrop: (from, to) => relocate(from, to),
  })

  // D10 : classes écrites en entier pour que Tailwind les produise
  const DOTS = { todo: 'bg-todo', doing: 'bg-doing', done: 'bg-done' }
  const at = (column, task) => `${column}-${task}`
  const cardAt = (place) => main.querySelector(`[data-at="${at(place.column, place.index)}"]`)

  // Lignes d'une colonne : les cartes, la place de dépôt en plus pendant un glissement (la carte glissée reste, cachée)
  function rows(c) {
    const list = board.columns[c].tasks.map((task, t) => ({ task, t }))
    const moving = drag.current
    if (!moving || moving.to.column !== c) return list
    const others = list.filter(({ t }) => !(moving.from.column === c && moving.from.index === t))
    const before = others[moving.to.index]
    const slot = before ? list.indexOf(before) : list.length
    return [...list.slice(0, slot), { gap: true }, ...list.slice(slot)]
  }

  function open(event, place) {
    if (drag.dragged) return
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
    <!-- consigne lue sur chaque carte (A9) -->
    <p id="move-help" class="sr-only">Alt + arrow keys move the task: up or down in its column, left or right to the next column.</p>
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
                <li aria-hidden="true" class="rounded-card border-2 border-dashed border-grey/50" style:block-size="{drag.current.height}px"></li>
              {:else}
                {@const place = { column: c, index: row.t }}
                <li class:hidden={drag.current && drag.current.from.column === c && drag.current.from.index === row.t}>
                  <button
                    type="button"
                    data-at={at(c, row.t)}
                    aria-describedby="move-help"
                    class="group inline-full cursor-pointer touch-manipulation rounded-card bg-surface px-4 py-[1.4375rem] text-start shadow-card select-none"
                    onclick={(event) => open(event, place)}
                    onkeydown={(event) => onkeydown(event, place)}
                    onpointerdown={(event) => drag.begin(event, place)}
                    oncontextmenu={drag.contextmenu}
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

{#if drag.current}
  <div
    aria-hidden="true"
    class="pointer-events-none fixed start-0 top-0 z-20 inline-70 rounded-card bg-surface px-4 py-[1.4375rem] shadow-menu"
    style:transform="translate({drag.current.x - drag.current.dx}px, {drag.current.y - drag.current.dy}px)"
  >
    <span class="block text-m font-bold">{drag.current.title}</span>
    <span class="mt-2 block text-body-m font-bold text-muted">{drag.current.label}</span>
  </div>
{/if}
