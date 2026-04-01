"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Mic, Paperclip, ArrowUp, Loader2, Volume2, VolumeX } from "lucide-react";

interface ChatMsg {
  id: string;
  role: "user" | "bot";
  content: string;
  timestamp: Date;
}

function speakText(text: string) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  window.speechSynthesis.speak(utterance);
}

function stopSpeaking() {
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}

export default function MetaPage() {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSpeak = (msg: ChatMsg) => {
    if (speakingId === msg.id) {
      stopSpeaking();
      setSpeakingId(null);
      return;
    }
    setSpeakingId(msg.id);
    speakText(msg.content);
    const u = new SpeechSynthesisUtterance(msg.content);
    u.onend = () => setSpeakingId(null);
    u.onerror = () => setSpeakingId(null);
  };

  const send = useCallback(async () => {
    const msg = input.trim();
    if (!msg || loading) return;
    setInput("");
    const userMsg: ChatMsg = { id: Date.now().toString(), role: "user", content: msg, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    try {
      const history = messages
        .filter(m => m.id !== userMsg.id)
        .map(m => ({ role: m.role === "bot" ? "assistant" : "user", content: m.content }));
      const res = await fetch("/api/ai/meta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...history, { role: "user", content: msg }],
          skippyContext: null,
        }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(), role: "bot",
        content: data.reply || data.response || data.message || "Here's what I'd write for you...",
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
    <div className="h-full flex flex-col overflow-hidden mesh-bg">

      {/* Top bar */}
      <div
        className="flex items-center justify-center gap-3 py-4 flex-shrink-0 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.65) 0%, rgba(255,245,250,0.55) 40%, rgba(255,255,255,0.6) 100%)",
          backdropFilter: "blur(32px) saturate(180%) brightness(108%)",
          WebkitBackdropFilter: "blur(32px) saturate(180%) brightness(108%)",
          borderBottom: "1px solid rgba(255,255,255,0.7)",
          boxShadow: "0 1px 0 rgba(255,255,255,0.9), 0 4px 24px rgba(244,63,94,0.08), inset 0 1px 0 rgba(255,255,255,0.95)",
        }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(120deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 50%, rgba(255,200,220,0.15) 100%)", mixBlendMode: "screen" }} />
        <div className="absolute top-0 left-0 right-0 pointer-events-none" style={{ height: 1.5, background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.9), rgba(255,255,255,0))" }} />
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(244,63,94,0.9), rgba(249,115,22,0.9))", backdropFilter: "blur(8px)", boxShadow: "0 2px 8px rgba(244,63,94,0.3), inset 0 1px 0 rgba(255,255,255,0.4)" }}>
            <span className="font-pixel text-white" style={{ fontSize: 8 }}>ME</span>
          </div>
          <div className="text-center">
            <h1 className="font-pixel text-black/70 leading-none" style={{ fontSize: 11 }}>META</h1>
            <p className="font-pixel-thin text-black/40 mt-0.5" style={{ fontSize: 14 }}>AI Copywriter — give me a seed or idea</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-5">
        {messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: "rgba(255,255,255,0.9)", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
              <span style={{ fontSize: 28 }}>✍️</span>
            </div>
            <p className="font-pixel-thin text-black/50" style={{ fontSize: 18, lineHeight: 1.6, maxWidth: 340 }}>
              Drop a content seed from Skippy, a raw idea, or a topic. Meta will write three platform-specific variations that sound like you.
            </p>
          </div>
        )}

        {messages.map(msg => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div className="relative group">
              <div
                className="max-w-[78%] px-5 py-4 rounded-3xl"
                style={{
                  background: msg.role === "user" ? "#1a1a2e" : "rgba(255,255,255,0.92)",
                  border: msg.role === "user" ? "none" : "1px solid rgba(0,0,0,0.07)",
                  boxShadow: msg.role === "user"
                    ? "0 4px 16px rgba(26,26,46,0.25)"
                    : "0 2px 12px rgba(0,0,0,0.06)",
                  borderBottomRightRadius: msg.role === "user" ? 8 : 24,
                  borderBottomLeftRadius: msg.role === "bot" ? 8 : 24,
                }}
              >
                <p className="font-pixel-thin leading-relaxed whitespace-pre-wrap" style={{ fontSize: 18, color: msg.role === "user" ? "#fff" : "rgba(0,0,0,0.75)" }}>
                  {msg.content}
                </p>
                <div className="flex items-center justify-between mt-2 gap-3">
                  <p className="font-pixel-thin" style={{ fontSize: 12, color: msg.role === "user" ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.22)" }}>
                    {fmt(msg.timestamp)}
                  </p>
                  {msg.role === "bot" && (
                    <button
                      onClick={() => handleSpeak(msg)}
                      className="flex items-center gap-1 rounded-lg px-2 py-1 transition-all hover:bg-black/5"
                      style={{ opacity: 0.55 }}
                      title="Read aloud"
                    >
                      {speakingId === msg.id
                        ? <VolumeX size={13} className="text-red-400" />
                        : <Volume2 size={13} className="text-black/40" />
                      }
                      <span className="font-pixel-thin text-black/40" style={{ fontSize: 11 }}>
                        {speakingId === msg.id ? "Stop" : "Read"}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="px-5 py-4 rounded-3xl rounded-bl-lg" style={{ background: "rgba(255,255,255,0.92)", border: "1px solid rgba(0,0,0,0.07)" }}>
              <Loader2 size={14} className="animate-spin text-black/30" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ─── Liquid glass input bar ─── */}
      <div
        className="px-6 pb-6 pt-3 flex-shrink-0"
        style={{
          background: "rgba(255,255,255,0.5)",
          backdropFilter: "blur(28px) saturate(180%)",
          WebkitBackdropFilter: "blur(28px) saturate(180%)",
          borderTop: "1px solid rgba(255,255,255,0.6)",
        }}
      >
        <div
          className="relative rounded-3xl overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.72)",
            backdropFilter: "blur(40px) saturate(200%) brightness(108%)",
            WebkitBackdropFilter: "blur(40px) saturate(200%) brightness(108%)",
            border: "1.5px solid rgba(255,255,255,0.9)",
            boxShadow: `
              0 8px 32px rgba(244,63,94,0.12),
              0 4px 16px rgba(0,0,0,0.08),
              0 2px 6px rgba(0,0,0,0.05),
              inset 0 1px 0 rgba(255,255,255,1),
              inset 0 -1px 0 rgba(0,0,0,0.03)
            `,
          }}
        >
          {/* Glass sheen */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 50%, rgba(255,200,220,0.1) 100%)",
              borderRadius: "inherit",
            }}
          />
          <div className="flex items-end gap-2 px-4 py-3 relative z-10">
            <input type="file" ref={fileRef} className="hidden" />
            <button
              onClick={() => fileRef.current?.click()}
              className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center hover:bg-black/5 transition-colors mb-0.5"
            >
              <Paperclip size={16} className="text-black/30" />
            </button>

            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={handleTextareaChange}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
              placeholder="Give Meta a content seed or idea..."
              className="flex-1 bg-transparent outline-none resize-none font-pixel-thin placeholder:text-black/25"
              style={{ fontSize: 18, lineHeight: 1.55, minHeight: 28, maxHeight: 160, color: "rgba(0,0,0,0.75)" }}
            />

            <button
              onClick={handleVoice}
              className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center hover:bg-black/5 transition-colors mb-0.5"
              title="Voice input"
            >
              <Mic size={16} className={listening ? "text-red-400 animate-pulse" : "text-black/30"} />
            </button>

            <motion.button
              onClick={send}
              whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
              disabled={!input.trim() || loading}
              className="flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center mb-0.5"
              style={{
                background: input.trim() && !loading
                  ? "linear-gradient(135deg, #f43f5e, #f97316)"
                  : "rgba(0,0,0,0.07)",
                boxShadow: input.trim() && !loading
                  ? "0 4px 16px rgba(244,63,94,0.35), 0 2px 6px rgba(0,0,0,0.1)"
                  : "none",
                transition: "all 0.2s",
              }}
            >
              <ArrowUp size={16} style={{ color: input.trim() && !loading ? "#fff" : "rgba(0,0,0,0.25)" }} />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
