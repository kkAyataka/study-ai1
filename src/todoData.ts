import type { Todo } from './todo'

export const DATA_VERSION = 1

export type ParseResult = { ok: true; todos: Todo[] } | { ok: false; error: string }

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
  if (!isRecord(data) || data.version !== DATA_VERSION) {
    return { ok: false, error: '対応していないデータ形式です。' }
  }
  if (!Array.isArray(data.todos) || !data.todos.every(isTodo)) {
    return { ok: false, error: 'タスクのデータが正しくありません。' }
  }
  return { ok: true, todos: data.todos }
}

function isTodo(value: unknown): value is Todo {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    typeof value.completed === 'boolean' &&
    typeof value.createdAt === 'string'
  )
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
