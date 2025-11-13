import type { NextApiRequest, NextApiResponse } from 'next';
import { validateLineWebhook, sendTaskConfirmation } from '@/lib/line';
import { parseTask } from '@/lib/parseTask';
import { insertTask } from '@/lib/supabase';

// Disable bodyParser to get raw body for signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

async function getRawBody(req: NextApiRequest): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => {
      resolve(data);
    });
    req.on('error', reject);
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get raw body for signature verification
    const rawBody = await getRawBody(req);
    (req as any).rawBody = rawBody;

    // Validate webhook signature
    if (!validateLineWebhook(req)) {
      console.warn('Invalid LINE webhook signature');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Parse the webhook body
    const body = JSON.parse(rawBody);
    const { events } = body;

    if (!events || !Array.isArray(events)) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    // Process each event
    for (const event of events) {
      if (event.type === 'message' && event.message.type === 'text') {
        const { userId, replyToken } = event.source;
        const { text } = event.message;

        console.log(`Received message from user ${userId}: ${text}`);

        // Parse task from message
        const parsed = parseTask(text);

        if (!parsed) {
          // If we can't parse a date, send a helpful message
          await sendTaskConfirmation(
            replyToken,
            'メッセージが理解できませんでした',
            '形式例：「明日までに数学の宿題」'
          );
          continue;
        }

        // Insert task to database
        const result = await insertTask({
          user_id: userId,
          title: parsed.title,
          deadline: parsed.deadline,
        });

        if (result) {
          // Send confirmation
          await sendTaskConfirmation(replyToken, parsed.title, parsed.deadline);
          console.log(`Task registered: ${parsed.title} (${parsed.deadline})`);
        } else {
          await sendTaskConfirmation(replyToken, 'エラーが発生しました', 'もう一度試してください');
        }
      }
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
