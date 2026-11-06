import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'

// base : le site est servi par GitHub Pages sous /kanban-task-management/
export default defineConfig({ base: '/kanban-task-management/', plugins: [svelte(), tailwindcss()] })
