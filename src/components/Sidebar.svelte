<script>
  import logoDark from '../../assets/logo-dark.svg'
  import logoLight from '../../assets/logo-light.svg'
  import { icons } from '../lib/icons.js'
  import ThemeSwitch from './ThemeSwitch.svelte'

  // Barre latérale (§3.1, ≥ 768 px) : tableaux, création, thème, « Hide Sidebar »
  let { boards, addresses, current, oncreate, onhide } = $props()
</script>

<nav aria-label="Boards" class="flex block-full inline-[16.3125rem] shrink-0 flex-col border-e border-line bg-surface lg:inline-75">
  <a href="#/" class="ms-[1.625rem] mt-[2.0625rem] self-start lg:ms-[2.125rem]">
    <img src={logoDark} alt="kanban" width="153" height="26" class="block dark:hidden" />
    <img src={logoLight} alt="kanban" width="153" height="26" class="hidden dark:block" />
  </a>
  <p class="mt-[3.3125rem] ps-6 text-s font-bold text-muted uppercase lg:ps-8">All boards ({boards.length})</p>
  <ul class="mt-[1.1875rem] pe-[1.3125rem] lg:pe-6">
    {#each boards as board, i (addresses[i])}
      <li>
        <a
          href="#/board/{addresses[i]}"
          aria-current={i === current ? 'page' : undefined}
          class="flex block-12 items-center gap-3 rounded-e-full ps-6 text-m font-bold text-muted transition-colors hover:bg-nav-hover hover:text-nav-hover-text aria-[current=page]:bg-violet aria-[current=page]:text-white lg:gap-4 lg:ps-8"
        >
          {@html icons.board}
          <span class="truncate">{board.name}</span>
        </a>
      </li>
    {/each}
    <li>
      <button
        type="button"
        class="flex block-12 inline-full cursor-pointer items-center gap-3 rounded-e-full ps-6 text-m font-bold text-accent transition-colors hover:bg-nav-hover hover:text-nav-hover-text lg:gap-4 lg:ps-8"
        onclick={(event) => oncreate(event.currentTarget)}
      >
        {@html icons.board}
        + Create New Board
      </button>
    </li>
  </ul>
  <ThemeSwitch class="mx-[0.8125rem] mt-auto lg:ms-6 lg:me-[1.5625rem]" />
  <button
    type="button"
    class="mt-4 mb-8 flex block-12 inline-60 cursor-pointer items-center gap-2.5 rounded-e-full ps-6 text-m font-bold text-muted transition-colors hover:bg-nav-hover hover:text-nav-hover-text lg:mt-2 lg:inline-[17.25rem] lg:gap-[0.9375rem] lg:ps-[1.9375rem]"
    onclick={onhide}
  >
    {@html icons.hide}
    Hide Sidebar
  </button>
</nav>
