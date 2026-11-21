import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import App from './App'

async function addTodo(user: ReturnType<typeof userEvent.setup>, title: string) {
  await user.type(screen.getByRole('textbox', { name: '新しいタスク' }), title)
  await user.click(screen.getByRole('button', { name: '追加' }))
}

function setDate(input: HTMLElement, value: string) {
  fireEvent.change(input, { target: { value } })
}

const OVERDUE_COLOR = 'rgb(198, 40, 40)'

describe('App', () => {
  it('タスクがなければ「タスクはありません」と表示する', () => {
    render(<App />)
    expect(screen.getByText('タスクはありません')).toBeInTheDocument()
  })

  it('入力したタスクを追加できる', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.type(screen.getByRole('textbox', { name: '新しいタスク' }), '牛乳を買う')
    await user.click(screen.getByRole('button', { name: '追加' }))
    expect(screen.getByRole('listitem')).toHaveTextContent('牛乳を買う')
    expect(screen.queryByText('タスクはありません')).not.toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: '新しいタスク' })).toHaveValue('')
  })

  it('前後の空白を取り除いて追加し、空白だけなら追加しない', async () => {
    const user = userEvent.setup()
    render(<App />)
    await addTodo(user, '   ')
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument()
    await addTodo(user, '  請求書を払う  ')
    expect(screen.getByText('請求書を払う', { normalizer: (text) => text })).toBeInTheDocument()
  })

  it('新しいタスクが一番上に表示される', async () => {
    const user = userEvent.setup()
    render(<App />)
    await addTodo(user, '一つ目')
    await addTodo(user, '二つ目')
    const items = screen.getAllByRole('listitem')
    expect(items[0]).toHaveTextContent('二つ目')
    expect(items[1]).toHaveTextContent('一つ目')
  })

  it('完了と未完了を切り替えられ、完了したタスクには取り消し線が付く', async () => {
    const user = userEvent.setup()
    render(<App />)
    await addTodo(user, '牛乳を買う')
    const checkbox = screen.getByRole('checkbox', { name: '牛乳を買う' })
    expect(checkbox).not.toBeChecked()
    await user.click(checkbox)
    expect(checkbox).toBeChecked()
    expect(screen.getByText('牛乳を買う')).toHaveStyle({ textDecoration: 'line-through' })
    await user.click(checkbox)
    expect(checkbox).not.toBeChecked()
  })

  it('削除は確認してから行い、キャンセルすれば残る', async () => {
    const user = userEvent.setup()
    const confirm = vi.spyOn(window, 'confirm')
    render(<App />)
    await addTodo(user, '牛乳を買う')

    confirm.mockReturnValueOnce(false)
    await user.click(screen.getByRole('button', { name: '「牛乳を買う」を削除' }))
    expect(confirm).toHaveBeenCalledWith('「牛乳を買う」を削除しますか？')
    expect(screen.getByRole('listitem')).toBeInTheDocument()

    confirm.mockReturnValueOnce(true)
    await user.click(screen.getByRole('button', { name: '「牛乳を買う」を削除' }))
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument()
    expect(screen.getByText('タスクはありません')).toBeInTheDocument()
  })

  it('開き直しても追加・完了したタスクが残っている', async () => {
    const user = userEvent.setup()
    const { unmount } = render(<App />)
    await addTodo(user, '牛乳を買う')
    await user.click(screen.getByRole('checkbox', { name: '牛乳を買う' }))
    unmount()

    render(<App />)
    expect(screen.getByRole('checkbox', { name: '牛乳を買う' })).toBeChecked()
  })

  describe('期限日', () => {
    it('追加するときに期限日を指定でき、追加後は日付欄も空に戻る', async () => {
      const user = userEvent.setup()
      render(<App />)
      setDate(screen.getByLabelText('新しいタスクの期限日'), '2026-11-25')
      await addTodo(user, '牛乳を買う')
      expect(screen.getByLabelText('「牛乳を買う」の期限日')).toHaveValue('2026-11-25')
      expect(screen.getByLabelText('新しいタスクの期限日')).toHaveValue('')
    })

    it('期限日を指定しなければ期限日なしで追加される', async () => {
      const user = userEvent.setup()
      render(<App />)
      await addTodo(user, '牛乳を買う')
      expect(screen.getByLabelText('「牛乳を買う」の期限日')).toHaveValue('')
    })

    it('一覧で期限日を変更・解除でき、開き直しても残る', async () => {
      const user = userEvent.setup()
      const { unmount } = render(<App />)
      await addTodo(user, '牛乳を買う')
      await addTodo(user, '請求書を払う')
      setDate(screen.getByLabelText('「牛乳を買う」の期限日'), '2026-11-25')
      setDate(screen.getByLabelText('「請求書を払う」の期限日'), '2026-11-30')
      setDate(screen.getByLabelText('「請求書を払う」の期限日'), '')
      unmount()

      render(<App />)
      expect(screen.getByLabelText('「牛乳を買う」の期限日')).toHaveValue('2026-11-25')
      expect(screen.getByLabelText('「請求書を払う」の期限日')).toHaveValue('')
    })

    it('期限日の翌日以降も未完了なら期限切れとして赤字になり、当日・完了済み・期限日なしはならない', async () => {
      vi.useFakeTimers({ toFake: ['Date'] })
      vi.setSystemTime(new Date(2026, 10, 21, 23, 59))
      const user = userEvent.setup()
      render(<App />)
      await addTodo(user, '期限日なし')
      for (const [title, dueDate] of [
        ['昨日まで', '2026-11-20'],
        ['今日まで', '2026-11-21'],
        ['昨日まで・完了', '2026-11-20'],
      ]) {
        setDate(screen.getByLabelText('新しいタスクの期限日'), dueDate)
        await addTodo(user, title)
      }
      await user.click(screen.getByRole('checkbox', { name: '昨日まで・完了' }))

      expect(screen.getByText('昨日まで')).toHaveStyle({ color: OVERDUE_COLOR })
      expect(screen.getByText('今日まで')).not.toHaveStyle({ color: OVERDUE_COLOR })
      expect(screen.getByText('昨日まで・完了')).not.toHaveStyle({ color: OVERDUE_COLOR })
      expect(screen.getByLabelText('「昨日まで・完了」の期限日')).toHaveValue('2026-11-20')
      expect(screen.getByText('期限日なし')).not.toHaveStyle({ color: OVERDUE_COLOR })
    })

    it('今日より前の日付も期限日に指定できる', async () => {
      vi.useFakeTimers({ toFake: ['Date'] })
      vi.setSystemTime(new Date(2026, 10, 21, 12))
      const user = userEvent.setup()
      render(<App />)
      setDate(screen.getByLabelText('新しいタスクの期限日'), '2026-11-01')
      await addTodo(user, '本当は先月まで')
      expect(screen.getByLabelText('「本当は先月まで」の期限日')).toHaveValue('2026-11-01')
    })
  })
})
