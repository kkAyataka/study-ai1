import { useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { backupFileName, createBackup, readBackup } from './backup'
import {
  isOverdue,
  parseDueDateInput,
  parseSortOrder,
  SORT_ORDERS,
  sortTodos,
  toDateString,
  type SortOrder,
  type Todo,
} from './todo'
import { useTodos } from './useTodos'

function App() {
  const { todos, add, toggle, setDueDate, remove, replaceAll } = useTodos()
  const [draft, setDraft] = useState('')
  const [draftDueDate, setDraftDueDate] = useState('')
  const [sortOrder, setSortOrder] = useState<SortOrder>(SORT_ORDERS[0])
  const [incompleteOnly, setIncompleteOnly] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!add(draft, draftDueDate)) return
    setDraft('')
    setDraftDueDate('')
  }

  // 保存すると読み戻せなくなる値（5桁の年など）は受け付けない。日付欄は元の値のまま
  function changeDraftDueDate(value: string) {
    if (parseDueDateInput(value) !== undefined) setDraftDueDate(value)
  }

  function confirmRemove(todo: Todo) {
    if (!window.confirm(`「${todo.title}」を削除しますか？`)) return
    remove(todo.id)
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
    replaceAll(result.todos)
  }

  // 描き直すたびに今日の日付と比べて期限切れを決める（日付をまたいでも次の操作で反映される）
  // oxlint-disable-next-line react/purity
  const today = toDateString(new Date())
  const visibleTodos = sortTodos(incompleteOnly ? todos.filter((t) => !t.completed) : todos, sortOrder)

  return (
    <main className="app">
      <h1>ToDo</h1>
      <form className="add-form" onSubmit={handleSubmit}>
        <input aria-label="新しいタスク" value={draft} onChange={(e) => setDraft(e.target.value)} />
        <input
          type="date"
          aria-label="新しいタスクの期限日"
          value={draftDueDate}
          onChange={(e) => changeDraftDueDate(e.target.value)}
        />
        <button type="submit">追加</button>
      </form>
      <div className="view-options">
        <label>
          並び順
          <select value={sortOrder} onChange={(e) => setSortOrder(parseSortOrder(e.target.value) ?? sortOrder)}>
            {SORT_ORDERS.map((order) => (
              <option key={order} value={order}>
                {order}
              </option>
            ))}
          </select>
        </label>
        <label>
          <input type="checkbox" checked={incompleteOnly} onChange={(e) => setIncompleteOnly(e.target.checked)} />
          未完了だけ表示
        </label>
      </div>
      {todos.length === 0 ? (
        <p className="empty">タスクはありません</p>
      ) : visibleTodos.length === 0 ? (
        <p className="empty">未完了のタスクはありません</p>
      ) : (
        <ul className="todo-list">
          {visibleTodos.map((todo) => (
            <li key={todo.id}>
              <label>
                <input type="checkbox" checked={todo.completed} onChange={() => toggle(todo.id)} />
                <span
                  style={
                    todo.completed
                      ? { textDecoration: 'line-through' }
                      : isOverdue(todo, today)
                        ? { color: 'rgb(198, 40, 40)' }
                        : undefined
                  }
                >
                  {todo.title}
                </span>
              </label>
              <input
                type="date"
                aria-label={`「${todo.title}」の期限日`}
                value={todo.dueDate ?? ''}
                onChange={(e) => setDueDate(todo.id, e.target.value)}
              />
              <button type="button" aria-label={`「${todo.title}」を削除`} onClick={() => confirmRemove(todo)}>
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
