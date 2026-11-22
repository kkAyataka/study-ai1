import { describe, expect, it } from 'vitest'
import { loadTodos, saveTodos } from './storage'
import type { Todo } from './todo'

const sample: Todo[] = [
  { id: 'a', title: '牛乳を買う', completed: false, createdAt: '2026-11-21T10:00:00.000Z', dueDate: '2026-11-25' },
  { id: 'b', title: '請求書を払う', completed: true, createdAt: '2026-11-20T09:00:00.000Z', dueDate: null },
]

describe('storage', () => {
  it('何も保存されていなければ空の一覧を返す', () => {
    expect(loadTodos()).toEqual([])
  })

  it('保存したタスクをそのまま読み戻せる', () => {
    saveTodos(sample)
    expect(loadTodos()).toEqual(sample)
  })

  it('バージョン1の保存データは期限日なしのタスクとして読める', () => {
    const v1 = sample.map(({ dueDate: _dueDate, ...rest }) => rest)
    localStorage.setItem('study-ai1.todos', JSON.stringify({ version: 1, todos: v1 }))
    expect(loadTodos()).toEqual(sample.map((t) => ({ ...t, dueDate: null })))
  })

  it('保存データが壊れていたら空の一覧を返す', () => {
    localStorage.setItem('study-ai1.todos', '{壊れた')
    expect(loadTodos()).toEqual([])
  })

  it('正しくない期限日を含む保存データなら空の一覧を返す', () => {
    localStorage.setItem('study-ai1.todos', JSON.stringify({ version: 2, todos: [{ ...sample[0], dueDate: '2026-02-30' }] }))
    expect(loadTodos()).toEqual([])
  })

  it('未対応のバージョンのデータなら空の一覧を返す', () => {
    localStorage.setItem('study-ai1.todos', JSON.stringify({ version: 99, todos: sample }))
    expect(loadTodos()).toEqual([])
  })
})
