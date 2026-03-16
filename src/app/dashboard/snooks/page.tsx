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
      // 1. Save User Message
      await addDoc(collection(db, "users", user.uid, "snooksMessages"), {
        userId: user.uid,
        role: "user",
        content: userInput,
        type: "text",
        createdAt: serverTimestamp(),
      });

      // 2. Call AI Flow
      const response = await snooksIntelligence({
        userPrompt: userInput,
        userContext: JSON.stringify({
          tone: "Authoritative",
          niche: "Solopreneur SaaS",
          platform: "Multi-channel"
        })
      });

      // 3. Construct Bot Response String
      let botContent = response.responseText;
      
      if (response.generatedContent) {
        const gc = response.generatedContent;
        if (gc.linkedinPost || gc.xTweet || gc.emailContent) {
          botContent += `\n\nGENERATED ASSETS:\n`;
          if (gc.linkedinPost) botContent += `\n[LINKEDIN]:\n${gc.linkedinPost}\n`;
          if (gc.xTweet) botContent += `\n[X]:\n${gc.xTweet}\n`;
          if (gc.emailContent) botContent += `\n[EMAIL]:\n${gc.emailContent}\n`;
        }
      }

      // 4. Save Bot Message
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
    <div className="h-full flex flex-col font-pixel">
      <div className="p-8 border-b border-black/5 bg-white/40 backdrop-blur-sm flex justify-between items-center">
        <div>
          <h1 className="text-sm font-bold uppercase tracking-tighter">Snooks <span className="text-black/40">Market</span></h1>
          <p className="text-black/40 text-[6px] font-bold uppercase tracking-[0.3em] mt-1">Unified Marketing Intelligence</p>
        </div>
        {isGenerating && (
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 rounded-full border border-amber-500/20">
            <Loader2 size={10} className="animate-spin text-amber-500" />
            <span className="text-[6px] font-bold uppercase text-amber-500">Processing...</span>
          </div>
        )}
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 p-8 overflow-y-auto space-y-8 custom-scrollbar bg-white/10"
      >
        <AnimatePresence>
          {messages?.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex gap-4 max-w-2xl",
                msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg border-2",
                msg.role === 'user' ? "bg-black border-white" : "bg-white border-black"
              )}>
                {msg.role === 'user' ? <User size={16} className="text-white" /> : <Bot size={16} />}
              </div>
              
              <div className={cn(
                "p-6 rounded-[2rem] text-[8px] leading-loose shadow-xl border-2",
                msg.role === 'user' 
                  ? "bg-black text-white border-white rounded-tr-none" 
                  : "bg-white text-black border-black rounded-tl-none"
              )}>
                {msg.type === 'content' && (
                  <div className="mb-4 p-2 bg-gray-100 rounded-xl flex items-center justify-between border border-black/5">
                    <span className="text-[5px] font-bold uppercase tracking-widest text-black/40">Intel Report</span>
                    <Edit3 size={10} className="text-black/40" />
                  </div>
                )}
                <p className="uppercase tracking-tight whitespace-pre-wrap">
                  {msg.content}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <div className="flex justify-center p-4">
            <Loader2 className="animate-spin text-black/10" size={24} />
          </div>
        )}
      </div>

      <div className="p-8 bg-white/60 border-t border-black/5 backdrop-blur-md">
        <div className="max-w-4xl mx-auto relative">
          <Input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={isGenerating}
            placeholder="Ask Snooks anything about marketing..."
            className="h-16 pl-6 pr-16 rounded-[2rem] bg-white border-2 border-black/10 focus:border-black transition-all text-[8px] uppercase font-bold"
          />
          <button 
            onClick={handleSend}
            disabled={isGenerating || !input.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-black text-white rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
