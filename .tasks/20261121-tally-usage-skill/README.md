# トークン使用量の調査と集計スキル（tally-usage）の作成

- **日付:** 2026-11-21（JST 16:52〜17:30頃）
- **セッション:** Claude Code デスクトップアプリ（Code タブ）。これまでのタスクとは別のセッション（タイトル「計算の成り立ち」）
- **モデル:** Claude Opus 5.5（`claude-opus-5-5`）。Web ページの読み込みにサブエージェント（Claude Haiku 5.5）
- **成果物:** [.claude/skills/tally-usage/SKILL.md](../../.claude/skills/tally-usage/SKILL.md)（`/tally-usage` で呼び出す）と [scripts/tally_sessions.py](../../.claude/skills/tally-usage/scripts/tally_sessions.py)

## このフォルダのファイル

| ファイル | 内容 |
| --- | --- |
| [requirements.md](requirements.md) | 質問への回答で分かったことと、集計の単位・書き込み先を決めたやり取り |
| [implementation.md](implementation.md) | 集計スクリプトを育ててスキルにするまでの経緯 |
| [usage.md](usage.md) | `/usage` のレポート |

## 流れ

1. セッションの統計表示（トークン数と $5.95）がどう計算されているかを説明する
2. Pro プランと Team プラン（Standard 席）の使用量の上限を、公式ページで調べる
3. 実際に使ったトークン量を確認する方法を説明する
4. 手元のログ（`~/.claude/projects/`）から今月のトークン量を集計する
5. セッションごと・依頼ごとの集計に広げ、日時付きで CSV に出す
6. ユーザーの選んだ「セッションごと、指定した CSV に追記」をスキルにする
7. コミットして `main` にプッシュする

## 結果

- `/tally-usage` で、毎回 CSV のパスを聞いてから、セッションごとのトークン量を書き込めるようになった
- CSV にすでにあるセッションは上書き、ないセッションは追記、ログが消えたセッションの行は残る

## コミット

| コミット | 内容 |
| --- | --- |
| `b3220b6` | tally-usage スキル（SKILL.md と集計スクリプト）。`origin/main` にプッシュ済み |
