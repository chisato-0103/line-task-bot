import { middleware, Client, Message, TextMessage } from "@line/bot-sdk";
// import { NextApiRequest } from "next";
import crypto from "crypto";

const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN || "";
const channelSecret = process.env.LINE_CHANNEL_SECRET || "";

if (!channelAccessToken || !channelSecret) {
  throw new Error(
    "Missing LINE_CHANNEL_ACCESS_TOKEN or LINE_CHANNEL_SECRET environment variables"
  );
}

export const client = new Client({
  channelAccessToken,
});

export const lineMiddleware = middleware({
  channelSecret,
});

/**
 * Reply to a LINE message
 *
 * @param replyToken The reply token from the webhook
 * @param messages Messages to send
 */
export async function replyMessage(
  replyToken: string,
  messages: Message | Message[]
) {
  try {
    await client.replyMessage(replyToken, messages);
    console.log("Reply message sent successfully");
  } catch (error) {
    console.error("Error sending reply message:", error);
    throw error;
  }
}

/**
 * Push a message to a specific user
 *
 * @param userId The user ID to push to
 * @param messages Messages to send
 */
export async function pushMessage(
  userId: string,
  messages: Message | Message[]
) {
  try {
    await client.pushMessage(userId, messages);
    console.log("Push message sent successfully to user:", userId);
  } catch (error) {
    console.error("Error sending push message:", error);
    throw error;
  }
}

/**
 * Verify LINE webhook signature
 *
 * @param body The raw request body
 * @param signature The X-Line-Signature header value
 * @returns true if signature is valid
 */
export function verifySignature(body: string, signature: string): boolean {
  const crypto = require("crypto");
  const hash = crypto
    .createHmac("sha256", channelSecret)
    .update(body)
    .digest("base64");

  return hash === signature;
}

/**
 * Validate LINE webhook request
 * Middleware for validating webhook requests
 */
export function validateLineWebhook(rawBody: Buffer, signature: string) {
  const channelSecret = process.env.LINE_CHANNEL_SECRET!;
  const hash = crypto
    .createHmac("sha256", channelSecret)
    .update(rawBody) // ← ここが Buffer のまま！
    .digest("base64");

  return hash === signature;
}

/**
 * Send a task registration confirmation
 *
 * @param replyToken The reply token from the webhook
 * @param title Task title
 * @param deadline Task deadline (YYYY-MM-DD)
 */
export async function sendTaskConfirmation(
  replyToken: string,
  title: string,
  deadline: string
) {
  const message: TextMessage = {
    type: "text",
    text: `📝 登録したよ！\n\nタイトル：${title}\n締切：${deadline}`,
  };

  await replyMessage(replyToken, message);
}

/**
 * Send reminder messages for tasks due tomorrow
 *
 * @param userId The user ID to send reminder to
 * @param tasks Array of tasks due tomorrow
 */
export async function sendTomorrowReminder(
  userId: string,
  tasks: Array<{
    title: string;
    deadline: string;
  }>
) {
  if (tasks.length === 0) return;

  const taskList = tasks
    .map((task) => `• ${task.title} (${task.deadline})`)
    .join("\n");

  const message: TextMessage = {
    type: "text",
    text: `⏰ 明日締切の課題があります\n\n${taskList}`,
  };

  await pushMessage(userId, message);
}

/**
 * Send reminder messages for tasks due today
 *
 * @param userId The user ID to send reminder to
 * @param tasks Array of tasks due today
 */
export async function sendTodayReminder(
  userId: string,
  tasks: Array<{
    title: string;
    deadline: string;
  }>
) {
  if (tasks.length === 0) return;

  const taskList = tasks.map((task) => `• ${task.title}`).join("\n");

  const message: TextMessage = {
    type: "text",
    text: `🚨 本日締切の課題があります！急いで！\n\n${taskList}`,
  };

  await pushMessage(userId, message);
}
