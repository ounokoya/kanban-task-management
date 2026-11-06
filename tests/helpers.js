import { readFileSync } from 'node:fs'
import { expect } from '@playwright/test'
import { PNG } from 'pngjs'

// Les tests ne s'appuient que sur la spec (specs/specifications/kanban-task-management.md) : rôles et noms accessibles (§7),
// contenu (§3), règles (§2), comportement (§6), clés de sauvegarde (D2, §6) ; jamais sur des classes.

export const DATA = JSON.parse(readFileSync(new URL('../data.json', import.meta.url), 'utf8'))
export const KEY = 'kanban/boards'
export const THEME_KEY = 'kanban/theme'
export const SIDEBAR_KEY = 'kanban/sidebar'
export const board = (name) => DATA.boards.find((b) => b.name === name)
export const subtaskText = (task) => `${task.subtasks.filter((s) => s.isCompleted).length} of ${task.subtasks.length} subtasks`
export const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// Ouvre l'app ; fresh : navigateur vidé ; boards : tableaux déjà gardés (D2) ; storedTheme, sidebar : préférences gardées (§6)
export async function open(page, width, height = 1024, { path = './', theme = 'light', fresh = true, boards, storedTheme, sidebar } = {}) {
  await page.setViewportSize({ width, height })
  await page.emulateMedia({ colorScheme: theme })
  if (fresh || boards || storedTheme || sidebar) {
    await page.goto('./')
    await page.evaluate(([key, list, themeKey, t, sideKey, s]) => {
      localStorage.clear()
      if (list) localStorage.setItem(key, JSON.stringify(list))
      if (t) localStorage.setItem(themeKey, t)
      if (s) localStorage.setItem(sideKey, s)
    }, [KEY, boards ?? null, THEME_KEY, storedTheme ?? null, SIDEBAR_KEY, sidebar ?? null])
  }
  await page.goto(path)
  if (boards || storedTheme || sidebar) await page.reload()
  await page.evaluate(() => document.fonts.ready)
}

export const stored = (page) => page.evaluate((key) => JSON.parse(localStorage.getItem(key) || 'null'), KEY)

export const main = (page) => page.getByRole('main')
export const nav = (page) => page.getByRole('navigation', { name: 'Boards' })
export const title = (page) => page.getByRole('heading', { level: 1 })
export const boardLink = (page, name) => nav(page).getByRole('link', { name, exact: true })
export const column = (page, name) => main(page).getByRole('region', { name: new RegExp(`^${escape(name)} \\(\\d+\\)$`) })
export const columnHeading = (page, name) => main(page).getByRole('heading', { level: 2, name: new RegExp(`^${escape(name)} \\(\\d+\\)$`) })
export const cardsIn = (page, name) => column(page, name).getByRole('button', { name: / \d+ of \d+ subtasks$/ })
export const card = (page, taskTitle) => main(page).getByRole('button', { name: new RegExp(`^${escape(taskTitle)} \\d+ of \\d+ subtasks$`) })
export const addTask = (page) => page.getByRole('button', { name: 'Add New Task', exact: true })
export const boardMenu = (page) => page.getByRole('button', { name: 'Board options', exact: true })
export const taskMenu = (scope) => scope.getByRole('button', { name: 'Task options', exact: true })
export const themeSwitch = (scope) => scope.getByRole('switch', { name: 'Dark theme', exact: true })
export const button = (scope, name) => scope.getByRole('button', { name, exact: true })
export const dialog = (page, name) => page.getByRole('dialog', { name, exact: true })
export const alert = (page, name) => page.getByRole('alertdialog', { name, exact: true })
export const group = (scope, name) => scope.getByRole('group', { name, exact: true })
export const field = (scope, name) => scope.getByLabel(name, { exact: true })
export const status = (page) => page.getByRole('status')

// Titres des cartes d'une colonne, dans l'ordre affiché
export const titlesIn = async (page, name) => (await cardsIn(page, name).allInnerTexts()).map((t) => t.split('\n')[0].trim())

// Boîte dans la page, arrondie au pixel
export const pageBox = (locator) => locator.evaluate((el) => {
  const b = el.getBoundingClientRect()
  return { x: Math.round(b.x + scrollX), y: Math.round(b.y + scrollY), width: Math.round(b.width), height: Math.round(b.height) }
})
export function near(actual, expected, what, tol = 1) {
  for (const [k, v] of Object.entries(expected)) expect.soft(Math.abs(actual[k] - v), `${what} ${k} : ${actual[k]} au lieu de ${v}`).toBeLessThanOrEqual(tol)
}

export const style = (locator, prop) => locator.evaluate((el, p) => getComputedStyle(el)[p], prop)
export const paint = (page, value) => page.evaluate((v) => {
  const c = document.createElement('canvas'); c.width = c.height = 1; const g = c.getContext('2d')
  g.fillStyle = v; g.fillRect(0, 0, 1, 1); return [...g.getImageData(0, 0, 1, 1).data]
}, value)
export const sameColor = async (page, a, b) => JSON.stringify(await paint(page, a)) === JSON.stringify(await paint(page, b))
export async function pixel(page, x, y) {
  const shot = PNG.sync.read(await page.screenshot({ clip: { x, y, width: 1, height: 1 } }))
  return [shot.data[0], shot.data[1], shot.data[2]]
}
export const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
export const close = (a, b, tol = 3) => a.every((v, i) => Math.abs(v - b[i]) <= tol)

// Glisse avec la souris du centre de `from` vers le point (x, y) de la page, par petits pas
export async function drag(page, from, x, y, { hold } = {}) {
  const b = await from.boundingBox()
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2)
  await page.mouse.down()
  if (hold) await hold()
  const steps = 12
  for (let i = 1; i <= steps; i++) await page.mouse.move(b.x + b.width / 2 + (x - b.x - b.width / 2) * i / steps, b.y + b.height / 2 + (y - b.y - b.height / 2) * i / steps)
}

// Part des pixels dont un canal diffère de plus de 40 (mesure du SDL-FM)
export function diffRatio(screenshot, file) {
  const actual = PNG.sync.read(screenshot); const expected = PNG.sync.read(readFileSync(file))
  if (actual.width !== expected.width || actual.height !== expected.height) throw new Error(`capture ${actual.width}×${actual.height} ≠ référence ${expected.width}×${expected.height}`)
  let different = 0
  for (let i = 0; i < actual.data.length; i += 4) {
    const delta = Math.max(Math.abs(actual.data[i] - expected.data[i]), Math.abs(actual.data[i + 1] - expected.data[i + 1]), Math.abs(actual.data[i + 2] - expected.data[i + 2]))
    if (delta > 40) different++
  }
  return different / (actual.width * actual.height)
}
