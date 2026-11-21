# エージェントスキルの設定（setup-matt-pocock-skills）

- **日付:** 2026-11-21（JST 16:20頃〜16:30頃）
- **セッション:** Claude Code デスクトップアプリ（Code タブ）。ToDoアプリや記録スキルのタスクとは別のセッション
- **モデル:** Claude Opus 5.5（`claude-opus-5-5`）
- **成果物:** [CLAUDE.md](../../CLAUDE.md)、[docs/agents/](../../docs/agents/)（3ファイル）、GitHub の triage 用ラベル4つ

## このフォルダのファイル

| ファイル | 内容 |
| --- | --- |
| [requirements.md](requirements.md) | 課題管理の場所・ラベル・書き込み先ファイルを決めたやり取り |
| [implementation.md](implementation.md) | 調べたこと、書いたファイル、作ったラベルの記録 |
| [usage.md](usage.md) | `/usage` のレポート |

## 流れ

1. `/setup-matt-pocock-skills` を実行し、リポジトリの状態を調べる
2. 課題管理の場所、triage ラベル、`CLAUDE.md` と `AGENTS.md` のどちらに書くかを、まとめて質問する
3. テンプレートをもとに `docs/agents/` の3ファイルと `CLAUDE.md` を書き、GitHub にラベルを作る
4. ユーザーの依頼でコミットし、`main` にプッシュする

## 結果

- `to-tickets`、`to-spec`、`triage`、`wayfinder`、`implement` などのスキルが GitHub Issues（`kkAyataka/study-ai1`）を使うようになった
- `triage` 用の5つのラベルが GitHub にそろった（`wontfix` は既存）
- 用語集と ADR の置き場所は単一コンテキスト（ルートの `GLOSSARY.md` と `docs/adr/`）。どちらもまだ作っていない

## コミット

| コミット | 内容 |
| --- | --- |
| `7e0e0c4` | `CLAUDE.md` と `docs/agents/` の3ファイル（`origin/main` にプッシュ済み） |
