<script>
  // Champ texte (A3) : label visible, ou nom seul pour une ligne de liste ; l'erreur est liée (aria-invalid, aria-describedby)
  // et s'affiche dans le champ, à droite. Taper efface l'erreur.
  let { label, showLabel = true, value = $bindable(''), error = $bindable(''), placeholder, multiline = false, class: klass = '' } = $props()

  const id = $props.id()
  const invalid = $derived(error ? 'true' : undefined)
  const described = $derived(error ? `${id}-error` : undefined)
</script>

<div class={klass}>
  {#if showLabel}
    <label for={id} class="label">{label}</label>
  {/if}
  <div class="relative">
    {#if multiline}
      <textarea {id} class="field block block-28 resize-none px-4 py-2" {placeholder} bind:value aria-invalid={invalid} aria-describedby={described} oninput={() => { error = '' }}></textarea>
    {:else}
      <input
        {id}
        type="text"
        class="field block-10 ps-4 {error ? 'pe-36' : 'pe-4'}"
        aria-label={showLabel ? undefined : label}
        {placeholder}
        bind:value
        aria-invalid={invalid}
        aria-describedby={described}
        oninput={() => { error = '' }}
      />
    {/if}
    {#if error}
      <span id="{id}-error" class="pointer-events-none absolute inset-y-0 end-4 flex items-center text-body font-medium text-danger-text">{error}</span>
    {/if}
  </div>
</div>
