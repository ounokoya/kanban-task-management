import { test, expect } from '@playwright/test'
import { existsSync } from 'node:fs'
import { open, DATA, title, card, addTask, boardMenu, button, dialog, taskMenu, diffRatio } from './helpers.js'

// Spec §8 — S37 : les 24 écrans de G3-6 comparés aux références corrigées AA (design/reference-aa, hors dépôt : maquettes premium).
// Sans ces références (site en ligne, autre poste), les tests sont sautés.

const REF = new URL('../design/reference-aa/', import.meta.url).pathname
const MAX = 0.05
const PL = DATA.boards[0]
const research = PL.columns[1].tasks[5].title
const auth = PL.columns[1].tasks[4].title
const settings = PL.columns[0].tasks[2].title
const empty = () => { const d = structuredClone(DATA); d.boards[0].columns = []; return d }
// Contenu de la maquette là où il diffère de data.json (§3.3, §5 note ¹) : la capture compare la mise en page, pas les données.
// Voir une tâche : 2 sous-tâches cochées sur 3 ; sur mobile, la 3ᵉ est « Surveying and testing ».
const mockup = (size) => {
  const d = structuredClone(DATA); const task = d.boards[0].columns[1].tasks[5]
  task.subtasks[1].isCompleted = true
  if (size === 'mobile') task.subtasks[2].title = 'Surveying and testing'
  return d
}
const BOARDS = { 'board-empty': empty, 'view-task': mockup }

const STEPS = {
  'board': async () => {},
  'board-empty': async () => {},
  'board-sidebar-hidden': async () => {},
  // clic sans faire défiler le tableau : la maquette le montre au début, même quand la carte dépasse à droite (mobile)
  'view-task': async (page) => { await card(page, research).dispatchEvent('click') },
  'add-task': async (page) => { await addTask(page).click() },
  'edit-task': async (page) => { await card(page, auth).click(); await taskMenu(dialog(page, auth)).click(); await button(page, 'Edit Task').click() },
  'add-board': async (page) => { await page.getByRole('button', { name: '+ Create New Board', exact: true }).first().click() },
  'edit-board': async (page) => { await boardMenu(page).click(); await button(page, 'Edit Board').click() },
  'delete-board': async (page) => { await boardMenu(page).click(); await button(page, 'Delete Board').click() },
  'delete-task': async (page) => { await card(page, settings).click(); await taskMenu(dialog(page, settings)).click(); await button(page, 'Delete Task').click() },
  'board-select-board': async (page) => { await title(page).getByRole('button').click() },
}

const SCREENS = [
  ...['board-light', 'board-dark', 'board-light-empty', 'board-light-sidebar-hidden', 'view-task-light', 'view-task-dark', 'add-task-light', 'edit-task-light', 'add-board-light', 'edit-board-light', 'delete-board-light', 'delete-task-light'].map((s) => ['desktop', s]),
  ...['board-light', 'board-dark', 'board-light-sidebar-hidden', 'view-task-light', 'add-task-light', 'delete-task-light'].map((s) => ['tablet', s]),
  ...['board-light', 'board-dark', 'board-light-select-board', 'view-task-light', 'add-task-light', 'delete-board-light'].map((s) => ['mobile', s]),
]
const WIDTH = { desktop: 1440, tablet: 768, mobile: 375 }

for (const [size, screen] of SCREENS) {
  const file = `${size}-${screen}.png`
  const theme = screen.includes('-dark') ? 'dark' : 'light'
  const step = screen.replace(/-(light|dark)/, '')
  const height = size !== 'mobile' ? 1024 : step === 'board' || step === 'board-select-board' ? 667 : 970
  test(`S37 — ${file} (≤ ${MAX * 100} %)`, async ({ page }, testInfo) => {
    test.skip(!existsSync(REF + file), 'références de la maquette absentes (hors dépôt)')
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await open(page, WIDTH[size], height, { storedTheme: theme, boards: BOARDS[step]?.(size), sidebar: step === 'board-sidebar-hidden' ? 'hidden' : undefined })
    // une page vide claire reste sous 5 % (fond #f4f7fd et cartes blanches proches du blanc) : le contenu doit d'abord être là
    await expect(title(page)).toHaveText('Platform Launch')
    await STEPS[step](page)
    await page.evaluate(() => Promise.all([...document.images].map((img) => img.decode().catch(() => {}))))
    await page.mouse.move(WIDTH[size] - 1, height - 1)
    await page.evaluate(() => document.activeElement?.blur())
    const shot = await page.screenshot({ caret: 'hide', animations: 'disabled' })
    await testInfo.attach(file, { body: shot, contentType: 'image/png' })
    const ratio = diffRatio(shot, REF + file)
    testInfo.annotations.push({ type: 'pixels différents', description: `${(ratio * 100).toFixed(2)} %` })
    expect(ratio).toBeLessThanOrEqual(MAX)
  })
}
