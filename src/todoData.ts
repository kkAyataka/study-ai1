import { isDateString, type Todo } from './todo'

export const DATA_VERSION = 2

export type ParseResult = { ok: true; todos: Todo[] } | { ok: false; error: string }

type TodoV1 = Omit<Todo, 'dueDate'>

export function serializeTodos(todos: Todo[]): string {
  return JSON.stringify({ version: DATA_VERSION, todos }, null, 2)
}

export function parseTodos(text: string): ParseResult {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    return { ok: false, error: 'JSONとして読み込めませんでした。' }
  }
  if (!isRecord(data) || (data.version !== 1 && data.version !== DATA_VERSION)) {
    return { ok: false, error: '対応していないデータ形式です。' }
  }
  const invalid = { ok: false, error: 'タスクのデータが正しくありません。' } as const
  if (!Array.isArray(data.todos)) return invalid
  if (data.version === 1) {
    if (!data.todos.every(isTodoV1)) return invalid
    return { ok: true, todos: data.todos.map((todo) => ({ ...todo, dueDate: null })) }
  }
  if (!data.todos.every(isTodo)) return invalid
  return { ok: true, todos: data.todos }
}

function isTodoV1(value: unknown): value is TodoV1 {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    typeof value.completed === 'boolean' &&
    typeof value.createdAt === 'string'
  )
}

function isTodo(value: unknown): value is Todo {
  return isTodoV1(value) && 'dueDate' in value && (value.dueDate === null || isDateString(value.dueDate))
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
