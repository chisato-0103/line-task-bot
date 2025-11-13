# 🛠️ 開発ガイド

このプロジェクトをカスタマイズして拡張するための開発ガイドです。

## 📂 プロジェクト構造の詳細

### `app/page.tsx` - フロントエンド

ユーザーがアクセスする情報ページです。カスタマイズ例：

```typescript
// ダッシュボード機能を追加する場合
export default function Home() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    // API から課題一覧を取得
    fetch('/api/tasks')
      .then(res => res.json())
      .then(data => setTasks(data));
  }, []);

  return (
    <main>
      <h1>My Tasks</h1>
      {/* タスク一覧表示 */}
    </main>
  );
}
```

### `pages/api/webhook.ts` - LINE メッセージ受信

LINE からのメッセージを受け取り、処理するメインのエンドポイント。

**重要な仕様**:
```typescript
// bodyParser: false は必須（署名検証のため）
export const config = {
  api: {
    bodyParser: false,  // ← これを削除したらメッセージが処理されません
  },
};
```

**拡張例 - 複数のイベントタイプに対応**:

```typescript
// 「完了」とメッセージしたらタスクを完了状態に変更
if (event.message.text === '完了') {
  // 最新のタスクを完了状態に変更
  await markTaskAsComplete(userId);
}

// 「一覧」とメッセージしたら課題一覧を表示
if (event.message.text === '一覧') {
  const tasks = await getTasksByUser(userId);
  await sendTaskList(replyToken, tasks);
}
```

### `pages/api/remind.ts` - 自動リマインド

Vercel Cron によって定期実行されるバッチ処理です。

**スケジュール変更方法**（`vercel.json`）:

```json
{
  "crons": [
    {
      "path": "/api/remind",
      "schedule": "0 9 * * *"  // 毎日 9:00 UTC に変更
    }
  ]
}
```

**リマインド対象の変更例 - 3日前から通知**:

```typescript
// pages/api/remind.ts
export async function getTasksDueIn3Days(): Promise<Map<string, Task[]>> {
  try {
    const inThreeDays = new Date();
    inThreeDays.setDate(inThreeDays.getDate() + 3);
    const targetStr = inThreeDays.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('deadline', targetStr)
      .eq('done', false);

    // ... グループ化して返す
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return new Map();
  }
}
```

### `lib/supabase.ts` - データベース操作

Supabase との連携層です。

**新しい関数を追加する例 - ユーザーの全タスク取得**:

```typescript
export async function getAllTasksByUser(userId: string): Promise<Task[]> {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('deadline', { ascending: true });

    if (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Exception fetching tasks:', error);
    return [];
  }
}
```

**タスク完了状態を更新する**:

```typescript
export async function markTaskAsComplete(taskId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('tasks')
      .update({ done: true })
      .eq('id', taskId);

    if (error) {
      console.error('Error updating task:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Exception updating task:', error);
    return false;
  }
}
```

### `lib/parseTask.ts` - 日付解析

Chrono-node を使って日本語から日付を抽出します。

**日付解析のカスタマイズ例**:

```typescript
// より詳細な日付解析
export function parseTaskWithTime(message: string) {
  try {
    // 時間を含めて解析
    const options = {
      forwardDate: true,
      weekStartDay: 1, // 月曜日から開始
    };

    const results = chrono.parse(message, new Date(), options);

    if (results.length === 0) return null;

    const result = results[0];

    return {
      title: message.replace(result.text, '').trim(),
      deadline: format(result.start.date(), 'yyyy-MM-dd'),
      time: result.start.date().toLocaleTimeString('ja-JP'),
    };
  } catch (error) {
    console.error('Error parsing task:', error);
    return null;
  }
}
```

**複数の日付を抽出**:

```typescript
export function parseMultipleTasks(message: string) {
  const results: ParsedTask[] = [];

  const lines = message.split('\n');
  lines.forEach(line => {
    const parsed = parseTask(line);
    if (parsed) {
      results.push(parsed);
    }
  });

  return results;
}
```

### `lib/line.ts` - LINE API ラッパー

LINE Messaging API の操作をまとめています。

**新しいメッセージタイプを追加 - ボタン付きメッセージ**:

```typescript
export async function sendTaskWithButtons(
  replyToken: string,
  task: Task
) {
  const message = {
    type: 'template',
    altText: `${task.title} (${task.deadline})`,
    template: {
      type: 'buttons',
      text: `${task.title}\n締切: ${task.deadline}`,
      actions: [
        {
          type: 'message',
          label: '完了',
          text: `完了 ${task.id}`,
        },
        {
          type: 'message',
          label: '後で',
          text: `後で ${task.id}`,
        },
      ],
    },
  };

  await replyMessage(replyToken, [message]);
}
```

**Flex Message で高度なレイアウト**:

```typescript
export async function sendTaskListFlex(
  replyToken: string,
  tasks: Task[]
) {
  const message = {
    type: 'flex',
    altText: '課題一覧',
    contents: {
      type: 'bubble',
      body: {
        type: 'box',
        layout: 'vertical',
        contents: tasks.map(task => ({
          type: 'text',
          text: `${task.title} (${task.deadline})`,
          size: 'sm',
        })),
      },
    },
  };

  await replyMessage(replyToken, [message]);
}
```

## 🗄️ データベーススキーマの拡張

### 基本スキーマ（既存）

```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  deadline DATE NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  done BOOLEAN DEFAULT false
);
```

### 拡張スキーマの例

**優先度やカテゴリを追加**:

```sql
-- テーブルを拡張
ALTER TABLE tasks ADD COLUMN priority INTEGER DEFAULT 3; -- 1=高, 2=中, 3=低
ALTER TABLE tasks ADD COLUMN category TEXT DEFAULT '一般'; -- 教科、講義など
ALTER TABLE tasks ADD COLUMN subject TEXT; -- 科目名

-- インデックスを追加
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_category ON tasks(category);
```

**リマインド履歴を記録**:

```sql
CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id),
  user_id TEXT NOT NULL,
  reminder_type TEXT NOT NULL, -- 'tomorrow', 'today'
  sent_at TIMESTAMP DEFAULT now(),
  FOREIGN KEY (task_id) REFERENCES tasks(id)
);
```

**ユーザー設定テーブル**:

```sql
CREATE TABLE user_settings (
  user_id TEXT PRIMARY KEY,
  reminder_time TEXT DEFAULT '20:00', -- 通知時間
  reminder_enabled BOOLEAN DEFAULT true,
  timezone TEXT DEFAULT 'Asia/Tokyo',
  created_at TIMESTAMP DEFAULT now()
);
```

## 🔧 API エンドポイントの拡張

### 新しいエンドポイントの追加例

**タスク一覧の API**:

```typescript
// pages/api/tasks.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getAllTasksByUser } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const tasks = await getAllTasksByUser(userId as string);
    res.status(200).json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
```

**タスク削除の API**:

```typescript
// pages/api/tasks/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
```

## 🧪 ローカルテスト

### curl で Webhook をテスト

```bash
# テスト用の署名を生成する簡単なスクリプト
cat > test_webhook.sh << 'EOF'
#!/bin/bash

BODY='{"events":[{"type":"message","source":{"userId":"U123456789"},"replyToken":"nHuyWiB7yP5Zw52FIkcQT","message":{"type":"text","text":"明日までに数学の宿題"}}]}'

SIGNATURE=$(echo -n "$BODY" | openssl dgst -sha256 -hmac "YOUR_CHANNEL_SECRET" -binary | base64)

curl -X POST http://localhost:3000/api/webhook \
  -H "Content-Type: application/json" \
  -H "X-Line-Signature: $SIGNATURE" \
  -d "$BODY"
EOF

chmod +x test_webhook.sh
./test_webhook.sh
```

### リマインド API をテスト

```bash
curl -X GET http://localhost:3000/api/remind \
  -H "Authorization: Bearer your_secret_key"
```

## 📊 ログとモニタリング

### Vercel ログの確認

```bash
# Vercel CLI をインストール
npm install -g vercel

# ログを確認
vercel logs your-project-name --follow
```

### ローカル開発でのログ出力

```typescript
// 開発中はコンソールログを活用
console.log('📝 Received message:', { userId, text });
console.log('✅ Task registered:', { title, deadline });
console.error('❌ Error:', error.message);
```

## 🚀 パフォーマンス最適化

### データベースクエリの最適化

```typescript
// ❌ 遅い - 全て取得して JavaScript で処理
const { data: allTasks } = await supabase.from('tasks').select('*');
const filtered = allTasks.filter(t => t.done === false);

// ✅ 速い - データベースで絞り込み
const { data: filteredTasks } = await supabase
  .from('tasks')
  .select('*')
  .eq('done', false);
```

### 不要な API 呼び出しを削減

```typescript
// キャッシュを活用
const taskCache = new Map<string, Task[]>();

export async function getCachedTasks(userId: string) {
  if (taskCache.has(userId)) {
    return taskCache.get(userId)!;
  }

  const tasks = await getAllTasksByUser(userId);
  taskCache.set(userId, tasks);

  // 5分後にキャッシュを削除
  setTimeout(() => taskCache.delete(userId), 5 * 60 * 1000);

  return tasks;
}
```

## 🔒 セキュリティのベストプラクティス

### 環境変数の管理

```bash
# .env.local には絶対コミットしない
echo ".env.local" >> .gitignore

# 本番環境では Vercel Dashboard で設定
```

### 署名検証の強化

```typescript
// すべての外部リクエストを検証
function validateRequest(req: NextApiRequest): boolean {
  const signature = req.headers['x-line-signature'] as string;
  const body = (req as any).rawBody as string;

  if (!signature || !body) {
    console.error('Missing signature or body');
    return false;
  }

  // ダイジェスト検証
  const crypto = require('crypto');
  const hash = crypto
    .createHmac('sha256', process.env.LINE_CHANNEL_SECRET)
    .update(body)
    .digest('base64');

  return hash === signature;
}
```

### Rate limiting の実装

```typescript
// Vercel の `vercel/node` で rate limiting
import { Ratelimit } from '@vercel/edge-ratelimit';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 h'),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const result = await ratelimit.limit(req.headers['x-line-user-id'] as string);
  if (!result.success) {
    return res.status(429).json({ error: 'Too many requests' });
  }
  // ... 処理続行
}
```

## 📈 スケーリング考慮事項

### 大量のユーザーに対応する場合

1. **データベースの分割**
   - ユーザー ID でシャード

2. **キャッシング戦略**
   - Redis を使用した分散キャッシュ

3. **バッチ処理の最適化**
   - リマインド送信を複数プロセスで並列化

```typescript
// 並列でリマインド送信
const chunks = Array.from(tasksByUser.entries())
  .reduce((acc, [userId, tasks], i) => {
    if (i % 100 === 0) acc.push([]);
    acc[acc.length - 1].push([userId, tasks]);
    return acc;
  }, [] as Array<Array<[string, Task[]]>>);

await Promise.all(
  chunks.map(chunk =>
    Promise.all(
      chunk.map(([userId, tasks]) =>
        sendTomorrowReminder(userId, tasks)
      )
    )
  )
);
```

## 🎯 リリースチェックリスト

デプロイ前に確認:

- [ ] `.env.local` の環境変数が本番環境に設定されている
- [ ] LINE Webhook URL が本番環境の URL に更新されている
- [ ] Supabase の Service Role Key が安全に管理されている
- [ ] Vercel Cron の時間帯が適切に設定されている
- [ ] すべてのエラーハンドリングが実装されている
- [ ] ログが適切に記録される
- [ ] データベースのインデックスが最適化されている

---

**このガイドを参考に、プロジェクトをカスタマイズしてください！**
