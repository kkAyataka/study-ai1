# 作業の記録

## 1. アーキテクチャのレビュー（/improve-codebase-architecture）

- `git log` で変更の多いファイルを数え、`App.tsx` と `App.test.tsx` がホットスポットだと分かった。
- GLOSSARY.md、docs/spec.md、`src/` のすべてのファイルを読んだ。`codebase-design` の用語は skill のファイルを直接読んで確かめた。
- 候補を3つ挙げ、Tailwind と Mermaid を使った HTML レポートを `$TMPDIR` に書いた（候補は [requirements.md](requirements.md) を参照）。
- `open` でレポートを開こうとしたが、サンドボックスに止められた。そこでブラウザペインで開いた。ユーザーはあとで自分で `open` を実行した。

## 2. 設計を詰める（/grilling）

- 2ラウンド・14問で設計を決めた。質問と回答は [requirements.md](requirements.md) を参照。
- 設計の要点：
  - interface は hook の `useTodos` だけにする
  - 保存は各操作の中で行い、`useEffect` は使わない
  - 保存先の seam は作らない
  - テストは画面テストのまま
- GLOSSARY.md への追加と ADR はなし。

## 3. spec を作る（/to-spec）

- [docs/agents/issue-tracker.md](../../docs/agents/issue-tracker.md) と [docs/agents/triage-labels.md](../../docs/agents/triage-labels.md) を読み、投稿先が `kkAyataka/study-ai1` で、`ready-for-agent` ラベルがあることを確かめた。
- spec を issue [#4](https://github.com/kkAyataka/study-ai1/issues/4) として作った（ユーザーストーリー24件、実装の決定、テストの決定、スコープ外）。

## 4. 実装（/implement、/tdd）

1. 変更の前に `npm run check` が通ることを確かめた（テスト63本）。
2. 画面テスト「開いただけでは保存しないので、読めない保存データも空の一覧で上書きされない」を足した。今のコードもすでにそう動くので、最初から通った。これは今のふるまいを固定するためのテスト。
3. [src/useTodos.ts](../../src/useTodos.ts) を作った。
   - interface は `todos`・`add`・`toggle`・`setDueDate`・`remove`・`replaceAll`。
   - 中の状態遷移は、export しない純粋な関数で書いた。
4. `App` を書き換えた。確認ダイアログは `App` の `confirmRemove` に残し、module には `id` だけを渡す。
5. 型チェックと全テストが、既存のテストを変えずに通った。
6. `useTodos` に一時的に `useEffect` での保存を入れると、足したテストが失敗した。これを確かめてから元に戻した。
7. docs/spec.md の「保存先」に、操作の置き場所と「開いただけでは保存しない」理由を書いた。「テスト方針」も直した。
8. `npm run check` とビルドが通った。

### 設計上のポイント

- 「保存しているタスクは常に作成順」という約束を、`useTodos` の `add`（先頭に足す）と `replaceAll`（並べ直す）で守っている。並び順の「作成順」は、これを当てにして配列をそのまま返す。
- `useEffect` で保存しないことは、spec の「保存先」に理由付きで書き、画面テストでも見張っている。

## 5. コードレビューと修正（/code-review）

- 作業中に、別のセッションが `76eaa59`（npm min-release-age の作業記録）をコミットしていた。今回の変更とは関係ないので、レビューの基準点は `76eaa59` にした。
- Standards と Spec の2つのサブエージェントを同時に動かした。

| 観点 | 指摘 | 対応 |
| --- | --- | --- |
| Standards | README.md のディレクトリ構成に `useTodos.ts` がなく、`App.tsx` の説明が古い | 直した |
| Standards・Spec | spec.md の「テスト方針」で、`useTodos` の範囲が「保存先」と食い違い、画面テストが何を確かめるかが浅い | 範囲をそろえ、作成順と保存のタイミングも画面テストで確かめると書いた |
| Standards | `addTodo` の `now` 引数は、差し替える場面がない | 消した |
| Standards | hook の操作が純粋な関数に渡すだけ（Middle Man） | そのまま。設計の Q1 で決めた形 |
| Standards | 日付入力欄の生の値を hook に渡している | そのまま。設計の Q4 で決めた形 |
| Standards | `sortByCreatedAt` を `todo.ts` に置くべきでは | そのまま。作成順の約束はこの module が守るものなので |
| Spec・Standards | 保存できない期限日の扱いが変わった（前は期限日なしで追加、今は追加しない） | spec #4 どおり。画面からは通らない分岐 |
| Spec | 作業記録がない | 手で書いた（あとで作り直した） |

修正のあと `npm run check` が通った（テスト64本）。

## 6. コミット、取り消し、push

1. 本体を `11c47f2`、手で書いた作業記録を `e6e0531` としてコミットした。pre-commit のチェックが通った。
2. ユーザーが「diff が見たいです。戻してください」と言った。`git reset --mixed 76eaa59` で2つのコミットを取り消し、未コミットの変更として diff ペインで見せた。
3. 「コミットしてpushしてください」を受けて、作業ツリーが取り消したコミットと同じことを確かめた。そのうえで `git reset --mixed e6e0531` で同じコミットに戻した。
4. 記録の「push はまだしていない」を直し、記録のコミットを amend した（`b435d37`）。
5. `origin/main` に push した（`76eaa59..b435d37`）。issue #4 が閉じた。GitHub Actions の公開は成功した。

## 7. 振り返り（/retro）

環境の改善候補を5つ挙げた。今回はどれも実施していない。

1. CLAUDE.md の `.tasks/` の行に、`/record-task` で作ることを書く（Claude が記録を手で書いてしまったため）
2. サンドボックスのネットワーク許可に `github.com` と `api.github.com` を足す
3. 「コミットの前に diff ペインで diff を見せる」をメモリに足す
4. README のディレクトリ構成表の漏れを見つけるスクリプトを `npm run check` に足す（または表を消す）
5. `/improve-codebase-architecture` の `open` がサンドボックスで止まる（取り込んだ skill なので変えない）

## 8. 作業記録の作り直し（/record-task）

- ユーザーの依頼で、Claude が `/record-task` を呼び出そうとした。しかし `disable-model-invocation` のため使えなかったので、ユーザーに実行してもらった。
- 手で書いていた記録を、skill の形式（`usage.md`、推奨と違う回答、独断で決めた点、確認していないこと）で書き直した。

## つまずいた点

- **`open` が使えない**: サンドボックスが macOS の `open` を止める。代わりにブラウザペインでレポートを開いた。
- **`gh` と `git push` のネットワーク**:
  - `gh` は単独のコマンドなら通った。ほかのコマンドとつなげるとサンドボックスの中で動き、`api.github.com` への通信が止められた。
  - `allowed_domains` を付けて動かすと、今度は TLS の証明書の検証エラー（`x509: OSStatus -26276`）になった。
  - そこで `gh` は単独で実行するようにした。
  - `git push` は `allowed_domains` に `github.com` を付けて通った。
- **途中で HEAD が進んだ**: 別のセッションが `76eaa59` をコミットしていた。今回の変更とは関係ないことを確かめてから、レビューの基準点にした。
- **`diff -` が使えない**: サンドボックスで標準入力からの `diff` が `Operation not permitted` になった。シェルの文字列比較で、ファイルが同じことを確かめた。
- **diff を見せる前にコミットした**: Q14 では「push の前に確認」としていたが、ユーザーは diff を見てからコミットしたかった。コミットを取り消して見せ、同じコミットに戻した。
- **作業記録を手で書いた**: CLAUDE.md の `.tasks/` の案内に `/record-task` が書かれておらず、Claude は過去の記録をまねて手で書いた。`usage.md` がなく、push の状態もすぐ古くなった。
- **英語で返した**: アーキテクチャのレビューと振り返りの報告を英語で書き、ユーザーに日本語に直すよう2回頼まれた。

## 確認したこと

- 既存のテストを変えずに、テスト64本、lint、型チェック、ビルドが通った。
- `useEffect` で保存する誤った実装で、足したテストが失敗した。
- push 後の GitHub Actions（Test and deploy）が成功した。
- issue #4 が閉じた。

## 確認していないこと・残っている課題

- 開発サーバーや公開URLの画面は、ブラウザで試していない。ふるまいを変えないリファクタリングなので、画面テストに任せた。
- アーキテクチャのレビューの候補2（一覧の見せ方）と候補3（書き出し・読み込み）は、手を付けていない。
- 振り返りの改善候補5つは、どれも未実施。
- 作り直したこの記録は、まだコミットしていない。
