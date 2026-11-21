import { toDateString, type Todo } from './todo'
import { parseTodos, serializeTodos, type ParseResult } from './todoData'

export function createBackup(todos: Todo[]): string {
  return serializeTodos(todos)
}

export function readBackup(text: string): ParseResult {
  return parseTodos(text)
}

export function backupFileName(date: Date): string {
  return `todos-${toDateString(date)}.json`
}
