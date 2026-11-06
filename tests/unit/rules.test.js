import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { boardSlug, validateBoard, validateTask, addTask, setStatus, editBoard, moveTask, subtaskLabel, columnLabel, columnColor, isBoardsData, normalizeBoards } from '../../src/lib/rules.js'

// Spec §8 — U1 à U7 : règles de gestion (§2) sans navigateur

const DATA = JSON.parse(readFileSync(new URL('../../data.json', import.meta.url), 'utf8'))
const PL = () => structuredClone(DATA.boards[0])
const titles = (b, c) => b.columns[c].tasks.map((t) => t.title)

test('U1 — adresse d\'un tableau : minuscules et tirets, doublons -2, -3 (D3)', () => {
  assert.equal(boardSlug('Platform Launch'), 'platform-launch')
  assert.equal(boardSlug('  Web   Design! '), 'web-design')
  assert.equal(boardSlug('Roadmap', ['roadmap']), 'roadmap-2')
  assert.equal(boardSlug('Roadmap', ['roadmap', 'roadmap-2']), 'roadmap-3')
  assert.equal(boardSlug('***'), 'board')
})

test('U2 — validation : chaque « Can\'t be empty », « Used » sans tenir compte de la casse ; un formulaire complet est valide (D4, D5)', () => {
  assert.deepEqual(validateBoard({ name: '', columns: ['Todo', ' ', 'todo'] }), { ok: false, errors: { name: "Can't be empty", 'columns.1': "Can't be empty", 'columns.2': 'Used' } })
  assert.deepEqual(validateBoard({ name: 'Web Design', columns: ['Todo', 'Doing'] }), { ok: true, errors: {} })
  assert.deepEqual(validateBoard({ name: 'No columns', columns: [] }), { ok: true, errors: {} })
  assert.deepEqual(validateTask({ title: ' ', subtasks: ['', 'Proofread'] }), { ok: false, errors: { title: "Can't be empty", 'subtasks.0': "Can't be empty" } })
  assert.deepEqual(validateTask({ title: 'Ship', subtasks: [] }), { ok: true, errors: {} })
})

test('U3 — ajouter une tâche, changer son statut : en bas de la colonne (D6)', () => {
  const task = { title: 'New', description: '', status: 'Doing', subtasks: [] }
  const b = addTask(PL(), task)
  assert.deepEqual(b.columns[1].tasks.at(-1), task)
  assert.equal(b.columns[1].tasks.length, 7)
  const moved = setStatus(PL(), { column: 0, index: 0 }, 'Done')
  assert.equal(moved.columns[2].tasks.at(-1).title, 'Build UI for onboarding flow')
  assert.equal(moved.columns[2].tasks.at(-1).status, 'Done')
  assert.deepEqual(titles(moved, 0), titles(PL(), 0).slice(1))
  assert.equal(setStatus(PL(), { column: 0, index: 0 }, 'Todo').columns[0].tasks[0].title, 'Build UI for onboarding flow', 'même statut : rien ne bouge')
})

test('U4 — modifier un tableau : colonne renommée (statuts suivis), ajoutée, retirée avec ses tâches (D7)', () => {
  const b = editBoard(PL(), { name: 'Launch', columns: [{ name: 'Todo', from: 0 }, { name: 'In Progress', from: 1 }, { name: 'Review' }] })
  assert.equal(b.name, 'Launch')
  assert.deepEqual(b.columns.map((c) => c.name), ['Todo', 'In Progress', 'Review'])
  assert.deepEqual(titles(b, 1), titles(PL(), 1))
  assert.ok(b.columns[1].tasks.every((t) => t.status === 'In Progress'))
  assert.deepEqual(b.columns[2].tasks, [])
  assert.equal(b.columns.flatMap((c) => c.tasks).length, 10, 'les 7 tâches de Done sont retirées')
})

test('U5 — déplacer une tâche : même colonne, autre colonne, place donnée ; ordre des autres gardé (D12)', () => {
  const same = moveTask(PL(), { column: 0, index: 2 }, { column: 0, index: 0 })
  assert.deepEqual(titles(same, 0), ['Build settings UI', 'Build UI for onboarding flow', 'Build UI for search', 'QA and test all major user journeys'])
  const other = moveTask(PL(), { column: 0, index: 0 }, { column: 1, index: 1 })
  assert.equal(other.columns[1].tasks[1].title, 'Build UI for onboarding flow')
  assert.equal(other.columns[1].tasks[1].status, 'Doing')
  assert.deepEqual(titles(other, 1).filter((t) => t !== 'Build UI for onboarding flow'), titles(PL(), 1))
  const end = moveTask(PL(), { column: 2, index: 0 }, { column: 0, index: 99 })
  assert.equal(end.columns[0].tasks.at(-1).title, PL().columns[2].tasks[0].title)
  assert.equal(end.columns[0].tasks.at(-1).status, 'Todo')
})

test('U6 — compteurs « 1 of 3 subtasks », « Todo (4) » ; couleur des colonnes selon leur place, par token (D10, D11)', () => {
  assert.equal(subtaskLabel(PL().columns[1].tasks[0]), '2 of 3 subtasks')
  assert.equal(subtaskLabel({ subtasks: [] }), '0 of 0 subtasks')
  assert.equal(columnLabel(PL().columns[0]), 'Todo (4)')
  assert.deepEqual([0, 1, 2, 3, 4].map(columnColor), ['todo', 'doing', 'done', 'todo', 'doing'], 'valeurs des tokens vérifiées dans le navigateur (S7)')
})

test('U7 — données gardées : data.json acceptée, chaque défaut refusé ; au chargement, le statut devient le nom de la colonne (D1, D2)', () => {
  assert.equal(isBoardsData(DATA), true)
  assert.equal(isBoardsData({ boards: [] }), true)
  const broken = (edit) => { const d = structuredClone(DATA); edit(d); return d }
  const cases = {
    'null': null, 'tableau seul': [], 'tableau null': { boards: [null] },
    'tableau sans colonnes': broken((d) => delete d.boards[0].columns),
    'tableau sans nom': broken((d) => { d.boards[0].name = '' }),
    'tâche sans titre': broken((d) => delete d.boards[0].columns[0].tasks[0].title),
    'statut qui n\'est pas un texte': broken((d) => { d.boards[0].columns[0].tasks[0].status = 3 }),
    'sous-tâche sans isCompleted': broken((d) => delete d.boards[0].columns[0].tasks[0].subtasks[0].isCompleted),
    'description qui n\'est pas un texte': broken((d) => { d.boards[0].columns[0].tasks[0].description = 3 }),
  }
  for (const [what, data] of Object.entries(cases)) assert.equal(isBoardsData(data), false, what)
  const normal = normalizeBoards(DATA)
  for (const b of normal.boards) for (const c of b.columns) for (const t of c.tasks) assert.equal(t.status, c.name, `${b.name} · ${t.title}`)
  assert.equal(DATA.boards[1].columns[0].tasks[1].status, '', 'data.json lui-même n\'est pas modifié')
})
