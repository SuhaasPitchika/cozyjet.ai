"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Sparkles, User, Bot, Loader2, Copy, Check,
  Linkedin, Twitter, Mail, TrendingUp, Lightbulb, RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboardStore } from "@/hooks/use-dashboard-store";

interface ChatMsg {
  id: string;
  role: "user" | "bot";
  content: string;
  generatedContent?: {
    linkedin?: string;
    twitter?: string;
    email?: string;
    growth?: string;
    hooks?: string[];
  };
}

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
      title="Copy"
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
  const colors: Record<string, string> = {
    linkedin: "rgba(10,102,194,0.15)",
    twitter: "rgba(29,161,242,0.1)",
    email: "rgba(255,255,255,0.04)",
    growth: "rgba(52,211,153,0.08)",
    hooks: "rgba(250,204,21,0.08)",
  };
  const text = Array.isArray(content) ? content.join("\n") : content;
  if (!text) return null;
  return (
    <div
      className="mt-3 rounded-2xl overflow-hidden"
      style={{ background: colors[type] || "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5">
        <div className="flex items-center gap-1.5 text-[10px] text-white/40 font-semibold uppercase tracking-widest">
          {icons[type]}
          <span>{labels[type]}</span>
        </div>
        <CopyButton text={text} />
      </div>
      <div className="px-4 py-3 text-xs text-white/60 leading-relaxed whitespace-pre-wrap">
        {text}
      </div>
    </div>
  );
}

const STARTER_PROMPTS = [
  { icon: "✍️", text: "Write a viral LinkedIn post about shipping my first SaaS feature" },
  { icon: "🧵", text: "Twitter thread: how I built an AI agent studio solo in 2 weeks" },
  { icon: "📈", text: "Fastest path from 0 to 1k followers for a solo developer" },
  { icon: "📧", text: "Cold email sequence to land my first 10 SaaS customers" },
  { icon: "🔍", text: "Give me 5 SEO hooks for a productivity AI app" },
];

export default function SnooksPage() {
  const { assistanceMsg } = useDashboardStore();
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isGenerating]);

  const handleSend = async (promptOverride?: string) => {
    const userInput = promptOverride || input;
    if (!userInput.trim() || isGenerating) return;
    setInput("");

    const userMsg: ChatMsg = { id: Date.now().toString(), role: "user", content: userInput };
    setMessages((p) => [...p, userMsg]);
    setIsGenerating(true);

    try {
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

      const botMsg: ChatMsg = {
        id: (Date.now() + 1).toString(),
        role: "bot",
        content: data.responseText || "Here's what I generated for you:",
        generatedContent: {
          linkedin: gc.linkedinPost,
          twitter: gc.xThread,
          email: gc.emailContent,
          growth: gc.growthHack,
          hooks: gc.seoHooks,
        },
      };
      setMessages((p) => [...p, botMsg]);
    } catch (e) {
      console.error("Snooks error:", e);
      setMessages((p) => [...p, {
        id: "err",
        role: "bot",
        content: "Failed to generate content. Check your API connection and try again.",
      }]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const hasMessages = messages.length > 0;

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
        <div className="flex items-center gap-3">
          {isGenerating && (
            <div className="flex items-center gap-2">
              <Loader2 size={12} className="animate-spin text-white/30" />
              <span className="text-[11px] text-white/40">Generating...</span>
            </div>
          )}
          {hasMessages && (
            <button
              onClick={() => setMessages([])}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white/30 hover:text-white/60 hover:bg-white/5 transition-all"
            >
              <RotateCcw size={11} />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {!hasMessages ? (
          <div className="h-full flex flex-col items-center justify-center gap-8 p-8 text-center">
            <div>
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-5">
                <Sparkles size={24} className="text-white/20" />
              </div>
              <h2 className="text-xl font-semibold text-white/70">Snooks is ready</h2>
              <p className="text-xs text-white/30 mt-2 max-w-sm leading-relaxed">
                Elite social media growth engineer. Expert in viral content, SEO hooks, growth playbooks, and personal branding.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
              {STARTER_PROMPTS.map((p) => (
                <button
                  key={p.text}
                  onClick={() => handleSend(p.text)}
                  className="flex items-start gap-3 text-left px-4 py-3.5 rounded-2xl bg-white/[0.03] border border-white/5 text-white/40 hover:bg-white/[0.06] hover:text-white/60 hover:border-white/10 transition-all"
                >
                  <span className="text-base shrink-0">{p.icon}</span>
                  <span className="text-xs leading-relaxed">{p.text}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="px-6 py-6 space-y-8 max-w-3xl mx-auto">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn("flex gap-3", msg.role === "user" ? "flex-row-reverse" : "")}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                    msg.role === "user" ? "bg-white" : "bg-white/8 border border-white/10"
                  )}>
                    {msg.role === "user"
                      ? <User size={13} className="text-black" />
                      : <Bot size={13} className="text-white/50" />
                    }
                  </div>
                  <div className={cn("flex-1 max-w-[85%] relative group", msg.role === "user" ? "flex flex-col items-end" : "")}>
                    <div className={cn(
                      "px-5 py-4 rounded-2xl text-sm leading-relaxed",
                      msg.role === "user"
                        ? "bg-white text-black rounded-tr-sm max-w-full"
                        : "bg-white/[0.04] text-white/75 rounded-tl-sm border border-white/6"
                    )}>
                      {msg.content}
                    </div>

                    {msg.generatedContent && (
                      <div className="w-full mt-1 space-y-2">
                        {msg.generatedContent.linkedin && <ContentBlock type="linkedin" content={msg.generatedContent.linkedin} />}
                        {msg.generatedContent.twitter && <ContentBlock type="twitter" content={msg.generatedContent.twitter} />}
                        {msg.generatedContent.email && <ContentBlock type="email" content={msg.generatedContent.email} />}
                        {msg.generatedContent.growth && <ContentBlock type="growth" content={msg.generatedContent.growth} />}
                        {msg.generatedContent.hooks && msg.generatedContent.hooks.length > 0 && (
                          <ContentBlock type="hooks" content={msg.generatedContent.hooks} />
                        )}
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
                <div className="w-8 h-8 rounded-full bg-white/8 border border-white/10 flex items-center justify-center shrink-0">
                  <Bot size={13} className="text-white/50" />
                </div>
                <div className="px-5 py-4 rounded-2xl rounded-tl-sm bg-white/[0.04] border border-white/6">
                  <div className="flex gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <motion.div key={i}
                        animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
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
      <div className="px-6 py-4 border-t border-white/5 shrink-0">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end gap-3 bg-white/[0.05] rounded-2xl px-5 py-3.5 border border-white/6 focus-within:border-white/12 transition-all">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isGenerating}
              placeholder="Ask for viral content, SEO hooks, growth strategy..."
              rows={1}
              className="flex-1 bg-transparent text-sm text-white/80 placeholder:text-white/25 outline-none resize-none min-h-[24px] max-h-40"
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
          <p className="text-[10px] text-white/12 mt-2 text-center">
            Snooks generates platform-native viral content · Powered by OpenRouter
          </p>
        </div>
      </div>
    </div>
  );
}
