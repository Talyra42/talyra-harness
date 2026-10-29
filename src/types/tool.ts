export interface StanderTool {
  name: string;
  description: string;
  parameters: {
    type: "object";
    required: Array<string>;
    properties: object;
  };
  execute: (args: any) => Promise<string>;
}
