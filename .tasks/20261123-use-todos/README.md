# タスクの操作と保存を useTodos にまとめる

- **日付:** 2026-11-23（JST 午後。開始時刻は記録がない。アーキテクチャのレビューのレポートを作ったのが 14:42、コミットが 15:31、push が 15:37）
- **セッション:** Claude Code デスクトップアプリ（Code タブ）
- **モデル:** Claude Opus 5.5（`claude-opus-5-5`）
- **成果物:**
  - [src/useTodos.ts](../../src/useTodos.ts)（新規）と、それを使うように書き換えた [src/App.tsx](../../src/App.tsx)
  - [src/App.test.tsx](../../src/App.test.tsx) のテスト1件（開いただけでは保存しない）
  - [docs/spec.md](../../docs/spec.md) の「保存先」と「テスト方針」、[README.md](../../README.md) のディレクトリ構成
  - GitHub issue：spec の [#4](https://github.com/kkAyataka/study-ai1/issues/4)（`Closes #4` で閉じた）
  - 公開URL（https://kkayataka.github.io/study-ai1/ ）への反映

## このフォルダのファイル

| ファイル | 内容 |
| --- | --- |
| [requirements.md](requirements.md) | アーキテクチャのレビューの候補と、`/grilling` で設計を決めたときの質問と回答の記録 |
| [implementation.md](implementation.md) | レビュー、spec の作成、実装、コードレビュー、コミットと push、振り返りまでの作業の記録 |
| [usage.md](usage.md) | `/usage` のレポート |

決まった設計そのものは issue [#4](https://github.com/kkAyataka/study-ai1/issues/4) に、仕様は [docs/spec.md](../../docs/spec.md) にまとめています。

## 流れ

1. `/improve-codebase-architecture`：コミット履歴から `App.tsx` がホットスポットだと分かる。深くする候補を3つ挙げた HTML レポートを作る
2. 候補1「タスク一覧の module を深くする」を選び、`/grilling` で設計を詰める（14問、2ラウンド）
3. `/to-spec`：設計を spec にまとめ、issue #4 として公開する（`ready-for-agent`）
4. `/implement`：画面テストを seam にして `useTodos` を作り、`App` から使う
5. `/code-review`：Standards と Spec の2つの観点でレビューし、指摘を直してコミットする
6. ユーザーが diff を見るために、コミットを一度取り消す。見てもらったあと同じコミットに戻して push する
7. `/retro`：環境の改善候補を5つ挙げる（今回はどれも実施しない）
8. `/record-task`：手で書いていたこの記録を作り直す

## 結果

- タスクの操作と保存が `useTodos` 1か所にまとまった。`App` は描画と画面のふるまいだけになった
- 利用者から見たふるまいは変わっていない。既存のテストは変更なしで全部通った（テストは63本から64本）
- lint、型チェック、ビルドが通り、GitHub Actions の公開も成功した

## コミット

| コミット | 内容 |
| --- | --- |
| `11c47f2` | タスクの操作と保存を `useTodos` にまとめる。`Closes #4` |
| `b435d37` | 手で書いた最初の作業記録（この記録で作り直した） |

`origin/main` に push 済み（`76eaa59..b435d37`）。作り直したこの記録は、まだコミットしていない。
