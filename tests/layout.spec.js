import { test, expect } from '@playwright/test'
import { open, DATA, nav, title, boardLink, columnHeading, card, addTask, boardMenu, themeSwitch, button, dialog, alert, main, pageBox, near, pixel, close } from './helpers.js'

// Spec §5 et §8 — S1 à S6 : positions de la maquette (à 1 px près ; 2 px pour les textes)

const first = DATA.boards[0].columns[0].tasks[0].title
const LAYOUT = {
  1440: { nav: { x: 0, y: 0, width: 300, height: 1024 }, title: { x: 324, y: 29 }, add: { x: 1215, y: 20, width: 164, height: 48 }, todo: { x: 351, y: 121 }, card: { x: 324, y: 160, width: 280, height: 88 }, newCol: { x: 1236, y: 160, width: 280, height: 814 }, active: { x: 0, y: 146, width: 276, height: 48 }, theme: { x: 130, y: 902, width: 40, height: 20 }, hide: { x: 0, y: 944, width: 276, height: 48 } },
  768: { nav: { x: 0, y: 0, width: 261, height: 1024 }, title: { x: 285, y: 28 }, add: { x: 551, y: 16, width: 164, height: 48 }, todo: { x: 312, y: 104 }, card: { x: 285, y: 143, width: 280, height: 88 }, newCol: { x: 1197, y: 143, width: 280, height: 814 }, active: { x: 0, y: 146, width: 240, height: 48 }, theme: { x: 112, y: 894, width: 40, height: 20 }, hide: { x: 0, y: 944, width: 240, height: 48 } },
}

for (const [w, v] of Object.entries(LAYOUT)) {
  test(`S1, S2 — ${w} × 1024 : barre, titre, Add New Task, colonne, 1re carte, + New Column, tableau ouvert, thème, Hide Sidebar`, async ({ page }) => {
    await open(page, Number(w), 1024)
    near(await pageBox(nav(page)), v.nav, 'barre')
    near(await pageBox(title(page)), v.title, 'titre', 2)
    near(await pageBox(addTask(page)), v.add, 'Add New Task')
    near(await pageBox(columnHeading(page, 'Todo')), v.todo, 'titre de colonne', 2)
    near(await pageBox(card(page, first)), v.card, '1re carte')
    near(await pageBox(button(main(page), '+ New Column')), v.newCol, '+ New Column')
    near(await pageBox(boardLink(page, 'Platform Launch')), v.active, 'tableau ouvert')
    near(await pageBox(themeSwitch(nav(page))), v.theme, 'interrupteur du thème')
    near(await pageBox(button(nav(page), 'Hide Sidebar')), v.hide, 'Hide Sidebar')
  })
}

test('S2 — 375 × 667 : pas de barre ; titre, « + » seul, colonne, 1re carte, + New Column', async ({ page }) => {
  await open(page, 375, 667)
  await expect(nav(page)).toBeHidden()
  near(await pageBox(title(page)), { x: 56, y: 21 }, 'titre', 2)
  near(await pageBox(addTask(page)), { x: 291, y: 16, width: 48, height: 32 }, 'Add New Task')
  expect((await addTask(page).innerText()).trim()).toBe('')
  near(await pageBox(columnHeading(page, 'Todo')), { x: 43, y: 88 }, 'titre de colonne', 2)
  near(await pageBox(card(page, first)), { x: 16, y: 127, width: 280, height: 88 }, '1re carte')
  near(await pageBox(button(main(page), '+ New Column')), { x: 928, y: 127, width: 280, height: 814 }, '+ New Column')
})

for (const w of [1440, 768]) {
  test(`S3 — barre masquée à ${w} : Show Sidebar à (0, 944), 1re colonne à x 24`, async ({ page }) => {
    await open(page, w, 1024, { sidebar: 'hidden' })
    near(await pageBox(button(page, 'Show Sidebar')), { x: 0, y: 944, width: 56, height: 48 }, 'Show Sidebar')
    near(await pageBox(card(page, first)), { x: 24 }, '1re carte')
  })
}

const research = DATA.boards[0].columns[1].tasks[5].title
const DIALOGS = {
  1440: { h: 1024, view: { x: 480, y: 251, width: 480, height: 523 }, del: { x: 480, y: 398, width: 480, height: 229 } },
  768: { h: 1024, view: { x: 144, y: 251, width: 480, height: 523 }, del: { x: 144, y: 398, width: 480, height: 229 } },
  375: { h: 970, view: { x: 16, y: 207, width: 343, height: 557 }, del: { x: 16, y: 343, width: 343, height: 284 } },
}

for (const [w, v] of Object.entries(DIALOGS)) {
  test(`S4 — ${w} px : voir une tâche et suppression, centrées ; voile à 50 %`, async ({ page }) => {
    await open(page, Number(w), v.h)
    await card(page, research).click()
    near(await pageBox(dialog(page, research)), v.view, 'voir une tâche', 2)
    if (w === '1440') expect(close(await pixel(page, 1300, 900), [122, 124, 127], 6), 'voile noir à 50 % sur #f4f7fd').toBe(true)
    await page.keyboard.press('Escape')
    await boardMenu(page).click()
    await button(page, 'Delete Board').click()
    near(await pageBox(alert(page, 'Delete this board?')), v.del, 'suppression', 2)
  })
}

test('S5 — 375 × 667 : le titre ouvre le choix du tableau à (54, 80), 264 × 322', async ({ page }) => {
  await open(page, 375, 667)
  await title(page).getByRole('button', { name: 'Platform Launch' }).click()
  near(await pageBox(dialog(page, 'Select a board')), { x: 54, y: 80, width: 264, height: 322 }, 'choix du tableau', 2)
})

test('S6 — pas de défilement horizontal de la page de 320 à 1440 px ; le tableau défile', async ({ page }) => {
  for (const width of [320, 375, 767, 768, 1023, 1024, 1440]) {
    await open(page, width, 900)
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), `page à ${width} px`).toBeLessThanOrEqual(0)
    expect(await main(page).evaluate((el) => { const s = [el, ...el.querySelectorAll('*')].find((n) => n.scrollWidth > n.clientWidth + 1 && getComputedStyle(n).overflowX !== 'visible'); return !!s }), `tableau qui défile à ${width} px`).toBe(true)
    await card(page, research).click()
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), `voir une tâche à ${width} px`).toBeLessThanOrEqual(0)
  }
})
