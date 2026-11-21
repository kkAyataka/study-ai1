import { useState, type FormEvent } from 'react'
import { loadTodos, saveTodos } from './storage'
import type { Todo } from './todo'

function App() {
  const [todos, setTodos] = useState<Todo[]>(loadTodos)
  const [draft, setDraft] = useState('')

  function update(next: Todo[]) {
    setTodos(next)
    saveTodos(next)
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const title = draft.trim()
    if (title === '') return
    const todo: Todo = {
      id: crypto.randomUUID(),
      title,
      completed: false,
      createdAt: new Date().toISOString(),
    }
    update([todo, ...todos])
    setDraft('')
  }

  function toggle(id: string) {
    update(todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)))
  }

  function remove(todo: Todo) {
    if (!window.confirm(`「${todo.title}」を削除しますか？`)) return
    update(todos.filter((t) => t.id !== todo.id))
  }

  return (
    <main>
      <h1>ToDo</h1>
      <form onSubmit={handleSubmit}>
        <input aria-label="新しいタスク" value={draft} onChange={(e) => setDraft(e.target.value)} />
        <button type="submit">追加</button>
      </form>
      {todos.length === 0 ? (
        <p>タスクはありません</p>
      ) : (
        <ul>
          {todos.map((todo) => (
            <li key={todo.id}>
              <label>
                <input type="checkbox" checked={todo.completed} onChange={() => toggle(todo.id)} />
                <span style={todo.completed ? { textDecoration: 'line-through' } : undefined}>
                  {todo.title}
                </span>
              </label>
              <button type="button" aria-label={`「${todo.title}」を削除`} onClick={() => remove(todo)}>
                削除
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}

export default App
