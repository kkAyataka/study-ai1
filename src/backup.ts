import { toDateString, type Todo } from './todo'
import { parseTodos, serializeTodos, type ParseResult } from './todoData'

export function createBackup(todos: Todo[]): string {
  return serializeTodos(todos)
}

/**
 * 書き出したファイルを読み込む。保存データと同じ検証に加えて、手で編集したファイルで起きやすい誤りも弾く。
 * 保存データ（localStorage）にはこの追加の検証をかけない。アプリ自身が書いたデータで、ここで弾いた値は入らないため
 */
export function readBackup(text: string): ParseResult {
  const result = parseTodos(text)
  if (!result.ok) return result
  const ids = new Set(result.todos.map((todo) => todo.id))
  const valid =
    ids.size === result.todos.length &&
    result.todos.every((todo) => todo.title.trim() !== '' && isCreatedAtString(todo.createdAt))
  return valid ? result : { ok: false, error: 'タスクのデータが正しくありません。' }
}

/** 書き出しと同じ形式（toISOString() の UTC、ミリ秒付き）の、実在する日時かどうか */
function isCreatedAtString(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) return false
  const date = new Date(value)
  return !Number.isNaN(date.getTime()) && date.toISOString() === value
}

export function backupFileName(date: Date): string {
  return `todos-${toDateString(date)}.json`
}
