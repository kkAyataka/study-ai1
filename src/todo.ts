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

/** 期限日の翌日になっても未完了なら期限切れ */
export function isOverdue(todo: Todo, today: string): boolean {
  return !todo.completed && todo.dueDate !== null && todo.dueDate < today
}
