import type { NextApiRequest, NextApiResponse } from 'next';
import { getTasksDueTomorrow, getTasksDueToday } from '@/lib/supabase';
import { sendTomorrowReminder, sendTodayReminder } from '@/lib/line';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET requests (Vercel Cron uses GET)
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify the request is from Vercel (optional but recommended)
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${process.env.VERCEL_CRON_SECRET}`) {
    // If no secret is configured, we'll still process for local testing
    if (process.env.VERCEL_CRON_SECRET) {
      console.warn('Invalid cron authorization');
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  try {
    // Send reminders for tasks due tomorrow
    const tomorrowTasksByUser = await getTasksDueTomorrow();
    let tomorrowCount = 0;

    for (const [userId, tasks] of tomorrowTasksByUser) {
      try {
        await sendTomorrowReminder(
          userId,
          tasks.map((t) => ({
            title: t.title,
            deadline: t.deadline,
          }))
        );
        tomorrowCount += tasks.length;
        console.log(`Sent tomorrow reminder to ${userId} for ${tasks.length} task(s)`);
      } catch (error) {
        console.error(`Failed to send reminder to ${userId}:`, error);
      }
    }

    // Send reminders for tasks due today
    const todayTasksByUser = await getTasksDueToday();
    let todayCount = 0;

    for (const [userId, tasks] of todayTasksByUser) {
      try {
        await sendTodayReminder(
          userId,
          tasks.map((t) => ({
            title: t.title,
            deadline: t.deadline,
          }))
        );
        todayCount += tasks.length;
        console.log(`Sent today reminder to ${userId} for ${tasks.length} task(s)`);
      } catch (error) {
        console.error(`Failed to send reminder to ${userId}:`, error);
      }
    }

    res.status(200).json({
      success: true,
      remindersSentTomorrow: tomorrowCount,
      remindersSentToday: todayCount,
      totalReminders: tomorrowCount + todayCount,
    });
  } catch (error) {
    console.error('Error processing reminders:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
