"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Settings2, Loader2, Copy, Check, RotateCcw, Zap, User, Brain } from "lucide-react";
import { useDashboardStore } from "@/hooks/use-dashboard-store";

interface ChatMsg {
  id: string;
  role: "user" | "bot";
  content: string;
  timestamp: Date;
}

function Slider({
  label, sublabel, value, onChange, color,
}: {
  label: string; sublabel: string; value: number; onChange: (v: number) => void; color: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const handleTrackClick = (e: React.MouseEvent) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return;
    onChange(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)));
  };
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-800">{label}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">{sublabel}</p>
        </div>
        <span className="text-sm font-bold tabular-nums" style={{ color }}>{Math.round(value * 100)}%</span>
      </div>
      <div ref={trackRef} className="relative h-2 rounded-full cursor-pointer" style={{ background: "rgba(0,0,0,0.07)" }} onClick={handleTrackClick}>
        <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${value * 100}%`, background: `linear-gradient(90deg, ${color}70, ${color})`, transition: "width 0.1s" }} />
        <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow-md"
          style={{ left: `calc(${value * 100}% - 8px)`, background: color, boxShadow: `0 0 8px ${color}55`, transition: "left 0.1s" }} />
      </div>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={async () => { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="p-1.5 rounded-lg hover:bg-black/5 transition-colors text-black/15 hover:text-black/40" title="Copy">
      {copied ? <Check size={11} /> : <Copy size={11} />}
    </button>
  );
}

function TuningAvatar() {
  return (
    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
      style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", boxShadow: "0 2px 8px rgba(245,158,11,0.4)" }}>
      <Brain size={13} className="text-white" />
    </div>
  );
}

function UserAvatar() {
  return (
    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 border border-black/8"
      style={{ background: "linear-gradient(135deg, #f3f4f6, #e5e7eb)" }}>
      <User size={13} className="text-black/40" />
    </div>
  );
}

const STARTER_PROMPTS = [
  { icon: "🎯", text: "Train Meta to write in my voice — casual but expert, short punchy sentences" },
  { icon: "📊", text: "Set Snooks to focus on B2B SaaS growth strategies only" },
  { icon: "✍️", text: "Make all LinkedIn posts start with a bold data point or surprising stat" },
  { icon: "🔥", text: "Train for aggressive growth hacking — no soft tactics, only what works fast" },
  { icon: "🧵", text: "Optimize Twitter threads to always end with a direct product CTA" },
  { icon: "📧", text: "Cold email tone: direct, founder-to-founder, no fluff, under 100 words" },
];

export default function TuningPage() {
  const { skippyContext, assistanceMsg, agentParams, setAgentParams } = useDashboardStore();
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [creativity, setCreativity] = useState(agentParams.creativity);
  const [focus, setFocus] = useState(agentParams.focus);
  const [identity, setIdentity] = useState(agentParams.identity);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const historyRef = useRef<{ role: string; content: string }[]>([]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isGenerating]);

  const buildSkippyContext = () => {
    if (skippyContext) {
      const parts: string[] = [];
      if (skippyContext.signal) parts.push(skippyContext.signal);
      if (skippyContext.activity) parts.push(skippyContext.activity);
      if (skippyContext.insights) parts.push(skippyContext.insights);
      return parts.join(". ");
    }
    return assistanceMsg || "";
  };

  const handleSend = async (promptOverride?: string) => {
    const userInput = (promptOverride || input).trim();
    if (!userInput || isGenerating) return;
    setInput("");

    const updatedParams = { creativity, focus, identity };
    setAgentParams(updatedParams);

    const userMsg: ChatMsg = { id: Date.now().toString(), role: "user", content: userInput, timestamp: new Date() };
    setMessages((p) => [...p, userMsg]);
    setIsGenerating(true);
    historyRef.current.push({ role: "user", content: userInput });

    try {
      const res = await fetch("/api/ai/tuning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: historyRef.current.slice(-14).map((m) => ({
            role: m.role === "assistant" ? "assistant" : m.role,
            content: m.content,
          })),
          skippyContext: buildSkippyContext(),
          agentParams: updatedParams,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      const botContent = data.response || "I couldn't process that. Try again.";
      historyRef.current.push({ role: "assistant", content: botContent });
      setMessages((p) => [...p, { id: (Date.now() + 1).toString(), role: "bot", content: botContent, timestamp: new Date() }]);
    } catch (err: any) {
      const msg = err.message?.includes("API key")
        ? "OpenRouter API key not configured. Add OPEN_ROUTER to Secrets."
        : `Error: ${err.message || "Connection failed. Check your API key."}`;
      setMessages((p) => [...p, { id: "err-" + Date.now(), role: "bot", content: msg, timestamp: new Date() }]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const formatTime = (d: Date) => d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const hasMessages = messages.length > 0;
  const skippyCtx = buildSkippyContext();

  return (
    <div className="h-full flex" style={{ background: "#fafafa" }}>
      <div className="w-72 shrink-0 border-r border-black/5 flex flex-col"
        style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)" }}>
        <div className="px-5 py-5 border-b border-black/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", boxShadow: "0 4px 12px rgba(245,158,11,0.4)" }}>
              <Settings2 size={14} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-800">Agent Tuning</h2>
              <p className="text-[10px] text-gray-400">Customise your AI agents</p>
            </div>
          </div>
        </div>

        <div className="px-5 py-4 space-y-5 flex-1 overflow-auto">
          <div className="rounded-2xl p-4 space-y-5"
            style={{ background: "#f4f4f4", boxShadow: "inset 2px 2px 6px rgba(0,0,0,0.05), inset -2px -2px 6px rgba(255,255,255,0.9)" }}>
            <p className="text-[10px] font-bold text-black/35 uppercase tracking-widest">Model Parameters</p>
            <Slider label="Creativity" sublabel="How experimental the output is" value={creativity} onChange={setCreativity} color="#ec4899" />
            <Slider label="Focus" sublabel="Structure & precision level" value={focus} onChange={setFocus} color="#3b82f6" />
            <Slider label="Brand Identity" sublabel="How strongly to match your voice" value={identity} onChange={setIdentity} color="#8b5cf6" />
          </div>

          <div className="rounded-2xl p-4"
            style={{ background: "#f4f4f4", boxShadow: "inset 2px 2px 6px rgba(0,0,0,0.05), inset -2px -2px 6px rgba(255,255,255,0.9)" }}>
            <p className="text-[10px] font-bold text-black/35 uppercase tracking-widest mb-3">Active Profile</p>
            <div className="space-y-2">
              {[
                { label: "Creativity", value: creativity, color: "#ec4899" },
                { label: "Focus", value: focus, color: "#3b82f6" },
                { label: "Identity", value: identity, color: "#8b5cf6" },
              ].map((p) => (
                <div key={p.label} className="flex items-center justify-between">
                  <span className="text-[10px] text-black/40">{p.label}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-1 w-20 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.06)" }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${p.value * 100}%`, background: p.color }} />
                    </div>
                    <span className="text-[10px] font-bold tabular-nums" style={{ color: p.color, minWidth: 28 }}>{Math.round(p.value * 100)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {skippyCtx && (
            <div className="rounded-2xl p-3" style={{ background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.15)" }}>
              <div className="flex items-center gap-1.5 mb-1">
                <Zap size={9} className="text-amber-500" />
                <span className="text-[9px] font-bold text-amber-500 uppercase tracking-wider">Skippy Context</span>
              </div>
              <p className="text-[9px] text-amber-700/60 leading-relaxed line-clamp-3">{skippyCtx}</p>
            </div>
          )}

          <div className="rounded-xl p-3" style={{ background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.08)" }}>
            <p className="text-[9px] text-black/30 leading-relaxed">
              💡 Adjust the sliders then describe your brand voice or strategy. Every instruction bakes into Meta, Snooks, and Skippy outputs permanently.
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="px-6 py-4 border-b border-black/5 flex items-center justify-between shrink-0"
          style={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(12px)" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", boxShadow: "0 4px 12px rgba(245,158,11,0.4)" }}>
              <Brain size={16} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-semibold text-gray-800">Tuning</h1>
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              </div>
              <p className="text-[10px] text-gray-400">AI Model Customisation Engine</p>
            </div>
          </div>
          {hasMessages && (
            <button onClick={() => { setMessages([]); historyRef.current = []; }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-black/30 hover:text-black/60 hover:bg-black/5 transition-all">
              <RotateCcw size={11} /><span>Clear</span>
            </button>
          )}
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          {!hasMessages ? (
            <div className="h-full flex flex-col items-center justify-center gap-8 p-8 text-center">
              <div>
                <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }}
                  className="w-20 h-20 rounded-3xl mx-auto mb-5 flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.12), rgba(217,119,6,0.06))", border: "1px solid rgba(245,158,11,0.18)" }}>
                  <Brain size={32} className="text-amber-400" />
                </motion.div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Train your agents</h2>
                <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
                  Adjust the sliders and describe your brand voice, content style, or growth strategy. Every instruction permanently shapes how Meta, Snooks, and Skippy respond.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-xl">
                {STARTER_PROMPTS.map((p) => (
                  <motion.button key={p.text} onClick={() => handleSend(p.text)}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="flex items-start gap-3 text-left px-4 py-3.5 rounded-2xl transition-all border"
                    style={{ background: "rgba(255,255,255,0.9)", borderColor: "rgba(0,0,0,0.05)" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(245,158,11,0.3)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,0,0,0.05)"; }}>
                    <span className="text-base shrink-0">{p.icon}</span>
                    <span className="text-xs text-gray-500 leading-relaxed">{p.text}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          ) : (
            <div className="px-6 py-6 space-y-6 max-w-3xl">
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div key={msg.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
                    className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                    {msg.role === "bot" ? <TuningAvatar /> : <UserAvatar />}
                    <div className={`flex-1 max-w-[85%] relative group ${msg.role === "user" ? "flex flex-col items-end" : ""}`}>
                      <div className={`px-5 py-4 rounded-2xl text-sm leading-relaxed ${msg.role === "user" ? "rounded-tr-sm" : "rounded-tl-sm"}`}
                        style={msg.role === "bot"
                          ? { background: "rgba(255,255,255,0.95)", border: "1px solid rgba(0,0,0,0.05)", boxShadow: "0 2px 12px rgba(0,0,0,0.03)", color: "rgba(0,0,0,0.75)" }
                          : { background: "linear-gradient(135deg, rgba(245,158,11,0.13), rgba(217,119,6,0.07))", border: "1px solid rgba(245,158,11,0.18)", color: "rgba(0,0,0,0.75)" }}>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      <div className={`flex items-center gap-1 mt-1.5 ${msg.role === "user" ? "justify-end" : ""}`}>
                        <span className="text-[9px] text-black/15">{formatTime(msg.timestamp)}</span>
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
              {isGenerating && (
                <div className="flex gap-3">
                  <TuningAvatar />
                  <div className="px-4 py-3 rounded-2xl rounded-tl-sm" style={{ background: "rgba(255,255,255,0.95)", border: "1px solid rgba(0,0,0,0.05)" }}>
                    <div className="flex gap-1.5">
                      {[0, 1, 2].map((i) => (
                        <motion.div key={i} animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                          className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-black/5 shrink-0"
          style={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(12px)" }}>
          <div className="flex items-end gap-3 rounded-2xl px-5 py-3.5 transition-all focus-within:ring-2 focus-within:ring-amber-200"
            style={{ background: "rgba(0,0,0,0.035)", border: "1px solid rgba(0,0,0,0.06)" }}>
            <textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown} disabled={isGenerating}
              placeholder="Describe your brand voice, content style, or growth strategy..."
              rows={1} className="flex-1 bg-transparent text-sm text-black/70 placeholder:text-black/20 outline-none resize-none min-h-[24px] max-h-40"
              style={{ lineHeight: "1.5rem" }} />
            <motion.button onClick={() => handleSend()} disabled={isGenerating || !input.trim()}
              whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.96 }}
              className="p-2.5 rounded-xl disabled:opacity-25 transition-all shrink-0 self-end"
              style={input.trim()
                ? { background: "linear-gradient(135deg, #f59e0b, #d97706)", boxShadow: "0 4px 12px rgba(245,158,11,0.4)" }
                : { background: "rgba(0,0,0,0.06)" }}>
              {isGenerating
                ? <Loader2 size={13} className="text-white animate-spin" />
                : <Send size={13} className={input.trim() ? "text-white" : "text-black/25"} />}
            </motion.button>
          </div>
          <p className="text-[10px] text-black/15 mt-2 text-center">
            Tuning · Your instructions shape all agent outputs · Powered by OpenRouter
          </p>
        </div>
      </div>
    </div>
  );
}
