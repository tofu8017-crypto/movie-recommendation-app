# クラウド同期機能のセットアップガイド

このガイドでは、Supabase + Clerk を使用したクラウド同期機能の設定方法を説明します。

## 1. Supabase プロジェクトの作成

### 1-1. アカウント作成
1. https://supabase.com/ にアクセス
2. 「Start your project」をクリックしてアカウント作成（GitHub連携がおすすめ）

### 1-2. 新規プロジェクトの作成
1. ダッシュボードで「New Project」をクリック
2. 以下を入力:
   - **Name**: `movie-recommender` (任意の名前でOK)
   - **Database Password**: 強力なパスワードを設定（メモしておく）
   - **Region**: `Northeast Asia (Tokyo)` を選択（日本に近いリージョン）
3. 「Create new project」をクリック（2-3分待つ）

### 1-3. データベースのマイグレーション実行
1. Supabase ダッシュボードの左メニューから「SQL Editor」を選択
2. 「New query」をクリック
3. `supabase/migrations/001_create_watched_movies_table.sql` の内容をコピー&ペースト
4. 「Run」ボタンをクリックして実行
5. 成功すると「Success. No rows returned」と表示される

### 1-4. API キーの取得
1. 左メニューから「Project Settings」→「API」を選択
2. 以下の値をコピー:
   - **Project URL**: `https://xxxxx.supabase.co` 形式
   - **anon public key**: `eyJhbGc...` で始まる長いキー

## 2. Clerk プロジェクトの作成

### 2-1. アカウント作成
1. https://clerk.com/ にアクセス
2. 「Start building for free」をクリックしてアカウント作成

### 2-2. アプリケーションの作成
1. ダッシュボードで「Create Application」をクリック
2. 以下を設定:
   - **Application name**: `Movie Recommender`
   - **Sign-in options**: **Google** のみチェック（他は不要）
3. 「Create application」をクリック

### 2-3. API キーの取得
1. 「API Keys」タブを開く（自動で表示される場合も）
2. 以下の値をコピー:
   - **Publishable key**: `pk_test_...` で始まるキー
   - **Secret key**: `sk_test_...` で始まるキー（絶対に公開しない！）

## 3. 環境変数の設定

### 3-1. ローカル開発用（.env.local）
プロジェクトルートの `.env.local` ファイルに以下を追加:

```bash
# TMDB API（既存）
TMDB_API_READ_ACCESS_TOKEN=your_existing_tmdb_token

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your_anon_key

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...your_publishable_key
CLERK_SECRET_KEY=sk_test_...your_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

### 3-2. 本番環境用（Vercel）
1. Vercel ダッシュボードを開く
2. プロジェクト → Settings → Environment Variables
3. 上記の環境変数を**1つずつ**追加:
   - Name: 変数名（例: `NEXT_PUBLIC_SUPABASE_URL`）
   - Value: 値を貼り付け
   - Environment: Production, Preview, Development すべてチェック
4. 「Save」をクリック

## 4. 動作確認

### 4-1. ローカルで確認
```bash
npm run dev
```

1. http://localhost:3000 を開く
2. 右上に「ログイン」ボタンが表示されることを確認
3. ログインボタンをクリックしてGoogle認証を試す
4. ログイン後、視聴済み映画を追加してみる
5. ブラウザのLocalStorageをクリアしてもログイン後にデータが復元されることを確認

### 4-2. Vercelで確認
1. Git にコミット&プッシュ
2. Vercel が自動デプロイ（3-5分）
3. デプロイされたURLで同様に動作確認

## トラブルシューティング

### エラー: "Missing Supabase environment variables"
- `.env.local` に環境変数が正しく設定されているか確認
- Next.js を再起動（`Ctrl+C` → `npm run dev`）

### ログインボタンが表示されない
- Clerk の環境変数が正しく設定されているか確認
- ブラウザのキャッシュをクリア

### データが同期されない
- Supabase のテーブルが正しく作成されているか確認（SQL Editor で `SELECT * FROM watched_movies` を実行）
- ブラウザのコンソールにエラーが出ていないか確認（F12 → Console タブ）

## セキュリティ注意事項

⚠️ **絶対に公開してはいけないもの**:
- `CLERK_SECRET_KEY`
- Supabase の `service_role key`（今回は使用していません）

✅ **公開しても問題ないもの**:
- `NEXT_PUBLIC_` で始まるすべての変数（フロントエンド用の公開キー）

---

質問や問題があれば、お気軽にお知らせください！
