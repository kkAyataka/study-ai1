import { useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { backupFileName, createBackup, readBackup } from './backup'
import { loadTodos, saveTodos } from './storage'
import type { Todo } from './todo'

function App() {
  const [todos, setTodos] = useState<Todo[]>(loadTodos)
  const [draft, setDraft] = useState('')
  const [importError, setImportError] = useState<string | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)

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

  function handleExport() {
    const blob = new Blob([createBackup(todos)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = backupFileName(new Date())
    link.click()
    URL.revokeObjectURL(url)
  }

  async function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    const result = readBackup(await file.text())
    if (!result.ok) {
      setImportError(result.error)
      return
    }
    setImportError(null)
    if (!window.confirm('今のタスクは全部消えて、ファイルの内容に置き換わります。読み込みますか？')) return
    update([...result.todos].sort((a, b) => b.createdAt.localeCompare(a.createdAt)))
  }

  return (
    <main className="app">
      <h1>ToDo</h1>
      <form className="add-form" onSubmit={handleSubmit}>
        <input aria-label="新しいタスク" value={draft} onChange={(e) => setDraft(e.target.value)} />
        <button type="submit">追加</button>
      </form>
      {todos.length === 0 ? (
        <p className="empty">タスクはありません</p>
      ) : (
        <ul className="todo-list">
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
      <footer className="backup">
        <button type="button" onClick={handleExport}>
          書き出し
        </button>
        <button type="button" onClick={() => fileInput.current?.click()}>
          読み込み
        </button>
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={handleImport}
        />
        {importError && <p role="alert">{importError}</p>}
      </footer>
    </main>
  )
}

export default App
