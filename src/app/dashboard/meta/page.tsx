"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Paperclip, ArrowUp, Loader2 } from "lucide-react";
import Image from "next/image";

interface ChatMsg {
  id: string;
  role: "user" | "bot";
  content: string;
  timestamp: Date;
}

/* Pixel dot pattern for background */
function DotPattern() {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)`,
        backgroundSize: "22px 22px",
      }}
    />
  );
}

export default function MetaPage() {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
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
    const userMsg: ChatMsg = { id: Date.now().toString(), role: "user", content: msg, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    try {
      const res = await fetch("/api/ai/meta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, history: [] }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(), role: "bot",
        content: data.reply || data.message || "Here's what I'd write for you...",
        timestamp: new Date(),
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(), role: "bot",
        content: "Connection error — please try again.",
        timestamp: new Date(),
      }]);
    } finally { setLoading(false); }
  }, [input, loading]);

  const handleVoice = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert("Voice input not supported in this browser."); return;
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
    <div
      className="h-full flex flex-col overflow-hidden relative"
      style={{ background: "#0d0d14" }}
    >
      <DotPattern />

      {/* Top bar */}
      <div
        className="relative z-10 flex items-center justify-center gap-3 py-4 flex-shrink-0"
        style={{
          background: "rgba(255,255,255,0.03)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #ff9de2, #b8a4ff)" }}
        >
          <span className="font-pixel text-white" style={{ fontSize: 8 }}>ME</span>
        </div>
        <div className="text-center">
          <h1 className="font-pixel text-white/90 leading-none" style={{ fontSize: 11 }}>META</h1>
          <p className="font-pixel-thin text-white/30 mt-0.5" style={{ fontSize: 13 }}>Your AI Copywriter</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-5 relative z-10">
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full text-center gap-4"
          >
            <div
              className="w-16 h-16 rounded-3xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, rgba(255,157,226,0.15), rgba(184,164,255,0.15))", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <span className="font-pixel text-white/40" style={{ fontSize: 14 }}>M</span>
            </div>
            <div>
              <p className="font-pixel text-white/50" style={{ fontSize: 9 }}>READY TO WRITE</p>
              <p className="font-pixel-thin text-white/25 mt-2" style={{ fontSize: 15 }}>
                Drop a content seed, a raw idea,<br />or a topic — I'll make it shareable.
              </p>
            </div>
          </motion.div>
        )}

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
                      background: "#ffffff",
                      boxShadow: "0 4px 20px rgba(255,255,255,0.12), 0 0 0 1px rgba(255,255,255,0.08)",
                      borderBottomRightRadius: 8,
                    }
                  : {
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      backdropFilter: "blur(12px)",
                      borderBottomLeftRadius: 8,
                    }
              }
            >
              <p
                className="font-pixel-thin leading-relaxed"
                style={{
                  fontSize: 17,
                  color: msg.role === "user" ? "#0d0d14" : "rgba(255,255,255,0.75)",
                  whiteSpace: "pre-wrap",
                }}
              >
                {msg.content}
              </p>
              <p
                className="font-pixel-thin mt-1.5"
                style={{ fontSize: 11, color: msg.role === "user" ? "rgba(13,13,20,0.35)" : "rgba(255,255,255,0.2)" }}
              >
                {fmt(msg.timestamp)}
              </p>
            </div>
          </motion.div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div
              className="px-5 py-4 rounded-3xl rounded-bl-lg"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <Loader2 size={14} className="animate-spin text-white/30" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="relative z-10 px-6 pb-6 pt-3 flex-shrink-0">
        <div
          className="relative rounded-3xl overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.07)",
            backdropFilter: "blur(24px)",
            border: "1.5px solid rgba(255,255,255,0.1)",
            boxShadow: "0 -4px 32px rgba(0,0,0,0.4), 0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)",
          }}
        >
          <div className="flex items-end gap-2 px-4 py-3">
            <input type="file" ref={fileRef} className="hidden" />
            <button
              onClick={() => fileRef.current?.click()}
              className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors mb-0.5"
            >
              <Paperclip size={15} className="text-white/30" />
            </button>

            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={handleTextareaChange}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
              placeholder="Write a viral post about..."
              className="flex-1 bg-transparent outline-none resize-none font-pixel-thin text-white/80 placeholder:text-white/20"
              style={{ fontSize: 17, lineHeight: 1.5, minHeight: 28, maxHeight: 160 }}
            />

            <button
              onClick={handleVoice}
              className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors mb-0.5"
            >
              <Mic size={15} className={listening ? "text-red-400 animate-pulse" : "text-white/30"} />
            </button>

            <motion.button
              onClick={send}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              disabled={!input.trim() || loading}
              className="flex-shrink-0 w-9 h-9 rounded-2xl flex items-center justify-center mb-0.5"
              style={{
                background: input.trim() && !loading ? "#ffffff" : "rgba(255,255,255,0.08)",
                boxShadow: input.trim() && !loading ? "0 2px 10px rgba(255,255,255,0.15)" : "none",
                transition: "all 0.2s",
              }}
            >
              <ArrowUp size={15} style={{ color: input.trim() && !loading ? "#0d0d14" : "rgba(255,255,255,0.2)" }} />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
