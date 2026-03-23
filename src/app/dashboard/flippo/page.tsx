"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart2, Loader2, Zap, TrendingUp, Clock, Target, ArrowRight, Sparkles } from "lucide-react";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, addDoc, serverTimestamp, query, orderBy, limit } from "firebase/firestore";
import { cn } from "@/lib/utils";
import { useDashboardStore } from "@/hooks/use-dashboard-store";

const SAMPLE_ACTIVITIES = [
  { startTime: "09:00", endTime: "10:30", description: "Worked on the CozyJet dashboard — refactored sidebar layout and fixed glassmorphism styles across 8 components" },
  { startTime: "10:30", endTime: "10:35", description: "Checked Slack messages, reviewed 2 PRs from team" },
  { startTime: "10:35", endTime: "12:00", description: "Deep focus on OpenRouter API integration — built 4 backend routes and tested Skippy chat endpoint" },
  { startTime: "12:00", endTime: "12:30", description: "Lunch break" },
  { startTime: "12:30", endTime: "14:15", description: "Flippo timeline UI redesign — implemented napkin.ai-style layout with session cards and score visualization" },
  { startTime: "14:15", endTime: "14:20", description: "Checked Twitter notifications briefly" },
  { startTime: "14:20", endTime: "15:30", description: "Snooks marketing agent — rewrote viral content prompts, added SEO hook generation and Twitter thread format" },
];

const TYPE_STYLES: Record<string, { dot: string; badge: string; badgeText: string }> = {
  deep_work: { dot: "bg-emerald-400", badge: "bg-emerald-500/10 border border-emerald-500/20", badgeText: "text-emerald-400" },
  shallow_work: { dot: "bg-amber-400", badge: "bg-amber-500/10 border border-amber-500/20", badgeText: "text-amber-400" },
  break: { dot: "bg-blue-400", badge: "bg-blue-500/10 border border-blue-500/20", badgeText: "text-blue-400" },
  distraction: { dot: "bg-red-400", badge: "bg-red-500/10 border border-red-500/20", badgeText: "text-red-400" },
};

const TOOL_ICONS: Record<string, string> = {
  VSCode: "⌨️", Browser: "🌐", Terminal: "💻", Figma: "🎨", GitHub: "🔗", Notion: "📝", Meeting: "👥",
};

function EmptyState({ onGenerate, isGenerating }: { onGenerate: () => void; isGenerating: boolean }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-8 p-12">
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-2">
          <BarChart2 size={28} className="text-white/20" />
        </div>
        <h2 className="text-xl font-semibold text-white">No Timeline Yet</h2>
        <p className="text-sm text-white/40 max-w-xs leading-relaxed">
          Generate your first productivity timeline. Flippo will analyze your session and turn it into structured insights.
        </p>
      </div>

      <button
        onClick={onGenerate}
        disabled={isGenerating}
        className="group flex items-center gap-3 px-8 py-4 rounded-2xl bg-white text-black font-semibold hover:bg-white/90 disabled:opacity-40 transition-all shadow-lg"
      >
        {isGenerating ? (
          <><Loader2 size={16} className="animate-spin" /><span>Analyzing Session...</span></>
        ) : (
          <>
            <Sparkles size={16} />
            <span>Generate Timeline</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </button>

      <div className="grid grid-cols-3 gap-4 w-full max-w-md">
        {[
          { icon: "🔍", label: "Pattern Detection", desc: "Identifies deep work vs distractions" },
          { icon: "📊", label: "Score Engine", desc: "0-100 deep work quality rating" },
          { icon: "💡", label: "Smart Insights", desc: "Actionable productivity improvements" },
        ].map((f) => (
          <div key={f.label} className="p-4 rounded-xl bg-white/[0.03] border border-white/5 text-center space-y-1.5">
            <div className="text-lg">{f.icon}</div>
            <div className="text-xs font-medium text-white/60">{f.label}</div>
            <div className="text-[10px] text-white/30">{f.desc}</div>
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
          skippyContext: assistanceMsg || "",
        }),
      });
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      setGeneratedData(data);
      await addDoc(collection(db, "users", user.uid, "productivitySessions"), {
        userId: user.uid,
        score: data.deepWorkScore ?? 0,
        insights: data.momentumInsight ?? "",
        topAchievement: data.topAchievement ?? "",
        rawData: JSON.stringify(data),
        createdAt: serverTimestamp(),
      });
    } catch (e) {
      console.error("Timeline error:", e);
    } finally {
      setIsGenerating(false);
    }
  };

  const score = activeData?.deepWorkScore ?? null;
  const scoreColor = score === null ? "text-white/20" : score >= 70 ? "text-emerald-400" : score >= 40 ? "text-amber-400" : "text-red-400";

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
            {isGenerating ? <><Loader2 size={13} className="animate-spin" /><span>Analyzing...</span></> : <><Zap size={13} /><span>Regenerate</span></>}
          </button>
        )}
      </div>

      {!hasData ? (
        <EmptyState onGenerate={handleGenerate} isGenerating={isGenerating} />
      ) : (
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Stats row */}
          <div className="px-8 py-4 grid grid-cols-4 gap-4 border-b border-white/5 shrink-0">
            <div className="rounded-xl bg-white/[0.03] border border-white/5 p-4">
              <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Deep Work Score</div>
              <div className={cn("text-2xl font-bold tabular-nums", scoreColor)}>{score ?? "--"}</div>
              {score !== null && (
                <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className={cn("h-full rounded-full", score >= 70 ? "bg-emerald-500" : score >= 40 ? "bg-amber-500" : "bg-red-500")}
                  />
                </div>
              )}
            </div>
            <div className="rounded-xl bg-white/[0.03] border border-white/5 p-4">
              <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Focus Time</div>
              <div className="text-2xl font-bold text-white">
                {Math.floor((activeData?.totalFocusMinutes || 0) / 60)}h {(activeData?.totalFocusMinutes || 0) % 60}m
              </div>
            </div>
            <div className="rounded-xl bg-white/[0.03] border border-white/5 p-4 col-span-2">
              <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Top Achievement</div>
              <div className="text-xs text-white/70 leading-relaxed line-clamp-2">{activeData?.topAchievement || "—"}</div>
            </div>
          </div>

          {/* Timeline + insight */}
          <div className="flex-1 overflow-hidden flex gap-0">
            {/* Timeline scroll */}
            <div className="flex-1 overflow-y-auto px-8 py-5 space-y-3">
              <div className="flex items-center gap-2 mb-4">
                <Clock size={13} className="text-white/30" />
                <span className="text-xs text-white/30 font-medium uppercase tracking-wider">Session Timeline</span>
              </div>

              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-4 top-0 bottom-0 w-px bg-white/5" />

                {(activeData?.sessions || []).map((session: any, i: number) => {
                  const styles = TYPE_STYLES[session.type] || TYPE_STYLES.shallow_work;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06, duration: 0.4 }}
                      className="relative pl-10 mb-3"
                    >
                      {/* Dot */}
                      <div className={cn("absolute left-[13px] top-4 w-2.5 h-2.5 rounded-full", styles.dot)}
                        style={{ boxShadow: `0 0 8px 2px ${styles.dot.includes('emerald') ? 'rgba(52,211,153,0.3)' : 'rgba(251,191,36,0.3)'}` }}
                      />

                      <div
                        className="p-4 rounded-2xl hover:bg-white/[0.04] transition-colors cursor-default"
                        style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)" }}
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-mono text-white/30">{session.startTime}–{session.endTime}</span>
                            <span className={cn("text-[9px] font-bold uppercase px-2 py-0.5 rounded-md", styles.badge, styles.badgeText)}>
                              {session.type?.replace("_", " ")}
                            </span>
                            {session.tool && (
                              <span className="text-[10px] text-white/25">{TOOL_ICONS[session.tool] || "💡"} {session.tool}</span>
                            )}
                          </div>
                          <span className="text-[10px] text-white/20 shrink-0">{session.durationMinutes}m</span>
                        </div>

                        <h4 className="text-sm font-semibold text-white/80 mb-1">{session.title}</h4>
                        <p className="text-xs text-white/45 leading-relaxed">{session.accomplishment}</p>

                        {session.tags?.length > 0 && (
                          <div className="flex gap-1.5 mt-2 flex-wrap">
                            {session.tags.map((tag: string) => (
                              <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-md bg-white/5 text-white/25">{tag}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Right panel: Insights */}
            <div className="w-72 shrink-0 border-l border-white/5 p-6 overflow-y-auto space-y-5">
              <div className="flex items-center gap-2">
                <Target size={13} className="text-white/30" />
                <span className="text-xs text-white/30 font-medium uppercase tracking-wider">Flippo Insights</span>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-2">
                <div className="text-[10px] text-white/30 uppercase tracking-wider font-medium">Momentum Analysis</div>
                <p className="text-xs text-white/55 leading-relaxed">{activeData?.momentumInsight || "Run a session to see insights."}</p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/15 space-y-2">
                <div className="flex items-center gap-1.5">
                  <TrendingUp size={11} className="text-emerald-400" />
                  <div className="text-[10px] text-emerald-400/70 uppercase tracking-wider font-medium">Tomorrow</div>
                </div>
                <p className="text-xs text-white/50 leading-relaxed">{activeData?.tomorrowSuggestion || "—"}</p>
              </div>

              {/* Session type breakdown */}
              {activeData?.sessions?.length > 0 && (
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-3">
                  <div className="text-[10px] text-white/30 uppercase tracking-wider font-medium">Session Breakdown</div>
                  {(["deep_work", "shallow_work", "break", "distraction"] as const).map((type) => {
                    const count = activeData.sessions.filter((s: any) => s.type === type).length;
                    if (!count) return null;
                    const styles = TYPE_STYLES[type];
                    return (
                      <div key={type} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={cn("w-1.5 h-1.5 rounded-full", styles.dot)} />
                          <span className="text-[11px] text-white/40 capitalize">{type.replace("_", " ")}</span>
                        </div>
                        <span className="text-[11px] text-white/50 font-medium">{count}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
