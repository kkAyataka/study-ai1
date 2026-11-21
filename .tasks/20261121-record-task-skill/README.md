# タスク記録スキル（record-task）の作成

- **日付:** 2026-11-21（JST 16:11〜）
- **セッション:** Claude Code デスクトップアプリ（Code タブ）。[ToDoアプリ MVP](../20261121-todo-app-mvp/README.md) と同じセッション
- **モデル:** Claude Opus 5.5（`claude-opus-5-5`）
- **成果物:** [.claude/skills/record-task/SKILL.md](../../.claude/skills/record-task/SKILL.md)（`/record-task` で呼び出す）

## このフォルダのファイル

| ファイル | 内容 |
| --- | --- |
| [requirements.md](requirements.md) | 使用量の残し方を決めたやり取り |
| [implementation.md](implementation.md) | スキル作成の経緯と、作り直した点 |
| [usage.md](usage.md) | `/usage` のレポート |

## 流れ

1. 直前のタスク記録（`.tasks/20261121-todo-app-mvp/`）の作り方を、手動呼び出しのスキルにする
2. 最初の版では、使用量を Python スクリプトでセッションログから集計した
3. ユーザーから「`/usage` の結果をそのまま保存できないか。Python は保守が大変」と指摘を受ける
4. Python スクリプトを削除し、ユーザーに `/usage` のレポートを貼り付けてもらう手順に変えた
5. 作ったスキルで、このタスク自体の記録を作った（この記録）

## 結果

- `.claude/skills/record-task/SKILL.md` の1ファイルだけのスキルになった
- このタスクの記録を作ることで、スキルを初めて実際に使った

## コミット

このタスクではコミットしていない。スキルとこの記録は未コミットのまま。
