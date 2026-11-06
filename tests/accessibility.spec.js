import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { open, DATA, title, card, addTask, boardMenu, nav, button, dialog, alert } from './helpers.js'

// Spec §7 et §8 — S35 : aucune violation sérieuse ou critique ; repères (A2)

const research = DATA.boards[0].columns[1].tasks[5].title
const VIEWS = {
  'tableau': async (page) => { await expect(title(page)).toHaveText('Platform Launch') },
  'voir une tâche': async (page) => { await card(page, research).click(); await expect(dialog(page, research)).toBeVisible() },
  'formulaire de tâche en erreur': async (page) => { await addTask(page).click(); await button(dialog(page, 'Add New Task'), 'Create Task').click(); await expect(dialog(page, 'Add New Task').getByText("Can't be empty").first()).toBeVisible() },
  'formulaire de tableau': async (page) => { await boardMenu(page).click(); await button(page, 'Edit Board').click(); await expect(dialog(page, 'Edit Board')).toBeVisible() },
  'suppression': async (page) => { await boardMenu(page).click(); await button(page, 'Delete Board').click(); await expect(alert(page, 'Delete this board?')).toBeVisible() },
}

for (const theme of ['light', 'dark']) {
  for (const width of [375, 768, 1440]) {
    for (const [name, go] of Object.entries(VIEWS)) {
      test(`S35 — axe-core : ${name} (${theme}, ${width} px)`, async ({ page }) => {
        await open(page, width, 1024, { storedTheme: theme })
        await go(page)
        const { violations } = await new AxeBuilder({ page }).analyze()
        const serious = violations.filter((v) => ['serious', 'critical'].includes(v.impact))
        expect(serious.map((v) => `${v.id} : ${v.nodes.map((n) => n.target).join(', ')}`)).toEqual([])
      })
    }
    if (width === 375) {
      test(`S35 — axe-core : choix du tableau (${theme}, 375 px)`, async ({ page }) => {
        await open(page, 375, 667, { storedTheme: theme })
        await title(page).getByRole('button').click()
        await expect(dialog(page, 'Select a board')).toBeVisible()
        const { violations } = await new AxeBuilder({ page }).analyze()
        expect(violations.filter((v) => ['serious', 'critical'].includes(v.impact)).map((v) => v.id)).toEqual([])
      })
    }
  }
}

test('A2 — un en-tête (banner), une barre (navigation « Boards »), un contenu (main) ; un seul h1 ; dialogues nommés', async ({ page }) => {
  await open(page, 1440)
  await expect(page.getByRole('banner')).toHaveCount(1)
  await expect(nav(page)).toHaveCount(1)
  await expect(page.getByRole('main')).toHaveCount(1)
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
  await addTask(page).click()
  await expect(dialog(page, 'Add New Task')).toHaveCount(1)
})
