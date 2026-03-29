"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, TrendingUp, Calendar, Clock, AlertTriangle,
  BarChart3, Sparkles, CheckCircle2, ChevronRight,
} from "lucide-react";
import { useDashboardStore } from "@/hooks/use-dashboard-store";

interface ContentSuggestion {
  id: string;
  title: string;
  platform: string;
  type: string;
  rationale: string;
  optimal_time: string;
  estimated_reach: string;
  seed_ref?: string;
}

interface TrendAlert {
  topic: string;
  relevance: string;
  urgency: string;
}

interface SnooksData {
  week_summary?: string;
  suggestions?: ContentSuggestion[];
  trend_alerts?: TrendAlert[];
  calendar_health?: { score: number; gaps: string[]; recommendation: string };
  posting_times?: Record<string, string>;
}

const PLATFORM_COLORS: Record<string, string> = {
  LinkedIn: "#0077b5",
  Twitter: "#1da1f2",
  Instagram: "#e1306c",
  All: "#6366f1",
};

const TYPE_COLORS: Record<string, string> = {
  educational: "#3b82f6",
  "behind-the-scenes": "#8b5cf6",
  milestone: "#10b981",
  tip: "#f59e0b",
  story: "#ec4899",
  trending: "#ef4444",
};

const REACH_CONFIG: Record<string, { label: string; color: string }> = {
  Low: { label: "Low", color: "#6b7280" },
  Medium: { label: "Medium", color: "#f59e0b" },
  High: { label: "High", color: "#10b981" },
  Viral: { label: "Viral 🔥", color: "#ef4444" },
};

const URGENCY_COLORS: Record<string, string> = {
  "Act now": "#ef4444",
  "This week": "#f59e0b",
  Monitor: "#6b7280",
};

function GlassCard({ children, className = "", style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`rounded-2xl ${className}`}
      style={{
        background: "rgba(255,255,255,0.06)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        border: "1px solid rgba(255,255,255,0.12)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.08)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  const r = 22;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 75 ? "#10b981" : score >= 50 ? "#6366f1" : "#ec4899";
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" className="shrink-0">
      <circle cx="28" cy="28" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
      <motion.circle
        cx="28" cy="28" r={r} fill="none" stroke={color}
        strokeWidth="4" strokeLinecap="round"
        strokeDasharray={`${circ}`}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - dash }}
        transition={{ duration: 1.4, ease: "easeOut", delay: 0.3 }}
        style={{ transformOrigin: "28px 28px", transform: "rotate(-90deg)" }}
      />
      <text x="28" y="33" textAnchor="middle" fontSize="12" fontWeight="800" fill="rgba(255,255,255,0.8)">{score}</text>
    </svg>
  );
}

function SuggestionCard({ item, index }: { item: ContentSuggestion; index: number }) {
  const platColor = PLATFORM_COLORS[item.platform] || "#6366f1";
  const typeColor = TYPE_COLORS[item.type] || "#6366f1";
  const reach = REACH_CONFIG[item.estimated_reach] || REACH_CONFIG.Medium;

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4 }}
    >
      <GlassCard className="p-4 hover:border-white/20 transition-colors cursor-default">
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center gap-2 pt-0.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-[10px] font-bold text-white"
              style={{ background: `${platColor}20`, border: `1px solid ${platColor}40`, color: platColor }}
            >
              {item.platform === "LinkedIn" ? "in" : item.platform === "Twitter" ? "𝕏" : item.platform === "Instagram" ? "IG" : "✦"}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="text-[13px] font-semibold text-white/85 leading-tight">{item.title}</h3>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: `${typeColor}18`, color: typeColor }}>
                  {item.type}
                </span>
                <span className="text-[9px] font-bold" style={{ color: reach.color }}>{reach.label}</span>
              </div>
            </div>
            <p className="text-[11px] text-white/40 leading-relaxed mb-2.5">{item.rationale}</p>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Clock size={10} className="text-white/25" />
                <span className="text-[10px] text-white/35">{item.optimal_time}</span>
              </div>
              {item.seed_ref && (
                <div className="flex items-center gap-1">
                  <Sparkles size={10} className="text-indigo-400/50" />
                  <span className="text-[10px] text-indigo-400/60">from Skippy</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

export default function SnooksPage() {
  const { assistanceMsg, skippyContext } = useDashboardStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [data, setData] = useState<SnooksData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"suggestions" | "trends" | "timing">("suggestions");
  const [dateLabel, setDateLabel] = useState("This week");

  useEffect(() => {
    const d = new Date();
    const end = new Date(d);
    end.setDate(d.getDate() + 6);
    const fmt = (dt: Date) => dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    setDateLabel(`${fmt(d)} – ${fmt(end)}`);
  }, []);

  const buildSkippyCtx = () => {
    if (skippyContext) {
      const parts = [];
      if (skippyContext.signal) parts.push(skippyContext.signal);
      if (skippyContext.activity) parts.push(skippyContext.activity);
      return parts.join(". ");
    }
    return assistanceMsg || "";
  };

  const generate = async () => {
    setIsGenerating(true);
    setData(null);
    setErrorMsg(null);

    const skippyCtx = buildSkippyCtx();
    const userPrompt = skippyCtx
      ? `Based on my workspace activity: "${skippyCtx}". Plan my content week for ${dateLabel}. Generate a complete content strategy with 6 post suggestions, trend alerts, and calendar health analysis.`
      : `I am a solopreneur building an AI SaaS product. Plan my content week for ${dateLabel}. Generate a complete content strategy with 6 post suggestions for LinkedIn, Twitter, and Instagram, trend alerts relevant to my niche, and calendar health analysis. Make the suggestions specific, actionable, and high-quality.`;

    try {
      const res = await fetch("/api/ai/snooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userPrompt, userContext: { date: dateLabel, role: "solopreneur", niche: "AI/SaaS" }, skippyContext: skippyCtx }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "API error");
      }

      const json = await res.json();

      if (json.error) throw new Error(json.error);

      const parsed: SnooksData = {
        week_summary: json.week_summary || json.responseText || "",
        suggestions: Array.isArray(json.suggestions) ? json.suggestions : [],
        trend_alerts: Array.isArray(json.trend_alerts) ? json.trend_alerts : [],
        calendar_health: json.calendar_health || null,
        posting_times: json.posting_times || null,
      };

      setData(parsed);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      if (message.includes("API key")) {
        setErrorMsg("OPEN_ROUTER API key not configured. Add it in environment secrets.");
      } else {
        setErrorMsg(message || "Something went wrong. Please try again.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const suggestions = data?.suggestions || [];
  const trendAlerts = data?.trend_alerts || [];
  const health = data?.calendar_health;
  const postingTimes = data?.posting_times;

  return (
    <div
      className="h-full flex flex-col overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0a0a1a 0%, #0f0c29 35%, #1a1040 65%, #0d0d20 100%)" }}
    >
      {/* Ambient orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 right-20 w-72 h-72 rounded-full opacity-15" style={{ background: "radial-gradient(circle, #8b5cf6 0%, transparent 70%)", filter: "blur(60px)" }} />
        <div className="absolute bottom-10 left-10 w-64 h-64 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #6366f1 0%, transparent 70%)", filter: "blur(50px)" }} />
      </div>

      {/* Header */}
      <div
        className="relative z-10 px-8 py-5 border-b flex items-center justify-between shrink-0"
        style={{ borderColor: "rgba(255,255,255,0.06)", backdropFilter: "blur(20px)", background: "rgba(255,255,255,0.03)" }}
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
            <span className="text-[10px] text-white/25 font-semibold uppercase tracking-widest">Content Strategist · Snooks</span>
          </div>
          <h1 className="text-lg font-bold text-white/85 tracking-tight">Weekly Strategy</h1>
          <p className="text-[11px] text-white/30 mt-0.5">{dateLabel}</p>
        </div>
        <div className="flex items-center gap-3">
          {buildSkippyCtx() && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl" style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}>
              <Zap size={10} className="text-indigo-400" />
              <span className="text-[9px] text-indigo-400 font-medium">Skippy context</span>
            </div>
          )}
          {data && (
            <button onClick={() => setData(null)} className="text-[11px] text-white/20 hover:text-white/50 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5">
              Clear
            </button>
          )}
          <motion.button
            onClick={generate}
            disabled={isGenerating}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)", boxShadow: "0 4px 16px rgba(124,58,237,0.4)" }}
          >
            {isGenerating ? (
              <><motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}><Zap size={14} /></motion.div><span>Planning…</span></>
            ) : (
              <><Sparkles size={14} /><span>{data ? "Replan Week" : "Plan My Week"}</span></>
            )}
          </motion.button>
        </div>
      </div>

      <div className="relative z-10 flex-1 overflow-hidden flex flex-col">
        {/* Error */}
        {errorMsg && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="mx-8 mt-4 px-4 py-3 rounded-xl text-sm text-red-400 font-medium"
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
            {errorMsg}
          </motion.div>
        )}

        {/* Empty state */}
        {!data && !isGenerating && !errorMsg && (
          <div className="flex-1 flex flex-col items-center justify-center gap-8 text-center px-8">
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto"
              style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.15)", backdropFilter: "blur(20px)" }}>
              <Calendar size={36} className="text-violet-400/60" />
            </motion.div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white/50">Your week, planned.</h2>
              <p className="text-sm text-white/25 max-w-sm leading-relaxed">
                {buildSkippyCtx()
                  ? "Skippy has workspace context. Snooks will build a personalised content week around your actual work."
                  : "Snooks looks at what content you should be posting this week, when to post it, and what trending topics you can own."}
              </p>
              {buildSkippyCtx() && (
                <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs text-violet-400 font-medium mt-2"
                  style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.15)" }}>
                  📡 &quot;{buildSkippyCtx().slice(0, 70)}{buildSkippyCtx().length > 70 ? "…" : ""}&quot;
                </div>
              )}
            </div>
            <motion.button onClick={generate} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-7 py-3.5 rounded-2xl text-sm font-semibold text-white"
              style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)", boxShadow: "0 8px 24px rgba(124,58,237,0.4)" }}>
              <Sparkles size={16} /> Plan My Content Week
            </motion.button>
          </div>
        )}

        {/* Loading skeleton */}
        {isGenerating && (
          <div className="flex-1 px-8 py-6 space-y-4 overflow-auto">
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[0,1,2].map((i) => (
                <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }} />
              ))}
            </div>
            {[0,1,2,3,4,5].map((i) => (
              <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }} />
            ))}
          </div>
        )}

        {/* Data view */}
        {data && !isGenerating && (
          <div className="flex-1 overflow-hidden flex flex-col">
            {/* Week summary + stats */}
            {(data.week_summary || health) && (
              <div className="px-8 pt-5 pb-3 flex items-start gap-4">
                {health && (
                  <GlassCard className="flex items-center gap-3 p-3 shrink-0">
                    <ScoreRing score={health.score} />
                    <div>
                      <p className="text-[11px] font-bold text-white/70">Calendar Health</p>
                      <p className="text-[10px] text-white/35 mt-0.5 max-w-[140px] leading-relaxed">{health.recommendation}</p>
                    </div>
                  </GlassCard>
                )}
                {data.week_summary && (
                  <GlassCard className="flex-1 p-3">
                    <p className="text-[10px] font-bold text-violet-400 uppercase tracking-wider mb-1">This Week&apos;s Strategy</p>
                    <p className="text-[12px] text-white/60 leading-relaxed">{data.week_summary}</p>
                  </GlassCard>
                )}
              </div>
            )}

            {/* Tabs */}
            <div className="px-8 py-2 flex gap-1 border-b shrink-0" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              {(["suggestions", "trends", "timing"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold transition-all capitalize"
                  style={activeTab === tab ? { background: "rgba(124,58,237,0.2)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.3)" } : { color: "rgba(255,255,255,0.3)", border: "1px solid transparent" }}
                >
                  {tab === "suggestions" && <><BarChart3 size={12} /> Posts ({suggestions.length})</>}
                  {tab === "trends" && <><TrendingUp size={12} /> Trends ({trendAlerts.length})</>}
                  {tab === "timing" && <><Clock size={12} /> Best Times</>}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-auto px-8 py-5 space-y-3">
              <AnimatePresence mode="wait">
                {activeTab === "suggestions" && (
                  <motion.div key="suggestions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                    {suggestions.map((item, i) => <SuggestionCard key={item.id || i} item={item} index={i} />)}
                    {suggestions.length === 0 && <p className="text-white/25 text-sm text-center py-8">No suggestions generated.</p>}
                    {health?.gaps && health.gaps.length > 0 && (
                      <GlassCard className="p-3 mt-2">
                        <div className="flex items-center gap-2 mb-1.5">
                          <AlertTriangle size={11} className="text-amber-400" />
                          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Calendar Gaps</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {health.gaps.map((gap, i) => (
                            <span key={i} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "rgba(245,158,11,0.1)", color: "#fbbf24", border: "1px solid rgba(245,158,11,0.15)" }}>{gap}</span>
                          ))}
                        </div>
                      </GlassCard>
                    )}
                  </motion.div>
                )}

                {activeTab === "trends" && (
                  <motion.div key="trends" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                    {trendAlerts.map((alert, i) => (
                      <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                        <GlassCard className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1.5">
                                <TrendingUp size={12} className="text-pink-400" />
                                <span className="text-[13px] font-semibold text-white/85">{alert.topic}</span>
                              </div>
                              <p className="text-[11px] text-white/40 leading-relaxed">{alert.relevance}</p>
                            </div>
                            <span className="shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: `${URGENCY_COLORS[alert.urgency] || "#6b7280"}18`, color: URGENCY_COLORS[alert.urgency] || "#6b7280", border: `1px solid ${URGENCY_COLORS[alert.urgency] || "#6b7280"}30` }}>
                              {alert.urgency}
                            </span>
                          </div>
                        </GlassCard>
                      </motion.div>
                    ))}
                    {trendAlerts.length === 0 && <p className="text-white/25 text-sm text-center py-8">No trend alerts detected.</p>}
                  </motion.div>
                )}

                {activeTab === "timing" && (
                  <motion.div key="timing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                    {postingTimes ? (
                      Object.entries(postingTimes).map(([platform, timing], i) => (
                        <motion.div key={platform} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                          <GlassCard className="p-4 flex items-center gap-4">
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-[11px] font-bold text-white"
                              style={{ background: `${PLATFORM_COLORS[platform] || "#6366f1"}20`, border: `1px solid ${PLATFORM_COLORS[platform] || "#6366f1"}40`, color: PLATFORM_COLORS[platform] || "#6366f1" }}
                            >
                              {platform === "LinkedIn" ? "in" : platform === "Twitter" ? "𝕏" : "IG"}
                            </div>
                            <div>
                              <p className="text-[13px] font-semibold text-white/80">{platform}</p>
                              <p className="text-[11px] text-white/35 mt-0.5">{timing}</p>
                            </div>
                            <ChevronRight size={14} className="ml-auto text-white/15" />
                          </GlassCard>
                        </motion.div>
                      ))
                    ) : (
                      <div className="space-y-3">
                        {[{ platform: "LinkedIn", time: "Best: Tuesday–Thursday 8–10am" }, { platform: "Twitter", time: "Best: Mon–Fri 9am, 12pm, 5pm" }, { platform: "Instagram", time: "Best: Tuesday–Friday 11am–1pm" }].map((pt, i) => (
                          <GlassCard key={pt.platform} className="p-4 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[11px] font-bold" style={{ background: `${PLATFORM_COLORS[pt.platform]}20`, color: PLATFORM_COLORS[pt.platform] }}>
                              {pt.platform === "LinkedIn" ? "in" : pt.platform === "Twitter" ? "𝕏" : "IG"}
                            </div>
                            <div>
                              <p className="text-[13px] font-semibold text-white/80">{pt.platform}</p>
                              <p className="text-[11px] text-white/35">{pt.time}</p>
                            </div>
                          </GlassCard>
                        ))}
                      </div>
                    )}
                    <GlassCard className="p-4 mt-2">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 size={12} className="text-emerald-400" />
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Pro tip</span>
                      </div>
                      <p className="text-[11px] text-white/40 leading-relaxed">
                        Post at the beginning of the optimal window, not the end. Early posts get more algorithm boost as the platform tests their reach.
                      </p>
                    </GlassCard>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
