"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, User, Bot, Loader2, Copy, Check, Linkedin, Twitter, Mail, TrendingUp, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, addDoc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { useDashboardStore } from "@/hooks/use-dashboard-store";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/30 hover:text-white/70"
    >
      {copied ? <Check size={11} /> : <Copy size={11} />}
    </button>
  );
}

function ContentBlock({ type, content }: { type: string; content: string | string[] }) {
  const icons: Record<string, React.ReactNode> = {
    linkedin: <Linkedin size={11} />,
    twitter: <Twitter size={11} />,
    email: <Mail size={11} />,
    growth: <TrendingUp size={11} />,
    hooks: <Lightbulb size={11} />,
  };
  const labels: Record<string, string> = {
    linkedin: "LinkedIn Post",
    twitter: "X / Twitter Thread",
    email: "Email",
    growth: "Growth Hack",
    hooks: "SEO Hooks",
  };
  const text = Array.isArray(content) ? content.join("\n") : content;
  if (!text) return null;
  return (
    <div className="mt-3 rounded-xl overflow-hidden border border-white/8">
      <div className="flex items-center justify-between px-3 py-2 bg-white/5">
        <div className="flex items-center gap-1.5 text-[10px] text-white/40 font-medium">
          {icons[type]}
          <span className="uppercase tracking-wider">{labels[type]}</span>
        </div>
        <CopyButton text={text} />
      </div>
      <div className="px-3 py-2.5 text-xs text-white/55 leading-relaxed whitespace-pre-wrap bg-white/[0.02]">
        {text}
      </div>
    </div>
  );
}

const STARTER_PROMPTS = [
  "Write a viral LinkedIn post about shipping a new feature",
  "Give me a Twitter thread on how I built my AI startup",
  "What's the fastest way to grow from 0 to 1k Twitter followers?",
  "Write a cold email to get my first 10 SaaS customers",
  "Give me 5 SEO hooks for a productivity app",
];

export default function SnooksPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { assistanceMsg } = useDashboardStore();
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [localMessages, setLocalMessages] = useState<any[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const messagesQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, "users", user.uid, "snooksMessages"), orderBy("createdAt", "asc"));
  }, [db, user]);

  const { data: savedMessages, isLoading } = useCollection(messagesQuery);

  const allMessages = savedMessages?.length ? savedMessages : localMessages;

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [allMessages, isGenerating]);

  const handleSend = async (promptOverride?: string) => {
    const userInput = promptOverride || input;
    if (!userInput.trim() || isGenerating) return;
    setInput("");

    const userMsg = { id: Date.now().toString(), role: "user", content: userInput, createdAt: new Date() };
    setLocalMessages((p) => [...p, userMsg]);
    setIsGenerating(true);

    try {
      if (user) {
        await addDoc(collection(db, "users", user.uid, "snooksMessages"), {
          userId: user.uid, role: "user", content: userInput, createdAt: serverTimestamp(),
        });
      }

      const response = await fetch("/api/ai/snooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userPrompt: userInput,
          skippyContext: assistanceMsg || "",
          userContext: { tone: "Authoritative but Empathic", niche: "Solopreneur SaaS", platform: "Multi-channel" },
        }),
      });

      if (!response.ok) throw new Error("API error");
      const data = await response.json();

      const gc = data.generatedContent || {};
      const botMsg = {
        id: (Date.now() + 1).toString(),
        role: "bot",
        content: data.responseText || "",
        generatedContent: {
          linkedin: gc.linkedinPost,
          twitter: gc.xThread,
          email: gc.emailContent,
          growth: gc.growthHack,
          hooks: gc.seoHooks,
        },
        createdAt: new Date(),
      };
      setLocalMessages((p) => [...p, botMsg]);

      if (user) {
        await addDoc(collection(db, "users", user.uid, "snooksMessages"), {
          userId: user.uid,
          role: "bot",
          content: data.responseText || "",
          createdAt: serverTimestamp(),
        });
      }
    } catch (e) {
      console.error("Snooks error:", e);
      setLocalMessages((p) => [...p, { id: "err", role: "bot", content: "Failed to generate. Try again.", createdAt: new Date() }]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isEmpty = !isLoading && allMessages.length === 0;

  return (
    <div className="h-full bg-[#0f0f0f] flex flex-col">
      {/* Header */}
      <div className="px-8 py-5 border-b border-white/5 flex items-center justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
            <span className="text-[11px] text-white/30 font-medium uppercase tracking-widest">Marketing Agent · Snooks</span>
          </div>
          <h1 className="text-lg font-semibold text-white tracking-tight">Marketing Intelligence</h1>
        </div>
        {isGenerating && (
          <div className="flex items-center gap-2">
            <Loader2 size={12} className="animate-spin text-white/30" />
            <span className="text-[11px] text-white/40">Generating strategy...</span>
          </div>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-8 py-6">
        {isEmpty ? (
          <div className="h-full flex flex-col items-center justify-center gap-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center">
              <Sparkles size={22} className="text-white/20" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white/60">Snooks is ready</h2>
              <p className="text-xs text-white/25 mt-1.5 max-w-xs leading-relaxed">
                Ask for viral content, SEO hooks, growth playbooks, email campaigns, or social media strategy.
              </p>
            </div>
            <div className="flex flex-col gap-2 w-full max-w-md">
              {STARTER_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => handleSend(p)}
                  className="text-left text-xs px-4 py-3 rounded-xl bg-white/[0.03] border border-white/5 text-white/40 hover:bg-white/[0.06] hover:text-white/60 hover:border-white/10 transition-all"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6 max-w-3xl mx-auto">
            <AnimatePresence initial={false}>
              {allMessages.map((msg: any, i: number) => (
                <motion.div
                  key={msg.id || i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn("flex gap-3", msg.role === "user" ? "flex-row-reverse" : "")}
                >
                  <div className={cn("w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                    msg.role === "user" ? "bg-white/10" : "bg-white/5")}>
                    {msg.role === "user" ? <User size={12} className="text-white/50" /> : <Bot size={12} className="text-white/50" />}
                  </div>
                  <div className={cn("max-w-[80%] relative group", msg.role === "user" ? "items-end" : "")}>
                    <div className={cn("px-4 py-3 rounded-2xl text-sm leading-relaxed",
                      msg.role === "user"
                        ? "bg-white text-black rounded-tr-sm"
                        : "bg-white/[0.04] text-white/70 rounded-tl-sm border border-white/5"
                    )}>
                      {msg.content}
                    </div>

                    {/* Generated content blocks */}
                    {msg.generatedContent && (
                      <div className="mt-2 space-y-2">
                        {msg.generatedContent.linkedin && <ContentBlock type="linkedin" content={msg.generatedContent.linkedin} />}
                        {msg.generatedContent.twitter && <ContentBlock type="twitter" content={msg.generatedContent.twitter} />}
                        {msg.generatedContent.email && <ContentBlock type="email" content={msg.generatedContent.email} />}
                        {msg.generatedContent.growth && <ContentBlock type="growth" content={msg.generatedContent.growth} />}
                        {msg.generatedContent.hooks && <ContentBlock type="hooks" content={msg.generatedContent.hooks} />}
                      </div>
                    )}

                    {msg.role === "bot" && (
                      <div className="absolute -top-1 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
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
                <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-white/[0.04] border border-white/5">
                  <div className="flex gap-1">
                    {[0,1,2].map(i => (
                      <motion.div key={i} animate={{ opacity: [0.3,1,0.3], y: [0,-3,0] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: i*0.15 }}
                        className="w-1.5 h-1.5 rounded-full bg-white/30"
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-8 py-4 border-t border-white/5 shrink-0">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end gap-3 bg-white/[0.04] rounded-2xl px-4 py-3 border border-white/5 focus-within:border-white/10 transition-all">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isGenerating}
              placeholder="Ask for content, strategy, growth hacks..."
              rows={1}
              className="flex-1 bg-transparent text-sm text-white/80 placeholder:text-white/20 outline-none resize-none min-h-[24px] max-h-32"
              style={{ lineHeight: "1.5rem" }}
            />
            <button
              onClick={() => handleSend()}
              disabled={isGenerating || !input.trim()}
              className="p-2.5 rounded-xl bg-white text-black disabled:opacity-20 hover:bg-white/90 transition-colors shrink-0 self-end"
            >
              <Send size={13} />
            </button>
          </div>
          <p className="text-[10px] text-white/15 mt-2 text-center">
            Snooks generates platform-native viral content · Powered by OpenRouter
          </p>
        </div>
      </div>
    </div>
  );
}
