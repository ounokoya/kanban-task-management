<script>
  import { icons } from '../lib/icons.js'

  // Menu d'un tableau ou d'une tâche (ADR-0008) : un bouton qui montre deux boutons natifs, sans rôle ARIA de menu ;
  // Échap ou un clic à côté ferment, le focus revient au bouton (A10). Chaque choix reçoit le bouton du menu.
  let { label, items, align = 'end', class: klass = '' } = $props()

  const id = $props.id()
  let open = $state(false)
  let root
  let button

  $effect(() => {
    if (!open) return
    const outside = (event) => { if (!root.contains(event.target)) open = false }
    document.addEventListener('pointerdown', outside)
    return () => document.removeEventListener('pointerdown', outside)
  })

  // Échap ferme le menu seulement : le dialogue qui le contient reste ouvert
  function onkeydown(event) {
    if (event.key !== 'Escape' || !open) return
    event.preventDefault()
    open = false
    button.focus()
  }

  function choose(item) {
    open = false
    item.action(button)
  }
</script>

<div class="relative" bind:this={root} onfocusout={(event) => { if (!root.contains(event.relatedTarget)) open = false }}>
  <button
    bind:this={button}
    type="button"
    class="flex cursor-pointer items-center justify-center px-2 text-grey {klass}"
    aria-label={label}
    aria-expanded={open}
    aria-controls={open ? `${id}-menu` : undefined}
    onclick={() => { open = !open }}
    {onkeydown}
  >
    {@html icons.ellipsis}
  </button>
  {#if open}
    <div
      id="{id}-menu"
      class="absolute top-[calc(100%+1.375rem)] z-10 flex inline-48 flex-col items-start gap-4 rounded-card bg-menu p-4 shadow-menu {align === 'end' ? 'end-0' : 'start-1/2 -translate-x-1/2'}"
    >
      {#each items as item (item.label)}
        <button type="button" class="cursor-pointer text-body font-medium {item.danger ? 'text-danger-text' : 'text-muted'}" onclick={() => choose(item)} {onkeydown}>
          {item.label}
        </button>
      {/each}
    </div>
  {/if}
</div>
