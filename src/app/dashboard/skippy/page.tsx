"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Eye, Cpu, Power } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboardStore } from "@/hooks/use-dashboard-store";

function DotCursorCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -9999, y: -9999 });
  const raf = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const DOT_SIZE = 3;
    const GAP = 24;
    const RADIUS = 90;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseleave", () => { mouse.current = { x: -9999, y: -9999 }; });

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
            const alpha = 1 - dist / RADIUS;
            ctx.beginPath();
            ctx.arc(x, y, DOT_SIZE / 2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(180,180,180,${alpha * 0.55})`;
            ctx.fill();
          }
        }
      }
      raf.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", onMove);
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
    <div className="flex flex-col items-center gap-5">
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
          animate={{ scale: pressed ? 0.95 : 1 }}
          transition={{ type: "spring", stiffness: 600, damping: 30 }}
          style={{
            width: 200,
            height: 76,
            borderRadius: 38,
            background: "#f0f0f0",
            boxShadow: pressed
              ? "inset 6px 6px 18px #c8c8c8, inset -6px -6px 18px #ffffff"
              : active
              ? "inset 4px 4px 12px #c8c8c8, inset -4px -4px 12px #ffffff, 0 0 30px rgba(0,0,0,0.05)"
              : "8px 8px 20px #c8c8c8, -8px -8px 20px #ffffff",
            position: "relative",
          }}
        >
          <motion.div
            animate={{ x: active ? 128 : 6 }}
            transition={{ type: "spring", stiffness: 400, damping: 32 }}
            style={{
              position: "absolute",
              top: 6,
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: active
                ? "linear-gradient(135deg, #1a1a1a 0%, #333 100%)"
                : "linear-gradient(135deg, #e8e8e8 0%, #d0d0d0 100%)",
              boxShadow: active
                ? "4px 4px 12px rgba(0,0,0,0.35), -2px -2px 8px rgba(255,255,255,0.1), inset 1px 1px 4px rgba(255,255,255,0.1)"
                : "4px 4px 12px #b8b8b8, -4px -4px 10px #ffffff, inset 2px 2px 5px #ffffff, inset -2px -2px 5px #c8c8c8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Power size={20} color={active ? "#fff" : "#999"} strokeWidth={2} />
          </motion.div>
        </motion.div>
      </button>

      <div className="flex items-center gap-2">
        <motion.div
          animate={{ scale: active ? [1, 1.4, 1] : 1, opacity: active ? 1 : 0.3 }}
          transition={{ duration: 1.5, repeat: active ? Infinity : 0 }}
          className={cn("w-2 h-2 rounded-full", active ? "bg-black" : "bg-black/20")}
        />
        <span className={cn(
          "text-[11px] font-semibold tracking-[0.25em] uppercase transition-colors duration-500",
          active ? "text-black/60" : "text-black/20"
        )}>
          {active ? "Observer Active" : "Observer Off"}
        </span>
      </div>
    </div>
  );
}

const CAPABILITIES = [
  { label: "Screen Context", desc: "Real-time activity detection" },
  { label: "App Tracking", desc: "IDE, browser, terminal" },
  { label: "Commit Detection", desc: "Git hook + push signals" },
  { label: "PII Filtering", desc: "Zero-leak local redaction" },
];

export default function SkippyPage() {
  const { skippyActive, setSkippyActive, setAssistanceMsg } = useDashboardStore();

  useEffect(() => {
    if (!skippyActive) return;
    const contexts = [
      "Detected VSCode activity — deep work session on /src/dashboard for 47 minutes.",
      "Browser context: docs.openrouter.ai open — cross-referencing API rate limits.",
      "GitHub commit detected — pushed 'feat: skippy toggle redesign' to main branch.",
      "Terminal session: npm run dev — hot reload triggered after 3 file saves.",
      "Figma tab detected — reviewing CozyJet design system components.",
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
    <div
      className="relative min-h-full bg-white flex flex-col items-center justify-center gap-10 p-8 overflow-hidden"
      style={{ cursor: "none" }}
    >
      <DotCursorCanvas />

      <div className="relative z-10 text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Cpu size={12} className="text-black/20" />
          <span className="text-[10px] text-black/30 font-semibold uppercase tracking-[0.3em]">Observer Agent · Skippy</span>
        </div>
        <h1 className="text-3xl font-bold text-black tracking-tight">Workspace Intelligence</h1>
        <p className="text-sm text-black/40 max-w-xs mx-auto leading-relaxed">
          Activate to let Skippy observe your workspace and power the studio with real-time context.
        </p>
      </div>

      <div className="relative z-10">
        <NeuButton active={skippyActive} onToggle={() => setSkippyActive(!skippyActive)} />
      </div>

      <AnimatePresence>
        {skippyActive && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="relative z-10 grid grid-cols-2 gap-3 w-full max-w-sm"
          >
            {CAPABILITIES.map((cap, i) => (
              <motion.div
                key={cap.label}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.06 }}
                className="rounded-2xl p-4"
                style={{
                  background: "#f5f5f5",
                  boxShadow: "5px 5px 12px #d8d8d8, -5px -5px 12px #ffffff",
                }}
              >
                <div className="text-xs font-semibold text-black/60 mb-0.5">{cap.label}</div>
                <div className="text-[10px] text-black/30">{cap.desc}</div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {skippyActive && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="relative z-10 flex items-center gap-3 px-5 py-3 rounded-2xl"
            style={{
              background: "#f0f0f0",
              boxShadow: "4px 4px 10px #d8d8d8, -4px -4px 10px #ffffff",
            }}
          >
            <Eye size={13} className="text-black/40" />
            <span className="text-xs text-black/50 font-medium">Live signal active — all agents receiving context</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className="relative z-10 flex items-start gap-3 px-5 py-4 rounded-2xl max-w-sm"
        style={{
          background: "#f5f5f5",
          boxShadow: "5px 5px 12px #d8d8d8, -5px -5px 12px #ffffff",
        }}
      >
        <ShieldCheck size={13} className="text-black/20 mt-0.5 shrink-0" />
        <p className="text-[10px] text-black/30 leading-relaxed">
          Privacy-first. All workspace data is processed locally with zero-persistence.
          PII blocklist applied before any content leaves your device.
        </p>
      </div>
    </div>
  );
}
