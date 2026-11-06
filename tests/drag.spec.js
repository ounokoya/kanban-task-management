import { test, expect } from '@playwright/test'
import { open, board, stored, main, card, cardsIn, titlesIn, columnHeading, status, drag, pageBox } from './helpers.js'

// Spec §2 (D12), §6 et §8 — S24 à S26 : glisser-déposer à la souris et au tactile

const PL = board('Platform Launch')
const todo = PL.columns[0].tasks.map((t) => t.title)
const doing = PL.columns[1].tasks.map((t) => t.title)

test('S24 — souris : une carte de Todo glissée entre les 1re et 2e cartes de Doing ; place de dépôt montrée ; statut Doing, compteurs, annonce', async ({ page }) => {
  await open(page, 1440)
  const target2 = await pageBox(cardsIn(page, 'Doing').nth(1))
  const before = target2.y
  await drag(page, card(page, todo[0]), target2.x + 140, target2.y - 4)
  // pendant le glissement, la place de dépôt pousse la 2e carte de Doing vers le bas d'une carte au moins
  const during = await pageBox(cardsIn(page, 'Doing').filter({ hasNotText: todo[0] }).nth(1))
  expect(during.y - before, 'place de dépôt entre les cartes 1 et 2').toBeGreaterThanOrEqual(88)
  await page.mouse.up()
  expect(await titlesIn(page, 'Doing')).toEqual([doing[0], todo[0], ...doing.slice(1)])
  expect(await titlesIn(page, 'Todo')).toEqual(todo.slice(1))
  await expect(columnHeading(page, 'Todo')).toHaveText(/\(3\)$/)
  await expect(columnHeading(page, 'Doing')).toHaveText(/\(7\)$/)
  await expect(status(page)).toContainText(todo[0])
  expect((await stored(page)).boards[0].columns[1].tasks[1]).toMatchObject({ title: todo[0], status: 'Doing' })
})

test('S25 — souris : la 3e carte de Todo glissée en haut de sa colonne ; statut inchangé', async ({ page }) => {
  await open(page, 1440)
  const top = await pageBox(cardsIn(page, 'Todo').nth(0))
  await drag(page, card(page, todo[2]), top.x + 140, top.y + 10)
  await page.mouse.up()
  expect(await titlesIn(page, 'Todo')).toEqual([todo[2], todo[0], todo[1], todo[3]])
  expect((await stored(page)).boards[0].columns[0].tasks[0]).toMatchObject({ title: todo[2], status: 'Todo' })
})

test.describe('tactile', () => {
  test.use({ hasTouch: true })

  // Touchers envoyés par le protocole de Chromium : ils produisent les événements pointer de type « touch »
  async function touchDrag(page, from, x, y, holdMs) {
    const cdp = await page.context().newCDPSession(page)
    const b = await from.boundingBox(); const sx = b.x + b.width / 2; const sy = b.y + b.height / 2
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: sx, y: sy }] })
    if (holdMs) await page.waitForTimeout(holdMs)
    for (let i = 1; i <= 12; i++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: sx + (x - sx) * i / 12, y: sy + (y - sy) * i / 12 }] })
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  }

  test('S26 — tactile : appui de 300 ms puis glisser déplace la carte ; glissement immédiat : le tableau défile, aucune carte ne bouge', async ({ page }) => {
    await open(page, 768, 1024)
    const doneTop = await pageBox(cardsIn(page, 'Doing').nth(0))
    await touchDrag(page, card(page, todo[0]), doneTop.x + 140, doneTop.y + 10, 400)
    await expect(cardsIn(page, 'Doing').first()).toContainText(todo[0])
    const scroller = await main(page).evaluateHandle((el) => [el, ...el.querySelectorAll('*')].find((n) => n.scrollWidth > n.clientWidth + 1 && getComputedStyle(n).overflowX !== 'visible'))
    const left = await scroller.evaluate((n) => n.scrollLeft)
    const second = await pageBox(card(page, todo[1]))
    await touchDrag(page, card(page, todo[1]), second.x - 200, second.y + 5, 0)
    await expect.poll(() => scroller.evaluate((n) => n.scrollLeft)).toBeGreaterThan(left)
    expect(await titlesIn(page, 'Todo')).toEqual(todo.slice(1))
  })
})
