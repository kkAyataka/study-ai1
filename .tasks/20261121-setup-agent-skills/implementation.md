# 作業の記録

## 1. 調べたこと

| 項目 | 結果 |
| --- | --- |
| `git remote -v` | `origin` は `https://github.com/kkAyataka/study-ai1.git` |
| `gh repo view` | `kkAyataka/study-ai1`、Issues は有効 |
| `CLAUDE.md` / `AGENTS.md` | どちらもない |
| `GLOSSARY.md` / `CONTEXT.md` など | どれもない（古い名前からの改名は不要） |
| `docs/adr/`、`docs/agents/` | どちらもない |
| `.scratch/` | ない（ローカル Markdown での課題管理は使われていない） |
| `triage` スキル | `.claude/skills/triage` にある → ラベルの節を実行する |
| monorepo の兆候 | なし → 単一コンテキスト |
| 既存の GitHub ラベル | GitHub の初期ラベルだけ。`wontfix` は既にある |

## 2. 書いたファイル

スキルフォルダのテンプレート（`.claude/skills/setup-matt-pocock-skills/`）をそのままコピーした。

| ファイル | 元のテンプレート |
| --- | --- |
| [docs/agents/issue-tracker.md](../../docs/agents/issue-tracker.md) | `issue-tracker-github.md` |
| [docs/agents/triage-labels.md](../../docs/agents/triage-labels.md) | `triage-labels.md` |
| [docs/agents/domain.md](../../docs/agents/domain.md) | `domain.md` |

[CLAUDE.md](../../CLAUDE.md) は新しく作り、`## Agent skills` の節（課題管理、triage ラベル、用語集の3項目）だけを書いた。

## 3. GitHub のラベル

`gh label create` で、足りない4つを作った。`wontfix` は既存のものをそのまま使った。

| ラベル | 色 |
| --- | --- |
| `needs-triage` | `#fbca04` |
| `needs-info` | `#d876e3` |
| `ready-for-agent` | `#0e8a16` |
| `ready-for-human` | `#1d76db` |

作った後に `gh label list` で5つそろっていることを確認した。

## 4. コミットとプッシュ

- ユーザーの依頼で `CLAUDE.md` と `docs/agents/` をコミットした（`7e0e0c4`）。
- 続く依頼で `git push origin main` を実行した（`44addb0..7e0e0c4`）。

## つまずいた点

- 調べるときにシェルで `cd` したため、作業ディレクトリが一時的に `.agents/skills/setup-matt-pocock-skills` に変わった。`.claude/skills` の中身は `.agents/skills` を指しているらしい。その後のコマンドでは絶対パスで `cd` して対処した。実害はなかった。

## 確認したこと・確認していないこと

- 確認した：ラベル5つが GitHub にあること、プッシュが成功したこと。
- 確認していない：`to-tickets` や `triage` などのスキルが、実際にこの設定を読んで動くかどうか（まだ一度も使っていない）。

## 残っている課題・メモ

- `GLOSSARY.md` と `docs/adr/` はまだない。`/domain-modeling` などのスキルが、用語や決定が固まったときに作る。
- 外部の PR を triage の対象にしたいときは、`docs/agents/issue-tracker.md` の「PRs as a request surface」を `yes` にする。
- `CLAUDE.md` には今のところスキル設定の節しかない。プロジェクトの説明などを足すかどうかは未定。
