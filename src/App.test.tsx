import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import App from './App'

async function addTodo(user: ReturnType<typeof userEvent.setup>, title: string) {
  await user.type(screen.getByRole('textbox', { name: '新しいタスク' }), title)
  await user.click(screen.getByRole('button', { name: '追加' }))
}

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
})
