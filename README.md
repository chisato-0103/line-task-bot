# 📚 課題管理 LINE Bot

大学生向けの課題管理 LINE Bot です。自然な日本語で課題を送ると、自動で課題を保存し、締切前日と当日にリマインド通知を送信します。

## ✨ 機能

- 📝 **日本語の自然な日付解析**: 「明日までに」「来週までに」「11月20日までに」など、自然な日本語で課題の締切を指定
- 💾 **自動保存**: 課題を Supabase に自動で保存
- ⏰ **自動リマインド**: 締切前日 20:00 に通知、当日にも通知
- 🚀 **高速処理**: Vercel Serverless Functions で安定運用
- 🔐 **セキュア**: LINE Messaging API の署名検証で安全

## 🛠️ 技術構成

- **フロントエンド**: Next.js 14 (App Router)
- **バックエンド**: Vercel Serverless Functions
- **データベース**: Supabase PostgreSQL
- **メッセージング**: LINE Messaging API
- **日付解析**: Chrono-node
- **言語**: TypeScript

## 📋 前提条件

- Node.js 18+
- npm または yarn
- LINE Business Account
- Supabase アカウント

## 🚀 セットアップガイド

### 1. LINE Bot の準備

1. [LINE Developers](https://developers.line.biz/ja/) にアクセス
2. 新しい Channel を作成 (Message API)
3. Channel Access Token を取得
4. Channel Secret を取得

### 2. Supabase の準備

1. [Supabase](https://supabase.com) にサインアップ
2. 新しいプロジェクトを作成
3. SQL エディタで以下を実行して tasks テーブルを作成:

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

4. Project URL と Service Role Key を取得

### 3. プロジェクトのセットアップ

```bash
# 依存関係をインストール
npm install

# または
yarn install
```

### 4. 環境変数を設定

`.env.local` ファイルを編集して以下を設定:

```env
# LINE Messaging API
LINE_CHANNEL_ACCESS_TOKEN=your_channel_access_token
LINE_CHANNEL_SECRET=your_channel_secret

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional: Vercel Cron security
VERCEL_CRON_SECRET=your_secret_key

# Local development
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 5. ローカルで実行

```bash
npm run dev
```

アプリは `http://localhost:3000` で起動します。

### 6. Webhook URL を LINE Bot に設定

1. LINE Developers コンソールで Webhook URL を設定
2. URL: `https://your-domain.vercel.app/api/webhook`
3. Webhook を有効化

## 📖 使い方

### ユーザーの操作

LINE Bot に以下のようなメッセージを送信:

```
明日までに数学の宿題を終わらせる
来週までにレポートを提出する
11月20日までにプレゼン資料を作成する
3日後までに英語の勉強をする
```

### Bot の応答

```
📝 登録したよ！

タイトル：数学の宿題を終わらせる
締切：2024-11-15
```

### 自動リマインド

- **締切前日 20:00**: 「⏰ 明日締切の課題があります」と通知
- **締切当日**: 「🚨 本日締切の課題があります！急いで！」と通知

## 📁 ディレクトリ構成

```
.
├── app/
│   └── page.tsx                 # トップページ
├── pages/
│   └── api/
│       ├── webhook.ts           # LINE Webhook エンドポイント
│       └── remind.ts            # リマインドバッチ処理
├── lib/
│   ├── supabase.ts             # Supabase クライアント
│   ├── parseTask.ts            # 日付解析（Chrono）
│   └── line.ts                 # LINE API ラッパー
├── .env.local                  # 環境変数
├── vercel.json                 # Vercel Cron 設定
├── next.config.js              # Next.js 設定
├── tsconfig.json               # TypeScript 設定
└── package.json                # 依存関係
```

## 🔧 API リファレンス

### Webhook エンドポイント

```
POST /api/webhook
```

LINE Bot のメッセージイベントを受け取ります。

**ヘッダー**:
- `X-Line-Signature`: LINE の署名検証用

**Body**:
```json
{
  "events": [
    {
      "type": "message",
      "source": {
        "userId": "user_id"
      },
      "replyToken": "reply_token",
      "message": {
        "type": "text",
        "text": "明日までに数学の宿題"
      }
    }
  ]
}
```

### リマインドエンドポイント

```
GET /api/remind
```

Vercel Cron によって毎日 20:00 に実行されます。

**レスポンス例**:
```json
{
  "success": true,
  "remindersSentTomorrow": 5,
  "remindersSentToday": 3,
  "totalReminders": 8
}
```

## 📅 Cron スケジュール

`vercel.json` で設定:

```json
{
  "crons": [
    {
      "path": "/api/remind",
      "schedule": "0 20 * * *"
    }
  ]
}
```

- **スケジュール**: 毎日 20:00 (UTC)
- **パス**: `/api/remind`

## 🚀 デプロイ方法

### Vercel へのデプロイ

```bash
# Vercel CLI をインストール
npm install -g vercel

# デプロイ
vercel
```

またはGitHub連携で自動デプロイ:

1. GitHub にコードをプッシュ
2. Vercel でプロジェクトを作成
3. GitHub リポジトリを連携
4. 自動デプロイが開始

### 環境変数の設定（Vercel）

Vercel ダッシュボード → Settings → Environment Variables で以下を設定:

- `LINE_CHANNEL_ACCESS_TOKEN`
- `LINE_CHANNEL_SECRET`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `VERCEL_CRON_SECRET` (オプション)

## 📝 パスの解析例

### サポートされている日付フォーマット

- 「明日」「今日」「明後日」
- 「来週」「来月」「来年」
- 「11月20日」「2024年11月20日」
- 「3日後」「1週間後」「2ヶ月後」
- 「週末」「月曜日」「金曜日」

### 解析の例

| メッセージ | 解析結果 |
|-----------|--------|
| 明日までに数学の宿題 | title: "数学の宿題", deadline: "2024-11-15" |
| 来週金曜までにレポート提出 | title: "レポート提出", deadline: "2024-11-22" |
| 11月25日までに英語の勉強 | title: "英語の勉強", deadline: "2024-11-25" |

## 🔒 セキュリティ

- LINE Webhook の署名検証を実装
- Supabase の Service Role Key を使用（API リクエスト時のみ）
- 環境変数で認証情報を管理
- Vercel Cron の Bearer Token で保護（オプション）

## 🐛 トラブルシューティング

### メッセージが受け取られない

1. Webhook URL が正しく設定されているか確認
2. `X-Line-Signature` ヘッダーが正しく検証されているか確認
3. ログで署名検証エラーを確認

### リマインドが送信されない

1. Supabase の `tasks` テーブルにデータが存在するか確認
2. `deadline` が正しい日付形式（YYYY-MM-DD）か確認
3. Vercel のログで Cron ジョブの実行結果を確認
4. LINE Bot の Push API が有効か確認

### 日付が正しく解析されない

1. 日本語の日付表記を確認
2. `lib/parseTask.ts` をカスタマイズして日付パターンを追加
3. Chrono-node のドキュメントを参照

## 📚 参考資料

- [LINE Messaging API](https://developers.line.biz/ja/services/messaging-api/)
- [Supabase ドキュメント](https://supabase.com/docs)
- [Next.js ドキュメント](https://nextjs.org/docs)
- [Chrono-node](https://github.com/wanasit/chrono)
- [Vercel Cron Jobs](https://vercel.com/docs/crons)

## 📄 ライセンス

MIT

## 👨‍💻 開発者向け情報

### ローカル開発

```bash
# 開発サーバー起動
npm run dev

# ビルド確認
npm run build

# 本番環境起動
npm start
```

### テスト用のメッセージ送信

curl でテスト Webhook を送信:

```bash
curl -X POST http://localhost:3000/api/webhook \
  -H "Content-Type: application/json" \
  -H "X-Line-Signature: YOUR_SIGNATURE" \
  -d '{
    "events": [{
      "type": "message",
      "source": {"userId": "test_user_id"},
      "replyToken": "test_reply_token",
      "message": {"type": "text", "text": "明日までに数学の宿題"}
    }]
  }'
```

## 🤝 コントリビューション

問題報告やプルリクエストは大歓迎です。

## 📞 サポート

問題が発生した場合は、以下をご確認ください:

1. `.env.local` の環境変数が正しく設定されているか
2. LINE Bot の Webhook URL が正しく設定されているか
3. Supabase のデータベースが正常に動作しているか
4. ネットワークの接続状況

---

**Made with ❤️ for 大学生**
