"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, Mic, Paperclip, ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";

interface ChatMsg {
  id: string;
  role: "user" | "bot";
  content: string;
  timestamp: Date;
}

interface CalNote {
  day: number;
  title: string;
  text: string;
}

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

const SAMPLE_NOTES: CalNote[] = [
  { day: 3, title: "LinkedIn Post", text: "Ship the new auth feature post — include the JWT diagram screenshot and tag 3 developer communities." },
  { day: 9, title: "Twitter Thread", text: "Write a 5-tweet thread on building in public. Hook: 'I shipped a feature to 0 users today. Here's what I learned.'" },
  { day: 14, title: "Notion Update", text: "Q2 roadmap is polished — turn the 8-feature list into a LinkedIn carousel. Each slide = 1 feature with a concrete user benefit." },
  { day: 21, title: "Content Batch", text: "Monday batch day. Schedule 3 posts for the week based on Snooks' timing suggestions. Focus: Tue/Thu morning slots." },
  { day: 28, title: "Monthly Wrap", text: "End-of-month recap post. What shipped, what failed, what surprised you. Founders love the honesty angle." },
];

function CalendarGrid({ year, month, onNoteClick }: { year: number; month: number; onNoteClick: (n: CalNote) => void }) {
  const firstDay = new Date(year, month, 1).getDay();
  const offset = (firstDay === 0 ? 6 : firstDay - 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  const cells: (number | null)[] = [...Array(offset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="w-full">
      {/* Day headers */}
      <div className="grid grid-cols-7 mb-2">
        {DAYS.map(d => (
          <div key={d} className="flex items-center justify-center py-2">
            <span className="font-pixel-thin text-black/35" style={{ fontSize: 13 }}>{d}</span>
          </div>
        ))}
      </div>

      {/* Cells */}
      <div className="grid grid-cols-7 gap-px" style={{ background: "rgba(0,0,0,0.08)" }}>
        {cells.map((day, i) => {
          const note = day !== null ? SAMPLE_NOTES.find(n => n.day === day) : undefined;
          const isToday = isCurrentMonth && day === today.getDate();
          return (
            <div
              key={i}
              className="relative flex flex-col bg-white"
              style={{ minHeight: 64, padding: "6px 8px" }}
            >
              {day !== null && (
                <>
                  <span
                    className="font-pixel-thin"
                    style={{
                      fontSize: 15,
                      color: isToday ? "#fff" : "rgba(0,0,0,0.6)",
                      background: isToday ? "#1a73e8" : "transparent",
                      borderRadius: 4,
                      padding: isToday ? "1px 5px" : "0",
                      display: "inline-block",
                      lineHeight: 1.4,
                      width: "fit-content",
                    }}
                  >
                    {day}
                  </span>
                  {note && (
                    <motion.button
                      whileHover={{ scale: 1.2 }}
                      onClick={() => onNoteClick(note)}
                      className="absolute bottom-2 right-2 w-5 h-5 rounded flex items-center justify-center"
                      style={{ background: "#fcd34d", boxShadow: "0 1px 4px rgba(252,211,77,0.5), 1px 1px 0 rgba(0,0,0,0.1)" }}
                    >
                      <span style={{ fontSize: 9 }}>📌</span>
                    </motion.button>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function SnooksPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      id: "init",
      role: "bot",
      content: "I'm Snooks — your content strategist. Tell me what you've been building, or ask me to plan your week. I'll handle the strategy.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeNote, setActiveNote] = useState<CalNote | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = useCallback(async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg) return;
    setInput("");
    const userMsg: ChatMsg = { id: Date.now().toString(), role: "user", content: msg, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    try {
      const res = await fetch("/api/ai/snooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, history: [] }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: "bot", content: data.reply || data.message || "Got it — let me think about that.", timestamp: new Date() }]);
    } catch {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: "bot", content: "I'm having trouble connecting right now. Try again in a moment.", timestamp: new Date() }]);
    } finally { setLoading(false); }
  }, [input]);

  const handleVoice = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert("Voice input not supported in this browser."); return;
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SR();
    recognition.lang = 'en-US';
    recognition.onresult = (e: any) => setInput(e.results[0][0].transcript);
    recognition.start();
  };

  const fmt = (d: Date) => d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: "#fafafa" }}>
      {/* ─── Top bar ─── */}
      <div
        className="flex items-center justify-center gap-3 py-4 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(0,0,0,0.06)", background: "#fff" }}
      >
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #b8a4ff, #6ee7f7)" }}
        >
          <span className="font-pixel text-white" style={{ fontSize: 8 }}>SN</span>
        </div>
        <div className="text-center">
          <h1 className="font-pixel text-black/80 leading-none" style={{ fontSize: 11 }}>SNOOKS</h1>
          <p className="font-pixel-thin text-black/35 mt-0.5" style={{ fontSize: 13 }}>Content Strategist</p>
        </div>
      </div>

      {/* ─── Body: chat + calendar ─── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat area */}
        <div className="flex-1 flex flex-col overflow-hidden mesh-bg">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
            {messages.map(msg => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className="max-w-[75%] px-4 py-3 rounded-2xl"
                  style={{
                    background: msg.role === "user" ? "#1a1a2e" : "rgba(255,255,255,0.92)",
                    border: msg.role === "user" ? "none" : "1px solid rgba(0,0,0,0.07)",
                    boxShadow: msg.role === "user"
                      ? "0 4px 16px rgba(26,26,46,0.3)"
                      : "0 2px 12px rgba(0,0,0,0.06)",
                    borderBottomRightRadius: msg.role === "user" ? 6 : 16,
                    borderBottomLeftRadius: msg.role === "bot" ? 6 : 16,
                  }}
                >
                  <p
                    className="font-pixel-thin leading-relaxed"
                    style={{ fontSize: 16, color: msg.role === "user" ? "#fff" : "rgba(0,0,0,0.75)" }}
                  >
                    {msg.content}
                  </p>
                  <p
                    className="font-pixel-thin mt-1"
                    style={{ fontSize: 11, color: msg.role === "user" ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.25)" }}
                  >
                    {fmt(msg.timestamp)}
                  </p>
                </div>
              </motion.div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="px-4 py-3 rounded-2xl" style={{ background: "rgba(255,255,255,0.92)", border: "1px solid rgba(0,0,0,0.07)" }}>
                  <Loader2 size={14} className="animate-spin text-black/30" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input bar */}
          <div className="px-5 py-4 flex-shrink-0" style={{ background: "rgba(255,255,255,0.7)", borderTop: "1px solid rgba(0,0,0,0.06)" }}>
            <div
              className="flex items-center gap-2 px-4 py-3 rounded-2xl"
              style={{
                background: "#fff",
                border: "1.5px solid rgba(0,0,0,0.08)",
                boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
              }}
            >
              <input
                type="file"
                ref={fileRef}
                className="hidden"
                onChange={() => {}}
              />
              <button
                onClick={() => fileRef.current?.click()}
                className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 hover:bg-black/5 transition-colors"
              >
                <Paperclip size={14} className="text-black/30" />
              </button>
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
                placeholder="Ask Snooks to plan your week..."
                className="flex-1 bg-transparent outline-none font-pixel-thin text-black/70 placeholder:text-black/25"
                style={{ fontSize: 16 }}
              />
              <button
                onClick={handleVoice}
                className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 hover:bg-black/5 transition-colors"
              >
                <Mic size={14} className="text-black/30" />
              </button>
              <motion.button
                onClick={() => send()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={!input.trim() || loading}
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: input.trim() ? "#1a1a2e" : "rgba(0,0,0,0.07)",
                  boxShadow: input.trim() ? "0 2px 8px rgba(0,0,0,0.2)" : "none",
                }}
              >
                <Send size={13} style={{ color: input.trim() ? "#fff" : "rgba(0,0,0,0.2)" }} />
              </motion.button>
            </div>
          </div>
        </div>

        {/* ─── Calendar ─── */}
        <div
          className="flex-shrink-0 flex flex-col overflow-y-auto"
          style={{
            width: 380,
            background: "#fff",
            borderLeft: "1px solid rgba(0,0,0,0.07)",
          }}
        >
          {/* Month nav */}
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
            <motion.button onClick={prevMonth} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(0,0,0,0.04)" }}>
              <ChevronLeft size={14} className="text-black/40" />
            </motion.button>
            <div className="text-center">
              <p className="font-pixel text-black/75" style={{ fontSize: 9 }}>{MONTHS[month].toUpperCase()}</p>
              <p className="font-pixel-thin text-black/35 mt-0.5" style={{ fontSize: 13 }}>{year}</p>
            </div>
            <motion.button onClick={nextMonth} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(0,0,0,0.04)" }}>
              <ChevronRight size={14} className="text-black/40" />
            </motion.button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <CalendarGrid year={year} month={month} onNoteClick={setActiveNote} />
          </div>

          <div className="px-5 py-3" style={{ borderTop: "1px solid rgba(0,0,0,0.05)" }}>
            <p className="font-pixel-thin text-black/35" style={{ fontSize: 12 }}>
              📌 Click yellow pins to see scheduled content
            </p>
          </div>
        </div>
      </div>

      {/* Note popup */}
      <AnimatePresence>
        {activeNote && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveNote(null)}
              className="fixed inset-0 z-50"
              style={{ background: "rgba(0,0,0,0.25)", backdropFilter: "blur(4px)" }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 16 }}
              className="fixed z-50"
              style={{
                top: "50%", left: "50%", transform: "translate(-50%, -50%)",
                width: 340,
                background: "#fcd34d",
                borderRadius: 12,
                boxShadow: "4px 4px 0 rgba(0,0,0,0.15), 0 16px 40px rgba(0,0,0,0.2)",
                padding: "20px 20px 24px",
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <span className="font-pixel text-black/70" style={{ fontSize: 8 }}>📌 SCHEDULED</span>
                <button onClick={() => setActiveNote(null)}>
                  <X size={14} className="text-black/40" />
                </button>
              </div>
              <h3 className="font-pixel-thin text-black/85 mb-2" style={{ fontSize: 20, lineHeight: 1.3 }}>{activeNote.title}</h3>
              <p className="font-pixel-thin text-black/65 leading-relaxed" style={{ fontSize: 15 }}>{activeNote.text}</p>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
