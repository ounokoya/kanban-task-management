<script>
  import { icons } from '../lib/icons.js'
  import Modal from './Modal.svelte'
  import ThemeSwitch from './ThemeSwitch.svelte'

  // Choix du tableau (§3.8, < 768 px) : un bouton par tableau, création, thème ; le voile laisse l'en-tête visible
  let { boards, current, onpick, oncreate, onclose } = $props()
</script>

<Modal label="Select a board" class="mx-auto mt-20 inline-66 backdrop:top-16" {onclose}>
  <div class="pt-4 pb-4">
    <p class="ps-6 text-s font-bold text-muted uppercase">All boards ({boards.length})</p>
    <ul class="mt-[1.1875rem] pe-6">
      {#each boards as board, i (i)}
        <li>
          <button
            type="button"
            aria-current={i === current ? 'true' : undefined}
            class="flex block-12 inline-full cursor-pointer items-center gap-3 rounded-e-full ps-6 text-start text-m font-bold text-muted transition-colors hover:bg-nav-hover hover:text-nav-hover-text aria-[current=true]:bg-violet aria-[current=true]:text-white"
            onclick={() => onpick(i)}
          >
            {@html icons.board}
            <span class="truncate">{board.name}</span>
          </button>
        </li>
      {/each}
      <li>
        <button type="button" class="flex block-12 inline-full cursor-pointer items-center gap-3 rounded-e-full ps-6 text-m font-bold text-accent transition-colors hover:bg-nav-hover hover:text-nav-hover-text" onclick={oncreate}>
          {@html icons.board}
          + Create New Board
        </button>
      </li>
    </ul>
    <ThemeSwitch class="mx-4 mt-4" />
  </div>
</Modal>
