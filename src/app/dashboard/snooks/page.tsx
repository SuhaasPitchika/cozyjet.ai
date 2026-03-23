"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, User, Bot, Loader2, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, addDoc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { snooksIntelligenceClient } from "@/ai/client";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handle = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button onClick={handle} className="p-1 rounded hover:bg-white/10 transition-colors text-white/30 hover:text-white/60">
      {copied ? <Check size={11} /> : <Copy size={11} />}
    </button>
  );
}

export default function SnooksPage() {
  const { user } = useUser();
  const db = useFirestore();
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const messagesQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, "users", user.uid, "snooksMessages"), orderBy("createdAt", "asc"));
  }, [db, user]);

  const { data: messages, isLoading } = useCollection(messagesQuery);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !user || isGenerating) return;
    const userInput = input;
    setInput("");
    setIsGenerating(true);
    try {
      await addDoc(collection(db, "users", user.uid, "snooksMessages"), {
        userId: user.uid, role: "user", content: userInput, type: "text", createdAt: serverTimestamp(),
      });
      const response = await snooksIntelligenceClient({
        userPrompt: userInput,
        userContext: JSON.stringify({ tone: "Authoritative but Empathic", niche: "Solopreneur SaaS", platform: "Multi-channel" }),
      });
      let botContent = response.responseText ?? "";
      const gc = response.generatedContent;
      if (gc?.linkedinPost || gc?.xTweet || gc?.emailContent) {
        botContent += `\n\n---\n`;
        if (gc.linkedinPost) botContent += `**LinkedIn:**\n${gc.linkedinPost}\n\n`;
        if (gc.xTweet) botContent += `**X / Twitter:**\n${gc.xTweet}\n\n`;
        if (gc.emailContent) botContent += `**Email:**\n${gc.emailContent}`;
      }
      await addDoc(collection(db, "users", user.uid, "snooksMessages"), {
        userId: user.uid, role: "bot", content: botContent.trim(), type: gc ? "content" : "text", createdAt: serverTimestamp(),
      });
    } catch (e) {
      console.error("Snooks error:", e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-full bg-[#0f0f0f] flex flex-col">
      {/* Header */}
      <div className="px-8 py-5 border-b border-white/5 flex items-center justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
            <span className="text-[11px] text-white/30 font-medium uppercase tracking-widest">Marketing Agent</span>
          </div>
          <h1 className="text-lg font-semibold text-white tracking-tight">Snooks</h1>
        </div>
        {isGenerating && (
          <div className="flex items-center gap-2">
            <Loader2 size={12} className="animate-spin text-white/30" />
            <span className="text-[11px] text-white/40">Generating strategy...</span>
          </div>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
        {!isLoading && messages?.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center gap-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
              <Sparkles size={18} className="text-white/20" />
            </div>
            <div>
              <p className="text-sm font-medium text-white/40">Start a conversation with Snooks</p>
              <p className="text-xs text-white/20 mt-1 max-w-xs">
                Ask for LinkedIn posts, marketing strategy, tweet threads, email campaigns, or positioning advice.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              {["Write a LinkedIn post about my new feature", "Give me a tweet thread idea", "Help me write a cold email"].map((s) => (
                <button
                  key={s}
                  onClick={() => setInput(s)}
                  className="text-[11px] px-3 py-1.5 rounded-lg bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence>
          {messages?.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn("flex gap-3 max-w-3xl", msg.role === "user" ? "ml-auto flex-row-reverse" : "")}
            >
              <div
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                  msg.role === "user" ? "bg-white/10" : "bg-white/5"
                )}
              >
                {msg.role === "user" ? (
                  <User size={12} className="text-white/50" />
                ) : (
                  <Bot size={12} className="text-white/50" />
                )}
              </div>
              <div
                className={cn(
                  "px-4 py-3 rounded-2xl text-sm leading-relaxed max-w-[80%] relative group",
                  msg.role === "user"
                    ? "bg-white text-black rounded-tr-sm"
                    : "bg-white/5 text-white/70 rounded-tl-sm border border-white/5"
                )}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
                {msg.role === "bot" && (
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <CopyButton text={msg.content} />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isGenerating && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center shrink-0">
              <Bot size={12} className="text-white/50" />
            </div>
            <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-white/5 border border-white/5">
              <Loader2 size={12} className="animate-spin text-white/30" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-8 py-4 border-t border-white/5 shrink-0">
        <div className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3 focus-within:ring-1 focus-within:ring-white/10 transition-all">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            disabled={isGenerating}
            placeholder="Ask for strategy, content, or positioning advice..."
            className="flex-1 bg-transparent text-sm text-white/80 placeholder:text-white/20 outline-none"
          />
          <button
            onClick={handleSend}
            disabled={isGenerating || !input.trim()}
            className="p-2 rounded-lg bg-white text-black disabled:opacity-20 hover:bg-white/90 transition-colors shrink-0"
          >
            <Send size={13} />
          </button>
        </div>
        <p className="text-[10px] text-white/20 mt-2 text-center">
          Powered by OpenRouter · Snooks is your marketing intelligence agent
        </p>
      </div>
    </div>
  );
}
