# 📋 ファイルマニフェスト - 全ファイルの説明

このプロジェクトに含まれるすべてのファイルの説明です。

## 🎯 コアアプリケーション

### [app/page.tsx](app/page.tsx) - フロントエンドホームページ
- **目的**: ユーザーに Bot の使い方や機能を説明するページ
- **内容**:
  - 使い方ガイド
  - 日付指定方法の例
  - 機能説明
  - セットアップ情報
- **サイズ**: 169行
- **依存**: React, CSS-in-JS
- **重要度**: ⭐⭐ (情報提供)

### [pages/api/webhook.ts](pages/api/webhook.ts) - LINE Webhook エンドポイント
- **目的**: LINE Bot からのメッセージを受け取り、処理する
- **流れ**:
  1. 生のボディを取得（署名検証用）
  2. LINE 署名を検証
  3. メッセージをパース
  4. `parseTask()` で日付を抽出
  5. `insertTask()` で Supabase に保存
  6. `replyMessage()` で確認メッセージを返信
- **サイズ**: 81行
- **重要度**: ⭐⭐⭐ (最重要)
- **注意点**: `bodyParser: false` は必須

### [pages/api/remind.ts](pages/api/remind.ts) - 自動リマインド送信
- **目的**: Vercel Cron によって定期実行され、締切課題をリマインド通知
- **処理**:
  1. 明日締切の課題を取得
  2. 本日締切の課題を取得
  3. ユーザーごとにグループ化
  4. LINE Push API で通知送信
- **サイズ**: 74行
- **実行**: 毎日 20:00 UTC (vercel.json で設定)
- **重要度**: ⭐⭐⭐ (自動リマインド機能)

---

## 📚 ライブラリ（ビジネスロジック）

### [lib/supabase.ts](lib/supabase.ts) - Supabase クライアントと DB操作
- **目的**: Supabase PostgreSQL データベースとの連携
- **エクスポート関数**:
  - `insertTask()` - 新しい課題を挿入
  - `getTasksDueTomorrow()` - 明日締切の課題を取得
  - `getTasksDueToday()` - 本日締切の課題を取得
- **インターフェース**:
  - `Task` - 課題データ型
- **サイズ**: 133行
- **重要度**: ⭐⭐⭐ (データ層)
- **設定値**: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`

### [lib/parseTask.ts](lib/parseTask.ts) - 日本語日付解析
- **目的**: 自然な日本語テキストから日付とタイトルを抽出
- **エクスポート関数**:
  - `parseTask()` - シンプルな日付解析
  - `parseTaskAdvanced()` - より詳細な解析
- **インターフェース**:
  - `ParsedTask` - `{ title: string, deadline: string }`
- **使用ライブラリ**: Chrono-node, date-fns
- **サイズ**: 110行
- **重要度**: ⭐⭐⭐ (核となる機能)
- **対応形式**:
  - 「明日」「今日」「明後日」
  - 「来週」「来月」
  - 「11月20日」「2024年11月20日」
  - 「3日後」「1週間後」

### [lib/line.ts](lib/line.ts) - LINE Messaging API ラッパー
- **目的**: LINE Bot SDK をラップして使いやすくする
- **エクスポート関数**:
  - `replyMessage()` - メッセージに返信
  - `pushMessage()` - ユーザーにメッセージを送信
  - `verifySignature()` - LINE 署名を検証
  - `validateLineWebhook()` - Webhook リクエストを検証
  - `sendTaskConfirmation()` - 課題登録確認を送信
  - `sendTomorrowReminder()` - 明日の課題をリマインド
  - `sendTodayReminder()` - 本日の課題をリマインド
- **サイズ**: 138行
- **重要度**: ⭐⭐⭐ (メッセージング層)
- **設定値**: `LINE_CHANNEL_ACCESS_TOKEN`, `LINE_CHANNEL_SECRET`

---

## ⚙️ 設定ファイル

### [package.json](package.json) - 依存関係と npm スクリプト
- **目的**: プロジェクトメタデータと依存関係を定義
- **重要な依存**:
  - `next`: Next.js 14+
  - `@line/bot-sdk`: LINE Bot 機能
  - `@supabase/supabase-js`: Supabase クライアント
  - `chrono-node`: 日付解析
  - `date-fns`: 日付フォーマット
- **スクリプト**:
  - `npm run dev` - 開発サーバー起動
  - `npm run build` - ビルド
  - `npm run start` - 本番起動
- **重要度**: ⭐⭐⭐ (依存関係)

### [tsconfig.json](tsconfig.json) - TypeScript 設定
- **目的**: TypeScript コンパイラ設定
- **重要設定**:
  - `target`: ES2020
  - `moduleResolution`: bundler
  - `paths`: `@/*` エイリアス
  - `strict`: true (厳密な型チェック)
- **重要度**: ⭐⭐ (開発効率)

### [next.config.js](next.config.js) - Next.js 設定
- **目的**: Next.js コンパイラ設定
- **設定**: React Strict Mode, SWC minimize
- **重要度**: ⭐ (オプション)

### [vercel.json](vercel.json) - Vercel 設定
- **目的**: Vercel Cron Jobs の設定
- **Cron 設定**:
  - Path: `/api/remind`
  - Schedule: `0 20 * * *` (毎日 20:00 UTC)
- **重要度**: ⭐⭐⭐ (自動リマインド機能)

### [.env.local](.env.local) - 環境変数テンプレート
- **目的**: 認証情報と設定値を管理
- **必須変数**:
  - `LINE_CHANNEL_ACCESS_TOKEN` - LINE Bot トークン
  - `LINE_CHANNEL_SECRET` - LINE Bot シークレット
  - `SUPABASE_URL` - Supabase プロジェクト URL
  - `SUPABASE_SERVICE_ROLE_KEY` - Supabase キー
- **オプション変数**:
  - `VERCEL_CRON_SECRET` - Cron 認可キー
  - `NEXT_PUBLIC_BASE_URL` - ベース URL
- **重要度**: ⭐⭐⭐ (必須設定)
- **警告**: 絶対に git にコミットしない

### [.gitignore](.gitignore) - git 除外設定
- **目的**: バージョン管理から除外するファイルを指定
- **除外**: `.env.local`, `node_modules/`, `.next/` など
- **重要度**: ⭐⭐⭐ (セキュリティ)

---

## 📖 ドキュメント

### [INDEX.md](INDEX.md) - ドキュメント目次とガイド
- **目的**: プロジェクト全体を理解するためのナビゲーション
- **内容**:
  - ドキュメント構成
  - シナリオ別ガイド
  - 推奨される読む順序
  - FAQ
- **対象**: 全員
- **読了時間**: 10分
- **優先度**: ⭐⭐⭐ (最初に読む)

### [QUICKSTART.md](QUICKSTART.md) - 最速セットアップガイド
- **目的**: 15分で動かすための最短手順
- **内容**:
  - 5つの必須ステップ
  - 動作確認方法
  - 本番デプロイ
- **対象**: 急いでいる方
- **読了時間**: 15分
- **優先度**: ⭐⭐⭐

### [SETUP_CHECKLIST.md](SETUP_CHECKLIST.md) - 完全セットアップチェックリスト
- **目的**: 確実にセットアップするための詳細なチェックリスト
- **内容**:
  - LINE Bot 準備（全手順）
  - Supabase セットアップ（全手順）
  - ローカル設定
  - 本番デプロイ（Vercel）
  - トラブルシューティング
- **対象**: 本番運用を予定している方
- **読了時間**: 60-120分
- **優先度**: ⭐⭐⭐

### [README.md](README.md) - 完全マニュアル
- **目次**:
  - 機能説明
  - 技術構成
  - セットアップガイド
  - 使い方
  - API リファレンス
  - Cron スケジュール
  - デプロイ方法
  - セキュリティ
  - トラブルシューティング
  - 参考資料
- **対象**: 全機能を理解したい方
- **読了時間**: 30分
- **優先度**: ⭐⭐⭐

### [DEVELOPMENT.md](DEVELOPMENT.md) - 開発者向けカスタマイズガイド
- **内容**:
  - ファイル構造の詳細
  - API 拡張方法
  - データベーススキーマ拡張
  - パフォーマンス最適化
  - セキュリティ強化
  - スケーリング戦略
  - リリースチェックリスト
- **対象**: 機能を追加・カスタマイズしたい方
- **読了時間**: 60分
- **優先度**: ⭐⭐

### [TESTING.md](TESTING.md) - テストとデバッグガイド
- **内容**:
  - ローカルテスト方法
  - Webhook テスト
  - 実機テスト（LINE Bot）
  - Cron ジョブテスト
  - セキュリティテスト
  - パフォーマンステスト
- **対象**: テストしたい方
- **読了時間**: 30分
- **優先度**: ⭐⭐

### [PROJECT_SUMMARY.txt](PROJECT_SUMMARY.txt) - プロジェクト概要
- **目的**: プロジェクト全体を一目で理解
- **内容**:
  - ファイル一覧
  - 統計情報
  - 主な機能
  - 技術スタック
  - 次のステップ
- **対象**: 全員
- **読了時間**: 5分
- **優先度**: ⭐

---

## 📊 ファイルの相互関係図

```
┌─────────────────────────────────────────────┐
│          LINE Bot ユーザー                  │
└────────────────┬────────────────────────────┘
                 │ メッセージ送信
                 ↓
     ┌──────────────────────────┐
     │ pages/api/webhook.ts    │ ← 受信・処理
     │ (bodyParser: false)      │
     └──────────┬───────────────┘
                │
        ┌───────┴────────┬──────────────┐
        ↓                ↓              ↓
  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐
  │lib/supabase  │  │lib/parseTask │  │lib/line.ts  │
  │(DB操作)      │  │(日付解析)    │  │(LINE API)   │
  └──────┬───────┘  └──────┬───────┘  └──────┬──────┘
         │                 │                  │
    ┌────▼─────────────────▼──────────────────▼────┐
    │  署名検証 → 日付抽出 → 保存 → 返信           │
    └─────────────────┬──────────────────────────┘
                      ↓
           ┌──────────────────────┐
           │  Supabase Database   │
           │  (PostgreSQL)        │
           └──────────────────────┘

毎日 20:00 UTC
                      ↓
        ┌──────────────────────────┐
        │pages/api/remind.ts       │ ← Cron実行
        │(自動リマインド送信)       │
        └──────────┬───────────────┘
                   │
            ┌──────▼───────┐
            │Supabase      │ ← 課題を取得
            │(deadline確認)│
            └──────┬───────┘
                   │
             ┌─────▼─────┐
             │ lib/line   │ ← Push通知送信
             │(pushMsg)   │
             └─────┬─────┘
                   │
            ┌──────▼───────┐
            │ LINE Bot ユーザー
            │ (通知受信)
            └──────────────┘
```

---

## 🔄 ファイル修正時のガイド

### 修正が必要になった場合

| 修正内容 | 修正ファイル | 難易度 |
|---------|-----------|------|
| メッセージ返信文を変更 | `lib/line.ts` | 🟢 簡単 |
| リマインド送信時刻を変更 | `vercel.json` | 🟢 簡単 |
| 日付解析形式を追加 | `lib/parseTask.ts` | 🟡 中程度 |
| 新しい API エンドポイント追加 | `pages/api/` | 🟡 中程度 |
| データベーススキーマ変更 | Supabase 直接 | 🟡 中程度 |
| 新機能を追加（完了マーク等） | 複数ファイル | 🔴 難しい |
| Webhook 処理ロジック変更 | `pages/api/webhook.ts` | 🔴 難しい |

---

## 📈 総コード統計

| カテゴリ | ファイル数 | 行数 | 用途 |
|---------|----------|------|------|
| API エンドポイント | 2 | ~155 | Webhook 処理・リマインド |
| ライブラリ | 3 | ~381 | ビジネスロジック |
| UI | 1 | 169 | フロントエンド |
| 設定 | 5 | ~176 | プロジェクト設定 |
| ドキュメント | 6 | ~2000 | 説明書 |
| **合計** | **17** | **~2881** | - |

---

## ✅ デプロイ前チェックリスト

ファイル完成度確認:

- [x] `app/page.tsx` - UI 完成
- [x] `pages/api/webhook.ts` - Webhook 実装
- [x] `pages/api/remind.ts` - Cron 実装
- [x] `lib/supabase.ts` - DB層 実装
- [x] `lib/parseTask.ts` - 日付解析 実装
- [x] `lib/line.ts` - LINE API 実装
- [x] `package.json` - 依存関係 定義
- [x] `tsconfig.json` - TypeScript 設定
- [x] `next.config.js` - Next.js 設定
- [x] `vercel.json` - Cron 設定
- [x] `.env.local` - テンプレート作成
- [x] `.gitignore` - 除外設定
- [x] `README.md` - 完全マニュアル
- [x] `QUICKSTART.md` - 最速ガイド
- [x] `SETUP_CHECKLIST.md` - チェックリスト
- [x] `DEVELOPMENT.md` - 開発ガイド
- [x] `TESTING.md` - テストガイド

**全ファイル完成✅**

---

このマニフェストを参考に、各ファイルの役割を理解してください！
