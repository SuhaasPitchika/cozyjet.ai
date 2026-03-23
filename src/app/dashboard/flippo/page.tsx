"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { BarChart2, Loader2, Zap, TrendingUp } from "lucide-react";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, addDoc, serverTimestamp, query, orderBy, limit } from "firebase/firestore";
import { flippoAnalyzeProductivityClient } from "@/ai/client";
import { cn } from "@/lib/utils";

export default function FlippoPage() {
  const { user } = useUser();
  const db = useFirestore();
  const [isGenerating, setIsGenerating] = useState(false);

  const sessionsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(db, "users", user.uid, "productivitySessions"),
      orderBy("createdAt", "desc"),
      limit(1)
    );
  }, [db, user]);

  const { data: sessions } = useCollection(sessionsQuery);
  const latest = sessions?.[0];

  const handleGenerate = async () => {
    if (!user || isGenerating) return;
    setIsGenerating(true);
    try {
      const result = await flippoAnalyzeProductivityClient({
        activitySummaries: [
          { startTime: "09:00", endTime: "10:30", description: "Strategic UI architecture and component logic" },
          { startTime: "10:30", endTime: "10:35", description: "Brief comms catchup" },
          { startTime: "10:35", endTime: "12:00", description: "Backend integration and AI flow tuning" },
        ],
      });
      await addDoc(collection(db, "users", user.uid, "productivitySessions"), {
        userId: user.uid,
        score: result.deepWorkScore,
        insights: result.productivityInsights,
        timeline: result.timeline.map((e: any) => ({
          time: e.timestamp,
          app: e.type === "deep_work" ? "IDE" : "Browser",
          action: e.description,
          type: e.type,
        })),
        createdAt: serverTimestamp(),
      });
    } catch (e) {
      console.error("Flippo error:", e);
    } finally {
      setIsGenerating(false);
    }
  };

  const score = latest?.score ?? null;
  const scoreColor = score === null ? "text-white/20" : score >= 70 ? "text-emerald-400" : score >= 40 ? "text-amber-400" : "text-red-400";

  return (
    <div className="h-full bg-[#0f0f0f] p-8 flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
            <span className="text-[11px] text-white/30 font-medium uppercase tracking-widest">Productivity Agent</span>
          </div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Flippo</h1>
          <p className="text-sm text-white/40 mt-1">Deep work analysis & timeline intelligence</p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-black text-sm font-medium hover:bg-white/90 disabled:opacity-40 transition-all"
        >
          {isGenerating ? (
            <><Loader2 size={14} className="animate-spin" /><span>Analyzing...</span></>
          ) : (
            <><Zap size={14} /><span>Analyze Session</span></>
          )}
        </button>
      </div>

      {/* Score + timeline */}
      <div className="grid grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Score card */}
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <TrendingUp size={14} className="text-white/30" />
            <span className="text-xs text-white/30 font-medium uppercase tracking-wider">Deep Work Score</span>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <div className={cn("text-6xl font-bold tabular-nums", scoreColor)}>
              {score ?? "--"}
            </div>
            <div className="text-xs text-white/30">out of 100</div>
            {score !== null && (
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${score}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={cn(
                    "h-full rounded-full",
                    score >= 70 ? "bg-emerald-500" : score >= 40 ? "bg-amber-500" : "bg-red-500"
                  )}
                />
              </div>
            )}
          </div>

          <div className="p-4 rounded-xl bg-white/5">
            <div className="text-[10px] text-white/30 font-medium uppercase tracking-wider mb-2">Flippo Insight</div>
            <p className="text-xs text-white/50 leading-relaxed italic">
              {latest?.insights ?? "Run an analysis to see insights."}
            </p>
          </div>
        </div>

        {/* Timeline */}
        <div className="col-span-2 rounded-2xl border border-white/5 bg-white/[0.02] p-6 flex flex-col gap-4 overflow-hidden">
          <div className="flex items-center gap-2">
            <BarChart2 size={14} className="text-white/30" />
            <span className="text-xs text-white/30 font-medium uppercase tracking-wider">Focus Timeline</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {latest?.timeline?.length ? (
              latest.timeline.map((event: any, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-4 p-3.5 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/5 transition-colors"
                >
                  <div
                    className={cn(
                      "w-1.5 h-1.5 rounded-full shrink-0",
                      event.type === "deep_work" ? "bg-emerald-500" : event.type === "distraction" ? "bg-red-500" : "bg-white/20"
                    )}
                  />
                  <span className="text-[10px] font-mono text-white/30 w-12 shrink-0">{event.time}</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs text-white/70 truncate block">{event.app}: {event.action}</span>
                  </div>
                  <span
                    className={cn(
                      "text-[9px] font-bold uppercase px-2 py-0.5 rounded-md shrink-0",
                      event.type === "deep_work"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : event.type === "distraction"
                        ? "bg-red-500/10 text-red-400"
                        : "bg-white/5 text-white/30"
                    )}
                  >
                    {event.type}
                  </span>
                </motion.div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center gap-3">
                <BarChart2 size={28} className="text-white/10" />
                <p className="text-xs text-white/20">No session data yet. Hit Analyze Session.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
