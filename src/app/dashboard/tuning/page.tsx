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

function PixelDotBg() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ background: "#0b1120" }}>
      {/* Dense pixel dot field - mimicking the reference images */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: [
            "radial-gradient(circle, rgba(100,220,255,0.55) 1px, transparent 1px)",
            "radial-gradient(circle, rgba(255,80,180,0.45) 1px, transparent 1px)",
            "radial-gradient(circle, rgba(255,220,60,0.35) 1px, transparent 1px)",
            "radial-gradient(circle, rgba(80,200,255,0.3) 1px, transparent 1px)",
          ].join(", "),
          backgroundSize: "12px 12px, 17px 17px, 23px 23px, 7px 7px",
          backgroundPosition: "0 0, 6px 9px, 11px 5px, 3px 3px",
        }}
      />
      {/* Dark fade overlay — lightest at the middle, dark at edges */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at 50% 60%, rgba(11,17,32,0) 0%, rgba(11,17,32,0.5) 55%, rgba(11,17,32,0.92) 100%)",
        }}
      />
      {/* Strong bottom dark band */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{ height: "35%", background: "linear-gradient(to top, #0b1120 0%, transparent 100%)" }}
      />
      {/* Top dark band */}
      <div
        className="absolute top-0 left-0 right-0"
        style={{ height: "25%", background: "linear-gradient(to bottom, #0b1120 0%, transparent 100%)" }}
      />
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
    <div className="h-full flex flex-col overflow-hidden relative" style={{ background: "#0b1120" }}>
      <PixelDotBg />

      {/* Top bar */}
      <div
        className="relative z-10 flex items-center justify-center gap-3 py-4 flex-shrink-0"
        style={{ background: "rgba(11,17,32,0.75)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #ffd97d, #ff9de2)" }}>
          <span className="font-pixel text-black/70" style={{ fontSize: 8 }}>TN</span>
        </div>
        <div className="text-center">
          <h1 className="font-pixel text-white/90 leading-none" style={{ fontSize: 11 }}>TUNING</h1>
          <p className="font-pixel-thin text-white/30 mt-0.5" style={{ fontSize: 14 }}>Voice Calibration Engine</p>
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
                      boxShadow: "0 4px 20px rgba(255,255,255,0.08)",
                      borderBottomRightRadius: 8,
                    }
                  : {
                      background: "rgba(255,255,255,0.07)",
                      border: "1px solid rgba(255,255,255,0.10)",
                      backdropFilter: "blur(16px)",
                      borderBottomLeftRadius: 8,
                    }
              }
            >
              <p
                className="font-pixel-thin leading-relaxed whitespace-pre-wrap"
                style={{ fontSize: 17, color: msg.role === "user" ? "#0b1120" : "rgba(255,255,255,0.82)" }}
              >
                {msg.content}
              </p>
              <p
                className="font-pixel-thin mt-1.5"
                style={{ fontSize: 12, color: msg.role === "user" ? "rgba(11,17,32,0.35)" : "rgba(255,255,255,0.22)" }}
              >
                {fmt(msg.timestamp)}
              </p>
            </div>
          </motion.div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="px-5 py-4 rounded-3xl rounded-bl-lg" style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.10)", backdropFilter: "blur(16px)" }}>
              <Loader2 size={14} className="animate-spin text-white/25" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div
        className="relative z-10 px-6 pb-6 pt-3 flex-shrink-0"
        style={{ background: "rgba(11,17,32,0.8)", backdropFilter: "blur(20px)", borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div
          className="relative rounded-3xl overflow-hidden"
          style={{ background: "#000000", boxShadow: "0 4px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)" }}
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
              className="flex-1 bg-transparent outline-none resize-none font-pixel-thin placeholder:text-white/20"
              style={{ fontSize: 17, lineHeight: 1.5, minHeight: 28, maxHeight: 160, color: "#ffffff" }}
            />

            <button
              onClick={handleVoice}
              className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors mb-0.5"
            >
              <Mic size={15} className={listening ? "text-red-400 animate-pulse" : "text-white/25"} />
            </button>

            <motion.button
              onClick={send}
              whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
              disabled={!input.trim() || loading}
              className="flex-shrink-0 w-9 h-9 rounded-2xl flex items-center justify-center mb-0.5"
              style={{
                background: input.trim() && !loading ? "#ffffff" : "rgba(255,255,255,0.07)",
                boxShadow: input.trim() && !loading ? "0 2px 10px rgba(255,255,255,0.12)" : "none",
                transition: "all 0.2s",
              }}
            >
              <ArrowUp size={15} style={{ color: input.trim() && !loading ? "#0b1120" : "rgba(255,255,255,0.18)" }} />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
