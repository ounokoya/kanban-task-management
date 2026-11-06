<script>
  import { icons } from '../lib/icons.js'

  // Liste des colonnes du tableau (« Current Status » ou « Status ») : liste native (A4) et chevron décoratif
  let { label, value = $bindable(), columns, onchange } = $props()

  const id = $props.id()
</script>

<div>
  <label for={id} class="label">{label}</label>
  <div class="relative">
    <select {id} class="field block-10 cursor-pointer appearance-none ps-4 pe-10" bind:value {onchange}>
      {#each columns as column (column)}
        <option value={column}>{column}</option>
      {/each}
    </select>
    <span class="pointer-events-none absolute end-4 top-1/2 -translate-y-1/2 text-violet">{@html icons.chevronDown}</span>
  </div>
</div>
