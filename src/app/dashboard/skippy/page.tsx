"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Monitor, Cpu, Zap, X } from "lucide-react";
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

    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener("resize", resize);

    const GAP = 26;
    const RADIUS = 120;

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const onLeave = () => { mouse.current = { x: -9999, y: -9999 }; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const mx = mouse.current.x; const my = mouse.current.y;
      const cols = Math.ceil(canvas.width / GAP) + 1;
      const rows = Math.ceil(canvas.height / GAP) + 1;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * GAP; const y = r * GAP;
          const dist = Math.hypot(x - mx, y - my);
          if (dist < RADIUS) {
            const t = 1 - dist / RADIUS;
            const size = 1.5 + t * 2.8;
            ctx.beginPath(); ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(59,130,246,${t * 0.65})`; ctx.fill();
          } else {
            ctx.beginPath(); ctx.arc(x, y, 1.2, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(0,0,0,0.055)"; ctx.fill();
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

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }} />;
}

function GlowingToggleButton({ active, onToggle }: { active: boolean; onToggle: () => void }) {
  const [pressed, setPressed] = useState(false);
  return (
    <div className="flex flex-col items-center gap-5 select-none">
      <motion.button
        onMouseDown={() => setPressed(true)}
        onMouseUp={() => { setPressed(false); onToggle(); }}
        onMouseLeave={() => setPressed(false)}
        onTouchStart={() => setPressed(true)}
        onTouchEnd={() => { setPressed(false); onToggle(); }}
        aria-label={active ? "Deactivate Skippy" : "Activate Skippy"}
        className="focus:outline-none relative cursor-pointer"
        style={{ WebkitTapHighlightColor: "transparent" }}
        whileHover={{ y: -2 }}
        transition={{ type: "spring", stiffness: 400, damping: 28 }}
      >
        <motion.div
          animate={{ scale: pressed ? 0.97 : 1 }}
          transition={{ type: "spring", stiffness: 600, damping: 30 }}
          style={{
            width: 80,
            height: 160,
            borderRadius: 40,
            background: pressed
              ? "linear-gradient(180deg, #e8e8e8 0%, #d8d8d8 100%)"
              : "linear-gradient(180deg, #f5f5f5 0%, #ececec 100%)",
            boxShadow: pressed
              ? "inset 4px 4px 14px #c0c0c0, inset -4px -4px 14px #ffffff, 0 0 0 1px rgba(0,0,0,0.06)"
              : active
              ? `6px 6px 20px #c0c0c0, -6px -6px 20px #ffffff, 0 0 0 1px rgba(0,0,0,0.05), 0 0 60px 20px rgba(236,72,153,0.35), 0 20px 40px 0px rgba(236,72,153,0.25)`
              : "6px 6px 20px #c0c0c0, -6px -6px 20px #ffffff, 0 0 0 1px rgba(0,0,0,0.05)",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 20,
            paddingBottom: 20,
          }}
        >
          <span
            className="text-black/40 font-bold select-none"
            style={{ fontSize: 18, fontFamily: "system-ui", lineHeight: 1 }}
          >
            |
          </span>

          <motion.div
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: active
                ? "linear-gradient(135deg, #ec4899 0%, #db2777 100%)"
                : "linear-gradient(135deg, #d4d4d4 0%, #b8b8b8 100%)",
              boxShadow: active
                ? "3px 3px 10px rgba(219,39,119,0.5), -2px -2px 6px rgba(255,255,255,0.2), 0 0 20px rgba(236,72,153,0.6)"
                : "3px 3px 10px #b0b0b0, -3px -3px 8px #ffffff, inset 1px 1px 4px #f0f0f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            {active && (
              <motion.div
                className="absolute inset-0 rounded-full"
                animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
                style={{ background: "rgba(236,72,153,0.4)", borderRadius: "50%" }}
              />
            )}
          </motion.div>

          <span
            className="text-black/30 font-bold select-none"
            style={{ fontSize: 16, fontFamily: "system-ui", lineHeight: 1 }}
          >
            O
          </span>
        </motion.div>

        {active && (
          <>
            <motion.div
              className="absolute -bottom-6 left-1/2 -translate-x-1/2"
              style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(0,0,0,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <div style={{ width: 18, height: 18, borderRadius: "50%", background: "conic-gradient(from 0deg, #ec4899, #a855f7, #3b82f6, #ec4899)", boxShadow: "0 0 8px rgba(236,72,153,0.5)" }} />
            </motion.div>
            <motion.div
              className="absolute inset-0 rounded-[40px] pointer-events-none"
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              style={{ boxShadow: "0 0 0 3px rgba(236,72,153,0.25), 0 0 40px rgba(236,72,153,0.15)" }}
            />
          </>
        )}
      </motion.button>

      <div className="flex items-center gap-2 mt-8">
        <motion.div
          animate={{ scale: active ? [1, 1.6, 1] : 1, opacity: active ? 1 : 0.2, backgroundColor: active ? "#ec4899" : "#000" }}
          transition={{ duration: 1.4, repeat: active ? Infinity : 0 }}
          className="w-2 h-2 rounded-full"
        />
        <span className={cn("text-[11px] font-semibold tracking-[0.22em] uppercase transition-colors duration-400", active ? "text-black/55" : "text-black/18")}>
          {active ? "Observer Active" : "Observer Off"}
        </span>
      </div>
    </div>
  );
}

function ScreenShareButton({ onCapture, isSharing }: { onCapture: (data: string, mime: string) => void; isSharing: boolean }) {
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [capturing, setCapturing] = useState(false);

  const startShare = async () => {
    setShowModal(false);
    setCapturing(true);
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { mediaSource: "screen" } as any,
        audio: false,
      });
      streamRef.current = stream;

      const video = document.createElement("video");
      video.srcObject = stream;
      video.autoplay = true;
      videoRef.current = video;

      video.onloadedmetadata = () => {
        video.play();
        setTimeout(() => {
          const canvas = document.createElement("canvas");
          canvas.width = Math.min(video.videoWidth, 1280);
          canvas.height = Math.round(canvas.width * (video.videoHeight / video.videoWidth));
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
            const base64 = dataUrl.split(",")[1];
            onCapture(base64, "image/jpeg");
          }
          stream.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
          setCapturing(false);
        }, 800);
      };
    } catch (err: any) {
      if (err.name !== "NotAllowedError") console.error("Screen capture error:", err);
      setCapturing(false);
    }
  };

  return (
    <>
      <motion.button
        onClick={() => setShowModal(true)}
        disabled={isSharing || capturing}
        whileHover={{ scale: 1.04, y: -1 }}
        whileTap={{ scale: 0.97 }}
        className="relative flex items-center gap-3 px-6 py-3.5 rounded-2xl font-semibold text-sm disabled:opacity-50 transition-all"
        style={{
          background: isSharing
            ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
            : "linear-gradient(135deg, #1e1e2e 0%, #16213e 100%)",
          color: "white",
          boxShadow: isSharing
            ? "0 4px 20px rgba(16,185,129,0.4), 0 0 0 1px rgba(16,185,129,0.3)"
            : "0 4px 20px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.08)",
        }}
      >
        {isSharing && (
          <motion.div
            className="absolute inset-0 rounded-2xl"
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ background: "rgba(16,185,129,0.15)", borderRadius: "1rem" }}
          />
        )}
        <Monitor size={16} />
        <span>{capturing ? "Capturing..." : isSharing ? "Skippy is Watching" : "Share Screen with Skippy"}</span>
        {isSharing && (
          <motion.div
            animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            className="w-2 h-2 rounded-full bg-white"
          />
        )}
      </motion.button>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}
          >
            <motion.div
              initial={{ scale: 0.92, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 16 }}
              transition={{ type: "spring", damping: 28 }}
              className="relative w-full max-w-sm mx-4 rounded-3xl p-8 text-center"
              style={{ background: "rgba(255,255,255,0.95)", backdropFilter: "blur(24px)", boxShadow: "0 32px 80px rgba(0,0,0,0.25)", border: "1px solid rgba(0,0,0,0.08)" }}
            >
              <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 transition-colors">
                <X size={14} className="text-black/40" />
              </button>
              <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "linear-gradient(135deg, #1e1e2e, #2d2d44)", boxShadow: "0 8px 24px rgba(0,0,0,0.2)" }}>
                <Monitor size={26} className="text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Allow Screen Access</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-6">
                Skippy will capture a single screenshot to analyze your current workspace. No video is recorded. You choose what to share.
              </p>
              <div className="flex gap-2">
                <button onClick={() => setShowModal(false)} className="flex-1 h-11 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors border border-gray-200">
                  Cancel
                </button>
                <motion.button
                  onClick={startShare}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 h-11 rounded-xl text-sm font-semibold text-white"
                  style={{ background: "linear-gradient(135deg, #1e1e2e, #3b82f6)" }}
                >
                  Share Screen
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

const CAPABILITIES = [
  { label: "Screen Context", desc: "Real-time activity detection", icon: "👁️" },
  { label: "App Tracking", desc: "IDE, browser, terminal", icon: "📊" },
  { label: "Commit Detection", desc: "Git hook + push signals", icon: "🔗" },
  { label: "PII Filtering", desc: "Zero-leak local redaction", icon: "🔒" },
];

export default function SkippyPage() {
  const { skippyActive, setSkippyActive, setAssistanceMsg } = useDashboardStore();
  const [isSharing, setIsSharing] = useState(false);
  const [analysis, setAnalysis] = useState<Record<string, any> | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleCapture = useCallback(async (base64: string, mimeType: string) => {
    setIsAnalyzing(true);
    setIsSharing(true);
    try {
      const res = await fetch("/api/ai/screen-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mimeType }),
      });
      const data = await res.json();
      if (data.analysis) {
        setAnalysis(data.analysis);
        setAssistanceMsg(data.analysis.signal || data.analysis.activity || "Screen analyzed");
        setSkippyActive(true);
      }
    } catch (err) {
      console.error("Screen analysis error:", err);
    } finally {
      setIsAnalyzing(false);
    }
  }, [setAssistanceMsg, setSkippyActive]);

  const stopSharing = () => {
    setIsSharing(false);
    setAnalysis(null);
    setSkippyActive(false);
  };

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
          Activate Skippy to observe your workspace and feed live context to all agents.
        </p>
      </div>

      <div className="relative z-10">
        <GlowingToggleButton active={skippyActive} onToggle={() => setSkippyActive(!skippyActive)} />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-3">
        <ScreenShareButton onCapture={handleCapture} isSharing={isSharing} />
        {isSharing && (
          <button onClick={stopSharing} className="text-xs text-black/30 hover:text-black/60 transition-colors">
            Stop sharing
          </button>
        )}
      </div>

      <AnimatePresence>
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="relative z-10 flex items-center gap-3 px-5 py-3.5 rounded-2xl"
            style={{ background: "#f0f4ff", boxShadow: "4px 4px 10px #d8d8d8, -4px -4px 10px #ffffff" }}
          >
            <div className="flex gap-1">
              {[0,1,2].map((i) => (
                <motion.div key={i} animate={{ opacity: [0.3, 1, 0.3], y: [0,-3,0] }} transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.18 }}
                  className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              ))}
            </div>
            <span className="text-xs font-medium text-black/50">Skippy is analyzing your screen...</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {analysis && !isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="relative z-10 w-full max-w-sm space-y-3"
          >
            <div className="rounded-2xl px-4 py-4" style={{ background: "#f0f4ff", boxShadow: "4px 4px 10px #d8d8d8, -4px -4px 10px #ffffff", border: "1px solid rgba(59,130,246,0.12)" }}>
              <div className="flex items-center gap-1.5 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-[9px] font-bold text-blue-500 uppercase tracking-wider">Live Analysis</span>
                {typeof analysis.focus_score === "number" && (
                  <span className="ml-auto text-[9px] font-semibold text-blue-400">{analysis.focus_score}% focus</span>
                )}
              </div>
              {analysis.signal && <p className="text-xs font-semibold text-black/70 mb-1">{analysis.signal}</p>}
              {analysis.activity && <p className="text-xs text-black/45 leading-relaxed">{analysis.activity}</p>}
              {analysis.insights && <p className="text-xs text-black/35 leading-relaxed mt-1 italic">{analysis.insights}</p>}
              {Array.isArray(analysis.apps) && analysis.apps.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {analysis.apps.slice(0, 5).map((app: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 rounded-full text-[9px] font-medium" style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>{app}</span>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {CAPABILITIES.map((cap, i) => (
                <motion.div key={cap.label} initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.06 }}
                  className="rounded-2xl p-3.5" style={{ background: "#f5f5f5", boxShadow: "4px 4px 10px #d8d8d8, -4px -4px 10px #ffffff" }}>
                  <div className="text-base mb-1">{cap.icon}</div>
                  <div className="text-[11px] font-semibold text-black/60 mb-0.5">{cap.label}</div>
                  <div className="text-[9px] text-black/28">{cap.desc}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!analysis && !isAnalyzing && (
        <div className="relative z-10 flex flex-col items-center gap-2 w-full max-w-sm">
          <div className="grid grid-cols-2 gap-2.5 w-full opacity-40">
            {CAPABILITIES.map((cap) => (
              <div key={cap.label} className="rounded-2xl p-3.5" style={{ background: "#f5f5f5", boxShadow: "4px 4px 10px #d8d8d8, -4px -4px 10px #ffffff" }}>
                <div className="text-base mb-1">{cap.icon}</div>
                <div className="text-[11px] font-semibold text-black/60 mb-0.5">{cap.label}</div>
                <div className="text-[9px] text-black/28">{cap.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div
        className="relative z-10 flex items-start gap-3 px-5 py-4 rounded-2xl max-w-sm"
        style={{ background: "#f5f5f5", boxShadow: "5px 5px 12px #d8d8d8, -5px -5px 12px #ffffff" }}
      >
        <ShieldCheck size={13} className="text-black/18 mt-0.5 shrink-0" />
        <p className="text-[10px] text-black/28 leading-relaxed">
          Privacy-first. Single screenshot, analyzed locally. PII blocklist applied before any content leaves your device.
        </p>
      </div>
    </div>
  );
}
