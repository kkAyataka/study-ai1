# 仕様書と用語集の点検と修正

- **日付:** 2026-11-23（JST 午前。開始時刻は記録がない。コミットしたのが 10:53）
- **セッション:** Claude Code デスクトップアプリ（Code タブ）
- **モデル:** Claude Opus 5.5（`claude-opus-5-5`）
- **成果物:**
  - [docs/spec.md](../../docs/spec.md)、[GLOSSARY.md](../../GLOSSARY.md)、[README.md](../../README.md) の修正
  - 読み込むファイルの検証の強化（[src/backup.ts](../../src/backup.ts)）と、年0000の期限日を受け付けない修正（[src/todo.ts](../../src/todo.ts)）
  - テスト12本の追加（[src/App.test.tsx](../../src/App.test.tsx) の「読み込み」3本、[src/backup.test.ts](../../src/backup.test.ts) 8本、[src/storage.test.ts](../../src/storage.test.ts) 1本）
  - 公開URL（https://kkayataka.github.io/study-ai1/ ）への反映（push 済み。公開の結果は未確認）

## このフォルダのファイル

| ファイル | 内容 |
| --- | --- |
| [requirements.md](requirements.md) | 点検結果の修正案（A〜Cの13項目）と、どこまで反映するかの回答、Claude が独断で決めた点 |
| [implementation.md](implementation.md) | 点検の進め方、テストを先に書いてからの実装、ドキュメントの修正、コミット・push までの作業の記録 |
| [usage.md](usage.md) | `/usage` のレポート |

修正後の仕様そのものは [docs/spec.md](../../docs/spec.md) に、用語は [GLOSSARY.md](../../GLOSSARY.md) にあります。

## 流れ

1. 「仕様書や用語集の内容をチェックして修正案を考えて」を受けて、spec.md・GLOSSARY.md を実装とテストに照らして点検し、修正案を13項目（A：矛盾・古い記述、B：用語集、C：仕様の抜けと実装のずれ）にまとめる
2. 「A〜Cを反映」を受けて、C の実装変更を TDD で行う（テストを先に書き、失敗を確かめてから実装）
3. spec.md・README.md・GLOSSARY.md を直す
4. lint・テスト・ビルドを確かめ、2つのコミットに分けて `main` にコミットする
5. `origin/main` に push する

## 結果

- spec.md の矛盾（一覧表示と未完了だけ表示、読み込みの確認文言）と「バージョン」の二重の意味が解消した
- 用語集に「完了」「並び順」「絞り込み」「書き出し」「読み込み」「データ形式のバージョン」が入った
- 読み込むファイルで、`createdAt` の形式違い・空の `title`・`id` の重複をエラーにするようになった。localStorage の読み込みには、このチェックをかけない
- 年0000の期限日は正しくない期限日として扱うようになった
- テスト63本、lint、ビルドがすべて通っている

## コミット

| コミット | 内容 |
| --- | --- |
| `f9f301c` | 読み込むファイルの検証の強化、年0000の修正、読み込みの画面テスト、spec.md と README.md の修正 |
| `b7dc782` | GLOSSARY.md の用語の追加と定義の整理 |

どちらも `origin/main` に push 済み。
