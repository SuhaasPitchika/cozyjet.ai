"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, 
  Bot, 
  Sparkles, 
  Eye, 
  Clock, 
  Target, 
  ChevronLeft,
  Paperclip,
  Mic,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { skippyChatClient as skippyChat, skippyScreenAnalysisClient as skippyScreenAnalysis } from "@/ai/client";
import { saveChatHistory, loadChatHistory, ChatMessage } from "@/lib/encrypted-storage";
import dynamic from "next/dynamic";

// Dynamic import for 3D character
const Skippy3DCharacter = dynamic(
  () => import("@/components/3d/SkippyCharacter").then((mod) => mod.Skippy3DCharacter),
  { ssr: false, loading: () => <div className="w-16 h-16 animate-pulse bg-[#8c6b4f]/20 rounded-full" /> }
);

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export default function SkippyCVPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isObserving, setIsObserving] = useState(false);
  const [screenContext, setScreenContext] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load history on mount
  useEffect(() => {
    const loadHistory = async () => {
      const history = await loadChatHistory();
      if (history.length > 0) {
        setMessages(history.map(h => ({
          id: `${h.timestamp}-${h.role}`,
          role: h.role,
          content: h.content,
          timestamp: h.timestamp,
        })));
      } else {
        // Welcome message
        setMessages([{
          id: "welcome",
          role: "assistant",
          content: "Hi! I'm Skippy, your intelligent workspace observer. I can help you understand your work patterns, suggest next steps, or just chat. What would you like to explore?",
          timestamp: Date.now(),
        }]);
      }
    };
    loadHistory();
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const result = await skippyChat({
        userMessage: input,
        currentView: "/dashboard/skippy/cv",
        observationContext: isObserving ? "User is in active observation mode" : "User is browsing dashboard",
        screenContext: screenContext || undefined,
      });

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: result.response,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Save to encrypted storage
      const allMessages = [...messages, userMessage, assistantMessage];
      await saveChatHistory(allMessages.map(m => ({
        id: m.id,
        role: m.role,
        content: m.content,
        timestamp: m.timestamp,
      })));

    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "I encountered an error. Please try again.",
        timestamp: Date.now(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScreenAnalysis = async () => {
    if (!isObserving) {
      setIsObserving(true);
      setScreenContext("Active workspace observation enabled. I'll analyze your work patterns.");
      return;
    }

    // Simulate screen analysis
    try {
      const result = await skippyScreenAnalysis({
        screenContent: "Code editor with React components",
        activeApp: "VS Code",
        recentActions: ["typing", "saving file", "opening terminal"],
      });

      setScreenContext(result.understanding);
    } catch (error) {
      console.error("Screen analysis error:", error);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#fdfaf5]">
      {/* Header */}
      <div className="p-6 border-b border-black/5 flex items-center justify-between bg-white/50">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="text-[#8c6b4f]" onClick={() => window.history.back()}>
            <ChevronLeft size={16} />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden">
              <Skippy3DCharacter isActive={isObserving} size="small" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-[#8c6b4f]">Skippy</h1>
              <p className="text-[8px] text-[#8c6b4f]/50 uppercase tracking-wider">
                {isObserving ? "Observing workspace" : "Ready to assist"}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={isObserving ? "default" : "outline"}
            size="sm"
            onClick={handleScreenAnalysis}
            className={cn(
              "text-[9px] font-bold uppercase tracking-wider",
              isObserving ? "bg-amber-500 text-black hover:bg-amber-600" : ""
            )}
          >
            <Eye size={12} className="mr-1" />
            {isObserving ? "Observing" : "Observe"}
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex gap-3",
                msg.role === "user" ? "flex-row-reverse" : ""
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                msg.role === "assistant" ? "bg-[#8c6b4f]" : "bg-black/10"
              )}>
                {msg.role === "assistant" ? (
                  <Bot size={14} className="text-white" />
                ) : (
                  <span className="text-[8px] font-bold text-black/40">You</span>
                )}
              </div>
              
              <div className={cn(
                "max-w-[75%] p-4 rounded-2xl text-xs leading-relaxed",
                msg.role === "assistant" 
                  ? "bg-[#8c6b4f]/10 text-[#8c6b4f] rounded-tl-none" 
                  : "bg-white border border-black/5 text-black/70 rounded-tr-none"
              )}>
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-[#8c6b4f] flex items-center justify-center">
              <Bot size={14} className="text-white" />
            </div>
            <div className="bg-[#8c6b4f]/10 px-4 py-3 rounded-2xl rounded-tl-none">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-[#8c6b4f]/30 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-[#8c6b4f]/30 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-[#8c6b4f]/30 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-black/5 bg-white/50">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="text-black/30 hover:text-[#8c6b4f]">
            <Paperclip size={16} />
          </Button>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask Skippy anything..."
            disabled={isLoading}
            className="flex-1 bg-[#fdfaf5] border-black/5 focus:ring-[#8c6b4f]/20"
          />
          <Button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-[#8c6b4f] hover:bg-[#6b523c] text-white"
          >
            <Send size={16} />
          </Button>
        </div>
        
        {/* Context indicator */}
        {isObserving && (
          <div className="mt-2 flex items-center gap-2 text-[8px] text-[#8c6b4f]/50">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
            <span>Observing: {screenContext || "Workspace active"}</span>
          </div>
        )}
      </div>
    </div>
  );
}
