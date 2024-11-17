// Message.ts or in the same file
interface Message {
  id: number;
  content: string;
  sender: "user" | "assistant";
  timestamp: string;
}

export interface Chat {
  id: number;
  name: string;
  messages: Message[];
}
