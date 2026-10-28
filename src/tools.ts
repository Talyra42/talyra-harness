import { readFile } from "node:fs/promises";
import path from "node:path";

export const readFileTool = {
  name: "read_file",
  description:
    "读取指定路径的完整文本内容。路径相对于当前工作目录。返回文件的原始文本。",
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
      const pathDir = args.path;
      const targetPath = path.resolve(process.cwd(), pathDir);
      const text = await readFile(targetPath, "utf-8");
      return text;
    } catch (e) {
      return String(e);
    }
  },
};
