import { fireEvent, render, screen, within } from '@testing-library/react'
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

async function addTodoWithDueDate(user: ReturnType<typeof userEvent.setup>, title: string, dueDate: string) {
  setDate(screen.getByLabelText('新しいタスクの期限日'), dueDate)
  await addTodo(user, title)
}

/** 一覧の上から順に、各行のチェックボックスの名前（タスクのタイトル）が expected どおりか確かめる */
function expectListOrder(expected: string[]) {
  const items = screen.getAllByRole('listitem')
  expect(items).toHaveLength(expected.length)
  expected.forEach((title, i) => {
    expect(within(items[i]).getByRole('checkbox', { name: title })).toBeInTheDocument()
  })
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
      await addTodoWithDueDate(user, '牛乳を買う', '2026-11-25')
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

    it('保存すると読み戻せなくなる期限日は受け付けず、開き直してもタスクが残る', async () => {
      const user = userEvent.setup()
      const { unmount } = render(<App />)
      setDate(screen.getByLabelText('新しいタスクの期限日'), '275760-01-01')
      expect(screen.getByLabelText('新しいタスクの期限日')).toHaveValue('')
      await addTodo(user, '牛乳を買う')
      setDate(screen.getByLabelText('「牛乳を買う」の期限日'), '2026-11-25')
      setDate(screen.getByLabelText('「牛乳を買う」の期限日'), '275760-01-01')
      expect(screen.getByLabelText('「牛乳を買う」の期限日')).toHaveValue('2026-11-25')
      unmount()

      render(<App />)
      expect(screen.getByLabelText('「牛乳を買う」の期限日')).toHaveValue('2026-11-25')
    })

    it('0001〜0099年の期限日も指定でき、開き直しても残る', async () => {
      const user = userEvent.setup()
      const { unmount } = render(<App />)
      await addTodo(user, '牛乳を買う')
      setDate(screen.getByLabelText('「牛乳を買う」の期限日'), '0050-01-01')
      unmount()

      render(<App />)
      expect(screen.getByLabelText('「牛乳を買う」の期限日')).toHaveValue('0050-01-01')
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
        await addTodoWithDueDate(user, title, dueDate)
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
      await addTodoWithDueDate(user, '本当は先月まで', '2026-11-01')
      expect(screen.getByLabelText('「本当は先月まで」の期限日')).toHaveValue('2026-11-01')
    })
  })

  describe('並び順', () => {
    it('初めは作成順で、期限日順を選ぶと期限日の早い順に並ぶ', async () => {
      const user = userEvent.setup()
      render(<App />)
      await addTodoWithDueDate(user, '25日まで', '2026-11-25')
      await addTodoWithDueDate(user, '30日まで', '2026-11-30')
      await addTodoWithDueDate(user, '20日まで', '2026-11-20')

      const sortOrder = screen.getByRole('combobox', { name: '並び順' })
      expect(sortOrder).toHaveDisplayValue('作成順')
      expectListOrder(['20日まで', '30日まで', '25日まで'])

      await user.selectOptions(sortOrder, '期限日順')
      expectListOrder(['20日まで', '25日まで', '30日まで'])
    })

    it('期限日順では期限日のないタスクが一番下に来て、期限日が同じものや期限日のないもの同士は作成順に並ぶ', async () => {
      const user = userEvent.setup()
      render(<App />)
      await addTodo(user, '期限日なし・古い')
      await addTodoWithDueDate(user, '25日まで・古い', '2026-11-25')
      await addTodoWithDueDate(user, '30日まで', '2026-11-30')
      await addTodo(user, '期限日なし・新しい')
      await addTodoWithDueDate(user, '25日まで・新しい', '2026-11-25')

      await user.selectOptions(screen.getByRole('combobox', { name: '並び順' }), '期限日順')
      expectListOrder([
        '25日まで・新しい',
        '25日まで・古い',
        '30日まで',
        '期限日なし・新しい',
        '期限日なし・古い',
      ])
    })

    it('期限日順のまま完了・期限日の変更と解除・追加をしても期限日の順に並び、作成順に戻せる', async () => {
      const user = userEvent.setup()
      render(<App />)
      await addTodoWithDueDate(user, '25日まで', '2026-11-25')
      await addTodoWithDueDate(user, '20日まで', '2026-11-20')
      const sortOrder = screen.getByRole('combobox', { name: '並び順' })
      await user.selectOptions(sortOrder, '期限日順')

      await user.click(screen.getByRole('checkbox', { name: '20日まで' }))
      expectListOrder(['20日まで', '25日まで'])
      expect(screen.getByText('20日まで')).toHaveStyle({ textDecoration: 'line-through' })

      setDate(screen.getByLabelText('「20日まで」の期限日'), '2026-11-30')
      expectListOrder(['25日まで', '20日まで'])

      await addTodoWithDueDate(user, '27日まで', '2026-11-27')
      expectListOrder(['25日まで', '27日まで', '20日まで'])
      expect(sortOrder).toHaveDisplayValue('期限日順')

      setDate(screen.getByLabelText('「27日まで」の期限日'), '')
      expectListOrder(['25日まで', '20日まで', '27日まで'])

      await user.selectOptions(sortOrder, '作成順')
      expectListOrder(['27日まで', '20日まで', '25日まで'])
    })

    it('期限日順でも期限切れのタスクは赤字になる', async () => {
      vi.useFakeTimers({ toFake: ['Date'] })
      vi.setSystemTime(new Date(2026, 10, 21, 12))
      const user = userEvent.setup()
      render(<App />)
      await addTodoWithDueDate(user, '昨日まで', '2026-11-20')
      await addTodoWithDueDate(user, '明日まで', '2026-11-22')
      await user.selectOptions(screen.getByRole('combobox', { name: '並び順' }), '期限日順')

      expectListOrder(['昨日まで', '明日まで'])
      expect(screen.getByText('昨日まで')).toHaveStyle({ color: OVERDUE_COLOR })
      expect(screen.getByText('明日まで')).not.toHaveStyle({ color: OVERDUE_COLOR })
    })

    it('期限日順にしていても、書き出しにはすべてのタスクが作成順で入る', async () => {
      const blobs: Blob[] = []
      URL.createObjectURL = vi.fn((blob: Blob) => {
        blobs.push(blob)
        return 'blob:backup'
      })
      URL.revokeObjectURL = vi.fn()
      vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
      const user = userEvent.setup()
      render(<App />)
      await addTodoWithDueDate(user, '20日まで', '2026-11-20')
      await addTodoWithDueDate(user, '25日まで', '2026-11-25')
      await user.selectOptions(screen.getByRole('combobox', { name: '並び順' }), '期限日順')

      await user.click(screen.getByRole('button', { name: '書き出し' }))
      const backup = JSON.parse(await blobs[0].text())
      expect(backup.todos.map((todo: { title: string }) => todo.title)).toEqual(['25日まで', '20日まで'])
    })

    it('期限日順にしていても、開き直すと作成順に戻り、タスクも作成順のまま残っている', async () => {
      const user = userEvent.setup()
      const { unmount } = render(<App />)
      await addTodoWithDueDate(user, '20日まで', '2026-11-20')
      await addTodoWithDueDate(user, '25日まで', '2026-11-25')
      await user.selectOptions(screen.getByRole('combobox', { name: '並び順' }), '期限日順')
      await user.click(screen.getByRole('checkbox', { name: '25日まで' }))
      unmount()

      render(<App />)
      expect(screen.getByRole('combobox', { name: '並び順' })).toHaveDisplayValue('作成順')
      expectListOrder(['25日まで', '20日まで'])
    })
  })
})
