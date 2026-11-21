import { describe, expect, it } from 'vitest'
import { loadTodos, saveTodos } from './storage'
import type { Todo } from './todo'

const sample: Todo[] = [
  { id: 'a', title: '牛乳を買う', completed: false, createdAt: '2026-11-21T10:00:00.000Z' },
  { id: 'b', title: '請求書を払う', completed: true, createdAt: '2026-11-20T09:00:00.000Z' },
]

describe('storage', () => {
  it('何も保存されていなければ空の一覧を返す', () => {
    expect(loadTodos()).toEqual([])
  })

  it('保存したタスクをそのまま読み戻せる', () => {
    saveTodos(sample)
    expect(loadTodos()).toEqual(sample)
  })

  it('保存データが壊れていたら空の一覧を返す', () => {
    localStorage.setItem('study-ai1.todos', '{壊れた')
    expect(loadTodos()).toEqual([])
  })

  it('未対応のバージョンのデータなら空の一覧を返す', () => {
    localStorage.setItem('study-ai1.todos', JSON.stringify({ version: 99, todos: sample }))
    expect(loadTodos()).toEqual([])
  })
})
