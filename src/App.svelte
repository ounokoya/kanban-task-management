<script>
  import { tick } from 'svelte'
  import { store, slugs, createBoard, updateBoard, deleteBoard, createTask, changeStatus, updateTask, toggleSubtask, deleteTask, lastOf } from './lib/store.svelte.js'
  import { route, go, replace } from './lib/router.svelte.js'
  import { prefs, setSidebar } from './lib/prefs.svelte.js'
  import { screen } from './lib/media.svelte.js'
  import { notice, announce } from './lib/announce.svelte.js'
  import { icons } from './lib/icons.js'
  import Sidebar from './components/Sidebar.svelte'
  import Header from './components/Header.svelte'
  import Board from './components/Board.svelte'
  import TaskView from './components/TaskView.svelte'
  import TaskForm from './components/TaskForm.svelte'
  import BoardForm from './components/BoardForm.svelte'
  import DeleteDialog from './components/DeleteDialog.svelte'
  import BoardSelect from './components/BoardSelect.svelte'

  // Tableau ouvert : celui de l'adresse, sinon le premier (D3)
  const addresses = $derived(slugs())
  const current = $derived(store.boards.length ? Math.max(0, addresses.indexOf(route.slug)) : -1)
  const board = $derived(current >= 0 ? store.boards[current] : null)
  const sidebar = $derived(screen.wide && prefs.sidebar === 'shown')

  // Dialogue ouvert : { kind, at? } ; back rend le focus à sa fermeture (A10)
  let modal = $state(null)
  let back = null
  const task = $derived(modal?.at && board?.columns[modal.at.column]?.tasks[modal.at.index])
  let showButton = $state()

  // Adresse inconnue ou périmée : celle du tableau ouvert, sans nouvelle entrée d'historique
  $effect(() => {
    const slug = addresses[current] ?? null
    if (route.slug !== slug) replace(slug)
  })

  $effect(() => {
    document.title = board ? `${board.name} | Kanban task management` : 'Kanban task management'
  })

  // Changement de tableau : son nom est annoncé (A9)
  let shown
  $effect(() => {
    const name = board?.name
    if (shown !== undefined && current !== shown && name) announce(`${name} board opened`)
    shown = current
  })

  const heading = () => document.querySelector('h1')?.focus()
  const element = (el) => () => (el?.isConnected ? el.focus() : heading())
  const card = (m) => document.querySelector(`main [data-at="${m.at.column}-${m.at.index}"]`)?.focus()

  function open(next, opener) {
    back = element(opener)
    modal = next
  }

  async function close() {
    const closing = modal
    const restore = back
    modal = null
    back = null
    await tick()
    restore?.(closing)
  }

  function openTask(at) {
    back = card
    modal = { kind: 'view', at }
  }

  function setStatus(status) {
    const { title } = task
    changeStatus(current, modal.at, status)
    modal.at = lastOf(current, status)
    announce(`${title} moved to ${status}`)
  }

  function toggle(s, done) {
    toggleSubtask(current, modal.at, s, done)
    announce(`${task.subtasks[s].title} ${done ? 'completed' : 'not completed'}`)
  }

  function saveTask(data) {
    if (modal.at) {
      const moved = data.status !== board.columns[modal.at.column].name
      updateTask(current, modal.at, data)
      if (moved) modal.at = lastOf(current, data.status)
    } else {
      createTask(current, data)
    }
    close()
  }

  function removeTask() {
    deleteTask(current, modal.at)
    back = heading
    close()
  }

  function saveBoard(data) {
    if (modal.edit) {
      const i = current
      updateBoard(i, data)
      replace(slugs()[i])
    } else {
      const i = createBoard({ name: data.name, columns: data.columns.map((column) => column.name) })
      go(slugs()[i])
    }
    close()
  }

  function removeBoard() {
    const i = current
    deleteBoard(i)
    const left = slugs()
    replace(left[Math.min(i, left.length - 1)] ?? null)
    back = heading
    close()
  }

  // Barre masquée ou montrée : le focus passe au bouton qui fait l'inverse
  async function toggleSidebar(state) {
    setSidebar(state)
    await tick()
    if (state === 'hidden') showButton?.focus()
    else document.querySelector('nav > button')?.focus()
  }
</script>

<div class="flex block-dvh overflow-hidden">
  {#if sidebar}
    <Sidebar boards={store.boards} {addresses} {current} oncreate={(el) => open({ kind: 'board-form' }, el)} onhide={() => toggleSidebar('hidden')} />
  {/if}
  <div class="flex min-w-0 flex-1 flex-col">
    <Header
      {board}
      logo={!sidebar}
      wide={screen.wide}
      selecting={modal?.kind === 'select'}
      onadd={(el) => open({ kind: 'task-form' }, el)}
      onedit={(el) => open({ kind: 'board-form', edit: true }, el)}
      ondelete={(el) => open({ kind: 'delete-board' }, el)}
      onselect={(el) => open({ kind: 'select' }, el)}
    />
    <Board
      {board}
      index={current}
      onopen={openTask}
      oneditboard={(el) => open({ kind: 'board-form', edit: true }, el)}
      oncreateboard={(el) => open({ kind: 'board-form' }, el)}
    />
  </div>
</div>

{#if screen.wide && prefs.sidebar === 'hidden'}
  <button
    bind:this={showButton}
    type="button"
    aria-label="Show Sidebar"
    class="fixed start-0 bottom-8 flex block-12 inline-14 cursor-pointer items-center rounded-e-full bg-violet ps-[1.125rem] text-white transition-colors hover:bg-violet-hover"
    onclick={() => toggleSidebar('shown')}
  >
    {@html icons.show}
  </button>
{/if}

<p class="sr-only" role="status">{notice.text}</p>

{#if modal?.kind === 'view' && task}
  <TaskView
    {task}
    columns={board.columns.map((c) => c.name)}
    onclose={close}
    onstatus={setStatus}
    ontoggle={toggle}
    onedit={() => { modal = { kind: 'task-form', at: modal.at } }}
    ondelete={() => { modal = { kind: 'delete-task', at: modal.at } }}
  />
{:else if modal?.kind === 'task-form'}
  <TaskForm task={modal.at ? task : null} columns={board.columns.map((c) => c.name)} onsubmit={saveTask} onclose={close} />
{:else if modal?.kind === 'board-form'}
  <BoardForm board={modal.edit ? board : null} onsubmit={saveBoard} onclose={close} />
{:else if modal?.kind === 'delete-task' && task}
  <DeleteDialog kind="task" name={task.title} ondelete={removeTask} onclose={close} />
{:else if modal?.kind === 'delete-board'}
  <DeleteDialog kind="board" name={board.name} ondelete={removeBoard} onclose={close} />
{:else if modal?.kind === 'select'}
  <BoardSelect
    boards={store.boards}
    {current}
    onpick={(i) => { go(addresses[i]); close() }}
    oncreate={() => { modal = { kind: 'board-form' } }}
    onclose={close}
  />
{/if}
