<script>
  import { tick, untrack } from 'svelte'
  import { validateBoard } from '../lib/rules.js'
  import Modal from './Modal.svelte'
  import Field from './Field.svelte'
  import ListField from './ListField.svelte'

  // Ajouter ou modifier un tableau (§3.6) ; validation D4 ; chaque colonne garde sa place d'origine (D7)
  let { board, onsubmit, onclose } = $props()

  const id = $props.id()
  let key = 0
  const row = (name = '', from) => ({ key: key++, value: name, from, error: '' })

  const editing = untrack(() => Boolean(board))
  let name = $state(untrack(() => board?.name ?? ''))
  let nameError = $state('')
  let columns = $state(untrack(() => (board ? board.columns.map((column, i) => row(column.name, i)) : [row('Todo'), row('Doing')])))
  let form

  async function submit(event) {
    event.preventDefault()
    const { ok, errors } = validateBoard({ name, columns: columns.map((c) => c.value) })
    nameError = errors.name ?? ''
    columns.forEach((c, i) => { c.error = errors[`columns.${i}`] ?? '' })
    if (!ok) {
      await tick()
      form.querySelector('[aria-invalid="true"]')?.focus()
      return
    }
    onsubmit({ name: name.trim(), columns: columns.map((c) => ({ name: c.value.trim(), from: c.from })) })
  }
</script>

<Modal labelledby="{id}-title" {onclose}>
  <form class="flex flex-col gap-6 p-6 md:p-8" novalidate bind:this={form} onsubmit={submit}>
    <h2 id="{id}-title" class="text-l font-bold">{editing ? 'Edit Board' : 'Add New Board'}</h2>
    <Field label={editing ? 'Board Name' : 'Name'} placeholder="e.g. Web Design" bind:value={name} bind:error={nameError} />
    <ListField legend={editing ? 'Board Columns' : 'Columns'} item="Column" bind:rows={columns} addLabel="+ Add New Column" create={() => row()} />
    <button type="submit" class="btn-primary inline-full">{editing ? 'Save Changes' : 'Create New Board'}</button>
  </form>
</Modal>
