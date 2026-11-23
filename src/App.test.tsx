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

/**
 * 書き出しボタンを押し、書き出したファイルに入っているタスクのタイトルを順に返す。
 * テスト環境ではダウンロードできないので、ファイルの中身だけを受け取り、差し替えたものは押したあとで元に戻す
 */
async function exportTitles(user: ReturnType<typeof userEvent.setup>): Promise<string[]> {
  let exported: Blob | undefined
  const { createObjectURL, revokeObjectURL } = URL
  URL.createObjectURL = (file: Blob | MediaSource) => {
    exported = file as Blob
    return 'blob:backup'
  }
  URL.revokeObjectURL = () => {}
  const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
  try {
    await user.click(screen.getByRole('button', { name: '書き出し' }))
  } finally {
    URL.createObjectURL = createObjectURL
    URL.revokeObjectURL = revokeObjectURL
    click.mockRestore()
  }
  if (!exported) throw new Error('書き出されていない')
  const backup: { todos: { title: string }[] } = JSON.parse(await exported.text())
  return backup.todos.map((todo) => todo.title)
}

/** 読み込みボタンの先にあるファイル選択欄に、data を JSON にしたファイルを渡す */
async function importFile(user: ReturnType<typeof userEvent.setup>, data: unknown) {
  const input = document.querySelector<HTMLInputElement>('input[type="file"]')
  if (!input) throw new Error('ファイル選択欄がない')
  const file = new File([JSON.stringify(data)], 'todos.json', { type: 'application/json' })
  await user.upload(input, file)
}

const IMPORT_CONFIRM = '今のタスクは全部消えて、ファイルの内容に置き換わります。読み込みますか？'

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

  it('開いただけでは保存しないので、読めない保存データも空の一覧で上書きされない', () => {
    localStorage.setItem('study-ai1.todos', '{壊れた')
    render(<App />)
    expect(screen.getByText('タスクはありません')).toBeInTheDocument()
    expect(localStorage.getItem('study-ai1.todos')).toBe('{壊れた')
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
      const user = userEvent.setup()
      render(<App />)
      await addTodoWithDueDate(user, '20日まで', '2026-11-20')
      await addTodoWithDueDate(user, '25日まで', '2026-11-25')
      await user.selectOptions(screen.getByRole('combobox', { name: '並び順' }), '期限日順')

      expect(await exportTitles(user)).toEqual(['25日まで', '20日まで'])
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

  describe('未完了だけ表示', () => {
    it('初めはオフで、オンにすると完了したタスクが隠れ、オフにすると戻る', async () => {
      const user = userEvent.setup()
      render(<App />)
      await addTodo(user, '牛乳を買う')
      await addTodo(user, '請求書を払う')
      await user.click(screen.getByRole('checkbox', { name: '牛乳を買う' }))

      const incompleteOnly = screen.getByRole('checkbox', { name: '未完了だけ表示' })
      expect(incompleteOnly).not.toBeChecked()
      expectListOrder(['請求書を払う', '牛乳を買う'])

      await user.click(incompleteOnly)
      expectListOrder(['請求書を払う'])

      await user.click(incompleteOnly)
      expectListOrder(['請求書を払う', '牛乳を買う'])
    })

    it('絞り込み中に完了にしたタスクはすぐに消え、追加・期限日の変更・削除は今までどおりでき、開き直しても残る', async () => {
      const user = userEvent.setup()
      vi.spyOn(window, 'confirm').mockReturnValue(true)
      const { unmount } = render(<App />)
      await addTodo(user, '牛乳を買う')
      await addTodo(user, '請求書を払う')
      await user.click(screen.getByRole('checkbox', { name: '未完了だけ表示' }))

      await user.click(screen.getByRole('checkbox', { name: '牛乳を買う' }))
      expectListOrder(['請求書を払う'])

      await addTodo(user, '本を返す')
      expectListOrder(['本を返す', '請求書を払う'])

      setDate(screen.getByLabelText('「本を返す」の期限日'), '2026-11-25')
      expect(screen.getByLabelText('「本を返す」の期限日')).toHaveValue('2026-11-25')

      await user.click(screen.getByRole('button', { name: '「請求書を払う」を削除' }))
      expectListOrder(['本を返す'])

      await user.click(screen.getByRole('checkbox', { name: '未完了だけ表示' }))
      expectListOrder(['本を返す', '牛乳を買う'])
      expect(screen.getByRole('checkbox', { name: '牛乳を買う' })).toBeChecked()
      unmount()

      render(<App />)
      expectListOrder(['本を返す', '牛乳を買う'])
      expect(screen.getByRole('checkbox', { name: '牛乳を買う' })).toBeChecked()
      expect(screen.getByLabelText('「本を返す」の期限日')).toHaveValue('2026-11-25')
    })

    it('未完了のタスクがなければ「未完了のタスクはありません」、タスクが1件もなければ「タスクはありません」と表示する', async () => {
      const user = userEvent.setup()
      vi.spyOn(window, 'confirm').mockReturnValue(true)
      render(<App />)
      await user.click(screen.getByRole('checkbox', { name: '未完了だけ表示' }))
      expect(screen.getByText('タスクはありません')).toBeInTheDocument()

      await addTodo(user, '牛乳を買う')
      await user.click(screen.getByRole('checkbox', { name: '牛乳を買う' }))
      expect(screen.queryByRole('listitem')).not.toBeInTheDocument()
      expect(screen.getByText('未完了のタスクはありません')).toBeInTheDocument()
      expect(screen.queryByText('タスクはありません')).not.toBeInTheDocument()

      await user.click(screen.getByRole('checkbox', { name: '未完了だけ表示' }))
      expect(screen.queryByText('未完了のタスクはありません')).not.toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: '「牛乳を買う」を削除' }))
      await user.click(screen.getByRole('checkbox', { name: '未完了だけ表示' }))
      expect(screen.getByText('タスクはありません')).toBeInTheDocument()
      expect(screen.queryByText('未完了のタスクはありません')).not.toBeInTheDocument()
    })

    it('期限日順と組み合わせると、未完了のタスクだけが期限日の順に並ぶ', async () => {
      const user = userEvent.setup()
      render(<App />)
      await addTodoWithDueDate(user, '25日まで', '2026-11-25')
      await addTodo(user, '期限日なし')
      await addTodoWithDueDate(user, '20日まで・完了', '2026-11-20')
      await addTodoWithDueDate(user, '22日まで', '2026-11-22')
      await user.click(screen.getByRole('checkbox', { name: '20日まで・完了' }))

      await user.selectOptions(screen.getByRole('combobox', { name: '並び順' }), '期限日順')
      await user.click(screen.getByRole('checkbox', { name: '未完了だけ表示' }))
      expectListOrder(['22日まで', '25日まで', '期限日なし'])
    })

    it('絞り込んでいても、開き直すとすべて表示に戻り、書き出しにはすべてのタスクが入る', async () => {
      const user = userEvent.setup()
      const { unmount } = render(<App />)
      await addTodo(user, '牛乳を買う')
      await addTodo(user, '請求書を払う')
      await user.click(screen.getByRole('checkbox', { name: '牛乳を買う' }))
      await user.click(screen.getByRole('checkbox', { name: '未完了だけ表示' }))

      expect(await exportTitles(user)).toEqual(['請求書を払う', '牛乳を買う'])
      unmount()

      render(<App />)
      expect(screen.getByRole('checkbox', { name: '未完了だけ表示' })).not.toBeChecked()
      expectListOrder(['請求書を払う', '牛乳を買う'])
    })
  })
  describe('読み込み', () => {
    const backup = {
      version: 2,
      todos: [
        { id: 'a', title: '古いタスク', completed: true, createdAt: '2026-11-01T00:00:00.000Z', dueDate: null },
        { id: 'b', title: '新しいタスク', completed: false, createdAt: '2026-11-10T00:00:00.000Z', dueDate: '2026-11-30' },
      ],
    }

    it('確認してから今のタスクを全部置き換え、作成日時の新しい順に並べ、開き直しても残る', async () => {
      const user = userEvent.setup()
      const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true)
      const { unmount } = render(<App />)
      await addTodo(user, '今のタスク')

      await importFile(user, backup)
      expect(confirm).toHaveBeenCalledWith(IMPORT_CONFIRM)
      await vi.waitFor(() => expectListOrder(['新しいタスク', '古いタスク']))
      expect(screen.getByRole('checkbox', { name: '古いタスク' })).toBeChecked()
      expect(screen.getByLabelText('「新しいタスク」の期限日')).toHaveValue('2026-11-30')
      unmount()

      render(<App />)
      expectListOrder(['新しいタスク', '古いタスク'])
    })

    it('確認でキャンセルすると今のタスクのまま', async () => {
      const user = userEvent.setup()
      const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false)
      render(<App />)
      await addTodo(user, '今のタスク')

      await importFile(user, backup)
      await vi.waitFor(() => expect(confirm).toHaveBeenCalled())
      expectListOrder(['今のタスク'])
    })

    it('正しくないファイルならエラーを表示して今のタスクに手を付けず、正しいファイルを読み込むとエラーが消える', async () => {
      const user = userEvent.setup()
      const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true)
      render(<App />)
      await addTodo(user, '今のタスク')

      await importFile(user, { version: 3, todos: [] })
      expect(await screen.findByRole('alert')).toHaveTextContent('対応していないデータ形式です。')
      expect(confirm).not.toHaveBeenCalled()
      expectListOrder(['今のタスク'])

      await importFile(user, backup)
      await vi.waitFor(() => expectListOrder(['新しいタスク', '古いタスク']))
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
  })
})
