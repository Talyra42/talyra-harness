import { readFile } from "node:fs/promises";
import path from "node:path";

function resolveInsideCwd(input: string): string {
  const cwd = process.cwd();
  const target = path.resolve(cwd, input);
  const rel = path.relative(cwd, target);

  if (rel === ".." || rel.startsWith(".." + path.sep) || path.isAbsolute(rel)) {
    throw new Error(`Error: 路径越界，只能访问工作目录内的文件：${input}`);
  }
  return target;
}

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
      const targetPath = resolveInsideCwd(args.path);
      return await readFile(targetPath, "utf-8");
    } catch (e) {
      return String(e);
    }
  },
};
