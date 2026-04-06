"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Loader2, Mic, Paperclip, ChevronLeft, ChevronRight,
  X, Plus, Trash2, Edit2, Check, CalendarPlus,
} from "lucide-react";

/* ─── Types ─── */
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
export interface CalNote {
  id: string;
  day: number;
  month: number;  // 0-indexed
  year: number;
  title: string;
  text: string;
  auto?: boolean;
}

/* ─── Storage keys ─── */
const SNOOKS_SESSIONS_KEY = "snooks_sessions";
const SNOOKS_NOTES_KEY    = "snooks_cal_notes";

/* ─── Session helpers ─── */
function generateSnooksName(firstMsg: string): string {
  const lower = firstMsg.toLowerCase();
  const topics: Record<string, string> = {
    linkedin: "LinkedIn Strategy", twitter: "Twitter Plan", instagram: "Instagram Plan",
    content: "Content Strategy", calendar: "Content Calendar", schedule: "Scheduling Plan",
    week: "Weekly Strategy", month: "Monthly Plan", post: "Post Strategy",
    thread: "Thread Plan", auto: "Auto Schedule", trend: "Trend Analysis",
  };
  const found = Object.keys(topics).find(k => lower.includes(k));
  return found ? topics[found] : `${firstMsg.slice(0, 28)}${firstMsg.length > 28 ? "..." : ""}`;
}
function loadSessions(): Session[] {
  try {
    const raw = localStorage.getItem(SNOOKS_SESSIONS_KEY);
    if (!raw) return [];
    return (JSON.parse(raw) as Session[]).map(s => ({
      ...s, messages: s.messages.map(m => ({ ...m, timestamp: new Date(m.timestamp) })),
    }));
  } catch { return []; }
}
function saveSessions(s: Session[]) {
  try { localStorage.setItem(SNOOKS_SESSIONS_KEY, JSON.stringify(s)); } catch {}
}

/* ─── Note storage ─── */
const DEFAULT_NOTES: CalNote[] = (() => {
  const now = new Date();
  const y = now.getFullYear(), mo = now.getMonth();
  return [
    { id: "d1", day: 3,  month: mo, year: y, title: "LinkedIn Post",  text: "Ship the new auth feature post — include the JWT diagram screenshot.", auto: false },
    { id: "d2", day: 9,  month: mo, year: y, title: "Twitter Thread", text: "5-tweet thread on building in public. Hook: 'I shipped to 0 users today.'", auto: false },
    { id: "d3", day: 14, month: mo, year: y, title: "Notion Update",  text: "Q2 roadmap → LinkedIn carousel. Each slide = 1 feature with a concrete benefit.", auto: false },
    { id: "d4", day: 21, month: mo, year: y, title: "Content Batch",  text: "Monday batch day. Schedule 3 posts for the week. Focus: Tue/Thu morning slots.", auto: false },
    { id: "d5", day: 28, month: mo, year: y, title: "Monthly Wrap",   text: "End-of-month recap. What shipped, what failed, what surprised you.", auto: false },
  ];
})();

function loadNotes(): CalNote[] {
  try {
    const raw = localStorage.getItem(SNOOKS_NOTES_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_NOTES;
  } catch { return DEFAULT_NOTES; }
}
function saveNotes(n: CalNote[]) {
  try { localStorage.setItem(SNOOKS_NOTES_KEY, JSON.stringify(n)); } catch {}
}

/* ─── Date parsing ─── */
const MONTH_NAMES = ["january","february","march","april","may","june","july","august","september","october","november","december"];
const DAY_NAMES   = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];

function parseCalendarIntent(msg: string): { detected: boolean; day: number; month: number; year: number; title: string; text: string } | null {
  const lower = msg.toLowerCase();
  const now   = new Date();
  let day: number | null = null;
  let month = now.getMonth();
  let year  = now.getFullYear();

  // "on Monday", "next Friday", "this Thursday"
  for (let di = 0; di < DAY_NAMES.length; di++) {
    if (lower.includes(DAY_NAMES[di])) {
      const today = now.getDay();
      let diff = di - today;
      if (lower.includes("next")) diff = diff <= 0 ? diff + 7 : diff + 7;
      else if (diff <= 0) diff += 7;
      const target = new Date(now.getTime() + diff * 86400000);
      day = target.getDate();
      month = target.getMonth();
      year  = target.getFullYear();
      break;
    }
  }

  // "on the 15th", "day 7", "on April 5"
  if (day === null) {
    // month name + day number
    for (let mi = 0; mi < MONTH_NAMES.length; mi++) {
      const re = new RegExp(MONTH_NAMES[mi] + "\\s+(\\d{1,2})", "i");
      const m = lower.match(re);
      if (m) { day = parseInt(m[1]); month = mi; break; }
    }
  }
  if (day === null) {
    const re = /\b(?:on (?:the )?|day )(\d{1,2})(?:st|nd|rd|th)?\b/i;
    const m = lower.match(re);
    if (m) day = parseInt(m[1]);
  }
  // "add to calendar", "schedule", "set a note", "remind me"
  const trigger = /\b(add to calendar|schedule|set a note|auto|remind me|note for|note on|post on|post this)\b/i.test(lower);

  if (!trigger && day === null) return null;

  const finalDay = day ?? Math.floor(Math.random() * 28) + 1;
  const cleaned  = msg
    .replace(/\b(add to calendar|schedule|set a note|auto|remind me|note for|note on|post on|post this|on\s+(?:the\s+)?\d{1,2}(?:st|nd|rd|th)?|next\s+\w+|this\s+\w+|monday|tuesday|wednesday|thursday|friday|saturday|sunday)/gi, "")
    .trim();
  const title = cleaned.slice(0, 36) || "Scheduled Note";

  return { detected: true, day: finalDay, month, year, title, text: cleaned || msg };
}

/* ─── Constants ─── */
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS   = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

/* ─── CalendarGrid ─── */
function CalendarGrid({
  year, month, notes, onNoteClick, onDayClick,
}: {
  year: number; month: number;
  notes: CalNote[];
  onNoteClick: (n: CalNote) => void;
  onDayClick: (day: number) => void;
}) {
  const firstDay    = new Date(year, month, 1).getDay();
  const offset      = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today       = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  const cells: (number | null)[] = [
    ...Array(offset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const dayNotes = (day: number) => notes.filter(n => n.day === day && n.month === month && n.year === year);

  return (
    <div className="w-full">
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map(d => (
          <div key={d} className="flex items-center justify-center py-2">
            <span className="font-pixel-thin text-black/40" style={{ fontSize: 12 }}>{d}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px" style={{ background: "rgba(0,0,0,0.07)" }}>
        {cells.map((day, i) => {
          const notes4day = day !== null ? dayNotes(day) : [];
          const isToday   = isCurrentMonth && day === today.getDate();
          return (
            <div
              key={i}
              className="relative flex flex-col bg-white cursor-pointer group"
              style={{ minHeight: 68, padding: "6px 8px" }}
              onClick={() => day !== null && notes4day.length === 0 && onDayClick(day)}
            >
              {day !== null && (
                <>
                  <span
                    className="font-pixel-thin"
                    style={{
                      fontSize: 15,
                      color: isToday ? "#fff" : "rgba(0,0,0,0.65)",
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

                  {/* Notes dots */}
                  <div className="flex flex-col gap-px mt-1 overflow-hidden">
                    {notes4day.slice(0, 2).map(n => (
                      <button
                        key={n.id}
                        onClick={e => { e.stopPropagation(); onNoteClick(n); }}
                        className="w-full text-left px-1.5 py-0.5 rounded text-[9px] truncate leading-tight"
                        style={{
                          background: n.auto ? "rgba(134,239,172,0.4)" : "rgba(252,211,77,0.45)",
                          color: "rgba(0,0,0,0.7)",
                          border: `1px solid ${n.auto ? "rgba(74,222,128,0.5)" : "rgba(234,179,8,0.4)"}`,
                        }}
                      >
                        {n.title}
                      </button>
                    ))}
                    {notes4day.length > 2 && (
                      <span className="text-[8px] text-black/30 px-1">+{notes4day.length - 2} more</span>
                    )}
                  </div>

                  {/* Add-note hover button (when no notes) */}
                  {notes4day.length === 0 && (
                    <button
                      onClick={e => { e.stopPropagation(); onDayClick(day); }}
                      className="absolute bottom-1.5 right-1.5 w-5 h-5 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: "rgba(0,0,0,0.06)" }}
                    >
                      <Plus size={9} className="text-black/35" />
                    </button>
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

/* ─── Liquid glass bar ─── */
function LiquidGlassBar({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex items-center justify-center gap-3 py-4 flex-shrink-0 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg,rgba(255,255,255,0.65) 0%,rgba(240,248,255,0.55) 40%,rgba(255,255,255,0.6) 100%)",
        backdropFilter: "blur(32px) saturate(180%) brightness(108%)",
        WebkitBackdropFilter: "blur(32px) saturate(180%) brightness(108%)",
        borderBottom: "1px solid rgba(255,255,255,0.7)",
        boxShadow: "0 1px 0 rgba(255,255,255,0.9),0 4px 24px rgba(180,220,255,0.18),inset 0 1px 0 rgba(255,255,255,0.95)",
      }}
    >
      <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(120deg,rgba(255,255,255,0.55) 0%,rgba(255,255,255,0) 50%,rgba(200,230,255,0.2) 100%)", mixBlendMode: "screen" }} />
      <div className="absolute top-0 left-0 right-0 pointer-events-none" style={{ height: 1.5, background: "linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,0.9),rgba(255,255,255,0))" }} />
      <div className="relative z-10 flex items-center gap-3">{children}</div>
    </div>
  );
}

/* ─── Note Modal (view / edit / delete) ─── */
function NoteModal({
  note, onClose, onSave, onDelete,
}: {
  note: CalNote;
  onClose: () => void;
  onSave: (updated: CalNote) => void;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle]     = useState(note.title);
  const [text, setText]       = useState(note.text);

  const save = () => {
    onSave({ ...note, title: title.trim() || note.title, text: text.trim() || note.text });
    setEditing(false);
  };

  const bg = note.auto ? "#bbf7d0" : "#fcd34d";

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50"
        style={{ background: "rgba(0,0,0,0.28)", backdropFilter: "blur(4px)" }}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 16 }}
        className="fixed z-50"
        style={{
          top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          width: 360,
          background: bg,
          borderRadius: 14,
          boxShadow: "4px 4px 0 rgba(0,0,0,0.15),0 20px 48px rgba(0,0,0,0.22)",
          padding: "20px",
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <span className="font-pixel text-black/60" style={{ fontSize: 8 }}>
            {MONTHS[note.month]} {note.day}, {note.year} · {note.auto ? "AUTO-SCHEDULED" : "PLANNED"}
          </span>
          <div className="flex items-center gap-1">
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="w-6 h-6 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(0,0,0,0.12)" }}
                title="Edit"
              >
                <Edit2 size={11} className="text-black/55" />
              </button>
            )}
            <button
              onClick={() => onDelete(note.id)}
              className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(239,68,68,0.15)" }}
              title="Delete"
            >
              <Trash2 size={11} style={{ color: "#ef4444" }} />
            </button>
            <button onClick={onClose} className="w-6 h-6 flex items-center justify-center">
              <X size={14} className="text-black/40" />
            </button>
          </div>
        </div>

        {/* Content */}
        {editing ? (
          <>
            <input
              className="w-full rounded-lg px-3 py-2 mb-2 font-pixel-thin outline-none text-black/80"
              style={{ fontSize: 17, background: "rgba(255,255,255,0.55)", border: "1px solid rgba(0,0,0,0.12)" }}
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Title"
            />
            <textarea
              className="w-full rounded-lg px-3 py-2 font-pixel-thin outline-none text-black/65 resize-none"
              style={{ fontSize: 15, background: "rgba(255,255,255,0.55)", border: "1px solid rgba(0,0,0,0.12)", minHeight: 80 }}
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Note text…"
            />
            <div className="flex gap-2 mt-3">
              <button
                onClick={save}
                className="flex-1 h-8 rounded-xl flex items-center justify-center gap-1.5 font-pixel text-white"
                style={{ fontSize: 9, background: "#1a1a2e" }}
              >
                <Check size={11} /> SAVE
              </button>
              <button
                onClick={() => { setTitle(note.title); setText(note.text); setEditing(false); }}
                className="flex-1 h-8 rounded-xl font-pixel text-black/55"
                style={{ fontSize: 9, background: "rgba(0,0,0,0.1)" }}
              >
                CANCEL
              </button>
            </div>
          </>
        ) : (
          <>
            <h3 className="font-pixel-thin text-black/85 mb-2" style={{ fontSize: 19, lineHeight: 1.3 }}>{note.title}</h3>
            <p className="font-pixel-thin text-black/65 leading-relaxed" style={{ fontSize: 15 }}>{note.text}</p>
          </>
        )}
      </motion.div>
    </>
  );
}

/* ─── Add Note Modal ─── */
function AddNoteModal({
  day, month, year, onClose, onAdd,
}: {
  day: number; month: number; year: number;
  onClose: () => void;
  onAdd: (note: CalNote) => void;
}) {
  const [title, setTitle] = useState("");
  const [text, setText]   = useState("");

  const save = () => {
    if (!title.trim() && !text.trim()) return;
    onAdd({
      id: `n-${Date.now()}`,
      day, month, year,
      title: title.trim() || "Note",
      text: text.trim() || title.trim(),
      auto: false,
    });
    onClose();
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50"
        style={{ background: "rgba(0,0,0,0.28)", backdropFilter: "blur(4px)" }}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 16 }}
        className="fixed z-50"
        style={{
          top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          width: 340,
          background: "#fff",
          borderRadius: 14,
          boxShadow: "4px 4px 0 rgba(0,0,0,0.12),0 20px 48px rgba(0,0,0,0.18)",
          padding: "20px",
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-pixel text-black/70" style={{ fontSize: 9 }}>ADD NOTE</p>
            <p className="font-pixel-thin text-black/35 mt-0.5" style={{ fontSize: 13 }}>
              {MONTHS[month]} {day}, {year}
            </p>
          </div>
          <button onClick={onClose}><X size={14} className="text-black/30" /></button>
        </div>
        <input
          className="w-full rounded-xl px-3 py-2.5 mb-3 font-pixel-thin outline-none text-black/80"
          style={{ fontSize: 16, background: "rgba(0,0,0,0.04)", border: "1.5px solid rgba(0,0,0,0.09)" }}
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Title (e.g. LinkedIn Post)"
          autoFocus
          onKeyDown={e => e.key === "Enter" && save()}
        />
        <textarea
          className="w-full rounded-xl px-3 py-2.5 font-pixel-thin outline-none text-black/65 resize-none"
          style={{ fontSize: 15, background: "rgba(0,0,0,0.04)", border: "1.5px solid rgba(0,0,0,0.09)", minHeight: 72 }}
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="What should go here? (optional)"
        />
        <button
          onClick={save}
          className="w-full h-9 rounded-xl mt-3 font-pixel text-white flex items-center justify-center gap-2"
          style={{ fontSize: 9, background: "#1a1a2e" }}
        >
          <CalendarPlus size={12} /> ADD TO CALENDAR
        </button>
      </motion.div>
    </>
  );
}

/* ─── Main page ─── */
export default function SnooksPage() {
  const today = new Date();
  const [year, setYear]   = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const [sessions, setSessions]             = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  const INIT_MSG: ChatMsg = {
    id: "init", role: "bot", timestamp: new Date(),
    content: "I'm Snooks — your content strategist. Tell me what you've been building, or say \"schedule a LinkedIn post for Friday\" and I'll add it to your calendar automatically.",
  };
  const [messages, setMessages] = useState<ChatMsg[]>([INIT_MSG]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);

  const [notes, setNotes]             = useState<CalNote[]>([]);
  const [activeNote, setActiveNote]   = useState<CalNote | null>(null);
  const [addDay, setAddDay]           = useState<{ day: number; month: number; year: number } | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef   = useRef<HTMLInputElement>(null);

  // Hydrate from localStorage
  useEffect(() => {
    setSessions(loadSessions());
    setNotes(loadNotes());
  }, []);

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const updateNotes = (n: CalNote[]) => { setNotes(n); saveNotes(n); };

  const persistSession = useCallback((msgs: ChatMsg[], sid: string) => {
    const real = msgs.filter(m => m.id !== "init");
    if (!real.length) return;
    setSessions(prev => {
      const exists = prev.find(s => s.id === sid);
      const first  = real.find(m => m.role === "user");
      const next: Session[] = exists
        ? prev.map(s => s.id === sid ? { ...s, messages: msgs } : s)
        : [{ id: sid, name: first ? generateSnooksName(first.content) : "Strategy Session", createdAt: new Date().toISOString(), messages: msgs }, ...prev];
      saveSessions(next);
      return next;
    });
  }, []);

  const startNewChat = () => {
    if (messages.length > 1 && activeSessionId) persistSession(messages, activeSessionId);
    setActiveSessionId(Date.now().toString());
    setMessages([INIT_MSG]);
    setInput("");
  };

  const fmt = (d: Date) => d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  const send = useCallback(async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg) return;
    setInput("");
    const sid     = activeSessionId || Date.now().toString();
    if (!activeSessionId) setActiveSessionId(sid);
    const userMsg: ChatMsg = { id: Date.now().toString(), role: "user", content: msg, timestamp: new Date() };
    const next    = [...messages, userMsg];
    setMessages(next);

    // ── Calendar intent detection ──
    const intent = parseCalendarIntent(msg);
    if (intent) {
      const newNote: CalNote = {
        id: `n-${Date.now()}`,
        day:   intent.day,
        month: intent.month,
        year:  intent.year,
        title: intent.title,
        text:  intent.text,
        auto:  true,
      };
      updateNotes([...notes, newNote]);

      // Navigate to that month
      setMonth(intent.month);
      setYear(intent.year);

      const reply = `Done! I've added **"${intent.title}"** to your calendar on ${MONTHS[intent.month]} ${intent.day}. You'll see it as a green note on that date. Want me to flesh out the content for that post?`;
      const botMsg: ChatMsg = { id: (Date.now() + 1).toString(), role: "bot", content: reply, timestamp: new Date() };
      const all = [...next, botMsg];
      setMessages(all);
      persistSession(all, sid);
      return;
    }

    // ── Standard Snooks AI call ──
    setLoading(true);
    try {
      const history = messages.filter(m => m.id !== "init").map(m => ({
        role: m.role === "bot" ? "assistant" : "user",
        content: m.content,
      }));
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch("/backend/api/snooks/chat", {
        method: "POST",
        headers,
        body: JSON.stringify({ messages: [...history, { role: "user", content: msg }] }),
      });
      const data = await res.json();
      const reply = data.reply || data.response || data.message || "Got it — let me think about that.";

      const botMsg: ChatMsg = { id: (Date.now() + 1).toString(), role: "bot", content: reply, timestamp: new Date() };
      const all = [...next, botMsg];
      setMessages(all);
      persistSession(all, sid);
    } catch {
      const errMsg: ChatMsg = { id: (Date.now() + 1).toString(), role: "bot", content: "I'm having trouble connecting right now. Try again in a moment.", timestamp: new Date() };
      const all = [...next, errMsg];
      setMessages(all);
      persistSession(all, sid);
    } finally { setLoading(false); }
  }, [input, messages, activeSessionId, notes, persistSession]);

  const handleVoice = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) { alert("Voice input not supported."); return; }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const r  = new SR();
    r.lang = "en-US";
    r.onresult = (e: any) => setInput(e.results[0][0].transcript);
    r.start();
  };

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: "#fafafa" }}>
      {/* Top bar */}
      <LiquidGlassBar>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,rgba(184,164,255,0.9),rgba(110,231,247,0.9))", backdropFilter: "blur(8px)", boxShadow: "0 2px 8px rgba(147,197,253,0.4),inset 0 1px 0 rgba(255,255,255,0.5)" }}>
          <span className="font-pixel text-white" style={{ fontSize: 8 }}>SN</span>
        </div>
        <div className="text-center">
          <h1 className="font-pixel text-black/70 leading-none" style={{ fontSize: 11 }}>SNOOKS</h1>
          <p className="font-pixel-thin text-black/40 mt-0.5" style={{ fontSize: 13 }}>Content Strategist · mention a date to auto-schedule</p>
        </div>
        <button
          onClick={startNewChat}
          className="absolute right-4 w-7 h-7 rounded-xl flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.06)" }}
          title="New chat"
        >
          <Plus size={13} className="text-black/40" />
        </button>
      </LiquidGlassBar>

      {/* Body */}
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
                  className="max-w-[76%] px-4 py-3 rounded-2xl"
                  style={{
                    background: msg.role === "user" ? "#1a1a2e" : "rgba(255,255,255,0.92)",
                    border: msg.role === "user" ? "none" : "1px solid rgba(0,0,0,0.07)",
                    boxShadow: msg.role === "user" ? "0 4px 16px rgba(26,26,46,0.3)" : "0 2px 12px rgba(0,0,0,0.06)",
                    borderBottomRightRadius: msg.role === "user" ? 6 : 16,
                    borderBottomLeftRadius:  msg.role === "bot"  ? 6 : 16,
                  }}
                >
                  <p className="font-pixel-thin leading-relaxed whitespace-pre-wrap" style={{ fontSize: 16, color: msg.role === "user" ? "#fff" : "rgba(0,0,0,0.75)" }}>
                    {msg.content.replace(/\*\*(.*?)\*\*/g, "$1")}
                  </p>
                  <p className="font-pixel-thin mt-1" style={{ fontSize: 11, color: msg.role === "user" ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.25)" }}>
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
            <div className="flex items-center gap-2 px-4 py-3 rounded-2xl" style={{ background: "#fff", border: "1.5px solid rgba(0,0,0,0.08)", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
              <input type="file" ref={fileRef} className="hidden" />
              <button onClick={() => fileRef.current?.click()} className="w-7 h-7 rounded-xl flex items-center justify-center hover:bg-black/5 transition-colors">
                <Paperclip size={14} className="text-black/30" />
              </button>
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
                placeholder='Plan your week, or say "Schedule a post for Monday..."'
                className="flex-1 bg-transparent outline-none font-pixel-thin text-black/70 placeholder:text-black/25"
                style={{ fontSize: 15 }}
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
            <p className="font-pixel-thin text-black/25 mt-2 text-center" style={{ fontSize: 11 }}>
              Mention a date or day to auto-add to calendar · click any date to add a note manually
            </p>
          </div>
        </div>

        {/* Calendar panel */}
        <div className="flex-shrink-0 flex flex-col overflow-hidden" style={{ width: 400, background: "#fff", borderLeft: "1px solid rgba(0,0,0,0.07)" }}>
          {/* Month nav */}
          <div className="flex items-center justify-between px-5 py-4 flex-shrink-0" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
            <motion.button onClick={prevMonth} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(0,0,0,0.04)" }}>
              <ChevronLeft size={14} className="text-black/40" />
            </motion.button>
            <div className="text-center">
              <p className="font-pixel text-black/75" style={{ fontSize: 10 }}>{MONTHS[month].toUpperCase()}</p>
              <p className="font-pixel-thin text-black/35 mt-0.5" style={{ fontSize: 13 }}>{year}</p>
            </div>
            <motion.button onClick={nextMonth} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(0,0,0,0.04)" }}>
              <ChevronRight size={14} className="text-black/40" />
            </motion.button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <CalendarGrid
              year={year} month={month} notes={notes}
              onNoteClick={setActiveNote}
              onDayClick={day => setAddDay({ day, month, year })}
            />
          </div>

          <div className="px-5 py-3 flex-shrink-0" style={{ borderTop: "1px solid rgba(0,0,0,0.05)" }}>
            <p className="font-pixel-thin text-black/35" style={{ fontSize: 12 }}>
              Yellow = planned · Green = auto-scheduled by Snooks · hover a date to add manually
            </p>
          </div>
        </div>
      </div>

      {/* Note modal */}
      <AnimatePresence>
        {activeNote && (
          <NoteModal
            note={activeNote}
            onClose={() => setActiveNote(null)}
            onSave={updated => {
              const next = notes.map(n => n.id === updated.id ? updated : n);
              updateNotes(next);
              setActiveNote(updated);
            }}
            onDelete={id => {
              updateNotes(notes.filter(n => n.id !== id));
              setActiveNote(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Add note modal */}
      <AnimatePresence>
        {addDay && (
          <AddNoteModal
            day={addDay.day} month={addDay.month} year={addDay.year}
            onClose={() => setAddDay(null)}
            onAdd={note => {
              updateNotes([...notes, note]);
              setAddDay(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
