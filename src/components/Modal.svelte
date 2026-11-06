<script>
  import { onMount } from 'svelte'

  // Dialogue modal natif (ADR-0008) : ouvert par showModal, il prend le focus (ou le donne à `initial`), Tab reste dedans ;
  // Échap (fermeture native) ou un clic sur le voile appellent onclose ; le parent rend le focus (A10).
  let { labelledby, label, describedby, alert = false, initial, onclose, class: klass = 'm-auto inline-[min(30rem,calc(100%-2rem))]', children } = $props()

  let dialog
  let fromBackdrop = false

  onMount(() => {
    dialog.showModal()
    const first = initial?.() ?? dialog
    first.focus()
  })
</script>

<dialog
  bind:this={dialog}
  tabindex="-1"
  role={alert ? 'alertdialog' : undefined}
  aria-labelledby={labelledby}
  aria-label={label}
  aria-describedby={describedby}
  class="{klass} max-inline-none rounded-box bg-surface text-ink outline-none backdrop:bg-scrim"
  onclose={onclose}
  onpointerdown={(event) => { fromBackdrop = event.target === dialog }}
  onclick={(event) => { if (fromBackdrop && event.target === dialog) dialog.close() }}
>
  {@render children()}
</dialog>
