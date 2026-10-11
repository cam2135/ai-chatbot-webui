// JSON-based chat storage

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

export type Chat = {
  id: string;
  title: string;
  model: string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
};

export type DbData = {
  chats: Chat[];
};

// In-memory storage (persists during session)
let dbData: DbData = {
  chats: [],
};

// Initialize from localStorage if available
if (typeof window !== "undefined") {
  const stored = localStorage.getItem("chatbot_db");
  if (stored) {
    try {
      dbData = JSON.parse(stored);
    } catch (e) {
      console.error("Failed to load from localStorage");
    }
  }
}

function saveToStorage() {
  if (typeof window !== "undefined") {
    localStorage.setItem("chatbot_db", JSON.stringify(dbData));
  }
}

export function getChats(): Chat[] {
  return dbData.chats;
}

export function createChat(model = "local-ai"): Chat {
  const now = new Date().toISOString();
  const chat: Chat = {
    id: `chat_${Date.now()}`,
    title: "New chat",
    model,
    createdAt: now,
    updatedAt: now,
    messages: [],
  };

  dbData.chats.unshift(chat);
  saveToStorage();
  return chat;
}

export function addMessage(
  chatId: string,
  role: "user" | "assistant",
  content: string
): Message | null {
  const chat = dbData.chats.find((c) => c.id === chatId);
  if (!chat) return null;

  const msg: Message = {
    id: `msg_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    role,
    content,
    createdAt: new Date().toISOString(),
  };

  chat.messages.push(msg);
  chat.updatedAt = new Date().toISOString();

  // Auto-title from first user message
  if (chat.title === "New chat" && chat.messages.length > 0 && role === "user") {
    chat.title = content.slice(0, 40) || "New chat";
  }

  saveToStorage();
  return msg;
}

export function getChatById(chatId: string): Chat | undefined {
  return dbData.chats.find((c) => c.id === chatId);
}

export function updateChatTitle(chatId: string, title: string): void {
  const chat = dbData.chats.find((c) => c.id === chatId);
  if (chat) {
    chat.title = title;
    chat.updatedAt = new Date().toISOString();
    saveToStorage();
  }
}

export function deleteChat(chatId: string): void {
  dbData.chats = dbData.chats.filter((c) => c.id !== chatId);
  saveToStorage();
}

export function exportChats(): string {
  return JSON.stringify(dbData, null, 2);
}

export function importChats(jsonString: string): boolean {
  try {
    const imported = JSON.parse(jsonString);
    if (imported.chats && Array.isArray(imported.chats)) {
      dbData = imported;
      saveToStorage();
      return true;
    }
  } catch (e) {
    console.error("Failed to import chats");
  }
  return false;
}
