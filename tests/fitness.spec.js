import { test, expect } from '@playwright/test'
import { execFileSync } from 'node:child_process'
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { open } from './helpers.js'

// Fitness functions des ADR-0004, ADR-0005, ADR-0009 et ADR-0010

const root = (path) => new URL(`../${path}`, import.meta.url).pathname
const files = (dir) => readdirSync(dir).flatMap((f) => statSync(join(dir, f)).isDirectory() ? files(join(dir, f)) : [join(dir, f)])
const COLOR = /#[0-9a-f]{3,8}\b|\brgba?\(|\bhsla?\(|\boklch\(/i

test('ADR-0004 — aucune couleur écrite en dur dans src/ hors des valeurs de tokens de src/app.css', () => {
  expect(existsSync(root('src/app.css')), 'src/app.css').toBe(true)
  const found = []
  for (const f of files(root('src')).filter((f) => /\.(svelte|css|js)$/.test(f))) {
    let text = readFileSync(f, 'utf8')
    if (f.endsWith('app.css')) text = text.replace(/--[\w-]+\s*:[^;]+;/g, '')
    if (COLOR.test(text.replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, ''))) found.push(f.split('/src/')[1])
  }
  expect(found).toEqual([])
})

test('ADR-0005 — rien n\'est chargé hors du domaine ; Plus Jakarta Sans 500 et 700 se chargent', async ({ page, baseURL }) => {
  const outside = []
  page.on('request', (r) => { if (new URL(r.url()).origin !== new URL(baseURL).origin) outside.push(r.url()) })
  await open(page, 1440)
  const faces = ['500 16px "Plus Jakarta Sans"', '700 16px "Plus Jakarta Sans"']
  const found = await page.evaluate(async (list) => { const ok = []; for (const f of list) if ((await document.fonts.load(f)).length) ok.push(f); return ok }, faces)
  expect(found).toEqual(faces)
  expect(outside).toEqual([])
})

test('ADR-0009 — glisser-déposer sans bibliothèque : une seule dépendance d\'exécution, la police', () => {
  const pkg = JSON.parse(readFileSync(root('package.json'), 'utf8'))
  expect(Object.keys(pkg.dependencies ?? {})).toEqual(['@fontsource/plus-jakarta-sans'])
})

test('ADR-0010 — aucun fichier de maquette suivi par git', () => {
  const tracked = execFileSync('git', ['ls-files'], { cwd: root(''), encoding: 'utf8' }).split('\n')
  expect(tracked.filter((f) => /\.(fig|sketch|xd)$/.test(f) || f.startsWith('design/') || f === 'preview.jpg')).toEqual([])
})
