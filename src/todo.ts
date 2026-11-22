export type Todo = {
  id: string
  title: string
  completed: boolean
  createdAt: string
  /** 期限日（YYYY-MM-DD）。期限日なしなら null */
  dueDate: string | null
}

/** ローカル時刻での日付を YYYY-MM-DD で返す */
export function toDateString(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/** 実在する日付の YYYY-MM-DD 形式かどうか */
export function isDateString(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  // Date.UTC は 0〜99 年を 1900 年代として扱うので、年は setUTCFullYear で設定する
  const date = new Date(0)
  date.setUTCFullYear(year, month - 1, day)
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
}

/** 日付入力欄の値を期限日にする。空なら期限日なし（null）、保存できない値なら undefined */
export function parseDueDateInput(value: string): string | null | undefined {
  if (value === '') return null
  return isDateString(value) ? value : undefined
}

/** 期限日の翌日になっても未完了なら期限切れ */
export function isOverdue(todo: Todo, today: string): boolean {
  return !todo.completed && todo.dueDate !== null && todo.dueDate < today
}

/** 選べる並び順。先頭が初めに選ばれている並び順 */
export const SORT_ORDERS = ['作成順', '期限日順'] as const

export type SortOrder = (typeof SORT_ORDERS)[number]

/** プルダウンの値を並び順にする。並び順でない値なら undefined */
export function parseSortOrder(value: string): SortOrder | undefined {
  return SORT_ORDERS.find((order) => order === value)
}

/** 一覧に表示する順に並べたタスクを返す。もとの配列（作成順）は変えない */
export function sortTodos(todos: Todo[], order: SortOrder): Todo[] {
  if (order === '作成順') return todos
  // 期限日のないタスクは最後に回す。sort は安定なので、期限日が同じもの同士は作成順のまま
  return [...todos].sort((a, b) => {
    if (a.dueDate === b.dueDate) return 0
    if (a.dueDate === null) return 1
    if (b.dueDate === null) return -1
    return a.dueDate < b.dueDate ? -1 : 1
  })
}
