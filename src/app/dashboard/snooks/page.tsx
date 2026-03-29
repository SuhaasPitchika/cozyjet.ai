"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Loader2, Calendar, ChevronLeft, ChevronRight,
  Sparkles, User, TrendingUp, Clock, Zap, RotateCcw,
  Copy, Check, CalendarDays,
} from "lucide-react";
import { useDashboardStore } from "@/hooks/use-dashboard-store";

interface ChatMsg {
  id: string;
  role: "user" | "bot";
  content: string;
  timestamp: Date;
  memoryTag?: string;
}

interface CalendarEvent {
  date: number;
  month: number;
  year: number;
  platform: string;
  title: string;
  color: string;
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="p-1.5 rounded-lg hover:bg-black/5 transition-colors text-black/20 hover:text-black/50"
    >
      {copied ? <Check size={11} /> : <Copy size={11} />}
    </button>
  );
}

const STARTER_PROMPTS = [
  { icon: "📈", text: "Should I post about my latest feature shipping today?" },
  { icon: "🔥", text: "What's trending right now that I can connect my niche to?" },
  { icon: "📅", text: "Plan my content for the next 7 days" },
  { icon: "🕐", text: "What's the best time to post on LinkedIn this week?" },
  { icon: "🚀", text: "How do I go viral as a solo developer?" },
  { icon: "♻️", text: "Repurpose my GitHub activity into 3 content ideas" },
];

const MEMORY_TAGS = [
  "Prefers LinkedIn for long-form",
  "Posts best on Tue/Thu",
  "Niche: AI/SaaS for devs",
  "Tone: direct + analytical",
  "Audience: builders & founders",
];

const DAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const PLATFORM_COLORS: Record<string, string> = {
  LinkedIn: "#0A66C2",
  Twitter: "#1DA1F2",
  Instagram: "#E4405F",
  All: "#6366f1",
};

function MiniCalendar({ events }: { events: CalendarEvent[] }) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const prevMonth = () => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const monthEvents = events.filter((e) => e.month === month && e.year === year);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <div className="flex flex-col h-full">
      {/* Calendar header */}
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
        <div className="flex items-center gap-2">
          <CalendarDays size={13} className="text-indigo-500" />
          <span className="text-[12px] font-bold text-black/70">{monthNames[month]} {year}</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={prevMonth} className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-black/5 transition-colors">
            <ChevronLeft size={12} className="text-black/40" />
          </button>
          <button onClick={nextMonth} className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-black/5 transition-colors">
            <ChevronRight size={12} className="text-black/40" />
          </button>
        </div>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 px-3 py-2">
        {DAY_NAMES.map((d) => (
          <div key={d} className="text-center text-[9px] font-bold text-black/25">{d}</div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 px-3 gap-y-1 flex-1">
        {cells.map((day, idx) => {
          if (!day) return <div key={idx} />;
          const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
          const dayEvents = monthEvents.filter((e) => e.date === day);
          return (
            <div key={idx} className="flex flex-col items-center gap-0.5 py-0.5">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold"
                style={isToday
                  ? { background: "#6366f1", color: "white" }
                  : { color: "rgba(0,0,0,0.55)" }
                }
              >
                {day}
              </div>
              <div className="flex gap-px flex-wrap justify-center">
                {dayEvents.slice(0, 2).map((e, i) => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: PLATFORM_COLORS[e.platform] || "#6366f1" }} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="px-4 py-3 border-t space-y-1.5" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
        {Object.entries(PLATFORM_COLORS).filter(([k]) => k !== "All").map(([p, c]) => {
          const count = monthEvents.filter((e) => e.platform === p).length;
          return (
            <div key={p} className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: c }} />
                <span className="text-[10px] text-black/45">{p}</span>
              </div>
              <span className="text-[10px] font-semibold text-black/35">{count} posts</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MessageBubble({ msg }: { msg: ChatMsg }) {
  const isBot = msg.role === "bot";
  const fmt = (d: Date) => d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className={`flex gap-3 ${!isBot ? "flex-row-reverse" : ""}`}
    >
      {isBot ? (
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 text-base"
          style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)" }}>
          📅
        </div>
      ) : (
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
          style={{ background: "rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.08)" }}>
          <User size={13} className="text-black/45" />
        </div>
      )}

      <div className={`flex-1 max-w-[80%] group ${!isBot ? "flex flex-col items-end" : ""}`}>
        <div
          className={`px-4 py-3 rounded-2xl text-[13px] leading-relaxed ${isBot ? "rounded-tl-sm" : "rounded-tr-sm"}`}
          style={isBot ? {
            background: "rgba(255,255,255,0.8)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.95)",
            boxShadow: "0 2px 12px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,1)",
            color: "rgba(0,0,0,0.72)",
          } : {
            background: "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(99,102,241,0.1))",
            border: "1px solid rgba(124,58,237,0.25)",
            color: "rgba(0,0,0,0.72)",
          }}
        >
          <p className="whitespace-pre-wrap">{msg.content}</p>
        </div>

        <div className={`flex items-center gap-1 mt-1 ${!isBot ? "justify-end" : ""}`}>
          <span className="text-[9px] text-black/20">{fmt(msg.timestamp)}</span>
          {isBot && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <CopyBtn text={msg.content} />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function TypingDots() {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 text-base"
        style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)" }}>
        📅
      </div>
      <div className="px-4 py-3 rounded-2xl rounded-tl-sm"
        style={{ background: "rgba(255,255,255,0.8)", border: "1px solid rgba(255,255,255,0.95)", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div key={i} animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
              className="w-1.5 h-1.5 rounded-full bg-violet-400" />
          ))}
        </div>
      </div>
    </div>
  );
}

const SAMPLE_EVENTS: CalendarEvent[] = [
  { date: new Date().getDate(), month: new Date().getMonth(), year: new Date().getFullYear(), platform: "LinkedIn", title: "Ship story", color: "#0A66C2" },
  { date: new Date().getDate() + 2, month: new Date().getMonth(), year: new Date().getFullYear(), platform: "Twitter", title: "Thread", color: "#1DA1F2" },
  { date: new Date().getDate() + 4, month: new Date().getMonth(), year: new Date().getFullYear(), platform: "Instagram", title: "Behind scenes", color: "#E4405F" },
  { date: new Date().getDate() + 5, month: new Date().getMonth(), year: new Date().getFullYear(), platform: "LinkedIn", title: "Tip post", color: "#0A66C2" },
];

export default function SnooksPage() {
  const { assistanceMsg, skippyContext } = useDashboardStore();
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCalendar, setShowCalendar] = useState(true);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(SAMPLE_EVENTS);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const historyRef = useRef<{ role: string; content: string }[]>([]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isGenerating]);

  const buildSkippyCtx = useCallback(() => {
    if (skippyContext) {
      const parts = [];
      if (skippyContext.signal) parts.push(skippyContext.signal);
      if (skippyContext.activity) parts.push(skippyContext.activity);
      return parts.join(". ");
    }
    return assistanceMsg || "";
  }, [skippyContext, assistanceMsg]);

  const handleSend = async (override?: string) => {
    const text = (override || input).trim();
    if (!text || isGenerating) return;
    setInput("");

    const userMsg: ChatMsg = { id: Date.now().toString(), role: "user", content: text, timestamp: new Date() };
    setMessages((p) => [...p, userMsg]);
    setIsGenerating(true);

    const skippyCtx = buildSkippyCtx();
    const systemNote = skippyCtx ? ` [Workspace context: ${skippyCtx}]` : "";
    historyRef.current.push({ role: "user", content: text + systemNote });

    try {
      const res = await fetch("/api/ai/snooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userPrompt: text,
          userContext: { date: new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }), role: "solopreneur", niche: "AI/SaaS" },
          skippyContext: skippyCtx,
          conversationHistory: historyRef.current.slice(-10),
        }),
      });

      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      const botContent = data.response || data.week_summary || (data.suggestions ? `Here are ${data.suggestions.length} content suggestions:\n\n${data.suggestions.map((s: { title: string; rationale: string }, i: number) => `${i + 1}. **${s.title}**\n${s.rationale}`).join("\n\n")}` : "Let me help you plan your content strategy.");

      historyRef.current.push({ role: "assistant", content: botContent });
      setMessages((p) => [...p, { id: (Date.now() + 1).toString(), role: "bot", content: botContent, timestamp: new Date() }]);
    } catch {
      setMessages((p) => [...p, {
        id: "err-" + Date.now(), role: "bot",
        content: "I'm having a moment connecting. Please check your API key or try again.",
        timestamp: new Date(),
      }]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const hasMessages = messages.length > 0;
  const skippyCtx = buildSkippyCtx();

  return (
    <div className="h-full flex flex-col"
      style={{ background: "linear-gradient(135deg, #f5f0eb 0%, #ede8e3 40%, #f0ece7 100%)" }}>
      {/* Header */}
      <div className="px-6 py-4 border-b flex items-center justify-between shrink-0"
        style={{ borderColor: "rgba(0,0,0,0.07)", background: "rgba(255,255,255,0.45)", backdropFilter: "blur(20px)" }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
            style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)" }}>
            📅
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[14px] font-bold text-black/75">Snooks</h1>
              <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 2, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-violet-400" />
            </div>
            <p className="text-[10px] text-black/35">Content Strategist · Growth Intelligence</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Memory pills */}
          <div className="hidden md:flex items-center gap-1.5">
            <span className="text-[10px] text-black/30 flex items-center gap-1">
              <Zap size={9} className="text-violet-400" /> Memory:
            </span>
            {MEMORY_TAGS.slice(0, 2).map((tag) => (
              <span key={tag} className="text-[9px] font-medium px-2 py-0.5 rounded-full"
                style={{ background: "rgba(124,58,237,0.08)", color: "#7c3aed", border: "1px solid rgba(124,58,237,0.15)" }}>
                {tag}
              </span>
            ))}
          </div>

          {skippyCtx && (
            <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg"
              style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.18)" }}>
              <TrendingUp size={10} className="text-indigo-500" />
              <span className="text-[9px] text-indigo-500 font-medium">Skippy live</span>
            </div>
          )}

          {hasMessages && (
            <button onClick={() => { setMessages([]); historyRef.current = []; }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] text-black/30 hover:text-black/55 hover:bg-black/5 transition-all">
              <RotateCcw size={11} />Clear
            </button>
          )}

          <button
            onClick={() => setShowCalendar((p) => !p)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all"
            style={showCalendar
              ? { background: "rgba(99,102,241,0.1)", color: "#6366f1", border: "1px solid rgba(99,102,241,0.2)" }
              : { background: "rgba(0,0,0,0.05)", color: "rgba(0,0,0,0.45)", border: "1px solid rgba(0,0,0,0.07)" }}
          >
            <Calendar size={12} />
            Calendar
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          <div ref={scrollRef} className="flex-1 overflow-y-auto">
            {!hasMessages ? (
              <div className="h-full flex flex-col items-center justify-center gap-6 px-8 py-10 text-center">
                <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                  className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl"
                  style={{
                    background: "rgba(255,255,255,0.65)", backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255,255,255,0.9)",
                    boxShadow: "0 4px 24px rgba(124,58,237,0.12), 0 8px 40px rgba(0,0,0,0.06)",
                  }}>
                  📅
                </motion.div>

                <div>
                  <h2 className="text-[20px] font-bold text-black/65">Snooks is ready</h2>
                  <p className="text-[12px] text-black/35 mt-2 max-w-sm mx-auto leading-relaxed">
                    Your content strategist that thinks about the bigger picture. Ask about what to post, when to post it, how to go viral, or get a full week planned.
                  </p>
                  {skippyCtx && (
                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                      className="mt-3 inline-flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-medium"
                      style={{ background: "rgba(124,58,237,0.07)", color: "#7c3aed", border: "1px solid rgba(124,58,237,0.15)" }}>
                      <Zap size={10} /> Skippy workspace context loaded
                    </motion.div>
                  )}
                </div>

                {/* Memory tags */}
                <div className="flex flex-col items-center gap-2">
                  <p className="text-[10px] text-black/30 font-semibold uppercase tracking-widest">What Snooks remembers about you</p>
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {MEMORY_TAGS.map((tag) => (
                      <span key={tag} className="text-[10px] font-medium px-2.5 py-1 rounded-full"
                        style={{ background: "rgba(255,255,255,0.7)", color: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.9)" }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 w-full max-w-md">
                  {STARTER_PROMPTS.map((p) => (
                    <motion.button key={p.text} onClick={() => handleSend(p.text)}
                      whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}
                      className="flex items-start gap-2.5 text-left px-4 py-3.5 rounded-2xl transition-all"
                      style={{
                        background: "rgba(255,255,255,0.65)", backdropFilter: "blur(20px)",
                        border: "1px solid rgba(255,255,255,0.9)",
                        boxShadow: "0 2px 10px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,1)",
                      }}>
                      <span className="shrink-0 text-base">{p.icon}</span>
                      <span className="text-[11px] text-black/50 leading-relaxed">{p.text}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="px-6 py-6 space-y-5 max-w-2xl mx-auto">
                <AnimatePresence initial={false}>
                  {messages.map((msg) => <MessageBubble key={msg.id} msg={msg} />)}
                </AnimatePresence>
                {isGenerating && <TypingDots />}
              </div>
            )}
          </div>

          {/* Input */}
          <div className="px-5 py-4 shrink-0 border-t"
            style={{ borderColor: "rgba(0,0,0,0.07)", background: "rgba(255,255,255,0.35)", backdropFilter: "blur(20px)" }}>
            <div className="max-w-2xl mx-auto">
              <div
                className="flex items-end gap-3 px-4 py-3 rounded-2xl transition-all focus-within:ring-2 focus-within:ring-violet-300/50"
                style={{
                  background: "rgba(255,255,255,0.75)",
                  border: "1.5px solid rgba(255,255,255,0.95)",
                  backdropFilter: "blur(20px)",
                  boxShadow: "0 2px 16px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,1)",
                }}
              >
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  disabled={isGenerating}
                  placeholder="Ask Snooks: should I post today? how do I grow? plan my week…"
                  rows={1}
                  className="flex-1 bg-transparent text-[13px] text-black/70 placeholder:text-black/25 outline-none resize-none min-h-[22px] max-h-32 leading-[1.5]"
                />
                <motion.button
                  onClick={() => handleSend()}
                  disabled={isGenerating || !input.trim()}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.96 }}
                  className="p-2.5 rounded-xl disabled:opacity-25 transition-all shrink-0 self-end"
                  style={input.trim()
                    ? { background: "linear-gradient(135deg, #7c3aed, #6366f1)", boxShadow: "0 4px 12px rgba(124,58,237,0.4)" }
                    : { background: "rgba(0,0,0,0.06)" }}
                >
                  {isGenerating
                    ? <Loader2 size={13} className="text-violet-600 animate-spin" />
                    : <Send size={13} className={input.trim() ? "text-white" : "text-black/35"} />
                  }
                </motion.button>
              </div>
              <p className="text-[9px] text-black/20 mt-2 text-center">
                Snooks remembers your preferences and workspace context · Powered by OpenRouter
              </p>
            </div>
          </div>
        </div>

        {/* Calendar sidebar */}
        <AnimatePresence>
          {showCalendar && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 220, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              className="shrink-0 border-l overflow-hidden flex flex-col"
              style={{
                borderColor: "rgba(0,0,0,0.07)",
                background: "rgba(255,255,255,0.55)",
                backdropFilter: "blur(20px)",
              }}
            >
              <MiniCalendar events={calendarEvents} />

              {/* Upcoming */}
              <div className="px-4 pb-4 flex-1 overflow-y-auto">
                <p className="text-[9px] font-bold uppercase tracking-widest text-black/25 mb-2">Upcoming</p>
                <div className="space-y-2">
                  {calendarEvents.slice(0, 4).map((evt, i) => (
                    <div key={i} className="flex items-center gap-2 px-2.5 py-2 rounded-xl"
                      style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.9)" }}>
                      <div className="w-1.5 h-full rounded-full shrink-0" style={{ background: PLATFORM_COLORS[evt.platform], minHeight: 24 }} />
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold text-black/65 truncate">{evt.title}</p>
                        <p className="text-[9px] text-black/30">{evt.platform} · Day {evt.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
