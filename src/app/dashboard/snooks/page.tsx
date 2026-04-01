"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, Mic, Paperclip, ChevronLeft, ChevronRight, X, Plus, MessageSquare, Trash2, Volume2, VolumeX } from "lucide-react";

interface ChatMsg {
  id: string;
  role: "user" | "bot";
  content: string;
  timestamp: Date;
}

interface Session {
  id: string;
  name: string;
  createdAt: string;
  messages: ChatMsg[];
}

const SNOOKS_SESSIONS_KEY = "snooks_sessions";

function generateSnooksName(firstMsg: string): string {
  const lower = firstMsg.toLowerCase();
  const topics: Record<string, string> = {
    linkedin: "💼 LinkedIn Strategy", twitter: "🐦 Twitter Plan", instagram: "📸 Instagram Plan",
    content: "📋 Content Strategy", calendar: "📅 Content Calendar", schedule: "📅 Scheduling Plan",
    week: "📆 Weekly Strategy", month: "🗓 Monthly Plan", post: "✍️ Post Strategy",
    thread: "🧵 Thread Plan", auto: "⚡ Auto Schedule", trend: "📈 Trend Analysis",
    competitor: "🔍 Competitor Research", audience: "👥 Audience Strategy",
  };
  const found = Object.keys(topics).find(k => lower.includes(k));
  if (found) return topics[found];
  return `🧠 ${firstMsg.slice(0, 28)}${firstMsg.length > 28 ? "…" : ""}`;
}

function loadSnooksSessions(): Session[] {
  try {
    const raw = localStorage.getItem(SNOOKS_SESSIONS_KEY);
    if (!raw) return [];
    return (JSON.parse(raw) as Session[]).map(s => ({
      ...s, messages: s.messages.map(m => ({ ...m, timestamp: new Date(m.timestamp) })),
    }));
  } catch { return []; }
}

function saveSnooksSessions(sessions: Session[]): void {
  try { localStorage.setItem(SNOOKS_SESSIONS_KEY, JSON.stringify(sessions)); } catch {}
}

interface CalNote {
  day: number;
  title: string;
  text: string;
  auto?: boolean;
}

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

const INITIAL_NOTES: CalNote[] = [
  { day: 3,  title: "LinkedIn Post",  text: "Ship the new auth feature post — include the JWT diagram screenshot and tag 3 developer communities." },
  { day: 9,  title: "Twitter Thread", text: "Write a 5-tweet thread on building in public. Hook: 'I shipped a feature to 0 users today. Here's what I learned.'" },
  { day: 14, title: "Notion Update",  text: "Q2 roadmap is polished — turn the 8-feature list into a LinkedIn carousel. Each slide = 1 feature with a concrete user benefit." },
  { day: 21, title: "Content Batch",  text: "Monday batch day. Schedule 3 posts for the week based on Snooks' timing suggestions. Focus: Tue/Thu morning slots." },
  { day: 28, title: "Monthly Wrap",   text: "End-of-month recap post. What shipped, what failed, what surprised you. Founders love the honesty angle." },
];

function isAutoRequest(msg: string) {
  const lower = msg.toLowerCase();
  return lower.includes("auto") || lower.includes("schedule") || lower.includes("add to calendar") || lower.includes("set a note");
}

function extractNoteFromMessage(msg: string, day: number): CalNote {
  const cleaned = msg.replace(/auto|schedule|add to calendar|set a note/gi, "").trim();
  const title = cleaned.slice(0, 30) || "Auto Note";
  return { day, title, text: cleaned || msg, auto: true };
}

function CalendarGrid({ year, month, notes, onNoteClick }: {
  year: number; month: number;
  notes: CalNote[]; onNoteClick: (n: CalNote) => void;
}) {
  const firstDay = new Date(year, month, 1).getDay();
  const offset = (firstDay === 0 ? 6 : firstDay - 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  const cells: (number | null)[] = [...Array(offset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="w-full">
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map(d => (
          <div key={d} className="flex items-center justify-center py-2">
            <span className="font-pixel-thin text-black/40" style={{ fontSize: 14 }}>{d}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px" style={{ background: "rgba(0,0,0,0.07)" }}>
        {cells.map((day, i) => {
          const note = day !== null ? notes.find(n => n.day === day) : undefined;
          const isToday = isCurrentMonth && day === today.getDate();
          return (
            <div
              key={i}
              className="relative flex flex-col bg-white"
              style={{ minHeight: 72, padding: "7px 9px" }}
            >
              {day !== null && (
                <>
                  <span
                    className="font-pixel-thin"
                    style={{
                      fontSize: 17,
                      color: isToday ? "#fff" : "rgba(0,0,0,0.65)",
                      background: isToday ? "#1a73e8" : "transparent",
                      borderRadius: 4,
                      padding: isToday ? "1px 6px" : "0",
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
                      className="absolute bottom-2 right-2 w-6 h-6 rounded flex items-center justify-center"
                      style={{
                        background: note.auto ? "#86efac" : "#fcd34d",
                        boxShadow: note.auto
                          ? "0 1px 4px rgba(134,239,172,0.5), 1px 1px 0 rgba(0,0,0,0.1)"
                          : "0 1px 4px rgba(252,211,77,0.5), 1px 1px 0 rgba(0,0,0,0.1)",
                        fontSize: 11,
                      }}
                    >
                      {note.auto ? "✓" : "📌"}
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

/* ─── Liquid glass top bar ─── */
function LiquidGlassBar({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex items-center justify-center gap-3 py-4 flex-shrink-0 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.65) 0%, rgba(240,248,255,0.55) 40%, rgba(255,255,255,0.6) 100%)",
        backdropFilter: "blur(32px) saturate(180%) brightness(108%)",
        WebkitBackdropFilter: "blur(32px) saturate(180%) brightness(108%)",
        borderBottom: "1px solid rgba(255,255,255,0.7)",
        boxShadow: "0 1px 0 rgba(255,255,255,0.9), 0 4px 24px rgba(180,220,255,0.18), inset 0 1px 0 rgba(255,255,255,0.95)",
      }}
    >
      {/* Glass shimmer layer */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(120deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 50%, rgba(200,230,255,0.2) 100%)",
          mixBlendMode: "screen",
        }}
      />
      {/* Subtle refraction strip */}
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{
          height: 1.5,
          background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.9), rgba(255,255,255,0))",
        }}
      />
      <div className="relative z-10 flex items-center gap-3">
        {children}
      </div>
    </div>
  );
}

export default function SnooksPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [notes, setNotes] = useState<CalNote[]>(INITIAL_NOTES);
  const INIT_MSG: ChatMsg = { id: "init", role: "bot", content: "I'm Snooks — your content strategist. Tell me what you've been building, or say 'auto' to schedule something directly to your calendar. I'll handle the strategy.", timestamp: new Date() };
  const [messages, setMessages] = useState<ChatMsg[]>([INIT_MSG]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [activeNote, setActiveNote] = useState<CalNote | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => { setSessions(loadSnooksSessions()); }, []);

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const persistSession = useCallback((msgs: ChatMsg[], sid: string) => {
    const real = msgs.filter(m => m.id !== "init");
    if (real.length === 0) return;
    setSessions(prev => {
      const exists = prev.find(s => s.id === sid);
      let next: Session[];
      if (exists) {
        next = prev.map(s => s.id === sid ? { ...s, messages: msgs } : s);
      } else {
        const first = real.find(m => m.role === "user");
        next = [{ id: sid, name: first ? generateSnooksName(first.content) : "Strategy Session", createdAt: new Date().toISOString(), messages: msgs }, ...prev];
      }
      saveSnooksSessions(next);
      return next;
    });
  }, []);

  const startNewChat = () => {
    if (messages.length > 1 && activeSessionId) persistSession(messages, activeSessionId);
    setActiveSessionId(Date.now().toString());
    setMessages([INIT_MSG]);
    setInput("");
  };

  const loadSession = (s: Session) => {
    if (messages.length > 1 && activeSessionId) persistSession(messages, activeSessionId);
    setActiveSessionId(s.id);
    setMessages(s.messages);
    setInput("");
  };

  const deleteSession = (e: React.MouseEvent, sid: string) => {
    e.stopPropagation();
    setSessions(prev => { const n = prev.filter(s => s.id !== sid); saveSnooksSessions(n); return n; });
    if (activeSessionId === sid) { setActiveSessionId(null); setMessages([INIT_MSG]); }
  };

  const fmtDate = (s: string) => {
    const d = new Date(s), now = new Date(), diff = now.getTime() - d.getTime();
    if (diff < 86400000) return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    if (diff < 604800000) return d.toLocaleDateString("en-US", { weekday: "short" });
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const handleSpeak = async (msg: ChatMsg) => {
    if (speakingId === msg.id) {
      audioRef.current?.pause(); audioRef.current = null;
      window.speechSynthesis?.cancel(); setSpeakingId(null); return;
    }
    audioRef.current?.pause(); audioRef.current = null;
    window.speechSynthesis?.cancel(); setSpeakingId(msg.id);
    try {
      const res = await fetch("/api/ai/tts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: msg.content }) });
      if (res.ok) {
        const blob = await res.blob(); const url = URL.createObjectURL(blob);
        const audio = new Audio(url); audioRef.current = audio;
        audio.onended = () => { setSpeakingId(null); URL.revokeObjectURL(url); };
        audio.onerror = () => { setSpeakingId(null); URL.revokeObjectURL(url); };
        await audio.play(); return;
      }
    } catch {}
    if ("speechSynthesis" in window) {
      const u = new SpeechSynthesisUtterance(msg.content);
      u.onend = () => setSpeakingId(null); u.onerror = () => setSpeakingId(null);
      window.speechSynthesis.speak(u);
    } else { setSpeakingId(null); }
  };

  const send = useCallback(async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg) return;
    setInput("");
    const sid = activeSessionId || Date.now().toString();
    if (!activeSessionId) setActiveSessionId(sid);
    const userMsg: ChatMsg = { id: Date.now().toString(), role: "user", content: msg, timestamp: new Date() };
    const next = [...messages, userMsg];
    setMessages(next);

    if (isAutoRequest(msg)) {
      const day = Math.floor(Math.random() * 28) + 1;
      const newNote = extractNoteFromMessage(msg, day);
      setNotes(prev => [...prev.filter(n => n.day !== day), newNote]);
      const botMsg: ChatMsg = { id: (Date.now() + 1).toString(), role: "bot", content: `Done! I've auto-scheduled "${newNote.title}" to day ${day} of your calendar. You'll see a green pin on that date.`, timestamp: new Date() };
      const all = [...next, botMsg];
      setMessages(all); persistSession(all, sid);
      return;
    }

    setLoading(true);
    try {
      const history = messages.filter(m => m.id !== "init").map(m => ({ role: m.role === "bot" ? "assistant" : "user", content: m.content }));
      const res = await fetch("/api/ai/snooks", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...history, { role: "user", content: msg }] }),
      });
      const data = await res.json();
      const botMsg: ChatMsg = { id: (Date.now() + 1).toString(), role: "bot", content: data.reply || data.response || data.message || "Got it — let me think about that.", timestamp: new Date() };
      const all = [...next, botMsg];
      setMessages(all); persistSession(all, sid);
    } catch {
      const err: ChatMsg = { id: (Date.now() + 1).toString(), role: "bot", content: "I'm having trouble connecting right now. Try again in a moment.", timestamp: new Date() };
      const all = [...next, err];
      setMessages(all); persistSession(all, sid);
    } finally { setLoading(false); }
  }, [input, messages, activeSessionId, persistSession]);

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
      {/* ─── Liquid glass top bar ─── */}
      <LiquidGlassBar>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(184,164,255,0.9), rgba(110,231,247,0.9))", backdropFilter: "blur(8px)", boxShadow: "0 2px 8px rgba(147,197,253,0.4), inset 0 1px 0 rgba(255,255,255,0.5)" }}>
          <span className="font-pixel text-white" style={{ fontSize: 8 }}>SN</span>
        </div>
        <div className="text-center">
          <h1 className="font-pixel text-black/70 leading-none" style={{ fontSize: 11 }}>SNOOKS</h1>
          <p className="font-pixel-thin text-black/40 mt-0.5" style={{ fontSize: 14 }}>Content Strategist · say "auto" to schedule</p>
        </div>
      </LiquidGlassBar>

      {/* ─── Body ─── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat */}
        <div className="flex-1 flex flex-col overflow-hidden mesh-bg">
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
                    boxShadow: msg.role === "user" ? "0 4px 16px rgba(26,26,46,0.3)" : "0 2px 12px rgba(0,0,0,0.06)",
                    borderBottomRightRadius: msg.role === "user" ? 6 : 16,
                    borderBottomLeftRadius: msg.role === "bot" ? 6 : 16,
                  }}
                >
                  <p className="font-pixel-thin leading-relaxed" style={{ fontSize: 17, color: msg.role === "user" ? "#fff" : "rgba(0,0,0,0.75)" }}>
                    {msg.content}
                  </p>
                  <p className="font-pixel-thin mt-1" style={{ fontSize: 12, color: msg.role === "user" ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.25)" }}>
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

          {/* Input */}
          <div className="px-5 py-4 flex-shrink-0" style={{ background: "rgba(255,255,255,0.7)", borderTop: "1px solid rgba(0,0,0,0.06)" }}>
            <div
              className="flex items-center gap-2 px-4 py-3 rounded-2xl"
              style={{ background: "#fff", border: "1.5px solid rgba(0,0,0,0.08)", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}
            >
              <input type="file" ref={fileRef} className="hidden" />
              <button onClick={() => fileRef.current?.click()} className="w-7 h-7 rounded-xl flex items-center justify-center hover:bg-black/5 transition-colors">
                <Paperclip size={14} className="text-black/30" />
              </button>
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
                placeholder='Ask Snooks to plan your week, or say "auto schedule..."'
                className="flex-1 bg-transparent outline-none font-pixel-thin text-black/70 placeholder:text-black/25"
                style={{ fontSize: 16 }}
              />
              <button onClick={handleVoice} className="w-7 h-7 rounded-xl flex items-center justify-center hover:bg-black/5 transition-colors">
                <Mic size={14} className="text-black/30" />
              </button>
              <motion.button
                onClick={() => send()}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                disabled={!input.trim() || loading}
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: input.trim() ? "#1a1a2e" : "rgba(0,0,0,0.07)", boxShadow: input.trim() ? "0 2px 8px rgba(0,0,0,0.2)" : "none" }}
              >
                <Send size={13} style={{ color: input.trim() ? "#fff" : "rgba(0,0,0,0.2)" }} />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="flex-shrink-0 flex flex-col overflow-hidden" style={{ width: 400, background: "#fff", borderLeft: "1px solid rgba(0,0,0,0.07)" }}>
          <div className="flex items-center justify-between px-5 py-4 flex-shrink-0" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
            <motion.button onClick={prevMonth} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(0,0,0,0.04)" }}>
              <ChevronLeft size={14} className="text-black/40" />
            </motion.button>
            <div className="text-center">
              <p className="font-pixel text-black/75" style={{ fontSize: 10 }}>{MONTHS[month].toUpperCase()}</p>
              <p className="font-pixel-thin text-black/35 mt-0.5" style={{ fontSize: 14 }}>{year}</p>
            </div>
            <motion.button onClick={nextMonth} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(0,0,0,0.04)" }}>
              <ChevronRight size={14} className="text-black/40" />
            </motion.button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <CalendarGrid year={year} month={month} notes={notes} onNoteClick={setActiveNote} />
          </div>

          <div className="px-5 py-3 flex-shrink-0" style={{ borderTop: "1px solid rgba(0,0,0,0.05)" }}>
            <p className="font-pixel-thin text-black/35" style={{ fontSize: 13 }}>
              📌 Yellow = planned · 🟢 Green = auto-scheduled
            </p>
          </div>
        </div>
      </div>

      {/* Note popup */}
      <AnimatePresence>
        {activeNote && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveNote(null)}
              className="fixed inset-0 z-50" style={{ background: "rgba(0,0,0,0.25)", backdropFilter: "blur(4px)" }} />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 16 }}
              className="fixed z-50"
              style={{
                top: "50%", left: "50%", transform: "translate(-50%, -50%)",
                width: 340,
                background: activeNote.auto ? "#bbf7d0" : "#fcd34d",
                borderRadius: 12,
                boxShadow: "4px 4px 0 rgba(0,0,0,0.15), 0 16px 40px rgba(0,0,0,0.2)",
                padding: "20px 20px 24px",
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <span className="font-pixel text-black/70" style={{ fontSize: 8 }}>
                  {activeNote.auto ? "✓ AUTO-SCHEDULED" : "📌 PLANNED"}
                </span>
                <button onClick={() => setActiveNote(null)}><X size={14} className="text-black/40" /></button>
              </div>
              <h3 className="font-pixel-thin text-black/85 mb-2" style={{ fontSize: 20, lineHeight: 1.3 }}>{activeNote.title}</h3>
              <p className="font-pixel-thin text-black/65 leading-relaxed" style={{ fontSize: 16 }}>{activeNote.text}</p>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
