# ✅ セットアップチェックリスト

このチェックリストに従って、プロジェクトを段階的にセットアップしてください。

## 📋 事前準備（必須）

- [ ] Node.js 18+ をインストール
  ```bash
  node --version  # v18.0.0 以上か確認
  ```
- [ ] npm をインストール
  ```bash
  npm --version   # 9.0.0 以上か確認
  ```
- [ ] git をインストール（デプロイに必須）
  ```bash
  git --version
  ```
- [ ] テキストエディタ（VS Code 推奨）をインストール

## 🔑 LINE Bot の準備

### Step 1: LINE Business Account を作成

- [ ] [LINE Developers](https://developers.line.biz/ja/) にアクセス
- [ ] メールアドレスで登録
- [ ] メール確認を完了

### Step 2: Provider を作成

- [ ] 新規 Provider を作成
- [ ] Provider 名を入力 (例: "AssignmentBot")
- [ ] 確認を完了

### Step 3: Messaging API Channel を作成

- [ ] **Channel type**: Messaging API を選択
- [ ] **Display name**: "課題管理 Bot" などを入力
- [ ] **Description**: 説明を入力
- [ ] Channel を作成

### Step 4: 認証情報を取得

Channel Settings から以下を取得:

- [ ] **Channel Access Token** をコピー
  - 見つける場所: Messaging Settings → Channel access token
  - 例: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
  - ⚠️ **注意**: 絶対に他人に共有しない

- [ ] **Channel Secret** をコピー
  - 見つける場所: Channel Settings → Channel secret
  - 例: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
  - ⚠️ **注意**: 絶対に他人に共有しない

## 🗄️ Supabase の準備

### Step 1: Supabase アカウント作成

- [ ] [Supabase](https://supabase.com) にアクセス
- [ ] GitHub アカウントでサインアップ（推奨）
- [ ] メール確認を完了

### Step 2: 新規プロジェクト作成

- [ ] **New Project** をクリック
- [ ] **Organization** を選択
- [ ] **Project name**: "assignment-bot" などを入力
- [ ] **Database password**: 複雑なパスワードを設定
- [ ] **Region**: 東京 (Tokyo) を選択
- [ ] プロジェクトを作成
- [ ] プロジェクト初期化待ち（3-5分）

### Step 3: Database テーブルを作成

- [ ] Supabase ダッシュボードで SQL Editor を開く
- [ ] 以下を実行:

```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  deadline DATE NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  done BOOLEAN DEFAULT false
);

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_deadline ON tasks(deadline);
```

- [ ] SQL を実行
- [ ] エラーが出ないか確認

### Step 4: 認証情報を取得

- [ ] **Project URL** をコピー
  - 見つける場所: Settings → Database → Connection string
  - 例: `https://xxxxx.supabase.co`

- [ ] **Service Role Key** をコピー
  - 見つける場所: Settings → API → Service Role key
  - 例: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
  - ⚠️ **Anon Key ではなく Service Role Key を選択**

## 💻 ローカルセットアップ

### Step 1: プロジェクトディレクトリの確認

```bash
# プロジェクトディレクトリに移動
cd /Users/x24014xx/Desktop/お遊びシステム

# ファイルが存在するか確認
ls -la
```

チェック:
- [ ] `package.json` が存在
- [ ] `app/` ディレクトリが存在
- [ ] `lib/` ディレクトリが存在
- [ ] `pages/` ディレクトリが存在

### Step 2: 環境変数を設定

- [ ] `.env.local` ファイルを開く
- [ ] 以下を編集:

```env
# ← これらを LINE Bot から取得した値に置き換える
LINE_CHANNEL_ACCESS_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
LINE_CHANNEL_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ← これらを Supabase から取得した値に置き換える
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# その他
VERCEL_CRON_SECRET=your-secure-random-secret
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

チェック:
- [ ] 4つの環境変数すべてが設定されている
- [ ] コピペで値が正確に入っている
- [ ] `.env.local` を保存した

### Step 3: 依存関係をインストール

```bash
npm install
```

チェック:
- [ ] インストールが完了した
- [ ] `node_modules/` ディレクトリが作成された
- [ ] `package-lock.json` が作成された
- [ ] エラーが出なかった

### Step 4: ローカルサーバーを起動

```bash
npm run dev
```

チェック:
- [ ] サーバーが起動した
- [ ] ターミナルに `ready - started server on 0.0.0.0:3000` が表示
- [ ] `http://localhost:3000` にアクセスできる
- [ ] ページが表示される

## 🔌 LINE Bot との接続（ローカルテスト）

### Step 1: トンネルを開く（重要）

ローカルマシンを外部からアクセスできるようにします。

**Option A: ngrok を使用（推奨）**

```bash
# ngrok をダウンロード
# https://ngrok.com/download

# トンネルを開く
ngrok http 3000

# 出力例:
# Forwarding                    https://xxxxx-xx-xxx-x.ngrok-free.app -> http://localhost:3000
```

チェック:
- [ ] `https://xxxxx-xx-xxx-x.ngrok-free.app` のような URL が表示
- [ ] URL をコピーして保存

**Option B: Vercel CLI を使用**

```bash
npm install -g vercel
vercel --prod
```

### Step 2: Webhook URL を設定

- [ ] LINE Developers Console を開く
- [ ] Channel Settings → Messaging Settings に移動
- [ ] **Webhook URL** に以下を入力:
  ```
  https://xxxxx-xx-xxx-x.ngrok-free.app/api/webhook
  ```
  （ngrok から取得した URL を使用）

- [ ] **Verify** をクリック
  - チェック:
    - [ ] 「Success」が表示される
    - [ ] Webhook が **Enabled** に変わる

### Step 3: LINE Bot と友だち登録

- [ ] LINE Bot の QR コード (Channel Settings で表示) を使用して登録
  または
- [ ] Bot ID を検索して追加

チェック:
- [ ] Bot が友だち一覧に表示される

### Step 4: メッセージを送信してテスト

- [ ] Bot に以下を送信:
  ```
  明日までに数学の宿題
  ```

チェック:
- [ ] Bot が応答:
  ```
  📝 登録したよ！
  タイトル：数学の宿題
  締切：2024-11-15
  ```
- [ ] ターミナルにログが出力される
- [ ] Supabase の `tasks` テーブルにデータが保存された

## 🚀 本番環境へのデプロイ

### Step 1: GitHub にコードをプッシュ

```bash
# リポジトリを初期化
git init

# ファイルを追加
git add .

# .env.local を除外
git rm --cached .env.local

# コミットを作成
git commit -m "Initial commit: Assignment management LINE Bot"

# GitHub にリモートリポジトリを追加
git remote add origin https://github.com/YOUR_USERNAME/assignment-bot.git

# コードをプッシュ
git push -u origin main
```

チェック:
- [ ] GitHub リポジトリにコードが表示される
- [ ] `.env.local` が含まれていない

### Step 2: Vercel アカウント作成

- [ ] [Vercel](https://vercel.com) にアクセス
- [ ] GitHub アカウントでサインアップ
- [ ] GitHub との連携を許可

### Step 3: Vercel にデプロイ

- [ ] Vercel ダッシュボードで **Add New Project** をクリック
- [ ] GitHub リポジトリを選択
- [ ] **Import** をクリック

チェック:
- [ ] デプロイが開始される

### Step 4: 環境変数を設定（Vercel）

- [ ] **Project Settings** → **Environment Variables** に移動
- [ ] 以下の変数を追加:
  - [ ] `LINE_CHANNEL_ACCESS_TOKEN`
  - [ ] `LINE_CHANNEL_SECRET`
  - [ ] `SUPABASE_URL`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `VERCEL_CRON_SECRET` (オプション)

チェック:
- [ ] すべての環境変数が入力された
- [ ] 値が正確か確認

### Step 5: デプロイが完了するまで待機

チェック:
- [ ] デプロイステータスが **Ready** に変わる
- [ ] 本番 URL が表示される (例: `https://assignment-bot.vercel.app`)

### Step 6: LINE Webhook URL を更新

- [ ] LINE Developers Console → Channel Settings → Messaging Settings に移動
- [ ] **Webhook URL** を本番 URL に更新:
  ```
  https://assignment-bot.vercel.app/api/webhook
  ```
- [ ] **Verify** をクリック

チェック:
- [ ] 「Success」が表示される

### Step 7: 本番環境でテスト

- [ ] Bot に以下を送信:
  ```
  来週金曜までにレポート提出
  ```

チェック:
- [ ] Bot が応答する
- [ ] Supabase に保存される
- [ ] Vercel ログにエラーがない

## ⏰ Cron ジョブ設定（自動リマインド）

- [ ] Vercel ダッシュボードで Cron ジョブが設定されているか確認
  - 見つける場所: Project Settings → Cron Jobs

チェック:
- [ ] `/api/remind` が **Enabled** で表示される
- [ ] スケジュールが `0 20 * * *` (毎日 20:00 UTC) になっている

## 📊 動作確認

### トラッキング

- [ ] Supabase ダッシュボールで `tasks` テーブルを確認
  - 新しい課題が追加されているか
  - `user_id`, `title`, `deadline` が正確に保存されているか

### ログ確認

- [ ] Vercel ログで Webhook が正常に処理されているか
  ```bash
  vercel logs assignment-bot --follow
  ```

- [ ] Supabase ログで Database エラーがないか
  - Supabase ダッシュボール → Logs

## 🎉 完成！

すべてのチェックが完了したら、プロジェクトは完全にセットアップされています。

### 次のステップ

- [ ] README.md を読んで機能を理解する
- [ ] DEVELOPMENT.md を読んで拡張方法を学ぶ
- [ ] 複数のメッセージでテストする
- [ ] リマインド機能をテスト（締切日の設定など）
- [ ] 本番運用を開始

## 🆘 トラブルシューティング

### Webhook の検証に失敗

1. ngrok URL が正しいか確認
2. `X-Line-Signature` ヘッダーが正しく生成されているか確認
3. Channel Secret が正確か確認

### メッセージが保存されない

1. `SUPABASE_URL` と `SUPABASE_SERVICE_ROLE_KEY` が正確か確認
2. Supabase の `tasks` テーブルが存在するか確認
3. Service Role Key（Anon Key ではなく）を使用しているか確認

### リマインドが送信されない

1. `LINE_CHANNEL_ACCESS_TOKEN` が正確か確認
2. Supabase に課題が存在するか確認
3. Vercel ログで Cron ジョブが実行されているか確認

### 日付が解析されない

1. 日本語の日付表記が正しいか確認
2. `lib/parseTask.ts` でログを追加してデバッグ
3. Chrono-node のドキュメントで対応形式を確認

## 📞 サポート

問題が解決しない場合:

1. [README.md](README.md) の「トラブルシューティング」を確認
2. [DEVELOPMENT.md](DEVELOPMENT.md) でコード例を参照
3. GitHub Issues で報告（GitHub リポジトリがある場合）

---

**このチェックリストに従うことで、確実にセットアップできます！** ✨
