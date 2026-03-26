"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Cpu } from "lucide-react";
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
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener("resize", resize);
    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    window.addEventListener("mousemove", onMove);
    const GAP = 26, RADIUS = 130;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cols = Math.ceil(canvas.width / GAP) + 1, rows = Math.ceil(canvas.height / GAP) + 1;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * GAP, y = r * GAP;
          const dist = Math.hypot(x - mouse.current.x, y - mouse.current.y);
          if (dist < RADIUS) {
            const t = 1 - dist / RADIUS;
            ctx.beginPath(); ctx.arc(x, y, 1.5 + t * 2.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(59,130,246,${t * 0.55})`; ctx.fill();
          } else {
            ctx.beginPath(); ctx.arc(x, y, 1, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(0,0,0,0.045)"; ctx.fill();
          }
        }
      }
      raf.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { window.removeEventListener("resize", resize); window.removeEventListener("mousemove", onMove); cancelAnimationFrame(raf.current); };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }} />;
}

function HyperrealisticSwitch({ active, onToggle, isCapturing }: { active: boolean; onToggle: () => void; isCapturing: boolean }) {
  const [pressed, setPressed] = useState(false);

  return (
    <div className="flex flex-col items-center gap-6 select-none">
      <div className="relative">
        <motion.div
          animate={active ? { boxShadow: ["0 0 60px 20px rgba(236,72,153,0.5), 0 0 120px 40px rgba(236,72,153,0.2)", "0 0 80px 30px rgba(236,72,153,0.7), 0 0 160px 60px rgba(236,72,153,0.3)", "0 0 60px 20px rgba(236,72,153,0.5), 0 0 120px 40px rgba(236,72,153,0.2)"] } : { boxShadow: "none" }}
          transition={{ duration: 2, repeat: Infinity }}
          className="rounded-full"
          style={{ padding: 24 }}
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
              width: 120,
              height: 120,
              borderRadius: "50%",
              background: active
                ? "radial-gradient(circle at 35% 35%, #ff6eb4, #ec4899 40%, #be185d 75%, #831843)"
                : pressed
                ? "radial-gradient(circle at 35% 35%, #d4d4d4, #b0b0b0 40%, #888 75%, #555)"
                : "radial-gradient(circle at 35% 35%, #e8e8e8, #c8c8c8 40%, #a0a0a0 75%, #686868)",
              boxShadow: active
                ? `
                  inset -4px -4px 12px rgba(0,0,0,0.5),
                  inset 4px 4px 12px rgba(255,180,220,0.3),
                  0 8px 32px rgba(236,72,153,0.8),
                  0 2px 8px rgba(0,0,0,0.4),
                  0 0 0 3px rgba(236,72,153,0.6),
                  0 0 0 6px rgba(236,72,153,0.2)
                `
                : pressed
                ? `
                  inset 6px 6px 18px rgba(0,0,0,0.4),
                  inset -2px -2px 8px rgba(255,255,255,0.2),
                  0 2px 8px rgba(0,0,0,0.3)
                `
                : `
                  inset -6px -6px 18px rgba(0,0,0,0.35),
                  inset 6px 6px 18px rgba(255,255,255,0.45),
                  0 12px 40px rgba(0,0,0,0.3),
                  0 4px 12px rgba(0,0,0,0.2),
                  0 0 0 2px rgba(0,0,0,0.08)
                `,
              transform: pressed ? "scale(0.96) translateY(2px)" : "scale(1) translateY(0)",
              transition: "all 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          >
            {active && (
              <>
                <motion.div
                  className="absolute inset-0 rounded-full"
                  animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                  style={{ background: "rgba(236,72,153,0.4)" }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full"
                  animate={{ scale: [1, 1.7, 1], opacity: [0.4, 0, 0.4] }}
                  transition={{ duration: 1.8, repeat: Infinity, delay: 0.3 }}
                  style={{ background: "rgba(236,72,153,0.3)" }}
                />
              </>
            )}

            <div className="absolute inset-0 flex items-center justify-center">
              <svg viewBox="0 0 48 48" width="52" height="52" fill="none">
                <path d="M24 6 L24 22" stroke={active ? "rgba(255,255,255,0.95)" : "rgba(80,80,80,0.7)"}
                  strokeWidth="4" strokeLinecap="round"
                  style={{ filter: active ? "drop-shadow(0 0 8px rgba(255,255,255,0.9))" : "none" }} />
                <path d="M16 10 A16 16 0 1 0 32 10" stroke={active ? "rgba(255,255,255,0.85)" : "rgba(80,80,80,0.6)"}
                  fill="none" strokeWidth="4" strokeLinecap="round"
                  style={{ filter: active ? "drop-shadow(0 0 6px rgba(255,255,255,0.7))" : "none" }} />
              </svg>
            </div>

            <div
              className="absolute top-4 left-4 rounded-full pointer-events-none"
              style={{
                width: 32, height: 32,
                background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.55), transparent 70%)",
              }}
            />
          </motion.button>
        </motion.div>

        <div
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full"
          style={{
            width: 100,
            height: 20,
            background: "radial-gradient(ellipse, rgba(0,0,0,0.25) 0%, transparent 70%)",
            filter: "blur(6px)",
          }}
        />
      </div>

      <div
        className="rounded-2xl px-6 py-3 flex items-center gap-3"
        style={{
          background: active
            ? "linear-gradient(135deg, rgba(236,72,153,0.15), rgba(219,39,119,0.08))"
            : "rgba(0,0,0,0.04)",
          border: active ? "1px solid rgba(236,72,153,0.3)" : "1px solid rgba(0,0,0,0.06)",
          transition: "all 0.4s ease",
          boxShadow: active ? "0 4px 20px rgba(236,72,153,0.15)" : "none",
        }}
      >
        <motion.div
          animate={{ scale: active ? [1, 1.5, 1] : 1, opacity: active ? 1 : 0.3 }}
          transition={{ duration: 1.4, repeat: active ? Infinity : 0 }}
          className="w-2.5 h-2.5 rounded-full"
          style={{
            background: active ? "#ec4899" : "#999",
            boxShadow: active ? "0 0 10px rgba(236,72,153,0.9)" : "none",
          }}
        />
        <span className="text-sm font-bold uppercase tracking-[0.2em]"
          style={{ color: active ? "#ec4899" : "rgba(0,0,0,0.25)", transition: "color 0.4s ease" }}>
          {isCapturing ? "Capturing..." : active ? "Observer Active" : "Observer Off"}
        </span>
      </div>
    </div>
  );
}

const CAPABILITIES = [
  { label: "Full Screen Capture", desc: "Entire screen including all tabs & apps", icon: "🖥️" },
  { label: "App Detection", desc: "IDE, browser, terminal, design tools", icon: "📊" },
  { label: "Activity Analysis", desc: "Work patterns & context signals", icon: "🧠" },
  { label: "Privacy Shield", desc: "PII blocklist applied locally", icon: "🔒" },
];

export default function SkippyPage() {
  const { skippyActive, setSkippyActive, setAssistanceMsg, setSkippyContext } = useDashboardStore();
  const [analysis, setAnalysis] = useState<Record<string, any> | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const captureAndAnalyze = useCallback(async () => {
    setIsCapturing(true);
    setApiError(null);
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { width: { ideal: 1920 }, height: { ideal: 1080 } } as any,
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
        setApiError(data.error.includes("API key")
          ? "OpenRouter API key not configured. Add OPEN_ROUTER in .env.local."
          : data.error);
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
      }
    } catch (err: any) {
      if (err.name === "NotAllowedError") {
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
    } else {
      setSkippyActive(true);
      await captureAndAnalyze();
    }
  };

  return (
    <div className="relative min-h-full flex flex-col items-center justify-center gap-8 p-8 overflow-hidden" 
      style={{ background: "radial-gradient(ellipse at top left, #12121a 0%, #030303 100%)" }}>
      <GlowCursorCanvas />

      <div className="relative z-10 text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Cpu size={12} className="text-white/20" />
          <span className="text-[10px] text-white/40 font-semibold uppercase tracking-[0.4em]">Observer Agent · Skippy</span>
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Workspace Intelligence</h1>
        <p className="text-sm text-white/40 max-w-sm mx-auto leading-relaxed">
          Toggle Skippy to capture your workspace context and feed live intelligence to all agents.
        </p>
      </div>

      <div className="relative z-10 scale-110 mb-4">
        <HyperrealisticSwitch active={skippyActive} onToggle={handleToggle} isCapturing={isCapturing} />
      </div>

      {apiError && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 px-6 py-4 rounded-2xl max-w-sm text-xs text-red-400 font-medium text-center"
          style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)", backdropFilter: "blur(12px)" }}>
          {apiError}
        </motion.div>
      )}

      <AnimatePresence>
        {isCapturing && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="relative z-10 flex items-center gap-3 px-5 py-4 rounded-2xl"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(20px)" }}>
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <motion.div key={i} animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }} transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.18 }}
                  className="w-1.5 h-1.5 rounded-full bg-pink-500" />
              ))}
            </div>
            <span className="text-xs font-medium text-white/50">Skippy is analyzing your workspace...</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {analysis && !isCapturing && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="relative z-10 w-full max-w-sm">
            <div className="rounded-2xl px-5 py-5"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(24px)", boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1.5 h-1.5 rounded-full bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.8)] animate-pulse" />
                <span className="text-[10px] font-bold text-pink-500 uppercase tracking-widest">Active Analysis</span>
                {typeof analysis.focus_score === "number" && (
                  <div className="ml-auto px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                    <span className="text-[9px] font-bold text-blue-400">{analysis.focus_score}% Flow</span>
                  </div>
                )}
              </div>
              {analysis.signal && <p className="text-xs font-semibold text-white/90 mb-1.5">{analysis.signal}</p>}
              {analysis.activity && <p className="text-xs text-white/50 leading-relaxed mb-3">{analysis.activity}</p>}
              
              {Array.isArray(analysis.apps) && analysis.apps.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {analysis.apps.slice(0, 5).map((app: string, i: number) => (
                    <span key={i} className="px-2 py-1 rounded-lg text-[9px] font-semibold tracking-wider uppercase border"
                      style={{ background: "rgba(59,130,246,0.05)", border: "1px solid rgba(59,130,246,0.15)", color: "#60a5fa" }}>{app}</span>
                  ))}
                </div>
              )}
              
              <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                <p className="text-[9px] text-white/20 font-medium">Synced with SNK & META</p>
                <ShieldCheck size={11} className="text-white/10" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 grid grid-cols-2 gap-3 w-full max-w-sm" style={{ opacity: analysis ? 1 : 0.6 }}>
        {CAPABILITIES.map((cap) => (
          <div key={cap.label} className="rounded-2xl p-4 transition-all hover:bg-white/[0.04]"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", backdropFilter: "blur(10px)" }}>
            <div className="text-lg mb-2">{cap.icon}</div>
            <div className="text-[11px] font-bold text-white/70 mb-1">{cap.label}</div>
            <div className="text-[9px] text-white/30 leading-relaxed">{cap.desc}</div>
          </div>
        ))}
      </div>

      <div className="relative z-10 flex items-start gap-4 px-6 py-5 rounded-2xl max-w-md"
        style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))", border: "1px solid rgba(255,255,255,0.05)" }}>
        <ShieldCheck size={16} className="text-white/20 mt-0.5 shrink-0" />
        <div>
          <h4 className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-1.5">Privacy Protocols</h4>
          <p className="text-[10px] text-white/30 leading-relaxed">
            Local-first observation. PII is automatically redacted before analysis. 
            One static frame per session — no persistent video recording.
          </p>
        </div>
      </div>
    </div>
  );
}

