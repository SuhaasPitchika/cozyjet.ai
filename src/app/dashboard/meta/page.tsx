"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, Loader2, Copy, Check, RotateCcw, Zap, User, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboardStore } from "@/hooks/use-dashboard-store";

interface ChatMsg {
  id: string;
  role: "user" | "bot";
  content: string;
  timestamp: Date;
}

const PLATFORM_TABS = ["All Platforms", "LinkedIn", "Twitter", "Instagram"];

const STARTER_PROMPTS = [
  { icon: "✍️", text: "Write a viral LinkedIn post about shipping my first SaaS feature" },
  { icon: "🧵", text: "Twitter thread: how I built an AI agent studio solo in 2 weeks" },
  { icon: "📈", text: "Fastest path from 0 to 1k followers for a solo developer" },
  { icon: "📧", text: "Cold email sequence to land my first 10 SaaS customers" },
  { icon: "🔍", text: "Give me 5 high-converting SEO hooks for a productivity AI app" },
  { icon: "💡", text: "Turn my dev work into compelling social content — where to start?" },
];

const VOICE_PREFS = ["Concise & punchy", "No exclamation marks", "Add specific numbers", "More casual tone", "Remove jargon"];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/20 hover:text-white/60"
      title="Copy"
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
    </button>
  );
}

function GlassPanel({ children, className = "", style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`rounded-2xl ${className}`}
      style={{
        background: "rgba(255,255,255,0.05)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        border: "1px solid rgba(255,255,255,0.09)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.07)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function MetaAvatar() {
  return (
    <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
      style={{ background: "linear-gradient(135deg, #ec4899, #db2777)", boxShadow: "0 2px 10px rgba(236,72,153,0.5)" }}>
      <Sparkles size={13} className="text-white" />
    </div>
  );
}

function UserAvatar() {
  return (
    <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
      style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}>
      <User size={13} className="text-white/60" />
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start px-4 py-2">
      <div className="flex items-center gap-2.5">
        <MetaAvatar />
        <GlassPanel className="px-4 py-3">
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <motion.div key={i} animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                className="w-1.5 h-1.5 rounded-full bg-pink-400" />
            ))}
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}

function MessageBubble({ msg }: { msg: ChatMsg }) {
  const isBot = msg.role === "bot";
  const formatTime = (d: Date) => d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("flex gap-3", !isBot ? "flex-row-reverse" : "")}
    >
      {isBot ? <MetaAvatar /> : <UserAvatar />}
      <div className={cn("flex-1 max-w-[85%] relative group", !isBot ? "flex flex-col items-end" : "")}>
        <div
          className={cn("px-5 py-4 rounded-2xl text-sm leading-relaxed", isBot ? "rounded-tl-sm" : "rounded-tr-sm")}
          style={isBot ? {
            background: "rgba(255,255,255,0.06)",
            backdropFilter: "blur(20px) saturate(180%)",
            WebkitBackdropFilter: "blur(20px) saturate(180%)",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 2px 16px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.06)",
          } : {
            background: "linear-gradient(135deg, rgba(236,72,153,0.2), rgba(219,39,119,0.12))",
            border: "1px solid rgba(236,72,153,0.25)",
            boxShadow: "0 2px 16px rgba(236,72,153,0.15)",
          }}
        >
          <p className={cn("whitespace-pre-wrap", isBot ? "text-white/80" : "text-white/90")}>{msg.content}</p>
        </div>
        <div className={cn("flex items-center gap-1 mt-1.5", !isBot ? "justify-end" : "")}>
          <span className="text-[9px] text-white/15">{formatTime(msg.timestamp)}</span>
          {isBot && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <CopyButton text={msg.content} />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function MetaPage() {
  const { assistanceMsg, skippyContext } = useDashboardStore();
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [activePlatform, setActivePlatform] = useState("All Platforms");
  const [voicePrefs, setVoicePrefs] = useState<string[]>([]);
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

  const buildSystemContext = () => {
    const parts = [];
    if (activePlatform !== "All Platforms") parts.push(`Focus on ${activePlatform} content specifically.`);
    if (voicePrefs.length > 0) parts.push(`Voice preferences: ${voicePrefs.join(", ")}.`);
    return parts.join(" ");
  };

  const handleSend = async (promptOverride?: string) => {
    const userInput = (promptOverride || input).trim();
    if (!userInput || isGenerating) return;
    setInput("");

    const userMsg: ChatMsg = { id: Date.now().toString(), role: "user", content: userInput, timestamp: new Date() };
    setMessages((p) => [...p, userMsg]);
    setIsGenerating(true);

    const fullInput = buildSystemContext() ? `${userInput}\n\n[Platform: ${activePlatform}]` : userInput;
    historyRef.current.push({ role: "user", content: fullInput });

    try {
      const res = await fetch("/api/ai/meta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: historyRef.current.slice(-12).map((m) => ({
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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Connection error";
      const errorMsg = message.includes("API key")
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

  const toggleVoicePref = (pref: string) => {
    setVoicePrefs((prev) => prev.includes(pref) ? prev.filter((p) => p !== pref) : [...prev, pref]);
  };

  const hasMessages = messages.length > 0;
  const skippyCtx = buildSkippyContext();

  return (
    <div
      className="h-full flex flex-col"
      style={{ background: "linear-gradient(150deg, #0a0a1a 0%, #0f0c29 30%, #1a0d1a 60%, #0a0a14 100%)" }}
    >
      {/* Ambient orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-15" style={{ background: "radial-gradient(circle, #ec4899 0%, transparent 70%)", filter: "blur(60px)" }} />
        <div className="absolute bottom-0 left-1/4 w-64 h-64 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #8b5cf6 0%, transparent 70%)", filter: "blur(50px)" }} />
      </div>

      {/* Header */}
      <div
        className="relative z-10 px-8 py-4 border-b flex items-center justify-between shrink-0"
        style={{ borderColor: "rgba(255,255,255,0.06)", backdropFilter: "blur(20px)", background: "rgba(255,255,255,0.03)" }}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg, #ec4899, #db2777)", boxShadow: "0 4px 14px rgba(236,72,153,0.5)" }}>
            <Sparkles size={16} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-white/90">Meta</h1>
              <div className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse" />
            </div>
            <p className="text-[10px] text-white/30">AI Copywriter · Marketing Intelligence</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Platform tabs */}
          <div className="flex gap-1 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
            {PLATFORM_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActivePlatform(tab)}
                className="px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
                style={activePlatform === tab
                  ? { background: "rgba(236,72,153,0.25)", color: "#f9a8d4", border: "1px solid rgba(236,72,153,0.3)" }
                  : { color: "rgba(255,255,255,0.3)", border: "1px solid transparent" }}
              >
                {tab === "All Platforms" ? "All" : tab}
              </button>
            ))}
          </div>

          {skippyCtx && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
              style={{ background: "rgba(236,72,153,0.1)", border: "1px solid rgba(236,72,153,0.2)" }}>
              <Zap size={10} className="text-pink-400" />
              <span className="text-[9px] text-pink-400 font-medium">Skippy live</span>
            </div>
          )}

          {hasMessages && (
            <button onClick={clearChat} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] text-white/25 hover:text-white/60 hover:bg-white/5 transition-all">
              <RotateCcw size={11} />Clear
            </button>
          )}
        </div>
      </div>

      {/* Voice prefs strip */}
      <div className="relative z-10 px-8 py-2 flex items-center gap-2 border-b shrink-0" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
        <BookOpen size={10} className="text-white/20 shrink-0" />
        <span className="text-[10px] text-white/20 shrink-0">Voice:</span>
        <div className="flex gap-1.5 flex-wrap">
          {VOICE_PREFS.map((pref) => (
            <button
              key={pref}
              onClick={() => toggleVoicePref(pref)}
              className="text-[10px] px-2.5 py-1 rounded-full transition-all font-medium"
              style={voicePrefs.includes(pref)
                ? { background: "rgba(236,72,153,0.2)", color: "#f9a8d4", border: "1px solid rgba(236,72,153,0.3)" }
                : { background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.25)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              {pref}
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div ref={scrollRef} className="relative z-10 flex-1 overflow-y-auto">
        {!hasMessages ? (
          <div className="h-full flex flex-col items-center justify-center gap-8 p-8 text-center">
            <div>
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="w-20 h-20 rounded-3xl mx-auto mb-5 flex items-center justify-center"
                style={{
                  background: "rgba(236,72,153,0.08)",
                  border: "1px solid rgba(236,72,153,0.15)",
                  backdropFilter: "blur(20px)",
                  boxShadow: "0 0 40px rgba(236,72,153,0.1)",
                }}
              >
                <Sparkles size={32} className="text-pink-400/70" />
              </motion.div>
              <h2 className="text-xl font-bold text-white/70 mb-2">Meta is ready</h2>
              <p className="text-xs text-white/30 max-w-sm mx-auto leading-relaxed">
                Elite copywriter for builders. Give me a content seed, a raw idea, or a trending topic — I&apos;ll generate three strategic variations in your voice.
              </p>
              {skippyCtx && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 px-4 py-2.5 rounded-xl text-xs text-pink-400 font-medium inline-flex items-center gap-2"
                  style={{ background: "rgba(236,72,153,0.07)", border: "1px solid rgba(236,72,153,0.15)", backdropFilter: "blur(12px)" }}
                >
                  <Zap size={10} />
                  Skippy context loaded — your content will feel personal
                </motion.div>
              )}
              {voicePrefs.length > 0 && (
                <div className="mt-2 flex items-center justify-center gap-1.5 flex-wrap">
                  {voicePrefs.map((p) => (
                    <span key={p} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "rgba(236,72,153,0.12)", color: "#f9a8d4" }}>{p}</span>
                  ))}
                </div>
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
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    backdropFilter: "blur(12px)",
                    color: "rgba(255,255,255,0.4)",
                  }}
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
              {messages.map((msg) => <MessageBubble key={msg.id} msg={msg} />)}
            </AnimatePresence>
            {isGenerating && <TypingIndicator />}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="relative z-10 px-6 py-4 border-t shrink-0"
        style={{ borderColor: "rgba(255,255,255,0.06)", backdropFilter: "blur(20px)", background: "rgba(10,10,26,0.6)" }}>
        <div className="max-w-3xl mx-auto">
          <div
            className="flex items-end gap-3 rounded-2xl px-5 py-3.5 transition-all focus-within:ring-1 focus-within:ring-pink-500/30"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(20px) saturate(180%)",
              WebkitBackdropFilter: "blur(20px) saturate(180%)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
            }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isGenerating}
              placeholder={`Ask Meta about ${activePlatform === "All Platforms" ? "viral content, growth, marketing strategy" : `${activePlatform} content and strategy`}…`}
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
              style={input.trim()
                ? { background: "linear-gradient(135deg, #ec4899, #db2777)", boxShadow: "0 4px 14px rgba(236,72,153,0.5)" }
                : { background: "rgba(255,255,255,0.07)" }}
            >
              {isGenerating ? <Loader2 size={13} className="text-white animate-spin" /> : <Send size={13} className="text-white" />}
            </motion.button>
          </div>
          <p className="text-[10px] text-white/10 mt-2 text-center">
            Meta · AI Copywriter · 3 strategic variations · Powered by OpenRouter
          </p>
        </div>
      </div>
    </div>
  );
}
