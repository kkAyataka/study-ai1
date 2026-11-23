# npm の min-release-age を7日に設定

- **日付:** 2026-11-23（JST 午前。開始時刻は記録がない。コミットしたのが 11:30）
- **セッション:** Claude Code デスクトップアプリ（Code タブ）
- **モデル:** Claude Opus 5.5（`claude-opus-5-5`）
- **成果物:** [.npmrc](../../.npmrc)（`min-release-age=7`）

## このフォルダのファイル

| ファイル | 内容 |
| --- | --- |
| [implementation.md](implementation.md) | 設定の追加、npm のバージョンの問題、コミット・push までの作業の記録 |
| [usage.md](usage.md) | `/usage` のレポート |

要件を決めるやり取りはなかったので、`requirements.md` は作っていない。

## 流れ

1. 「Node.jsのmin-release-ageを7に設定してください」を受けて、プロジェクトのルートに `.npmrc` を作り `min-release-age=7` を書く
2. 当時の npm 11.5.1 がこの設定を知らない（`Unknown project config` の警告が出る）ことを確かめ、npm のアップグレードが要ると伝える
3. ユーザーが npm を 11.21.3 に上げたあと、警告なしで値 `7` が読めることを確かめる
4. 「コミットしてプッシュして」を受けて、`main` にコミットして `origin/main` に push する

## 結果

- npm 11.21.3 で `npm config get min-release-age` が警告なしで `7` を返す
- pre-commit のチェック（oxlint、tsc、vitest の63本）が通った

## コミット

| コミット | 内容 |
| --- | --- |
| `624a0cb` | `.npmrc` を追加し、`min-release-age` を7日に設定 |

`origin/main` に push 済み（`f9344f6..624a0cb`）。
