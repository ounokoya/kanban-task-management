import { test, expect } from '@playwright/test'
import { open, DATA, KEY, board, subtaskText, nav, title, boardLink, card, titlesIn, columnHeading, addTask, boardMenu, button, dialog, alert, group, field, themeSwitch, style, sameColor, pixel, hex, close } from './helpers.js'

// Spec §2 (D2), §4, §6 et §8 — S28 à S31 : persistance et thème

const PL = board('Platform Launch')

test('S28 — tableau, colonne, tâche, sous-tâche, déplacement, suppression : retrouvés après rechargement', async ({ page }) => {
  await open(page, 1440)
  // tableau créé
  await button(nav(page), '+ Create New Board').click()
  await field(dialog(page, 'Add New Board'), 'Name').fill('Web Design')
  await button(dialog(page, 'Add New Board'), 'Create New Board').click()
  // colonne ajoutée
  await boardMenu(page).click()
  await button(page, 'Edit Board').click()
  await button(dialog(page, 'Edit Board'), '+ Add New Column').click()
  await field(group(dialog(page, 'Edit Board'), 'Board Columns'), 'Column 3').fill('Done')
  await button(dialog(page, 'Edit Board'), 'Save Changes').click()
  // tâche ajoutée
  await addTask(page).click()
  await field(dialog(page, 'Add New Task'), 'Title').fill('Sketch the homepage')
  for (const n of ['Subtask 2', 'Subtask 1']) await button(group(dialog(page, 'Add New Task'), 'Subtasks'), `Remove ${n.toLowerCase()}`).click()
  await button(dialog(page, 'Add New Task'), 'Create Task').click()
  // sous-tâche cochée, tâche déplacée par son statut, tâche supprimée, dans Platform Launch
  await boardLink(page, 'Platform Launch').click()
  const research = PL.columns[1].tasks[5]
  await card(page, research.title).click()
  await dialog(page, research.title).getByRole('checkbox', { name: research.subtasks[2].title, exact: true }).check()
  await field(dialog(page, research.title), 'Current Status').selectOption('Done')
  await page.keyboard.press('Escape')
  const gone = PL.columns[0].tasks[3]
  await card(page, gone.title).click()
  await dialog(page, gone.title).getByRole('button', { name: 'Task options', exact: true }).click()
  await button(page, 'Delete Task').click()
  await button(alert(page, 'Delete this task?'), 'Delete').click()

  await page.reload()
  await expect(boardLink(page, 'Web Design')).toBeVisible()
  expect((await titlesIn(page, 'Done')).at(-1)).toBe(research.title)
  await expect(card(page, research.title)).toContainText(subtaskText({ subtasks: research.subtasks.map((s, i) => ({ isCompleted: s.isCompleted || i === 2 })) }))
  await expect(card(page, gone.title)).toHaveCount(0)
  await expect(columnHeading(page, 'Todo')).toHaveText(/\(3\)$/)
  await boardLink(page, 'Web Design').click()
  await expect(columnHeading(page, 'Done')).toHaveText(/\(0\)$/)
  expect(await titlesIn(page, 'Todo')).toEqual(['Sketch the homepage'])
})

test('S29 — navigateur vidé, ou données gardées sans la forme de D1 : les 3 tableaux de data.json', async ({ page }) => {
  await open(page, 1440, 1024, { boards: { boards: [] } })
  await expect(nav(page).getByText(/^All boards \(0\)$/i)).toBeVisible()
  await page.evaluate((key) => localStorage.removeItem(key), KEY)
  await page.reload()
  await expect(nav(page).getByText(/^All boards \(3\)$/i)).toBeVisible()
  const noColumns = structuredClone(DATA); delete noColumns.boards[0].columns
  const noTitle = structuredClone(DATA); delete noTitle.boards[0].columns[0].tasks[0].title
  const wrongStatus = structuredClone(DATA); wrongStatus.boards[0].columns[0].tasks[0].status = 3
  const noFlag = structuredClone(DATA); delete noFlag.boards[0].columns[0].tasks[0].subtasks[0].isCompleted
  for (const saved of [[null], { boards: [null] }, noColumns, noTitle, wrongStatus, noFlag]) {
    await open(page, 1440, 1024, { boards: saved })
    await expect(nav(page).getByText(/^All boards \(3\)$/i), JSON.stringify(saved).slice(0, 50)).toBeVisible()
    await expect(title(page)).toHaveText('Platform Launch')
  }
})

const THEMES = {
  light: { board: '#f4f7fd', surface: '#ffffff', ink: '#000112', grey: '#647288', primary: '#635fc7' },
  dark: { board: '#20212c', surface: '#2b2c37', ink: '#ffffff', grey: '#8894a7', primary: '#635fc7' },
}

for (const [theme, c] of Object.entries(THEMES)) {
  test(`S31 — thème ${theme} : fonds, textes, points, boutons (§4)`, async ({ page }) => {
    await open(page, 1440, 1024, { storedTheme: theme })
    expect.soft(close(await pixel(page, 700, 600), hex(c.board)), 'fond du tableau').toBe(true)
    expect.soft(close(await pixel(page, 150, 500), hex(c.surface)), 'barre latérale').toBe(true)
    expect.soft(close(await pixel(page, 900, 50), hex(c.surface)), 'en-tête').toBe(true)
    expect.soft(await sameColor(page, await style(title(page), 'color'), c.ink), 'titre').toBe(true)
    expect.soft(await sameColor(page, await style(columnHeading(page, 'Todo'), 'color'), c.grey), 'titre de colonne').toBe(true)
    expect.soft(await sameColor(page, await style(addTask(page), 'backgroundColor'), c.primary), 'Add New Task').toBe(true)
    expect.soft(await sameColor(page, await style(boardLink(page, 'Marketing Plan'), 'color'), c.grey), 'tableau de la barre').toBe(true)
    await expect(themeSwitch(nav(page))).toBeChecked({ checked: theme === 'dark' })
  })
}
