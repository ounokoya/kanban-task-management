// État des tableaux et persistance dans le navigateur (ADR-0007, D2) ; chaque changement passe par une règle pure :
// le store remplace le tableau (ou la liste) par celui que la règle rend, puis enregistre
import data from '../../data.json'
import { isBoardsData, normalizeBoards, boardSlug, newBoard, addTask, setStatus, editBoard, editTask, moveTask, toggleSubtask as checkSubtask, removeTask } from './rules.js'

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

export function createBoard(data) {
  store.boards = [...store.boards, newBoard(data)]
  save()
  return store.boards.length - 1
}
export const updateBoard = (i, edit) => commit(i, editBoard(plain(i), edit))
export function deleteBoard(i) {
  store.boards = store.boards.filter((_, j) => j !== i)
  save()
}

export const createTask = (i, task) => commit(i, addTask(plain(i), task))
export const changeStatus = (i, at, status) => commit(i, setStatus(plain(i), at, status))
export const move = (i, from, to) => commit(i, moveTask(plain(i), from, to))

export const updateTask = (i, at, task) => commit(i, editTask(plain(i), at, task))
export const toggleSubtask = (i, at, s, done) => commit(i, checkSubtask(plain(i), at, s, done))
export const deleteTask = (i, at) => commit(i, removeTask(plain(i), at))

// Place d'une tâche après un changement de statut : en bas de sa nouvelle colonne
export function lastOf(i, status) {
  const column = store.boards[i].columns.findIndex((c) => c.name === status)
  return { column, index: store.boards[i].columns[column].tasks.length - 1 }
}
