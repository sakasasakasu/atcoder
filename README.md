# AtCoder 精進ポータル

AtCoder での競技プログラミング精進の記録を、管理し、静的サイトとして自動公開しています。

> 🔗 **公開サイト**: https://sakasasakasu.github.io/atcoder/

## できること

- **問題一覧** — ABC の各回ごとに解答コード（C++）と感想を記録。難易度は AtCoder Problems API から自動取得して表示
- **解法メモ** — 解法をメモすることができる
- **Tips** — 短い小ネタ・コツを一覧できる
- **ライブラリ** — テンプレートをまとめる
- **AI レビュー** — Gemini API で問題ごとのレビューを自動生成

## 技術スタック

| 分類 | 技術 |
|---|---|
| フレームワーク | Next.js / React / TypeScript |
| スタイリング | Tailwind CSS / shadcn/ui |
| CI/CD | GitHub Actions → GitHub Pages |
| LLM | Google Gemini API |

## 新しい問題を追加する

リポジトリ直下の CLI で雛形を生成できます（手作業でのファイル作成は不要）:

```bash
# 基本（README.md を生成）
./new-abc 471

# 生成内容のプレビュー（ファイルは作成しない）
./new-abc 471 --dry-run

# 解答コードの雛形も A〜D まで生成（よく使う組み合わせ）
./new-abc 471 --cpp --problems ABCD

# 感想を入れて生成
./new-abc 471 --summary "今回は2完"
```

生成されるファイル:

```
content/problems/ABC/ABC471/
├── README.md        # 問題一覧の元データ。`## A問題` のようなセクションを含む
├── A.cpp            # A問題の解答コード
├── A1.cpp           # （任意）A問題の別解コード
└── B.cpp            # B問題の解答コード
```

### オプション

| オプション | 内容 |
|---|---|
| `-p, --problems <文字列>` | 生成する問題セクション（例: `A-C`, `ABCD`。デフォルト `A-G`）。重複は除去し、A〜G 以外はエラー |
| `-s, --summary <テキスト>` | 感想欄の初期テキスト |
| `--cpp` | `X.cpp` の雛形も生成 |
| `-d, --dry-run` | ファイルを作らず生成予定を表示 |
| `-h, --help` | ヘルプを表示 |

### ルール

- コンテスト ID は `ABC###` または `###`（3桁）形式のみ受け付けます（実在確認は行いません）
- 既に同じディレクトリ・ファイルが存在する場合は上書きせずエラーになります
- 生成コマンドが Git 操作（add / commit / push）を実行することはありません

### セクションの追加

`content/problems/` 直下の各ディレクトリが「セクション」です。サブディレクトリ（コンテスト形式）または直下の `.cpp`（典型形式）が自動で拾われるため、`ARC/` などを追加するだけで一覧に反映されます。詳しくは [`content/problems/README.md`](content/problems/README.md) を参照してください。

## 解法・Tips・ライブラリを追加する

`content/solutions/` / `content/tips/` にグループディレクトリと `.md` を、`content/library/` にカテゴリディレクトリと `.md` を置くだけです。表示には JSON の再生成が必要です。

```
content/solutions/
├── README.md          # このファイルは解析対象外
└── 典型テクニック/
    ├── ダイクストラ法.md
    └── ダイクストラ法.cpp   # （任意）コードがあるとモーダルで表示
```

- 各グループの `README.md` は解析対象外です
- ファイル先頭の `# タイトル` は解法のタイトルとして扱われます
- 本文では `$...$`（インライン）と、独立行の `$$` ブロック数式が LaTeX として使えます

## メンション記法で問題と解法をリンクする

`.md` 内に `[[対象ID]]` と書くと、JSON 生成時に自動でハイパーリンクになり、対象側にはバックリンクのタグが付きます（`.md` 自体は編集されません）。

- 問題 ID: `[[ABC471-A]]` / `[[典型-002]]`（コンテストID-問題ID）
- 解法 ID: `[[ダイクストラ法]]`（ファイル名。グループ間で一意にする）

```markdown
# ダイクストラ法

[[ABC471-A]] で初めて使った。
```

- 問題カード側に「解法: ダイクストラ法」タグが付きます
- 逆に問題の `README.md` 内で `[[ダイクストラ法]]` と書けば、解法カード側にタグが付きます

## ローカル開発

```bash
cd portfolio
npm install
npm run dev        # predev で JSON 再生成 → http://localhost:3000
npm run build      # 本番ビルド（prebuild で JSON 再生成）
npm test           # scripts/ のユニットテスト
npm run generate   # JSON 生成のみ実行
```
