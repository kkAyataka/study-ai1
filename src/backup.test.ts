import { describe, expect, it } from 'vitest'
import { backupFileName, createBackup, readBackup } from './backup'
import type { Todo } from './todo'

const sample: Todo[] = [
  { id: 'a', title: '牛乳を買う', completed: false, createdAt: '2026-11-21T10:00:00.000Z', dueDate: '2026-11-25' },
  { id: 'b', title: '請求書を払う', completed: true, createdAt: '2026-11-20T09:00:00.000Z', dueDate: null },
]

const v1Todo = { id: 'a', title: '牛乳を買う', completed: false, createdAt: '2026-11-21T10:00:00.000Z' }

describe('backup', () => {
  it('書き出した内容をそのまま読み込める', () => {
    expect(readBackup(createBackup(sample))).toEqual({ ok: true, todos: sample })
  })

  it('書き出すデータはバージョン2になる', () => {
    expect(JSON.parse(createBackup(sample)).version).toBe(2)
  })

  it('バージョン1のファイルは期限日なしのタスクとして読み込める', () => {
    expect(readBackup(JSON.stringify({ version: 1, todos: [v1Todo] }))).toEqual({
      ok: true,
      todos: [{ ...v1Todo, dueDate: null }],
    })
  })

  it('ファイル名は書き出した日の日付になる', () => {
    expect(backupFileName(new Date(2026, 0, 5, 23, 59))).toBe('todos-2026-01-05.json')
  })

  it('JSONとして読めないファイルはエラーになる', () => {
    expect(readBackup('これはJSONではない').ok).toBe(false)
  })

  it('未対応のバージョンはエラーになる', () => {
    expect(readBackup(JSON.stringify({ version: 3, todos: [] })).ok).toBe(false)
  })

  it.each([
    ['todos が配列でない', { version: 2, todos: 'x' }],
    ['タスクがオブジェクトでない', { version: 2, todos: [42] }],
    ['id が文字列でない', { version: 2, todos: [{ ...sample[0], id: 1 }] }],
    ['title が文字列でない', { version: 2, todos: [{ ...sample[0], title: null }] }],
    ['completed が真偽値でない', { version: 2, todos: [{ ...sample[0], completed: 'yes' }] }],
    ['createdAt が欠けている', { version: 2, todos: [{ id: 'a', title: 't', completed: false, dueDate: null }] }],
    ['dueDate が欠けている', { version: 2, todos: [v1Todo] }],
    ['dueDate が存在しない日付である', { version: 2, todos: [{ ...sample[0], dueDate: '2026-13-45' }] }],
    ['dueDate が2月30日である', { version: 2, todos: [{ ...sample[0], dueDate: '2026-02-30' }] }],
    ['dueDate に時刻が付いている', { version: 2, todos: [{ ...sample[0], dueDate: '2026-11-25T00:00:00Z' }] }],
    ['dueDate が数値である', { version: 2, todos: [{ ...sample[0], dueDate: 20261125 }] }],
    ['バージョン1のタスクの型が正しくない', { version: 1, todos: [{ ...v1Todo, completed: 'yes' }] }],
  ])('%s場合はエラーになる', (_label, data) => {
    expect(readBackup(JSON.stringify(data)).ok).toBe(false)
  })
})
