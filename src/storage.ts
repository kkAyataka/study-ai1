import type { Todo } from './todo'
import { parseTodos, serializeTodos } from './todoData'

const KEY = 'study-ai1.todos'

export function loadTodos(): Todo[] {
  const raw = localStorage.getItem(KEY)
  if (raw === null) return []
  const result = parseTodos(raw)
  return result.ok ? result.todos : []
}

export function saveTodos(todos: Todo[]): void {
  localStorage.setItem(KEY, serializeTodos(todos))
}
