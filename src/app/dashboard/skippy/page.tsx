"use client";

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Zap, Activity, Eye, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboardStore } from "@/hooks/use-dashboard-store";

const CAPABILITY_ITEMS = [
  { label: "IDE Activity", desc: "VSCode, Cursor, Neovim tracking" },
  { label: "Browser Context", desc: "Tab titles, domain patterns" },
  { label: "Commit Detection", desc: "Git hooks + push signals" },
  { label: "PII Filtering", desc: "Zero-leak local redaction" },
];

function SkippyToggle({ active, onToggle }: { active: boolean; onToggle: () => void }) {
  return (
    <div className="flex flex-col items-center gap-6">
      <button
        onClick={onToggle}
        aria-label={active ? "Deactivate Skippy" : "Activate Skippy"}
        className="focus:outline-none"
        style={{ WebkitTapHighlightColor: "transparent" }}
      >
        {/* Outer neumorphic pill */}
        <div
          className="relative transition-all duration-700"
          style={{
            width: 220,
            height: 80,
            borderRadius: 40,
            background: active
              ? "#0a0a0a"
              : "#111111",
            boxShadow: active
              ? "inset 4px 4px 12px #000000, inset -4px -4px 12px #1a1a1a, 0 0 40px rgba(100,200,80,0.15)"
              : "8px 8px 24px #000000, -4px -4px 14px #1c1c1c, inset 1px 1px 3px #1a1a1a",
          }}
        >
          {/* Inner landscape scene */}
          <div
            className="absolute inset-1.5 rounded-[34px] overflow-hidden transition-all duration-700"
            style={{
              background: active
                ? "linear-gradient(135deg, #0d2410 0%, #1a4a10 40%, #2d7a1a 70%, #4aaa28 100%)"
                : "linear-gradient(135deg, #0a0a1a 0%, #0f0f2a 40%, #1a1a3a 70%, #0f1528 100%)",
            }}
          >
            {/* Night scene (OFF) */}
            {!active && (
              <>
                {/* Stars */}
                {[...Array(18)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.5 + i * 0.3, repeat: Infinity, delay: i * 0.1 }}
                    className="absolute rounded-full bg-white"
                    style={{
                      width: i % 3 === 0 ? 2 : 1,
                      height: i % 3 === 0 ? 2 : 1,
                      left: `${8 + i * 5}%`,
                      top: `${10 + (i % 5) * 14}%`,
                    }}
                  />
                ))}
                {/* Moon */}
                <div className="absolute top-2 right-16 w-5 h-5 rounded-full bg-white/80"
                  style={{ boxShadow: "0 0 8px 2px rgba(255,255,255,0.3)" }} />
                <div className="absolute top-1.5 right-14 w-5 h-5 rounded-full bg-[#0f0f2a]" />
                {/* Mountains */}
                <svg className="absolute bottom-0 left-0 right-0 w-full" viewBox="0 0 220 30" preserveAspectRatio="none">
                  <polygon points="0,30 40,8 80,22 120,5 160,18 200,10 220,30" fill="#1a1a3a" />
                  <polygon points="0,30 30,14 60,25 100,12 140,22 180,14 220,30" fill="#0f0f2a" opacity="0.8" />
                </svg>
              </>
            )}
            {/* Day/forest scene (ON) */}
            {active && (
              <>
                {/* Sun */}
                <motion.div
                  animate={{ scale: [1, 1.1, 1], opacity: [0.9, 1, 0.9] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute top-2 right-12 w-6 h-6 rounded-full bg-yellow-300"
                  style={{ boxShadow: "0 0 12px 4px rgba(255,220,0,0.5)" }}
                />
                {/* Sky gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-transparent" />
                {/* Trees */}
                <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 220 40" preserveAspectRatio="none">
                  <polygon points="20,40 30,8 40,40" fill="#1a4a10" />
                  <polygon points="50,40 63,5 76,40" fill="#2a6a18" />
                  <polygon points="90,40 100,12 110,40" fill="#1a5010" />
                  <polygon points="140,40 152,6 164,40" fill="#254e14" />
                  <polygon points="180,40 190,10 200,40" fill="#1e4810" />
                  <rect x="28" y="30" width="4" height="10" fill="#8B4513" />
                  <rect x="61" y="30" width="4" height="10" fill="#8B4513" />
                  {/* Ground */}
                  <rect x="0" y="34" width="220" height="6" fill="#2d5a1a" />
                </svg>
                {/* Fireflies / particles */}
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0, 1, 0], x: [0, 5, 0], y: [0, -5, 0] }}
                    transition={{ duration: 1.5 + i * 0.4, repeat: Infinity, delay: i * 0.3 }}
                    className="absolute w-1 h-1 rounded-full bg-yellow-300"
                    style={{ left: `${15 + i * 18}%`, bottom: "25%" }}
                  />
                ))}
              </>
            )}
          </div>

          {/* Sliding knob */}
          <motion.div
            animate={{ x: active ? 142 : 8 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="absolute top-1/2 -translate-y-1/2"
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "radial-gradient(circle at 35% 35%, #2a2a2a, #0a0a0a)",
              boxShadow: active
                ? "0 0 0 2px rgba(100,200,80,0.3), 4px 4px 16px #000, -2px -2px 8px #1a1a1a, inset 2px 2px 6px #1a1a1a"
                : "4px 4px 16px #000, -2px -2px 8px #1c1c1c, inset 2px 2px 6px #1c1c1c, inset -1px -1px 4px #000",
              backdropFilter: "blur(4px)",
            }}
          >
            {/* Knob inner glow */}
            <div
              className="absolute inset-2 rounded-full transition-all duration-700"
              style={{
                background: active
                  ? "radial-gradient(circle, rgba(100,200,80,0.15) 0%, transparent 70%)"
                  : "radial-gradient(circle, rgba(100,140,255,0.08) 0%, transparent 70%)",
              }}
            />
            {/* Icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{ rotate: active ? 0 : 0 }}
                transition={{ duration: 0.5 }}
              >
                {active ? (
                  <Eye size={20} className="text-green-400/80" />
                ) : (
                  <Eye size={20} className="text-white/20" />
                )}
              </motion.div>
            </div>
          </motion.div>

          {/* Glassmorphism shimmer overlay */}
          <div
            className="absolute inset-1.5 rounded-[34px] pointer-events-none"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 50%, rgba(0,0,0,0.1) 100%)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          />
        </div>
      </button>

      {/* Status label */}
      <div className="flex items-center gap-2.5">
        <motion.div
          animate={{ scale: active ? [1, 1.3, 1] : 1, opacity: active ? 1 : 0.3 }}
          transition={{ duration: 1.5, repeat: active ? Infinity : 0 }}
          className={cn("w-2 h-2 rounded-full", active ? "bg-emerald-400" : "bg-white/20")}
        />
        <span className={cn(
          "text-xs font-medium tracking-widest uppercase transition-colors duration-500",
          active ? "text-emerald-400/80" : "text-white/20"
        )}>
          {active ? "Observation Running" : "Observer Dormant"}
        </span>
      </div>
    </div>
  );
}

export default function SkippyPage() {
  const { skippyActive, setSkippyActive, setAssistanceMsg } = useDashboardStore();

  // Simulate Skippy observing and updating context
  useEffect(() => {
    if (!skippyActive) return;
    const contexts = [
      "Detected VSCode activity — working in /src/dashboard/. High focus session.",
      "Browser context: docs.firebase.com open. Cross-referencing Firestore queries.",
      "GitHub activity detected — recent commits to main branch.",
      "Terminal session active — npm processes detected.",
      "Figma tab detected — design assets being reviewed.",
    ];
    let i = 0;
    const interval = setInterval(() => {
      setAssistanceMsg(contexts[i % contexts.length]);
      i++;
    }, 8000);
    setAssistanceMsg(contexts[0]);
    return () => clearInterval(interval);
  }, [skippyActive, setAssistanceMsg]);

  return (
    <div className="min-h-full bg-black flex flex-col items-center justify-center gap-10 p-8">
      {/* Page header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Cpu size={13} className="text-white/20" />
          <span className="text-[10px] text-white/20 font-medium uppercase tracking-[0.3em]">Observer Agent · Skippy</span>
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Workspace Intelligence</h1>
        <p className="text-sm text-white/30 max-w-xs mx-auto leading-relaxed">
          Activate to let Skippy observe your workspace and power the entire studio with real-time context.
        </p>
      </div>

      {/* The toggle */}
      <SkippyToggle active={skippyActive} onToggle={() => setSkippyActive(!skippyActive)} />

      {/* Capabilities grid — shown when active */}
      <AnimatePresence>
        {skippyActive && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="grid grid-cols-2 gap-3 w-full max-w-sm"
          >
            {CAPABILITY_ITEMS.map((cap, i) => (
              <motion.div
                key={cap.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.07 }}
                className="rounded-xl p-3 flex items-start gap-2.5"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  backdropFilter: "blur(8px)",
                  boxShadow: "inset 1px 1px 0 rgba(255,255,255,0.04)",
                }}
              >
                <Zap size={11} className="text-emerald-500/50 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs font-medium text-white/60">{cap.label}</div>
                  <div className="text-[10px] text-white/25 mt-0.5">{cap.desc}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live signal when active */}
      <AnimatePresence>
        {skippyActive && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 px-5 py-3 rounded-2xl"
            style={{
              background: "rgba(100,200,80,0.05)",
              border: "1px solid rgba(100,200,80,0.12)",
            }}
          >
            <Activity size={13} className="text-emerald-400" />
            <span className="text-xs text-emerald-400/70 font-medium">Live signal active — all agents receiving context</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Privacy notice */}
      <div
        className="flex items-start gap-3 px-5 py-3 rounded-2xl max-w-sm"
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        <ShieldCheck size={13} className="text-white/20 mt-0.5 shrink-0" />
        <p className="text-[10px] text-white/20 leading-relaxed">
          Privacy-first. All workspace data is processed locally with zero-persistence.
          PII blocklist applied before any content leaves your device.
        </p>
      </div>
    </div>
  );
}
