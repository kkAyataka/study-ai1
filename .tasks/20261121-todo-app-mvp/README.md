# ToDoアプリ MVP の作成

- **日付:** 2026-11-21（JST 15:17〜16:09）
- **セッション:** Claude Code デスクトップアプリ（Code タブ）
- **モデル:** Claude Opus 5.5（`claude-opus-5-5`）
- **成果物:** https://github.com/kkAyataka/study-ai1 / https://kkayataka.github.io/study-ai1/

## このフォルダのファイル

| ファイル | 内容 |
| --- | --- |
| [requirements.md](requirements.md) | `/grill-me` で要件を固めたときの質問と回答の記録 |
| [implementation.md](implementation.md) | 実装・テスト・公開までの作業の記録と、途中で起きた問題 |
| [usage.md](usage.md) | 使用トークン、推定コスト、プランの使用率 |

決まった仕様そのものは、リポジトリの [docs/spec.md](../../docs/spec.md) にまとめています。

## 流れ

1. `/grill-me` で要件を質問形式で固める（26問、5ラウンド）
2. Vite + React + TypeScript の土台を作り、Git を始める
3. テストする場所（App・storage・backup の3か所）を合意してから、TDD で実装する
4. ブラウザで動作を確認する
5. GitHub に公開リポジトリを作り、GitHub Actions で Pages に公開する
6. README.md と docs/spec.md を追加する

## 結果

- 最初のバージョンの4機能（追加・一覧表示・完了チェック・削除）と、書き出し・読み込みを実装した
- テスト21本、lint、ビルドがすべて通っている
- main へのプッシュで、テストが通った場合だけ自動公開される

## コミット

| コミット | 内容 |
| --- | --- |
| `083291c` | Vite + React + TypeScript の土台と Vitest |
| `6e1ebba` | localStorage への保存と、バックアップの検証 |
| `2eaddcb` | 追加・完了・削除・保存の画面 |
| `3710f15` | 書き出し・読み込みとスタイル |
| `7ffb994` | デプロイ用ワークフロー（ユーザーが GitHub 上で追加） |
| `10a2cef` | README と仕様書 |
