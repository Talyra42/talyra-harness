export type Role = "system" | "user" | "assistant" | "tool";

// System Message
export interface SystemMessage {
  content: string;
  role: "system";
}

// User Message
export interface TextContentPart {
  type: "text";
  text: string;
}

export interface ImageContentPart {
  type: "image_url";
  image_url: {
    url: string;
  };
}

export interface FileContentPart {
  type: "file";
  file_id?: string;
  file_data?: string;
  filename?: string;
}

export interface UserMessage {
  content: string | Array<TextContentPart | ImageContentPart | FileContentPart>;
  role: "user";
}

// Assistant Message
export interface ToolCall {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
}

export interface AssistantMessage {
  content: string | null;
  role: "assistant";
  tool_calls?: Array<ToolCall>;
}

// Tool Message
export interface ToolMessage {
  role: "tool";
  tool_call_id: string;
  content:
    | string
    | Array<string | TextContentPart | ImageContentPart | FileContentPart>;
}

export type Message =
  SystemMessage | UserMessage | AssistantMessage | ToolMessage;

export interface ChatResponse {
  id: string;
  choices: Array<{
    message: AssistantMessage;
  }>;
}
