"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Eye, Cpu, Power, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboardStore } from "@/hooks/use-dashboard-store";

function GlowCursorCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -9999, y: -9999 });
  const raf = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const GAP = 28;
    const RADIUS = 110;

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const onLeave = () => { mouse.current = { x: -9999, y: -9999 }; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const mx = mouse.current.x;
      const my = mouse.current.y;
      const cols = Math.ceil(canvas.width / GAP) + 1;
      const rows = Math.ceil(canvas.height / GAP) + 1;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * GAP;
          const y = r * GAP;
          const dist = Math.hypot(x - mx, y - my);
          if (dist < RADIUS) {
            const t = 1 - dist / RADIUS;
            const size = 1.5 + t * 2.5;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(59,130,246,${t * 0.6})`;
            ctx.fill();
          } else {
            ctx.beginPath();
            ctx.arc(x, y, 1.2, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(0,0,0,0.06)";
            ctx.fill();
          }
        }
      }

      raf.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}

function NeuButton({ active, onToggle }: { active: boolean; onToggle: () => void }) {
  const [pressed, setPressed] = useState(false);
  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onMouseDown={() => setPressed(true)}
        onMouseUp={() => { setPressed(false); onToggle(); }}
        onMouseLeave={() => setPressed(false)}
        onTouchStart={() => setPressed(true)}
        onTouchEnd={() => { setPressed(false); onToggle(); }}
        aria-label={active ? "Deactivate Skippy" : "Activate Skippy"}
        className="focus:outline-none select-none"
        style={{ WebkitTapHighlightColor: "transparent" }}
      >
        <motion.div
          animate={{ scale: pressed ? 0.96 : 1 }}
          transition={{ type: "spring", stiffness: 600, damping: 30 }}
          style={{
            width: 196,
            height: 72,
            borderRadius: 36,
            background: "#f2f2f2",
            boxShadow: pressed
              ? "inset 5px 5px 16px #c8c8c8, inset -5px -5px 16px #ffffff"
              : active
              ? "inset 3px 3px 10px #c8c8c8, inset -3px -3px 10px #ffffff"
              : "7px 7px 18px #cccccc, -7px -7px 18px #ffffff",
            position: "relative",
          }}
        >
          <motion.div
            animate={{ x: active ? 124 : 6 }}
            transition={{ type: "spring", stiffness: 400, damping: 32 }}
            style={{
              position: "absolute",
              top: 6,
              width: 60,
              height: 60,
              borderRadius: "50%",
              background: active
                ? "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)"
                : "linear-gradient(135deg, #e0e0e0 0%, #c8c8c8 100%)",
              boxShadow: active
                ? "3px 3px 10px rgba(37,99,235,0.4), -2px -2px 6px rgba(255,255,255,0.2)"
                : "3px 3px 10px #b8b8b8, -3px -3px 8px #ffffff, inset 1px 1px 4px #f0f0f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Power size={18} color={active ? "#fff" : "#aaa"} strokeWidth={2} />
          </motion.div>
        </motion.div>
      </button>

      <div className="flex items-center gap-2">
        <motion.div
          animate={{
            scale: active ? [1, 1.5, 1] : 1,
            opacity: active ? 1 : 0.2,
            backgroundColor: active ? "#2563eb" : "#000",
          }}
          transition={{ duration: 1.4, repeat: active ? Infinity : 0 }}
          className="w-2 h-2 rounded-full"
        />
        <span className={cn(
          "text-[11px] font-semibold tracking-[0.22em] uppercase transition-colors duration-400",
          active ? "text-black/55" : "text-black/18"
        )}>
          {active ? "Observer Active" : "Observer Off"}
        </span>
      </div>
    </div>
  );
}

const LIVE_SIGNALS = [
  { icon: "⌨️", text: "VSCode active — /src/dashboard 47 min deep work", type: "deep" },
  { icon: "🌐", text: "Browser: docs.openrouter.ai — API rate limit research", type: "research" },
  { icon: "🔗", text: "Git commit: feat: skippy toggle redesign → main", type: "commit" },
  { icon: "💻", text: "Terminal: npm run dev — hot reload ×3 file saves", type: "terminal" },
  { icon: "🎨", text: "Figma: reviewing CozyJet design system", type: "design" },
];

const CAPABILITIES = [
  { label: "Screen Context",   desc: "Real-time activity detection",  icon: "👁️" },
  { label: "App Tracking",     desc: "IDE, browser, terminal",        icon: "📊" },
  { label: "Commit Detection", desc: "Git hook + push signals",       icon: "🔗" },
  { label: "PII Filtering",    desc: "Zero-leak local redaction",     icon: "🔒" },
];

export default function SkippyPage() {
  const { skippyActive, setSkippyActive, setAssistanceMsg } = useDashboardStore();
  const [liveIdx, setLiveIdx] = useState(0);

  useEffect(() => {
    if (!skippyActive) return;
    const signals = LIVE_SIGNALS.map(s => s.text);
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % signals.length;
      setLiveIdx(i);
      setAssistanceMsg(signals[i]);
    }, 7000);
    setAssistanceMsg(signals[0]);
    return () => clearInterval(interval);
  }, [skippyActive, setAssistanceMsg]);

  return (
    <div className="relative min-h-full bg-white flex flex-col items-center justify-center gap-8 p-8 overflow-hidden">
      <GlowCursorCanvas />

      <div className="relative z-10 text-center space-y-1.5">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Cpu size={11} className="text-black/20" />
          <span className="text-[10px] text-black/25 font-semibold uppercase tracking-[0.3em]">Observer Agent · Skippy</span>
        </div>
        <h1 className="text-3xl font-bold text-black tracking-tight">Workspace Intelligence</h1>
        <p className="text-sm text-black/38 max-w-xs mx-auto leading-relaxed">
          Activate Skippy to observe your workspace and feed live context to all three AI agents.
        </p>
      </div>

      <div className="relative z-10">
        <NeuButton active={skippyActive} onToggle={() => setSkippyActive(!skippyActive)} />
      </div>

      <AnimatePresence>
        {skippyActive && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="relative z-10 w-full max-w-sm space-y-3"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl px-4 py-3.5 flex items-start gap-3"
              style={{
                background: "#f0f4ff",
                boxShadow: "4px 4px 10px #d8d8d8, -4px -4px 10px #ffffff",
                border: "1px solid rgba(59,130,246,0.12)",
              }}
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={liveIdx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-lg shrink-0"
                >
                  {LIVE_SIGNALS[liveIdx].icon}
                </motion.span>
              </AnimatePresence>
              <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-[9px] font-bold text-blue-500 uppercase tracking-wider">Live Signal</span>
                </div>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={liveIdx}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.3 }}
                    className="text-xs text-black/55 font-medium leading-relaxed"
                  >
                    {LIVE_SIGNALS[liveIdx].text}
                  </motion.p>
                </AnimatePresence>
              </div>
            </motion.div>

            <div className="grid grid-cols-2 gap-2.5">
              {CAPABILITIES.map((cap, i) => (
                <motion.div
                  key={cap.label}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.06 }}
                  className="rounded-2xl p-3.5"
                  style={{ background: "#f5f5f5", boxShadow: "4px 4px 10px #d8d8d8, -4px -4px 10px #ffffff" }}
                >
                  <div className="text-base mb-1">{cap.icon}</div>
                  <div className="text-[11px] font-semibold text-black/60 mb-0.5">{cap.label}</div>
                  <div className="text-[9px] text-black/28">{cap.desc}</div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-2.5 px-4 py-3 rounded-2xl"
              style={{ background: "#f5f5f5", boxShadow: "4px 4px 10px #d8d8d8, -4px -4px 10px #ffffff" }}
            >
              <Zap size={13} className="text-blue-400 shrink-0" />
              <p className="text-[10px] text-black/40 font-medium">
                Live signal active — Flippo & Snooks receiving workspace context
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className="relative z-10 flex items-start gap-3 px-5 py-4 rounded-2xl max-w-sm"
        style={{ background: "#f5f5f5", boxShadow: "5px 5px 12px #d8d8d8, -5px -5px 12px #ffffff" }}
      >
        <ShieldCheck size={13} className="text-black/18 mt-0.5 shrink-0" />
        <p className="text-[10px] text-black/28 leading-relaxed">
          Privacy-first. All workspace data is processed locally with zero-persistence. PII blocklist applied before any content leaves your device.
        </p>
      </div>
    </div>
  );
}
