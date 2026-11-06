import { test, expect } from '@playwright/test'
import { open, DATA, THEME_KEY, SIDEBAR_KEY, stored, main, nav, title, boardLink, card, cardsIn, titlesIn, columnHeading, addTask, boardMenu, taskMenu, themeSwitch, button, dialog, alert, group, field, status, style, sameColor, pixel, hex, close } from './helpers.js'

// Spec §6 et §8 — parcours complets au clavier seul (S38 : créer, valider, cocher, modifier, supprimer, renommer),
// contrôles de bout en bout au clavier et à la souris (S30, S27, S39, S10, menus), puis survol, mouvements, focus (S32 à S34)

const TODO = DATA.boards[0].columns[0].tasks.map((t) => t.title)

// S38 : un tableau créé au clavier seul, refusé vide puis accepté ; il s'ouvre et il est gardé
test('S38 — clavier seul : créer un tableau, refusé vide puis accepté ; ouvert, adresse, gardé', async ({ page }) => {
  await open(page, 1440)
  await button(nav(page), '+ Create New Board').focus()
  await page.keyboard.press('Enter')
  const d = dialog(page, 'Add New Board')
  await expect(d).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(field(d, 'Name')).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(field(d, 'Name')).toHaveAccessibleDescription("Can't be empty")
  await expect(field(d, 'Name')).toBeFocused()
  await expect(nav(page).getByText(/^All boards \(3\)$/i)).toBeVisible()
  await page.keyboard.type('Web Design')
  await page.keyboard.press('Enter')
  await expect(d).toBeHidden()
  await expect(title(page)).toHaveText('Web Design')
  await expect(page).toHaveURL(/#\/board\/web-design$/)
  await expect(boardLink(page, 'Web Design')).toHaveAttribute('aria-current', 'page')
  await expect(columnHeading(page, 'Todo')).toHaveText(/\(0\)$/)
  expect((await stored(page)).boards.at(-1)).toEqual({ name: 'Web Design', columns: [{ name: 'Todo', tasks: [] }, { name: 'Doing', tasks: [] }] })
})

// S38 : une tâche ajoutée au clavier seul, refusée vide puis acceptée ; une sous-tâche cochée à la barre d'espace
test('S38 — clavier seul : ajouter une tâche, refusée vide puis acceptée ; cocher une sous-tâche', async ({ page }) => {
  await open(page, 1440)
  await addTask(page).focus()
  await page.keyboard.press('Enter')
  const d = dialog(page, 'Add New Task')
  await page.keyboard.press('Tab')
  await expect(field(d, 'Title')).toBeFocused()
  await page.keyboard.press('Enter')
  const subs = group(d, 'Subtasks')
  for (const f of [field(d, 'Title'), field(subs, 'Subtask 1'), field(subs, 'Subtask 2')]) await expect(f).toHaveAccessibleDescription("Can't be empty")
  await expect(field(d, 'Title')).toBeFocused()
  await page.keyboard.type('Write release notes')
  await page.keyboard.press('Tab')
  await page.keyboard.type('Summarise the changes for the launch.')
  await page.keyboard.press('Tab')
  await page.keyboard.type('Collect changes')
  await page.keyboard.press('Tab')
  await expect(button(subs, 'Remove subtask 1')).toBeFocused()
  await page.keyboard.press('Tab')
  await page.keyboard.type('Proofread')
  await page.keyboard.press('Enter')
  await expect(d).toBeHidden()
  expect(await titlesIn(page, 'Todo')).toEqual([...TODO, 'Write release notes'])
  await expect(columnHeading(page, 'Todo')).toHaveText(/\(5\)$/)
  const c = card(page, 'Write release notes')
  await expect(c).toContainText('0 of 2 subtasks')
  await c.focus()
  await page.keyboard.press('Enter')
  const v = dialog(page, 'Write release notes')
  await page.keyboard.press('Tab')
  await expect(taskMenu(v)).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(v.getByRole('checkbox', { name: 'Collect changes', exact: true })).toBeFocused()
  await page.keyboard.press('Space')
  await expect(v).toContainText('Subtasks (1 of 2)')
  await expect(status(page)).toContainText('Collect changes')
  await page.keyboard.press('Escape')
  await expect(c).toBeFocused()
  await expect(c).toContainText('1 of 2 subtasks')
  expect((await stored(page)).boards[0].columns[0].tasks.at(-1)).toEqual({
    title: 'Write release notes', description: 'Summarise the changes for the launch.', status: 'Todo',
    subtasks: [{ title: 'Collect changes', isCompleted: true }, { title: 'Proofread', isCompleted: false }],
  })
})

// S38 : une tâche modifiée puis supprimée au clavier seul, après confirmation ; le focus suit la carte puis le titre
test('S38 — clavier seul : modifier une tâche puis la supprimer après confirmation ; le focus suit', async ({ page }) => {
  await open(page, 1440)
  await card(page, TODO[2]).focus()
  await page.keyboard.press('Enter')
  await page.keyboard.press('Tab')
  await page.keyboard.press('Enter')
  await page.keyboard.press('Tab')
  await expect(button(page, 'Edit Task')).toBeFocused()
  await page.keyboard.press('Enter')
  const d = dialog(page, 'Edit Task')
  await page.keyboard.press('Tab')
  await expect(field(d, 'Title')).toHaveValue(TODO[2])
  await page.keyboard.press('ControlOrMeta+a')
  await page.keyboard.type('Build the settings page')
  await page.keyboard.press('Enter')
  await expect(d).toBeHidden()
  const renamed = card(page, 'Build the settings page')
  await expect(renamed).toBeFocused()
  expect(await titlesIn(page, 'Todo')).toEqual([TODO[0], TODO[1], 'Build the settings page', TODO[3]])
  await page.keyboard.press('Enter')
  await page.keyboard.press('Tab')
  await page.keyboard.press('Enter')
  await page.keyboard.press('Tab')
  await page.keyboard.press('Tab')
  await expect(button(page, 'Delete Task')).toBeFocused()
  await page.keyboard.press('Enter')
  const a = alert(page, 'Delete this task?')
  await expect(a).toContainText("Are you sure you want to delete the 'Build the settings page' task and its subtasks?")
  await expect(button(a, 'Cancel')).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await expect(button(a, 'Delete')).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(renamed).toHaveCount(0)
  await expect(columnHeading(page, 'Todo')).toHaveText(/\(3\)$/)
  await expect(title(page)).toBeFocused()
  expect((await stored(page)).boards[0].columns[0].tasks.map((t) => t.title)).toEqual([TODO[0], TODO[1], TODO[3]])
})


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

// S39 : la consigne du déplacement au clavier est lue sur chaque carte ; le focus d'un champ ne tient pas qu'à sa couleur
test('S39 — une carte décrit Alt + flèches ; un champ au focus a une bordure violette épaissie', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await open(page, 1440)
  await expect(card(page, TODO[0])).toHaveAccessibleDescription(/Alt.*arrow/i)
  await addTask(page).click()
  const t = field(dialog(page, 'Add New Task'), 'Title')
  expect(await style(t, 'boxShadow'), 'sans focus : bordure seule').toBe('none')
  await page.keyboard.press('Tab')
  await expect(t).toBeFocused()
  expect(await sameColor(page, await style(t, 'borderTopColor'), '#635fc7'), 'bordure violette').toBe(true)
  expect(await style(t, 'boxShadow'), 'anneau de 1 px qui épaissit la bordure').toMatch(/0px 0px 0px 1px/)
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

// Menu du tableau au clavier : Entrée ouvre deux boutons, Échap ferme et rend le focus ; Edit Board renomme le tableau (S38)
test('Menu du tableau au clavier : Entrée ouvre Edit Board et Delete Board, Échap ferme et rend le focus ; Edit Board renomme le tableau', async ({ page }) => {
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
  const d = dialog(page, 'Edit Board')
  await expect(field(d, 'Board Name')).toHaveValue('Platform Launch')
  await page.keyboard.press('Tab')
  await expect(field(d, 'Board Name')).toBeFocused()
  await page.keyboard.press('ControlOrMeta+a')
  await page.keyboard.type('Launch')
  await page.keyboard.press('Enter')
  await expect(d).toBeHidden()
  await expect(title(page)).toHaveText('Launch')
  await expect(boardLink(page, 'Launch')).toHaveAttribute('aria-current', 'page')
  await expect(page).toHaveURL(/#\/board\/launch$/)
  await expect(boardMenu(page)).toBeFocused()
  expect((await stored(page)).boards[0].name).toBe('Launch')
})

// Menu de la tâche dans « voir une tâche » : il déborde du dialogue, entier et cliquable (maquette « View Task - Active »)
test('Menu de la tâche : ouvert depuis le dialogue, entier et cliquable hors du dialogue ; Delete Task confirmé retire la tâche', async ({ page }) => {
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
  await button(alert(page, 'Delete this task?'), 'Delete').click()
  await expect(card(page, t)).toHaveCount(0)
  await expect(columnHeading(page, 'Doing')).toHaveText(/\(5\)$/)
  expect((await stored(page)).boards[0].columns[1].tasks.map((task) => task.title)).not.toContain(t)
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
