"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Loader2, Copy, Check, RotateCcw, User, Brain,
  Sliders as SlidersIcon, Key, ChevronDown, ChevronRight,
  Zap, Sparkles, Eye, EyeOff,
} from "lucide-react";

interface ChatMsg {
  id: string;
  role: "user" | "bot";
  content: string;
  timestamp: Date;
}

const STARTER_PROMPTS = [
  { icon: "🎭", text: "Rewrite this in a human, authentic tone: [paste any AI-sounding text]" },
  { icon: "🧠", text: "Make my writing sound less corporate and more like a real founder" },
  { icon: "📊", text: "Compare: how would a casual creator vs a technical expert write about AI?" },
  { icon: "✂️", text: "Remove filler words and make this punchy: [paste text]" },
  { icon: "🔊", text: "Add personality — this sounds like a press release, not a person" },
  { icon: "🔄", text: "I'll paste 3 posts I wrote. Learn my voice and summarize it." },
];

const MODEL_OPTIONS = [
  { id: "google/gemini-2.0-flash-001", name: "Gemini 2.0 Flash", provider: "Google", desc: "Fast, cheap, solid for most content", color: "#4285f4", default: true },
  { id: "anthropic/claude-3.5-sonnet", name: "Claude 3.5 Sonnet", provider: "Anthropic", desc: "Best voice accuracy, 2× cost", color: "#d97757" },
  { id: "openai/gpt-4o-mini", name: "GPT-4o Mini", provider: "OpenAI", desc: "Good all-rounder, fast turnaround", color: "#10b981" },
  { id: "mistralai/mistral-large", name: "Mistral Large", provider: "Mistral", desc: "Technical depth, European privacy", color: "#f59e0b" },
  { id: "minimax/minimax-01", name: "MiniMax 01", provider: "MiniMax", desc: "Long-context reasoning for Snooks", color: "#8b5cf6" },
];

const TONE_TAGS = ["Direct", "Motivational", "Storytelling", "Analytical", "Witty", "Empathetic", "Authoritative", "Conversational"];

function CopyBtn({ text }: { text: string }) {
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
      className={`flex gap-3 ${!isBot ? "flex-row-reverse" : ""}`}
    >
      {isBot ? (
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
          style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", boxShadow: "0 2px 8px rgba(245,158,11,0.35)" }}>
          <Brain size={13} className="text-white" />
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
            background: "linear-gradient(135deg, rgba(245,158,11,0.12), rgba(217,119,6,0.08))",
            border: "1.5px solid rgba(245,158,11,0.22)",
            color: "rgba(0,0,0,0.72)",
          }}
        >
          <p className="whitespace-pre-wrap">{msg.content}</p>
        </div>
        <div className={`flex items-center gap-1 mt-1.5 ${!isBot ? "justify-end" : ""}`}>
          <span className="text-[9px] text-black/20">{fmt(msg.timestamp)}</span>
          {isBot && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <CopyBtn text={msg.content} />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function TypingDots() {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
        style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", boxShadow: "0 2px 8px rgba(245,158,11,0.35)" }}>
        <Brain size={13} className="text-white" />
      </div>
      <div className="px-4 py-3.5 rounded-2xl rounded-tl-sm"
        style={{ background: "rgba(255,255,255,0.82)", border: "1.5px solid rgba(255,255,255,0.95)", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div key={i} animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
              className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function TuningPage() {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedModel, setSelectedModel] = useState(MODEL_OPTIONS[0].id);
  const [showApiConfig, setShowApiConfig] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [apiKeySaved, setApiKeySaved] = useState(false);
  const [tones, setTones] = useState(["Direct", "Conversational"]);
  const [showConfig, setShowConfig] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const historyRef = useRef<{ role: string; content: string }[]>([]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isGenerating]);

  const selectedModelInfo = MODEL_OPTIONS.find((m) => m.id === selectedModel) || MODEL_OPTIONS[0];

  const handleSend = async (override?: string) => {
    const text = (override || input).trim();
    if (!text || isGenerating) return;
    setInput("");

    const userMsg: ChatMsg = { id: Date.now().toString(), role: "user", content: text, timestamp: new Date() };
    setMessages((p) => [...p, userMsg]);
    setIsGenerating(true);

    historyRef.current.push({ role: "user", content: text });

    try {
      const res = await fetch("/api/ai/tuning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: historyRef.current.slice(-12).map((m) => ({
            role: m.role === "bot" ? "assistant" : m.role,
            content: m.content,
          })),
          selectedModel,
          tones,
        }),
      });

      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      const botContent = data.response || "Let me try that again.";
      historyRef.current.push({ role: "assistant", content: botContent });
      setMessages((p) => [...p, { id: (Date.now() + 1).toString(), role: "bot", content: botContent, timestamp: new Date() }]);
    } catch {
      setMessages((p) => [...p, {
        id: "err-" + Date.now(), role: "bot",
        content: "Connection error. Please check your OPEN_ROUTER key in Secrets and try again.",
        timestamp: new Date(),
      }]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const saveApiKey = () => {
    setApiKeySaved(true);
    setTimeout(() => setApiKeySaved(false), 2000);
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="h-full flex overflow-hidden"
      style={{ background: "linear-gradient(135deg, #f5f0eb 0%, #ede8e3 40%, #f0ece7 100%)" }}>

      {/* Config sidebar */}
      <AnimatePresence>
        {showConfig && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="shrink-0 border-r overflow-hidden flex flex-col"
            style={{
              borderColor: "rgba(0,0,0,0.07)",
              background: "rgba(255,255,255,0.55)",
              backdropFilter: "blur(20px)",
            }}
          >
            <div className="px-5 py-5 border-b flex-shrink-0" style={{ borderColor: "rgba(0,0,0,0.07)" }}>
              <p className="text-[12px] font-bold text-black/65">Voice Configuration</p>
              <p className="text-[10px] text-black/35 mt-0.5">Configure Tuning&apos;s behavior</p>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
              {/* Model selector */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-black/30 mb-2.5">AI Model</p>
                <div className="space-y-2">
                  {MODEL_OPTIONS.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => setSelectedModel(model.id)}
                      className="w-full text-left px-3 py-2.5 rounded-xl transition-all"
                      style={selectedModel === model.id ? {
                        background: `${model.color}10`,
                        border: `1.5px solid ${model.color}30`,
                      } : {
                        background: "rgba(255,255,255,0.5)",
                        border: "1px solid rgba(255,255,255,0.9)",
                      }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-[12px] font-semibold text-black/70 truncate">{model.name}</p>
                            {model.default && (
                              <span className="text-[8px] font-bold px-1.5 py-px rounded-full shrink-0"
                                style={{ background: "rgba(16,185,129,0.1)", color: "#10b981" }}>default</span>
                            )}
                          </div>
                          <p className="text-[10px] text-black/35 truncate">{model.desc}</p>
                        </div>
                        <div className="w-3 h-3 rounded-full border-2 flex-shrink-0 flex items-center justify-center"
                          style={selectedModel === model.id
                            ? { borderColor: model.color, background: model.color }
                            : { borderColor: "rgba(0,0,0,0.15)" }}>
                          {selectedModel === model.id && <div className="w-1 h-1 rounded-full bg-white" />}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tone tags */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-black/30 mb-2.5">Tone Profile</p>
                <div className="flex flex-wrap gap-1.5">
                  {TONE_TAGS.map((tag) => (
                    <button key={tag}
                      onClick={() => setTones((p) => p.includes(tag) ? p.filter((x) => x !== tag) : [...p, tag])}
                      className="text-[10px] font-semibold px-2.5 py-1 rounded-full transition-all"
                      style={tones.includes(tag)
                        ? { background: "rgba(245,158,11,0.15)", color: "#d97706", border: "1px solid rgba(245,158,11,0.28)" }
                        : { background: "rgba(255,255,255,0.6)", color: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.9)" }}>
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* API Key config */}
              <div>
                <button
                  onClick={() => setShowApiConfig((p) => !p)}
                  className="flex items-center justify-between w-full mb-2"
                >
                  <p className="text-[10px] font-bold uppercase tracking-widest text-black/30">API Key</p>
                  <ChevronDown size={12} className="text-black/30"
                    style={{ transform: showApiConfig ? "rotate(180deg)" : "", transition: "transform 0.2s" }} />
                </button>
                <AnimatePresence>
                  {showApiConfig && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
                          style={{ background: "rgba(255,255,255,0.65)", border: "1.5px solid rgba(255,255,255,0.95)" }}>
                          <Key size={11} className="text-black/30 shrink-0" />
                          <input
                            type={showKey ? "text" : "password"}
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="sk-or-..."
                            className="flex-1 bg-transparent text-[11px] text-black/65 placeholder:text-black/25 outline-none"
                          />
                          <button onClick={() => setShowKey((p) => !p)} className="text-black/25 hover:text-black/50 transition-colors">
                            {showKey ? <EyeOff size={11} /> : <Eye size={11} />}
                          </button>
                        </div>
                        <button onClick={saveApiKey}
                          className="w-full py-2 rounded-xl text-[11px] font-semibold text-white transition-all"
                          style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", boxShadow: "0 4px 12px rgba(245,158,11,0.3)" }}>
                          {apiKeySaved ? <span className="flex items-center justify-center gap-1"><Check size={12} />Saved</span> : "Save Key"}
                        </button>
                        <p className="text-[9px] text-black/30 leading-relaxed px-1">
                          Or add OPEN_ROUTER to Replit Secrets for persistent access. Keys here are session-only.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* What Tuning does */}
              <div className="px-3 py-3 rounded-xl space-y-2"
                style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)" }}>
                <div className="flex items-center gap-1.5">
                  <Zap size={10} className="text-amber-500" />
                  <p className="text-[10px] font-bold text-amber-700">What Tuning does</p>
                </div>
                {["Rewrites AI text to sound human", "Learns your voice from examples", "Configures Meta's content style", "Compares tone across models"].map((tip) => (
                  <div key={tip} className="flex items-start gap-1.5">
                    <ChevronRight size={9} className="text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-[9px] text-amber-800/70 leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main chat */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between shrink-0"
          style={{ borderColor: "rgba(0,0,0,0.07)", background: "rgba(255,255,255,0.45)", backdropFilter: "blur(20px)" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", boxShadow: "0 4px 12px rgba(245,158,11,0.38)" }}>
              <Brain size={15} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-[14px] font-bold text-black/75">Tuning</h1>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                  style={{ background: `${selectedModelInfo.color}12`, border: `1px solid ${selectedModelInfo.color}25` }}>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: selectedModelInfo.color }} />
                  <span className="text-[9px] font-bold" style={{ color: selectedModelInfo.color }}>{selectedModelInfo.name}</span>
                </div>
              </div>
              <p className="text-[10px] text-black/35">Voice Calibration · Human-like Content · API Config</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5">
              {tones.slice(0, 3).map((t) => (
                <span key={t} className="text-[9px] font-medium px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(245,158,11,0.1)", color: "#d97706", border: "1px solid rgba(245,158,11,0.18)" }}>
                  {t}
                </span>
              ))}
            </div>

            <button
              onClick={() => setShowConfig((p) => !p)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all"
              style={showConfig
                ? { background: "rgba(245,158,11,0.1)", color: "#d97706", border: "1px solid rgba(245,158,11,0.2)" }
                : { background: "rgba(0,0,0,0.05)", color: "rgba(0,0,0,0.45)", border: "1px solid rgba(0,0,0,0.07)" }}>
              <SlidersIcon size={11} />
              <span>Configure</span>
            </button>

            {hasMessages && (
              <button onClick={() => { setMessages([]); historyRef.current = []; }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] text-black/30 hover:text-black/55 hover:bg-black/5 transition-all">
                <RotateCcw size={11} />Clear
              </button>
            )}
          </div>
        </div>

        {/* Chat */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          {!hasMessages ? (
            <div className="h-full flex flex-col items-center justify-center gap-7 px-8 py-10 text-center">
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                className="w-20 h-20 rounded-3xl flex items-center justify-center"
                style={{
                  background: "rgba(255,255,255,0.72)", backdropFilter: "blur(20px)",
                  border: "1.5px solid rgba(255,255,255,0.95)",
                  boxShadow: "0 4px 32px rgba(245,158,11,0.15), 0 8px 40px rgba(0,0,0,0.06)",
                }}>
                <Brain size={32} className="text-amber-500" />
              </motion.div>

              <div>
                <h2 className="text-[20px] font-bold text-black/65">Tuning is ready</h2>
                <p className="text-[12px] text-black/35 mt-2 max-w-sm mx-auto leading-relaxed">
                  Paste any AI-generated text and I&apos;ll make it sound genuinely human. Teach me your voice, configure how Meta writes for you, or test different model outputs side-by-side.
                </p>
                <div className="mt-3 flex items-center justify-center gap-3">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
                    style={{ background: `${selectedModelInfo.color}10`, border: `1px solid ${selectedModelInfo.color}20` }}>
                    <Sparkles size={10} style={{ color: selectedModelInfo.color }} />
                    <span className="text-[10px] font-medium" style={{ color: selectedModelInfo.color }}>
                      {selectedModelInfo.name}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {tones.map((t) => (
                      <span key={t} className="text-[9px] px-2 py-px rounded-full"
                        style={{ background: "rgba(245,158,11,0.1)", color: "#d97706" }}>{t}</span>
                    ))}
                  </div>
                </div>
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
              {isGenerating && <TypingDots />}
            </div>
          )}
        </div>

        {/* Input */}
        <div className="px-5 py-4 shrink-0 border-t"
          style={{ borderColor: "rgba(0,0,0,0.07)", background: "rgba(255,255,255,0.35)", backdropFilter: "blur(20px)" }}>
          <div className="max-w-2xl mx-auto">
            <div
              className="flex items-end gap-3 px-4 py-3 rounded-2xl transition-all focus-within:ring-2 focus-within:ring-amber-300/50"
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
                onKeyDown={handleKey}
                disabled={isGenerating}
                placeholder="Paste text to humanize, describe your voice, or ask how to configure the AI…"
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
                  ? { background: "linear-gradient(135deg, #f59e0b, #d97706)", boxShadow: "0 4px 12px rgba(245,158,11,0.4)" }
                  : { background: "rgba(0,0,0,0.06)" }}
              >
                {isGenerating
                  ? <Loader2 size={13} className="text-amber-600 animate-spin" />
                  : <Send size={13} className={input.trim() ? "text-white" : "text-black/35"} />
                }
              </motion.button>
            </div>
            <p className="text-[9px] text-black/20 mt-2 text-center">
              Tuning · Voice calibration for Meta · {selectedModelInfo.name} · Powered by OpenRouter
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
