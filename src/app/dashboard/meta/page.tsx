"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, Loader2, Copy, Check, RotateCcw, Zap, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboardStore } from "@/hooks/use-dashboard-store";

interface ChatMsg {
  id: string;
  role: "user" | "bot";
  content: string;
  timestamp: Date;
}

const STARTER_PROMPTS = [
  { icon: "✍️", text: "Write a viral LinkedIn post about shipping my first SaaS feature" },
  { icon: "🧵", text: "Twitter thread: how I built an AI agent studio solo in 2 weeks" },
  { icon: "📈", text: "Fastest path from 0 to 1k followers for a solo developer" },
  { icon: "📧", text: "Cold email sequence to land my first 10 SaaS customers" },
  { icon: "🔍", text: "Give me 5 SEO hooks for a productivity AI app" },
  { icon: "💡", text: "How do I turn my dev work into compelling social media content?" },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/20 hover:text-white/50"
      title="Copy"
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
    </button>
  );
}

function MetaAvatar() {
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
      style={{ background: "linear-gradient(135deg, #ec4899, #db2777)", boxShadow: "0 2px 8px rgba(236,72,153,0.4)" }}
    >
      <Sparkles size={13} className="text-white" />
    </div>
  );
}

function UserAvatar() {
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 border border-white/15"
      style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.06))" }}
    >
      <User size={13} className="text-white/70" />
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start px-4 py-2">
      <div className="flex items-center gap-2.5">
        <MetaAvatar />
        <div className="px-4 py-3 rounded-2xl rounded-tl-sm" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex gap-1.5">
            {[0,1,2].map((i) => (
              <motion.div key={i} animate={{ opacity: [0.3,1,0.3], y: [0,-3,0] }} transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                className="w-1.5 h-1.5 rounded-full bg-pink-400" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MetaPage() {
  const { assistanceMsg, skippyContext } = useDashboardStore();
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const historyRef = useRef<{ role: string; content: string }[]>([]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isGenerating]);

  const buildSkippyContext = () => {
    if (skippyContext) {
      const parts = [];
      if (skippyContext.signal) parts.push(`Signal: ${skippyContext.signal}`);
      if (skippyContext.activity) parts.push(`Activity: ${skippyContext.activity}`);
      if (skippyContext.insights) parts.push(`Insights: ${skippyContext.insights}`);
      if (skippyContext.apps?.length) parts.push(`Apps: ${skippyContext.apps.join(", ")}`);
      return parts.join(" | ");
    }
    return assistanceMsg || "";
  };

  const handleSend = async (promptOverride?: string) => {
    const userInput = (promptOverride || input).trim();
    if (!userInput || isGenerating) return;
    setInput("");

    const userMsg: ChatMsg = { id: Date.now().toString(), role: "user", content: userInput, timestamp: new Date() };
    setMessages((p) => [...p, userMsg]);
    setIsGenerating(true);

    historyRef.current.push({ role: "user", content: userInput });

    try {
      const res = await fetch("/api/ai/meta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: historyRef.current.slice(-12).map(m => ({
            role: m.role === "assistant" ? "assistant" : m.role,
            content: m.content,
          })),
          skippyContext: buildSkippyContext(),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "API error");
      }

      const data = await res.json();
      const botContent = data.response || "I'm having a brief moment. Try again?";

      historyRef.current.push({ role: "assistant", content: botContent });
      setMessages((p) => [...p, { id: (Date.now() + 1).toString(), role: "bot", content: botContent, timestamp: new Date() }]);
    } catch (err: any) {
      const errorMsg = err.message?.includes("API key")
        ? "API key not configured. Please add the OPEN_ROUTER environment variable."
        : "Connection error. Please try again.";
      setMessages((p) => [...p, { id: "err-" + Date.now(), role: "bot", content: errorMsg, timestamp: new Date() }]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const clearChat = () => { setMessages([]); historyRef.current = []; };

  const formatTime = (d: Date) => d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  const hasMessages = messages.length > 0;
  const skippyCtx = buildSkippyContext();

  return (
    <div className="h-full flex flex-col" style={{ background: "#0f0f0f" }}>
      <div className="px-8 py-4 border-b border-white/5 flex items-center justify-between shrink-0" style={{ background: "rgba(15,15,15,0.9)", backdropFilter: "blur(12px)" }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #ec4899, #db2777)", boxShadow: "0 4px 12px rgba(236,72,153,0.4)" }}>
            <Sparkles size={16} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold text-white">Meta</h1>
              <div className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse" />
            </div>
            <p className="text-[10px] text-white/30">Marketing & Content Intelligence</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {skippyCtx && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg" style={{ background: "rgba(236,72,153,0.1)", border: "1px solid rgba(236,72,153,0.2)" }}>
              <Zap size={10} className="text-pink-400" />
              <span className="text-[9px] text-pink-400 font-medium">Skippy connected</span>
            </div>
          )}
          {hasMessages && (
            <button onClick={clearChat} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white/30 hover:text-white/60 hover:bg-white/5 transition-all">
              <RotateCcw size={11} /><span>Clear</span>
            </button>
          )}
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {!hasMessages ? (
          <div className="h-full flex flex-col items-center justify-center gap-8 p-8 text-center">
            <div>
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="w-20 h-20 rounded-3xl mx-auto mb-5 flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, rgba(236,72,153,0.15), rgba(219,39,119,0.08))", border: "1px solid rgba(236,72,153,0.2)" }}
              >
                <Sparkles size={32} className="text-pink-400" />
              </motion.div>
              <h2 className="text-xl font-semibold text-white/80 mb-2">Meta is ready</h2>
              <p className="text-xs text-white/30 max-w-sm mx-auto leading-relaxed">
                Elite content strategist & marketing intelligence. Viral content, growth playbooks, SEO hooks, and personal branding for builders.
              </p>
              {skippyCtx && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 px-4 py-2.5 rounded-xl text-xs text-pink-400 font-medium inline-flex items-center gap-2"
                  style={{ background: "rgba(236,72,153,0.08)", border: "1px solid rgba(236,72,153,0.15)" }}
                >
                  <Zap size={10} />
                  Skippy context loaded
                </motion.div>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
              {STARTER_PROMPTS.map((p) => (
                <motion.button
                  key={p.text}
                  onClick={() => handleSend(p.text)}
                  whileHover={{ scale: 1.02, borderColor: "rgba(236,72,153,0.25)" }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-start gap-3 text-left px-4 py-3.5 rounded-2xl transition-all"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)" }}
                >
                  <span className="text-base shrink-0">{p.icon}</span>
                  <span className="text-xs leading-relaxed hover:text-white/60 transition-colors">{p.text}</span>
                </motion.button>
              ))}
            </div>
          </div>
        ) : (
          <div className="px-6 py-6 space-y-6 max-w-3xl mx-auto">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={cn("flex gap-3", msg.role === "user" ? "flex-row-reverse" : "")}
                >
                  {msg.role === "bot" ? <MetaAvatar /> : <UserAvatar />}
                  <div className={cn("flex-1 max-w-[85%] relative group", msg.role === "user" ? "flex flex-col items-end" : "")}>
                    <div className={cn(
                      "px-5 py-4 rounded-2xl text-sm leading-relaxed",
                      msg.role === "user"
                        ? "text-white/90 rounded-tr-sm"
                        : "text-white/80 rounded-tl-sm"
                    )}
                      style={
                        msg.role === "bot"
                          ? { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }
                          : { background: "linear-gradient(135deg, rgba(236,72,153,0.25), rgba(219,39,119,0.15))", border: "1px solid rgba(236,72,153,0.2)" }
                      }
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                    <div className={cn("flex items-center gap-1 mt-1.5", msg.role === "user" ? "justify-end" : "")}>
                      <span className="text-[9px] text-white/15">{formatTime(msg.timestamp)}</span>
                      {msg.role === "bot" && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <CopyButton text={msg.content} />
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {isGenerating && <TypingIndicator />}
          </div>
        )}
      </div>

      <div className="px-6 py-4 border-t shrink-0" style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(15,15,15,0.9)" }}>
        <div className="max-w-3xl mx-auto">
          <div
            className="flex items-end gap-3 rounded-2xl px-5 py-3.5 transition-all focus-within:ring-1 focus-within:ring-pink-500/20"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isGenerating}
              placeholder="Ask Meta about viral content, growth, marketing strategy..."
              rows={1}
              className="flex-1 bg-transparent text-sm text-white/80 placeholder:text-white/20 outline-none resize-none min-h-[24px] max-h-40"
              style={{ lineHeight: "1.5rem" }}
            />
            <motion.button
              onClick={() => handleSend()}
              disabled={isGenerating || !input.trim()}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.96 }}
              className="p-2.5 rounded-xl disabled:opacity-20 transition-all shrink-0 self-end"
              style={input.trim() ? { background: "linear-gradient(135deg, #ec4899, #db2777)", boxShadow: "0 4px 12px rgba(236,72,153,0.4)" } : { background: "rgba(255,255,255,0.08)" }}
            >
              {isGenerating
                ? <Loader2 size={13} className="text-white animate-spin" />
                : <Send size={13} className="text-white" />}
            </motion.button>
          </div>
          <p className="text-[10px] text-white/10 mt-2 text-center">
            Meta · AI-powered marketing intelligence · Powered by OpenRouter
          </p>
        </div>
      </div>
    </div>
  );
}
