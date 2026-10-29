import type { Message, ChatResponse, ToolMessage } from "./types/message.ts";
import * as readline from "readline";
import { readFileTool } from "./tools.ts";

const MAX_STEPS = 30;

const tools = [
  {
    type: "function",
    function: {
      description: readFileTool.description,
      name: readFileTool.name,
      parameters: readFileTool.parameters,
    },
  },
];

const toolExecutes = {
  [readFileTool.name]: readFileTool.execute,
};

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

  let currentStep = 1;

  while (currentStep <= MAX_STEPS) {
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
        tools,
      }),
    });

    if (res.ok) {
      const messageRes = (await res.json()) as ChatResponse;
      const content = messageRes.choices[0]?.message.content;
      if (content) console.log(content);

      if (
        messageRes.choices &&
        messageRes.choices[0] &&
        messageRes.choices[0].message
      ) {
        messages.push(messageRes.choices[0].message);

        if (messageRes.choices[0].message.tool_calls) {
          const toolMessages: ToolMessage[] = [];

          for (let tool of messageRes.choices[0].message.tool_calls) {
            try {
              // pre act
              const targetTool = toolExecutes[tool.function.name];
              const params = JSON.parse(tool.function.arguments);

              if (targetTool) {
                const toolRes = await targetTool(params);
                toolMessages.push({
                  role: "tool",
                  tool_call_id: tool.id,
                  content: toolRes,
                });
              } else {
                throw new Error(`工具 ${tool.function.name} 不存在，请重试`);
              }
            } catch (e) {
              toolMessages.push({
                role: "tool",
                tool_call_id: tool.id,
                content: String(e),
              });
            }
          }

          messages.push(...toolMessages);
        } else {
          break;
        }
      } else {
        break;
      }
    } else {
      console.error(res.status, res.statusText, await res.text());
      process.exitCode = 1;
      break;
    }

    currentStep++;
  }

  if (currentStep > MAX_STEPS) {
    console.log("超出轮次限制");
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
