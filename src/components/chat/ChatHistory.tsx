"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Trash2, Clock, ChevronRight, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatMessage, loadChatHistory, saveChatHistory } from "@/lib/encrypted-storage";

interface ChatHistoryProps {
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  currentChatId?: string;
}

interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: number;
  messages: ChatMessage[];
}

export function ChatHistory({ onSelectChat, onNewChat, currentChatId }: ChatHistoryProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load sessions on mount
  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const messages = await loadChatHistory();
      
      // Group messages into sessions
      const sessionMap = new Map<string, ChatSession>();
      
      messages.forEach((msg) => {
        // Use date as session ID (one session per day)
        const date = new Date(msg.timestamp).toDateString();
        
        if (!sessionMap.has(date)) {
          sessionMap.set(date, {
            id: date,
            title: getSessionTitle(messages.filter(m => new Date(m.timestamp).toDateString() === date)),
            lastMessage: msg.content.slice(0, 50) + (msg.content.length > 50 ? "..." : ""),
            timestamp: msg.timestamp,
            messages: [],
          });
        }
        
        const session = sessionMap.get(date)!;
        session.messages.push(msg);
      });
      
      // Convert to array and sort by timestamp
      const sessionsArray = Array.from(sessionMap.values()).sort(
        (a, b) => b.timestamp - a.timestamp
      );
      
      setSessions(sessionsArray);
    } catch (error) {
      console.error("Failed to load chat history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSessionTitle = (messages: ChatMessage[]): string => {
    // Find first user message as title
    const firstUserMsg = messages.find((m) => m.role === "user");
    if (firstUserMsg) {
      return firstUserMsg.content.slice(0, 30) + (firstUserMsg.content.length > 30 ? "..." : "");
    }
    return "New Chat";
  };

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return;
    
    // Remove messages from this session
    const allMessages = await loadChatHistory();
    const filteredMessages = allMessages.filter(
      (m) => new Date(m.timestamp).toDateString() !== sessionId
    );
    
    await saveChatHistory(filteredMessages);
    setSessions(sessions.filter((s) => s.id !== sessionId));
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
  };

  const formatTime = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="h-full flex flex-col bg-white border-r border-black/5">
      {/* Header */}
      <div className="p-4 border-b border-black/5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MessageSquare size={16} className="text-[#8c6b4f]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#8c6b4f]">
              Chat History
            </span>
          </div>
          <button
            onClick={onNewChat}
            className="p-2 hover:bg-black/5 rounded-lg transition-colors"
            title="New Chat"
          >
            <Plus size={14} className="text-[#8c6b4f]" />
          </button>
        </div>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-[#8c6b4f]/20 border-t-[#8c6b4f] rounded-full animate-spin" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="p-8 text-center">
            <MessageSquare size={32} className="mx-auto mb-3 text-black/10" />
            <p className="text-[10px] text-black/30 font-medium">
              No chat history yet
            </p>
            <button
              onClick={onNewChat}
              className="mt-4 text-[9px] font-bold uppercase tracking-wider text-[#8c6b4f] hover:underline"
            >
              Start a conversation
            </button>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {sessions.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <button
                  onClick={() => onSelectChat(session.id)}
                  className={cn(
                    "w-full p-3 rounded-xl text-left transition-all group",
                    currentChatId === session.id
                      ? "bg-[#8c6b4f]/10 border border-[#8c6b4f]/20"
                      : "hover:bg-black/5 border border-transparent"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-xs font-bold truncate",
                        currentChatId === session.id ? "text-[#8c6b4f]" : "text-black/70"
                      )}>
                        {session.title}
                      </p>
                      <p className="text-[9px] text-black/30 truncate mt-1">
                        {session.lastMessage}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[8px] text-black/20">
                        {formatTime(session.timestamp)}
                      </span>
                      <button
                        onClick={(e) => handleDeleteSession(session.id, e)}
                        className="p-1 opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded transition-all"
                      >
                        <Trash2 size={10} className="text-red-400" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <Clock size={8} className="text-black/20" />
                    <span className="text-[8px] text-black/30">
                      {formatDate(session.timestamp)}
                    </span>
                  </div>
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-black/5">
        <p className="text-[8px] text-black/20 text-center">
          🔒 Encrypted locally • Zero cloud storage
        </p>
      </div>
    </div>
  );
}

export default ChatHistory;
