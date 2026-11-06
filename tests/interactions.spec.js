import { test, expect } from '@playwright/test'
import { open, DATA, THEME_KEY, SIDEBAR_KEY, main, nav, title, card, cardsIn, titlesIn, columnHeading, addTask, boardMenu, taskMenu, themeSwitch, button, dialog, field, status, style, sameColor, pixel, hex, close } from './helpers.js'

// Spec §6 et §8 — contrôles de bout en bout au clavier et à la souris (S27, S30, S10), puis survol, mouvements, focus (S32 à S34)

// S30 : l'interrupteur du thème, à la souris puis au clavier, dans les deux sens, gardé au rechargement
test('S30 — thème de l\'appareil (sombre), interrupteur à la souris puis au clavier dans les deux sens, choix gardé', async ({ page }) => {
  await open(page, 1440, 1024, { theme: 'dark' })
  const sw = themeSwitch(nav(page))
  await expect(sw).toBeChecked()
  expect(close(await pixel(page, 700, 600), hex('#20212c')), 'fond sombre').toBe(true)
  await sw.click()
  await expect(sw).not.toBeChecked()
  expect(close(await pixel(page, 700, 600), hex('#f4f7fd')), 'fond clair après le clic').toBe(true)
  await sw.focus()
  await page.keyboard.press('Space')
  await expect(sw).toBeChecked()
  expect(close(await pixel(page, 700, 600), hex('#20212c')), 'fond sombre au clavier').toBe(true)
  await page.keyboard.press('Space')
  await expect(sw).not.toBeChecked()
  expect(await page.evaluate((k) => localStorage.getItem(k), THEME_KEY)).toBe('light')
  await page.reload()
  await expect(themeSwitch(nav(page))).not.toBeChecked()
  expect(close(await pixel(page, 700, 600), hex('#f4f7fd')), 'clair gardé').toBe(true)
})

// S27 : une carte déplacée au clavier, dans sa colonne puis d'une colonne à l'autre, le focus la suit, annoncé
test('S27 — Alt + ↓ ↑ → ← sur une carte : elle descend, remonte, passe en bas de Doing puis de Todo ; focus et annonce', async ({ page }) => {
  await open(page, 1440)
  const todo = DATA.boards[0].columns[0].tasks.map((t) => t.title)
  const doing = DATA.boards[0].columns[1].tasks.map((t) => t.title)
  const first = card(page, todo[0])
  await first.focus()
  await page.keyboard.press('Alt+ArrowDown')
  expect(await titlesIn(page, 'Todo')).toEqual([todo[1], todo[0], ...todo.slice(2)])
  await expect(card(page, todo[0])).toBeFocused()
  await expect(status(page)).toContainText(todo[0])
  await page.keyboard.press('Alt+ArrowUp')
  expect(await titlesIn(page, 'Todo')).toEqual(todo)
  await page.keyboard.press('Alt+ArrowRight')
  expect(await titlesIn(page, 'Doing')).toEqual([...doing, todo[0]])
  await expect(columnHeading(page, 'Todo')).toHaveText(/\(3\)$/)
  await expect(columnHeading(page, 'Doing')).toHaveText(/\(7\)$/)
  await expect(card(page, todo[0])).toBeFocused()
  await expect(status(page)).toContainText('Doing')
  await page.keyboard.press('Alt+ArrowLeft')
  expect(await titlesIn(page, 'Todo')).toEqual([...todo.slice(1), todo[0]])
  await expect(card(page, todo[0])).toBeFocused()
})

// S10 : masquer et montrer la barre, au clavier puis à la souris, gardé au rechargement
test('S10 — « Hide Sidebar » et « Show Sidebar » au clavier puis à la souris ; gardé au rechargement', async ({ page }) => {
  await open(page, 1440)
  await button(nav(page), 'Hide Sidebar').focus()
  await page.keyboard.press('Enter')
  await expect(nav(page)).toBeHidden()
  const show = button(page, 'Show Sidebar')
  await expect(show).toBeVisible()
  expect(await page.evaluate((k) => localStorage.getItem(k), SIDEBAR_KEY)).toBe('hidden')
  await page.reload()
  await expect(nav(page)).toBeHidden()
  await button(page, 'Show Sidebar').click()
  await expect(nav(page)).toBeVisible()
  await expect(button(page, 'Show Sidebar')).toHaveCount(0)
})

// Menu du tableau au clavier : Entrée ouvre deux boutons, Échap ferme et rend le focus ; Edit Board ouvre le dialogue
test('Menu du tableau au clavier : Entrée ouvre Edit Board et Delete Board, Échap ferme et rend le focus ; Edit Board ouvre le dialogue', async ({ page }) => {
  await open(page, 1440)
  await boardMenu(page).focus()
  await page.keyboard.press('Enter')
  await expect(button(page, 'Edit Board')).toBeVisible()
  await expect(button(page, 'Delete Board')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(button(page, 'Edit Board')).toBeHidden()
  await expect(boardMenu(page)).toBeFocused()
  await page.keyboard.press('Enter')
  await page.keyboard.press('Tab')
  await expect(button(page, 'Edit Board')).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(dialog(page, 'Edit Board')).toBeVisible()
  await expect(field(dialog(page, 'Edit Board'), 'Board Name')).toHaveValue('Platform Launch')
})

// Menu de la tâche dans « voir une tâche » : il déborde du dialogue, entier et cliquable (maquette « View Task - Active »)
test('Menu de la tâche : ouvert depuis le dialogue, Edit Task et Delete Task entiers et cliquables hors du dialogue', async ({ page }) => {
  await open(page, 1440)
  const t = DATA.boards[0].columns[1].tasks[5].title
  await card(page, t).click()
  await taskMenu(dialog(page, t)).click()
  const menu = button(page, 'Edit Task').locator('..')
  await expect(menu).toBeInViewport({ ratio: 1 })
  // les coins du menu dépassent du dialogue (480 px de large) : rien ne les coupe ni ne les recouvre
  const corners = await menu.evaluate((el) => { const b = el.getBoundingClientRect(); return [[b.left + 8, b.top + 8], [b.right - 8, b.top + 8], [b.right - 8, b.bottom - 8], [b.left + 8, b.bottom - 8]].map(([x, y]) => el.contains(document.elementFromPoint(x, y))) })
  expect(corners, 'coins du menu visibles').toEqual([true, true, true, true])
  await button(page, 'Delete Task').click()
  await expect(page.getByRole('alertdialog', { name: 'Delete this task?' })).toBeVisible()
})

const hoverCheck = async (page, locator, checks, what) => {
  await locator.hover()
  for (const [prop, value] of checks) expect.soft(await sameColor(page, await style(locator, prop), value), `${what} survolé : ${prop}`).toBe(true)
}

test('S32 — survol en clair : boutons, carte, tableau de la barre, champ (§6)', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await open(page, 1440)
  await hoverCheck(page, addTask(page), [['backgroundColor', '#534ec1']], 'Add New Task')
  const c = card(page, DATA.boards[0].columns[0].tasks[0].title)
  await c.hover()
  expect.soft(await sameColor(page, await c.getByText(DATA.boards[0].columns[0].tasks[0].title).evaluate((el) => getComputedStyle(el).color), '#635fc7'), 'titre de carte survolée').toBe(true)
  await hoverCheck(page, nav(page).getByRole('link', { name: 'Marketing Plan', exact: true }), [['color', '#635fc7']], 'tableau de la barre')
  await addTask(page).click()
  const d = dialog(page, 'Add New Task')
  await hoverCheck(page, button(d, '+ Add New Subtask'), [['color', '#5450c2']], '+ Add New Subtask')
  await hoverCheck(page, field(d, 'Title'), [['borderTopColor', '#635fc7']], 'champ')
  await hoverCheck(page, button(d, 'Create Task'), [['backgroundColor', '#534ec1']], 'Create Task')
})

test('S32 — survol en sombre (choisi par l\'interrupteur) : carte, Delete, tableau de la barre', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await open(page, 1440)
  await themeSwitch(nav(page)).click()
  await expect(themeSwitch(nav(page))).toBeChecked()
  const t = DATA.boards[0].columns[0].tasks[0].title
  await card(page, t).hover()
  expect.soft(await sameColor(page, await card(page, t).getByText(t).evaluate((el) => getComputedStyle(el).color), '#a8a4ff'), 'titre de carte survolée').toBe(true)
  await hoverCheck(page, nav(page).getByRole('link', { name: 'Roadmap', exact: true }), [['color', '#635fc7'], ['backgroundColor', '#ffffff']], 'tableau de la barre')
  await boardMenu(page).click()
  await button(page, 'Delete Board').click()
  await hoverCheck(page, button(page.getByRole('alertdialog'), 'Delete'), [['backgroundColor', '#cc1a1a']], 'Delete')
})

test('S33 — prefers-reduced-motion : aucune transition', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await open(page, 1440)
  for (const b of [addTask(page), button(nav(page), 'Hide Sidebar'), card(page, DATA.boards[0].columns[0].tasks[0].title)]) {
    await b.hover()
    expect.soft(Math.max(...(await style(b, 'transitionDuration')).split(',').map(parseFloat))).toBe(0)
  }
})

// Parcours au Tab jusqu'au dernier élément : contour visible (2 px au moins) ou bordure de champ
async function walk(page, max = 120) {
  const seen = []
  for (let i = 0; i < max; i++) {
    await page.keyboard.press('Tab')
    const info = await page.evaluate(() => {
      const el = document.activeElement
      if (!el || el === document.body) return null
      if (el.dataset.walked) return { again: true }
      el.dataset.walked = '1'
      const s = getComputedStyle(el)
      const outline = s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) >= 2
      const field = el.matches('input:not([type=checkbox]), select, textarea') && s.borderTopColor !== 'rgba(0, 0, 0, 0)'
      return { name: (el.getAttribute('aria-label') || el.labels?.[0]?.textContent || el.textContent || el.tagName).trim().slice(0, 30), ok: outline || field, inDialog: !!el.closest('dialog') }
    })
    if (!info || info.again) break
    seen.push(info)
  }
  await page.evaluate(() => document.querySelectorAll('[data-walked]').forEach((el) => delete el.dataset.walked))
  return seen
}

test('S34 — tableau, voir une tâche, formulaires, suppression : focus visible jusqu\'au dernier élément ; focus gardé dans les dialogues ; Échap le rend', async ({ page }) => {
  test.setTimeout(60_000)
  await open(page, 1440)
  const boardWalk = await walk(page)
  expect(boardWalk.length, 'tableau : logo, 3 tableaux, Create, thème, Hide, Add, menu, 17 cartes, + New Column').toBeGreaterThanOrEqual(26)
  const t = DATA.boards[0].columns[0].tasks[0].title
  await card(page, t).click()
  const view = await walk(page, 20)
  expect(view.filter((x) => !x.inDialog).map((x) => x.name), 'voir une tâche : le focus sort').toEqual([])
  await page.keyboard.press('Escape')
  await expect(card(page, t)).toBeFocused()
  await addTask(page).click()
  const form = await walk(page, 30)
  expect(form.length, 'formulaire : Title, Description, 2 sous-tâches et leurs croix, + Add New Subtask, Status, Create Task').toBeGreaterThanOrEqual(9)
  expect(form.filter((x) => !x.inDialog).map((x) => x.name), 'formulaire : le focus sort').toEqual([])
  await page.keyboard.press('Escape')
  await expect(addTask(page)).toBeFocused()
  await boardMenu(page).click()
  await button(page, 'Delete Board').click()
  const del = await walk(page, 10)
  expect(del.filter((x) => !x.inDialog).map((x) => x.name), 'suppression : le focus sort').toEqual([])
  await page.keyboard.press('Escape')
  await expect(boardMenu(page)).toBeFocused()
  const missing = [...boardWalk, ...view, ...form, ...del].filter((x) => !x.ok).map((x) => x.name)
  expect(missing, 'éléments sans focus visible').toEqual([])
  await expect(main(page)).toBeVisible()
  await expect(title(page)).toHaveText('Platform Launch')
  await expect(cardsIn(page, 'Todo')).toHaveCount(4)
})
