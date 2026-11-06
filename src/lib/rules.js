// Règles de gestion de la spec (§2) : fonctions pures (ADR-0007), testées sans navigateur (tests/unit)
// Elles ne modifient jamais leurs arguments : chaque changement rend un nouveau tableau.

// D10 : couleurs des colonnes par leur token (src/app.css : --color-todo, --color-doing, --color-done)
export const COLUMN_COLORS = ['todo', 'doing', 'done']
const EMPTY = "Can't be empty"
const blank = (value) => String(value ?? '').trim() === ''

// D3 : « Platform Launch » → platform-launch ; doublons -2, -3
export function boardSlug(name, taken = []) {
  const base = String(name).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'board'
  let slug = base
  for (let n = 2; taken.includes(slug); n++) slug = `${base}-${n}`
  return slug
}

// D4 : nom et colonnes obligatoires ; colonne en double, sans tenir compte de la casse : « Used »
export function validateBoard({ name, columns }) {
  const errors = {}
  if (blank(name)) errors.name = EMPTY
  const seen = new Set()
  columns.forEach((column, i) => {
    const key = String(column).trim().toLowerCase()
    if (!key) errors[`columns.${i}`] = EMPTY
    else if (seen.has(key)) errors[`columns.${i}`] = 'Used'
    seen.add(key)
  })
  return { ok: Object.keys(errors).length === 0, errors }
}

// D5 : titre obligatoire, chaque sous-tâche ajoutée aussi
export function validateTask({ title, subtasks }) {
  const errors = {}
  if (blank(title)) errors.title = EMPTY
  subtasks.forEach((subtask, i) => { if (blank(subtask)) errors[`subtasks.${i}`] = EMPTY })
  return { ok: Object.keys(errors).length === 0, errors }
}

const withColumns = (board, update) => ({ ...board, columns: board.columns.map((column, i) => update(column, i)) })
const withTask = (board, { column, index }, task) => withColumns(board, (c, i) => (i === column ? { ...c, tasks: c.tasks.map((t, j) => (j === index ? task : t)) } : c))

// D4 : un nouveau tableau, ses colonnes vides
export const newBoard = ({ name, columns }) => ({ name: name.trim(), columns: columns.map((column) => ({ name: column.trim(), tasks: [] })) })

// D6 : une tâche ajoutée va en bas de la colonne de son statut
export function addTask(board, task) {
  return withColumns(board, (column) => column.name === task.status ? { ...column, tasks: [...column.tasks, task] } : column)
}

// D6 : nouveau statut → en bas de sa nouvelle colonne ; même statut : rien ne bouge
export function setStatus(board, { column, index }, status) {
  const to = board.columns.findIndex((c) => c.name === status)
  if (to < 0 || to === column) return board
  return moveTask(board, { column, index }, { column: to, index: board.columns[to].tasks.length })
}

// D6 : une tâche modifiée garde sa place ; un nouveau statut la met en bas de sa nouvelle colonne
export function editTask(board, { column, index }, task) {
  const current = board.columns[column]
  if (!current?.tasks[index]) return board
  const kept = withTask(board, { column, index }, { ...task, status: current.name })
  return task.status === current.name ? kept : setStatus(kept, { column, index }, task.status)
}

// D11 : une sous-tâche cochée ou décochée
export function toggleSubtask(board, { column, index }, s, done) {
  const task = board.columns[column]?.tasks[index]
  if (!task?.subtasks[s]) return board
  return withTask(board, { column, index }, { ...task, subtasks: task.subtasks.map((subtask, i) => (i === s ? { ...subtask, isCompleted: done } : subtask)) })
}

// D8 : la tâche retirée, les autres gardent leur ordre
export function removeTask(board, { column, index }) {
  if (!board.columns[column]?.tasks[index]) return board
  return withColumns(board, (c, i) => (i === column ? { ...c, tasks: c.tasks.filter((_, t) => t !== index) } : c))
}

// D12 : la tâche quitte sa place et prend celle donnée (bornée) ; son statut devient le nom de la colonne
export function moveTask(board, from, to) {
  const task = board.columns[from.column]?.tasks[from.index]
  if (!task) return board
  const columns = board.columns.map((c) => ({ ...c, tasks: [...c.tasks] }))
  columns[from.column].tasks.splice(from.index, 1)
  const target = columns[to.column]
  const index = Math.max(0, Math.min(to.index, target.tasks.length))
  target.tasks.splice(index, 0, { ...task, status: target.name })
  return { ...board, columns }
}

// D7 : colonnes renommées (statuts suivis), ajoutées (vides), retirées avec leurs tâches
// columns : [{ name, from? }] où from est la place de la colonne d'origine
export function editBoard(board, { name, columns }) {
  return {
    ...board,
    name: name.trim(),
    columns: columns.map(({ name: columnName, from }) => {
      const label = columnName.trim()
      const tasks = from === undefined ? [] : board.columns[from].tasks.map((task) => ({ ...task, status: label }))
      return { name: label, tasks }
    }),
  }
}

// D11 : compteurs
export const subtaskLabel = (task) => `${task.subtasks.filter((s) => s.isCompleted).length} of ${task.subtasks.length} subtasks`
export const columnLabel = (column) => `${column.name} (${column.tasks.length})`
// D10 : token de couleur du point selon la place de la colonne
export const columnColor = (index) => COLUMN_COLORS[index % COLUMN_COLORS.length]

// D1, D2 : forme des données gardées
const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)
const isText = (value) => typeof value === 'string'
const isSubtask = (s) => isObject(s) && isText(s.title) && typeof s.isCompleted === 'boolean'
const isTask = (t) => isObject(t) && isText(t.title) && t.title.trim() !== '' && isText(t.description) && isText(t.status) && Array.isArray(t.subtasks) && t.subtasks.every(isSubtask)
const isColumn = (c) => isObject(c) && isText(c.name) && c.name.trim() !== '' && Array.isArray(c.tasks) && c.tasks.every(isTask)
const isBoard = (b) => isObject(b) && isText(b.name) && b.name.trim() !== '' && Array.isArray(b.columns) && b.columns.every(isColumn)
export const isBoardsData = (data) => isObject(data) && Array.isArray(data.boards) && data.boards.every(isBoard)

// D1 : le statut d'une tâche est le nom de la colonne qui la contient
export const normalizeBoards = (data) => ({
  boards: data.boards.map((board) => withColumns(board, (column) => ({ ...column, tasks: column.tasks.map((task) => ({ ...task, status: column.name })) }))),
})
