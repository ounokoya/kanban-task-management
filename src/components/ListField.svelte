<script>
  import { tick } from 'svelte'
  import { icons } from '../lib/icons.js'
  import Field from './Field.svelte'

  // Lignes d'un formulaire (sous-tâches, colonnes) : un champ et sa croix par ligne, puis « + Add New … »
  // rows : [{ key, value, error }] ; une ligne ajoutée prend le focus, une ligne retirée le rend au bouton d'ajout
  let { legend, item, rows = $bindable(), placeholders = [], addLabel, create } = $props()

  let list
  let addButton

  async function add() {
    rows.push(create())
    await tick()
    list.querySelector('li:last-child input')?.focus()
  }

  function remove(i) {
    rows.splice(i, 1)
    addButton.focus()
  }
</script>

<fieldset>
  <legend class="label">{legend}</legend>
  <ul class="flex flex-col gap-3" bind:this={list}>
    {#each rows as row, i (row.key)}
      <li class="flex items-center gap-4">
        <Field class="flex-1" label="{item} {i + 1}" showLabel={false} placeholder={placeholders[i]} bind:value={row.value} bind:error={row.error} />
        <button type="button" class="shrink-0 cursor-pointer text-grey transition-colors hover:text-red" aria-label="Remove {item.toLowerCase()} {i + 1}" onclick={() => remove(i)}>
          {@html icons.cross}
        </button>
      </li>
    {/each}
  </ul>
  <button type="button" class="btn-secondary inline-full {rows.length ? 'mt-3' : ''}" bind:this={addButton} onclick={add}>{addLabel}</button>
</fieldset>
