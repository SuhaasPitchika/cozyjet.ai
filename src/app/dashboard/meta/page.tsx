"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Sparkles, Loader2, Copy, Check, RotateCcw,
  Zap, User, BookOpen, ChevronDown,
} from "lucide-react";
import { useDashboardStore } from "@/hooks/use-dashboard-store";

interface ChatMsg {
  id: string;
  role: "user" | "bot";
  content: string;
  timestamp: Date;
}

const PLATFORM_TABS = ["All", "LinkedIn", "Twitter", "Instagram"];

const STARTER_PROMPTS = [
  { icon: "✍️", text: "Write a viral LinkedIn post about shipping my first SaaS feature" },
  { icon: "🧵", text: "Twitter thread: how I built an AI agent studio solo in 2 weeks" },
  { icon: "📈", text: "Fastest path from 0 to 1k followers for a solo developer" },
  { icon: "💡", text: "Turn my GitHub commits into compelling social content" },
  { icon: "🔍", text: "5 high-converting hooks for a productivity AI app" },
  { icon: "🎯", text: "3 variations: emotional story, technical, and results-led post" },
];

const VOICE_PREFS = ["Concise", "No exclamation marks", "Add numbers", "More casual", "Remove jargon", "Hook-first"];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="p-1.5 rounded-lg hover:bg-black/5 transition-colors text-black/20 hover:text-black/50"
    >
      {copied ? <Check size={11} /> : <Copy size={11} />}
    </button>
  );
}

function MessageBubble({ msg }: { msg: ChatMsg }) {
  const isBot = msg.role === "bot";
  const fmt = (d: Date) => d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className={`flex gap-3 ${!isBot ? "flex-row-reverse" : ""}`}
    >
      {isBot ? (
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
          style={{ background: "linear-gradient(135deg, #ec4899, #db2777)", boxShadow: "0 2px 8px rgba(236,72,153,0.35)" }}>
          <Sparkles size={13} className="text-white" />
        </div>
      ) : (
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
          style={{ background: "rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.08)" }}>
          <User size={13} className="text-black/45" />
        </div>
      )}

      <div className={`flex-1 max-w-[82%] group ${!isBot ? "flex flex-col items-end" : ""}`}>
        <div
          className={`px-4 py-3.5 rounded-2xl text-[13px] leading-relaxed ${isBot ? "rounded-tl-sm" : "rounded-tr-sm"}`}
          style={isBot ? {
            background: "rgba(255,255,255,0.82)",
            backdropFilter: "blur(20px)",
            border: "1.5px solid rgba(255,255,255,0.95)",
            boxShadow: "0 2px 16px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,1)",
            color: "rgba(0,0,0,0.72)",
          } : {
            background: "linear-gradient(135deg, rgba(236,72,153,0.12), rgba(219,39,119,0.08))",
            border: "1.5px solid rgba(236,72,153,0.2)",
            color: "rgba(0,0,0,0.72)",
          }}
        >
          <p className="whitespace-pre-wrap">{msg.content}</p>
        </div>
        <div className={`flex items-center gap-1 mt-1.5 ${!isBot ? "justify-end" : ""}`}>
          <span className="text-[9px] text-black/20">{fmt(msg.timestamp)}</span>
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

function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
        style={{ background: "linear-gradient(135deg, #ec4899, #db2777)", boxShadow: "0 2px 8px rgba(236,72,153,0.35)" }}>
        <Sparkles size={13} className="text-white" />
      </div>
      <div className="px-4 py-3.5 rounded-2xl rounded-tl-sm"
        style={{ background: "rgba(255,255,255,0.82)", border: "1.5px solid rgba(255,255,255,0.95)", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div key={i} animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
              className="w-1.5 h-1.5 rounded-full bg-pink-400" />
          ))}
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
  const [activePlatform, setActivePlatform] = useState("All");
  const [voicePrefs, setVoicePrefs] = useState<string[]>([]);
  const [showVoice, setShowVoice] = useState(false);
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
      return parts.join(" | ");
    }
    return assistanceMsg || "";
  };

  const handleSend = async (override?: string) => {
    const text = (override || input).trim();
    if (!text || isGenerating) return;
    setInput("");

    const userMsg: ChatMsg = { id: Date.now().toString(), role: "user", content: text, timestamp: new Date() };
    setMessages((p) => [...p, userMsg]);
    setIsGenerating(true);

    const platformNote = activePlatform !== "All" ? ` [Platform focus: ${activePlatform}]` : "";
    const voiceNote = voicePrefs.length > 0 ? ` [Voice prefs: ${voicePrefs.join(", ")}]` : "";
    const fullInput = text + platformNote + voiceNote;
    historyRef.current.push({ role: "user", content: fullInput });

    try {
      const res = await fetch("/api/ai/meta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: historyRef.current.slice(-14).map((m) => ({ role: m.role === "assistant" ? "assistant" : m.role, content: m.content })),
          skippyContext: buildSkippyContext(),
        }),
      });

      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      const botContent = data.response || "I'm having a brief moment. Try again?";

      historyRef.current.push({ role: "assistant", content: botContent });
      setMessages((p) => [...p, { id: (Date.now() + 1).toString(), role: "bot", content: botContent, timestamp: new Date() }]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Connection error";
      setMessages((p) => [...p, {
        id: "err-" + Date.now(), role: "bot",
        content: message.includes("API key") ? "API key not configured. Add OPEN_ROUTER in Secrets." : "Connection error. Please try again.",
        timestamp: new Date(),
      }]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const hasMessages = messages.length > 0;
  const skippyCtx = buildSkippyContext();

  return (
    <div className="h-full flex flex-col"
      style={{ background: "linear-gradient(135deg, #f5f0eb 0%, #ede8e3 40%, #f0ece7 100%)" }}>

      {/* Header */}
      <div className="px-6 py-4 border-b flex items-center justify-between shrink-0"
        style={{ borderColor: "rgba(0,0,0,0.07)", background: "rgba(255,255,255,0.45)", backdropFilter: "blur(20px)" }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #ec4899, #db2777)", boxShadow: "0 4px 12px rgba(236,72,153,0.4)" }}>
            <Sparkles size={15} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[14px] font-bold text-black/75">Meta</h1>
              <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 2, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-pink-400" />
            </div>
            <p className="text-[10px] text-black/35">AI Copywriter · 3 variations · Your voice</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Platform selector */}
          <div className="flex gap-1 p-1 rounded-xl"
            style={{ background: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.9)", backdropFilter: "blur(20px)" }}>
            {PLATFORM_TABS.map((tab) => (
              <button key={tab} onClick={() => setActivePlatform(tab)}
                className="px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
                style={activePlatform === tab
                  ? { background: "rgba(236,72,153,0.18)", color: "#db2777", border: "1px solid rgba(236,72,153,0.25)" }
                  : { color: "rgba(0,0,0,0.35)", border: "1px solid transparent" }}>
                {tab}
              </button>
            ))}
          </div>

          {skippyCtx && (
            <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg"
              style={{ background: "rgba(236,72,153,0.08)", border: "1px solid rgba(236,72,153,0.18)" }}>
              <Zap size={10} className="text-pink-500" />
              <span className="text-[9px] text-pink-500 font-medium">Skippy live</span>
            </div>
          )}

          <button
            onClick={() => setShowVoice((p) => !p)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] transition-all"
            style={showVoice
              ? { background: "rgba(236,72,153,0.1)", color: "#db2777", border: "1px solid rgba(236,72,153,0.2)" }
              : { background: "rgba(0,0,0,0.05)", color: "rgba(0,0,0,0.45)", border: "1px solid rgba(0,0,0,0.07)" }}>
            <BookOpen size={11} />
            <span className="font-medium">Voice</span>
            <ChevronDown size={10} style={{ transform: showVoice ? "rotate(180deg)" : "", transition: "transform 0.2s" }} />
          </button>

          {hasMessages && (
            <button onClick={() => { setMessages([]); historyRef.current = []; }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] text-black/30 hover:text-black/55 hover:bg-black/5 transition-all">
              <RotateCcw size={11} />Clear
            </button>
          )}
        </div>
      </div>

      {/* Voice prefs strip */}
      <AnimatePresence>
        {showVoice && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden shrink-0"
          >
            <div className="px-6 py-3 flex items-center gap-2 flex-wrap border-b"
              style={{ borderColor: "rgba(0,0,0,0.06)", background: "rgba(255,255,255,0.35)" }}>
              <span className="text-[10px] font-bold text-black/30 uppercase tracking-wider">Voice preferences:</span>
              {VOICE_PREFS.map((pref) => (
                <button key={pref} onClick={() => setVoicePrefs((p) => p.includes(pref) ? p.filter((x) => x !== pref) : [...p, pref])}
                  className="text-[10px] font-semibold px-2.5 py-1 rounded-full transition-all"
                  style={voicePrefs.includes(pref)
                    ? { background: "rgba(236,72,153,0.15)", color: "#db2777", border: "1px solid rgba(236,72,153,0.25)" }
                    : { background: "rgba(255,255,255,0.6)", color: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.9)" }}>
                  {pref}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {!hasMessages ? (
          <div className="h-full flex flex-col items-center justify-center gap-7 px-8 py-10 text-center">
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="w-20 h-20 rounded-3xl flex items-center justify-center"
              style={{
                background: "rgba(255,255,255,0.72)", backdropFilter: "blur(20px)",
                border: "1.5px solid rgba(255,255,255,0.95)",
                boxShadow: "0 4px 32px rgba(236,72,153,0.15), 0 8px 40px rgba(0,0,0,0.06)",
              }}>
              <Sparkles size={32} className="text-pink-400" />
            </motion.div>

            <div>
              <h2 className="text-[20px] font-bold text-black/65">Meta is ready</h2>
              <p className="text-[12px] text-black/35 mt-2 max-w-sm mx-auto leading-relaxed">
                Elite AI copywriter for builders. Give me a seed, a raw idea, or a trending topic — I&apos;ll generate three strategic variations in your exact voice.
              </p>
              {skippyCtx && (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  className="mt-3 inline-flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-medium"
                  style={{ background: "rgba(236,72,153,0.07)", color: "#db2777", border: "1px solid rgba(236,72,153,0.15)" }}>
                  <Zap size={10} /> Skippy context loaded — your content will feel personal
                </motion.div>
              )}
              {voicePrefs.length > 0 && (
                <div className="mt-2 flex flex-wrap justify-center gap-1">
                  {voicePrefs.map((p) => (
                    <span key={p} className="text-[9px] px-2 py-px rounded-full"
                      style={{ background: "rgba(236,72,153,0.1)", color: "#db2777" }}>{p}</span>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 w-full max-w-lg">
              {STARTER_PROMPTS.map((p) => (
                <motion.button key={p.text} onClick={() => handleSend(p.text)}
                  whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}
                  className="flex items-start gap-2.5 text-left px-4 py-3.5 rounded-2xl transition-all"
                  style={{
                    background: "rgba(255,255,255,0.65)", backdropFilter: "blur(20px)",
                    border: "1.5px solid rgba(255,255,255,0.95)",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,1)",
                  }}>
                  <span className="shrink-0 text-base">{p.icon}</span>
                  <span className="text-[11px] text-black/50 leading-relaxed">{p.text}</span>
                </motion.button>
              ))}
            </div>
          </div>
        ) : (
          <div className="px-6 py-6 space-y-5 max-w-2xl mx-auto">
            <AnimatePresence initial={false}>
              {messages.map((msg) => <MessageBubble key={msg.id} msg={msg} />)}
            </AnimatePresence>
            {isGenerating && <TypingIndicator />}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-5 py-4 shrink-0 border-t"
        style={{ borderColor: "rgba(0,0,0,0.07)", background: "rgba(255,255,255,0.35)", backdropFilter: "blur(20px)" }}>
        <div className="max-w-2xl mx-auto">
          <div
            className="flex items-end gap-3 px-4 py-3 rounded-2xl transition-all focus-within:ring-2 focus-within:ring-pink-300/50"
            style={{
              background: "rgba(255,255,255,0.78)",
              border: "1.5px solid rgba(255,255,255,0.95)",
              backdropFilter: "blur(20px)",
              boxShadow: "0 2px 16px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,1)",
            }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isGenerating}
              placeholder={activePlatform !== "All"
                ? `Write ${activePlatform} content for…`
                : "Give Meta a seed, idea, or topic to write content for…"}
              rows={1}
              className="flex-1 bg-transparent text-[13px] text-black/70 placeholder:text-black/25 outline-none resize-none min-h-[22px] max-h-36 leading-[1.5]"
            />
            <motion.button
              onClick={() => handleSend()}
              disabled={isGenerating || !input.trim()}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.96 }}
              className="p-2.5 rounded-xl disabled:opacity-25 transition-all shrink-0 self-end"
              style={input.trim()
                ? { background: "linear-gradient(135deg, #ec4899, #db2777)", boxShadow: "0 4px 12px rgba(236,72,153,0.45)" }
                : { background: "rgba(0,0,0,0.06)" }}
            >
              {isGenerating ? <Loader2 size={13} className="text-pink-500 animate-spin" /> : <Send size={13} className={input.trim() ? "text-white" : "text-black/35"} />}
            </motion.button>
          </div>
          <p className="text-[9px] text-black/20 mt-2 text-center">
            Meta · 3 strategic variations per prompt · Powered by OpenRouter
          </p>
        </div>
      </div>
    </div>
  );
}
