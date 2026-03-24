"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, SlidersHorizontal, Loader2, User, Bot, Copy, Check, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboardStore } from "@/hooks/use-dashboard-store";

interface ChatMsg {
  id: string;
  role: "user" | "bot";
  content: string;
}

const PARAMS = [
  { key: "creativity", label: "Creativity", sublabel: "Temperature", min: 0, max: 1, step: 0.05, default: 0.7 },
  { key: "focus", label: "Focus", sublabel: "Top-P Nucleus", min: 0, max: 1, step: 0.05, default: 0.9 },
  { key: "identity", label: "Identity Weight", sublabel: "Brand Consistency", min: 0, max: 1, step: 0.05, default: 0.85 },
];

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

const STARTER_PROMPTS = [
  "Help me tune Snooks to write more conversational LinkedIn content",
  "What content strategy works best for a solo developer launching a SaaS?",
  "Give me a 30-day Twitter growth plan starting from 0 followers",
  "Tune Flippo to be more encouraging and less technical in its insights",
];

export default function TuningPage() {
  const { assistanceMsg } = useDashboardStore();
  const [params, setParams] = useState<Record<string, number>>(
    Object.fromEntries(PARAMS.map((p) => [p.key, p.default]))
  );
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showParams, setShowParams] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isSending]);

  const handleSend = async (override?: string) => {
    const userInput = override || input;
    if (!userInput.trim() || isSending) return;
    setInput("");

    const userMsg: ChatMsg = { id: Date.now().toString(), role: "user", content: userInput };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsSending(true);

    try {
      const res = await fetch("/api/ai/tuning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          skippyContext: assistanceMsg || "",
          agentParams: params,
        }),
      });
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "bot", content: data.response }]);
    } catch {
      setMessages((prev) => [...prev, { id: "err", role: "bot", content: "Failed to connect. Try again." }]);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="h-full bg-[#0f0f0f] flex flex-col">
      {/* Header */}
      <div className="px-8 py-5 border-b border-white/5 flex items-center justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
            <span className="text-[11px] text-white/30 font-medium uppercase tracking-widest">Studio Intelligence · Tuning</span>
          </div>
          <h1 className="text-lg font-semibold text-white tracking-tight">Agent Tuning</h1>
        </div>
        <button
          onClick={() => setShowParams(!showParams)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all border",
            showParams
              ? "bg-white text-black border-transparent"
              : "text-white/40 border-white/10 hover:text-white hover:border-white/20"
          )}
        >
          <SlidersHorizontal size={12} />
          <span>Parameters</span>
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-8 py-6">
            {isEmpty ? (
              <div className="h-full flex flex-col items-center justify-center gap-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center">
                  <Zap size={22} className="text-white/20" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-white/60">Tune your agents</h2>
                  <p className="text-xs text-white/25 mt-1.5 max-w-xs leading-relaxed">
                    Chat to fine-tune how Snooks and Flippo behave. Your uploads and conversations shape future outputs.
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
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn("flex gap-3", msg.role === "user" ? "flex-row-reverse" : "")}
                    >
                      <div className={cn(
                        "w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                        msg.role === "user" ? "bg-white/10" : "bg-white/5"
                      )}>
                        {msg.role === "user"
                          ? <User size={12} className="text-white/50" />
                          : <Bot size={12} className="text-white/50" />
                        }
                      </div>
                      <div className="max-w-[80%] relative group">
                        <div className={cn(
                          "px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap",
                          msg.role === "user"
                            ? "bg-white text-black rounded-tr-sm"
                            : "bg-white/[0.04] text-white/70 rounded-tl-sm border border-white/5"
                        )}>
                          {msg.content}
                        </div>
                        {msg.role === "bot" && (
                          <div className="absolute -top-1 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <CopyButton text={msg.content} />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {isSending && (
                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                      <Bot size={12} className="text-white/50" />
                    </div>
                    <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-white/[0.04] border border-white/5">
                      <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <motion.div key={i} animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
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
          <div className="px-8 py-4 border-t border-white/5 shrink-0">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-end gap-3 bg-white/[0.04] rounded-2xl px-4 py-3 border border-white/5 focus-within:border-white/10 transition-all">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isSending}
                  placeholder="Chat to tune your agents..."
                  rows={1}
                  className="flex-1 bg-transparent text-sm text-white/80 placeholder:text-white/20 outline-none resize-none min-h-[24px] max-h-32"
                  style={{ lineHeight: "1.5rem" }}
                />
                <button
                  onClick={() => handleSend()}
                  disabled={isSending || !input.trim()}
                  className="p-2.5 rounded-xl bg-white text-black disabled:opacity-20 hover:bg-white/90 transition-colors shrink-0 self-end"
                >
                  <Send size={13} />
                </button>
              </div>
              <p className="text-[10px] text-white/15 mt-2 text-center">
                Tuning conversations shape how Snooks generates content · Powered by OpenRouter
              </p>
            </div>
          </div>
        </div>

        {/* Parameters panel */}
        <AnimatePresence>
          {showParams && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="shrink-0 border-l border-white/5 overflow-hidden"
            >
              <div className="w-[280px] p-6 space-y-6">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={13} className="text-white/30" />
                  <span className="text-xs text-white/30 font-medium uppercase tracking-wider">Hyperparameters</span>
                </div>
                {PARAMS.map((param) => (
                  <div key={param.key} className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm font-medium text-white/70">{param.label}</div>
                        <div className="text-[10px] text-white/30">{param.sublabel}</div>
                      </div>
                      <div className="text-xs font-mono text-white bg-white/10 px-2.5 py-1 rounded-lg">
                        {params[param.key].toFixed(2)}
                      </div>
                    </div>
                    <input
                      type="range" min={param.min} max={param.max} step={param.step}
                      value={params[param.key]}
                      onChange={(e) => setParams((v) => ({ ...v, [param.key]: parseFloat(e.target.value) }))}
                      className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-white"
                    />
                  </div>
                ))}
                <div className="pt-2 p-4 rounded-xl bg-white/[0.03] border border-white/5">
                  <p className="text-[10px] font-mono text-white/30 leading-loose italic">
                    "Act as a professional marketing lead with high-fidelity knowledge of the user's projects."
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
