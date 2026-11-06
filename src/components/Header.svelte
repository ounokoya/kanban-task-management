<script>
  import logoDark from '../../assets/logo-dark.svg'
  import logoLight from '../../assets/logo-light.svg'
  import logoMobile from '../../assets/logo-mobile.svg'
  import { icons } from '../lib/icons.js'
  import Menu from './Menu.svelte'

  // En-tête (§3.2) : nom du tableau (h1), « + Add New Task », menu du tableau.
  // Sous 768 px, le nom ouvre le choix du tableau ; le logo s'affiche quand la barre latérale n'est pas là.
  let { board, logo, wide, selecting, onadd, onedit, ondelete, onselect } = $props()

  const name = $derived(board?.name ?? 'No board')
</script>

<header class="flex shrink-0 bg-surface md:border-b md:border-line">
  {#if logo}
    <a href="#/" class="flex shrink-0 items-center px-4 md:border-e md:border-line md:px-6 lg:pe-8">
      {#if wide}
        <img src={logoDark} alt="kanban" width="153" height="26" class="block dark:hidden" />
        <img src={logoLight} alt="kanban" width="153" height="26" class="hidden dark:block" />
      {:else}
        <img src={logoMobile} alt="kanban" width="24" height="25" class="block" />
      {/if}
    </a>
  {/if}
  <div class="flex min-w-0 flex-1 items-center gap-2 py-4 pe-2 md:gap-4 md:pe-4 lg:pt-5 lg:pb-7 lg:pe-6 {logo ? 'md:ps-6 lg:ps-8' : 'ps-6'}">
    <h1 tabindex="-1" class="min-w-0 flex-1 text-l font-bold md:truncate md:text-title-md lg:text-xl">
      {#if wide}
        {name}
      {:else}
        <button type="button" class="flex max-inline-full cursor-pointer items-center gap-2" aria-expanded={selecting} onclick={(event) => onselect(event.currentTarget)}>
          <span class="truncate">{name}</span>
          <span class="shrink-0 text-violet">{@html selecting ? icons.chevronUp : icons.chevronDown}</span>
        </button>
      {/if}
    </h1>
    <button
      type="button"
      aria-label="Add New Task"
      class="btn block-8 inline-12 bg-violet text-m text-white hover:bg-violet-hover disabled:cursor-not-allowed disabled:opacity-25 disabled:hover:bg-violet md:block-12 md:inline-41"
      disabled={!board?.columns.length}
      onclick={(event) => onadd(event.currentTarget)}
    >
      <span class="md:hidden">{@html icons.addTask}</span>
      <span class="hidden md:inline">+ Add New Task</span>
    </button>
    {#if board}
      <Menu
        label="Board options"
        class="block-8 max-md:[&_svg]:h-4 max-md:[&_svg]:w-auto md:block-12"
        items={[
          { label: 'Edit Board', action: onedit },
          { label: 'Delete Board', action: ondelete, danger: true },
        ]}
      />
    {/if}
  </div>
</header>
