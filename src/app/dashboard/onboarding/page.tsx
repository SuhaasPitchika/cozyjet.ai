"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, ArrowRight, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useOnboarding } from "@/hooks/use-onboarding";

interface ChatMsg {
  id: string;
  role: "assistant" | "user";
  content: string;
}

const INITIAL_MESSAGE: ChatMsg = {
  id: "init",
  role: "assistant",
  content: "Hey! I'm going to ask you a few questions so CozyJet can create content that actually sounds like you. There's no right or wrong answer — just be honest.\n\nLet's start: what are you working on right now, and who is it for?",
};

export default function OnboardingPage() {
  const router = useRouter();
  const { loading, sendMessage, getStatus } = useOnboarding();
  const [messages, setMessages] = useState<ChatMsg[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [checked, setChecked] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    getStatus().then((status) => {
      if (status?.is_complete) {
        router.replace("/dashboard/skippy");
      } else {
        setChecked(true);
      }
    });
  }, [getStatus, router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    setInput("");

    const userMsg: ChatMsg = { id: Date.now().toString(), role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMsg]);

    const res = await sendMessage(trimmed);
    if (!res) return;

    const botMsg: ChatMsg = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: res.reply,
    };
    setMessages((prev) => [...prev, botMsg]);

    if (res.is_complete) {
      setIsComplete(true);
    }
  }, [input, loading, sendMessage]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const goToDashboard = () => router.replace("/dashboard/skippy");

  if (!checked) {
    return (
      <div className="h-full flex items-center justify-center" style={{ background: "#f0ece6" }}>
        <Loader2 className="w-6 h-6 animate-spin text-black/30" />
      </div>
    );
  }

  return (
    <div
      className="h-full flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: "linear-gradient(160deg, #f7f3ee 0%, #ece8e0 100%)" }}
    >
      {/* Background shimmer */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 30% 20%, rgba(255,200,150,0.12) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(150,180,255,0.08) 0%, transparent 60%)",
        }}
      />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 text-center mb-6"
      >
        <div className="flex items-center justify-center gap-2 mb-1">
          <Sparkles size={14} className="text-amber-500" />
          <span className="font-pixel-thin text-black/40 uppercase tracking-widest text-xs">CozyJet Setup</span>
          <Sparkles size={14} className="text-amber-500" />
        </div>
        <h1 className="font-pixel text-2xl text-black/80">Let&apos;s build your voice</h1>
        <p className="font-pixel-thin text-black/40 text-sm mt-1">8–10 questions. Takes about 3 minutes.</p>
      </motion.div>

      {/* Chat window */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 flex flex-col"
        style={{
          width: "min(680px, 92vw)",
          height: "min(480px, 60vh)",
          background: "rgba(255,255,255,0.55)",
          backdropFilter: "blur(24px) saturate(160%)",
          WebkitBackdropFilter: "blur(24px) saturate(160%)",
          border: "1px solid rgba(255,255,255,0.70)",
          borderRadius: 20,
          boxShadow: "0 8px 48px rgba(0,0,0,0.09), inset 0 1px 0 rgba(255,255,255,0.85)",
          overflow: "hidden",
        }}
      >
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4" style={{ scrollbarWidth: "thin" }}>
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className="font-pixel-thin text-sm leading-relaxed whitespace-pre-wrap"
                  style={{
                    maxWidth: "78%",
                    padding: "10px 14px",
                    borderRadius: msg.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                    background: msg.role === "user"
                      ? "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)"
                      : "rgba(255,255,255,0.80)",
                    color: msg.role === "user" ? "rgba(255,255,255,0.90)" : "rgba(0,0,0,0.78)",
                    border: msg.role === "user" ? "none" : "1px solid rgba(0,0,0,0.07)",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
                  }}
                >
                  {msg.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div
                className="flex items-center gap-1.5 px-4 py-3"
                style={{ background: "rgba(255,255,255,0.80)", borderRadius: "14px 14px 14px 4px", border: "1px solid rgba(0,0,0,0.07)" }}
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-black/30"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input row */}
        {!isComplete ? (
          <div
            className="px-4 py-3 flex items-end gap-3"
            style={{ borderTop: "1px solid rgba(0,0,0,0.06)", background: "rgba(255,255,255,0.60)" }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Type your answer…"
              rows={1}
              className="flex-1 resize-none bg-transparent font-pixel-thin text-sm text-black/80 placeholder:text-black/30 outline-none leading-relaxed"
              style={{ maxHeight: 96, minHeight: 24 }}
              disabled={loading}
            />
            <motion.button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.92 }}
              className="flex items-center justify-center rounded-xl flex-shrink-0"
              style={{
                width: 36, height: 36,
                background: input.trim() && !loading
                  ? "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)"
                  : "rgba(0,0,0,0.08)",
                transition: "background 0.2s",
              }}
            >
              {loading
                ? <Loader2 size={15} className="animate-spin text-white/60" />
                : <Send size={14} className={input.trim() ? "text-white" : "text-black/25"} />
              }
            </motion.button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-4 py-3 flex items-center justify-between"
            style={{ borderTop: "1px solid rgba(0,0,0,0.06)", background: "rgba(255,255,255,0.60)" }}
          >
            <span className="font-pixel-thin text-sm text-black/50">Setup complete. Your agents are ready.</span>
            <motion.button
              onClick={goToDashboard}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-pixel-thin text-sm text-white"
              style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)" }}
            >
              Enter Studio <ArrowRight size={13} />
            </motion.button>
          </motion.div>
        )}
      </motion.div>

      {/* Exchange counter */}
      <p className="relative z-10 mt-4 font-pixel-thin text-xs text-black/25">
        {messages.filter(m => m.role === "user").length} / 8–10 exchanges
      </p>
    </div>
  );
}
