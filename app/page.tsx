import React from 'react';

export default function Home() {
  return (
    <main style={styles.main}>
      <div style={styles.container}>
        <h1 style={styles.title}>📚 課題管理 LINE Bot</h1>
        <div style={styles.content}>
          <section style={styles.section}>
            <h2 style={styles.subtitle}>使い方</h2>
            <ol style={styles.list}>
              <li>LINE Bot を友だち登録する</li>
              <li>課題を送信: 「明日までに数学の宿題」</li>
              <li>自動で課題を保存</li>
              <li>締切前日と当日にリマインド通知が届く</li>
            </ol>
          </section>

          <section style={styles.section}>
            <h2 style={styles.subtitle}>日付の指定方法</h2>
            <ul style={styles.list}>
              <li>「明日までに...」</li>
              <li>「来週までに...」</li>
              <li>「11月20日までに...」</li>
              <li>「2日後までに...」</li>
              <li>「今週末までに...」</li>
            </ul>
          </section>

          <section style={styles.section}>
            <h2 style={styles.subtitle}>機能</h2>
            <ul style={styles.list}>
              <li>✅ 日本語の自然な日付解析</li>
              <li>✅ Supabase に自動保存</li>
              <li>✅ 締切前日 20:00 にリマインド</li>
              <li>✅ 締切当日にも通知</li>
              <li>✅ 複数課題の管理対応</li>
            </ul>
          </section>

          <section style={styles.section}>
            <h2 style={styles.subtitle}>技術構成</h2>
            <ul style={styles.list}>
              <li>🚀 Next.js 14 (App Router)</li>
              <li>⚡ Vercel Serverless Functions</li>
              <li>🗄️ Supabase PostgreSQL</li>
              <li>💬 LINE Messaging API</li>
              <li>📅 Chrono-node (日付解析)</li>
            </ul>
          </section>

          <section style={styles.section}>
            <h2 style={styles.subtitle}>セットアップ</h2>
            <pre style={styles.code}>
{`# インストール
npm install

# 環境変数を設定
# .env.local ファイルを作成して以下を設定:
# LINE_CHANNEL_ACCESS_TOKEN=...
# LINE_CHANNEL_SECRET=...
# SUPABASE_URL=...
# SUPABASE_SERVICE_ROLE_KEY=...

# 開発サーバー起動
npm run dev

# ビルド
npm run build`}
            </pre>
          </section>

          <section style={styles.section}>
            <h2 style={styles.subtitle}>Supabase テーブル設定</h2>
            <p>tasks テーブルを以下のスキーマで作成してください:</p>
            <pre style={styles.code}>
{`CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  deadline DATE NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  done BOOLEAN DEFAULT false
);

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_deadline ON tasks(deadline);`}
            </pre>
          </section>

          <div style={styles.footer}>
            <p>大学生向け課題管理 LINE Bot</p>
            <p style={styles.small}>
              Webhook: <code>{process.env.NEXT_PUBLIC_BASE_URL}/api/webhook</code>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px',
  },
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
  },
  content: {
    padding: '40px',
  },
  title: {
    margin: '0 0 30px 0',
    color: '#333',
    fontSize: '2.5em',
    textAlign: 'center',
  },
  subtitle: {
    color: '#667eea',
    fontSize: '1.3em',
    marginTop: '25px',
    marginBottom: '15px',
  },
  section: {
    marginBottom: '30px',
  },
  list: {
    lineHeight: '1.8',
    color: '#555',
    paddingLeft: '25px',
  },
  code: {
    background: '#f5f5f5',
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '15px',
    overflow: 'auto',
    fontSize: '0.9em',
    fontFamily: 'Courier New, monospace',
  },
  footer: {
    marginTop: '40px',
    paddingTop: '20px',
    borderTop: '1px solid #eee',
    textAlign: 'center',
    color: '#999',
  },
  small: {
    fontSize: '0.85em',
  },
};
