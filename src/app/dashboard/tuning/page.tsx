"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Mic, ArrowUp, Loader2, Volume2, VolumeX } from "lucide-react";

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

/* ─── Blue grid only between the chat squares ─── */
function GridBetweenContent({ chatRef }: { chatRef: React.RefObject<HTMLDivElement | null> }) {
  const [bounds, setBounds] = useState<{ top: number; bottom: number } | null>(null);

  useEffect(() => {
    const update = () => {
      if (chatRef.current) {
        const rect = chatRef.current.getBoundingClientRect();
        const parentRect = chatRef.current.parentElement?.getBoundingClientRect();
        if (parentRect) {
          setBounds({ top: rect.top - parentRect.top, bottom: rect.bottom - parentRect.top });
        }
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [chatRef]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Full base: plain light blue */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #f8fbff 0%, #edf6ff 40%, #f3f9ff 100%)" }} />

      {/* Liquid blobs in the grid zone only */}
      {bounds && (
        <>
          <div
            className="absolute"
            style={{
              top: bounds.top + "px",
              left: "10%",
              width: "60vw", height: (bounds.bottom - bounds.top) * 0.8,
              background: "radial-gradient(ellipse at center, rgba(147,210,255,0.35) 0%, rgba(200,230,255,0.18) 50%, transparent 70%)",
              filter: "blur(50px)",
            }}
          />
          <div
            className="absolute"
            style={{
              top: bounds.top + (bounds.bottom - bounds.top) * 0.3 + "px",
              right: "8%",
              width: "40vw", height: (bounds.bottom - bounds.top) * 0.6,
              background: "radial-gradient(ellipse at center, rgba(186,224,255,0.3) 0%, transparent 70%)",
              filter: "blur(60px)",
            }}
          />

          {/* Grid lines only in the chat area */}
          <div
            className="absolute left-0 right-0"
            style={{
              top: bounds.top,
              height: bounds.bottom - bounds.top,
              backgroundImage: `
                linear-gradient(rgba(140,180,220,0.2) 1px, transparent 1px),
                linear-gradient(90deg, rgba(140,180,220,0.2) 1px, transparent 1px)
              `,
              backgroundSize: "40px 40px",
            }}
          />
          <div
            className="absolute left-0 right-0"
            style={{
              top: bounds.top,
              height: bounds.bottom - bounds.top,
              backgroundImage: `
                linear-gradient(rgba(140,180,220,0.07) 1px, transparent 1px),
                linear-gradient(90deg, rgba(140,180,220,0.07) 1px, transparent 1px)
              `,
              backgroundSize: "8px 8px",
            }}
          />
        </>
      )}

      {/* Subtle vignette */}
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 50%, transparent 50%, rgba(180,210,240,0.1) 100%)" }} />
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
        style={{ height: 1.5, background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.95), rgba(255,255,255,0))" }}
      />
      <div className="relative z-10 flex items-center gap-3">{children}</div>
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
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSpeak = (msg: ChatMsg) => {
    if (speakingId === msg.id) {
      stopSpeaking();
      setSpeakingId(null);
      return;
    }
    setSpeakingId(msg.id);
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(msg.content);
      u.rate = 1.0;
      u.pitch = 1.0;
      u.onend = () => setSpeakingId(null);
      u.onerror = () => setSpeakingId(null);
      window.speechSynthesis.speak(u);
    }
  };

  const send = useCallback(async () => {
    const msg = input.trim();
    if (!msg || loading) return;
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    const userMsg: ChatMsg = { id: Date.now().toString(), role: "user", content: msg, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    try {
      const history = messages
        .filter(m => m.id !== userMsg.id)
        .map(m => ({ role: m.role === "bot" ? "assistant" : "user", content: m.content }));
      const res = await fetch("/api/ai/tuning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...history, { role: "user", content: msg }],
        }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(), role: "bot",
        content: data.reply || data.response || data.message || "Here's the humanised version...",
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
      <GridBetweenContent chatRef={chatContainerRef} />

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
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-5 relative z-10"
      >
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
                style={{ fontSize: 18, color: "rgba(20,40,80,0.82)" }}
              >
                {msg.content}
              </p>
              <div className="flex items-center justify-between mt-2 gap-3">
                <p className="font-pixel-thin" style={{ fontSize: 12, color: "rgba(60,100,160,0.4)" }}>
                  {fmt(msg.timestamp)}
                </p>
                {msg.role === "bot" && (
                  <button
                    onClick={() => handleSpeak(msg)}
                    className="flex items-center gap-1 rounded-lg px-2 py-0.5 transition-all hover:bg-blue-50"
                    style={{ opacity: 0.6 }}
                    title="Read aloud"
                  >
                    {speakingId === msg.id
                      ? <VolumeX size={13} className="text-red-400" />
                      : <Volume2 size={13} style={{ color: "rgba(100,150,200,0.7)" }} />
                    }
                    <span className="font-pixel-thin" style={{ fontSize: 11, color: "rgba(80,130,190,0.6)" }}>
                      {speakingId === msg.id ? "Stop" : "Read"}
                    </span>
                  </button>
                )}
              </div>
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

      {/* ─── Enhanced input bar ─── */}
      <div
        className="relative z-10 px-6 pb-6 pt-3 flex-shrink-0"
        style={{
          background: "rgba(240,248,255,0.65)",
          backdropFilter: "blur(32px) saturate(180%)",
          WebkitBackdropFilter: "blur(32px) saturate(180%)",
          borderTop: "1px solid rgba(200,225,255,0.5)",
        }}
      >
        <div
          className="relative rounded-3xl overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.88)",
            backdropFilter: "blur(20px) saturate(180%)",
            WebkitBackdropFilter: "blur(20px) saturate(180%)",
            border: "1.5px solid rgba(200,230,255,0.75)",
            boxShadow: `
              0 8px 32px rgba(100,170,255,0.15),
              0 4px 16px rgba(0,0,0,0.06),
              0 2px 6px rgba(0,0,0,0.04),
              inset 0 1px 0 rgba(255,255,255,0.95)
            `,
          }}
        >
          {/* Shimmer */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 60%)",
              borderRadius: "inherit",
            }}
          />
          <div className="flex items-end gap-2 px-4 py-3 relative z-10">
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={handleTextareaChange}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
              placeholder="Paste text to humanise, or describe your voice..."
              className="flex-1 bg-transparent outline-none resize-none font-pixel-thin"
              style={{
                fontSize: 18,
                lineHeight: 1.55,
                minHeight: 28,
                maxHeight: 160,
                color: "rgba(20,40,80,0.8)",
              }}
            />

            {/* Voice button */}
            <motion.button
              onClick={handleVoice}
              whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
              className="flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center mb-0.5 transition-all"
              style={{
                background: listening
                  ? "rgba(239,68,68,0.1)"
                  : "rgba(180,210,240,0.2)",
                border: `1.5px solid ${listening ? "rgba(239,68,68,0.4)" : "rgba(180,210,240,0.5)"}`,
                boxShadow: listening ? "0 0 0 3px rgba(239,68,68,0.15)" : "none",
              }}
              title="Voice input"
            >
              <Mic size={16} className={listening ? "text-red-400 animate-pulse" : ""} style={{ color: listening ? undefined : "rgba(100,150,200,0.65)" }} />
            </motion.button>

            {/* Send button */}
            <motion.button
              onClick={send}
              whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
              disabled={!input.trim() || loading}
              className="flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center mb-0.5"
              style={{
                background: input.trim() && !loading
                  ? "linear-gradient(135deg, #4facfe, #00d4ff)"
                  : "rgba(180,210,240,0.3)",
                boxShadow: input.trim() && !loading
                  ? "0 4px 16px rgba(79,172,254,0.4), 0 2px 6px rgba(0,0,0,0.08)"
                  : "none",
                border: "1.5px solid " + (input.trim() && !loading ? "rgba(79,172,254,0.5)" : "rgba(180,210,240,0.4)"),
                transition: "all 0.2s",
              }}
            >
              <ArrowUp size={16} style={{ color: input.trim() && !loading ? "#fff" : "rgba(100,150,200,0.4)" }} />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
