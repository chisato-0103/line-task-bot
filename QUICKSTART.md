# ⚡ クイックスタートガイド

完全な課題管理 LINE Bot をコピペで即動く状態で構築しました。以下の手順に従ってセットアップしてください。

## 📋 必須の5つのステップ

### ステップ 1: LINE Bot を準備（5分）

1. [LINE Developers Console](https://developers.line.biz/ja/) にログイン
2. **「Providers」** → 新規プロバイダー作成
3. **「Channels」** → **「Messaging API」** で新規チャネル作成
4. チャネル情報から以下を取得:
   - ✅ **Channel Access Token** (長いトークン)
   - ✅ **Channel Secret** (32文字の文字列)

### ステップ 2: Supabase をセットアップ（5分）

1. [Supabase](https://supabase.com) にサインアップ
2. **「New Project」** で新規プロジェクト作成
3. **「SQL Editor」** を開いて、以下を実行:

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

4. **「Settings」** → **「Database」** から以下を取得:
   - ✅ **Project URL**
   - ✅ **Service Role Key** (Anon Key ではなく)

### ステップ 3: 環境変数を設定（1分）

`.env.local` ファイルを編集して、ステップ 1,2 で取得した値を貼り付け:

```env
LINE_CHANNEL_ACCESS_TOKEN=xxxxx...
LINE_CHANNEL_SECRET=xxxxx...
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxxxx...
VERCEL_CRON_SECRET=your-secret-key-here
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### ステップ 4: ローカルで実行（2分）

```bash
# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
```

**ローカルアクセス**: http://localhost:3000

### ステップ 5: LINE Bot に Webhook を設定（2分）

1. LINE Developers Console で Channel を開く
2. **「Messaging Settings」** を探す
3. **Webhook URL** に以下を設定:
   ```
   http://localhost:3000/api/webhook
   (ローカルテスト用)
   ```
   または Vercel デプロイ後:
   ```
   https://your-project.vercel.app/api/webhook
   ```
4. **「Verify」** ボタンで検証
5. **Webhook** を **「Enabled」** に変更

## ✅ 動作確認

### ローカルテスト

1. LINE Bot を友だち登録
2. メッセージを送信:
   ```
   明日までに数学の宿題
   ```
3. Bot が応答:
   ```
   📝 登録したよ！
   タイトル：数学の宿題
   締切：2024-11-15
   ```
4. Supabase Console で `tasks` テーブルにデータが保存されたか確認

## 🚀 Vercel へのデプロイ（本番環境）

### オプション 1: Vercel CLI

```bash
# Vercel CLI をインストール
npm install -g vercel

# デプロイ
vercel
```

### オプション 2: GitHub 連携（推奨）

1. GitHub にコードをプッシュ
2. [Vercel Dashboard](https://vercel.com/dashboard) で **「Add New」** → **「Project」**
3. GitHub リポジトリを選択
4. **Environment Variables** を設定:
   - `LINE_CHANNEL_ACCESS_TOKEN`
   - `LINE_CHANNEL_SECRET`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `VERCEL_CRON_SECRET`
5. **Deploy** をクリック

### デプロイ後の設定

1. Vercel ダッシュボードでプロジェクトの URL をコピー
2. LINE Developers Console で Webhook URL を更新:
   ```
   https://your-project.vercel.app/api/webhook
   ```

## 📝 使用例

### ユーザーが送信できるメッセージ例

```
明日までに数学の宿題を終わらせる
→ title: "数学の宿題を終わらせる", deadline: "2024-11-15"

来週金曜までにレポート提出
→ title: "レポート提出", deadline: "2024-11-22"

11月25日までに英語の勉強をする
→ title: "英語の勉強をする", deadline: "2024-11-25"

3日後までに資料作成
→ title: "資料作成", deadline: "2024-11-17"

週末までにプレゼン準備
→ title: "プレゼン準備", deadline: "2024-11-16"
```

## 🔄 リマインド機能の動作

Bot は自動的に以下の時間にリマインドを送信します:

- **毎日 20:00 UTC (午後8時)**:
  - 明日締切の課題を全ユーザーに通知
  - 本日締切の課題を全ユーザーに通知

例:
```
⏰ 明日締切の課題があります

• 数学の宿題を終わらせる (2024-11-15)
• レポート提出 (2024-11-15)
```

## 📁 ファイル構成（重要）

```
.
├── app/
│   └── page.tsx                 ← トップページ（使用説明）
├── pages/api/
│   ├── webhook.ts              ← LINE メッセージ受信（重要）
│   └── remind.ts               ← 自動リマインド送信
├── lib/
│   ├── supabase.ts             ← DB操作
│   ├── parseTask.ts            ← 日付解析（Chrono）
│   └── line.ts                 ← LINE API
├── .env.local                  ← 環境変数（編集必須）
├── vercel.json                 ← Cron設定
└── README.md                   ← 詳細ドキュメント
```

## 🔐 セキュリティのポイント

✅ **実装済み**:
- LINE Webhook 署名検証
- Supabase Service Role Key を使用
- TypeScript で型安全
- 環境変数で機密情報を管理

## 🐛 よくある問題と解決法

### ❌「Webhook が失敗した」

**原因**: Webhook URL の設定が間違っている
- **解決**: LINE Developers Console で URL を確認し、`/api/webhook` で終わっているか確認

### ❌「メッセージが保存されない」

**原因**: 環境変数が設定されていない
- **解決**: `.env.local` に `SUPABASE_URL` と `SUPABASE_SERVICE_ROLE_KEY` が正しく設定されているか確認

### ❌「リマインドが届かない」

**原因**: Vercel Cron が動作していない、または LINE Push API の設定が不正
- **解決**:
  1. Vercel ログで Cron ジョブが実行されているか確認
  2. Supabase に tasks テーブルにデータがあるか確認

### ❌「日付が正しく解析されない」

**原因**: 日本語の日付形式が Chrono-node で認識されない
- **解決**: `lib/parseTask.ts` を編集して、カスタム日付パターンを追加

## 📚 参考資料

- [LINE Messaging API ドキュメント](https://developers.line.biz/ja/services/messaging-api/)
- [Supabase 公式ドキュメント](https://supabase.com/docs)
- [Next.js 14 ドキュメント](https://nextjs.org/docs)
- [Vercel Cron Jobs](https://vercel.com/docs/crons)
- [Chrono-node GitHub](https://github.com/wanasit/chrono)

## ✨ コードの特徴

### 1️⃣ **Clean Architecture**
- `lib/` に分離された責務
- API ロジックが明確

### 2️⃣ **TypeScript対応**
- 全ファイルで型安全性を確保
- IDE の補完機能が充実

### 3️⃣ **エラーハンドリング**
- 全ての API 呼び出しで try-catch
- ログ出力で問題追跡可能

### 4️⃣ **スケーラブル設計**
- ユーザーごとのタスク管理
- 複数課題対応

## 🎯 次のステップ

本番環境で運用を開始したら、以下の拡張を検討してください:

1. ✨ **タスク完了マーク機能** (「完了」とメッセージで状態更新)
2. 📊 **統計表示機能** (累積課題数や完了率の表示)
3. 🔔 **カスタマイズ通知** (ユーザーごとに通知時間を設定)
4. 📅 **カレンダー表示** (LINE Rich Menu で課題を表示)

---

**質問や問題がある場合は、README.md の「トラブルシューティング」セクションをご覧ください。**

**Happy task management! 📝✨**
