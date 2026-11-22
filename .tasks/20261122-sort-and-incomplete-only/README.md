# 期限日順の並び替えと「未完了だけ表示」

- **日付:** 2026-11-22（JST 夜。開始時刻は記録がない。spec の issue #1 を作ったのが 22:00、振り返りを終えたのが 23:00頃）
- **セッション:** Claude Code デスクトップアプリ（Code タブ）
- **モデル:** Claude Opus 5.5（`claude-opus-5-5`）
- **成果物:**
  - 並び替えと絞り込みの機能（[src/](../../src/)）
  - [GLOSSARY.md](../../GLOSSARY.md) の「作成順」「期限日順」「未完了だけ表示」
  - [docs/spec.md](../../docs/spec.md) の「並び替え」「未完了だけ表示」の節、[README.md](../../README.md) の機能一覧
  - GitHub issue：spec の [#1](https://github.com/kkAyataka/study-ai1/issues/1)、チケットの [#2](https://github.com/kkAyataka/study-ai1/issues/2)（期限日順の並び替え）と [#3](https://github.com/kkAyataka/study-ai1/issues/3)（未完了だけ表示）。3つとも閉じた
  - 公開URL（https://kkayataka.github.io/study-ai1/ ）への反映

## このフォルダのファイル

| ファイル | 内容 |
| --- | --- |
| [requirements.md](requirements.md) | `/grill-with-docs` で仕様を決めたときと、`/to-spec`・`/to-tickets` で確認したときの質問と回答の記録 |
| [implementation.md](implementation.md) | spec とチケットの作成、#2 と #3 の TDD での実装、2回のレビューと修正、push、振り返りまでの作業の記録 |
| [usage.md](usage.md) | `/usage` のレポート |

決まった仕様そのものは [docs/spec.md](../../docs/spec.md) と issue [#1](https://github.com/kkAyataka/study-ai1/issues/1) に、用語は [GLOSSARY.md](../../GLOSSARY.md) にまとめています。

## 流れ

1. `/grill-with-docs`：仕様を質問形式で固める（15問、2ラウンド）。決まった用語を GLOSSARY.md に書く
2. `/to-spec`：テストを書く場所（App だけ）を確認し、spec を issue #1 にする
3. `/to-tickets`：#1 をチケット2枚（#2 → #3）に分け、sub-issue と依存関係を付けて登録する
4. GLOSSARY.md をコミットして push する
5. `/tdd`：#2 期限日順の並び替えを実装する
6. `/code-review`：#2 を Standards と Spec の2つの観点でレビューし、指摘を直してコミット・push する（#2 が閉じる）
7. `/tdd`：#3 未完了だけ表示を実装する
8. `/code-review`：#3 をレビューし、指摘を直してコミット・push する（#3 が閉じる）
9. 親の #1 にコメントして閉じる
10. `/retro`：環境の改善候補を5つ挙げる（今回はどれも実施しない）

## 結果

- 一覧の上に「並び順」のプルダウン（作成順／期限日順）と「未完了だけ表示」のチェックボックスができた。組み合わせて使える
- 並び替えと絞り込みは見せ方だけを変える。保存データと書き出しには、すべてのタスクが作成順で入る。開き直すと「作成順・すべて表示」に戻る
- テスト51本、lint、ビルドがすべて通っている。GitHub Actions の公開も3回とも成功した

## コミット

| コミット | 内容 |
| --- | --- |
| `cce0a05` | GLOSSARY.md に「作成順」「期限日順」「未完了だけ表示」を追加 |
| `ece52a5` | 期限日順の並び替え（レビューの指摘の修正を含む）。`Closes #2` |
| `cdf20d8` | 未完了だけ表示（レビューの指摘の修正を含む）。`Closes #3` |
