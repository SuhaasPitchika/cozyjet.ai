"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Sparkles, User, Bot, Edit3, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, addDoc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { snooksIntelligence } from "@/ai/flows/snooks-generate-marketing-content";

export default function SnooksPage() {
  const { user } = useUser();
  const db = useFirestore();
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const messagesQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(db, "users", user.uid, "snooksMessages"),
      orderBy("createdAt", "asc")
    );
  }, [db, user]);

  const { data: messages, isLoading } = useCollection(messagesQuery);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !user || isGenerating) return;

    const userInput = input;
    setInput("");
    setIsGenerating(true);

    try {
      await addDoc(collection(db, "users", user.uid, "snooksMessages"), {
        userId: user.uid,
        role: "user",
        content: userInput,
        type: "text",
        createdAt: serverTimestamp(),
      });

      const response = await snooksIntelligence({
        userPrompt: userInput,
        userContext: JSON.stringify({
          tone: "Authoritative but Empathic",
          niche: "Solopreneur SaaS",
          platform: "Multi-channel"
        })
      });

      let botContent = response.responseText;
      if (response.generatedContent) {
        const gc = response.generatedContent;
        if (gc.linkedinPost || gc.xTweet || gc.emailContent) {
          botContent += `\n\n### Generated Drafts\n`;
          if (gc.linkedinPost) botContent += `\n**LinkedIn:**\n${gc.linkedinPost}\n`;
          if (gc.xTweet) botContent += `\n**X:**\n${gc.xTweet}\n`;
          if (gc.emailContent) botContent += `\n**Email:**\n${gc.emailContent}\n`;
        }
      }

      await addDoc(collection(db, "users", user.uid, "snooksMessages"), {
        userId: user.uid,
        role: "bot",
        content: botContent,
        type: response.generatedContent ? "content" : "text",
        createdAt: serverTimestamp(),
      });

    } catch (error) {
      console.error("Snooks Error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="px-8 py-5 border-b border-gray-50 flex justify-between items-center">
        <div>
          <h1 className="text-sm font-bold tracking-tight">Marketing Intelligence</h1>
          <p className="text-[10px] text-gray-400 font-medium">Snooks AI Agent</p>
        </div>
        {isGenerating && (
          <div className="flex items-center gap-2">
            <Loader2 size={12} className="animate-spin text-gray-300" />
            <span className="text-[10px] text-gray-400">Processing request...</span>
          </div>
        )}
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 p-8 overflow-y-auto space-y-6 custom-scrollbar"
      >
        <AnimatePresence>
          {messages?.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex gap-4 max-w-3xl",
                msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border",
                msg.role === 'user' ? "bg-gray-50 border-gray-100" : "bg-black border-black"
              )}>
                {msg.role === 'user' ? <User size={14} /> : <Bot size={14} className="text-white" />}
              </div>
              
              <div className={cn(
                "p-4 rounded-xl text-xs leading-relaxed shadow-sm",
                msg.role === 'user' 
                  ? "bg-gray-50 text-black rounded-tr-none" 
                  : "bg-white border border-gray-100 text-black rounded-tl-none"
              )}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <div className="flex justify-center p-4">
            <Loader2 className="animate-spin text-gray-100" size={20} />
          </div>
        )}
      </div>

      <div className="p-6 border-t border-gray-50">
        <div className="max-w-3xl mx-auto relative">
          <Input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={isGenerating}
            placeholder="Ask Snooks to draft content or strategy..."
            className="h-12 pl-5 pr-12 rounded-xl border-gray-100 text-xs shadow-none"
          />
          <button 
            onClick={handleSend}
            disabled={isGenerating || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-all disabled:opacity-20"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}