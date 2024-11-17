import React, { useState, useEffect } from "react";
import { MessageSquare, PlusCircle, Menu, Send, X } from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface Message {
  id: number;
  content: string;
  sender: "user" | "assistant"; // Literal type for sender
  timestamp: string;
}

interface Chat {
  id: number;
  name: string;
  messages: Message[];
}

const ChatInterface: React.FC = () => {
  // Chat state holds the current active chat
  const [chats, setChats] = useState<Chat[]>([
    { id: 1, name: "Chat 1", messages: [] },
  ]);

  // Chat history holds all past chats
  const [chatHistory, setChatHistory] = useState<Chat[]>([]);
  // Current active chat
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [message, setMessage] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Set the first chat as the current chat by default if available
    if (chats.length > 0 && !currentChat) {
      setCurrentChat(chats[0]);
    }
  }, [chats, currentChat]);

  const startNewChat = () => {
    // Store the current chat in chatHistory
    if (currentChat) {
      setChatHistory((prevHistory) => [...prevHistory, currentChat]);
    }

    // Create a new chat
    const newChat: Chat = {
      id: Date.now(),
      name: `Chat ${chats.length + 1}`,
      messages: [],
    };

    setChats([...chats, newChat]);
    setCurrentChat(newChat);
    setMessage("");
    setIsLoading(false); // Reset loading state for new chat
  };

  const sendMessage = async () => {
    if (!message.trim() || !currentChat) return;

    const userMessage: Message = {
      id: Date.now(),
      content: message,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    const updatedChat = {
      ...currentChat,
      messages: [...currentChat.messages, userMessage],
    };

    const updatedChats = chats.map((chat) =>
      chat.id === currentChat.id ? updatedChat : chat
    );

    setChats(updatedChats);
    setCurrentChat(updatedChat);
    setMessage("");
    setIsLoading(true);

    try {
      const genAI = new GoogleGenerativeAI(
        "AIzaSyByRJ99xHdWj3XYzbgYAAdm4CQAz70Tapc"
      );
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: {
          candidateCount: 1,
          stopSequences: ["red"],
          maxOutputTokens: 200,
          temperature: 1.0,
          topP: 0.1,
          topK: 16,
        },
      });

      const result = await model.generateContent(message);
      const response = await result.response;
      const aiResponseText = response.text();

      const aiResponse: Message = {
        id: Date.now() + 1,
        content: aiResponseText,
        sender: "assistant",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      const updatedChatWithResponse = {
        ...updatedChat,
        messages: [...updatedChat.messages, aiResponse],
      };

      setChats(
        chats.map((chat) =>
          chat.id === currentChat.id ? updatedChatWithResponse : chat
        )
      );
      setCurrentChat(updatedChatWithResponse);
    } catch (error) {
      console.error("Error getting AI response:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 ${
          isSidebarOpen ? "left-0 w-full sm:w-64" : "-left-full"
        } bg-gray-800 transition-all duration-300 overflow-hidden`}
      >
        <div className="p-4">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-gray-400 hover:text-white sm:hidden"
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <button
            onClick={startNewChat}
            className="w-full flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <PlusCircle size={20} />
            New Chat
          </button>
        </div>
        <div className="overflow-x-auto h-full">
          {/* Display current chats */}
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setCurrentChat(chat)}
              className={`px-4 py-3 cursor-pointer flex items-center gap-2 hover:bg-gray-700 ${
                currentChat?.id === chat.id ? "bg-gray-700" : ""
              }`}
            >
              <MessageSquare size={20} className="text-gray-400" />
              <span className="text-gray-200">{chat.name}</span>
            </div>
          ))}
          {/* Display chat history */}
          <h2 className="text-gray-300 mt-4 ml-4">Chat History</h2>
          {chatHistory.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setCurrentChat(chat)}
              className="px-4 py-3 cursor-pointer flex items-center gap-2 hover:bg-gray-700"
            >
              <MessageSquare size={20} className="text-gray-400" />
              <span className="text-gray-200">{chat.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="bg-gray-800 p-4 flex items-center">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-gray-400 hover:text-white sm:hidden"
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div className="flex-col-reverse">
            <div className="p-4 bg-blue-600 text-white rounded-t-lg">
              <h1 className="text-xl font-bold">Watsonx Assistant</h1>
            </div>
            <p className="ml-4 text-xl text-white font-semibold sm:font-semibold">
              A live chat interface that allows for seamless, natural
              communication and connection.
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {currentChat?.messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  msg.sender === "user"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-700 text-gray-200"
                }`}
              >
                <p>{msg.content}</p>
                <span className="text-xs opacity-70 mt-1 block">
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-700 text-gray-200 rounded-lg p-3">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  />
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.4s" }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-gray-800">
          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={sendMessage}
              className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
