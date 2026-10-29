export interface StanderTool {
  name: string;
  description: string;
  parameters: object;
  execute: (args: any) => Promise<string>;
}
