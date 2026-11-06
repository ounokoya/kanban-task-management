<script>
  import { icons } from '../lib/icons.js'
  import Modal from './Modal.svelte'
  import Menu from './Menu.svelte'
  import StatusSelect from './StatusSelect.svelte'

  // Voir une tâche (§3.4) : titre, menu de la tâche, description, sous-tâches à cocher, statut
  let { task, columns, onclose, onstatus, ontoggle, onedit, ondelete } = $props()

  const id = $props.id()
  const done = $derived(task.subtasks.filter((subtask) => subtask.isCompleted).length)
</script>

<Modal labelledby="{id}-title" {onclose}>
  <div class="p-6 pb-8 md:p-8">
    <div class="flex items-center gap-4">
      <h2 id="{id}-title" class="min-w-0 flex-1 text-l font-bold">{task.title}</h2>
      <Menu
        label="Task options"
        align="center"
        class="-me-2"
        items={[
          { label: 'Edit Task', action: onedit },
          { label: 'Delete Task', action: ondelete, danger: true },
        ]}
      />
    </div>
    {#if task.description}
      <p class="mt-6 text-body font-medium text-muted">{task.description}</p>
    {/if}
    <fieldset class="mt-6">
      <legend class="text-body-m font-bold text-muted dark:text-white">Subtasks ({done} of {task.subtasks.length})</legend>
      <ul class="mt-4 flex flex-col gap-2">
        {#each task.subtasks as subtask, s (s)}
          <li>
            <label class="flex min-block-10 cursor-pointer items-center gap-4 rounded-field bg-subtask px-3 py-[0.65625rem] transition-colors hover:bg-subtask-hover">
              <span class="grid shrink-0 place-items-center">
                <input
                  type="checkbox"
                  class="peer col-start-1 row-start-1 size-4 cursor-pointer appearance-none rounded-sm border border-grey/25 bg-surface checked:border-violet checked:bg-violet"
                  checked={subtask.isCompleted}
                  onchange={(event) => ontoggle(s, event.currentTarget.checked)}
                />
                <span class="pointer-events-none col-start-1 row-start-1 hidden text-white peer-checked:block">{@html icons.check}</span>
              </span>
              <span class="text-body-m leading-[1.1875rem] font-bold {subtask.isCompleted ? 'text-done-text line-through' : ''}">{subtask.title}</span>
            </label>
          </li>
        {/each}
      </ul>
    </fieldset>
    <div class="mt-6">
      <StatusSelect label="Current Status" value={task.status} {columns} onchange={(event) => onstatus(event.currentTarget.value)} />
    </div>
  </div>
</Modal>
