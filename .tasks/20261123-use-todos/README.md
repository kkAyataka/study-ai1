# タスクの操作と保存を useTodos にまとめる

- **日付:** 2026-11-23（JST 午後。アーキテクチャのレビューは 14:40 頃、コミットしたのが 15:31）
- **セッション:** Claude Code デスクトップアプリ（Code タブ）
- **モデル:** Claude Opus 5.5（`claude-opus-5-5`）
- **成果物:**
  - [src/useTodos.ts](../../src/useTodos.ts)（新規）と [src/App.tsx](../../src/App.tsx) の書き換え
  - [src/App.test.tsx](../../src/App.test.tsx) のテスト1件（開いただけでは保存しない）
  - [docs/spec.md](../../docs/spec.md) の「保存先」と「テスト方針」、[README.md](../../README.md) のディレクトリ構成
  - GitHub issue：spec の [#4](https://github.com/kkAyataka/study-ai1/issues/4)

## このフォルダのファイル

| ファイル | 内容 |
| --- | --- |
| [requirements.md](requirements.md) | アーキテクチャのレビューの候補と、`/grilling` で設計を決めたときの質問と回答の記録 |
| [implementation.md](implementation.md) | spec の作成、実装、レビューと修正、コミットまでの作業の記録 |

`/usage` は実行していないので、`usage.md` は作っていない。

## 流れ

1. `/improve-codebase-architecture`：コミット履歴から `App.tsx` がホットスポットだと分かり、深くする候補を3つ挙げた HTML レポートを作る
2. 候補1「タスク一覧の module を深くする」を選び、`/grilling` で設計を詰める（14問、2ラウンド）
3. `/to-spec`：設計を spec にまとめ、issue #4 として公開する（`ready-for-agent`）
4. `/implement`：画面テストを seam にして `useTodos` を作り、`App` から使う
5. `/code-review`：Standards と Spec の2つの観点でレビューし、指摘を直してコミットする
6. diff を見るために一度コミットを取り消し、見てもらったあと同じコミットに戻して push する

## 結果

- タスクの操作と保存が `useTodos` 1か所にまとまり、`App` は描画と画面のふるまいだけになった
- 利用者から見たふるまいは変わっていない。既存のテストは変更なしで全部通った（テストは63本から64本）
- lint、型チェック、ビルドが通っている

## コミット

| コミット | 内容 |
| --- | --- |
| `11c47f2` | タスクの操作と保存を `useTodos` にまとめる。`Closes #4` |

作業記録のコミットと一緒に `origin/main` に push 済み。push の前に、ユーザーが diff を見るために2つのコミットを一度取り消し、同じコミットに戻している。
