# 企業調査レポートツール

企業名を入力するとClaudeのWeb検索機能で自動調査し、基本情報・決算データをまとめたレポートを生成・保存するWebアプリです。

## セットアップ手順

### 1. Supabaseのテーブルを作成する

1. https://app.supabase.com を開く
2. プロジェクトの「SQL Editor」を開く
3. `supabase-schema.sql` の内容を貼り付けて実行する

### 2. 環境変数を設定する

```bash
cp .env.local.example .env.local
```

`.env.local` を開いて以下の値を入力：

| 変数名 | 取得場所 |
|--------|----------|
| `ANTHROPIC_API_KEY` | https://console.anthropic.com/ |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → anon public |

### 3. 依存パッケージをインストールして起動

```bash
npm install
npm run dev
```

ブラウザで http://localhost:3000 を開く。

## Vercelへのデプロイ

1. GitHubにリポジトリを作成してpush（`.env.local` は `.gitignore` に含まれているので安全）
2. https://vercel.com でGitHubリポジトリをインポート
3. Vercelの「Environment Variables」に `.env.local` と同じ3つの変数を設定する
4. Deployボタンを押す

## 使用技術

- **フロントエンド**: Next.js 15 (App Router, TypeScript)
- **AI / Web検索**: Claude claude-opus-4-8 + `web_search_20260209` built-in tool
- **データベース**: Supabase (PostgreSQL)
- **デプロイ**: Vercel
