import type { Todo } from './todo'
import { parseTodos, serializeTodos, type ParseResult } from './todoData'

export function createBackup(todos: Todo[]): string {
  return serializeTodos(todos)
}

export function readBackup(text: string): ParseResult {
  return parseTodos(text)
}

export function backupFileName(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `todos-${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}.json`
}
