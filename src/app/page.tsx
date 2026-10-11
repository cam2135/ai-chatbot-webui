"use client";

import { useEffect, useState, useRef } from "react";
import { getChats, createChat, addMessage, getChatById, updateChatTitle, deleteChat } from "@/lib/db";
import { chat as llmChat } from "@/lib/llm";
import type { Chat, Message } from "@/lib/db";
import ChatSidebar from "@/components/ChatSidebar";
import ChatWindow from "@/components/ChatWindow";
import ModelSelector from "@/components/ModelSelector";

const MODELS = [
  { id: "local-ai", label: "Local AI (Smart)" },
  { id: "local-ai-v2", label: "Local AI v2 (Advanced)" },
  { id: "local-ai-creative", label: "Local AI (Creative)" },
];

export default function HomePage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [model, setModel] = useState("local-ai");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chats on mount
  useEffect(() => {
    const loadedChats = getChats();
    setChats(loadedChats);
    if (loadedChats.length > 0) {
      setActiveChatId(loadedChats[0].id);
    }
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats]);

  const activeChat = chats.find((chat) => chat.id === activeChatId);

  const handleNewChat = () => {
    const newChat = createChat(model);
    setChats([newChat, ...chats]);
    setActiveChatId(newChat.id);
  };

  const handleSelectChat = (chatId: string) => {
    setActiveChatId(chatId);
    setEditingChatId(null);
  };

  const handleStartEdit = (chatId: string, currentTitle: string) => {
    setEditingChatId(chatId);
    setEditTitle(currentTitle);
  };

  const handleSaveTitle = (chatId: string) => {
    if (editTitle.trim()) {
      updateChatTitle(chatId, editTitle);
      setChats(getChats());
    }
    setEditingChatId(null);
  };

  const handleDeleteChat = (chatId: string) => {
    deleteChat(chatId);
    setChats(getChats());
    if (activeChatId === chatId) {
      const remaining = getChats();
      setActiveChatId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !activeChatId || loading) return;

    const userMessage = input.trim();
    setInput("");
    setLoading(true);

    // Add user message
    addMessage(activeChatId, "user", userMessage);
    setChats(getChats());

    // Get AI response
    try {
      const currentChat = getChatById(activeChatId);
      if (currentChat) {
        const response = await llmChat(userMessage, {
          messages: currentChat.messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          model,
        });

        // Add assistant message
        addMessage(activeChatId, "assistant", response);
        setChats(getChats());
      }
    } catch (error) {
      console.error("Chat error:", error);
      addMessage(activeChatId, "assistant", "Sorry, I encountered an error. Please try again.");
      setChats(getChats());
    }

    setLoading(false);
  };

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100">
      <ChatSidebar
        chats={chats}
        activeChatId={activeChatId}
        editingChatId={editingChatId}
        editTitle={editTitle}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onStartEdit={handleStartEdit}
        onSaveTitle={handleSaveTitle}
        onDeleteChat={handleDeleteChat}
        onEditTitleChange={setEditTitle}
      />

      <div className="flex flex-col flex-1">
        <ModelSelector
          currentModel={model}
          models={MODELS}
          onModelChange={setModel}
        />

        <ChatWindow
          chat={activeChat}
          loading={loading}
          input={input}
          onInputChange={setInput}
          onSendMessage={handleSendMessage}
          messagesEndRef={messagesEndRef}
        />
      </div>
    </div>
  );
}
