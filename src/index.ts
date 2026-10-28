import type { Message, ChatResponse } from "./types/message.ts";
import * as readline from "readline";

let messages: Array<Message> = [
  { role: "system", content: "You are a helpful assistant." },
];

const apikey = process.env.DEEPSEEK_API_KEY;
const baseurl = process.env.DEEPSEEK_BASE_URL;

if (!apikey) {
  process.exitCode = 1;
  throw new Error("APIKey 未配置");
}
if (!baseurl) {
  process.exitCode = 1;
  throw new Error("BaseUrl 未配置");
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function handler(line: string) {
  if (line.trim().length === 0) {
    process.exit(0);
  }

  messages.push({ role: "user", content: line });

  const res = await fetch(baseurl!, {
    signal: AbortSignal.timeout(30_000),
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apikey}`,
    },
    body: JSON.stringify({
      model: "deepseek-flash",
      messages,
      reasoning_effort: "low",
      stream: false,
    }),
  });

  if (res.ok) {
    const messageRes = (await res.json()) as ChatResponse;
    const message = messageRes.choices[0]?.message.content ?? "";
    console.log(message);
    messages.push({ role: "assistant", content: message });
  } else {
    console.error(res.status, res.statusText, await res.text());
    process.exitCode = 1;
  }
}

function ask() {
  rl.question("> ", async (userInput) => {
    try {
      await handler(userInput);
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
    ask();
  });
}

ask();
