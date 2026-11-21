import { describe, expect, it } from 'vitest'
import { backupFileName, createBackup, readBackup } from './backup'
import type { Todo } from './todo'

const sample: Todo[] = [
  { id: 'a', title: '牛乳を買う', completed: false, createdAt: '2026-11-21T10:00:00.000Z' },
]

describe('backup', () => {
  it('書き出した内容をそのまま読み込める', () => {
    expect(readBackup(createBackup(sample))).toEqual({ ok: true, todos: sample })
  })

  it('ファイル名は書き出した日の日付になる', () => {
    expect(backupFileName(new Date(2026, 0, 5, 23, 59))).toBe('todos-2026-01-05.json')
  })

  it('JSONとして読めないファイルはエラーになる', () => {
    expect(readBackup('これはJSONではない').ok).toBe(false)
  })

  it('未対応のバージョンはエラーになる', () => {
    expect(readBackup(JSON.stringify({ version: 2, todos: [] })).ok).toBe(false)
  })

  it.each([
    ['todos が配列でない', { version: 1, todos: 'x' }],
    ['タスクがオブジェクトでない', { version: 1, todos: [42] }],
    ['id が文字列でない', { version: 1, todos: [{ ...sample[0], id: 1 }] }],
    ['title が文字列でない', { version: 1, todos: [{ ...sample[0], title: null }] }],
    ['completed が真偽値でない', { version: 1, todos: [{ ...sample[0], completed: 'yes' }] }],
    ['createdAt が欠けている', { version: 1, todos: [{ id: 'a', title: 't', completed: false }] }],
  ])('%s場合はエラーになる', (_label, data) => {
    expect(readBackup(JSON.stringify(data)).ok).toBe(false)
  })
})
