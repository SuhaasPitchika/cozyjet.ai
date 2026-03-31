"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Paperclip, ArrowUp, Loader2 } from "lucide-react";

interface ChatMsg {
  id: string;
  role: "user" | "bot";
  content: string;
  timestamp: Date;
}

/* Moving ambient dot blobs */
function AmbientDots() {
  const dots = [
    { color: "#1e3a5f", size: 260, x: "5%",  y: "10%", cls: "dot-drift-1", delay: "0s" },
    { color: "#d63384", size: 180, x: "75%", y: "20%", cls: "dot-drift-2", delay: "3s" },
    { color: "#f59e0b", size: 140, x: "55%", y: "65%", cls: "dot-drift-3", delay: "6s" },
    { color: "#1e3a5f", size: 200, x: "80%", y: "70%", cls: "dot-drift-1", delay: "9s" },
    { color: "#d63384", size: 100, x: "20%", y: "80%", cls: "dot-drift-2", delay: "1s" },
    { color: "#f59e0b", size: 120, x: "40%", y: "30%", cls: "dot-drift-3", delay: "5s" },
  ];
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {dots.map((d, i) => (
        <div
          key={i}
          className={d.cls}
          style={{
            position: "absolute",
            left: d.x,
            top: d.y,
            width: d.size,
            height: d.size,
            borderRadius: "50%",
            background: d.color,
            filter: "blur(72px)",
            opacity: 0.18,
            animationDelay: d.delay,
          }}
        />
      ))}
      {/* Pixelated dot overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)`,
          backgroundSize: "18px 18px",
        }}
      />
    </div>
  );
}

/* Blur glass overlay on content */
function GlassLayer({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative"
      style={{
        background: "rgba(255,255,255,0.04)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderTop: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {children}
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
      style={{ background: "#06060c" }}
    >
      <AmbientDots />

      {/* Top bar */}
      <div
        className="relative z-10 flex items-center justify-center gap-3 py-4 flex-shrink-0"
        style={{
          background: "rgba(255,255,255,0.03)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #ffd97d, #ff9de2)" }}
        >
          <span className="font-pixel text-black/70" style={{ fontSize: 8 }}>TN</span>
        </div>
        <div className="text-center">
          <h1 className="font-pixel text-white/90 leading-none" style={{ fontSize: 11 }}>TUNING</h1>
          <p className="font-pixel-thin text-white/30 mt-0.5" style={{ fontSize: 13 }}>Voice Calibration Engine</p>
        </div>
      </div>

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
                      background: "#ffffff",
                      boxShadow: "0 4px 20px rgba(255,255,255,0.1), 0 0 0 1px rgba(255,255,255,0.06)",
                      borderBottomRightRadius: 8,
                    }
                  : {
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.09)",
                      backdropFilter: "blur(16px)",
                      borderBottomLeftRadius: 8,
                    }
              }
            >
              <p
                className="font-pixel-thin leading-relaxed"
                style={{
                  fontSize: 17,
                  color: msg.role === "user" ? "#06060c" : "rgba(255,255,255,0.75)",
                  whiteSpace: "pre-wrap",
                }}
              >
                {msg.content}
              </p>
              <p
                className="font-pixel-thin mt-1.5"
                style={{ fontSize: 11, color: msg.role === "user" ? "rgba(6,6,12,0.3)" : "rgba(255,255,255,0.2)" }}
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
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.09)", backdropFilter: "blur(16px)" }}
            >
              <Loader2 size={14} className="animate-spin text-white/25" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <GlassLayer>
        <div className="relative z-10 px-6 pb-6 pt-3">
          <div
            className="relative rounded-3xl overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.06)",
              backdropFilter: "blur(32px)",
              border: "1.5px solid rgba(255,255,255,0.1)",
              boxShadow: "0 -4px 32px rgba(0,0,0,0.5), 0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.07)",
            }}
          >
            <div className="flex items-end gap-2 px-4 py-3">
              <input type="file" ref={fileRef} className="hidden" />
              <button
                onClick={() => fileRef.current?.click()}
                className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors mb-0.5"
              >
                <Paperclip size={15} className="text-white/25" />
              </button>

              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={handleTextareaChange}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
                placeholder="Paste text to humanise, or describe your voice..."
                className="flex-1 bg-transparent outline-none resize-none font-pixel-thin text-white/80 placeholder:text-white/20"
                style={{ fontSize: 17, lineHeight: 1.5, minHeight: 28, maxHeight: 160 }}
              />

              <button
                onClick={handleVoice}
                className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors mb-0.5"
              >
                <Mic size={15} className={listening ? "text-red-400 animate-pulse" : "text-white/25"} />
              </button>

              <motion.button
                onClick={send}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                disabled={!input.trim() || loading}
                className="flex-shrink-0 w-9 h-9 rounded-2xl flex items-center justify-center mb-0.5"
                style={{
                  background: input.trim() && !loading ? "#ffffff" : "rgba(255,255,255,0.07)",
                  boxShadow: input.trim() && !loading ? "0 2px 10px rgba(255,255,255,0.12)" : "none",
                  transition: "all 0.2s",
                }}
              >
                <ArrowUp size={15} style={{ color: input.trim() && !loading ? "#06060c" : "rgba(255,255,255,0.18)" }} />
              </motion.button>
            </div>
          </div>
        </div>
      </GlassLayer>
    </div>
  );
}
