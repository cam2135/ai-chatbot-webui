"use client";

import { Trash2, Edit2, Check, X } from "lucide-react";
import type { Chat } from "@/lib/db";

interface ChatSidebarProps {
  chats: Chat[];
  activeChatId: string | null;
  editingChatId: string | null;
  editTitle: string;
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  onStartEdit: (chatId: string, currentTitle: string) => void;
  onSaveTitle: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  onEditTitleChange: (title: string) => void;
}

export default function ChatSidebar({
  chats,
  activeChatId,
  editingChatId,
  editTitle,
  onNewChat,
  onSelectChat,
  onStartEdit,
  onSaveTitle,
  onDeleteChat,
  onEditTitleChange,
}: ChatSidebarProps) {
  return (
    <aside className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col p-4">
      <button
        onClick={onNewChat}
        className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors mb-4"
      >
        + New chat
      </button>

      <div className="flex-1 overflow-y-auto space-y-2">
        {chats.length === 0 ? (
          <p className="text-slate-400 text-sm p-2">No chats yet. Create one to get started!</p>
        ) : (
          chats.map((chat) => (
            <div
              key={chat.id}
              className={`group relative p-3 rounded-lg cursor-pointer transition-colors ${
                activeChatId === chat.id
                  ? "bg-slate-700"
                  : "bg-slate-700/50 hover:bg-slate-700"
              }`}
            >
              {editingChatId === chat.id ? (
                <div className="flex gap-2">
                  <input
                    autoFocus
                    value={editTitle}
                    onChange={(e) => onEditTitleChange(e.target.value)}
                    className="flex-1 bg-slate-600 text-white text-sm px-2 py-1 rounded"
                  />
                  <button
                    onClick={() => onSaveTitle(chat.id)}
                    className="text-green-400 hover:text-green-300"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={() => setEditingChatId(null)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => onSelectChat(chat.id)}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm truncate flex-1">{chat.title}</span>
                  <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onStartEdit(chat.id, chat.title);
                      }}
                      className="text-slate-400 hover:text-blue-400 p-1"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteChat(chat.id);
                      }}
                      className="text-slate-400 hover:text-red-400 p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="pt-4 border-t border-slate-700 text-xs text-slate-500">
        <p>Chats saved locally</p>
      </div>
    </aside>
  );
}
