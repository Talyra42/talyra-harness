import { readFile, writeFile } from "node:fs/promises";
import type { StanderTool } from "./types/tool.ts";
import path from "node:path";
import { exec } from "node:child_process";

function resolveInsideCwd(input: string): string {
  const cwd = process.cwd();
  const target = path.resolve(cwd, input);
  const rel = path.relative(cwd, target);

  if (rel === ".." || rel.startsWith(".." + path.sep) || path.isAbsolute(rel)) {
    throw new Error(`路径越界，只能访问工作目录内的文件：${input}`);
  }
  return target;
}

export const readFileTool: StanderTool = {
  name: "read_file",
  description:
    "读取指定路径的完整文本内容。路径相对于当前工作目录。返回文件的原始文本或错误提示。",
  parameters: {
    type: "object",
    properties: {
      path: {
        type: "string",
        description: "相对于当前工作目录的文件路径",
      },
    },
    required: ["path"],
  },
  execute: async (args: { path: string }) => {
    try {
      const targetPath = resolveInsideCwd(args.path);
      return await readFile(targetPath, "utf-8");
    } catch (e) {
      return String(e);
    }
  },
};

export const writeFileTool: StanderTool = {
  name: "write_file",
  description:
    "将内容写入一个文件。路径相当于当前工作区目录，写入文件代表覆盖该文件的内容。返回是否写入成功或者错误提示。",
  parameters: {
    type: "object",
    properties: {
      path: {
        type: "string",
        description: "相对于当前工作目录的文件路径",
      },
      content: {
        type: "string",
        description: "需要写入的文件内容",
      },
    },
    required: ["path", "content"],
  },
  execute: async (args: { path: string; content: string }) => {
    try {
      const targetPath = resolveInsideCwd(args.path);
      await writeFile(targetPath, args.content);
      const fileContent = await readFile(targetPath, "utf-8");
      if (fileContent === args.content) {
        return "文件写入成功。";
      } else {
        return "文件写入错误，请检查文件内容。";
      }
    } catch (e) {
      return String(e);
    }
  },
};

export const bashTool: StanderTool = {
  name: "base_tool",
  description: "在当前工作区运行一段命令。返回命令的结果。",
  parameters: {
    type: "object",
    properties: {
      command: {
        type: "string",
        description: "需要运行的命令",
      },
    },
    required: ["command"],
  },
  execute: async (args: { command: string }) => {
    const { stderr, stdout } = await exec(args.command, (error) => {
      if (error) {
        return `执行出错：${error}`;
      }
    });

    return (
      (stdout ? `标准输出：${stdout}。` : "") +
      (stderr ? `标准错误：${stderr}。` : "")
    );
  },
};
