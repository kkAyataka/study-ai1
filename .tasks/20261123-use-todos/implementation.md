# 作業の記録

## 1. spec を作る（/to-spec）

- [docs/agents/issue-tracker.md](../../docs/agents/issue-tracker.md) と [docs/agents/triage-labels.md](../../docs/agents/triage-labels.md) を読み、投稿先が `kkAyataka/study-ai1` で `ready-for-agent` ラベルがあることを確かめた。
- テストを書く場所は、設計の Q7 で決めたとおり画面全体（`App`）だけにした。
- spec を issue [#4](https://github.com/kkAyataka/study-ai1/issues/4) として作った（ユーザーストーリー24件、実装の決定、テストの決定、スコープ外）。
- 「開いただけでは保存しない」は既存のテストで確かめていなかった。そこで、画面テストを1件足してもよいことを spec に書いた。

## 2. 実装（/implement、/tdd）

1. 変更の前に `npm run check` が通ることを確かめた（テスト63本）。
2. 画面テスト「開いただけでは保存しないので、読めない保存データも空の一覧で上書きされない」を足した。今のコードがすでにそのふるまいなので、最初から通った（ふるまいを固定するテスト）。
3. [src/useTodos.ts](../../src/useTodos.ts) を作った。
   - interface は `todos`・`add`・`toggle`・`setDueDate`・`remove`・`replaceAll`
   - 中の状態遷移は、export しない純粋な関数で書いた
4. `App` を `useTodos` を使う形に書き換えた。確認ダイアログは `App` の `confirmRemove` に残し、module には `id` だけを渡す。
5. 型チェックと全テストが、既存のテストを変えずに通った。
6. `useTodos` に一時的に `useEffect` での保存を入れ、足したテストが失敗することを確かめてから元に戻した。
7. [docs/spec.md](../../docs/spec.md) の「保存先」に、操作の置き場所と「開いただけでは保存しない」理由を書いた。「テスト方針」も直した。

## 3. レビューと修正（/code-review）

Standards と Spec の2つのサブエージェントを同時に動かした。

| 観点 | 指摘 | 対応 |
| --- | --- | --- |
| Standards | README.md のディレクトリ構成に `useTodos.ts` がなく、`App.tsx` の説明が古い | 直した |
| Standards・Spec | spec.md の「テスト方針」で、`useTodos` の範囲が「保存先」の節と食い違い、画面テストが何を確かめるかが浅い | 操作の範囲をそろえ、作成順と保存のタイミングも画面テストで確かめると書いた |
| Standards | `addTodo` の `now` 引数は、差し替える場面がない | 消して中で `new Date()` を使うようにした |
| Standards | hook の操作が純粋な関数に渡すだけ（Middle Man） | そのまま。設計の Q1 で決めた形 |
| Standards | 日付入力欄の生の値を hook に渡している | そのまま。設計の Q4 で決めた形 |
| Standards | `sortByCreatedAt` を `todo.ts` に置くべきでは | そのまま。作成順の約束はこの module が守るものなので |
| Spec・Standards | 保存できない期限日の扱いが変わった。前は期限日なしで追加していたが、今は追加しない | spec #4 どおり。下書きの日付欄が先に弾くので、画面からは通らない分岐で、見た目のふるまいは同じ |
| Spec | 作業記録がない | このフォルダを作った |

修正のあと `npm run check` とビルドが通った（テスト64本）。

## 4. コミット

- `main` に `11c47f2` としてコミットした。pre-commit のチェックが通った。
- ユーザーが diff を見たいと言ったので、`git reset --mixed` で2つのコミットを取り消し、未コミットの変更として diff ペインで見せた。
- 「コミットして push して」を受けて、作業ツリーが取り消したコミットと同じことを確かめた。そのうえで同じコミットに戻し（`11c47f2` のハッシュを保つため）、この記録を直して `origin/main` に push した。

## メモ

- 作業中に、別のセッションで `76eaa59`（npm min-release-age の作業記録）がコミットされていた。今回の変更とは関係ない。
- `/improve-codebase-architecture` の HTML レポートを開く `open` は、サンドボックスに止められた。ブラウザペインで開いて見せた。
