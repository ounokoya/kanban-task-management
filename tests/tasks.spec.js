import { test, expect } from '@playwright/test'
import { open, DATA, board, subtaskText, stored, title, card, cardsIn, titlesIn, columnHeading, addTask, taskMenu, button, dialog, alert, group, field, status } from './helpers.js'

// Spec §2, §3.4, §3.5, §3.7 et §8 — S17 à S23 : voir, cocher, déplacer par le statut, ajouter, modifier, supprimer une tâche

const PL = board('Platform Launch')
const research = PL.columns[1].tasks[5]

test('S17 — ouvrir une carte : titre, description, Subtasks (n of m), cases, Current Status ; Échap ferme, focus sur la carte', async ({ page }) => {
  await open(page, 1440)
  await card(page, research.title).click()
  const d = dialog(page, research.title)
  await expect(d.getByRole('heading', { level: 2 })).toHaveText(research.title)
  await expect(d).toContainText(research.description)
  const done = research.subtasks.filter((s) => s.isCompleted).length
  await expect(d).toContainText(`Subtasks (${done} of ${research.subtasks.length})`)
  for (const s of research.subtasks) {
    const box = d.getByRole('checkbox', { name: s.title, exact: true })
    if (s.isCompleted) await expect(box).toBeChecked(); else await expect(box).not.toBeChecked()
  }
  await expect(field(d, 'Current Status')).toHaveValue('Doing')
  expect(await field(d, 'Current Status').locator('option').allInnerTexts()).toEqual(['Todo', 'Doing', 'Done'])
  await page.keyboard.press('Escape')
  await expect(d).toBeHidden()
  await expect(card(page, research.title)).toBeFocused()
})

test('S18 — cocher puis décocher une sous-tâche : compteurs du dialogue et de la carte, barré, annonce', async ({ page }) => {
  await open(page, 1440)
  await card(page, research.title).click()
  const d = dialog(page, research.title)
  const todo = research.subtasks.find((s) => !s.isCompleted)
  // compteurs de data.json (la maquette en montre d'autres, §3.3)
  const done = research.subtasks.filter((s) => s.isCompleted).length
  const all = research.subtasks.length
  const box = d.getByRole('checkbox', { name: todo.title, exact: true })
  await box.check()
  await expect(d).toContainText(`Subtasks (${done + 1} of ${all})`)
  await expect(d.getByText(todo.title, { exact: true })).toHaveCSS('text-decoration-line', 'line-through')
  await expect(status(page)).toContainText(todo.title)
  await expect(card(page, research.title)).toContainText(`${done + 1} of ${all} subtasks`)
  await box.uncheck()
  await expect(d).toContainText(`Subtasks (${done} of ${all})`)
  await expect(card(page, research.title)).toContainText(`${done} of ${all} subtasks`)
})

test('S19 — Current Status Doing pour une tâche de Todo : en bas de Doing, Todo (3) et Doing (7)', async ({ page }) => {
  await open(page, 1440)
  const task = PL.columns[0].tasks[0]
  await card(page, task.title).click()
  const d = dialog(page, task.title)
  await field(d, 'Current Status').selectOption('Doing')
  await expect(status(page)).toContainText('Doing')
  await page.keyboard.press('Escape')
  expect(await titlesIn(page, 'Doing')).toEqual([...PL.columns[1].tasks.map((t) => t.title), task.title])
  await expect(columnHeading(page, 'Todo')).toHaveText(/\(3\)$/)
  await expect(columnHeading(page, 'Doing')).toHaveText(/\(7\)$/)
  expect((await stored(page)).boards[0].columns[1].tasks.at(-1)).toMatchObject({ title: task.title, status: 'Doing' })
})

test('S20 — Add New Task : champs vides, 2 sous-tâches proposées, Status Todo ; vide : « Can\'t be empty », focus sur Title, rien n\'est créé', async ({ page }) => {
  await open(page, 1440)
  await addTask(page).click()
  const d = dialog(page, 'Add New Task')
  await expect(field(d, 'Title')).toHaveValue('')
  await expect(field(d, 'Title')).toHaveAttribute('placeholder', 'e.g. Take coffee break')
  await expect(field(d, 'Description')).toHaveValue('')
  const subs = group(d, 'Subtasks')
  await expect(field(subs, 'Subtask 1')).toHaveAttribute('placeholder', 'e.g. Make coffee')
  await expect(field(subs, 'Subtask 2')).toHaveAttribute('placeholder', 'e.g. Drink coffee & smile')
  await expect(field(d, 'Status')).toHaveValue('Todo')
  await button(d, 'Create Task').click()
  await expect(d).toBeVisible()
  for (const f of [field(d, 'Title'), field(subs, 'Subtask 1'), field(subs, 'Subtask 2')]) {
    await expect(f).toHaveAttribute('aria-invalid', 'true')
    await expect(f).toHaveAccessibleDescription("Can't be empty")
  }
  await expect(field(d, 'Title')).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(cardsIn(page, 'Todo')).toHaveCount(4)
})

test('S21 — Add New Task rempli (1 sous-tâche gardée, 1 retirée, 1 ajoutée, Done) : en bas de Done, « 0 of 2 subtasks », Done (8)', async ({ page }) => {
  await open(page, 1440)
  await addTask(page).click()
  const d = dialog(page, 'Add New Task')
  const subs = group(d, 'Subtasks')
  await field(d, 'Title').fill('Write release notes')
  await field(d, 'Description').fill('Summarise the changes for the launch.')
  await field(subs, 'Subtask 1').fill('Collect changes')
  await button(subs, 'Remove subtask 2').click()
  await button(d, '+ Add New Subtask').click()
  await field(subs, 'Subtask 2').fill('Proofread')
  await field(d, 'Status').selectOption('Done')
  await button(d, 'Create Task').click()
  await expect(d).toBeHidden()
  expect((await titlesIn(page, 'Done')).at(-1)).toBe('Write release notes')
  await expect(card(page, 'Write release notes')).toContainText('0 of 2 subtasks')
  await expect(columnHeading(page, 'Done')).toHaveText(/\(8\)$/)
  expect((await stored(page)).boards[0].columns[2].tasks.at(-1)).toEqual({
    title: 'Write release notes', description: 'Summarise the changes for the launch.', status: 'Done',
    subtasks: [{ title: 'Collect changes', isCompleted: false }, { title: 'Proofread', isCompleted: false }],
  })
})

test('S22 — Edit Task : champs remplis ; titre, sous-tâches et statut changés, la carte suit ; Cancel (Échap) ne change rien', async ({ page }) => {
  await open(page, 1440)
  const task = PL.columns[1].tasks[4]
  await card(page, task.title).click()
  await taskMenu(dialog(page, task.title)).click()
  await button(page, 'Edit Task').click()
  let d = dialog(page, 'Edit Task')
  await expect(field(d, 'Title')).toHaveValue(task.title)
  await expect(field(d, 'Status')).toHaveValue('Doing')
  for (const [i, s] of task.subtasks.entries()) await expect(field(group(d, 'Subtasks'), `Subtask ${i + 1}`)).toHaveValue(s.title)
  await field(d, 'Title').fill('Changed and cancelled')
  await page.keyboard.press('Escape')
  await expect(card(page, task.title)).toBeVisible()
  await card(page, task.title).click()
  await taskMenu(dialog(page, task.title)).click()
  await button(page, 'Edit Task').click()
  d = dialog(page, 'Edit Task')
  await field(d, 'Title').fill('Add auth endpoints and tests')
  await button(group(d, 'Subtasks'), 'Remove subtask 1').click()
  await field(d, 'Status').selectOption('Done')
  await button(d, 'Save Changes').click()
  await expect(d).toBeHidden()
  expect((await titlesIn(page, 'Done')).at(-1)).toBe('Add auth endpoints and tests')
  await expect(card(page, 'Add auth endpoints and tests')).toContainText(`${task.subtasks.slice(1).filter((s) => s.isCompleted).length} of ${task.subtasks.length - 1} subtasks`)
  await expect(card(page, task.title)).toHaveCount(0)
})

test('S23 — Delete Task : Cancel garde, focus rendu ; Delete retire la carte, compteur, focus sur le titre du tableau', async ({ page }) => {
  await open(page, 1440)
  const task = PL.columns[0].tasks[2]
  await card(page, task.title).click()
  await taskMenu(dialog(page, task.title)).click()
  await button(page, 'Delete Task').click()
  const a = alert(page, 'Delete this task?')
  await expect(a).toContainText(`Are you sure you want to delete the '${task.title}' task and its subtasks? This action cannot be reversed.`)
  await button(a, 'Cancel').click()
  await expect(a).toBeHidden()
  await expect(card(page, task.title)).toBeFocused()
  await card(page, task.title).click()
  await taskMenu(dialog(page, task.title)).click()
  await button(page, 'Delete Task').click()
  await button(a, 'Delete').click()
  await expect(card(page, task.title)).toHaveCount(0)
  await expect(columnHeading(page, 'Todo')).toHaveText(/\(3\)$/)
  await expect(title(page)).toBeFocused()
  expect(subtaskText(task)).toBe('0 of 2 subtasks')
  expect(DATA.boards[0].columns[0].tasks).toHaveLength(4)
})
