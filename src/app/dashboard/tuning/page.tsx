"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Mic, Paperclip, ArrowUp, Loader2 } from "lucide-react";

interface ChatMsg {
  id: string;
  role: "user" | "bot";
  content: string;
  timestamp: Date;
}

/* ─── Architectural grid + liquid gradient background ─── */
function ArchitecturalBg() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Base: white + light blue liquid gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(135deg, #f8fbff 0%, #eaf4ff 25%, #f0f8ff 50%, #e6f2ff 75%, #f5f9ff 100%)",
        }}
      />

      {/* Liquid gradient blobs */}
      <div
        className="absolute"
        style={{
          top: "8%", left: "15%",
          width: "55vw", height: "55vw",
          background: "radial-gradient(ellipse at center, rgba(186,224,255,0.45) 0%, rgba(220,240,255,0.25) 45%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: "10%", right: "10%",
          width: "45vw", height: "45vw",
          background: "radial-gradient(ellipse at center, rgba(147,210,255,0.35) 0%, rgba(200,230,255,0.2) 45%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />
      <div
        className="absolute"
        style={{
          top: "40%", right: "25%",
          width: "30vw", height: "30vw",
          background: "radial-gradient(ellipse at center, rgba(200,230,255,0.3) 0%, transparent 65%)",
          filter: "blur(40px)",
        }}
      />

      {/* Architectural square grid — grey lines */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(160,185,220,0.18) 1px, transparent 1px),
            linear-gradient(90deg, rgba(160,185,220,0.18) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Finer sub-grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(160,185,220,0.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(160,185,220,0.07) 1px, transparent 1px)
          `,
          backgroundSize: "8px 8px",
        }}
      />

      {/* Subtle vignette — edges slightly darker */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at 50% 50%, transparent 50%, rgba(180,210,240,0.12) 100%)",
        }}
      />
    </div>
  );
}

/* ─── Liquid glass top bar ─── */
function LiquidGlassBar({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative z-10 flex items-center justify-center gap-3 py-4 flex-shrink-0 overflow-hidden"
      style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.72) 0%, rgba(225,240,255,0.62) 40%, rgba(255,255,255,0.68) 100%)",
        backdropFilter: "blur(40px) saturate(200%) brightness(106%)",
        WebkitBackdropFilter: "blur(40px) saturate(200%) brightness(106%)",
        borderBottom: "1px solid rgba(200,225,255,0.6)",
        boxShadow: "0 1px 0 rgba(255,255,255,0.9), 0 4px 24px rgba(160,210,255,0.15), inset 0 1px 0 rgba(255,255,255,0.95)",
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(120deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 50%, rgba(200,230,255,0.25) 100%)",
          mixBlendMode: "screen",
        }}
      />
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{
          height: 1.5,
          background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.95), rgba(255,255,255,0))",
        }}
      />
      <div className="relative z-10 flex items-center gap-3">
        {children}
      </div>
    </div>
  );
}

export default function TuningPage() {
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      id: "init", role: "bot",
      content: "I'm Tuning — your voice calibration engine. Paste AI-generated text to humanise it, or tell me how you naturally write and I'll build your voice profile.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = useCallback(async () => {
    const msg = input.trim();
    if (!msg || loading) return;
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    const userMsg: ChatMsg = { id: Date.now().toString(), role: "user", content: msg, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    try {
      const res = await fetch("/api/ai/tuning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, history: [] }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(), role: "bot",
        content: data.reply || data.message || "Here's the humanised version...",
        timestamp: new Date(),
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(), role: "bot",
        content: "Connection issue — please retry.",
        timestamp: new Date(),
      }]);
    } finally { setLoading(false); }
  }, [input, loading]);

  const handleVoice = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert("Voice input not supported."); return;
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SR();
    recognition.lang = 'en-US';
    setListening(true);
    recognition.onresult = (e: any) => { setInput(e.results[0][0].transcript); setListening(false); };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognition.start();
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + "px";
  };

  const fmt = (d: Date) => d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  return (
    <div className="h-full flex flex-col overflow-hidden relative">
      <ArchitecturalBg />

      {/* Liquid glass top bar */}
      <LiquidGlassBar>
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, rgba(255,217,125,0.9), rgba(255,157,226,0.9))",
            backdropFilter: "blur(8px)",
            boxShadow: "0 2px 8px rgba(255,180,100,0.3), inset 0 1px 0 rgba(255,255,255,0.5)",
          }}
        >
          <span className="font-pixel text-black/70" style={{ fontSize: 8 }}>TN</span>
        </div>
        <div className="text-center">
          <h1 className="font-pixel text-black/75 leading-none" style={{ fontSize: 11 }}>TUNING</h1>
          <p className="font-pixel-thin text-black/45 mt-0.5" style={{ fontSize: 14 }}>Voice Calibration Engine</p>
        </div>
      </LiquidGlassBar>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-5 relative z-10">
        {messages.map(msg => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className="max-w-[78%] px-5 py-4 rounded-3xl"
              style={
                msg.role === "user"
                  ? {
                      background: "rgba(255,255,255,0.92)",
                      backdropFilter: "blur(20px)",
                      boxShadow: "0 4px 20px rgba(160,210,255,0.2), 0 1px 4px rgba(0,0,0,0.06)",
                      border: "1px solid rgba(200,230,255,0.6)",
                      borderBottomRightRadius: 8,
                    }
                  : {
                      background: "rgba(255,255,255,0.55)",
                      border: "1px solid rgba(200,225,255,0.5)",
                      backdropFilter: "blur(24px)",
                      WebkitBackdropFilter: "blur(24px)",
                      boxShadow: "0 2px 12px rgba(160,210,255,0.12)",
                      borderBottomLeftRadius: 8,
                    }
              }
            >
              <p
                className="font-pixel-thin leading-relaxed whitespace-pre-wrap"
                style={{ fontSize: 17, color: "rgba(20,40,80,0.82)" }}
              >
                {msg.content}
              </p>
              <p
                className="font-pixel-thin mt-1.5"
                style={{ fontSize: 12, color: "rgba(60,100,160,0.4)" }}
              >
                {fmt(msg.timestamp)}
              </p>
            </div>
          </motion.div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="px-5 py-4 rounded-3xl rounded-bl-lg" style={{ background: "rgba(255,255,255,0.55)", border: "1px solid rgba(200,225,255,0.5)", backdropFilter: "blur(24px)" }}>
              <Loader2 size={14} className="animate-spin" style={{ color: "rgba(100,160,220,0.6)" }} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div
        className="relative z-10 px-6 pb-6 pt-3 flex-shrink-0"
        style={{
          background: "rgba(240,248,255,0.7)",
          backdropFilter: "blur(32px) saturate(180%)",
          WebkitBackdropFilter: "blur(32px) saturate(180%)",
          borderTop: "1px solid rgba(200,225,255,0.5)",
        }}
      >
        <div
          className="relative rounded-3xl overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.88)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 4px 24px rgba(160,210,255,0.2), 0 1px 8px rgba(0,0,0,0.06), 0 0 0 1px rgba(200,230,255,0.5)",
            border: "1px solid rgba(255,255,255,0.9)",
          }}
        >
          <div className="flex items-end gap-2 px-4 py-3">
            <input type="file" ref={fileRef} className="hidden" />
            <button
              onClick={() => fileRef.current?.click()}
              className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center hover:bg-blue-50 transition-colors mb-0.5"
            >
              <Paperclip size={15} style={{ color: "rgba(100,150,200,0.5)" }} />
            </button>

            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={handleTextareaChange}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
              placeholder="Paste text to humanise, or describe your voice..."
              className="flex-1 bg-transparent outline-none resize-none font-pixel-thin placeholder:text-blue-300/60"
              style={{ fontSize: 17, lineHeight: 1.5, minHeight: 28, maxHeight: 160, color: "rgba(20,40,80,0.8)" }}
            />

            <button
              onClick={handleVoice}
              className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center hover:bg-blue-50 transition-colors mb-0.5"
            >
              <Mic size={15} className={listening ? "text-red-400 animate-pulse" : ""} style={{ color: listening ? undefined : "rgba(100,150,200,0.5)" }} />
            </button>

            <motion.button
              onClick={send}
              whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
              disabled={!input.trim() || loading}
              className="flex-shrink-0 w-9 h-9 rounded-2xl flex items-center justify-center mb-0.5"
              style={{
                background: input.trim() && !loading
                  ? "linear-gradient(135deg, #4facfe, #00f2fe)"
                  : "rgba(180,210,240,0.3)",
                boxShadow: input.trim() && !loading ? "0 2px 12px rgba(79,172,254,0.4)" : "none",
                transition: "all 0.2s",
              }}
            >
              <ArrowUp size={15} style={{ color: input.trim() && !loading ? "#fff" : "rgba(100,150,200,0.4)" }} />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
