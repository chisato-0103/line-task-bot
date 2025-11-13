import crypto from "crypto";
import { Client, Message, TextMessage } from "@line/bot-sdk";

const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN || "";
const channelSecret = process.env.LINE_CHANNEL_SECRET || "";

export const client = new Client({
  channelAccessToken,
});

// Buffer を受け取る！
export function validateLineWebhook(rawBody: Buffer, signature: string) {
  const hash = crypto
    .createHmac("sha256", channelSecret)
    .update(rawBody)
    .digest("base64");

  return hash === signature;
}

export async function replyMessage(
  replyToken: string,
  messages: Message | Message[]
) {
  await client.replyMessage(replyToken, messages);
}

export async function pushMessage(
  userId: string,
  messages: Message | Message[]
) {
  await client.pushMessage(userId, messages);
}

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

export async function sendTomorrowReminder(
  userId: string,
  tasks: Array<{ title: string; deadline: string }>
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

export async function sendTodayReminder(
  userId: string,
  tasks: Array<{ title: string }>
) {
  if (tasks.length === 0) return;

  const taskList = tasks.map((task) => `• ${task.title}`).join("\n");

  const message: TextMessage = {
    type: "text",
    text: `🚨 本日締切の課題があります！急いで！\n\n${taskList}`,
  };

  await pushMessage(userId, message);
}
