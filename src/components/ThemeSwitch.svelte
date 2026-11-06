<script>
  import { icons } from '../lib/icons.js'
  import { prefs, setTheme } from '../lib/prefs.svelte.js'

  // Interrupteur du thème (§6) : case à cocher native au rôle switch (A4), cochée en sombre
  let { class: klass = '' } = $props()
</script>

<div class="flex block-12 items-center justify-center gap-6 rounded-box bg-board text-grey {klass}">
  {@html icons.light}
  <input
    type="checkbox"
    role="switch"
    aria-label="Dark theme"
    class="relative block-5 inline-10 cursor-pointer appearance-none rounded-full bg-violet transition-colors hover:bg-violet-hover before:absolute before:start-[0.1875rem] before:top-[0.1875rem] before:size-3.5 before:rounded-full before:bg-white before:transition-transform checked:before:translate-x-5"
    checked={prefs.theme === 'dark'}
    onchange={(event) => setTheme(event.currentTarget.checked ? 'dark' : 'light')}
  />
  {@html icons.dark}
</div>
