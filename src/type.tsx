export interface Message {
  id: string;
  text: string;
  sender: "user" | "assistant";
  timestamp: Date;
}

export interface Chat {
  id: string;
  messages: Message[];
  title: string;
  sessionId?: string;
}

export const API_KEY = "AAIzaSyCXqRBwY3keyKEAqHrBv1DrfiWrWL9FFJA";
