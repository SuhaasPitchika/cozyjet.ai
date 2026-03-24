"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart2, Loader2, Zap, TrendingUp, Clock,
  Target, ArrowRight, Sparkles, Brain, Flame,
} from "lucide-react";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, addDoc, serverTimestamp, query, orderBy, limit } from "firebase/firestore";
import { cn } from "@/lib/utils";
import { useDashboardStore } from "@/hooks/use-dashboard-store";

const SAMPLE_ACTIVITIES = [
  { startTime: "09:00", endTime: "10:30", description: "Worked on the CozyJet dashboard — refactored sidebar layout and fixed glassmorphism styles across 8 components in the /src/dashboard directory using VSCode with Copilot" },
  { startTime: "10:30", endTime: "10:35", description: "Checked Slack messages, reviewed 2 PRs from team members on GitHub" },
  { startTime: "10:35", endTime: "12:00", description: "Deep focus on OpenRouter API integration — built 4 backend routes and tested Skippy chat endpoint with Postman, committed to main branch" },
  { startTime: "12:00", endTime: "12:30", description: "Lunch break, stepped away from desk" },
  { startTime: "12:30", endTime: "14:15", description: "Flippo timeline UI redesign — implemented napkin.ai-style layout with session cards and deep work score visualization, pushed 3 commits" },
  { startTime: "14:15", endTime: "14:20", description: "Checked Twitter notifications and GitHub issues briefly" },
  { startTime: "14:20", endTime: "15:30", description: "Snooks marketing agent overhaul — rewrote viral content prompts, added SEO hook generation and Twitter thread format with Claude-level quality" },
];

const TYPE_STYLES: Record<string, { dot: string; line: string; badge: string; badgeText: string; card: string }> = {
  deep_work: {
    dot: "bg-emerald-400",
    line: "bg-emerald-500/30",
    badge: "bg-emerald-500/10 border-emerald-500/20",
    badgeText: "text-emerald-400",
    card: "hover:border-emerald-500/15",
  },
  shallow_work: {
    dot: "bg-amber-400",
    line: "bg-amber-500/30",
    badge: "bg-amber-500/10 border-amber-500/20",
    badgeText: "text-amber-400",
    card: "hover:border-amber-500/15",
  },
  break: {
    dot: "bg-blue-400",
    line: "bg-blue-500/30",
    badge: "bg-blue-500/10 border-blue-500/20",
    badgeText: "text-blue-400",
    card: "hover:border-blue-500/15",
  },
  distraction: {
    dot: "bg-red-400",
    line: "bg-red-500/30",
    badge: "bg-red-500/10 border-red-500/20",
    badgeText: "text-red-400",
    card: "hover:border-red-500/15",
  },
};

const TOOL_ICONS: Record<string, string> = {
  VSCode: "⌨️", Browser: "🌐", Terminal: "💻",
  Figma: "🎨", GitHub: "🔗", Notion: "📝", Meeting: "👥",
};

function ScoreRing({ score }: { score: number }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 70 ? "#34d399" : score >= 40 ? "#fbbf24" : "#f87171";

  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 88 88">
        <circle cx="44" cy="44" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
        <motion.circle
          cx="44" cy="44" r={r} fill="none"
          stroke={color} strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${circ}`}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 1.4, ease: "easeOut" }}
          style={{ filter: `drop-shadow(0 0 6px ${color}60)` }}
        />
      </svg>
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-2xl font-bold text-white"
        >
          {score}
        </motion.div>
        <div className="text-[9px] text-white/30 uppercase tracking-wider">Score</div>
      </div>
    </div>
  );
}

function EmptyState({ onGenerate, isGenerating }: { onGenerate: () => void; isGenerating: boolean }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-8 p-12">
      <div className="text-center space-y-3">
        <motion.div
          animate={{ scale: [1, 1.05, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="w-16 h-16 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center mx-auto mb-3"
        >
          <Brain size={28} className="text-white/25" />
        </motion.div>
        <h2 className="text-xl font-semibold text-white">No Timeline Yet</h2>
        <p className="text-sm text-white/35 max-w-xs leading-relaxed">
          Generate your productivity timeline. Flippo will analyze your work session with emotional context and rich detail.
        </p>
      </div>

      <motion.button
        onClick={onGenerate}
        disabled={isGenerating}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="group flex items-center gap-3 px-8 py-4 rounded-2xl bg-white text-black font-semibold hover:bg-white/90 disabled:opacity-40 transition-all shadow-lg"
      >
        {isGenerating ? (
          <><Loader2 size={16} className="animate-spin" /><span>Analyzing Session...</span></>
        ) : (
          <><Sparkles size={16} /><span>Generate Timeline</span><ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" /></>
        )}
      </motion.button>

      <div className="grid grid-cols-3 gap-4 w-full max-w-md">
        {[
          { icon: "🧠", label: "Emotional Context", desc: "Rich, human-readable insights" },
          { icon: "📊", label: "Deep Work Score", desc: "0–100 focus quality rating" },
          { icon: "⚡", label: "Smart Insights", desc: "AI-powered recommendations" },
        ].map((f) => (
          <div key={f.label} className="p-4 rounded-xl bg-white/[0.03] border border-white/5 text-center space-y-1.5">
            <div className="text-xl">{f.icon}</div>
            <div className="text-[11px] font-medium text-white/55">{f.label}</div>
            <div className="text-[10px] text-white/25 leading-relaxed">{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function FlippoPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { assistanceMsg } = useDashboardStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedData, setGeneratedData] = useState<any>(null);

  const sessionsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, "users", user.uid, "productivitySessions"), orderBy("createdAt", "desc"), limit(1));
  }, [db, user]);

  const { data: sessions } = useCollection(sessionsQuery);
  const savedSession = sessions?.[0];
  const activeData = generatedData || (savedSession?.rawData ? JSON.parse(savedSession.rawData) : null);
  const hasData = !!activeData;

  const handleGenerate = async () => {
    if (!user || isGenerating) return;
    setIsGenerating(true);
    try {
      const res = await fetch("/api/ai/timeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawActivities: SAMPLE_ACTIVITIES,
          skippyContext: assistanceMsg || "User is actively working on CozyJet.AI, their SaaS productivity platform.",
        }),
      });
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      setGeneratedData(data);
      if (user) {
        await addDoc(collection(db, "users", user.uid, "productivitySessions"), {
          userId: user.uid,
          score: data.deepWorkScore ?? 0,
          insights: data.momentumInsight ?? "",
          topAchievement: data.topAchievement ?? "",
          rawData: JSON.stringify(data),
          createdAt: serverTimestamp(),
        });
      }
    } catch (e) {
      console.error("Timeline error:", e);
    } finally {
      setIsGenerating(false);
    }
  };

  const score = activeData?.deepWorkScore ?? null;

  return (
    <div className="h-full bg-[#0f0f0f] flex flex-col">
      {/* Header */}
      <div className="px-8 py-5 border-b border-white/5 flex items-center justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
            <span className="text-[11px] text-white/30 font-medium uppercase tracking-widest">Productivity Agent · Flippo</span>
          </div>
          <h1 className="text-lg font-semibold text-white tracking-tight">Activity Timeline</h1>
        </div>
        {hasData && (
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black text-sm font-medium hover:bg-white/90 disabled:opacity-40 transition-all"
          >
            {isGenerating
              ? <><Loader2 size={13} className="animate-spin" /><span>Analyzing...</span></>
              : <><Zap size={13} /><span>Regenerate</span></>}
          </button>
        )}
      </div>

      {!hasData ? (
        <EmptyState onGenerate={handleGenerate} isGenerating={isGenerating} />
      ) : (
        <div className="flex-1 overflow-hidden flex">
          {/* Timeline main area */}
          <div className="flex-1 overflow-y-auto px-8 py-6">
            {/* Stats bar */}
            <div className="grid grid-cols-4 gap-3 mb-8">
              {/* Score ring card */}
              <div className="col-span-1 rounded-2xl bg-white/[0.03] border border-white/5 p-5 flex flex-col items-center justify-center">
                {score !== null && <ScoreRing score={score} />}
                <div className="text-[10px] text-white/25 uppercase tracking-wider mt-2">Deep Work</div>
              </div>

              {/* Focus time */}
              <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-5">
                <div className="flex items-center gap-1.5 mb-2">
                  <Clock size={11} className="text-white/25" />
                  <span className="text-[10px] text-white/25 uppercase tracking-wider">Focus Time</span>
                </div>
                <div className="text-3xl font-bold text-white">
                  {Math.floor((activeData?.totalFocusMinutes || 0) / 60)}
                  <span className="text-base font-normal text-white/40">h</span>{" "}
                  {(activeData?.totalFocusMinutes || 0) % 60}
                  <span className="text-base font-normal text-white/40">m</span>
                </div>
                <p className="text-[10px] text-white/25 mt-1">Tracked today</p>
              </div>

              {/* Top achievement */}
              <div className="col-span-2 rounded-2xl bg-white/[0.03] border border-white/5 p-5">
                <div className="flex items-center gap-1.5 mb-2">
                  <Flame size={11} className="text-amber-400/60" />
                  <span className="text-[10px] text-white/25 uppercase tracking-wider">Top Achievement</span>
                </div>
                <p className="text-sm text-white/70 leading-relaxed">
                  {activeData?.topAchievement || "—"}
                </p>
              </div>
            </div>

            {/* Timeline label */}
            <div className="flex items-center gap-2.5 mb-5">
              <Clock size={13} className="text-white/25" />
              <span className="text-xs text-white/25 font-medium uppercase tracking-wider">Session Timeline</span>
              <div className="flex-1 h-px bg-white/5" />
            </div>

            {/* Timeline items */}
            <div className="relative">
              {/* Vertical spine */}
              <div className="absolute left-[18px] top-3 bottom-3 w-px bg-white/6" />

              {(activeData?.sessions || []).map((session: any, i: number) => {
                const styles = TYPE_STYLES[session.type] || TYPE_STYLES.shallow_work;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07, duration: 0.4, ease: "easeOut" }}
                    className="relative flex gap-5 pb-5 group"
                  >
                    {/* Timeline dot */}
                    <div className="relative z-10 shrink-0 mt-4">
                      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", "bg-white/[0.04] border border-white/8")}>
                        <div className={cn("w-2.5 h-2.5 rounded-full", styles.dot)}
                          style={{ boxShadow: `0 0 8px 2px ${session.type === "deep_work" ? "rgba(52,211,153,0.4)" : session.type === "shallow_work" ? "rgba(251,191,36,0.4)" : "rgba(255,255,255,0.2)"}` }}
                        />
                      </div>
                    </div>

                    {/* Card */}
                    <div
                      className={cn(
                        "flex-1 p-4 rounded-2xl border transition-colors duration-200",
                        "bg-white/[0.025] border-white/5",
                        styles.card
                      )}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[11px] font-mono text-white/30">
                            {session.startTime}–{session.endTime}
                          </span>
                          <span className={cn("text-[9px] font-bold uppercase px-2 py-0.5 rounded-lg border", styles.badge, styles.badgeText)}>
                            {(session.type || "").replace("_", " ")}
                          </span>
                          {session.tool && (
                            <span className="text-[10px] text-white/25">
                              {TOOL_ICONS[session.tool] || "💡"} {session.tool}
                            </span>
                          )}
                          {session.energyLevel && (
                            <span className={cn(
                              "text-[9px] px-1.5 py-0.5 rounded-md font-medium",
                              session.energyLevel === "high" ? "text-emerald-400/60 bg-emerald-400/5" :
                              session.energyLevel === "medium" ? "text-amber-400/60 bg-amber-400/5" :
                              "text-red-400/60 bg-red-400/5"
                            )}>
                              {session.energyLevel} energy
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-white/20 shrink-0 font-mono">{session.durationMinutes}m</span>
                      </div>

                      <h4 className="text-sm font-semibold text-white/85 mb-1.5">{session.title}</h4>
                      <p className="text-xs text-white/45 leading-relaxed">{session.accomplishment}</p>

                      {session.tags?.length > 0 && (
                        <div className="flex gap-1.5 mt-2.5 flex-wrap">
                          {session.tags.map((tag: string) => (
                            <span key={tag} className="text-[9px] px-2 py-0.5 rounded-lg bg-white/5 text-white/25 border border-white/5">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Right insights panel */}
          <div className="w-[260px] shrink-0 border-l border-white/5 p-5 overflow-y-auto space-y-4">
            <div className="flex items-center gap-2">
              <Target size={12} className="text-white/25" />
              <span className="text-[10px] text-white/25 font-medium uppercase tracking-wider">Flippo Insights</span>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-2.5">
              <div className="text-[10px] text-white/25 uppercase tracking-wider font-medium">Momentum</div>
              <p className="text-xs text-white/55 leading-relaxed">{activeData?.momentumInsight || "—"}</p>
            </div>

            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/12 space-y-2.5">
              <div className="flex items-center gap-1.5">
                <TrendingUp size={11} className="text-emerald-400/60" />
                <div className="text-[10px] text-emerald-400/60 uppercase tracking-wider font-medium">Tomorrow</div>
              </div>
              <p className="text-xs text-white/45 leading-relaxed">{activeData?.tomorrowSuggestion || "—"}</p>
            </div>

            {/* Breakdown */}
            {activeData?.sessions?.length > 0 && (
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-3">
                <div className="text-[10px] text-white/25 uppercase tracking-wider font-medium">Breakdown</div>
                {(["deep_work", "shallow_work", "break", "distraction"] as const).map((type) => {
                  const items = activeData.sessions.filter((s: any) => s.type === type);
                  if (!items.length) return null;
                  const mins = items.reduce((a: number, s: any) => a + (s.durationMinutes || 0), 0);
                  const styles = TYPE_STYLES[type];
                  return (
                    <div key={type} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <div className={cn("w-1.5 h-1.5 rounded-full", styles.dot)} />
                          <span className="text-[11px] text-white/40 capitalize">{type.replace("_", " ")}</span>
                        </div>
                        <span className="text-[11px] text-white/30 font-mono">{mins}m</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((mins / (activeData.totalFocusMinutes || 1)) * 100, 100)}%` }}
                          transition={{ duration: 0.8, delay: 0.2 }}
                          className={cn("h-full rounded-full", styles.dot)}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
