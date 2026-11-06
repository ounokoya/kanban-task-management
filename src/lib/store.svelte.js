// État des tableaux et persistance dans le navigateur (ADR-0007, D2) ; chaque changement passe par une règle pure
import data from '../../data.json'
import { isBoardsData, normalizeBoards, boardSlug, addTask, setStatus, editBoard, moveTask } from './rules.js'

const KEY = 'kanban/boards'

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY))
    if (isBoardsData(saved)) return normalizeBoards(saved).boards
  } catch { /* données illisibles : on repart de data.json */ }
  return normalizeBoards(data).boards
}

export const store = $state({ boards: load() })

function save() {
  try { localStorage.setItem(KEY, JSON.stringify({ boards: $state.snapshot(store.boards) })) } catch { /* stockage indisponible : l'app continue en mémoire */ }
}

const plain = (i) => $state.snapshot(store.boards[i])
const commit = (i, board) => { store.boards[i] = board; save() }

// D3 : adresse de chaque tableau, dans l'ordre, doublons -2, -3
export function slugs() {
  const taken = []
  for (const board of store.boards) taken.push(boardSlug(board.name, taken))
  return taken
}

export function createBoard({ name, columns }) {
  store.boards.push({ name: name.trim(), columns: columns.map((column) => ({ name: column.trim(), tasks: [] })) })
  save()
  return store.boards.length - 1
}
export const updateBoard = (i, edit) => commit(i, editBoard(plain(i), edit))
export function deleteBoard(i) { store.boards.splice(i, 1); save() }

export const createTask = (i, task) => commit(i, addTask(plain(i), task))
export const changeStatus = (i, at, status) => commit(i, setStatus(plain(i), at, status))
export const move = (i, from, to) => commit(i, moveTask(plain(i), from, to))

// Modifier une tâche : texte et sous-tâches à sa place ; nouveau statut : en bas de sa nouvelle colonne (D6)
export function updateTask(i, { column, index }, task) {
  const board = plain(i)
  board.columns[column].tasks[index] = { ...task, status: board.columns[column].name }
  commit(i, task.status === board.columns[column].name ? board : setStatus(board, { column, index }, task.status))
}

export function toggleSubtask(i, { column, index }, s, done) {
  store.boards[i].columns[column].tasks[index].subtasks[s].isCompleted = done
  save()
}

export function deleteTask(i, { column, index }) {
  store.boards[i].columns[column].tasks.splice(index, 1)
  save()
}

// Place d'une tâche après un changement de statut : en bas de sa nouvelle colonne
export function lastOf(i, status) {
  const column = store.boards[i].columns.findIndex((c) => c.name === status)
  return { column, index: store.boards[i].columns[column].tasks.length - 1 }
}
