<script>
  import Modal from './Modal.svelte'

  // Suppression (§3.7, D8) : dialogue d'alerte ; le focus va d'abord à « Cancel », le choix sans risque
  let { kind, name, ondelete, onclose } = $props()

  const id = $props.id()
  let cancel
</script>

<Modal alert labelledby="{id}-title" describedby="{id}-text" initial={() => cancel} {onclose}>
  <div class="p-6 md:p-8 md:pb-10">
    <h2 id="{id}-title" class="text-l font-bold text-danger-text">Delete this {kind}?</h2>
    <p id="{id}-text" class="mt-6 text-body font-medium text-muted">
      {#if kind === 'board'}
        Are you sure you want to delete the '{name}' board? This action will remove all columns and tasks and cannot be reversed.
      {:else}
        Are you sure you want to delete the '{name}' task and its subtasks? This action cannot be reversed.
      {/if}
    </p>
    <div class="mt-6 flex flex-col gap-4 md:flex-row">
      <button type="button" class="btn-danger md:flex-1" onclick={ondelete}>Delete</button>
      <button type="button" class="btn-secondary md:flex-1" bind:this={cancel} onclick={onclose}>Cancel</button>
    </div>
  </div>
</Modal>
