<script>
  import { tick, untrack } from 'svelte'
  import { validateTask } from '../lib/rules.js'
  import Modal from './Modal.svelte'
  import Field from './Field.svelte'
  import ListField from './ListField.svelte'
  import StatusSelect from './StatusSelect.svelte'

  // Ajouter ou modifier une tâche (§3.5) ; validation D5 ; refusé : focus sur le premier champ en erreur (A3)
  let { task, columns, onsubmit, onclose } = $props()

  const id = $props.id()
  let key = 0
  const row = (subtask = { title: '', isCompleted: false }) => ({ key: key++, value: subtask.title, isCompleted: subtask.isCompleted, error: '' })

  const editing = untrack(() => Boolean(task))
  let title = $state(untrack(() => task?.title ?? ''))
  let titleError = $state('')
  let description = $state(untrack(() => task?.description ?? ''))
  let subtasks = $state(untrack(() => (task ? task.subtasks.map(row) : [row(), row()])))
  let status = $state(untrack(() => task?.status ?? columns[0]))
  let form

  async function submit(event) {
    event.preventDefault()
    const { ok, errors } = validateTask({ title, subtasks: subtasks.map((s) => s.value) })
    titleError = errors.title ?? ''
    subtasks.forEach((s, i) => { s.error = errors[`subtasks.${i}`] ?? '' })
    if (!ok) {
      await tick()
      form.querySelector('[aria-invalid="true"]')?.focus()
      return
    }
    onsubmit({ title: title.trim(), description: description.trim(), status, subtasks: subtasks.map((s) => ({ title: s.value.trim(), isCompleted: s.isCompleted })) })
  }
</script>

<Modal labelledby="{id}-title" {onclose}>
  <form class="flex flex-col gap-6 p-6 md:p-8" novalidate bind:this={form} onsubmit={submit}>
    <h2 id="{id}-title" class="text-l font-bold">{editing ? 'Edit Task' : 'Add New Task'}</h2>
    <Field label="Title" placeholder="e.g. Take coffee break" bind:value={title} bind:error={titleError} />
    <Field label="Description" multiline placeholder="e.g. It's always good to take a break. This 15 minute break will recharge the batteries a little." bind:value={description} />
    <ListField
      legend="Subtasks"
      item="Subtask"
      bind:rows={subtasks}
      placeholders={editing ? [] : ['e.g. Make coffee', 'e.g. Drink coffee & smile']}
      addLabel="+ Add New Subtask"
      create={() => row()}
    />
    <StatusSelect label="Status" bind:value={status} {columns} />
    <button type="submit" class="btn-primary inline-full">{editing ? 'Save Changes' : 'Create Task'}</button>
  </form>
</Modal>
