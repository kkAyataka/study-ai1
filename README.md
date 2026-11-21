# ToDo

自分ひとりで毎日使うための、シンプルなToDoアプリです。データはブラウザの localStorage に保存されます（サーバーやログインはありません）。

**公開URL:** https://kkayataka.github.io/study-ai1/

仕様と、その仕様にした理由は [docs/spec.md](docs/spec.md) にまとめています。

## 機能

- タスクの追加・一覧表示・完了チェック・削除（削除前に確認あり）
- JSONファイルへの書き出し・読み込み（バックアップと復元用）

## 技術スタック

- React + TypeScript + Vite
- テスト: Vitest + Testing Library（jsdom）
- Lint: oxlint
- 公開: GitHub Pages（GitHub Actions でデプロイ）

## 開発

```bash
npm install
npm run dev        # 開発サーバー（http://localhost:5173/study-ai1/）
npm test           # テストを1回実行
npm run test:watch # テストを監視モードで実行
npm run coverage   # カバレッジを計測（結果は端末と coverage/index.html）
npm run lint
npm run build      # dist/ に出力
```

開発用サーバー（localhost）と公開URLでは localStorage が別なので、開発中のデータが普段使いのデータに混ざることはありません。

## ディレクトリ構成

| ファイル | 役割 |
| --- | --- |
| `src/App.tsx` | 画面と操作（追加・完了・削除・書き出し・読み込み） |
| `src/storage.ts` | localStorage への保存と読み込み |
| `src/backup.ts` | 書き出しファイルの作成・ファイル名・読み込み |
| `src/todoData.ts` | 保存データの形式（バージョン付きJSON）と検証。storage と backup で共通 |
| `src/todo.ts` | `Todo` 型 |

テストは各ファイルの隣（`*.test.ts(x)`）にあります。

## デプロイ

`main` ブランチにプッシュすると、GitHub Actions（`.github/workflows/deploy.yaml`）が lint → テスト → ビルドを実行し、すべて通った場合だけ GitHub Pages に公開します。

ワークフローファイルを変更してプッシュするには、gh のトークンに `workflow` スコープが必要です。
