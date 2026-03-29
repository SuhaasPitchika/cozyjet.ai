"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck, Cpu, Sparkles, ArrowRight, Github, FileText,
  Figma, Chrome, X, Zap, Eye, EyeOff,
} from "lucide-react";
import { useDashboardStore } from "@/hooks/use-dashboard-store";
import { useRouter } from "next/navigation";

interface ContentSeed {
  id: string;
  source: string;
  title: string;
  summary: string;
  platform_fit: string[];
}

const SOURCE_ICONS: Record<string, React.ReactNode> = {
  GitHub: <Github size={12} />,
  Notion: <FileText size={12} />,
  Figma: <Figma size={12} />,
  VSCode: <Cpu size={12} />,
  Browser: <Chrome size={12} />,
  Terminal: <Cpu size={12} />,
};

const SOURCE_COLORS: Record<string, string> = {
  GitHub: "#171717",
  Notion: "#374151",
  Figma: "#a259ff",
  VSCode: "#0078d4",
  Browser: "#4285f4",
  Terminal: "#10b981",
};

function GlowOrb({ active }: { active: boolean }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
      <motion.div
        animate={active ? { scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] } : { opacity: 0 }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-24 -left-24 w-96 h-96 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.35) 0%, transparent 70%)" }}
      />
      <motion.div
        animate={active ? { scale: [1.2, 1, 1.2], opacity: [0.2, 0.5, 0.2] } : { opacity: 0 }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(236,72,153,0.25) 0%, transparent 70%)" }}
      />
    </div>
  );
}

function SeedCard({ seed, index, onGenerate, onDismiss }: {
  seed: ContentSeed;
  index: number;
  onGenerate: (seed: ContentSeed) => void;
  onDismiss: (id: string) => void;
}) {
  const color = SOURCE_COLORS[seed.source] || "#6366f1";
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: -20, scale: 0.95 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="relative rounded-2xl overflow-hidden group"
      style={{
        background: "rgba(255,255,255,0.08)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        border: "1px solid rgba(255,255,255,0.14)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.1)",
      }}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <div
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-white"
              style={{ background: `${color}22`, border: `1px solid ${color}40` }}
            >
              <span style={{ color }}>{SOURCE_ICONS[seed.source] || <Cpu size={12} />}</span>
              <span className="text-[10px] font-semibold" style={{ color }}>{seed.source}</span>
            </div>
            <div className="flex gap-1">
              {seed.platform_fit?.map((p) => (
                <span
                  key={p}
                  className="text-[9px] font-medium px-1.5 py-0.5 rounded-full"
                  style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.45)" }}
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
          <button
            onClick={() => onDismiss(seed.id)}
            className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.07)" }}
          >
            <X size={11} className="text-white/40" />
          </button>
        </div>

        <h3 className="text-[13px] font-semibold text-white/90 leading-tight mb-1.5">{seed.title}</h3>
        <p className="text-[11px] text-white/50 leading-relaxed">{seed.summary}</p>

        <div className="mt-3 flex items-center gap-2">
          <motion.button
            onClick={() => onGenerate(seed)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow: "0 4px 12px rgba(99,102,241,0.4)" }}
          >
            <Sparkles size={11} />
            Generate Content
          </motion.button>
          <span className="text-[10px] text-white/20">→ sends to Meta</span>
        </div>
      </div>
    </motion.div>
  );
}

function HyperrealisticSwitch({ active, onToggle, isCapturing }: {
  active: boolean; onToggle: () => void; isCapturing: boolean;
}) {
  const [pressed, setPressed] = useState(false);
  return (
    <div className="flex flex-col items-center gap-5 select-none">
      <div className="relative">
        <motion.div
          animate={active ? {
            boxShadow: [
              "0 0 40px 10px rgba(99,102,241,0.4), 0 0 80px 30px rgba(99,102,241,0.15)",
              "0 0 60px 20px rgba(99,102,241,0.6), 0 0 120px 50px rgba(99,102,241,0.25)",
              "0 0 40px 10px rgba(99,102,241,0.4), 0 0 80px 30px rgba(99,102,241,0.15)",
            ]
          } : { boxShadow: "none" }}
          transition={{ duration: 2.5, repeat: Infinity }}
          className="rounded-full"
          style={{ padding: 20 }}
        >
          <motion.button
            onMouseDown={() => setPressed(true)}
            onMouseUp={() => { setPressed(false); if (!isCapturing) onToggle(); }}
            onMouseLeave={() => setPressed(false)}
            onTouchStart={() => setPressed(true)}
            onTouchEnd={() => { setPressed(false); if (!isCapturing) onToggle(); }}
            disabled={isCapturing}
            className="relative focus:outline-none cursor-pointer disabled:cursor-not-allowed"
            style={{
              width: 100, height: 100, borderRadius: "50%",
              background: active
                ? "radial-gradient(circle at 35% 35%, #818cf8, #6366f1 40%, #4338ca 75%, #312e81)"
                : pressed
                ? "radial-gradient(circle at 35% 35%, #d4d4d4, #b0b0b0 40%, #888 75%, #555)"
                : "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.25), rgba(255,255,255,0.08) 40%, rgba(255,255,255,0.04) 75%, transparent)",
              boxShadow: active
                ? "inset -3px -3px 10px rgba(0,0,0,0.4), inset 3px 3px 10px rgba(130,140,255,0.3), 0 6px 24px rgba(99,102,241,0.7), 0 0 0 2px rgba(99,102,241,0.5)"
                : pressed
                ? "inset 5px 5px 15px rgba(0,0,0,0.3), inset -2px -2px 6px rgba(255,255,255,0.1)"
                : "inset -5px -5px 15px rgba(0,0,0,0.2), inset 5px 5px 15px rgba(255,255,255,0.12), 0 0 0 1px rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.15)",
              transform: pressed ? "scale(0.96) translateY(2px)" : "scale(1) translateY(0)",
              transition: "all 0.15s cubic-bezier(0.34,1.56,0.64,1)",
            }}
          >
            {active && (
              <>
                <motion.div className="absolute inset-0 rounded-full" animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }} transition={{ duration: 2, repeat: Infinity }} style={{ background: "rgba(99,102,241,0.4)" }} />
                <motion.div className="absolute inset-0 rounded-full" animate={{ scale: [1, 1.8, 1], opacity: [0.3, 0, 0.3] }} transition={{ duration: 2, repeat: Infinity, delay: 0.4 }} style={{ background: "rgba(99,102,241,0.2)" }} />
              </>
            )}
            <div className="absolute inset-0 flex items-center justify-center">
              {active ? <Eye size={32} className="text-white/90" style={{ filter: "drop-shadow(0 0 8px rgba(255,255,255,0.8))" }} /> : <EyeOff size={28} className="text-white/50" />}
            </div>
            <div className="absolute top-3 left-3 rounded-full pointer-events-none" style={{ width: 24, height: 24, background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4), transparent 70%)" }} />
          </motion.button>
        </motion.div>
      </div>

      <div className="rounded-2xl px-5 py-2.5 flex items-center gap-2.5"
        style={{
          background: active ? "rgba(99,102,241,0.12)" : "rgba(255,255,255,0.05)",
          border: active ? "1px solid rgba(99,102,241,0.3)" : "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(12px)",
          transition: "all 0.4s ease",
        }}>
        <motion.div
          animate={{ scale: active ? [1, 1.5, 1] : 1, opacity: active ? 1 : 0.3 }}
          transition={{ duration: 1.4, repeat: active ? Infinity : 0 }}
          className="w-2 h-2 rounded-full"
          style={{ background: active ? "#6366f1" : "#666", boxShadow: active ? "0 0 10px rgba(99,102,241,0.9)" : "none" }}
        />
        <span className="text-xs font-bold uppercase tracking-[0.2em]"
          style={{ color: active ? "#818cf8" : "rgba(255,255,255,0.25)", transition: "color 0.4s ease" }}>
          {isCapturing ? "Capturing…" : active ? "Observer Active" : "Observer Off"}
        </span>
      </div>
    </div>
  );
}

const SAMPLE_SEEDS: ContentSeed[] = [
  { id: "s1", source: "GitHub", title: "JWT auth with refresh token support shipped", summary: "You shipped JWT authentication with refresh token support for your SaaS — a security implementation that junior developers struggle with and seniors love to learn.", platform_fit: ["LinkedIn", "Twitter"] },
  { id: "s2", source: "Notion", title: "Product roadmap for Q2 updated", summary: "You updated your product roadmap with 8 new features prioritized by user feedback. A behind-the-scenes look at how solo founders make tough trade-offs.", platform_fit: ["LinkedIn", "Instagram"] },
  { id: "s3", source: "Figma", title: "New dashboard UI component designed", summary: "You designed a glassmorphism dashboard component. The design decisions you made — contrast, blur depth, color — are exactly what designers want to see documented.", platform_fit: ["Twitter", "Instagram"] },
];

export default function SkippyPage() {
  const { skippyActive, setSkippyActive, setAssistanceMsg, setSkippyContext } = useDashboardStore();
  const router = useRouter();
  const [seeds, setSeeds] = useState<ContentSeed[]>([]);
  const [analysis, setAnalysis] = useState<Record<string, unknown> | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showSample, setShowSample] = useState(false);

  const captureAndAnalyze = useCallback(async () => {
    setIsCapturing(true);
    setApiError(null);
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { width: { ideal: 1920 }, height: { ideal: 1080 } } as MediaStreamConstraints["video"],
        audio: false,
      });
      const video = document.createElement("video");
      video.srcObject = stream;
      video.autoplay = true;
      await new Promise<void>((resolve) => {
        video.onloadedmetadata = () => { video.play(); setTimeout(resolve, 600); };
      });
      const canvas = document.createElement("canvas");
      canvas.width = Math.min(video.videoWidth || 1280, 1280);
      canvas.height = Math.round(canvas.width * ((video.videoHeight || 720) / (video.videoWidth || 1280)));
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      stream.getTracks().forEach((t) => t.stop());
      const dataUrl = canvas.toDataURL("image/jpeg", 0.75);
      const base64 = dataUrl.split(",")[1];

      const res = await fetch("/api/ai/screen-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mimeType: "image/jpeg" }),
      });
      const data = await res.json();

      if (data.error) {
        setApiError(data.error.includes("API key") ? "OpenRouter API key not configured. Add OPEN_ROUTER in Secrets." : data.error);
        setSkippyActive(false);
      } else if (data.analysis) {
        setAnalysis(data.analysis);
        setAssistanceMsg(data.analysis.signal || data.analysis.activity || "Screen analyzed");
        setSkippyContext({
          signal: data.analysis.signal,
          activity: data.analysis.activity,
          context: data.analysis.context,
          apps: data.analysis.apps,
          insights: data.analysis.insights,
          focus_score: data.analysis.focus_score,
        });
        if (Array.isArray(data.analysis.content_seeds) && data.analysis.content_seeds.length > 0) {
          setSeeds(data.analysis.content_seeds);
        } else {
          setShowSample(true);
        }
      }
    } catch (err: unknown) {
      const error = err as Error;
      if (error.name === "NotAllowedError") {
        setApiError("Screen access denied. Click the switch again and choose to share your screen.");
        setSkippyActive(false);
      } else {
        setApiError("Capture failed. Please try again.");
        setSkippyActive(false);
      }
    } finally {
      setIsCapturing(false);
    }
  }, [setAssistanceMsg, setSkippyActive, setSkippyContext]);

  const handleToggle = async () => {
    if (skippyActive) {
      setSkippyActive(false);
      setAnalysis(null);
      setApiError(null);
      setSeeds([]);
      setShowSample(false);
    } else {
      setSkippyActive(true);
      await captureAndAnalyze();
    }
  };

  const handleDismiss = (id: string) => {
    setSeeds((prev) => prev.filter((s) => s.id !== id));
    setShowSample(false);
  };

  const handleGenerate = (seed: ContentSeed) => {
    setAssistanceMsg(`Generate content for: ${seed.title}. Context: ${seed.summary}`);
    router.push("/dashboard/meta");
  };

  const displaySeeds = showSample ? SAMPLE_SEEDS : seeds;
  const hasFeed = displaySeeds.length > 0 || (analysis && !showSample);

  return (
    <div
      className="relative min-h-full flex overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #0f0c29 0%, #1a1040 40%, #0d1b3e 70%, #0a0a1a 100%)",
      }}
    >
      {/* Ambient background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #6366f1 0%, transparent 70%)", filter: "blur(60px)" }} />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full opacity-15" style={{ background: "radial-gradient(circle, #ec4899 0%, transparent 70%)", filter: "blur(50px)" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #8b5cf6 0%, transparent 70%)", filter: "blur(40px)" }} />
      </div>

      {/* Left panel — toggle + info */}
      <div className="relative z-10 w-72 shrink-0 flex flex-col items-center justify-start pt-10 px-6 gap-8 border-r" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
        {/* Header */}
        <div className="text-center space-y-1.5 w-full">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.2))", border: "1px solid rgba(99,102,241,0.3)", backdropFilter: "blur(12px)" }}>
              <Cpu size={13} className="text-indigo-400" />
            </div>
            <span className="text-[10px] text-white/30 font-semibold uppercase tracking-[0.3em]">Observer Agent</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Skippy</h1>
          <p className="text-[11px] text-white/35 leading-relaxed">
            Watches your workspace silently and extracts content seeds worth sharing on social media.
          </p>
        </div>

        <HyperrealisticSwitch active={skippyActive} onToggle={handleToggle} isCapturing={isCapturing} />

        {apiError && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="w-full px-4 py-3 rounded-2xl text-xs text-red-400 font-medium text-center"
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", backdropFilter: "blur(12px)" }}>
            {apiError}
          </motion.div>
        )}

        {isCapturing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl"
            style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", backdropFilter: "blur(12px)" }}>
            <div className="flex gap-1">
              {[0,1,2].map((i) => (
                <motion.div key={i} animate={{ opacity: [0.3,1,0.3], y: [0,-3,0] }} transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.18 }}
                  className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              ))}
            </div>
            <span className="text-[11px] font-medium text-indigo-300">Analyzing your screen…</span>
          </motion.div>
        )}

        {/* Analysis summary */}
        <AnimatePresence>
          {analysis && !isCapturing && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="w-full rounded-2xl p-4 space-y-2"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(20px) saturate(150%)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)" }}>
              <div className="flex items-center gap-1.5 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider">Live Analysis</span>
                {typeof analysis.focus_score === "number" && (
                  <span className="ml-auto text-[9px] font-semibold text-white/40">{analysis.focus_score as number}% focus</span>
                )}
              </div>
              {analysis.signal && <p className="text-[12px] font-semibold text-white/80">{analysis.signal as string}</p>}
              {analysis.activity && <p className="text-[11px] text-white/40 leading-relaxed">{analysis.activity as string}</p>}
              {Array.isArray(analysis.apps) && (analysis.apps as string[]).length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {(analysis.apps as string[]).slice(0, 4).map((app: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 rounded-full text-[9px] font-medium" style={{ background: "rgba(99,102,241,0.15)", color: "#818cf8" }}>{app}</span>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Privacy notice */}
        <div className="mt-auto w-full flex items-start gap-2.5 px-4 py-3 rounded-2xl"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(12px)" }}>
          <ShieldCheck size={12} className="text-white/20 mt-0.5 shrink-0" />
          <p className="text-[10px] text-white/25 leading-relaxed">
            Privacy-first. One screenshot, never video. PII blocked before leaving your device.
          </p>
        </div>
      </div>

      {/* Right panel — content seeds feed */}
      <div className="relative z-10 flex-1 flex flex-col min-w-0 p-6 gap-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-sm font-bold text-white/80">Content Seeds</h2>
            <p className="text-[11px] text-white/30 mt-0.5">
              {hasFeed ? `${displaySeeds.length} seed${displaySeeds.length !== 1 ? "s" : ""} ready — click Generate to send to Meta` : "Activate Skippy to generate content seeds from your workspace"}
            </p>
          </div>
          {showSample && (
            <span className="text-[10px] px-2.5 py-1 rounded-full font-medium" style={{ background: "rgba(245,158,11,0.12)", color: "#fbbf24", border: "1px solid rgba(245,158,11,0.2)" }}>
              Sample seeds
            </span>
          )}
        </div>

        {!hasFeed && !isCapturing && (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto"
              style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)", backdropFilter: "blur(20px)" }}
            >
              <Eye size={36} className="text-indigo-400/50" />
            </motion.div>
            <div>
              <p className="text-lg font-semibold text-white/40 mb-1">No seeds yet</p>
              <p className="text-[12px] text-white/20 max-w-xs leading-relaxed">
                Toggle Skippy to capture your screen. It will read your GitHub, Notion, Figma, VSCode activity and extract what&apos;s worth sharing.
              </p>
            </div>
            <button
              onClick={() => setShowSample(true)}
              className="text-[11px] text-indigo-400/60 hover:text-indigo-400 transition-colors underline underline-offset-2"
            >
              Preview sample seeds
            </button>
          </div>
        )}

        <AnimatePresence mode="popLayout">
          {displaySeeds.map((seed, i) => (
            <SeedCard key={seed.id} seed={seed} index={i} onGenerate={handleGenerate} onDismiss={handleDismiss} />
          ))}
        </AnimatePresence>

        {displaySeeds.length === 0 && hasFeed && !isCapturing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
              <Zap size={20} className="text-emerald-400" />
            </div>
            <p className="text-sm font-semibold text-white/50">All seeds processed</p>
            <p className="text-[11px] text-white/25">Activate Skippy again to capture new seeds</p>
          </motion.div>
        )}

        {analysis && displaySeeds.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="mt-2 flex items-center gap-2 px-4 py-2.5 rounded-xl self-start"
            style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)" }}>
            <ArrowRight size={11} className="text-emerald-400" />
            <span className="text-[10px] text-emerald-400 font-medium">Context live-shared with Snooks &amp; Meta</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}
