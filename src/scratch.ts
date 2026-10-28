import type { Message, ChatResponse } from "./types/message.ts";

const messages: Array<Message> = [
  { role: "system", content: "You are a helpful assistant." },
  { role: "user", content: "你好！" },
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

const res = await fetch(baseurl, {
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
  const message = (await res.json()) as ChatResponse;
  console.log(message.choices[0]?.message.content);
} else {
  console.error(res.status, res.statusText, await res.text());
  process.exitCode = 1;
}
