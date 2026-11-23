import { useState } from 'react'
import { loadTodos, saveTodos } from './storage'
import { parseDueDateInput, type Todo } from './todo'

/**
 * 保存しているタスクと、その操作。todos は常に作成順（作成日時の新しい順）。
 * 保存は各操作の中だけで行い、開いただけでは保存しない。
 * 開いた直後に保存すると、壊れた保存データを空の一覧として読んだときに、元のデータを空で上書きしてしまうため
 */
export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>(loadTodos)

  function update(next: Todo[]) {
    setTodos(next)
    saveTodos(next)
  }

  /** 追加できたら true。タイトルが空白だけか、期限日の入力値が保存できない値なら追加せず false */
  function add(title: string, dueDateInput: string): boolean {
    const next = addTodo(todos, title, dueDateInput)
    if (next === undefined) return false
    update(next)
    return true
  }

  function toggle(id: string) {
    update(toggleTodo(todos, id))
  }

  /** 期限日の入力値が空なら期限日を外す。保存できない値なら何もしない */
  function setDueDate(id: string, dueDateInput: string) {
    const next = setTodoDueDate(todos, id, dueDateInput)
    if (next !== undefined) update(next)
  }

  /** 確認はしない（確認は画面の役目） */
  function remove(id: string) {
    update(removeTodo(todos, id))
  }

  /** 検証済みのタスクで全部置き換える。作成順の約束を守るため、作成日時の新しい順に並べ直す */
  function replaceAll(next: Todo[]) {
    update(sortByCreatedAt(next))
  }

  return { todos, add, toggle, setDueDate, remove, replaceAll }
}

function addTodo(todos: Todo[], title: string, dueDateInput: string): Todo[] | undefined {
  const trimmed = title.trim()
  const dueDate = parseDueDateInput(dueDateInput)
  if (trimmed === '' || dueDate === undefined) return undefined
  const todo: Todo = {
    id: crypto.randomUUID(),
    title: trimmed,
    completed: false,
    createdAt: new Date().toISOString(),
    dueDate,
  }
  return [todo, ...todos]
}

function toggleTodo(todos: Todo[], id: string): Todo[] {
  return todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
}

function setTodoDueDate(todos: Todo[], id: string, dueDateInput: string): Todo[] | undefined {
  const dueDate = parseDueDateInput(dueDateInput)
  if (dueDate === undefined) return undefined
  return todos.map((t) => (t.id === id ? { ...t, dueDate } : t))
}

function removeTodo(todos: Todo[], id: string): Todo[] {
  return todos.filter((t) => t.id !== id)
}

function sortByCreatedAt(todos: Todo[]): Todo[] {
  return [...todos].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}
