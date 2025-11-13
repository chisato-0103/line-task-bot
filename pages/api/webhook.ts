import type { NextApiRequest, NextApiResponse } from "next";
import { validateLineWebhook, sendTaskConfirmation } from "@/lib/line";
import { parseTask } from "@/lib/parseTask";
import { insertTask } from "@/lib/supabase";

export const config = {
  api: {
    bodyParser: false,
  },
};

async function getRawBody(req: NextApiRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const rawBody = await getRawBody(req);
    const signature = req.headers["x-line-signature"] as string;

    // ★ 重要：rawBody と signature を渡す！
    if (!validateLineWebhook(rawBody.toString(), signature)) {
      console.warn("Invalid LINE webhook signature");
      return res.status(401).json({ error: "Unauthorized" });
    }

    const body = JSON.parse(rawBody.toString());
    const { events } = body;

    if (!events) return res.status(400).json({ error: "Invalid request body" });

    for (const event of events) {
      if (event.type === "message" && event.message.type === "text") {
        const { userId, replyToken } = event.source;
        const { text } = event.message;

        console.log(`Received message: ${text}`);

        const parsed = parseTask(text);
        if (!parsed) {
          await sendTaskConfirmation(
            replyToken,
            "メッセージが理解できませんでした",
            "例：「明日までに数学の宿題」"
          );
          continue;
        }

        const result = await insertTask({
          user_id: userId,
          title: parsed.title,
          deadline: parsed.deadline,
        });

        if (result) {
          await sendTaskConfirmation(replyToken, parsed.title, parsed.deadline);
        } else {
          await sendTaskConfirmation(
            replyToken,
            "エラーが発生しました",
            "もう一度試してください"
          );
        }
      }
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}
