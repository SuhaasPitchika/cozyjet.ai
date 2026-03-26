"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, TrendingUp, CheckCircle2 } from "lucide-react";
import { useDashboardStore } from "@/hooks/use-dashboard-store";

interface TimelineEvent {
  id: string;
  time: string;
  title: string;
  desc: string;
  type: "deep" | "research" | "commit" | "design" | "break" | "ai";
  duration: string;
  score: number;
}

const TYPE_COLORS: Record<string, string> = {
  deep: "#3b82f6",
  research: "#8b5cf6",
  commit: "#10b981",
  design: "#ec4899",
  break: "#6b7280",
  ai: "#f59e0b",
};

const TYPE_ICONS: Record<string, string> = {
  deep: "⌨️",
  research: "🔍",
  commit: "🔗",
  design: "🎨",
  break: "☕",
  ai: "🤖",
};

function ScoreRing({ score }: { score: number }) {
  const r = 26;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" className="shrink-0">
      <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="5" />
      <motion.circle
        cx="32" cy="32" r={r} fill="none"
        stroke={score >= 75 ? "#10b981" : score >= 50 ? "#3b82f6" : "#ec4899"}
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={`${circ}`}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - dash }}
        transition={{ duration: 1.4, ease: "easeOut", delay: 0.3 }}
        style={{ transformOrigin: "32px 32px", transform: "rotate(-90deg)" }}
      />
      <text x="32" y="37" textAnchor="middle" fontSize="13" fontWeight="800" fill="rgba(0,0,0,0.7)">{score}</text>
    </svg>
  );
}

function TimelineCard({ event, index }: { event: TimelineEvent; index: number }) {
  const color = TYPE_COLORS[event.type];
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="flex gap-4 group"
    >
      <div className="flex flex-col items-center">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-base shrink-0 shadow-sm"
          style={{ background: `${color}14`, border: `1.5px solid ${color}30` }}
        >
          {TYPE_ICONS[event.type]}
        </div>
        <div className="w-px flex-1 mt-2" style={{ background: `${color}18` }} />
      </div>
      <div className="pb-6 flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div>
            <p className="text-sm font-semibold text-gray-800 leading-tight">{event.title}</p>
            <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{event.desc}</p>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${color}12`, color }}>
              {event.score}%
            </div>
            <p className="text-[9px] text-gray-300 mt-1">{event.duration}</p>
          </div>
        </div>
        <div className="h-1 rounded-full mt-2 overflow-hidden" style={{ background: "rgba(0,0,0,0.05)" }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${event.score}%` }}
            transition={{ delay: 0.4 + index * 0.08, duration: 0.8, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${color}80, ${color})` }}
          />
        </div>
      </div>
    </motion.div>
  );
}

const SAMPLE_TIMELINE: TimelineEvent[] = [
  { id: "1", time: "9:00 AM", title: "Deep work session — dashboard refactor", desc: "VSCode · /src/dashboard · 3 file saves · no context switches", type: "deep", duration: "47 min", score: 92 },
  { id: "2", time: "9:52 AM", title: "API research & documentation reading", desc: "Browser · docs.openrouter.ai · API rate limits & vision endpoints", type: "research", duration: "28 min", score: 78 },
  { id: "3", time: "10:25 AM", title: "Git commit pushed to main", desc: "feat: skippy toggle redesign with screen capture integration", type: "commit", duration: "5 min", score: 100 },
  { id: "4", time: "10:30 AM", title: "Design system review — Figma", desc: "CozyJet design tokens, component library updates", type: "design", duration: "34 min", score: 85 },
  { id: "5", time: "11:10 AM", title: "Short break", desc: "Away from screen · idle detected", type: "break", duration: "12 min", score: 30 },
  { id: "6", time: "11:22 AM", title: "AI agent development — Snooks", desc: "Building productivity timeline generator · API integration", type: "ai", duration: "1h 8min", score: 96 },
];

export default function SnooksPage() {
  const { assistanceMsg, skippyContext } = useDashboardStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [streamingEvents, setStreamingEvents] = useState<TimelineEvent[]>([]);
  const [totalScore, setTotalScore] = useState(0);
  const [generated, setGenerated] = useState(false);
  const [dateLabel, setDateLabel] = useState("Today");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const d = new Date();
    setDateLabel(d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }));
  }, []);

  const stats = React.useMemo(() => {
    if (!timeline.length) return null;
    const deepWork = timeline.filter(e => e.type === "deep" || e.type === "ai" || e.type === "commit");
    const commits = timeline.filter(e => e.type === "commit").length;
    const avgScore = Math.round(timeline.reduce((s, e) => s + e.score, 0) / timeline.length);
    return { sessions: deepWork.length, commits, avgScore };
  }, [timeline]);

  const buildSkippyCtx = () => {
    if (skippyContext) {
      const parts = [];
      if (skippyContext.signal) parts.push(skippyContext.signal);
      if (skippyContext.activity) parts.push(skippyContext.activity);
      if (skippyContext.insights) parts.push(skippyContext.insights);
      return parts.join(". ");
    }
    return assistanceMsg || "";
  };

  const generate = async () => {
    setIsGenerating(true);
    setTimeline([]);
    setStreamingEvents([]);
    setGenerated(false);
    setErrorMsg(null);

    const skippyCtx = buildSkippyCtx();

    const userPrompt = skippyCtx
      ? `Based on Skippy's live observation of my workspace: "${skippyCtx}". Generate a realistic productivity timeline for today with exactly 6 events. Return ONLY a valid JSON array with no markdown, no explanation. Each event: { "id": "string", "time": "H:MM AM/PM", "title": "string", "desc": "string", "type": "deep|research|commit|design|break|ai", "duration": "string", "score": 0-100 }`
      : `Generate a realistic productivity timeline for a developer working on an AI SaaS product today. Exactly 6 events, sequential times starting around 9 AM. Return ONLY a valid JSON array with no markdown. Each event: { "id": "string", "time": "H:MM AM/PM", "title": "string", "desc": "string", "type": "deep|research|commit|design|break|ai", "duration": "string", "score": 0-100 }`;

    const userContext = skippyCtx
      ? { workspace: skippyCtx, date: dateLabel }
      : { role: "developer", project: "AI SaaS", date: dateLabel };

    try {
      const res = await fetch("/api/ai/snooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userPrompt,
          userContext,
          skippyContext: skippyCtx,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "API error");
      }

      const data = await res.json();

      let events: TimelineEvent[] | null = null;

      if (data.responseText) {
        const jsonMatch = data.responseText.match(/\[[\s\S]*?\]/);
        if (jsonMatch) {
          try { events = JSON.parse(jsonMatch[0]); } catch {}
        }
      }

      if (!events && data.raw) {
        const jsonMatch = data.raw.match(/\[[\s\S]*?\]/);
        if (jsonMatch) {
          try { events = JSON.parse(jsonMatch[0]); } catch {}
        }
      }

      if (events && Array.isArray(events) && events.length > 0) {
        for (let i = 0; i < events.length; i++) {
          await new Promise(r => setTimeout(r, 180));
          setStreamingEvents(prev => [...prev, events![i]]);
        }
        setTimeline(events);
        const avg = Math.round(events.reduce((s, e) => s + (e.score || 0), 0) / events.length);
        setTotalScore(avg);
        setGenerated(true);
      } else {
        setTimeline(SAMPLE_TIMELINE);
        setTotalScore(81);
        setGenerated(true);
      }
    } catch (err: any) {
      if (err.message?.includes("API key")) {
        setErrorMsg("OPEN_ROUTER API key not configured. Add it in environment variables.");
      } else {
        setTimeline(SAMPLE_TIMELINE);
        setTotalScore(81);
        setGenerated(true);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const displayEvents = isGenerating ? streamingEvents : timeline;

  return (
    <div className="h-full flex flex-col" style={{ background: "#fafafa" }}>
      <div className="px-8 py-5 border-b border-black/5 flex items-center justify-between shrink-0" style={{ background: "rgba(255,255,255,0.8)", backdropFilter: "blur(12px)" }}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
            <span className="text-[11px] text-black/30 font-medium uppercase tracking-widest">Productivity Agent · Snooks</span>
          </div>
          <h1 className="text-lg font-semibold text-gray-900 tracking-tight">Productivity Timeline</h1>
          <p className="text-xs text-gray-400 mt-0.5">{dateLabel}</p>
        </div>
        <div className="flex items-center gap-3">
          {generated && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => { setGenerated(false); setTimeline([]); setStreamingEvents([]); setErrorMsg(null); }}
              className="text-xs text-black/30 hover:text-black/60 transition-colors px-3 py-1.5 rounded-lg hover:bg-black/5"
            >
              Clear
            </motion.button>
          )}
          <motion.button
            onClick={generate}
            disabled={isGenerating}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-all"
            style={{ background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)", boxShadow: "0 4px 16px rgba(124,58,237,0.3)" }}
          >
            {isGenerating ? (
              <>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}>
                  <Zap size={14} />
                </motion.div>
                <span>Generating...</span>
              </>
            ) : (
              <><Zap size={14} /><span>{generated ? "Regenerate" : "Generate Timeline"}</span></>
            )}
          </motion.button>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-8 py-6">
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 px-4 py-3 rounded-xl text-sm text-red-600 font-medium"
            style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}
          >
            {errorMsg}
          </motion.div>
        )}

        {!generated && !isGenerating && !errorMsg && (
          <div className="h-full flex flex-col items-center justify-center text-center gap-6">
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="w-20 h-20 rounded-3xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #7c3aed15, #6d28d915)", border: "1px solid rgba(124,58,237,0.15)" }}
            >
              <TrendingUp size={32} className="text-violet-400" />
            </motion.div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Your day, mapped.</h2>
              <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
                {buildSkippyCtx()
                  ? "Skippy has context from your screen. Generate your personalized timeline."
                  : "Generate a productivity timeline powered by your Skippy observations."}
              </p>
              {buildSkippyCtx() && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 px-4 py-3 rounded-xl text-xs text-violet-600 font-medium"
                  style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.15)" }}
                >
                  📡 Skippy context: "{buildSkippyCtx().slice(0, 80)}{buildSkippyCtx().length > 80 ? "..." : ""}"
                </motion.div>
              )}
            </div>
            <motion.button
              onClick={generate}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-7 py-3.5 rounded-2xl text-sm font-semibold text-white"
              style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)", boxShadow: "0 8px 24px rgba(124,58,237,0.35)" }}
            >
              <Zap size={16} /> Generate My Timeline
            </motion.button>
          </div>
        )}

        {(isGenerating || generated) && !errorMsg && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl">
            {(generated && !isGenerating) && (
              <div className="flex items-center gap-4 p-5 rounded-2xl mb-8" style={{ background: "rgba(255,255,255,0.9)", boxShadow: "0 2px 16px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.06)" }}>
                <ScoreRing score={totalScore} />
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-800">
                    {totalScore >= 80 ? "Exceptional focus day 🔥" : totalScore >= 60 ? "Solid productivity 💪" : "Room to improve 📈"}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">Overall productivity score</p>
                  {stats && (
                    <div className="flex gap-4 mt-2">
                      <div className="text-center">
                        <p className="text-sm font-bold text-gray-700">{stats.sessions}</p>
                        <p className="text-[9px] text-gray-400 uppercase tracking-wide">Sessions</p>
                      </div>
                      <div className="w-px bg-black/6" />
                      <div className="text-center">
                        <p className="text-sm font-bold text-gray-700">{stats.commits}</p>
                        <p className="text-[9px] text-gray-400 uppercase tracking-wide">Commits</p>
                      </div>
                      <div className="w-px bg-black/6" />
                      <div className="text-center">
                        <p className="text-sm font-bold text-gray-700">{stats.avgScore}%</p>
                        <p className="text-[9px] text-gray-400 uppercase tracking-wide">Avg Focus</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {isGenerating && streamingEvents.length === 0 && (
              <div className="flex flex-col gap-4">
                {[0,1,2,3,4,5].map((i) => (
                  <div key={i} className="flex gap-4 animate-pulse">
                    <div className="w-9 h-9 rounded-full bg-black/5 shrink-0" />
                    <div className="flex-1 space-y-2 pt-1">
                      <div className="h-3 bg-black/5 rounded-full w-1/2" />
                      <div className="h-2 bg-black/5 rounded-full w-3/4" />
                      <div className="h-1 bg-black/5 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="relative">
              <AnimatePresence>
                {displayEvents.map((event, i) => (
                  <TimelineCard key={event.id} event={event} index={i} />
                ))}
              </AnimatePresence>

              {isGenerating && streamingEvents.length > 0 && (
                <motion.div
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="flex gap-4 items-center py-2"
                >
                  <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)" }}>
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                      <Zap size={16} className="text-violet-400" />
                    </motion.div>
                  </div>
                  <span className="text-xs text-gray-400 font-medium">Generating next event...</span>
                </motion.div>
              )}

              {generated && !isGenerating && (
                <div className="flex gap-4">
                  <div className="w-9 flex justify-center">
                    <div className="w-4 h-4 rounded-full border-2 border-black/10 flex items-center justify-center">
                      <CheckCircle2 size={12} className="text-emerald-400" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-300 pb-2">End of tracked session</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
